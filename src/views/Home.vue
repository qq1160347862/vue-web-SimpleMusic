<template> 
    <div class="home-layout" v-animate="{
        animateClass: 'fadeInTop'
    }">
        <div class="home-content" 
            ref="homeContent"
            v-hover="{
                enterClass: 'show-scrollbar',
                leaveClass: 'show-scrollbar',
            }">
            <div class="scroll-panel">
                <div class="welcome-warp no-select">
                    <div class="welcome-content">
                        <p class="welcome-text">Hi!🥳</p>
                        <p class="welcome-text">I'm <span class="Web-Developer-Name">Yulily.</span></p>
                        <p class="welcome-text" style="font-size: 32px;">A Web Developer.</p>
                        <div class="contacter-warp">
                            <p class="contacter-text">
                                <CursorText 
                                    :cursorColor="'#fff'" 
                                    :size="16"
                                    :cursorWidth="2" 
                                    :text="markContent" 
                                    v-model:showCursor="showCursor" 
                                    :speed="200" 
                                    :reverse="true" />
                            </p>
                            <ul class="contacter-list">
                                <li class="contacter-item">
                                    <Button :configuration="ButtonConfig" :redirect="'https://www.baidu1.com'">
                                        <template #text>
                                            <i class="iconfont icon-QQ"></i>
                                        </template>
                                    </Button>
                                </li>
                                <li class="contacter-item">
                                    <Button :configuration="ButtonConfig" :redirect="'https://www.baidu2.com'">
                                        <template #text>
                                            <i class="iconfont icon-github-fill"></i>
                                        </template>
                                    </Button>
                                </li>
                                <li class="contacter-item">
                                    <Button :configuration="ButtonConfig" :redirect="'https://www.baidu3.com'">
                                        <template #text>
                                            <i class="iconfont icon-email"></i>
                                        </template>
                                    </Button>
                                </li>                                
                            </ul>
                        </div>
                    </div>
                    <div class="Web-Developer-Info-warp" v-animate="{
                        name: 'moveUpDown',
                        duration: 2,
                        delay: 0.5,
                        timingFunction: 'ease-in-out',
                        direction: 'alternate-reverse',
                        iterationCount: 'infinite',
                    }">
                        123                                                
                    </div>                    
                </div> 
                <div class="func-warp">
                    <div class="weather-warp">
                        <Weather />
                    </div>                    
                    
                </div>                
                <div class="timeline-warp">
                    <TimeLine 
                        :scrollDom="$refs.homeContent"
                        :background="false"
                        :data="timelineData"/>
                </div> 
            </div>
            <div class="calendar-warp" v-animate="{
                        name: 'moveUpDown',
                        duration: 2,
                        delay: 0.5,
                        timingFunction: 'ease-in-out',
                        direction: 'alternate-reverse',
                        iterationCount: 'infinite',
                    }">
                <Calendar :size="240" :img-list="imgList" />
            </div>            
            <BackTop :query="'.home-content'" />
        </div>        
    </div>
</template>

<script setup>
import { ref } from "vue";
import Calendar from "../components/Calendar.vue";
import TimeLine from "../components/TimeLine.vue";
import Button from "../components/utils/Button.vue";
import CursorText from "../components/CursorText.vue";
import BackTop from "../components/utils/BackTop.vue";
import Weather from "../components/Weather.vue";
import calendarBg1 from "@/assets/images/calendar/calendarBg1.jpg";
import calendarBg2 from "@/assets/images/calendar/calendarBg2.jpg";
import calendarBg3 from "@/assets/images/calendar/calendarBg3.gif";
import timelineData from "../assets/js/timeline";
const homeContent = ref(null)
const imgList = [calendarBg1, calendarBg2, calendarBg3]
const ButtonConfig = {
    name: 'contacter-item',
    animated: true,
    width: 36,
    height: 36,
    animated: true,
    borderRadius: getComputedStyle(document.documentElement).getPropertyValue('--border-radius-light'),    
}
const showCursor = ref(true)
const markContent = `You can contact me by:`
</script>


<style scoped>  
.home-layout {
    position: relative;
    display: flex;
    flex-direction: column;
    justify-content: center;
    padding-left: var(--main-left-padding);
    width: 100%;
    height: 100%;    
}
.home-content {
    flex-grow: 1;
    margin-top: 20px;
    overflow-y: scroll;
    display: flex;
    justify-content: flex-start;
}
.scroll-panel {
    flex-grow: 1;
    padding: 20px;
}
.welcome-warp {
    width: 100%;
    display: flex;
    align-items: center;
}
.welcome-content {
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    margin: 0 32px;
}
.welcome-text {
    color: black;
    font-size: 42px;
    font-weight: bold;
    letter-spacing: 0.8px;
    text-transform: capitalize;
    cursor: default;
}
.Web-Developer-Name {
    color: slateblue;
}
.contacter-warp {
    width: 100%;
}
.contacter-text {
    height: 16px;
    line-height: 16px;
    margin: 16px 0 8px 0;
    color: white;
    font-size: 16px;
    font-weight: bold;
    font-style: italic;
}
.contacter-list {
    width: 100%;
    padding: 8px 0;
    display: flex;
    justify-content: flex-start;
    align-self: center;
}
.contacter-item {
    margin-right: 16px;
}
.contacter-item .iconfont {
    font-size: 16px;
}


.Web-Developer-Info-warp {
    height: 300px;
    flex-grow: 1;
    background-color: rgba(255, 255, 255, 0.3);
    backdrop-filter: blur(1px);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: flex-start;
    border-radius: var(--border-radius-light);
    box-shadow: 0 0 10px rgba(0,0,0,0.1);   
    overflow: hidden; 
}

.func-warp {
    margin-top: 48px;
    width: 100%;
    display: flex;
    flex-wrap: wrap;
    gap: 24px;

}
.weather-warp {
    width: 300px;
}
.calendar-warp {
    position: sticky;
    top: 0;
    padding: 20px;
}

.timeline-warp {
    margin-top: 48px;
    width: 100%;
    height: 1200px;
}



/* 滚动条默认隐藏 */
::-webkit-scrollbar {
    width: 4px; /* 滚动条宽度 */
}
::-webkit-scrollbar-track {
    background: transparent;
    border-radius: 2px; /* 轨道圆角 */
}
::-webkit-scrollbar-thumb {
    background: transparent;
    border-radius: 2px; /* 滚动条滑块圆角 */
}
::-webkit-scrollbar-thumb:hover {
    background: transparent;
}
/* 滚动时显示滚动条 */
.home-content.show-scrollbar::-webkit-scrollbar {
    width: 4px; /* 滚动条宽度 */
}
.home-content.show-scrollbar::-webkit-scrollbar-track {
    background: var(--main-scrollbal-track-bg-color); /* 滚动条轨道背景色 */
    border-radius: 2px;
}
.home-content.show-scrollbar::-webkit-scrollbar-thumb{
    background: var(--main-scrollbal-thumb-bg-color); /* 滚动条滑块颜色 */
    border-radius: 2px;
}
.home-content.show-scrollbar::-webkit-scrollbar-thumb:hover{
    background: var(--main-scrollbal-thumb-hover-bg-color); /* 滚动条滑块悬停颜色 */
}
</style>