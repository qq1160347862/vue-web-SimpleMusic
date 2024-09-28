<template>
    <nav>
        <header>
            <div class="h1">
                <i class="iconfont icon-music-circle"></i>
                <h1>music</h1>
            </div>
            <div class="func-warp">
                <div class="move-btn">
                    <button @click="router.go(-1)"><i class="iconfont icon-left"></i></button>
                    <button @click="router.go(1)"><i class="iconfont icon-right"></i></button>
                </div>
                <Input v-model:input-value="inputText" 
                @inputFunction="searchMusic" 
                :clearable="true" placeholder="Type to search..." />
            </div>
            <div class="user-warp" v-if="isLogin">
                <div class="user-avator"
                    :style="{backgroundImage: `url(${userInfo?.profile.avatarUrl})`}">
                </div> 
                <div class="user-info" v-if="userInfo?.profile">
                    <p class="user-name">{{ userInfo?.profile.nickname }}</p>
                    <div class="info-wrap">
                        <span>{{ numberFormat(userInfo?.profile.follows) }} 关注</span>
                        <span>{{ numberFormat(userInfo?.profile.followeds) }} 粉丝</span>
                        <span>Lv.{{ userInfo.level }}</span>
                    </div>
                </div>               
            </div>
            <div class="user-warp" v-else>
                <div class="user-avator no-login" @click="showDialog = true">
                    <i class="iconfont icon-custom-user"></i>
                </div>              
            </div>
        </header>
        <Dialog id="login-dialog" v-model="showDialog" @handleClose="stopLogin">
            <template #title>
                二维码登陆
            </template>
            <template #content>
                <img id="qrimg" v-show="showQrImg">
                <div class="qrimg" :style="{'backgroundImage': `url(${qrImg})`}" 
                    v-show="!showQrImg" 
                    @click="login" ></div>
                <div class="qrStatus">二维码状态</div>
            </template>
        </Dialog>  
    </nav>
</template>

<script setup>
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import Input from './Input.vue';
import Dialog from '../components/utils/Dialog.vue';
import useNumberToTenThousand from '../hooks/useNumberToTenThousand'
import qrImg from '../assets/images/user/avatar-default.png'
import { useUserStore } from '@/store/userStore'
import { storeToRefs } from 'pinia';

const router = useRouter()
const userStore = useUserStore()
const { isLogin, userInfo } = storeToRefs(userStore)
const inputText = ref('')
const showDialog = ref(false);
const showQrImg = ref(false);
const numberFormat = useNumberToTenThousand()
const searchMusic = (e) => {
    console.log(e,inputText.value)
}
let imgDom = null
let imgTextDom = null
const login = async () => {
    console.log('login');
    showQrImg.value = true
    const result = await userStore.qrLogin({imgDom, imgTextDom})
    
    if(result==='ok') {
        showDialog.value = false;
        showQrImg.value = false;
    }else {
        console.log(result)
        imgTextDom.innerText = result
        showQrImg.value = false;
    }
}
const stopLogin = () => {
    userStore.abortLogin()
    showQrImg.value = false   
    imgTextDom.innerText = "二维码状态"; 
}
onMounted(() => { 
    imgDom = document.querySelector('#qrimg');
    imgTextDom = document.querySelector('.qrStatus');
})
</script>

<style scoped>  
nav {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 64px;
    background-color: transparent;
    backdrop-filter: blur(10px);
    box-shadow: var(--nav-box-shadow);
    position: sticky;
    top: 0;
    left: 0;
    right: 0;
    z-index: 1000;
}

header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: 100%;
    width: 100%;
}
.h1 {
    display: flex;
    align-items: center;
    justify-content: start;
    width: var(--sizebar-width);
    height: 100%;
    padding-left: var(--left-screen-padding);
    margin-right: 12px;
    text-align: center;
    letter-spacing: 0.8px;
    text-transform: capitalize;
}
.h1 .iconfont {
    font-size: var(--logo-icon-size);
}
.h1 h1 {
    margin-left: 4px;
    font-size: var(--logo-text-size);
    cursor: default;
}
.func-warp {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 600px;
    height: 100%;
    margin-right: auto;
}
.move-btn {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 84px;
    height: 48px;
}
.move-btn button{
    width: 36px;
    height: 36px;
    border: none;
    border-radius: var(--border-radius-light);
    background-color: var(--nav-move-btn-bg-color);
    transition: all 0.3s;
    cursor: pointer;
}
.move-btn button:hover {
    background-color: var(--nav-move-btn-hover-bg-color);
}
.move-btn .iconfont {
    font-size: 32px;
    color: var(--nav-move-btn-color);
}

.user-warp {
    height: 150%;
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    
    margin: 0 16px;
}
.user-avator {
    width: 48px;
    height: 48px;
    border-radius: 50%;
    background-repeat: no-repeat;
    background-size: cover;
    cursor: pointer;
    transition: all 0.3s;
}
.no-login {
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--nav-user-info-bg-color);
}
.no-login .iconfont {
    font-size: 24px;
    color: var(--nav-user-info-color);
}
#qrimg {
    width: 144px;
    height: 144px;
    object-fit: cover;
    margin-bottom: 16px;
}
.qrimg {
    width: 144px;
    height: 144px;
    background-repeat: no-repeat;
    background-size: cover;
    margin-bottom: 16px;
    cursor: pointer;
}
.user-info {
    position: absolute;
    display: flex;
    align-items: center;
    justify-content: start;
    flex-direction: column;
    padding: 4px 0;
    bottom: 0;
    right: 0;
    width: 160px;
    height: 100px;
    border-radius: var(--border-radius-light);
    background-color: var(--nav-user-info-bg-color);
    transform: translateY(85%);
    transition: all 0.3s ease-out;
    opacity: 0;
    pointer-events: none;

}
.user-info::before {
    content: "";
    position: absolute;
    width: 0;
    height: 0;
    border-left: 10px solid transparent;
    border-right: 10px solid transparent;
    border-bottom: 10px solid #ccc;
    top: -6px;
    right: 12px;
}
.user-info::after {
    content: '';
    position: absolute;
    width: 0;
    height: 0;
    border-left: 10px solid transparent;
    border-right: 10px solid transparent;
    border-bottom: 10px solid #fff;
    top: -6px;
    right: 12px;
}
.user-warp:hover .user-info {
    transform: translateY(92%);
    opacity: 1;
    pointer-events: auto;
}
.user-info:hover {
    transform: translateY(92%);
    opacity: 1;
    pointer-events: auto;
}
.user-info .user-name {        
    width: 100%;
    margin-top: 16px;
    padding: 0 16px;
    text-align: center;
    font-size: 16px;
    font-weight: bold;
    text-overflow: ellipsis;
    overflow: hidden;
    white-space: nowrap;
    
}
.user-info .info-wrap {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 48px;
    width: 100%;
    color: var(--nav-user-info-color);
    font-size: 10px;
}
.user-info .info-wrap span {
    margin: 0 8px;
}
</style>