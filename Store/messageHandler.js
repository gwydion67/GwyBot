let currentMessage = "";

export const setMessage = (message) => {
  currentMessage = message;
};

export const getMessage = () => {
  return currentMessage;
};

export const getCurrentChatJid = () => {
  let chatJid = currentMessage.messages[0].key.remoteJid;
  return chatJid;
};

export const getCmdArray = () => {
  if (currentMessage.messages[0].message) {
    // console.log((m.messages[0].message), ' from ', JSON.stringify(m,null,2))
    let message =
      currentMessage.messages[0]?.message?.conversation ||
      currentMessage.messages[0]?.message?.extendedTextMessage?.text;
    if (message?.toLowerCase()?.trim()?.startsWith("@gwybot")) {
      let cmdStringArray = message?.split(" ");
      return cmdStringArray;
    }
  }
  return [];
};

export const getCommand = () => {
  let command = "";
  let cmdStringArray = getCmdArray();
  if (cmdStringArray.length > 1) {
    command = cmdStringArray[1]?.toLowerCase();
  }
  return command;
};
