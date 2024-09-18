import { defineStore } from "pinia";
import { ref, shallowRef, toRefs } from "vue";
import { getSongUrl, getLyric} from '@/request/musicApi/songs'
import useLyricParse from "../hooks/useLyricParse";
const useLyric = useLyricParse()

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
    }

    // 添加音乐至列表末尾(播放)
    const pushMusicToList = async (track) => {

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
            isPlaying.value = true
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
        isPlaying.value = true        
        
        console.log('歌曲已存在，切换至已存在的歌曲',currentIndex.value); 
        return
    }

    // 添加音乐至列表末尾(下一首播放)
    const nextMusic = async (track) => {
        
        const index = musicList.value.findIndex((item) => {
            return item.id === track.id
        })
        
        if (index === -1) {
            // 歌曲不存在，添加至当前歌曲的下一首
            const url = await getTrackUrl(track.id)
            const lyric = await getTrackLyric(track.id)            
            track.url = url
            track.lyric = lyric
            musicList.value.splice(currentIndex.value + 1, 0, track)   
            console.log('歌曲不存在，添加至当前歌曲的下一首');          
            return
        }

        // 歌曲已存在，调整位置   
        const target = musicList.value[index]   // 获得目标歌曲
        if (index === currentIndex.value) return // 目标歌曲为当前歌曲，不做任何操作
        if (index < currentIndex.value) {
            // 目标歌曲在当前歌曲之前，插入到当前歌曲之后
            musicList.value.splice(index,1)
            musicList.value.splice(currentIndex.value + 1, 0, target)
            currentIndex.value--
        } else {
            // 目标歌曲在当前歌曲之后，插入到当前歌曲之后
            musicList.value.splice(index,1)
            musicList.value.splice(currentIndex.value + 1, 0, target)
        }        
        console.log('歌曲已存在，将在播放完当前歌曲后播放'); 
        return
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

        // 更新当前索引
        switch (loop.value) {
            case 0:
                player.value.currentTime = 0; // 重置播放时间
                break;
            case 1:
                currentIndex.value = (currentIndex.value + step + musicList.value.length) % musicList.value.length; // 顺序播放
                break;
            case 2:
                currentIndex.value = Math.floor(Math.random() * musicList.value.length); // 随机播放
                break;
            default:
                console.error("无效的播放模式。");
                return;
        }

        // 重新播放
        pushMusicToList(musicList.value[currentIndex.value])  
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
            console.log(lyric);
            
            return lyric
        }catch(err) {
            console.log('获取音乐歌词失败',err)
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
        getTrackUrl, 
        getTrackLyric, 
        setMusicList, 
        pushMusicToList,
        nextMusic,
        switchMusic }
})