import { NextFunction, Request, Response } from "express";
import session_Handler from "../Controller/Jwt.Controller";

async function DeserializeUser(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    return session_Handler.Check_Refresh(req, res, next); //Checks tokens else will push next function if valid
  } catch (e: any) {
    console.error({ "Desrialize-User:": e.message });
    return e.message;
  }
}

export default DeserializeUser;
