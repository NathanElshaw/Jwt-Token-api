import { NextFunction, Request, Response } from "express";
import jwt_Provider from "../Provider/Jwt.Provider";
import session_Service from "../Service/Jwt.Service";
import { default_Params } from "../../Default/Default";
import { get } from "lodash";
import { jwt_Payload_Type } from "../../Jwt.Types";

/*Session handler for api requests */
const session_Handler = {
  Create: async (req: Request, res: Response) => {
    //Check to see if on login the user is a valid user
    const user = { _id: "user" }; // add a real async check here

    const access_Cookie = req.cookies.access_Token;
    const refresh_Token = req.cookies.refresh_Token;

    if (access_Cookie && refresh_Token) {
      return res.send("Tokens already exist");
    }

    //if the check returns null or undefined will reject request here
    if (!user) {
      return res.status(401).send("Invalid username or password");
    }
    //then try to make a session
    try {
      const userAgent = req.headers["user-agent"] as string; //Requesting users device info
      const access_Ip = req.socket.remoteAddress?.slice(7) as string; //Requesting users ip can be used for ip based 2 auth better way may be use ngix

      const session = await session_Service.Create(
        user._id,
        userAgent,
        access_Ip
      );

      if (!session) return res.send("Service Error");

      if (session instanceof Error) return res.send("Database Error");
      //jwt access token to use in session
      const access_Token = jwt_Provider.sign(
        {
          ...session, //user document encoded to jwt to use as a reference (set to res.locals.user._doc)
        },
        default_Params.jwt_Private_Key, //keyName
        {
          expiresIn: default_Params.jwt_Access_Token_TTL, // defined in default params i.e "15m" = 15 minutes
        }
      );

      //refresh token to use when access token expires to make a new one
      /*signs refresh token*/
      const refresh_token = jwt_Provider.sign(
        {
          ...session, //user document encoded to jwt to use as a reference (set to res.locals.user._doc)
        },
        default_Params.jwt_Private_Key, //keyName
        {
          expiresIn: default_Params.jwt_Refresh_Token_TTL, // defined in default params i.e "15m" = 15 minutes
        }
      );
      return res
        .cookie("access_Token", access_Token, { httpOnly: true }) // Set-cookie for access token
        .cookie("refresh_Token", refresh_token, { httpOnly: true }) // Set-cookie for refresh token
        .send("tokens issued");
    } catch (e: any) {
      return res.status(409).send(e.message);
    }
  },

  Check_Refresh: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const cookie_Access_Token = req.cookies.access_Token; //checks for exisitng access token
      const cookie_Refresh_Token = req.cookies.refresh_Token; //checks for existing refresh token

      if (cookie_Access_Token && cookie_Refresh_Token) {
        //if both tokens are present continue
        const { decoded: access_Decoded, valid: access_Valid } =
          jwt_Provider.verify(
            cookie_Access_Token,
            default_Params.jwt_Private_Key
          );
        if (access_Valid === true) {
          let data: jwt_Payload_Type = access_Decoded as any;
          const db_Check = await session_Service.Validate_Sessions(
            data.payload.session
          );
          if (db_Check === true) {
            next(); //if tokens are good and db check is valid then got to next function
            return;
          } else {
            await session_Handler.Delete_Session(req, res);
            return "Session invalid";
          }
        } else {
          const { valid: Refresh_Valid } = jwt_Provider.verify(
            cookie_Refresh_Token,
            default_Params.jwt_Private_Key
          );
          if (Refresh_Valid === true) {
            const { new_Access_Token, new_Refresh_Token } =
              jwt_Provider.Reissue(
                cookie_Refresh_Token,
                default_Params.jwt_Private_Key
              );
            if (new_Access_Token && new_Refresh_Token) {
              //if new tokens were successful will
              const { decoded } = jwt_Provider.verify(
                new_Access_Token,
                default_Params.jwt_Private_Key
              );
              const data: jwt_Payload_Type = decoded as any;
              const db_Check = await session_Service.Validate_Sessions(
                data.payload.session
              );
              if (db_Check === true) {
                if (decoded) res.locals.user = decoded;
                res.locals.access_Token = new_Access_Token;
                res.locals.refresh_Token = new_Refresh_Token;
                res
                  .cookie("access_Token", new_Access_Token, { httpOnly: true })
                  .cookie("refresh_Token", new_Refresh_Token, {
                    httpOnly: true,
                  }); // add new tokens to cookies
                next();
                return;
              } else {
                jwt_Provider.Delete_Session(res);
                return res.send("Session Invalid");
              }
            }
          } else {
            jwt_Provider.Delete_Session(res);
            return res.send("Please Login Again");
          }
        }
      } else {
        return res.send(jwt_Provider.Delete_Session(res));
      }
    } catch (e: any) {
      return res.send(e.message);
    }
  },

  Get_Session: async (req: Request, res: Response) => {
    try {
      const fallback_Access_Token = res.locals.access_Token; //if a new access token is issued it will be used
      const fallback_Refresh_Token = res.locals.refresh_Token; //if a new refresh token is issued it will be used
      if (fallback_Access_Token && fallback_Refresh_Token) {
        return res.send(
          await session_Service.Get_Session(fallback_Access_Token)
        ); //if valid return user data
      } else {
        const cookie_Access_Token = req.cookies.access_Token; //get access token
        const cookie_Refresh_Token = req.cookies.refresh_Token; //get refresh token
        if (cookie_Access_Token && cookie_Refresh_Token) {
          return res.send(
            await session_Service.Get_Session(req.cookies.access_Token)
          ); //if valid session return user data
        }
        return res.send("Login again"); //redirect to get tokens or to login in again
      }
    } catch (e: any) {
      console.error({ "Session-Handler-Get-Session:": e.message });
      return res.status(409).send(e.message);
    }
  },

  Delete_Session: async (req: Request, res: Response) => {
    try {
      const cookie_Access_Token = req.cookies.access_Token; //checks for exisitng access token
      const cookie_Refresh_Token = req.cookies.refresh_Token; //checks for existing refresh token
      //if there is a jwt in cookies will invalidate the session in the db then clear cookies on client

      if (cookie_Access_Token && cookie_Refresh_Token) {
        const jwt_Payload = jwt_Provider.verify(
          cookie_Access_Token,
          default_Params.jwt_Private_Key
        );

        await session_Service.Delete_Session(
          get(jwt_Payload.decoded, "payload")
        );
        return res.send(await jwt_Provider.Delete_Session(res));
      } else {
        return res.send("Unable to preform action"); //if no jwt exists in cookies will return this
      }
    } catch (e: any) {
      console.error({ "Delete Session": e.message });
      return res.send(409).send(e.message);
    }
  },
};

export default session_Handler;
