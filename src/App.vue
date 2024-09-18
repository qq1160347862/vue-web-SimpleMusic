<template>
  <div class="layout">
    <Background></Background>
    <Nav></Nav>
    <section>
      <Aside></Aside>
      <main>
        <!-- <header>{{ route.name }}</header> -->
        <router-view v-slot="{ Component }">
          <KeepAlive :max="10" exclude="AlbumDetail">
            <component :is="Component" />
          </KeepAlive>
        </router-view>
      </main>      
    </section>
    <footer>
      <MusicPlayer></MusicPlayer>
    </footer>    
  </div>  
  <Message ref="message"></Message>
</template>

<script setup>
import Background from './components/Background.vue';
import Nav from './components/Nav.vue';
import Aside from './components/Aside.vue';
import MusicPlayer from './components/MusicPlayer.vue';
import Message from './components/Message.vue';
import { useRoute } from 'vue-router';
import { computed, provide, ref } from 'vue';
const route = useRoute();
const message = ref()
provide('message', message)
</script>

<style scoped>
.layout {
  display: flex;
  flex-direction: column;
  height: 100vh;
}
header {
  padding: 0 0 0 8px;
  font-size: 16px;
  font-weight: bold;
  text-transform: capitalize;
  cursor: pointer;
}
section {
  flex: 1;
  display: flex;
  align-items: center;
  overflow: hidden;
}
main {
  height: 100%;
  flex: 1;
  overflow: hidden;  
}
footer {
  width: 100%;
  height: 92px;
  padding: 16px;
  border-top: var(--footer-border-top);
  box-shadow: var(--footer-box-shadow);
}
</style>
