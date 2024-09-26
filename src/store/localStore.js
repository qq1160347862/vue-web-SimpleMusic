import { defineStore } from "pinia";
import { setActivePinia, createPinia } from 'pinia';
import { useUserStore } from "./userStore";
import { storeToRefs } from 'pinia';
import { ref, shallowRef, toRefs } from "vue";
import { getSongUrl, getLyric} from '@/request/musicApi/songs'
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
        trackComments.value = []        
        const index = musicList.value.findIndex((item) => {
            return item.id === track.id
        })

        if (index === -1) {
            // 歌曲不存在，添加至列表
            const url = await getTrackUrl(track.id)
            const lyric = await getTrackLyric(track.id)            
            track.url = url
            track.lyric = lyric
            musicList.value.push(track)
            currentIndex.value = musicList.value.length - 1
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
        
        currentIndex.value = index
        await getCommentsData({
            id: musicList.value[currentIndex.value].id, 
            type: 0, 
            sortType: trackSortType.value, 
            pageSize: 20, 
            pageNo: 1, 
        })                      
        console.log('歌曲已存在，切换至已存在的歌曲',currentIndex.value); 
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
                case 2:
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
            console.log('操作评论失败',err)
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
        trackSortType,
        trackComments,
        total,
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
        handleLikeComment
     }
})