import mongoose from "mongoose";

//declaring db model for doucment insertions
export interface Session_Document extends mongoose.Document {
    user: mongoose.Types.ObjectId;
    valid: boolean;
    userAgent: string;
    accessIp: string;
    createdAt: Date;
    updatedAt: Date;
}

//creating a schema for allowed params to be added to document
const session_Schema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, required: true},
    valid: {type: Boolean, require: true, default: true},
    userAgent: {type: String, require: true },
    accessIp: {type: String, require: true}
},
 {
    timestamps: true
 })

 //Session model to use to pass mongoDb fucntions through to create, patch or delete documents
 const Session_Model = mongoose.model<Session_Document>("Session", session_Schema)

 export default Session_Model