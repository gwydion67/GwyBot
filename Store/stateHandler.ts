import { WASocket } from "baileys";
import { MessageBody } from "../types/types.js";
import { TRIGGER } from "../Utils/config.js";
import { connectNotes } from "../Utils/mongo.js";

let currentMessage: MessageBody | null = null;
let currentSock: WASocket | null = null;
let notesConnection: any = null;

export const getNotesConnection = async () => {
  if (!notesConnection) {
    try {
      let Notes = await connectNotes();
      notesConnection = Notes;
      return Notes;
    } catch (error) {
      console.error("Error connecting to notes:", error);
      throw new Error("Failed to connect to notes");
    }
  } else {
    return notesConnection;
  }
};

export const setSock = (sock: WASocket) => {
  currentSock = sock;
};

export const getSock = (): WASocket | null => {
  return currentSock;
};

export const setMessage = (message: MessageBody) => {
  currentMessage = message;
};

export const getMessage = () => {
  if (!currentMessage) {
    throw new Error("No current message set");
  }
  return currentMessage;
};

export const getCurrentChatJid = () => {
  if (!currentMessage || !currentMessage.messages?.[0]?.key?.remoteJid) {
    throw new Error("Invalid or missing current message");
  }
  let chatJid = currentMessage.messages[0].key.remoteJid;
  return chatJid;
};

export const getMessageText = () => {
  if (!currentMessage || !currentMessage.messages?.[0]?.message) {
    return "";
  }
  let message =
    currentMessage.messages[0]?.message?.conversation ||
    currentMessage.messages[0]?.message?.extendedTextMessage?.text;
  return message || "";
};

export const getCmdArray = () => {
  let message = getMessageText();
  if (message?.toLowerCase()?.trim()?.startsWith(TRIGGER)) {
    let cmdStringArray = message?.split(" ");
    return cmdStringArray;
  }
  return [];
};

export const getCommand = () => {
  let command = "";
  let cmdStringArray = getCmdArray();
  if (cmdStringArray.length > 1) {
    command = cmdStringArray[1]?.toLowerCase();
  }
  return command;
};
