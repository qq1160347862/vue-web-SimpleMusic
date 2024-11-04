<template>
    <div class="bg-overlay">
        <span>Hello World</span>
        <div class="bg-img"></div>
    </div>
</template>

<script setup>

</script>


<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Quicksand&display=swap');
.bg-overlay {
    width: 100%;
    height: 100%;
    position: absolute;
    overflow: hidden;
    z-index: -1;    
}
.bg-overlay span {
    position: absolute;
    bottom: 45%;
    left: 50%;
    transform: translate(-50%, -50%);
    z-index: -2;
    font-size: 5vmin;
    font-family: 'Quicksand', sans-serif;
    color: transparent;
    text-shadow: var(--theme-bg-font-shadow);
    letter-spacing: 5px;
    filter: blur(1px);  
}
.bg-img {
    position: absolute;
    top: 0;
    left: 0;
    z-index: -3;
    width: 100%;
    height: 100%;
    background-color: var(--theme-bg-color);
    background-image: var(--theme-bg-animation);
    background-size: 
        130vmax 130vmax,
        80vmax 80vmax,
        90vmax 90vmax,
        110vmax 110vmax,
        90vmax 90vmax;
    background-position:
        -80vmax -80vmax,
        60vmax -30vmax,
        10vmax 10vmax,
        -30vmax -10vmax,
        50vmax 50vmax;
    background-repeat: no-repeat;
    animation: 10s movement linear infinite;
}

@keyframes movement {
    0%, 100% {
        background-size: 
        130vmax 130vmax,
        80vmax 80vmax,
        90vmax 90vmax,
        110vmax 110vmax,
        90vmax 90vmax;
        background-position:
        -80vmax -80vmax,
        60vmax -30vmax,
        10vmax 10vmax,
        -30vmax -10vmax,
        50vmax 50vmax;
    }
    25% {
        background-size: 
        100vmax 100vmax,
        90vmax 90vmax,
        100vmax 100vmax,
        90vmax 90vmax,
        60vmax 60vmax;
        background-position:
        -60vmax -90vmax,
        50vmax -40vmax,
        0vmax -20vmax,
        -40vmax -20vmax,
        40vmax 60vmax;
    }
    50% {
        background-size: 
        80vmax 80vmax,
        110vmax 110vmax,
        80vmax 80vmax,
        60vmax 60vmax,
        80vmax 80vmax;
        background-position:
        -50vmax -70vmax,
        40vmax -30vmax,
        10vmax 0vmax,
        20vmax 10vmax,
        30vmax 70vmax;
    }
    75% {
        background-size: 
        90vmax 90vmax,
        90vmax 90vmax,
        100vmax 100vmax,
        90vmax 90vmax,
        70vmax 70vmax;
        background-position:
        -50vmax -40vmax,
        50vmax -30vmax,
        20vmax 0vmax,
        -10vmax 10vmax,
        40vmax 60vmax;
    }
}

</style>