import { Express } from "express";
import session_Handler from "./Controller/Jwt.Controller";

//Handles all of the api routes in the api
function routes(app: Express) {
  app.get("/api", (req: any, res: any) => {
    try {
      console.log(req.socket.remoteAddress);
      return res.send("Done");
    } catch (e: any) {
      return e.message;
    }
  });
  app.get("/api/session", session_Handler.Create);
}
export default routes;
