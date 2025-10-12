import {
  DisconnectReason,
  fetchLatestBaileysVersion,
  useMultiFileAuthState,
} from "@whiskeysockets/baileys";
import "dotenv/config";
import * as baileys from "@whiskeysockets/baileys";
import * as readline from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";
import chalk from "chalk";
import pino from "pino";

import { connectAuth } from "./Utils/mongo.js";
import useMongoDbAuthState from "./mongoDbAuthState.js";
import NodeCache from "node-cache";
import { getNotesConnection, setSock } from "./Store/stateHandler.js";
import { responseHandler } from "./Store/responseHandler.js";

const usePairingCode = process.argv.includes("--use-pairing-code");
const rl = readline.createInterface({ input, output });

async function connectToWhatsApp() {
  const authCollection = await connectAuth();
  const { version, isLatest } = await fetchLatestBaileysVersion();
  console.log(
    chalk.yellow(`using WA v${version.join(".")}, isLatest: ${isLatest}`),
  );
  // const { state, saveCreds } = await useMongoDbAuthState(authCollection);
  const { state, saveCreds } = await useMultiFileAuthState("auth_info_baileys");
  const groupCache = new NodeCache({});

  const sock = baileys.makeWASocket({
    version,
    logger: pino({ level: "silent" }),
    auth: state,
    browser: baileys.Browsers.windows("Firefox"),
    printQRInTerminal: !usePairingCode,
    generateHighQualityLinkPreview: true,
    cachedGroupMetadata: async (jid) => groupCache.get(jid),
  });

  setSock(sock);

  if (usePairingCode && !sock.authState.creds.registered) {
    const phoneNumber = await rl.question(
      "Please enter your mobile phoneNumber",
    );
    const code = await sock.requestPairingCode(phoneNumber);
    console.log(`pairing code : ${code}`);
  }

  sock.ev.on("connection.update", async (update) => {
    const { connection, lastDisconnect } = update;

    if (connection === "close") {
      const shouldReconnect =
        lastDisconnect.error?.output?.statusCode !== DisconnectReason.loggedOut;
      console.log(
        "connection closed due to ",
        lastDisconnect.error,
        ", reconnecting ",
        shouldReconnect,
      );
      // reconnect if not logged out
      if (shouldReconnect) {
        await connectToWhatsApp();
      }
    } else if (connection === "open") {
      console.log(chalk.greenBright("opened connection"));
    }
  });

  sock.ev.on("creds.update", saveCreds);
  // sock.ev.on("messages.update", (m) => {
  //   console.log( chalk.blue('\n its me\n'),m);
  // })

  console.log("listening");
  sock.ev.on("messages.upsert", responseHandler);
}
// run in main file
connectToWhatsApp();
