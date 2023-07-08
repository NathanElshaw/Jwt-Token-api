import { Express } from "express";
import session_Handler from "./Controller/Jwt.Controller";

const Routes = (app: Express) => {
  app.get("/api", session_Handler.Check_Refresh, session_Handler.Create);
  app.get("/api/delete", session_Handler.Delete_Session);
};

export default Routes;
