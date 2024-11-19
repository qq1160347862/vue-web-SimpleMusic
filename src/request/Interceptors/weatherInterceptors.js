import { geoApi, weatherApi } from "@/request/weather";

geoApi.interceptors.request.use(config => {

    return config;
}, error => {

    return Promise.reject(error);
});
geoApi.interceptors.response.use(response => {

    if (response.status !== 200) {
        return Promise.reject(new Error("定位信息接口异常"));
    }
    return response.data;
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
        return Promise.reject(new Error("天气信息接口异常"));
    }
    return response.data;
}, error => {

    return Promise.reject(error);
});
