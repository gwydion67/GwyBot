
export const createNote = async (Note,msg,chatJid,user) => {
 
  let count = 0;
  let res;

  await Note.find().exec().then((data) => {
    console.log(data)
      if(data.length > 0){
      count = data.length + 1;
    }
  }).catch((err) => {
    console.log('errorrr',err)
      count = 1;
    })

  const data = new Note({
    note: msg,
    inChat: chatJid,
    savedBy: user,
    index: count
  });

  await data.save().then((data) => {
    console.log('Note Created')
    res = true;
  }).catch((err) => {
      console.log('error while creating note entry',err)
      res = false;
    })

  // console.log(res);
  return res;

}


export const getNotes = async(Note,chatJid,count) => {
  let msg = "";
  await Note.find({inChat: chatJid}).exec().then((data) => {
    console.log('here')
    if(data.length > parseInt(count)){
      data = data.slice(data.length - 1 - parseInt(count))
      // console.log(msg);
    }
    console.log('notes data',data)
    for (let el of data){
      msg = msg + `--------------------------------\n[${el.index}] saved by: ${el.savedBy}
                  \n note: ${el.note}\n--------------------------------\n` ;

    }
  }).catch((err) => {
    console.log('error in getting notes', err);
    })
  return msg; 
}

export const removeNote = async (Note,chatJid, index) => {
  let res,flag;
  for await (let i of index) {
    await Note.deleteOne({inChat: chatJid,index: parseInt(i)}).then((data) => {
      res =  true;
    }).catch((err) => {
      console.log('error deleting notes')
      res =  false
    })

    if(!res){flag = true}
  }

  return res && !flag;

}

export const handleAddNote = async (m,Note,sock) => {
  let message = m.messages[0]?.message?.conversation || m.messages[0]?.message?.extendedTextMessage?.text;
  let cmdStringArray = message?.split(' ')
  let res;
  let chatJid = m.messages[0].key.remoteJid;
  let from = m.messages[0]?.pushName;

  if(m.messages[0].message.extendedTextMessage){
    let msg = m.messages[0].message.extendedTextMessage;
    let note = JSON.stringify(msg?.contextInfo?.quotedMessage.conversation);
    res = createNote(Note,note,chatJid,from);
  }else if(cmdStringArray.length > 3 ){
    let note = cmdStringArray.map((el,index) => {
      if(index > 1) { return el + " "}else{return ''}
    }).reduce((str,el) => str + el );
    res = await createNote(Note,note,chatJid,from);
  }
  sock.sendMessage(chatJid, {text: res ? 'note created' : 'note creation failed' })
}

export const handleGetNotes = async (m,Note,sock) => {
  let message = m.messages[0]?.message?.conversation || m.messages[0]?.message?.extendedTextMessage?.text;
  let cmdStringArray = message?.split(' ')
  let count = (cmdStringArray.length > 3 && !isNan(cmdStringArray[2]))? parseInt(cmdStringArray[2]) : 0;

  let res = await getNotes(Note,m.messages[0].key.remoteJid,count);

  sock.sendMessage(chatJid, {text: res? res :  'no notes found'})
}

export const handleDeleteNotes = async(m,Note,sock) => {
  let message = m.messages[0]?.message?.conversation || m.messages[0]?.message?.extendedTextMessage?.text;
  let cmdStringArray = message?.split(' ')
  let indices = cmdStringArray[2]?.split(',').map((el) => el.trim());

  let res = await removeNote(Note,chatJid,indices);
  sock.sendMessage(chatJid, {text: res? 'notes deleted' :  'notes deletion failed'})
}
