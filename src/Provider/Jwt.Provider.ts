import jwt, { sign } from "jsonwebtoken";
import { get } from "lodash";
import { NextFunction, Response } from "express";
import session_Service from "../Service/Jwt.Service";
import { default_Params } from "../../Default/Default";
import session_Handler from "../Controller/Jwt.Controller";

const jwt_Provider = {
  sign: (
    object: Object,
    keyName: string,
    options: jwt.SignOptions | undefined
  ) => {
    //gets type of key for a buffer constructor use to sign jwt
    const signing_Key = Buffer.from(keyName, "base64").toString("ascii");

    //signs a jwt with data given in the object to be used as jwt and the key as the signing key
    return jwt.sign({ payload: object }, signing_Key, {
      ...(options && options),
      algorithm: "RS256",
    });
  },

  verify: (token: string, keyName: string) => {
    //gets type of key for a buffer constructor used to verify jwt
    const signing_Key = Buffer.from(keyName, "base64").toString("ascii");
    try {
      const decoded = jwt.verify(token, signing_Key);
      return { valid: true, expired: false, decoded }; //Returns valid jwt with user data
    } catch (e: any) {
      console.error(e);
      return {
        valid: false,
        expired: e.message === "jwt expired",
        decoded: null,
      }; //returns invalid (jwt expired or possibly modified)
    }
  },

  refresh: (
    access_Token: string, //current access token
    refresh_Token: string, //current refresh token
    keyName: string, //key name for making signing key
    res: Response
  ) => {
    const signing_Key = Buffer.from(keyName, "base64").toString("ascii"); //creates signing key with private or public key
    try {
      const access_Decoded = jwt.verify(access_Token, signing_Key); //decodes the current access token to check if its valid
      return get(access_Decoded, "payload");
    } catch (e: any) {
      if (e.message === "jwt expired") {
        try {
          const refresh_Decoded = jwt.verify(refresh_Token, signing_Key); //on a invaild access token will check refresh token to see if its valid
          //if valid then will reissue a new refresh and access token
          if (refresh_Decoded) {
            try {
              const new_Access_Token = jwt.sign(
                { payload: get(refresh_Decoded, "payload") },
                signing_Key,
                {
                  expiresIn: default_Params.jwt_Access_Token_TTL,
                  algorithm: "RS256",
                }
              );
              const new_Refresh_Token = jwt.sign(
                { payload: get(refresh_Decoded, "payload") },
                signing_Key,
                {
                  expiresIn: default_Params.jwt_Refresh_Token_TTL, // defined in default params i.e "15m" = 15 minutes
                  algorithm: "RS256",
                }
              );
              res
                .cookie("access_Token", new_Access_Token, {
                  httpOnly: true,
                }) // Set-cookie for new access token
                .cookie("refresh_Token", new_Refresh_Token, {
                  httpOnly: true,
                }); // Set-cookie for new refresh token
              return "New Jwt Issued";
            } catch (e: any) {
              console.error(e.message);
              return e.message;
            }
          }
        } catch (e: any) {
          if (e.message === "jwt expired") {
            try {
              return res
                .cookie("access_Token", "", {
                  httpOnly: true,
                  expires: new Date(0),
                })
                .cookie("refresh_Token", "", {
                  httpOnly: true,
                  expires: new Date(0),
                })
                .send("Please log-in again");
            } catch (e: any) {
              return e.message;
            }
          }
        }
      }
      return e.message;
    }
  },

  delete_session: async () => {
    try {
      //invalidate session in db then in client
    } catch (e: any) {
      return e.message;
    }
  },
};

export default jwt_Provider;
