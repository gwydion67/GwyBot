import getWeather from "../API_module/weatherAPI.js";
import {
  handleGetNotes,
  handleAddNote,
  handleDeleteNotes,
} from "../API_module/notesAPI.js";
import {
  getCmdArray,
  getCommand,
  getCurrentChatJid,
  getMessageBody,
  getNotesConnection,
  getSock,
  setMessage,
} from "./stateHandler.js";
import { TRIGGER } from "../Utils/config.js";

export const responseHandler = async (m) => {
  setMessage(m);
  let sock = await getSock();
  let Note = await getNotesConnection();

  if (m.messages[0].message) {
    // console.log((m.messages[0].message), ' from ', JSON.stringify(m,null,2))
    let message = getMessageBody();
    if (message?.toLowerCase()?.trim()?.startsWith(TRIGGER)) {
      let chatJid = getCurrentChatJid();
      let command = getCommand();
      let cmdStringArray = getCmdArray();
      if (cmdStringArray.length > 1) {
        console.log(command);
        switch (command) {
          case "weather":
            getWeather(cmdStringArray[2], sock, chatJid);
            break;
          case "addnote":
            handleAddNote(m, Note, sock);
            break;
          case "getnotes":
            handleGetNotes(m, Note, sock);
            break;
          case "deletenote":
            handleDeleteNotes(m, Note, sock);
            break;
          case "tagall":
            tagAll(m, sock);
            break;
          default:
            sock.sendMessage(chatJid, {
              text: "Hello!,\n Gwybot here, this might not be valid command (till now atleast :) )",
            });
            break;
        }
      } else {
        sock.sendMessage(chatJid, {
          text: "Hello I am GwyBot, Made By Abhishek Kumar and Ranjay Singh",
        });
      }
    }

    // console.log(chalk.red('\nBoomBurst\n') , 'replying to')
    // await sock.sendMessage(m.messages[0].key.remoteJid, { text: 'Hello there!' })
  } else {
    // console.log(chalk.red('\nBoomBurst\n') , 'replying to' , JSON.stringify(m , undefined , 2 ))
    //  let userjid  = m.messages[0].key.remoteJid.includes('@s.whatsapp.net') ? m.messages[0].key.remoteJid : m.messages[0].key.participant ;
    if (!m.messages[0].key.fromMe) {
    }
  }
};
