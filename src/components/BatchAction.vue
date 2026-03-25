<script setup lang="ts">
import { Layers, FileArchive } from 'lucide-vue-next'

defineProps<{
  fileCount: number
  filteredCount: number
  hasProcessed: boolean
  batchLoading: boolean
}>()

const emit = defineEmits<{
  batchProcess: []
  downloadSingle: []
  downloadZip: []
}>()
</script>

<template>
  <div class="flex items-center gap-2">
    <button
      class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border border-violet-400 bg-gradient-to-br from-violet-500 to-violet-600 text-white hover:from-violet-600 hover:to-violet-700 hover:shadow-xl hover:shadow-violet-500/50 hover:-translate-y-0.5 active:translate-y-0 transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:translate-y-0"
      :disabled="filteredCount === 0 || batchLoading"
      @click="emit('batchProcess')"
    >
      <Layers :size="14" />
      {{ batchLoading ? '处理中...' : '批量处理' }}
    </button>
    <button
      class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border border-cyan-400 bg-gradient-to-br from-cyan-500 to-cyan-600 text-white hover:from-cyan-600 hover:to-cyan-700 hover:shadow-xl hover:shadow-cyan-500/50 hover:-translate-y-0.5 active:translate-y-0 transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:translate-y-0"
      :disabled="filteredCount < 2"
      @click="emit('downloadZip')"
    >
      <FileArchive :size="14" />
      打包下载 ZIP
    </button>
  </div>
</template>
