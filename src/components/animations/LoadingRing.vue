<template>
    <div class="ring"></div>
</template>

<style scoped>
.ring {
    width: 48px;
    height: 48px;
    border: 6px rgb(255 74 105 / 25%) solid;
    border-top: 6px #ff4a69 solid;
    border-radius: 50%;
    animation: spin 0.6s infinite linear;
}
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>