<template>
    <div>{{ keywords }}</div>
</template>

<script setup>
import { useRoute } from 'vue-router';
const route = useRoute();
const keywords = route.query.keywords;
</script>

<style scoped>

</style>