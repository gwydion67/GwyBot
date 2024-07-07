import { DisconnectReason, fetchLatestBaileysVersion, useMultiFileAuthState } from "@whiskeysockets/baileys";
import { MongoClient } from "mongodb";
import 'dotenv/config'
import * as baileys from '@whiskeysockets/baileys';
import useMongoDbAuthState from "./mongoDbAuthState.js";
import * as readline from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";
import chalk from "chalk";
import pino from "pino";


const usePairingCode = process.argv.includes('--use-pairing-code');
const rl = readline.createInterface({input,output});

async function connectToWhatsApp () {
  
  const mongoClient = new MongoClient(process.env.MONGO_URI);
  await mongoClient.connect();
  const collection = mongoClient.db("whatsapp_api").collection("auth_info_baileys")

  const {version, isLatest} = await fetchLatestBaileysVersion();
  console.log(chalk.yellow(`using WA v${version.join('.')}, isLatest: ${isLatest}`))
  const {state, saveCreds} = await useMongoDbAuthState(collection); 
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

  sock.ev.on('messages.upsert', async (m) => {
    console.log(JSON.stringify(m, undefined, 2))
    // await sock.sendMessage(m.messages[0].key.remoteJid, { text: 'Hello there!' })
  })

  // sock.ev.on('groups.upsert', (m)=> {
  //   console.log(chalk.greenBright('\nfajfakf\n')  , 'Greninja' , m )
  //   console.log('replying to', m.messages[0].key.remoteJid)
  //   // await sock.sendMessage(m.messages[0].key.remoteJid, { text: 'Hello there!' })
  // })
}
// run in main file
connectToWhatsApp()
