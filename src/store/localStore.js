import { defineStore } from "pinia";
import { setActivePinia, createPinia } from 'pinia';
import { useUserStore } from "./userStore";
import { storeToRefs } from 'pinia';
import { nextTick, ref, shallowRef, watch } from "vue";
import { getSongUrl, getLyric, defaultSearchKey, getSearchSuggest, getHotSearch, searchSongs} from '@/request/musicApi/songs'
import { getComments, getFloorComments, operateComment, likeComment } from "@/request/musicApi/comment";
import useLyricParse from "../hooks/useLyricParse";
import useDeepClone from "../hooks/useDeepClone";
import coverImgUrl from '@/assets/images/playList/default-coverImg.jpg'
import avatarUrl from '@/assets/images/user/avatar-default.png'

const HISTORYSEARCH = "historySearch"
const LOCALPLAYLIST = "localPlayList"
const LOCALTAGS = "localTags"


const useLyric = useLyricParse()
// 通过使用setActivePinia来激活Pinia仓库，因为pinia的创建是在app.mount之后的 
setActivePinia(createPinia())
const userStore = useUserStore()
const { isLogin, cookie } = storeToRefs(userStore)
const deepClone = useDeepClone()

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
    const maxCacheCount = ref(10);

    const total = ref(0)
    const trackComments = ref([])    
    const trackSortType = ref(1)
    const albumComments = ref([])
    const albumSortType = ref(1)

    const historySearch = ref(JSON.parse(localStorage.getItem(HISTORYSEARCH)) || [])
    const localPlayList = ref(JSON.parse(localStorage.getItem(LOCALPLAYLIST)) || [])
    const localTags = ref(JSON.parse(localStorage.getItem(LOCALTAGS)) || [])


    // 音乐列表覆盖
    const setMusicList = async (list) => {
        if(list.length === 0) return
        // 这里使用深拷贝，避免操作musicList影响到list的来源
        musicList.value = deepClone(list)
        const defaultIndex = 0
        // 列表覆盖时，若当前索引与默认播放索引一致，则更改播放状态
        if (currentIndex.value === defaultIndex){
            currentIndex.value = -1
            nextTick(() => {
                currentIndex.value = defaultIndex
            })
            return
        }
        // 默认播放第一个歌曲
        currentIndex.value = defaultIndex
    }

    // 添加音乐至列表
    const addMusicToList = async (track, location = 'end') => {

        isPlaying.value = true
        const index = musicList.value.findIndex((item) => {
            return item.id === track.id
        })

        if (index === -1) {
            // 歌曲不存在，添加至列表
            const url = await getTrackUrl(track.id)
            const lyric = await getTrackLyric(track.id)            
            track.url = url
            track.lyric = lyric

            if(location === 'end') {
                musicList.value.push(track)
                currentIndex.value = musicList.value.length - 1
            }else if (location === 'current') {
                musicList.value.splice(currentIndex.value + 1, 0, track)
                currentIndex.value = currentIndex.value + 1
            }else if (location === 'start') {
                musicList.value.unshift(track)
                currentIndex.value = 0
            }else {
                console.error('无效的位置参数')
            }
            return
        }
        currentIndex.value = index            
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
                        currentIndex.value = currentIndex.value - 1; // 调整当前索引
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

    // 音乐播放/暂停
    const togglePlay = () => {

        // 确保音乐列表不为空，避免除以零的错误
        if (musicList.value.length === 0) {            
            return false;
        }

        // 歌单有音乐，但是当前播放索引为-1，则默认播放第一个歌曲
        if (currentIndex.value === -1) {
            currentIndex.value = 0
            return true;
        }

        if (isPlaying.value) {
            isPlaying.value = false;
        } else {
            isPlaying.value = true;
        }

        return true;
    }

    // 切换音乐(下一首/上一首)
    const switchMusic = (step) => {
        // 确保音乐列表不为空，避免除以零的错误
        if (musicList.value.length === 0) {
            isPlaying.value = false;
            return false;
        }

        // 歌单有音乐，但是当前播放索引为-1，则默认播放第一个歌曲
        if (currentIndex.value === -1) {            
            currentIndex.value = 0
            return true;
        }

        const oldIndex = currentIndex.value;
        // 更新当前索引
        switch (loop.value) {
            case 0:        
                localPlayer.value.currentTime = 0; // 重置播放时间                
                isPlaying.value = true   
                break;
            case 1:       
                currentIndex.value = (currentIndex.value + step + musicList.value.length) % musicList.value.length; // 顺序播放  
                if (oldIndex === currentIndex.value) {
                    localPlayer.value.currentTime = 0; // 重置播放时间
                    isPlaying.value = true   
                }                                                      
                break;
            case 2:
                currentIndex.value = Math.floor(Math.random() * musicList.value.length); // 随机播放   
                if (oldIndex === currentIndex.value) {
                    localPlayer.value.currentTime = 0; // 重置播放时间
                    isPlaying.value = true   
                }             
                break;
            default:
                console.error("无效的播放模式。");
                return false;
        }
        return true;
    }

    // 删除音乐
    const removeMusicFromList = (track) => {
        const index = musicList.value.findIndex(item => item.id === track.id);
        if(index !== -1) {
            musicList.value.splice(index, 1)
            if(index < currentIndex.value) {
                currentIndex.value = currentIndex.value - 1
            }
            // 删除后，如果列表为空，则停止播放
            if(musicList.value.length === 0) {
                isPlaying.value = false
                currentIndex.value = -1
            }
        }
    }

    // 切换播放模式
    const toggleLoop = () => {        
        const modes = ['单曲循环', '顺序播放', '随机播放'];
        loop.value = (loop.value + 1) % modes.length; // 计算下一个播放模式   break;  
        const msg = `已切换为${modes[loop.value]}`;      
        return msg;
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



    // 创建本地歌单
    const createLocalPlaylist = (config) => {
        const { name, description, tags } = config
        const createTime = new Date().getTime()
        const updateTime = createTime
        const tracks = []
        const trackCount = 0
        const creator = {
            nickname: '本地歌单',
            avatarUrl,
        }
        const detail = {
            name,
            creator,
            description,
            tags,
            coverImgUrl,
            trackCount,
            createTime,
            updateTime,
        }
        const id = parseInt(`${createTime.toString().substring(0, 8)}`+`${Math.floor(Math.random() * 100)}`)
        localPlayList.value.push({
            id,
            detail,
            tracks,
        })
        return id
    }

    // 获取指定id的本地歌单
    const getLocalPlaylist = (id) => {
        id = typeof id === 'string'?+id:id
        const index = localPlayList.value.findIndex(item => item.id === id)
        if(index !== -1) {
            return localPlayList.value[index]
        }
        return null
    }

    // 删除指定id的本地歌单
    const deleteLocalPlaylist = (id) => {
        const index = localPlayList.value.findIndex(item => item.id === id)
        if(index !== -1) {
            localPlayList.value.splice(index, 1)
        }
    }

    // 更新指定id的本地歌单
    const updateLocalPlaylist = (id, config) => {
        const index = localPlayList.value.findIndex(item => item.id === id)
        if(index !== -1) {
            const { name, description, tags } = config
            const updateTime = new Date().getTime()
            const detail = {
                name,
                description,
                tags,
                updateTime,
            }
            Object.assign(localPlayList.value[index].detail, detail)
        }
    }

    // 指定id歌单添加歌曲
    const addTrackToLocalPlaylist = (id, track) => {
        const index = localPlayList.value.findIndex(item => item.id === id);
        if (index === -1) {
            return null;
        }
        const playlist = localPlayList.value[index];
        if (playlist.tracks.findIndex(item => item.id === track.id) !== -1) {
            return null;
        }
        playlist.tracks.push(track);
        playlist.detail.trackCount++;
        return true;
    }

    // 指定id歌单删除歌曲
    const deleteTrackFromLocalPlaylist = (id, trackId) => {
        const index = localPlayList.value.findIndex(item => item.id === +id);
        if (index === -1) {
            return null;
        }
        const playlist = localPlayList.value[index];
        const trackIndex = playlist.tracks.findIndex(item => item.id === trackId);
        if (trackIndex === -1) {
            return null;
        }
        playlist.tracks.splice(trackIndex, 1);
        playlist.detail.trackCount--;
        return true;
    }



    watch(currentIndex, async (newVal, oldVal) => {
        if(newVal !== -1) {
            const track = musicList.value[newVal]
            if(!track.url) {
                const url = await getTrackUrl(track.id)
                track.url = url
            }
            if(!track.lyric) {
                const lyric = await getTrackLyric(track.id)
                track.lyric = lyric
            }
            await getCommentsData({
                id: musicList.value[currentIndex.value].id, 
                type: 0, 
                sortType: trackSortType.value, 
                pageSize: 20, 
                pageNo: 1, 
            })
            isPlaying.value = true 
        }
    })
    watch(isPlaying, (newVal) => {
        if(newVal) {
            localPlayer.value.play()
        } else {
            localPlayer.value.pause()
        }
    })



    watch(historySearch, (newVal) => {
        localStorage.setItem(HISTORYSEARCH, JSON.stringify(newVal));
    }, { deep: true });
    watch(localPlayList, (newVal) => {
        localStorage.setItem(LOCALPLAYLIST, JSON.stringify(newVal));
    }, { deep: true });
    watch(localTags, (newVal) => {
        localStorage.setItem(LOCALTAGS, JSON.stringify(newVal));
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
        localPlayList,
        localTags,
        getTrackUrl, 
        getTrackLyric, 
        setMusicList, 
        addMusicToList,
        nextMusic,
        togglePlay,
        switchMusic,
        removeMusicFromList,
        toggleLoop,
        getCommentsData,
        getMoreComments,
        getFloorCommentsData,
        handleComment,
        handleLikeComment,
        getDefaultSearchKey,
        getHotSearchKey,
        saveSearchHistory,
        getSearchSuggestData,
        searchResource,
        createLocalPlaylist,
        getLocalPlaylist,
        deleteLocalPlaylist,
        updateLocalPlaylist,
        addTrackToLocalPlaylist,
        deleteTrackFromLocalPlaylist,
     }
})