<template>
    <div class="loading">
        <span></span>
        <span></span>
        <span></span>
        <span></span>
    </div>
</template>

<style scoped>
.loading {
  display: flex;
  align-items: end;
  height: 12px;
}
.loading span {
  display: block;
  margin: 0 1.5px;
  border-radius: 50px;
  width: 2.4px;
  height: 100%;
  background: red;
  animation: loading 0.8s ease-in-out infinite;
}
.loading span:nth-child(1) {
  animation-delay: 0.2s;
}
.loading span:nth-child(2) {
  animation-delay: 0.4s;
}
.loading span:nth-child(3) {
  animation-delay: 0.6s;
}
.loading span:nth-child(4) {
  animation-delay: 0.8s;
}

@keyframes loading {
  50% {
    opacity: 0.2;
    /* filter: hue-rotate(360deg); */
    height: 20%;
  }
}
</style>