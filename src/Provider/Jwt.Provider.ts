import jwt from "jsonwebtoken";
import { get } from "lodash";
import { Response } from "express";
import { default_Params } from "../../Default/Default";

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
      console.error({ "Verify jwt:": e.message });
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
                { payload: get(refresh_Decoded, "payload") }, //user data
                signing_Key, //signing key
                {
                  expiresIn: default_Params.jwt_Access_Token_TTL, //Tokens expire time defined in default params i.e "15m" = 15 minutes
                  algorithm: "RS256", //encoding algo
                }
              );
              const new_Refresh_Token = jwt.sign(
                { payload: get(refresh_Decoded, "payload") }, //user data
                signing_Key, //signing key
                {
                  expiresIn: default_Params.jwt_Refresh_Token_TTL, //Tokens expire time defined in default params i.e "15m" = 15 minutes
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
                }) //set-cookies to expire instantly therefore "deleting" them
                .cookie("refresh_Token", "", {
                  httpOnly: true,
                  expires: new Date(0),
                }) //set-cookies to expire instantly therefore "deleting" them
                .send("Please log-in again");
            } catch (e: any) {
              console.error({
                "Jwt Provider-Refresh-Delete-Expired:": e.message,
              });
              return e.message;
            }
          }
        }
      }
      return e.message;
    }
  },

  Delete_Session: async (res: Response) => {
    try {
      res
        .cookie("access_Token", "", {
          httpOnly: true,
          expires: new Date(0),
        })
        .cookie("refresh_Token", "", {
          httpOnly: true,
          expires: new Date(0),
        });
      return "Deleted";
    } catch (e: any) {
      console.error({ "Jwt provider: ": e.message });
      return res.status(409).send(e.message);
    }
  },
};

export default jwt_Provider;
