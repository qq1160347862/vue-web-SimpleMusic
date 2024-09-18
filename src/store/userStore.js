import { defineStore } from "pinia";
import { ref, watch } from "vue";
import { getQrcode, getQrcodeImg, checkQrcode, getLoginStatus, logout } from "../request/musicApi/login";
import { getUserDetail } from "../request/musicApi/user";
let loginTimer = null;
export const useUserStore = defineStore("user", () => {
    const isLogin = ref(JSON.parse(localStorage.getItem("isLogin") || false));
    const userInfo = ref(JSON.parse(localStorage.getItem("userInfo") || null));
    const cookie = ref(JSON.parse(localStorage.getItem("cookie") || null));

    // 该函数用于处理二维码登录流程
    // 参数:
    // - imgId: 二维码图片的 DOM 元素 ID
    // - imgText: 二维码状态文本的 DOM 元素 ID
    const qrLogin = async ({imgDom, imgTextDom}) => {
        imgTextDom.innerText = "请扫描二维码登录";
        const res = await getQrcode();
        const qrkey = res.data.data.unikey;
        const res2 = await getQrcodeImg(qrkey);
        const imgUrl = res2.data.data.qrimg;
        imgDom.src = imgUrl;
        return new Promise((resolve, reject) => {
            loginTimer = setInterval(async () => {
                const qrStatus = await checkQrcode(qrkey);
                if ( qrStatus.data.code === 800 ){
                    // message:"二维码不存在或已过期"                    
                    reject("二维码不存在或已过期")
                    clearInterval(loginTimer)
                }
                else if ( qrStatus.data.code === 801 ){
                    imgTextDom.innerText = "等待扫码";                
                }
                else if ( qrStatus.data.code === 802 ){
                    // message:"授权中"
                    // nickname:"XXX"
                    imgTextDom.innerText = '等待确定';
                }
                else if ( qrStatus.data.code === 803 ){
                    // message:"授权成功"                    
                    imgTextDom.innerText = '登录成功';
                    isLogin.value = true;
                    cookie.value = qrStatus.data.cookie;
                    const res3 = await getLoginStatus(cookie.value);                                     
                    const uid = res3.data.data.profile.userId;
                    const res4 = await getUserDetail(uid);
                    userInfo.value = res4.data; 

                    resolve('ok')
                    clearInterval(loginTimer)
                }else {
                    reject("未知原因,登录失败")
                }
            }, 3000)
        })
        
    }
    const abortLogin = () => {
        clearInterval(loginTimer)
    }
    watch(isLogin, (newVal) => {
        localStorage.setItem("isLogin", JSON.stringify(newVal));
    }, { deep: true });

    watch(userInfo, (newVal) => {
        localStorage.setItem("userInfo", JSON.stringify(newVal));
    },{ deep: true });

    watch(cookie, (newVal) => {
        localStorage.setItem("cookie", JSON.stringify(newVal));
    },{ deep: true });
    return { isLogin, userInfo, cookie, qrLogin, abortLogin }
})