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

let resStringList  = weatherData.split(' ');
let response = JSON.stringify({
    Location : location,
    Temperature : `${resStringList[1]} ${resStringList[4]}`, 
    Wind : resStringList[5] ,
    Humidity : resStringList[6]
})

await sock.sendMessage(remoteJid, { text:  response || 'Data not Found'});
}
catch (err){
console.log('err' , err);
}
return;


}

export default getWeather ;
