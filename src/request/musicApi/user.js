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

// 获取用户歌单
export const getUserPlaylist = async (id, limit = 30, offset = 0, cookie = "") => {
    try {
        let url = `/user/playlist?uid=${id}&timestamp=${getTimestamp()}`
        if (limit) {
            url += `&limit=${limit}`;
        }
        if (offset) {
            url += `&offset=${offset}`;
        }
        return await musicApi.post(url,{
            cookie
        });
    } catch (err) {
        console.log("Error fetching user playlist", err);
        return await Promise.reject(err);
    }    
};