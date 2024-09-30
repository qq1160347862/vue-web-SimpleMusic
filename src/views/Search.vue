<template>
    <div>{{ keywords }}</div>
    <div>{{ type }}</div>
    <div>{{ searchResource }}</div>
</template>

<script setup>
import { onBeforeUpdate, onMounted, ref, watch } from 'vue';
import { useRoute } from 'vue-router';
import { useLocalStore } from '../store/localStore';
import { storeToRefs } from 'pinia';
const route = useRoute();
const keywords = ref(route.query.keywords);
const type = ref(route.query.type);
const limit = ref(20);
const offset = ref(0);
const localStore = useLocalStore();
const searchResource = ref([]);


// 监听路由变化，更新keywords和type并重新搜索资源
watch(route, async (newValue) => {
    offset.value = 0;
    if (newValue.query.keywords !== keywords || newValue.query.type !== type) {
        keywords.value = newValue.query.keywords;
        type.value = newValue.query.type;
        searchResource.value = await localStore.searchResource({
            keywords: keywords.value,
            limit: limit.value,
            offset: offset.value,
            type: +type.value
        });
    }
}, { deep: true, immediate: true });
</script>

<style scoped>

</style>