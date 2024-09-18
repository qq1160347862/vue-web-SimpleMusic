/**
 * 解析歌词字符串
 * 得到一个歌词对象的数组
 * 每个歌词对象：
 * {time:开始时间,words:歌词内容}
 * @param {*} lrc 
 * @returns array
 */
function praseLrc(lrc) {
    let lines = lrc.split('\n')
    return lines.map((e,index)=>{
        let parts = e.split(']')
        return {
            time:parseTime(parts[0].slice(1,parts[0].length)),
            words:parts[1]
        }
    })
}

/**
 * 解析时间字符串03:13.020
 * 转化成具体的秒数
 * @param {*} timeStr 
 * @returns number
 */
function parseTime(timeStr) {
    let parts = timeStr.split(':')
    return +parts[0] * 60 + +parts[1]
}

export default function useLyricParse(){
    return function parseLyric(lyric) {
        return praseLrc(lyric)
    }
}