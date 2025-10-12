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
  getMessageText,
  getNotesConnection,
  getSock,
  setMessage,
} from "./stateHandler.js";
import { TRIGGER } from "../Utils/config.js";
import { tagAll } from "../API_module/tagall.js";
import { MessageUpsertType, WAMessage, WASocket } from "baileys";
import { MessageBody } from "../types/types.js";
import * as fs from "fs";

export const responseHandler = async (m: MessageBody) => {
  // // write received messages to messages.json
  // //
  // //
  //
  // let messages: MessageBody[] = [];
  //
  // if (!fs.existsSync("./messages.json")) {
  //   console.log("file doesn't exist");
  //   try {
  //     fs.writeFileSync("messages.json", JSON.stringify([], null, 2));
  //   } catch (error) {
  //     console.error("Error writing to messages.json:", error);
  //   }
  // } else {
  //   try {
  //     const fileContent = fs.readFileSync("messages.json", "utf-8");
  //     const parsed = JSON.parse(fileContent);
  //     messages = Array.isArray(parsed) ? parsed : [];
  //
  //     messages.push(m);
  //
  //     try {
  //       console.log("writing to file");
  //       fs.writeFileSync("messages.json", JSON.stringify(messages, null, 2));
  //     } catch (error) {
  //       console.error("Error updating messages.json:", error);
  //     }
  //   } catch (error) {
  //     console.error("Error reading messages.json:", error);
  //     messages = [];
  //   }
  // }

  const data = m.messages[0];

  setMessage(m);
  let sock: WASocket | null = getSock();
  let Note = await getNotesConnection();

  if (!sock) {
    console.error("!! THE SOCKET IS NOT READY YET");
    return;
  }

  if (data.message) {
    // console.log((m.messages[0].message), ' from ', JSON.stringify(m,null,2))
    let message = getMessageText();
    // console.log(message)
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
            let res = await sock.sendMessage(chatJid, {
              text: "Hello!,\n Gwybot here, this might not be valid command (till now atleast :) )",
            });
            console.log(res);
            break;
        }
      } else {
        console.log("sending hello");
        try {
          let res = await sock.sendMessage(chatJid, {
            text: "Hello I am GwyBot, Made By Abhishek Kumar and Ranjay Singh",
          });
          console.log(res);
        } catch (e) {
          console.log(e);
        }
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
