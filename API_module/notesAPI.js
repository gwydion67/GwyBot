export const createNote = (Note,msg,chatJid,userJid) => {
 
  let count = 0;

  Note.find().then((data) => {
    if(data.length > 0){
      count = data.length();
    }
  }).catch((err) => {
      count = 0;
    })

  const data = new Note({
    note: msg,
    inChat: chatJid,
    savedBy: userJid,
    index: count+1
  });
  
  data.save().then((data) => {
    console.log('Note Created')
  }).catch((err) => {
      console.log('error while creating note entry',err)
    })
}


export const getNotes = (Note,chatJid,count=0) => {
  let msg = "";
  Note.find({inChat: chatJid}).exec().then((data) => {
    data = data.slice(-1*count)
    for (let el of data){
      msg = msg + `--------------------------------\n[${el.index}] saved by: ${el.userJid}
                    \n note: ${el.note}\n--------------------------------\n` 
    }
    return msg 
  }).catch((err) => {
      console.log('error in getting notes', err);
      return ''
    })
}

export const removeNote = (Note,chatJid, index) => {
  Note.findOne({inChat: chatJid,index: index}).then((data) => {
    console.log('note deleted succesfully');
    return true;
  }).catch((err) => {
      return false
    })
}


