import { getGroupAdmins } from "../Utils/handlers.js";

export async function tagAll (m,sock) {
  console.log('tagging everyone');

  try{

    let chatJid = m.messages[0].key.remoteJid;
    const groupMetadata = chatJid.endsWith('@g.us') ? await sock.groupMetadata(chatJid).catch(e => {console.log('cant get metadata ',e)}) : ''
    const participants = chatJid.endsWith('@g.us') ? await groupMetadata.participants : ''
    const groupAdmins = chatJid.endsWith('@g.us') ? getGroupAdmins(participants) : ''
    const isAdmins = chatJid.endsWith('@g.us') ? groupAdmins.includes(m.sender) : false
    let message = m.messages[0]?.message?.conversation || m.messages[0]?.message?.extendedTextMessage?.text;
    let mes = ''
    if(message.split(" ").length > 3){
      message = message?.split(" ").map((el,index) => {
        if(index > 1) { return el + " "}else{return ''}
      }).reduce((str,el) => str + el );
      mes = message;
    }

    if (!chatJid.endsWith('@g.us')) {
      sock.sendMessage(chatJid, {text:'TagAll is only available in groups'});
    }
    // if (!isAdmins){
    //   sock.sendMessage(chatJid, {text: 'TagAll is only available admins'});
    // }
    sock.sendMessage(chatJid, {
      text: mes ? mes : "Hello EveryOne!!",
      mentions: participants.map(a => a.id)
    })
    console.log('tagged everyone')
  }catch (err){
    console.log('failed to tagall ', err)
  }
}

