import { defineStore } from "pinia";
import { setActivePinia, createPinia } from 'pinia';
import { useUserStore } from "./userStore";
import { storeToRefs } from 'pinia';
import { ref, shallowRef, watch } from "vue";
import { getSongUrl, getLyric, defaultSearchKey, getSearchSuggest, getHotSearch, searchSongs} from '@/request/musicApi/songs'
import { getComments, getFloorComments, operateComment, likeComment } from "@/request/musicApi/comment";
import useLyricParse from "../hooks/useLyricParse";
const useLyric = useLyricParse()
// 通过使用setActivePinia来激活Pinia仓库，因为pinia的创建是在app.mount之后的 
setActivePinia(createPinia())
const userStore = useUserStore()
const { isLogin, cookie } = storeToRefs(userStore)

export const useLocalStore = defineStore("local", () => {
    const localPlayer = ref(null);
    const musicList = ref([]);    
    const currentIndex = ref(-1);
    const isPlaying = ref(false);
    const volume = ref(1);
    const loop = ref(1); // 0: 单曲循环，1: 列表循环，2: 随机播放
    const currentTime = ref(0);
    const duration = ref(0);
    const progress = ref(0);
    const isDragging = ref(false)
    // [{
    //     id: null,
    //     detail: null,
    //     tracks: null
    // }]
    const albumCaches = shallowRef([]);
    const maxCacheCount = ref(2);

    const total = ref(0)
    const trackComments = ref([])    
    const trackSortType = ref(1)
    const albumComments = ref([])
    const albumSortType = ref(1)

    const historySearch = ref(JSON.parse(localStorage.getItem("historySearch")) || [])


    // 音乐列表覆盖
    const setMusicList = async (list) => {
        musicList.value = list
        // 默认播放第一个歌曲
        currentIndex.value = 0
        const url = await getTrackUrl(list[0].id)
        const lyric = await getTrackLyric(list[0].id)            
        list[0].url = url
        list[0].lyric = lyric
        isPlaying.value = true
        await getCommentsData({
            id: musicList.value[currentIndex.value].id, 
            type: 0, 
            sortType: trackSortType.value, 
            pageSize: 20, 
            pageNo: 1, 
        })    
    }

    // 添加音乐至列表末尾(播放)
    const pushMusicToList = async (track) => {

        isPlaying.value = true
        const oldIndex = currentIndex.value                
        const index = musicList.value.findIndex((item) => {
            return item.id === track.id
        })

        if (index === -1) {
            // 歌曲不存在，添加至列表
            const url = await getTrackUrl(track.id)
            const lyric = await getTrackLyric(track.id)            
            track.url = url
            track.lyric = lyric
            // musicList.value.push(track)
            // currentIndex.value = musicList.value.length - 1
            musicList.value.unshift(track)
            currentIndex.value = 0
            await getCommentsData({
                id: musicList.value[currentIndex.value].id, 
                type: 0, 
                sortType: trackSortType.value, 
                pageSize: 20, 
                pageNo: 1, 
            })
            return
        }

        // 歌曲已存在，切换至已存在的歌曲
        const target = musicList.value[index]   // 获得目标歌曲
        if(!target.url) {
            const url = await getTrackUrl(target.id)
            target.url = url
        }      

        if(!target.lyric) {
            const lyric = await getTrackLyric(target.id)
            target.lyric = lyric
        }
        
        // 避免一首歌的评论多次请求
        currentIndex.value = index
        
        await getCommentsData({
            id: musicList.value[currentIndex.value].id, 
            type: 0, 
            sortType: trackSortType.value, 
            pageSize: 20, 
            pageNo: 1, 
        })                      
        return
    }

    // 添加音乐至列表末尾(下一首播放)
    const nextMusic = async (track) => {

        const index = musicList.value.findIndex(item => item.id === track.id);     
        try {
            if (index === -1) {
                // 歌曲不存在，添加至当前歌曲的下一首
                const url = await getTrackUrl(track.id);
                const lyric = await getTrackLyric(track.id);
                track.url = url;
                track.lyric = lyric;
                musicList.value.splice(currentIndex.value + 1, 0, track);
                console.log('歌曲不存在，添加至当前歌曲的下一首');
            } else {
                // 歌曲已存在，调整位置
                const target = musicList.value[index]; // 获得目标歌曲
                if (index !== currentIndex.value) { // 目标歌曲不为当前歌曲
                    if(index < currentIndex.value) {
                        musicList.value.splice(index, 1); // 删除目标歌曲
                        musicList.value.splice(currentIndex.value, 0, target); // 插入至当前歌曲前
                        console.log('歌曲已存在，将在播放完当前歌曲后播放');
                        return;
                    }
                    musicList.value.splice(index, 1); // 删除目标歌曲
                    musicList.value.splice(currentIndex.value + 1, 0, target); // 插入至当前歌曲后
                    console.log('歌曲已存在，将在播放完当前歌曲后播放');
                }
            }
        } catch (err) {
            console.log('处理歌曲失败', err);
        }
    }

    // 切换音乐(下一首/上一首)
    const switchMusic = async (step) => {
        let msg = "";
        // 确保音乐列表不为空，避免除以零的错误
        if (musicList.value.length === 0) {
            isPlaying.value = false;
            msg = "音乐列表为空，无法播放音乐"
            return msg;
        }

        const oldIndex = currentIndex.value
        // 更新当前索引
        switch (loop.value) {
            case 0:
                localPlayer.value.currentTime = 0; // 重置播放时间
                localPlayer.value.play()
                break;
            case 1:       
            currentIndex.value = (currentIndex.value + step + musicList.value.length) % musicList.value.length; // 顺序播放         
                if(oldIndex === currentIndex.value) {
                    localPlayer.value.currentTime = 0; // 重置播放时间
                    localPlayer.value.play()
                    return;
                }                
                pushMusicToList(musicList.value[currentIndex.value]) 
                break;
            case 2:
                currentIndex.value = Math.floor(Math.random() * musicList.value.length); // 随机播放
                if(oldIndex === currentIndex.value) {
                    localPlayer.value.currentTime = 0; // 重置播放时间
                    localPlayer.value.play()
                    return;
                }
                pushMusicToList(musicList.value[currentIndex.value]) 
                break;
            default:
                console.error("无效的播放模式。");
                return;
        }
         
    }

    // 获取音乐Url
    const getTrackUrl = async (id) => {
        if(!id) return null
        try {
            const res = await getSongUrl(id)
            return res.data.data[0].url
        }catch(err) {
            console.log('获取音乐Url失败',err)
        }        
    }

    // 获取音乐歌词
    const getTrackLyric = async (id) => {
        if(!id) return null
        try {
            const res = await getLyric(id)
            const lyric = useLyric(res.data.lrc.lyric)
            return lyric
        }catch(err) {
            console.log('获取音乐歌词失败',err)
        }        
    }
    
    // 获取评论数据
    const getCommentsData = async ({id, type, sortType, pageSize, pageNo, cursor}) => {
        try {                                    
            switch(type){
                case 0:                    
                    // 当前分类停留在trackSortType且是当前歌曲的评论，则不请求数据
                    if(trackComments.value[trackSortType.value] && trackComments.value[0] === id) {
                        break;
                    }
                    const res = await getComments(id, type, sortType, pageSize, pageNo, cursor)
                    if(res.data.code !== 200){
                        throw new Error('获取评论失败',res.data.msg)
                    }                
                    trackComments.value[0] = id
                    trackComments.value[trackSortType.value] = res.data.data.comments
                    
                    total.value = res.data.data.totalCount 
                    break;
                case 1:
                    break;
                case 2: // 歌单评论
                    // 当前分类停留在albumSortType且是当前歌单的评论，则不请求数据
                    if(albumComments.value[albumSortType.value] && albumComments.value[0] === id) {
                        break;
                    }
                    const albumRes = await getComments(id, type, sortType, pageSize, pageNo, cursor)
                    if(albumRes.data.code !== 200){
                        throw new Error('获取评论失败',albumRes.data.msg)
                    }
                    albumComments.value[0] = id
                    albumComments.value[albumSortType.value] = albumRes.data.data.comments                            
                    break;
                default:
                    console.error('无效的评论类型')
                    break;
            }                       
            
        } catch (error) {
            throw error
        }
    }

    // 获取更多评论
    const getMoreComments = async ({type, sortType, pageSize, pageNo, cursor}) => {
        try {                                    
            switch(type){
                case 0:          
                    // 如果后台且歌了，保证id为指定歌曲的评论
                    const id = trackComments.value[0]                      
                    const res = await getComments(id, type, sortType, pageSize, pageNo, cursor)
                    if(res.data.code !== 200){
                        throw new Error('获取评论失败',res.data.msg)
                    }               
                    trackComments.value[trackSortType.value].push(...res.data.data.comments)
                    total.value = res.data.data.totalCount 
                    break;
                case 1:
                    break;
                case 2:
                    const albumId = albumComments.value[0]
                    const albumRes = await getComments(albumId, type, sortType, pageSize, pageNo, cursor)
                    if(albumRes.data.code !== 200){
                        throw new Error('获取评论失败',albumRes.data.msg)
                    }
                    albumComments.value[albumSortType.value].push(...albumRes.data.data.comments)                            
                    break;
                default:
                    console.error('无效的评论类型')
                    break;
            }                       
            
        } catch (error) {
            throw error
        }
    }

    // 获取楼中楼评论数据
    const getFloorCommentsData = async ({id, type, parentCommentId, limit, time}) => {
        try {
            const res = await getFloorComments(id, type, parentCommentId, limit, time)
            if(res.data.code !== 200){
                throw new Error('获取子评论失败',res.data.msg)
            }
            return res.data.data
        } catch (error) {            
            console.log('Error:',error)
        }
    }

    // 删除/发送/回复评论
    const handleComment = async ({id, type, commentId, t, content}) => {
        try {
            if(!isLogin.value || !cookie.value) {
                return Promise.reject('请先登录')
            }
            const res = await operateComment(id, type, commentId, t, content, cookie.value)
            
            if(res.data.code !== 200){
                throw new Error('操作评论失败',res.data.msg)
            }
            return res.data.comment? res.data.comment : true
        }catch(err) {
            console.log('操作评论失败',err.response.data.msg)
        }
    }

    // 点赞评论
    const handleLikeComment = async ({id, type, commentId, t}) => {
        try {
            if(!isLogin.value || !cookie.value) {
                return Promise.reject('请先登录')
            }
            const res = await likeComment(id, type, commentId, t, cookie.value)
            if(res.data.code !== 200){
                throw new Error('点赞评论失败',res.data.msg)
            }
            return true
        }catch(err) {
            console.log('点赞评论失败',err)
        }
    }

    // 获取默认搜索关键词
    const getDefaultSearchKey = async () => {
        try {
            const res = await defaultSearchKey()
            if(res.data.code !== 200){
                throw new Error('获取默认搜索关键词失败',res.data.msg)
            }
            const keyWord = 
                res.data.data.showKeyword ?
                res.data.data.showKeyword :
                res.data.data.realkeyword ?
                res.data.data.realkeyword :
                ''
            return keyWord
        } catch (error) {
            console.log('获取默认搜索关键词失败', error)
        }
    }

    // 获取热搜词
    const getHotSearchKey = async () => {
        try {
            const res = await getHotSearch()
            if(res.data.code !== 200){
                throw new Error('获取热搜词失败',res.data.msg)
            }
            return res.data.result.hots
        } catch (error) {
            console.log('获取热搜词失败', error)
        }
    }

    // 保存搜索历史
    const saveSearchHistory = (key) => {
        const index = historySearch.value.findIndex(item => item === key)
        if(index !== -1) {
            return
        }
        historySearch.value.unshift(key)
        if(historySearch.value.length > 10) { // 最多保存10条搜索历史
            historySearch.value.pop()
        }      
    }

    // 获取搜索建议
    const getSearchSuggestData = async (key) => {
        try {
            const res = await getSearchSuggest(key)
            if(res.data.code !== 200){
                throw new Error('获取搜索建议失败',res.data.msg)
            }
            return res.data.result.allMatch ? res.data.result.allMatch : []
        } catch (error) {
            console.log('获取搜索建议失败', error)
        }
    }

    // 搜索资源
    const searchResource = async ({keywords, limit, offset, type}) => {
        try {
            const res = await searchSongs(keywords, limit, offset, type)
            if(res.data.code !== 200){
                throw new Error('搜索资源失败',res.data.msg)
            }
            switch(type){
                case 1:
                    return {
                        songs: res.data.result.songs,
                        songCount: res.data.result.songCount,
                    };
                case 10:
                    return;
                case 100:
                    return;
                case 1000:
                    return;
                case 1002:
                    return;
                case 1004:
                    return;
                case 1006:
                    return;
                case 1009:
                    return;
                case 1014:
                    return;
                case 1018:
                    return;
                case 2000:
                    return;
                default:
                    console.error('无效的搜索类型')
                    break;
            }            
        }catch(err) {
            console.log('搜索资源失败',err)
        }
    }

    watch(historySearch, (newVal) => {
        localStorage.setItem("historySearch", JSON.stringify(newVal));
    }, { deep: true });
    return { 
        localPlayer,
        musicList, 
        currentIndex, 
        isPlaying, 
        volume, 
        loop, 
        currentTime, 
        duration, 
        progress,
        isDragging,
        albumCaches, 
        maxCacheCount, 
        total,
        trackSortType,
        trackComments,
        albumComments,
        albumSortType,
        historySearch,
        getTrackUrl, 
        getTrackLyric, 
        setMusicList, 
        pushMusicToList,
        nextMusic,
        switchMusic,
        getCommentsData,
        getMoreComments,
        getFloorCommentsData,
        handleComment,
        handleLikeComment,
        getDefaultSearchKey,
        getHotSearchKey,
        saveSearchHistory,
        getSearchSuggestData,
        searchResource
     }
})