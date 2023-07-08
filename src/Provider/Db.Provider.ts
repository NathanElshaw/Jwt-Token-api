import mongoose from "mongoose";
import { default_Params } from "../../Default/Default";

mongoose.set<"strictQuery">("strictQuery", false);

//Connect to mongoDb with this functions
export default async function db_Connection() {
  try {
    await mongoose.connect(default_Params.db_Key); // use default params db_key to connect
  } catch (e: any) {
    console.log(e.message);
  }
}
