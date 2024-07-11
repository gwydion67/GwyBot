import { DisconnectReason, fetchLatestBaileysVersion, useMultiFileAuthState } from "@whiskeysockets/baileys";
import { MongoClient } from "mongodb";
import 'dotenv/config'
import * as baileys from '@whiskeysockets/baileys';
import * as readline from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";
import chalk from "chalk";
import pino from "pino";

import getWeather from "./API_module/weatherAPI.js";
import { connectAuth, connectNotes } from "./Utils/mongo.js";
import useMongoDbAuthState from "./mongoDbAuthState.js";
import { handleAddNote, handleDeleteNotes, handleGetNotes } from "./API_module/notesAPI.js";


const usePairingCode = process.argv.includes('--use-pairing-code');
const rl = readline.createInterface({input,output});

async function connectToWhatsApp () {

  const Note = await connectNotes();
  const authCollection = await connectAuth();
  const {version, isLatest} = await fetchLatestBaileysVersion();
  console.log(chalk.yellow(`using WA v${version.join('.')}, isLatest: ${isLatest}`))
  const {state, saveCreds} = await useMongoDbAuthState(authCollection); 
  // const {state, saveCreds} = await useMultiFileAuthState("auth_info_baileys"); 

  const sock = baileys.makeWASocket({
    version,
    logger: pino({level: 'silent'}),
    auth: state,
    browser: baileys.Browsers.windows('Firefox'),
    printQRInTerminal: !usePairingCode,
    generateHighQualityLinkPreview: true,
  })

  if(usePairingCode && !sock.authState.creds.registered){
    const phoneNumber = await rl.question("Please enter your mobile phoneNumber");
    const code = await sock.requestPairingCode(phoneNumber);
    console.log(`pairing code : ${code}`)
  }

  sock.ev.on('connection.update', (update) => {
    const { connection, lastDisconnect } = update;

    if(connection === 'close') {
      const shouldReconnect = (lastDisconnect.error)?.output?.statusCode !== DisconnectReason.loggedOut
      console.log('connection closed due to ', lastDisconnect.error, ', reconnecting ', shouldReconnect)
      // reconnect if not logged out
      if(shouldReconnect) {
        connectToWhatsApp()
      }
    } else if(connection === 'open') {
      console.log(chalk.greenBright('opened connection'))
    }
  })

  sock.ev.on("creds.update", saveCreds);

  // sock.ev.on("messages.update", (m) => {
  //   console.log( chalk.blue('\n its me\n'),m);
  // })

  console.log('listening')
  sock.ev.on('messages.upsert', async (m) => {
    let responseData ;

    if (m.messages[0].message){
      // console.log((m.messages[0].message), ' from ', JSON.stringify(m,null,2))
      let message = m.messages[0]?.message?.conversation || m.messages[0]?.message?.extendedTextMessage?.text;
      if (message?.toLowerCase()?.trim()?.startsWith('@gwybot')){
        let cmdStringArray = message?.split(' ')
        let command = cmdStringArray[1]?.toLowerCase();
        console.log(command);
        switch (command){
          case 'weather': 
            getWeather(cmdStringArray[2] , sock , m.messages[0].key.remoteJid );
            break;
          case 'addnote':
            handleAddNote(m,Note,sock);
            break;
          case 'getnotes':
            handleGetNotes(m,Note,sock);
            break;
          case 'deletenote':
            handleDeleteNotes(m,Note,sock);
            break;
          default : 
        }
      }

      // console.log(chalk.red('\nBoomBurst\n') , 'replying to')
      // await sock.sendMessage(m.messages[0].key.remoteJid, { text: 'Hello there!' })
    }
    else{

      // console.log(chalk.red('\nBoomBurst\n') , 'replying to' , JSON.stringify(m , undefined , 2 ))
      //  let userjid  = m.messages[0].key.remoteJid.includes('@s.whatsapp.net') ? m.messages[0].key.remoteJid : m.messages[0].key.participant ;
      if(!m.messages[0].key.fromMe){
      }

    }
  })
}
// run in main file
connectToWhatsApp()
