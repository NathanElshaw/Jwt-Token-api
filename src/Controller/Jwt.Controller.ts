import { NextFunction, Request, Response } from "express";
import jwt_Provider from "../Provider/Jwt.Provider";
import session_Service from "../Service/Jwt.Service";
import { default_Params } from "../../Default/Default";
import { get } from "lodash";

/*Session handler for api requests */
const session_Handler = {
  Create: async (req: Request, res: Response) => {
    //Check to see if on login the user is a valid user
    const user = { _id: "user" }; // add a real async check here

    const access_Cookie = req.cookies.access_Cookie;
    const refresh_Token = req.cookies.refresh_Token;

    if (access_Cookie && refresh_Token) return "Tokens already exist";

    //if the check returns null or undefined will reject request here
    if (!user) {
      return res.status(401).send("Invalid username or password");
    }
    //then try to make a session
    try {
      const userAgent = req.headers["user-agent"] as string; //Requesting users device info
      const access_Ip = req.socket.remoteAddress?.slice(7) as string; //Requesting users ip

      const session = await session_Service.Create(
        user._id,
        userAgent,
        access_Ip
      );
      //jwt access token to use in session
      const access_Token = jwt_Provider.sign(
        {
          ...user, //user document encoded to jwt to use as a reference (set to res.locals.user._doc)
          session: session._id, //session id from mongodb doc
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
          ...user, //user document encoded to jwt to use as a reference (set to res.locals.user._doc)
          session: session._id, //session id from mongodb doc
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

  Check_Refresh(req: Request, res: Response, next: NextFunction) {
    try {
      const cookie_Access_Token = req.cookies.access_Token; //checks for exisitng access token
      const cookie_Refresh_Token = req.cookies.refresh_Token; //checks for existing refresh token

      if (cookie_Access_Token && cookie_Refresh_Token) {
        try {
          const { decoded: decoded_Access_Token, valid: valid_Access_Token } =
            jwt_Provider.verify(
              cookie_Access_Token,
              default_Params.jwt_Private_Key
            );

          if (!decoded_Access_Token) {
            const {
              decoded: decoded_Refresh_Token,
              valid: valid_Refresh_Token,
            } = jwt_Provider.verify(
              cookie_Refresh_Token,
              default_Params.jwt_Private_Key
            );
            if (!decoded_Refresh_Token) {
              jwt_Provider.Delete_Session(res);
              return res.send("Please Login Again");
            }
            try {
              const reissue_Token = jwt_Provider.Reissue(
                cookie_Access_Token,
                cookie_Refresh_Token,
                default_Params.jwt_Private_Key,
                res
              );
              return "Reissued";
            } catch (e: any) {
              return res.status(409).send(e.message);
            }
          }
          return res.send("Boner");
        } catch (e: any) {
          console.error({ "Refresh Token Error:": e.message });
          return res.send(e.message);
        }
      } else {
        return next();
      }
    } catch (e: any) {
      return e.message;
    }
  },

  Get_Session: async (req: Request, res: Response) => {
    try {
      return res.send(
        await session_Service.Get_Session(req.cookies.access_Cookie)
      );
    } catch (e: any) {
      console.error({ "Session-Handler-Get-Session:": e.message });
      res.status(409).send(e.message);
    }
  },

  Delete_Session: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const cookie_Access_Token = req.cookies.access_Token; //checks for exisitng access token
      const cookie_Refresh_Token = req.cookies.refresh_Token; //checks for existing refresh token
      //if there is a jwt in cookies will invalidate the session in the db then clear cookies on client
      if (cookie_Access_Token && cookie_Refresh_Token) {
        const jwt_Payload = jwt_Provider.verify(
          cookie_Access_Token,
          default_Params.jwt_Private_Key
        );
        console.log(jwt_Payload);
        await session_Service.Delete_Session(
          get(jwt_Payload.decoded, "payload"),
          res
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
