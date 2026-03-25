<script setup lang="ts">
import { computed } from 'vue'
import { Braces, Minimize2 } from 'lucide-vue-next'

const props = defineProps<{
  hasSource: boolean
  hasProcessed: boolean
  hasSourceValidJson: boolean
  hasProcessedValidJson: boolean
}>()

const emit = defineEmits<{
  format: []
  compress: []
}>()

// 格式化/压缩按钮：任一文本框有有效 JSON 时启用
const canFormatOrCompress = computed(() => props.hasSourceValidJson || props.hasProcessedValidJson)
</script>

<template>
  <div class="flex flex-wrap items-center gap-2">
    <button
      class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border border-blue-400 bg-gradient-to-br from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700 hover:shadow-lg hover:shadow-blue-500/40 hover:-translate-y-0.5 active:translate-y-0 transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:translate-y-0"
      :disabled="!canFormatOrCompress"
      @click="emit('format')"
    >
      <Braces :size="14" />
      格式化
    </button>
    <button
      class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border border-amber-400 bg-gradient-to-br from-amber-500 to-amber-600 text-white hover:from-amber-600 hover:to-amber-700 hover:shadow-lg hover:shadow-amber-500/40 hover:-translate-y-0.5 active:translate-y-0 transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:translate-y-0"
      :disabled="!canFormatOrCompress"
      @click="emit('compress')"
    >
      <Minimize2 :size="14" />
      压缩
    </button>
  </div>
</template>
