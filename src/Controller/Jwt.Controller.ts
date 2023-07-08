import { NextFunction, Request, Response } from "express";
import jwt_Provider from "../Provider/Jwt.Provider";
import session_Service from "../Service/Jwt.Service";
import { default_Params } from "../../Default/Default";

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
        .cookie("refresh_token", refresh_token, { httpOnly: true }) // Set-cookie for refresh token
        .send();
    } catch (e: any) {
      return res.status(409).send(e.message);
    }
  },

  Check_Refresh(req: Request, res: Response, next: NextFunction) {
    try {
      const cookie_Access_Token = req.cookies.access_Token;
      const cookie_Refresh_Token = req.cookies.refresh_token;

      if (cookie_Access_Token && cookie_Refresh_Token)
        if (
          jwt_Provider.refresh(
            cookie_Access_Token, //Checks for existing access token
            cookie_Refresh_Token, //Checks for existing refresh token
            default_Params.jwt_Private_Key, //keyName
            {
              expiresIn: default_Params.jwt_Refresh_Token_TTL, // defined in default params i.e "15m" = 15 minutes
            },
            next //next function call
          ) === typeof Object
        )
          console.log("yes");

      next();
    } catch (e: any) {
      return res.status(409).send(e.message);
    }
  },
};

export default session_Handler;
