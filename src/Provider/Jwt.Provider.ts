import jwt from "jsonwebtoken";
import { default_Params } from "../../Default";

const jwt_Provider = {
  sign: (
    object: Object,
    keyName: string,
    options: jwt.SignOptions | undefined
  ) => {
    //gets type of key for a buffer constructor use to sign jwt
    const signing_Key = Buffer.from(keyName, "base64").toString("ascii");

    //signs a jwt with data given in the object to be used as jwt and the key as the signing key
    return jwt.sign(object, signing_Key, {
      ...(options && options),
      algorithm: "RS256",
    });
  },

  verify(token: string, keyName: string) {
    //gets type of key for a buffer constructor used to verify jwt
    const public_Key = Buffer.from(keyName, "base64").toString("ascii");
    try {
      const decoded = jwt.verify(token, public_Key);
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
};

export default jwt_Provider;
