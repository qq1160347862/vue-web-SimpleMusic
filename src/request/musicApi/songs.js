import musicApi from "../music";

// 获取音乐url(旧)
// export const getSongUrl = (id) => {
//   return `https://music.163.com/song/media/outer/url?id=${id}.mp3`;
// }; 

// 获取音乐url(新)
export const getSongUrl = async (id) => {
  return musicApi.get(`/song/url?id=${id}`)
}

// 获取歌词
export const getLyric = async (id) => {
  return musicApi.get(`/lyric?id=${id}`)
}; 

// 搜索歌曲
export const searchSongs = async (keywords,limit,offset) => {
  return musicApi.get(`/cloudsearch?keywords=${keywords}&limit=${limit}&offset=${offset}`)
}; 

// 默认搜索关键词
export const defaultSearchKey = async () => {
  return musicApi.get("/search/default");
}; 

// 获取搜索建议
export const getSearchSuggest = async (keywords) => {
  return musicApi.get(`/search/suggest?keywords=${keywords}`)
}; 