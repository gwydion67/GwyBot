import { DisconnectReason, fetchLatestBaileysVersion, useMultiFileAuthState } from "@whiskeysockets/baileys";
import { MongoClient } from "mongodb";
import 'dotenv/config'
import * as baileys from '@whiskeysockets/baileys';
import useMongoDbAuthState from "./mongoDbAuthState";
import * as readline from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";

const usePairingCode = process.argv.includes('--use-pairing-code');
const rl = readline.createInterface({input,output});

async function connectToWhatsApp () {
  
  const mongoClient = new MongoClient(process.env.MONGO_URI);

  await mongoClient.connect();

  const collection = mongoClient.db("whatsapp_api").collection("auth_info_baileys")

  const {version, isLatest} = await fetchLatestBaileysVersion();
  // const {state, saveCreds} = await useMultiFileAuthState("auth_info_baileys"); 
  const {state, saveCreds} = await useMongoDbAuthState(collection); 

  const sock = baileys.makeWASocket({
    auth: state,
    printQRInTerminal: true,
  })

  sock.ev.on('connection.update', (update) => {
    const { connection, lastDisconnect } = update;

    if(update?.qr){
      console.log(update.qr)
    }

    if(connection === 'close') {
      const shouldReconnect = (lastDisconnect.error)?.output?.statusCode !== DisconnectReason.loggedOut
      console.log('connection closed due to ', lastDisconnect.error, ', reconnecting ', shouldReconnect)
      // reconnect if not logged out
      if(shouldReconnect) {
        connectToWhatsApp()
      }
    } else if(connection === 'open') {
      console.log('opened connection')
    }
  })

  if(usePairingCode && !sock.authState.creds.registered){
    const phoneNumber = await rl.question("Please enter your mobile phoneNumber");
    const code = await sock.requestPairingCode(phoneNumber);
    console.log(`pairing code : ${code}`)
  }

  sock.ev.on("creds.update", saveCreds);

  sock.ev.on("messages.update", (m) => {
    console.log(m);
  })

  sock.ev.on('messages.upsert', async (m) => {
    console.log(JSON.stringify(m, undefined, 2))

    console.log('replying to', m.messages[0].key.remoteJid)
    await sock.sendMessage(m.messages[0].key.remoteJid, { text: 'Hello there!' })
  })
}
// run in main file
connectToWhatsApp()
