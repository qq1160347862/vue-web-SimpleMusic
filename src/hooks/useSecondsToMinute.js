const useSecondsToMinute = ()=> {
    const formatTime = (seconds) =>{
         // 计算小时、分钟和剩余的秒数
        let hours = Math.floor(seconds / 3600);
        let minutes = Math.floor((seconds % 3600) / 60);
        let remainingSeconds = Math.floor(seconds) % 60;

        // 将小时、分钟和秒数格式化为两位数
        let formattedHours = String(hours).padStart(2, '0');
        let formattedMinutes = String(minutes).padStart(2, '0');
        let formattedSeconds = String(remainingSeconds).padStart(2, '0');

        return hours>0?`${formattedHours}:${formattedMinutes}:${formattedSeconds}`:`${formattedMinutes}:${formattedSeconds}`;
    }

    return formatTime
}

export default useSecondsToMinute