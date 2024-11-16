<template>
    <div class="timeline-container no-select">
        <div class="timeline-panel">
            <div class="mask" v-show="mask"></div>
            <header>
                <h2 class="title">{{ data.title }}</h2>
                <h3 class="subtitle">{{ data.subtitle }}</h3>
            </header>
            <section>
                <div class="line-card" v-for="(card, index) in data.cards" 
                    :key="index" :data-text="card.title">
                    <div class="content">
                        <img :src="card.img" alt="">
                        <h2 class="time">{{ card.date }}</h2>
                        <p class="desc">{{ card.desc }}</p> 
                    </div>                     
                </div>
            </section>
        </div>
    </div>
</template>

<script setup>
import { onMounted, onUnmounted } from 'vue';
const props = defineProps({
    data: {
        type: Object,
        default: () => ({
            title:'标题',
            subtitle:'副标题',
            cards: []
        })
    },
    background: {
        type: Boolean,
        default: false
    },
    scrollDom: {
        type: Object,
        default: null
    },
    mask: {
        type: Boolean,
        default: false
    }
})

let iob = null
const handleScroll = () => {
    const panel = document.querySelector('.timeline-panel')
    const cards = document.querySelectorAll('.line-card')
    
    iob = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {            
            if (entry.isIntersecting) {
                // for (let i = 0; i < cards.length; i++) {
                //     cards[i].classList.remove('active')
                // }
                entry.target.classList.add('active')
                if (props.background) {
                    panel.style.backgroundImage = `url(${entry.target.querySelector('img').src})`
                }            
            }else {
                entry.target.classList.remove('active')
            }
        })
    }, {
        root: props.scrollDom,
        rootMargin: '0px',
        threshold: 0.8
    })

    cards.forEach((card) => {
        iob.observe(card)
    })
    const firstCard = cards[0]
    firstCard.classList.add('active')
    if (props.background) {
        panel.style.backgroundImage = `url(${firstCard.querySelector('img').src})`
    }
}
onMounted(() => {
    handleScroll()
})

onUnmounted(() => {
    iob.disconnect()    
})
</script>

<style scoped>
.timeline-container {
    width: 100%;
    height: 100%;
}
.timeline-warp {
    width: 100%;
    height: 100%;
    overflow: scroll;
}
.timeline-panel {
    position: relative;
    width: 100%;
    transition: .3s ease 0s;
    background-attachment:fixed;
    background-size: cover;
    background-position: center center;
}
/* 组件遮罩 */
.timeline-panel .mask {
    position: absolute;
    left: 0;
    top: 0;
    z-index: -1;
    width: 100%;
    height: 100%;
    background: rgba(99, 99, 99, .8);
    backdrop-filter: blur(20px);
    content: '';
}
.timeline-panel header {
    width: 100%;
    text-align: center;
    margin-bottom:  64px;
    position: relative;
}
.timeline-panel header .title {
    color: #fff;
    font-size: 24px;
    font-weight: normal;
}
.timeline-panel header .subtitle {
    color: rgba(255, 255, 255, .8);
    font-size: 16px;
    letter-spacing: 2px;
    margin: 5px 0 0 0;
    font-weight: normal;
}
.timeline-panel section {
    display: flex;
    flex-direction: column;
    flex-wrap: wrap;
    position: relative;
}
/* 时间线竖轴 */
.timeline-panel section::before {
    content: '';
    position: absolute;
    left: 50%;
    transform: translateX(-50%);
    width: 2px;
    height: 100%;
    background-color: rgba(255, 255, 255, 0.1);
}
.line-card {
    padding: 40px 0;
    opacity: .3;
    filter: blur(2px);
    transition: .5s;
    width: calc(50% - 40px);
    display: flex;
    position: relative;
    transform: translateY(24px);
    scroll-snap-align: center;
    scroll-snap-stop: always;
}
.line-card::before {
    content: attr(data-text);
    width: 100%;
    position: absolute;
    color: rgba(255, 255, 255, .8);
    border-left: 2px solid rgba(255, 255, 255, .9);
    top: 70%;
    margin-top: -5px;
    padding-left: 15px;
    opacity: 0;
    right: calc(-100% - 56px);
    font: 900 20px '';
    letter-spacing: 5px;
    transition: .3s all .2s;
}
.line-card:nth-child(even) {
    align-self: flex-end;
}
.line-card:nth-child(even)::before {
    right: auto;
    text-align: right;
    left: calc(-100% - 56px);
    padding-left: 0;
    border-left: none;
    border-right: 2px solid rgba(255, 255, 255, .9);
    padding-right: 15px;
    color: rgba(255, 255, 255, .8);
}
.line-card .content {
    display: flex;
    flex-direction: column;
}
.line-card img {
    max-width: 80%;
    box-shadow: 0 10px 15px rgba(0, 0, 0, .4);
}
.line-card .time {
    font-weight: normal;
    font-size: 32px;
    transition: .4s;
    padding: 0 12px;
    color: #fff;
    transform: translateY(0);
}
.line-card .desc {
    font-size: 16px;
    line-height: 1.6;
    margin-top: 8px;
    padding: 0 12px;
    letter-spacing: 2px;
    color: rgba(255, 255, 255, .8);
    transition: .4s;
    transform: translateY(0);
}
.line-card.active {
    opacity: 1;
    filter: blur(0);
    transform: translateY(0)
}
.line-card.active::before {
    top: 20%;
    opacity: 1;
}
.line-card.active .time {
    transform: translateY(-25px);
}
.line-card.active .desc {
    transform: translateY(-25px);
}


@media only screen and (max-width: 760px) {
    .line-card {
        align-self: baseline !important;
        width: 100%;
        padding: 0 30px 150px 80px;
    }

    .line-card::before {
        left: 10px !important;
        padding: 0 !important;
        top: 50px;
        text-align: center !important;
        width: 60px;
        border: none !important;
    }

    .line-card:last-child {
        padding-bottom: 40px;
    }

    .timeline-panel section::before {
        left: 40px;
    }
}
</style>