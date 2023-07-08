import mongoose from "mongoose";
import { default_Params } from "../../Default/Default";

mongoose.set("strictQuery", false);

export default async function db_Connection() {
  try {
    await mongoose.connect(default_Params.db_Key);
  } catch (e: any) {
    console.log(e.message);
  }
}
