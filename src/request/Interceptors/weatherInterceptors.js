import { geoApi, weatherApi } from "@/request/weather";

geoApi.interceptors.request.use(config => {

    return config;
}, error => {

    return Promise.reject(error);
});
geoApi.interceptors.response.use(response => {

    if (response.status !== 200) {
        return Promise.reject(new Error("获取城市信息失败"));
    }
    return response;
}, error => {

    return Promise.reject(error);
});


weatherApi.interceptors.request.use(config => {

    return config;
}, error => {

    return Promise.reject(error);
});
weatherApi.interceptors.response.use(response => {

    if (response.status !== 200) {
        return Promise.reject(new Error("获取天气信息失败"));
    }
    return response;
}, error => {

    return Promise.reject(error);
});
