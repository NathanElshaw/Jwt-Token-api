import { NextFunction, Request, Response } from "express";
import session_Handler from "../Controller/Jwt.Controller";
import jwt_Provider from "../Provider/Jwt.Provider";
import { default_Params } from "../../Default/Default";

async function DeserializeUser(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const access_Token = req.cookies.access_Token;
    const refresh_Token = req.cookies.refresh_Token;

    if (access_Token && refresh_Token) {
      await session_Handler.Check_Refresh(req, res, next);
      next();
    }
    next();
  } catch (e: any) {
    console.error({ "Desrialize-User:": e.message });
    return e.message;
  }
}

export default DeserializeUser;
