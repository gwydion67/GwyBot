import makeWASocket, {
  AuthenticationState,
  Browsers,
  DisconnectReason,
  useMultiFileAuthState,
  WASocket,
} from "baileys";
import NodeCache from "node-cache";
import P from "pino";
import QRCode from "qrcode";
import { stdin as input, stdout as output } from "node:process";
import { Boom } from "@hapi/boom";
import { createInterface } from "node:readline";
import chalk from "chalk";
import { responseHandler } from "./Store/responseHandler.ts";
import { setSock } from "./Store/stateHandler.ts";

import "dotenv/config";

// const authState: AuthenticationState = null;

const groupCache: NodeCache = new NodeCache({});

const usePairingCode = process.argv.includes("--use-pairing-code");
const rl = createInterface({ input, output });
const question = async (questionText: string) => {
  try {
    return await new Promise<string>((resolve) =>
      rl.question(questionText, resolve),
    );
  } finally {
    return rl.close();
  }
};

export const connectToWhatsapp = async () => {
  const {
    state: authState,
    saveCreds,
  }: { state: AuthenticationState; saveCreds: () => Promise<void> } =
    await useMultiFileAuthState("auth_info_baileys");

  const sock: WASocket = makeWASocket({
    auth: authState, // auth state of your choosing,
    logger: P({
      level: "silent",
    }), // you can configure this as much as you want, even including streaming the logs to a ReadableStream for upload or saving to a file
    browser: Browsers.windows("Firefox"),
    markOnlineOnConnect: false,
    cachedGroupMetadata: async (jid) => groupCache.get(jid),
    generateHighQualityLinkPreview: true,
  });

  setSock(sock);

  sock.ev.on("creds.update", saveCreds);

  sock.ev.on("connection.update", async (update) => {
    const { connection, lastDisconnect, qr } = update;

    if (qr) {
      console.log(
        await QRCode.toString(qr, {
          type: "terminal",
          small: true,
        }),
      );
    }

    if (
      usePairingCode &&
      !sock.authState.creds.registered &&
      connection == "connecting"
    ) {
      let phoneNumber =
        (await question("Please enter your mobile phoneNumber:\n")) || "";
      const code = await sock.requestPairingCode(phoneNumber);
      console.log(`pairing code : ${code}`);
    }

    if (connection === "close") {
      const statusCode = (lastDisconnect?.error as Boom)?.output?.statusCode;
      console.error("Disconnected with status code:", statusCode);

      if (statusCode === DisconnectReason.restartRequired) {
        // create a new socket, this socket is now useless
        connectToWhatsapp();
      }
    }

    if (connection === "open") {
      console.log(chalk.greenBright("opened connection"));
    }
  });

  sock.ev.on("messages.upsert", responseHandler);
};

connectToWhatsapp();
