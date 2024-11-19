import axios from "axios";
const API_KEY = "iuyysuhgn8ytqg560bzfropd";
const weatherApi = axios.create({
  baseURL: "https://devapi.qweather.com:443/v7",
  timeout: 5000,
  headers: {
    'X-QW-Api-Key' : API_KEY
  }
});

const geoApi = axios.create({
  baseURL: "https://geoapi.qweather.com/v2",
  timeout: 5000,
  headers: {
    'X-QW-Api-Key' : API_KEY
  }
});

export { weatherApi, geoApi };