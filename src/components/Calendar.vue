<template> 
    <div class="calendar-container no-select" ref="container">
        <div class="calendar-header">
            <div class="bg-mask"></div>
            <div class="bg-area" ref="bgArea">
                <div class="bg"
                v-for="(img,index) in bgList" 
                :key="index" :style="{backgroundImage:`url(${img})`}"></div>   
            </div>
            <div class="arrow-left" @click="leftNext"><i class='iconfont icon-left'></i></div>
            <div class="arrow-right" @click="rightNext"><i class='iconfont icon-right' ></i></div>
            <div class="day">{{`${new Date().getFullYear()}年${new Date().getMonth() + 1}月${new Date().getDate()}日`}}</div>
            <div class="time">{{ `北京时间:${time}` }}</div> 
        </div>
        <table class="calendar-table">
            <thead>
                <tr>
                    <td>Mon</td>
                    <td>Tue</td>
                    <td>Wed</td>
                    <td>Thu</td>
                    <td>Fri</td>
                    <td>Sat</td>
                    <td>Sun</td>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td v-for="i in 7" 
                    :key="i" :class="{'prev-month':dateList[i - 1].month===-1,
                    'current-day':dateList[i - 1].isToday}">
                        {{ dateList[i - 1].day }}
                    </td>
                </tr>
                <tr>
                    <td v-for="i in 7" 
                    :key="i" :class="{'prev-month':dateList[i - 1 + 7].month===-1,
                    'current-day':dateList[i - 1 + 7].isToday}">
                        {{ dateList[i - 1 + 7].day }}
                    </td>
                </tr>
                <tr>
                    <td v-for="i in 7" 
                    :key="i" :class="{'current-day':dateList[i - 1 + 14].isToday}">
                        {{ dateList[i - 1 + 14].day }}
                    </td>
                </tr>
                <tr>
                    <td v-for="i in 7" 
                    :key="i" :class="{'current-day':dateList[i - 1 + 21].isToday}">
                        {{ dateList[i - 1 + 21].day }}
                    </td>
                </tr>
                <tr>
                    <td v-for="i in 7" 
                    :key="i" :class="{'current-day':dateList[i - 1 + 28].isToday,
                    'next-month':dateList[i -1 + 28].month===1}">
                        {{ dateList[i - 1 + 28].day }}
                    </td>
                </tr>
                <tr>
                    <td v-for="i in 7" 
                    :key="i" :class="{'current-day':dateList[i - 1 + 35].isToday,
                    'next-month':dateList[i -1 + 35].month===1}">
                        {{ dateList[i - 1 + 35].day }}
                    </td>
                </tr>
            </tbody>
        </table>
    </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from "vue";

const defaultSize = 520;
const container = ref(null);
const props = defineProps({
    size: {
        type: Number,
        required: false,
        default: defaultSize
    },
    imgList: {  
        type: Array,
        required: false,
        default: ()=>['']
    }
});
const calendarSize = props.size<150?150:props.size          // 限制日历组件的最小迟尺寸
// 日历背景图列表
const bgList = props.imgList

// 初始化日历尺寸
const radio = calendarSize / defaultSize
const initCalendarSize = () => {
    // 向css中添加变量
    container.value.style.setProperty('--calendar-size', `${calendarSize}px`)
    container.value.style.setProperty('--radio', `${radio}`+'')

}

const bgArea = ref(null)
const offsetX = calendarSize // 背景位移为日历宽度
let curIndex = 0 // 记录当前背景索引
// 复制最后一张至最前，第一张至最后，用于无缝切换
const initBgDom = ()=>{
    // 复制第一张图
    const first = bgArea.value.firstElementChild.cloneNode(true)
    // 复制第二张图
    const last = bgArea.value.lastElementChild.cloneNode(true)
    // 将第一张图放到末尾
    bgArea.value.appendChild(first)
    // 将最后一张图放到最前
    bgArea.value.insertBefore(last,bgArea.value.firstElementChild)
    // 设置最后一张图为绝对定位
    last.style.position = 'absolute'
    last.style.transform = 'translateX(-100%)'
}
// 背景图切换
const moveTo = (index)=>{    
    bgArea.value.style.transform = `translateX(-${offsetX * index}px)`
    bgArea.value.style.transition = '.5s'
    curIndex = index
}
// 背景图向右
const rightNext = ()=>{
    // 此时是最后一张
    if(curIndex===bgList.length - 1){
        bgArea.value.style.transform = `translateX(${offsetX}px)`
        bgArea.value.style.transition = 'none'
        bgArea.value.clientHeight  // 强制渲染浏览器
        moveTo(0)
    }else{
        moveTo(curIndex + 1)
    }
}
// 背景图向左
const leftNext = ()=>{
    // 此时是第一张
    if(curIndex===0){
        bgArea.value.style.transform = `translateX(-${offsetX * (bgList.length)}px)`
        bgArea.value.style.transition = 'none'
        bgArea.value.clientHeight  // 强制渲染浏览器
        moveTo(bgList.length - 1)
    }else{
        moveTo(curIndex - 1)
    }
}
// 初始化日历数组
const initCalendarList = ()=>{
    // 创建一个新的Date对象，并设置为当前时间
    let currentDate = new Date();
    // 获取年份、月份和天数
    let year = currentDate.getFullYear(); // 2021
    let lastYear = year - 1
    let nextYear = year + 1
    let month = currentDate.getMonth() + 1; // 9（注意月份从0开始计算）
    let lastMonth = month - 1
    let nextMonth = month + 1
    //日历数据
    let calendarDataList = [];

    //先将这个月的日期写入数组
    let maxDaysInMonth = new Date(year, month, 0).getDate(); // 30
    for (let i = 1; i <= maxDaysInMonth; i++) {
        let curDateObj = new Date(year, month - 1, i ); // 将i+1作为第二个参数传递给Date构造函数
        calendarDataList.push({
            day: curDateObj.getDate(),
            week: curDateObj.getDay()===0?7:curDateObj.getDay(),
            month: 0,
            isToday: false // 默认不标记今天
        });
    }
    // 判断今天在日历数组中的位置，并进行标记
    calendarDataList[currentDate.getDate() - 1].isToday = true;

    //若想填满日历表，上个月和下个月分别得添加几天
    let prevCurMonthDayCount = calendarDataList[0].week - 1
    let nextCurMonthDayCount = 7 + (7 - calendarDataList[calendarDataList.length - 1].week)
    // 判断这个月是否是1月和12月，以便于添加上个月和下个月的日期
    if(month === 1){
        //添加去年12月的日期
        lastMonth = 12
        //添加下个月的日期
        nextYear = year
    }else if(month === 12){
        //添加上个月的日期
        lastYear = year
        //添加明年1月的日期
        nextMonth = 1
    }else{
        //添加上个月的日期
        lastYear = year
        //添加下个月的日期
        nextYear = year   
    }    
    let maxDaysInLastMonth = new Date(lastYear, lastMonth, 0).getDate() //上个月最后一天是多少号
    for (let i = 0,j=maxDaysInLastMonth; i < prevCurMonthDayCount; i++,j--) {
        let prevDateObj = new Date(lastYear, lastMonth - 1, j ); 
        calendarDataList.unshift({
            day: prevDateObj.getDate(),
            week: prevDateObj.getDay()===0?7:prevDateObj.getDay(),
            month: -1,
            isToday: false // 默认不标记今天
        });        
    }
    for (let i = 1; i <= nextCurMonthDayCount; i++) {
        let nextDateObj = new Date(nextYear, nextMonth - 1, i ); 
        calendarDataList.push({
            day: nextDateObj.getDate(),
            week: nextDateObj.getDay()===0?7:nextDateObj.getDay(),
            month: 1,
            isToday: false // 默认不标记今天
        });   
    }
    
    return calendarDataList

}
const dateList = initCalendarList()

onMounted(()=>{
    initCalendarSize()
    initBgDom()
    moveTo(0)   // 页面挂载时显示第一张背景图
})

// 当前日期
let time = ref(new Date().toLocaleTimeString())
// 计时器，时间流动
const timer = setInterval(()=>{
    const now = new Date()
    time.value = now.toLocaleTimeString()
},1000)
// 轮播图切换
const timer2 = setInterval(()=>{
    rightNext()
},5000)

onUnmounted(()=>{
    clearInterval(timer)
    clearInterval(timer2)
})
</script>

<style scoped>
.calendar-container {
    position: relative;
    width: var(--calendar-size);
    min-width: 150px;
    box-shadow: var(--calendar-box-shadow);
    border-radius: 8px;
}

.calendar-header{
    position: relative;
    border-radius: 8px 8px 0 0;  
    color:var(--calendar-header-color);
    height: calc(20em * var(--radio));
    width: 100%;
    overflow: hidden;
}
.calendar-header .bg-mask{
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: var(--calendar-header-mask-bg-color);
    backdrop-filter: blur(0.5px);
    z-index: 1;
}

.calendar-header .bg-area{
    position: absolute;
    top: 0;
    left: 0;
    height: 100%;
    display: flex;
    flex-direction: row;
    align-items: center;
    will-change: transform;
}

.calendar-header .bg{
    width: var(--calendar-size);
    height: 100%;
    background-size: cover;
}

.arrow-left,
.arrow-right {
    position: absolute;
    top: 50%;
    width: calc(3.6em * var(--radio));
    height: calc(3.6em * var(--radio));
    background-color: var(--calendar-header-btn-bg-color);
    border-radius: 50%;
    transition: all 0.3s ease;
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 2;
}
.arrow-left {
    left: 4%;
}
.arrow-right{
    right: 4%;
}
.arrow-left .iconfont,
.arrow-right .iconfont{
    color: var(--calendar-header-btn-color);
    font-size: calc(3.6em * var(--radio));
}
.arrow-left:hover,
.arrow-right:hover{
    background-color: var(--calendar-header-btn-hover-bg-color);
}
.arrow-left .iconfont:hover,
.arrow-right .iconfont:hover{
    color: var(--calendar-header-btn-hover-color);
}



.day {
    position: absolute;
    top: 20%;
    left: 8%;
    font-size: calc(3.2em * var(--radio));
    font-weight: 900;
    z-index: 2;
    /* line-height: 1em; */
}
.time {
    bottom: 10%;
    left: 8%;
    position: absolute;
    font-size: calc(1.6em * var(--radio));
    margin-top: calc(1em * var(--radio));
    text-transform: lowercase;
    font-weight: 600;
    z-index: 2;
    /* line-height: 1em; */
}
.current-day {
    color: var(--calendar-table-current-day-color);
    background-color: var(--calendar-table-hover-bg-color);
}

.calendar-table {
    width: 100%;
    /* background-color: var(--calendar-table-bg-color); */
    background-color: transparent;
    border-radius: 0 0 8px 8px;
    /* box-shadow: 0 2px 1px rgba(238, 13, 13, 0.2), 0 3px 1px #fff; */
    color: var(--calendar-table-current-mouth-color);
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    padding: 20px;
}
.calendar-table thead {
    color: var(--calendar-table-top-week-color);
    font-weight: 700;
    text-transform: uppercase;
}
.calendar-table td {
    width: calc(60px * var(--radio));
    height: calc(60px * var(--radio));
    border-radius: 50%;
    text-align: center;
    font-weight: 600;
    font-size: calc(17px * var(--radio));
    transition: .2s;
    
}
.calendar-table tbody td:hover{
    background-color: var(--calendar-table-hover-bg-color);
    color: var(--calendar-table-hover-color);
    font-weight: 600;
    font-size: calc(23px * var(--radio));
}
.prev-month,
.next-month {
    color: var(--calendar-table-other-mouth-color);
}
</style>