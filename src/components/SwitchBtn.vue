<template>
    <div class="swich-btn no-select">
        <div class="switch-btn-warp">
            <input type="radio" name="switch-btn"
                v-for="option in options" 
                :key="option.id"
                :id="option.id"
                :value="option.value"
                @click="handleClick">
            <label v-for="option in options"
                :key="option.id"
                :for="option.id">
                <span>{{ option.label }}</span>
            </label>
            <span class="slider"></span>
        </div>
    </div>    
</template>

<script setup>
const props = defineProps({
    options: {
        type: Array,
        default: () => []
    },
});
const emit = defineEmits(['handleClick']);
const handleClick = (e) => {
    emit('handleClick', e.target.value);
}

</script>

<style scoped> 
.swich-btn {
    width: 172px;
    height: 32px;
    padding: 4px;
    border-radius: 16px;
    display: flex;
    justify-content: center;
    align-items: center;
    background-color: rgb(223, 223, 223);
}
.switch-btn-warp {
    position: relative;
    width: 100%;
    height: 100%;
    border-radius: inherit;
    background-color: rgb(223, 223, 223);
    display: flex;
    align-items: center;
    box-shadow: inset 0 8px 60px rgba(0, 0, 0, .1),
                inset 0 8px 8px rgba(0, 0, 0, .1),
                inset 0 4px -4px rgba(0, 0, 0, .1);
}
.switch-btn-warp input[type="radio"] {
    display: none;
}
.switch-btn-warp label {
    position: relative;
    z-index: 2;
    display: flex;
    width: calc(100% / 3);
    height: 100%;
    border-radius: inherit;
    padding: 8px 0;
    cursor: pointer;
    transition: all 0.3s ease;
}
.switch-btn-warp label:hover span {
    /* background-color: #444; */
    color: white;
}
.switch-btn-warp label span {
    height: 100%;
    width: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: 10px;
    font-weight: bold;
    color: rgb(0, 0, 0);
    transition: all 0.3s ease;
}
.switch-btn-warp .slider {
    position: absolute;
    z-index: 1;
    top: 50%;
    left: 0;
    width: calc(100% / 3);
    height: 100%;
    transform: translate(0, -50%);
    border-radius: inherit;
    background-color: #ffffff;
    transition: 0.3s ease,transform 0.25s ease-out;
}
.switch-btn-warp input[type="radio"]:nth-of-type(1):checked ~ .slider {
    transform: translate(0, -50%);
}
.switch-btn-warp input[type="radio"]:nth-of-type(2):checked ~ .slider {
    transform: translate(100%, -50%);
}
.switch-btn-warp input[type="radio"]:nth-of-type(3):checked ~ .slider {
    transform: translate(200%, -50%);
}
.switch-btn-warp input[type="radio"]:nth-of-type(1):checked ~ label:nth-of-type(1) span {
    color: #000;
}
.switch-btn-warp input[type="radio"]:nth-of-type(2):checked ~ label:nth-of-type(2) span {
    color: #000;
}
.switch-btn-warp input[type="radio"]:nth-of-type(3):checked ~ label:nth-of-type(3) span {
    color: #000;
}
</style>