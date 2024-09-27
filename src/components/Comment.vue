<template>
    <form v-if="isLogin"
        :id="`${name}form`"
        ref="formRef"
        @submit.stop.prevent="handleSubmit(1)" 
        class="replay-warp">
        <input v-model="inputContent" ref="inputRef":id="`${name}input`" type="text" placeholder="回车发送评论"></input>
    </form>
    <Transition name="comment">        
        <div class="comment-container" v-hover="{
            enterClass: 'show-scrollbar',
            leaveClass: 'show-scrollbar',
        }" v-show="!showSubComment">              
            <div class="select-box no-select">
                <input @click="handleRadio" type="radio" :id="`${name}Recommand`" value="1" :name="`${name}comment-type`" checked>
                <label :for="`${name}Recommand`">推荐</label>
                <input @click="handleRadio" type="radio" :id="`${name}hot`" value="2" :name="`${name}comment-type`">
                <label :for="`${name}hot`">热门</label>
                <input @click="handleRadio" type="radio" :id="`${name}new`" value="3" :name="`${name}comment-type`">
                <label :for="`${name}new`">最新</label>                
            </div>
            <Transition name="comment-list">
                <ul class="comment-scollPanel" v-show="comments[sortType]">
                    <li class="comment-item" @click="handleReplyPanel(comment)"
                        v-for="(comment, index) in comments[sortType]" :key="index">
                        <div class="comment-item-content">
                            <div class="comment-item-avatar no-select"> 
                                <img :src="comment.user.avatarUrl"  alt="user-avatar">
                            </div>
                            <div class="comment-item-info">
                                <p class="top">
                                    <span class="name">{{ comment.user.nickname }}</span>
                                    <span class="like" 
                                        @click.stop="handleLikeComment(comment)">
                                        {{ comment.likedCount }}
                                        <i v-show="!comment.liked" class="iconfont icon-like"></i>
                                        <i v-show="comment.liked" class="iconfont icon-like-fill"></i>
                                    </span>
                                    <span class="delete" v-if="uid === comment.user.userId">
                                        <i @click.stop="deleteComment(comment)" class="iconfont icon-shanchu"></i>
                                    </span>                            
                                </p>
                                <p class="center">
                                    {{ comment.content }}
                                </p>
                                <p class="bottom">
                                    <span class="create-time">{{ comment.timeStr }}</span>
                                    <span class="more-reply no-select" v-show="+comment.replyCount > 0" 
                                        @click.stop="handleShowSubComment(comment.commentId)">
                                        {{ `${comment.replyCount}条回复` }}
                                        <i class="iconfont icon-right"></i>
                                    </span>
                                </p>
                            </div>
                        </div>
                    </li>
                </ul>                
            </Transition>
            <div class="ring" v-show="comments[sortType]"></div>                      
        </div>
    </Transition>
    <Transition name="sub-comment">
        <div class="sub-comment-container" v-show="showSubComment">
            <div class="sub-comment-count no-select">
                <span>{{ `楼层评论` }}</span>
                <i class="iconfont icon-close" @click="handleCloseSubComment"></i>
            </div>
            <div class="owner-comment" @click="handleReplyPanel(subComments?.ownerComment)">
                <div class="owner-avatar no-select">
                    <img :src="subComments?.ownerComment.user.avatarUrl" alt="">
                </div>
                <div class="owner-infos">
                    <p class="top">
                        <span class="name">{{ subComments?.ownerComment.user.nickname }}</span>                    
                        <span class="delete" v-if="uid === subComments?.ownerComment.user.userId">
                            <i @click.stop="deleteComment(subComments?.ownerComment)" class="iconfont icon-shanchu"></i>
                        </span> 
                    </p>
                    <p class="center">
                        {{ subComments?.ownerComment.content }}
                    </p>
                    <p class="bottom">
                        <span class="create-time">{{ subComments?.ownerComment.timeStr }}</span>
                    </p>
                </div>
            </div>
            <div class="divide no-select">
                <span>{{ `回复(${subComments?.totalCount})` }}</span>
            </div>
            <div class="sub-comment-list-warp" v-hover="{
                enterClass: 'show-scrollbar',
                leaveClass: 'show-scrollbar',
            }">                
                <ul class="sub-comment-list">
                    <li class="sub-comment-item" @click="handleReplyPanel(subComment)"
                        v-for="(subComment, index) in subComments?.comments" :key="index">
                        <div class="sub-comment-item-avatar no-select">
                            <img :src="subComment?.user.avatarUrl" alt="">
                        </div>
                        <div class="sub-comment-item-info">
                            <p class="top">
                                <span class="name">{{ subComment?.user.nickname }}</span>
                                <span class="like" @click.stop="handleLikeComment(subComment)">
                                    {{ subComment.likedCount }}
                                    <i v-show="!subComment?.liked" class="iconfont icon-like"></i>
                                    <i v-show="subComment?.liked" class="iconfont icon-like-fill"></i>
                                </span>
                                <span class="delete" v-if="uid === subComment?.user.userId">
                                    <i @click.stop="deleteComment(subComment)" class="iconfont icon-shanchu"></i>
                                </span> 
                            </p>
                            <p class="center">{{ subComment?.content }}</p>
                            <p class="bottom">
                                <span class="create-time">{{ subComment?.timeStr }}</span>
                            </p>
                            <div class="beReplied" 
                                v-if="subComment?.beReplied[0].beRepliedCommentId !== subComments?.ownerComment.commentId">
                                <img :src="subComment?.beReplied[0].user.avatarUrl" alt="" v-if="subComment?.beReplied[0].content">
                                <span class="name" v-if="subComment?.beReplied[0].content">{{ subComment?.beReplied[0].user.nickname }}</span>
                                <span class="reply-content" v-if="subComment?.beReplied[0].content">
                                    {{ subComment?.beReplied[0].content }}
                                </span>
                                <span class="reply-content" v-else>
                                    该评论已删除
                                </span>
                            </div>
                        </div>                                                
                    </li>
                </ul>
                <div class="sub-ring" 
                    v-show="subComments?.comments && 
                    subComments?.comments.length < subComments?.totalCount"></div>
            </div>
        </div>
    </Transition>
    <Teleport to="body">
        <dialog :id="`${name}inputPanel`" v-if="isLogin">
            <div class="input-panel">
                <div class="input-warp">
                    <h2>评论</h2>
                    <div class="input-content">
                        <textarea v-model="inputContent" :id="`${name}textarea`" placeholder="请输入评论内容"></textarea>
                    </div>                    
                    <div class="input-btn-warp">
                        <button @click="handleSubmit(2)">回复</button>
                        <button @click="closeInputPanel">关闭</button>
                    </div>
                </div>
            </div>
        </dialog> 
    </Teleport>
</template>

<script setup>
import { onMounted, onUpdated, onBeforeUpdate, ref, inject, onUnmounted, watch } from 'vue';
import useDebounce from '@/hooks/useDebounce';
const props = defineProps({
    name: {
        type: String,
        required: true
    },
    isLogin: {
        type: Boolean,
        required: true
    },
    uid: {
        type: Number,
        required: true
    },
    id: {
        type: Number,
        required: true
    },
    type: {
        type: Number,
        required: true
    },
    sortType: {
        type: Number,
        required: true
    },
    comments: {
        type: Array,
        required: true
    },
    getSubComments: {
        type: Function,
        required: true
    },
    likeComment: {
        type: Function,
        required: true
    },
    handleComment: {
        type: Function,
        required: true
    }
})
const emit = defineEmits(['switchSortType', 'loadComments'])
const message = inject('message')
const showSubComment = ref(false)
const subComments = ref(null)
const inputContent = ref('')
const oldId = ref(null)
const currentCId = ref(null)
const currentC = ref(null)
const floorCid = ref(null)
const scrollHeight = ref([])
const formRef = ref(null)
const inputRef = ref(null)
const handleShowSubComment = async (commentId) => {
    showSubComment.value = true
    const scrollDom = document.querySelector('.sub-comment-list-warp')     
    subComments.value = await props.getSubComments({
        id: props.id,
        type: props.type,
        parentCommentId: commentId
    })
    scrollDom.scrollTo(0, 0) 
    floorCid.value = commentId
    if(props.isLogin){
        formRef.value.style.height = '0'
        inputRef.value.style.visibility = 'hidden'
    }
}
const handleCloseSubComment = () => {
    if(props.isLogin){
        formRef.value.style.height = '48px'
        inputRef.value.style.visibility = 'visible'
    }    
    showSubComment.value = false
}
watch(() => props.sortType, (newVal, oldVal) => {
    const scrollDom = document.querySelector('.comment-container')
    scrollHeight.value[oldVal] = scrollDom.scrollTop
    if(scrollHeight.value[newVal] === undefined) {  // 没记录高度，则不滚动
        return
    }
    scrollDom.scrollTo(0, scrollHeight.value[newVal],{
        behaviour: 'smooth'
    })  
})
const handleRadio = (e) => {
    emit('switchSortType', +e.target.value)        
}
const closeInputPanel = () => {
    if(!props.isLogin) {
        return
    }
    inputContent.value = ''
    const dialog = document.getElementById(`${props.name}inputPanel`)
    formRef.value.style.opacity = 1
    dialog.close()
}
const handleReplyPanel = async (comment) => {
    if (!props.isLogin){
        return
    }
    oldId.value = props.id  // 记录旧的id,避免切换资源时，组件刷新，id更改
    currentCId.value = comment.commentId
    floorCid.value = comment.commentId
    currentC.value = comment.content
    inputContent.value = ''
    const dialog = document.getElementById(`${props.name}inputPanel`)
    formRef.value.style.opacity = 0
    dialog.showModal()
}
const handleSubmit = async (t) => {
    if(!props.isLogin) {
        message.value.addMessage({text: '请先登录', duration: 2000})
        return
    }
    const dialog = document.getElementById(`${props.name}inputPanel`)
    if(inputContent.value.trim() === '') {
        message.value.addMessage({text: '评论内容不能为空', duration: 2000})
        return
    }
    console.log(inputContent.value);
    dialog.close()
    const res = await props.handleComment({
        id: t === 2 ? oldId.value : props.id, 
        type: props.type, 
        commentId: t === 2 ? currentCId.value : null, 
        t, 
        content: inputContent.value
    })    
    if(!res){
        message.value.addMessage({text: '评论失败', duration: 2000})
        inputContent.value = ''
        return
    }
    message.value.addMessage({text: '评论成功', duration: 2000})    
    if(t === 1) {
        res.timeStr = '刚刚'
        res.liked = false
        res.likedCount = 0
        res.replyCount = 0
        props.comments[props.sortType].unshift(res)
    }else if(t === 2) {
        if(subComments.value) {
            subComments.value.totalCount += 1
            res.timeStr = '刚刚'
            res.liked = false
            res.likedCount = 0
            res.replyCount = 0
            res.beReplied = []
            res.beReplied.push({
                beRepliedCommentId: floorCid.value,
                user: {
                    avatarUrl: res.beRepliedUser.avatarUrl,
                    nickname: res.beRepliedUser.nickname
                },
                content: currentC.value,
            })
            console.log(res);
            subComments.value.comments.unshift(res)
        }
        const index = props.comments[props.sortType].findIndex(item => item.commentId === currentCId.value)
        if(index === -1) {
            inputContent.value = ''
            return
        }
        const comment = props.comments[props.sortType][index]
        comment.replyCount += 1
    }    
    inputContent.value = ''
}
const handleLikeComment = async (comment) => {
    if(!props.isLogin) {
        message.value.addMessage({text: '请先登录', duration: 2000})
        return
    }
    if(!comment) {
        return
    }
    const res = await props.likeComment({
        id: props.id,
        type: props.type,
        commentId: comment.commentId,
        t: comment.liked ? 0 : 1
    })
    if(!res){
        message.value.addMessage({text: '点赞失败', duration: 2000})
        return
    }
    if(comment.liked){
        comment.likedCount -= 1
    }else{
        comment.likedCount += 1
    }
    comment.liked = !comment.liked
}
const deleteComment = async (comment) => {
    if(!props.isLogin) {
        message.value.addMessage({text: '请先登录', duration: 2000})
        return
    }
    const res = await props.handleComment({
        id: props.id,
        type: props.type,
        commentId: comment.commentId,
        t: 0
    })    
    if(!res){
        message.value.addMessage({text: '删除失败', duration: 2000})
        return
    }
    if(subComments.value) {
        const index = subComments.value.comments.findIndex(item => item.commentId === comment.commentId)
        if(index === -1) {
            return
        }
        subComments.value.comments.splice(index, 1)
        subComments.value.totalCount -= 1
        message.value.addMessage({text: '删除成功', duration: 2000})   
        return
    }
    const index = props.comments[props.sortType].findIndex(item => item.commentId === comment.commentId)
    if(index === -1) {
        return
    }
    props.comments[props.sortType].splice(index, 1)
    message.value.addMessage({text: '删除成功', duration: 2000})    
}

// let io = null
// let loadingDom = null
// let loadingDom2 = null
// onMounted(() => {
    
//     loadingDom = document.querySelector('.ring')
//     loadingDom2 = document.querySelector('.sub-ring')
//     const loadComments = useDebounce(() => {
//         emit('loadComments')
//     },500)
//     const getMoreSubComments = useDebounce(async () => {
//         const time = subComments.value.comments[subComments.value.comments.length - 1].time
//         const res = await props.getSubComments({
//             id: props.id,
//             type: props.type,
//             parentCommentId: floorCid.value,
//             limit: 10, 
//             time: time
//         })
//         if(!res){
//             message.value.addMessage({text: '加载失败', duration: 2000})
//             loadingDom2.style.display = 'none'
//             return
//         }
//         if(res.comments.length === 0) {
//             loadingDom2.style.display = 'none'
//             return
//         }
//         subComments.value.comments.push(...res.comments)
//     },500)
    
//     io = new IntersectionObserver(entries => {
//         entries.forEach(entry => {
//             if(entry.isIntersecting){
//                 if(entry.target.classList.value === 'ring'){
//                     console.log('load more comments');
                    
//                     loadComments()
//                 }
//                 if(entry.target.classList.value ==='sub-ring'){
//                     console.log('load more sub-comments');
//                     getMoreSubComments()
//                 }
//                 console.log('intersection', entry.target.classList.value);
//             }
//         })
//     }, {
//         root: null,
//         rootMargin: '0px',
//         threshold: 0.5
//     })
//     io.observe(loadingDom)
//     io.observe(loadingDom2)
// })
// onUnmounted(() => {
//     io.unobserve(loadingDom)
//     io.unobserve(loadingDom2)
//     io.disconnect()
// })
</script>

<style scoped>
.comment-container {
    position: relative;
    height: 100%;
    width: 100%;
    border-top-left-radius: var(--border-radius-light);
    border-bottom-left-radius: var(--border-radius-light);
    overflow-y: scroll;
}
.sub-comment-container {
    position: relative;
    height: 100%;
    width: 100%;
    border-top-left-radius: var(--border-radius-light);
    border-bottom-left-radius: var(--border-radius-light);
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    gap: 12px;
}
.replay-warp {
    width: 100%;
    height: 48px;
    display: flex;
    justify-content: flex-start;
    align-items: center;
    backdrop-filter: blur(5px);
    padding: 0;
    background-color: #ffffff44;
    transition: all 0.2s ease-in-out;
}
.select-box {
    position: sticky;
    top: 0;
    left: 0;
    width: 100%;
    display: flex;
    justify-content: flex-end;
    align-items: center;
    padding: 8px 0;
}
.select-box input[type="radio"] {
    display: none;
}
.select-box label {
    margin-right: 10px;
    font-size: 12px;
    font-weight: bold;
    color: #333;
}
.select-box input[type="radio"]:checked + label {
    color: red;
}
.select-box input[type="radio"]:hover + label {
    color: red;
}
.comment-scollPanel {
    width: 100%;
    padding: 10px;
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    scroll-behavior: smooth;
}
.comment-item {
    margin-bottom: 10px;
    width: 100%;
    padding: 10px 20px 0 20px;
    border-radius: var(--border-radius-light);
    transition: background-color 0.3s ease;
}
.comment-item:hover {
    background-color: #e0e0e0;
}
.comment-item-content {
    display: flex;
    justify-content: flex-start;
}
.comment-item-avatar,
.owner-avatar,
.sub-comment-item-avatar {    
    width: 40px;
}
.comment-item-avatar img,
.owner-avatar img,
.sub-comment-item-avatar img {
    height: 40px;
    width: 40px;
    object-fit: cover;
    border-radius: 50%;
}
.comment-item-info,
.owner-infos,
.sub-comment-item-info {
    flex-grow: 1;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: flex-start;
    margin-left: 10px;
    padding-bottom: 8px;
    border-bottom: #aaa solid 1px;
    gap: 12px;
}
.comment-item-info .top,
.owner-infos .top,
.sub-comment-item-info .top {
    display: flex;
    align-items: center;
    width: 100%;
}
.comment-item-info .top .name,
.owner-infos .top .name,
.sub-comment-item-info .top .name {
    font-size: 12px;
    color: #666;
}
.comment-item-info .top .like,
.owner-infos .top .like,
.sub-comment-item-info .top .like{
    margin-left: auto;
    font-size: 10px;
    color: #666;
    cursor: pointer;
}
.delete {
    margin-left: 4px;
    font-size: 10px;
    color: #666;
    cursor: pointer;
}
.comment-item-info .top .like .iconfont,
.owner-infos .top .like .iconfont,
.sub-comment-item-info .top .like .iconfont {
    font-size: 12px;
}
.delete .iconfont {
    font-size: 14px;
}
.comment-item-info .center,
.owner-infos .center,
.sub-comment-item-info .center {
    font-size: 10px;
    color: #666;
}
.comment-item-info .bottom,
.owner-infos .bottom,
.sub-comment-item-info .bottom {
    width: 100%;
    display: flex;
    align-items: center;
}
.comment-item-info .bottom .create-time,
.owner-infos .bottom .create-time,
.sub-comment-item-info .bottom .create-time {
    font-size: 10px;
    color: #666;
}
.comment-item-info .bottom .more-reply {
    font-size: 8px;
    font-weight: bold;
    color: #459cff;
    margin-left: auto;
    display: flex;
    align-items: center;
    cursor: pointer;
}






.sub-comment-count {
    padding: 10px;
    width: 100%;
    display: flex;
    justify-content: flex-start;
    align-items: center;
}
.sub-comment-count span {
    font-size: 12px;
    color: #333;
}
.sub-comment-count .iconfont {
    font-size: 14px;
    margin-left: auto;
    cursor: pointer;
}
.owner-comment {
    width: 100%;
    padding: 0 20px;
    display: flex;
    justify-content: flex-start;
    border-bottom: #757575 solid 1px;
}
.owner-infos {
    border-bottom:0;
}
.divide {
    width: 100%;
    padding: 0 10px;
    margin-bottom: 4px;
    font-size: 12px;
    color: #333;
}

.sub-comment-list-warp {
    width: 100%;    
    overflow-y: scroll;
}
.sub-comment-list {
    width: 100%;
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    padding: 10px;
}
.sub-comment-item {
    padding: 10px 20px 0 20px;
    width: 100%;
    display: flex;
    justify-content: flex-start;
    align-items: flex-start;
    border-radius: var(--border-radius-light);
    transition: background-color 0.3s ease;
}
.sub-comment-item:hover {
    background-color: #e0e0e0;
}
.sub-comment-item:last-child {
    border-bottom: none;
}
.beReplied {
    border-left: #999999 solid 3px;
    padding-left: 10px;
    display: flex;
    align-items: center;
}
.beReplied img {
    width: 30px;
    height: 30px;
    border-radius: 50%;
    margin-right: 10px;
    float: left;
}
.beReplied .name {
    font-size: 12px;
    color: #389fff;
}
.beReplied .name::after {
    content: ":";
    margin-right: 2px;
}
.beReplied .reply-content {
    font-size: 10px;
    color: #666;
}





.comment-enter-active,
.comment-leave-active{
    transition: all 0.3s ease;
}
.comment-enter-from {
    opacity: 0;
    transform: scale(0.8) translateX(100%);
}
.comment-enter-to {
    opacity: 1;
    transform: scale(1) translateX(0);
}
.comment-leave-from {
    opacity: 1;
    transform: scale(1) translateX(0);
}
.comment-leave-to {
    opacity: 0;
    transform: scale(0.8) translateX(-100%);
}

.sub-comment-enter-active,
.comment-list-enter-active{
    transition: all 0.3s ease;
}
.sub-comment-enter-from {
    opacity: 0;
    transform: scale(0.8) translateX(100%);
}
.sub-comment-enter-to {
    opacity: 1;
    transform: scale(1) translateX(0);
}
.sub-comment-leave-from {
    opacity: 1;
    transform: scale(1) translateX(0);
}
.sub-comment-leave-to {
    opacity: 0;
    transform: scale(0.8) translateX(-100%);
}


.comment-list-enter-from {
    opacity: 0;
    transform: translateY(5px);
}
.comment-list-enter-to {
    opacity: 1;
    transform: translateY(0);
}
.comment-list-leave-active {
    transition: all 0.3s ease;
}
.comment-list-leave-from {
    opacity: 1;
    transform: translateY(0);
}
.comment-list-leave-to {
    opacity: 0;
    transform: translateY(5px);
}


dialog {
    position: fixed;
    top: 0;
    left: 0;
    margin: 0 auto;
    padding: 16px;
    background-color: #ffffff80;
    backdrop-filter: blur(2px);
    box-shadow: var(--dialog-shadow);
    border: none;
    border-radius: 8px;
    transition: all 0.3s ease-in-out;
    opacity: 1;
    transform: translateY(24vh);
    z-index: 99999;
}
dialog:not([open]){
    display: block;
    opacity: 0;
    transform: translateY(calc(24vh - 24px));
    visibility: hidden;    
    pointer-events: none;
}
dialog::backdrop {
    background-color: var(--dialog-modal-mask-bg-color);
    /* backdrop-filter: blur(1px); */
}
.input-panel {  
    width: 100%;  
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
}
.input-warp {
    width: 320px;
    display: flex;
    flex-direction: column;
    gap: 12px;
}
.input-content {
    width: 100%;
    height: 100px;
}
textarea,
input {
    width: 100%;
    height: 100%;
    padding: 10px;
    border: none;
    border-radius: 5px;
    font-size: 12px;
    color: #333;
    background-color: transparent;
    resize: none;
}
textarea:focus,
input:focus {
    outline: none;
    box-shadow: 0 0 2px 1px #459cff;
}
textarea::placeholder,
input::placeholder {
    color: #888888;
}
.input-btn-warp {
    display: flex;
    justify-content: flex-end;
    gap: 10px;
}
.input-btn-warp button {
    padding: 2px 16px;
    height: 24px;
    border: none;
    border-radius: 16px;
    color: #fff;
    background-color: #459cff;
    cursor: pointer;
    font-size: 12px;
    user-select: none;
    transition: all 0.3s ease;
}
.input-btn-warp button:hover {
    background-color: #0e8aff;
}



/* loading动画 */
.ring,
.sub-ring {
    margin: 0 auto;
    margin-bottom: 56px;
    width: 24px;
    height: 24px;
    border: 6px rgb(255 74 105 / 25%) solid;
    border-top: 6px #ff4a69 solid;
    border-radius: 50%;
    animation: spin 0.6s infinite linear;
}
.sub-ring {
    margin-bottom: 12px;
}
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
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
.comment-container.show-scrollbar::-webkit-scrollbar,
.sub-comment-list-warp.show-scrollbar::-webkit-scrollbar {
    width: 4px; /* 滚动条宽度 */
}
.comment-container.show-scrollbar::-webkit-scrollbar-track,
.sub-comment-list-warp.show-scrollbar::-webkit-scrollbar-track {
    background: var(--main-scrollbal-track-bg-color); /* 滚动条轨道背景色 */
    border-radius: 2px;
}
.comment-container.show-scrollbar::-webkit-scrollbar-thumb,
.sub-comment-list-warp.show-scrollbar::-webkit-scrollbar-thumb {
    background: var(--main-scrollbal-thumb-bg-color); /* 滚动条滑块颜色 */
    border-radius: 2px;
}
.comment-container.show-scrollbar::-webkit-scrollbar-thumb:hover,
.sub-comment-list-warp.show-scrollbar::-webkit-scrollbar-thumb:hover {
    background: var(--main-scrollbal-thumb-hover-bg-color); /* 滚动条滑块悬停颜色 */
}
</style>