import jwt_Provider from "../Provider/Jwt.Provider";
import { default_Params } from "../../Default/Default";
import Session_Model from "../Models/Sessions.model";
import session_Handler from "../Controller/Jwt.Controller";

const session_Service = {
  /*Creates a Mongodb Document to use to store session */
  Create: async (userId: string, userAgent: string, access_Ip: string) => {
    try {
      const session = {
        user: userId,
        userAgent: userAgent,
        access_Ip: access_Ip || null,
      }; //created a mongodb document with inputs
      const create_Session = await Session_Model.create(session);
      return { ...session, _id: create_Session._id }; //put create doucment async here for mongodb
      //return create as a json to be used in jwt
    } catch (e: any) {
      console.error({ "Session Create:": e.message });
      return new Error(e.message);
    }
  },

  Get_Session: async (access_Cookie: string, fallback_access_Token: any) => {
    try {
      if (fallback_access_Token) {
        const { decoded: fallback_Decoded, valid: fallback_valid } =
          jwt_Provider.verify(
            fallback_access_Token.access_Token,
            default_Params.jwt_Private_Key
          );
        console.log(fallback_Decoded);
        if (fallback_Decoded || fallback_valid === true)
          return fallback_Decoded;
      } else {
        const { decoded, valid } = jwt_Provider.verify(
          access_Cookie,
          default_Params.jwt_Private_Key
        ); //verify jwt
        if (!decoded || valid === false) return "Jwt Error";
        //if jwt is invalid return Jwt invalid
        return decoded; //if valid return data
      }
    } catch (e: any) {
      console.error({ "Session-Service-Get-Session:": e.message });
      return e.message;
    }
  },
  Validate_Sessions: async (session_Id: string) => {
    try {
      const session: any = await Session_Model.findById(session_Id).lean(); //find session in database
      if (session.valid === false) throw new Error("Session invalid"); //if session on database is invalid throws an error
      return true; //returns true if session is valid
    } catch (e: any) {
      console.error({ "Session-Service-Verify-Session:": e.message });
      return e.message;
    }
  },

  Delete_Session: async (session_Id: any) => {
    try {
      await Session_Model.updateOne(
        { _id: session_Id.session },
        { valid: false }
      ).lean();
      return "Database delete success";
    } catch (e: any) {
      console.error({ "Session Delete:": e.message });
      return e.message;
    }
  },
};

export default session_Service;
