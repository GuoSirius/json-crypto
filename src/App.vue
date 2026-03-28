<script setup lang="ts">
import { computed, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useSidebar } from './composables/useSidebar'
import { ElConfigProvider } from 'element-plus'
import AppSidebar from './components/AppSidebar.vue'

const route = useRoute()
const { expanded } = useSidebar()

// 页面标题映射
const pageTitleMap: Record<string, string> = {
  '/json/upload': 'JSON 上传',
  '/json/process': 'JSON 处理',
  '/excel/upload': 'Excel 上传',
  '/excel/process': 'Excel 处理',
}

// 动态标题
const currentTitle = computed(() => {
  const path = route.path
  const title = pageTitleMap[path] || ''
  return title ? `${title} - JSON Crypto` : 'JSON Crypto'
})

// 监听路由变化更新标题
watch(
  () => route.path,
  () => {
    document.title = currentTitle.value
  },
  { immediate: true }
)
</script>

<template>
  <el-config-provider :z-index="3000">
    <div class="min-h-screen bg-app-bg flex">
      <AppSidebar />
      <main
        class="flex-1 min-h-screen transition-all duration-300 ease-in-out"
        :style="{ marginLeft: expanded ? '208px' : '56px' }"
      >
        <router-view :key="route.path" />
      </main>
    </div>
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
