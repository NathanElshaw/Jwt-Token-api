import { NextFunction, Request, Response, response } from "express";
import jwt_Provider from "../Provider/Jwt.Provider";
import session_Service from "../Service/Jwt.Service";
import { default_Params } from "../../Default/Default";
/*Session handler for api requests */
const session_Handler = {
  Create: async (req: Request, res: Response) => {
    //Check to see if on login the user is a valid user
    const user = { _id: "user" }; // add a real async check here

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
        const new_Tokens = jwt_Provider.refresh(
          cookie_Access_Token, //Checks for existing access token
          cookie_Refresh_Token, //Checks for existing refresh token
          default_Params.jwt_Private_Key //keyName
        );
        if (new_Tokens.new_Access_Token && new_Tokens.new_Refresh_Token) {
          return res
            .cookie("access_Token", new_Tokens.new_Access_Token, {
              httpOnly: true,
            }) // Set-cookie for new access token
            .cookie("refresh_Token", new_Tokens.new_Refresh_Token, {
              httpOnly: true,
            }) // Set-cookie for new refresh token
            .send("New token Issued"); //on new jwt issuence returns cookies and response with this string
        } else {
          return res.send(`Jwt is valid`); //if the current jwt is valid returns valid
        }
      } else {
        return next(); //if no tokens exist then creates new token
      }
    } catch (e: any) {
      return res.status(409).send(e.message);
    }
  },

  Delete_Session: async (req: Request, res: Response) => {
    try {
      const cookie_Access_Token = req.cookies.access_Token; //checks for exisitng access token
      const cookie_Refresh_Token = req.cookies.refresh_Token; //checks for existing refresh token
      //if there is a jwt in cookies will invalidate the session in the db then clear cookies on client
      if (cookie_Access_Token && cookie_Refresh_Token) {
        await jwt_Provider.delete_session().then((response) => {
          return res
            .cookie("access_Token", "", {
              httpOnly: true,
              expires: new Date(0),
            })
            .cookie("refresh_Token", "", {
              httpOnly: true,
              expires: new Date(0),
            })
            .send("Deleted");
        });
      } else {
        return res.send("Unable to preform action"); //if no jwt exists in cookie will return this
      }
    } catch (e: any) {
      console.error({ "Delete Session": e.message });
      return res.send(409).send(e.message);
    }
  },
};

export default session_Handler;
