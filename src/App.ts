import express from "express";
import { default_Params } from "../Default/Default";
import DeserializeUser from "./Middleware/DeserializeUser";
import routes from "./Routes";
import db_Connection from "./Provider/Db.Provider";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();
const port: number = default_Params.port;

app.use(
  cors({
    origin: true,
    credentials: true,
  })
);

app.use(cookieParser(), express.json(), DeserializeUser);

app.listen(port, async () => {
  await db_Connection();
  console.log(`Api Running on Port: ${port}`);
  routes(app);
});
