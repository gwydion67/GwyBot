import axios from "axios";

// Replace with your actual API key
const API_KEY = 'f582b59f4dbf0d0e23dacb4d15740565';
const CITY = 'London';
const locationURL = `http://api.openweathermap.org/geo/1.0/direct?q=${CITY}&limit=5&appid=${API_KEY}`
const URL = `https://api.openweathermap.org/data/2.5/weather?q=${CITY}&appid=${API_KEY}`;


async function getWeather(){
    
let locData;

try{
   await axios.get(locationURL)
    .then(response => {
      locData = response.data;
      // console.log(`The weather in ${CITY} is ${weatherData.weather[0].description}.`);
      // console.log(`The temperature is ${weatherData.main.temp}°K.`);
      console.log(locData , '\nkjchah\n')
      if (locData.length){
          console.log(`Lat : ${locData[0].lat}`)
      }
      return locData
    })
    .catch(error => {
      console.error('Error fetching the weather data:', error);
    });  
}
catch(err){

}
return locData ;

}

export default getWeather ;
