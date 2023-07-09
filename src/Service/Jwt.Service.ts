import { Response } from "express";

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
