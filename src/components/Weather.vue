<template>
    <div class="weather-container">
        {{ data }}
    </div>
</template>

<script setup>
import { onMounted, ref } from 'vue';
import { getCity, getWeatherNow } from '@/request/weatherApi/weather';
const data = ref()


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
    try {
        const location = await getCurrentLocation()
        // const city = await getCity(`${location.lon},${location.lat}`);
        // const locationID = city.data.location[0].id;
        // const weather = await getWeatherNow(locationID);
        // data.value = weather.data;
    } catch (error) {
        console.log(error);
    }
});
</script>

<style scoped>

</style>