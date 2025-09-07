import { MongoClient } from "mongodb";
import mongoose from "mongoose";

const mongo_url = process.env.MONGO_URI;

export const connectNotes = async () => {
  await mongoose.connect(mongo_url, {
    dbName: "whatsapp_api",
  });

  let noteSchema = new mongoose.Schema(
    {
      note: String,
      inChat: String,
      savedBy: String,
      index: Number,
    },
    { collection: "notes" },
  );

  let Note = mongoose.model("Note", noteSchema);
  return Note;
};

export const connectAuth = async () => {
  console.log("connecting to auth");
  const mongoClient = new MongoClient(mongo_url);
  await mongoClient.connect();
  const collection = mongoClient
    .db("whatsapp_api")
    .collection("auth_info_baileys");
  console.log("connected to auth");
  return collection;
};
