<template>
    <div class="tooltip-warp">
        <div class="tooltip-slot">
            <slot></slot> 
        </div>
        <div class="tooltip-content">
            <slot name="tip"></slot>
        </div>     
    </div>
</template>

<script setup>  

</script>

<style scoped>
.tooltip-warp {
    position: relative;
    display: inline-block;
}
.tooltip-content {
    position: absolute;
    display: flex;
    align-items: center;
    justify-content: start;
    padding: 4px 12px;
    font-size: 12px;
    color: #fff;
    border-radius: 4px;
    box-shadow: 0 2px 4px rgba(0,0,0,0.2);
    white-space: nowrap;
    background-color: #333;
    top: -100%;
    left: 50%;
    transform: translate(-50%,-50%);
    pointer-events: none;
    transition: all 0.3s ease-out;
    opacity: 0;
}
.tooltip-content::before {
    content: "";
    position: absolute;
    width: 0;
    height: 0;
    border-left: 10px solid transparent;
    border-right: 10px solid transparent;
    border-top: 10px solid #333;
    bottom: -6px;
    right: 50%;
    transform: translateX(50%);
}
.tooltip-content::after {
    content: '';
    position: absolute;
    width: 0;
    height: 0;
    border-left: 10px solid transparent;
    border-right: 10px solid transparent;
    border-top: 10px solid #333;
    bottom: -6px;
    right: 50%;
    transform: translateX(50%);
}
.tooltip-warp:hover .tooltip-content {
    opacity: 1;
    pointer-events: auto;
}
</style>