import { Express } from "express";
import session_Handler from "./Controller/Jwt.Controller";

const Routes = (app: Express) => {
  app.get("/api", session_Handler.Create);
};

export default Routes;
