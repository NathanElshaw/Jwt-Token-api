import { default_Params_Type } from "./Jwt.Types";
//Where private keys  and constants will be manifested

 export const default_Params: default_Params_Type = {
    port: 3000,//LocalHost Testing Port
    db_Key: "Data Key Here",//MongoDb Connection Key here
    jwt_Private_Key: "",//Jwt hash Private Key
    jwt_Public_Key: "",//Jwt hash Public key
    jwt_Access_Token_TTL: "",//Jwt Access Token Time to Libe (expire)
    jwt_Refresh_Token_TTL: "",//Jwt Refresh Token Time to live (expire)
}//default object to hold key parameters