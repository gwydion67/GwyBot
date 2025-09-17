import { TRIGGER } from "../Utils/config.js";
import { connectNotes } from "../Utils/mongo.js";

let currentMessage = "";
let currentSock = null;
let notesConnection = null;

export const getNotesConnection = async () => {
  if (!notesConnection) {
    let Notes = await connectNotes();
    notesConnection = Notes;
    return Notes;
  } else {
    return notesConnection;
  }
};

export const setSock = (sock) => {
  currentSock = sock;
};

export const getSock = () => {
  return currentSock;
};

export const setMessage = (message) => {
  currentMessage = message;
};

export const getMessage = () => {
  return currentMessage;
};

export const getCurrentChatJid = () => {
  let chatJid = currentMessage.messages[0].key.remoteJid;
  return chatJid;
};

export const getMessageBody = (m) => {
  if (currentMessage.messages[0].message) {
    // console.log((m.messages[0].message), ' from ', JSON.stringify(m,null,2))
    let message =
      currentMessage.messages[0]?.message?.conversation ||
      currentMessage.messages[0]?.message?.extendedTextMessage?.text;
    return message;
  }
  return "";
};

export const getCmdArray = () => {
  let message = getMessageBody();
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
