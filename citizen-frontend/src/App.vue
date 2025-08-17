<script setup>
import AppHeader from './components/AppHeader.vue';
import MainContent from './components/MainContent.vue';
</script>

<template>
  <div id="app">
    <AppHeader />
    <MainContent />
  </div>
</template>

<style scoped>
#app {
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}
</style>
