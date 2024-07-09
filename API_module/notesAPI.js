
export const createNote = async (Note,msg,chatJid,user) => {
 
  let count = 0;

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

  let res;
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
      res =  false
    })

    if(!res){flag = true}
  }

  return res && !flag;

}


