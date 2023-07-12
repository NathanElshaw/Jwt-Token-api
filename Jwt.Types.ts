export interface default_Params_Type {
  port: number;
  db_Key: string;
  jwt_Private_Key: string;
  jwt_Public_Key: string;
  jwt_Access_Token_TTL: string;
  jwt_Refresh_Token_TTL: string;
}

export interface jwt_Payload_Type {
  payload: {
    _id: string;
    session: string;
  };
  iat: string;
  exp: string;
}
