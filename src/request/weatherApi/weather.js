import { weatherApi, geoApi } from "../weather";

// 获取城市
//例如 location=北京 或 location=116.41,39.92
export const getCity = async (location, adm = '', range = 'cn', number = 10, lang = 'zh-hans') => {
    try {
        const url = `city/lookup?location=${location}&adm=${adm}&range=${range}&number=${number}&lang=${lang}`;
        return await geoApi.get(url);
    } catch (error) {
        console.log(error);
    }
};

// 实时天气
export const getWeatherNow = async (location, lang = 'zh-hans') => {
    try {
        const url = `weather/now?location=${location}&lang=${lang}`;
        return await weatherApi.get(url);
    } catch (error) {
        console.log(error);
    }
};