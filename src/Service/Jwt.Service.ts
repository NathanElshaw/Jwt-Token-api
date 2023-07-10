import { Response } from "express";
import jwt_Provider from "../Provider/Jwt.Provider";
import { default_Params } from "../../Default/Default";

const session_Service = {
  /*Creates a Mongodb Document to use to store session */
  Create: async (userId: string, userAgent: string, access_Ip: string) => {
    try {
      const session = {
        user: userId,
        userAgent: userAgent,
        access_Ip: access_Ip,
        _id: "123423293432ew",
      }; //created a mongodb document with inputs
      //put create doucment async here for mongodb
      return session; //return create as a json to be used in jwt
    } catch (e: any) {
      console.error({ "Session Create:": e.message });
      return e.message;
    }
  },

  Get_Session: async (access_Cookie: string) => {
    try {
      return jwt_Provider.verify(access_Cookie, default_Params.jwt_Private_Key);
    } catch (e: any) {
      console.error({ "Session-Service-Get-Session:": e.message });
      return e.message;
    }
  },

  Delete_Session: async (session_Id: any, res: Response) => {
    try {
      console.log(session_Id.session);
    } catch (e: any) {
      console.error({ "Session Delete:": e.message });
      return e.message;
    }
  },
};

export default session_Service;
