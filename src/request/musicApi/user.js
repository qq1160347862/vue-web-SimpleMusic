import musicApi from "../music";

// 获取当前时间戳
const getTimestamp = () => Date.now();

// 获取用户详情
export const getUserDetail = async (id) => {
    try {
        return await musicApi.get(`/user/detail?uid=${id}&timestamp=${getTimestamp()}`);
    } catch (err) {
        console.log("Error fetching user detail", err);
        return await Promise.reject(err);
    }
};