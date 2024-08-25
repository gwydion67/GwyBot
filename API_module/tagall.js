import { getGroupAdmins } from "../Utils/handlers.js";

export async function tagAll (m,sock) {

  try{

    let chatJid = m.messages[0].key.remoteJid;
    const groupMetadata = chatJid.endsWith('@g.us') ? await sock.groupMetadata(chatJid).catch(e => {console.log('cant get metadata ',e)}) : ''
    const participants = chatJid.endsWith('@g.us') ? await groupMetadata.participants : ''
    const groupAdmins = chatJid.endsWith('@g.us') ? getGroupAdmins(participants) : ''
    const isAdmins = chatJid.endsWith('@g.us') ? groupAdmins.includes(m.sender) : false

    if (!chatJid.endsWith('@g.us')) {
      sock.sendMessage(chatJid, {text:'TagAll is only available in groups'});
    }
    if (!isAdmins){
      sock.sendMessage(chatJid, {text: 'TagAll is only available admins'});
    }
    let message = `Hey Everyone!!`;
    sock.sendMessage(chatJid, {
      text: message,
      mentions: participants.map(a => a.id)
    })
  }catch (err){
    console.log('failed to tagall ', err)
  }
}

