
import { MongoClient } from "mongodb";
import mongoose from "mongoose";


export const connectNotes = async() => {
  await mongoose.connect(process.env.MONGO_URI,{
    dbName: 'whatsapp_api'
  });

  let noteSchema = new mongoose.Schema({
    note: String,
    inChat: String,
    savedBy: String, 
    index: Number
  },{collection: 'notes'})

  let Note = mongoose.model("Note", noteSchema);

  return Note;
}


export const connectAuth = async() => {
  console.log('connecting to auth')
  const mongoClient = new MongoClient(process.env.MONGO_URI);
  await mongoClient.connect();
  const collection = mongoClient.db("whatsapp_api").collection("auth_info_baileys")
  console.log('connected to auth')
  return collection;
}
