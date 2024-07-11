import axios from "axios";


async function getWeather(location = 'Kharagpur' , sock , remoteJid ){
  let loc = location.toLowerCase()
  let URL = `https://wttr.in/${loc}?format="%l:+%c+%t+%w+%h\n"`
  let weatherData ;

  try {
    await axios.get(URL).then((res)=> {
      console.log(res.data , 'data');
      weatherData = res.data ;
    })

    let resStringList  = weatherData.split(' ').filter((el)=>el!=='');
    console.log(resStringList , 'data');
    let response = JSON.stringify({
      Location : location,
      Temperature : `${resStringList[1]} ${resStringList[2]}`, 
      Wind : resStringList[3] ,
      Humidity : resStringList[4]
    })

    await sock.sendMessage(remoteJid, { text:  response || 'Data not Found'});
  }
  catch (err){
    console.log('err' , err);
  }
  return;


}

export default getWeather ;
