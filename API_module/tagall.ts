import { WASocket } from "baileys";
import { MessageBody } from "../types/types.js";
import { getGroupAdmins } from "../Utils/handlers.js";

export async function tagAll(m: MessageBody, sock: WASocket | null) {
  console.log("tagging everyone");

  if (!sock) {
    console.log("sock is null");
    return;
  }

  const data = m.messages[0];

  try {
    const chatJid = m.messages[0]?.key?.remoteJid;
    if (!chatJid) {
      console.log("chatJid is null or undefined");
      return;
    }

    if (!chatJid.endsWith("@g.us")) {
      sock.sendMessage(chatJid, { text: "TagAll is only available in groups" });
      return;
    }

    const groupMetadata = await sock.groupMetadata(chatJid).catch((e) => {
      console.log("cant get metadata ", e);
      return null;
    });

    if (!groupMetadata || !groupMetadata.participants) {
      console.log("groupMetadata or participants is null or undefined");
      return;
    }

    const participants = groupMetadata.participants;
    const groupAdmins = getGroupAdmins(participants);
    console.log(participants)
    const isAdmins = groupAdmins.includes(data || "");

    let message =
      m.messages[0]?.message?.conversation ||
      m.messages[0]?.message?.extendedTextMessage?.text ||
      "";

    let mes = "";
    if (message.split(" ").length > 3) {
      message = message
        .split(" ")
        .map((el, index) => {
          if (index > 1) {
            return el + " ";
          } else {
            return "";
          }
        })
        .reduce((str, el) => str + el, "");
      mes = message;
    }

    sock.sendMessage(chatJid, {
      text: mes ? mes : "Hello EveryOne!!",
      mentions: participants.map((a) => a.id),
    });
    console.log("tagged everyone");
  } catch (err) {
    console.log("failed to tagall ", err);
  }
}
