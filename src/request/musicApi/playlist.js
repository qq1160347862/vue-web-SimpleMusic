import musicApi from "../music";

// 获取当前时间戳
const getTimestamp = () => Date.now();

// 获取歌单详情
export const getPlaylistDetail = async (id, cookie) => {
  const url = `/playlist/detail?id=${id}${cookie ? `&timestamp=${getTimestamp()}` : ''}`;
  try {
    return await musicApi.post(url, { cookie });
  } catch (error) {
    console.error("Error fetching playlist detail:", error);
    throw error;
  }
};

// 获取歌单歌曲
export const getPlaylistTracks = async (id, cookie, limit, offset) => {
  try {
    let url = `/playlist/track/all?id=${id}`;
    if (limit && offset) {
      url += `&limit=${limit}&offset=${offset}`;
    }
    if (cookie) {
      url += `&timestamp=${getTimestamp()}`;
    }
    return await musicApi.post(url, { cookie });
  } catch (error) {
    console.error("Error fetching playlist tracks:", error);
    throw error;
  }
};

// 发现好歌单
export const getDiscoverPlaylist = async (limit = 8) => {
  try {
    return await musicApi.get(`/personalized?limit=${limit}`);
  } catch (error) {
    console.error("Error fetching discover playlist:", error);
    throw error;
  }
};

// 推荐歌单
export const getRecommendPlaylist = async (cookie = '') => {
  try {
    return await musicApi.post(`/recommend/resource`,{
      cookie
    });
  } catch (error) {
    console.error("Error fetching recommend playlist:", error);
    throw error;
  }
};
