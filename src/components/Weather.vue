<template>
    <div class="weather-container no-select" ref="container">
        <form @submit.prevent="handleSubmit" class="search-box">
            <i class="iconfont icon-location-fill"></i>
            <input 
                v-model.lazy="input"        
                type="text" 
                name="" id="" 
                placeholder="请输入城市名称">
                <i class="iconfont icon-sousuo"></i>
        </form>

        <div class="weather-box">
            <div class="box">
                <div class="info-weather">
                    <div class="weather" v-if="data">
                        <img src="" alt="">
                        <p class="temperature">{{ data.temp }}<span>°C</span></p>
                        <p class="description">{{ data.text }}</p>
                    </div>
                </div>
            </div>
        </div>

        <div class="weather-details">
            <div class="humidity card">
                <i class="iconfont icon-humidity"></i>
                <div class="text">
                    <div class="info-humidity">
                        <span v-if="data">{{ `${data.humidity}%` }}</span>
                    </div>
                    <p>Humidity</p>
                </div>
            </div>

            <div class="wind card">
                <i class="iconfont icon-wind"></i>
                <div class="text">
                    <div class="info-wind">
                        <span v-if="data">{{ `${data.windSpeed} Km/h` }}</span>
                    </div>
                    <p>Wind Speed</p>
                </div>
            </div>
        </div>

        <div class="not-found">
            <div class="box">
                <img src="" alt="">
                <p>Sorry, we couldn't find the weather for this location.</p>
            </div>
        </div>
    </div>
</template>

<script setup>
import { onMounted, ref, inject } from 'vue';
import { getCity, getWeatherNow } from '@/request/weatherApi/weather';
const message = inject('message');
const container = ref(null)
const location = ref()
const data = ref(null)
const input = ref('')


const queryWeather = async (query) => {
    const weatherBox = container.value.querySelector('.weather-box')
    const weatherDetails = container.value.querySelector('.weather-details')
    const notFound = container.value.querySelector('.not-found')
    const city = await getCity(typeof query === 'string'? query : `${query.lon},${query.lat}`);
    
    if (city.code !== '200') {
        weatherBox.classList.remove('active')
        weatherDetails.classList.remove('active')
        notFound.classList.add('active')
        message.value.addMessage({text: "获取定位信息失败", duration: 2000, type: 'error'})
        return null;            
    }
    const locationID = city.location[0].id;
    const weather = await getWeatherNow(locationID);
    
    if (weather.code !== '200') {            
        message.value.addMessage({text: "获取天气信息失败", duration: 2000, type: 'error'})
        return null;
    }
                
    weatherBox.classList.add('active')
    weatherDetails.classList.add('active')
    notFound.classList.remove('active')
    return weather.now;
}

const handleSubmit = async () => {
    if (input.value.trim() === '') {
        return;
    }
    data.value = await queryWeather(input.value.trim());
}

const getCurrentLocation = () => {
    return new Promise((resolve, reject) => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition((position) =>{
                const lon = Math.floor(position.coords.longitude * 100) / 100; //经度
                const lat = Math.floor(position.coords.latitude * 100) / 100; //纬度
                console.log("经度: " + lon);
                console.log("纬度: " + lat);                
                resolve({ lon, lat });
            },(error) =>  {
                reject(error);
            });
        } else {
            reject(new Error("Geolocation is not supported by this browser."));
        }
    })
}

onMounted(async () => {
    location.value = await getCurrentLocation();   
    data.value = await queryWeather(location.value);   
});
</script>

<style scoped>
.weather-container {
    position: relative;
    width: 100%;
    min-width: 240px;
    height: 100%;
    background: rgba(255, 255, 255, .1);
    backdrop-filter: blur(30px);
    border-radius: 8px;
    padding: 16px;
    padding-bottom: 32px;
    color: #fff;
    overflow: hidden;
    transition: height .6s ease;
}

.search-box {
    position: relative;
    width: 100%;
    height: 32px;
    display: flex;
    align-items: center;
}
.search-box .iconfont.icon-location-fill {
    position: absolute;
    left: 10px;
    font-size: 14px;
    color: #fff;
}
.search-box .iconfont.icon-sousuo {
    position: absolute;
    right: 10px;
    font-size: 14px;
    color: #fff;
}

.search-box input {
    position: absolute;
    width: 100%;    
    height: 100%;
    background: transparent;
    border: 2px solid rgba(255, 255, 255, .2);
    outline: none;
    border-radius: 18px;
    font-size: 14px;
    color: white;
    text-transform: uppercase;
    padding: 0 32px;    
}

.search-box input::placeholder {
    color: #fff;
    text-transform: capitalize;
}



/*** weather box ***/
.weather-box {
    text-align: center;
    margin: 40px 0;
}

.weather-box img {
    width: 60%;
}

.weather-box .temperature {
    position: relative;
    font-size: 36px;
    line-height: 1;
    font-weight: 700;
    margin: 4px 0 4px -30px;
}

.weather-box .temperature span {
    position: absolute;
    font-size: 16px;
    margin-left: 4px;
}

.weather-box .description {
    font-size: 14px;
    text-transform: capitalize;
}



/*** weather details ***/
.weather-details {
    width: 100%;
    display: grid;
    gap: 8px;
    grid-template-columns: repeat(auto-fit, minmax(80px, 1fr));
}
.weather-details .card {
    display: flex;
    justify-content: center;
    align-items: center;
}

.weather-details .iconfont {
    font-size: 28px;
    margin-right: 10px;
}

.weather-details span {
    display: inline-block;
    font-size: 12px;
}

.weather-details p {
    font-size: 10px;
}



/*** not found ***/
.not-found {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    text-align: center;
    margin-top: 110px;
}

.not-found img{
    width: 65%;
}

.not-found p {
    width: 80%;
    margin: 0 auto;
    font-size: 12px;
    margin-top: 12px;
}

/*** 动态样式 ***/
.weather-box,
.weather-details,
.not-found {
    overflow: hidden;
}

.weather-box .box,
.not-found .box {
    transform: scale(0.8);
    opacity: 0;
}

.weather-box.active .box,
.not-found.active .box {
    transform: scale(1);
    opacity: 1;
    transition: all .6s .6s ease;
}

.weather-details .card {
    transform: scale(0.8);
    opacity: 0;
}

.weather-details.active .card {
    transform: scale(1);
    opacity: 1;
    transition: all .6s .8s ease;
}
</style>