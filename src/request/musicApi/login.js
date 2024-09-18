import musicApi from "../music";

// 获取当前时间戳
const getTimestamp = () => Date.now();

// 获取登录二维码
export const getQrcode = async () => {
  try {
    return await musicApi.get(`/login/qr/key?timestamp=${getTimestamp()}`);
  } catch (err) {
    console.log("Error fetching qrcodekey", err);
    return await Promise.reject(err);
  }
};

// 获取登录二维码图片
export const getQrcodeImg = async (key) => {
  try {
    return await musicApi.get(`/login/qr/create?key=${key}&qrimg=true&timestamp=${getTimestamp()}`);
  } catch (err) {
    console.log("Error fetching qrcodeimg", err);
    return await Promise.reject(err);
  };
};


// 检查登录二维码是否扫描
export const checkQrcode = async (key) => {
  try {
    return await musicApi.get(`/login/qr/check?key=${key}&timestamp=${getTimestamp()}`);
  } catch (err) {
    console.log("Error checking qrcodekey", err);
    return await Promise.reject(err);
  };
};

// 获取登录状态
export const getLoginStatus = async (cookie = '') => {
  try {
    return await musicApi.post(`/login/status?timestamp=${getTimestamp()}`, {
      cookie
    });
  } catch (err) {
    console.log("Error fetching login status", err);
    return await Promise.reject(err);
  }
};

// 退出登录
export const logout = async () => {
  try {
    return await musicApi.get("/logout");
  } catch (err) {
    console.log("Error logging out", err);
    return await Promise.reject(err);
  };
};