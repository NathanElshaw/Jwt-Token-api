import Session_Model from "../Models/Sessions.model";

const session_Service = {
  /*Creates a Mongodb Document to use to store session */
  Create: async (userId: string, userAgent: string, access_Ip: string) => {
    try {
      const session = {
        user: userId,
        userAgent: userAgent,
        access_Ip: access_Ip,
      }; //created a mongodb document with inputs
      //put create doucment async here for mongodb
      return session; //return create as a json to be used in jwt
    } catch (e: any) {
      return e;
    }
  },
};

export default session_Service;
