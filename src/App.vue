<script setup lang="ts">
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useJsonStore } from './stores/jsonStore'
import { ElConfigProvider } from 'element-plus'

const router = useRouter()
const store = useJsonStore()

onMounted(async () => {
  await store.init()
  if (store.hasData()) {
    router.replace('/process')
  } else {
    router.replace('/upload')
  }
})
</script>

<template>
  <el-config-provider :z-index="3000">
    <router-view v-slot="{ Component }">
      <transition name="fade" mode="out-in">
        <component :is="Component" />
      </transition>
    </router-view>
  </el-config-provider>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
