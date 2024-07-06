import pkg from "@whiskeysockets/baileys";
const {proto, initAuthCreds, BufferJSON} = pkg;

const useMongoDbAuthState = async (collection) => {

  const writeData = (data,id) => {
    const informationToStore = JSON.parse(
      JSON.stringify(data,BufferJSON.replacer)
    );

    const update = {
      $set: {
        ...informationToStore,
      },
    };

    return collection.updateOne({_id: id},update, {upsert: true});
  };

  const readData = async (id) => {
    try {
      const data = JSON.stringify(await collection.findOne({_id: id}));
      return JSON.parse(data,BufferJSON.reviver)
    } catch (err) {
      console.log(err)
    }
  }

  const removeData = async (id) => {
    try{
      await collection.deleteOne({_id: id});
    }catch(err){
      console.log('error',err)
    }
  }

  const creds = (await readData('creds')) || (0,initAuthCreds)();

   return{
    state:{
      creds,
      keys: {
        get: async (type,ids)=> {
          const data = {};
          await Promise
          .all(
            ids.map(async (id) => {
              let value = await readData(`${type}-${id}`);
              if(type === "app-state-sync-key"){
                value = proto.Message.AppStateSyncKeyData.fromObject(data);
              }
              data[id] = value;
            })
          );
          return data;
        },
        set: async (data) => {
          const tasks = [];
          for (const category of Object.keys(data)){
            for (const id of Object.keys(data[category])){
              const value = data[category][id];
              const key = `${category}-${id}`;
              tasks.push(value? writeData(value,key) : removeData(key));
            }
          }
          await Promise.all(tasks);
        },
      },
    },
    saveCreds: () => {
      return writeData(creds, "creds");
    }
  };
};

export default useMongoDbAuthState;

// console.log(JSON.parse(JSON.stringify((0,initAuthCreds)(),BufferJSON.replacer)));
