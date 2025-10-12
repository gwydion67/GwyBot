import { MongoClient } from "mongodb";
import mongoose from "mongoose";

const mongo_url: string | undefined = process.env.MONGO_URI;

export const connectNotes = async () => {
  if (!mongo_url) {
    console.error("No Mongo URL found! Aborting connection");
    return null;
  }
  try {
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
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
    return null;
  }
};

export const connectAuth = async () => {
  console.log("connecting to auth");
  if (!mongo_url) {
    console.error("No Mongo URL found! Aborting connection");
    return null;
  }
  try {
    const mongoClient = new MongoClient(mongo_url);
    await mongoClient.connect();
    const collection = mongoClient
      .db("whatsapp_api")
      .collection("auth_info_baileys");
    console.log("connected to auth");
    return collection;
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
    return null;
  }
};
