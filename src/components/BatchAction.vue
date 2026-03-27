<script setup lang="ts">
import { Layers, FileArchive, ChevronDown } from 'lucide-vue-next'
import type { DownloadMode } from '../types'

defineProps<{
  fileCount: number
  filteredCount: number
  hasProcessed: boolean
  batchLoading: boolean
  wrapWithQuotes: boolean
}>()

const emit = defineEmits<{
  batchProcess: []
  downloadZip: []
  downloadZipWithMode: [mode: DownloadMode]
  'update:wrapWithQuotes': [value: boolean]
}>()

function handleDownloadZip() {
  emit('downloadZip')
}

function handleDownloadWithMode(mode: DownloadMode) {
  emit('downloadZipWithMode', mode)
}
</script>

<template>
  <div class="flex items-center gap-2">
    <label class="flex items-center gap-1.5 cursor-pointer group">
      <input
        type="checkbox"
        :checked="wrapWithQuotes"
        @change="(e) => { emit('update:wrapWithQuotes', (e.target as HTMLInputElement).checked) }"
        class="w-4 h-4 rounded bg-app-fill border-2 border-app-border text-primary focus:ring-2 focus:ring-primary/30 cursor-pointer transition-all hover:border-primary/50 accent-primary"
      />
      <span class="text-xs font-medium text-app-text-regular group-hover:text-app-text-primary transition-colors">加引号</span>
    </label>
    <button
      class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border border-violet-400 bg-gradient-to-br from-violet-500 to-violet-600 text-white hover:from-violet-600 hover:to-violet-700 hover:shadow-xl hover:shadow-violet-500/50 hover:-translate-y-0.5 active:translate-y-0 transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:translate-y-0"
      :disabled="filteredCount === 0 || batchLoading"
      @click="emit('batchProcess')"
    >
      <Layers :size="14" />
      {{ batchLoading ? '处理中...' : '批量处理' }}
    </button>
    <el-dropdown
      :disabled="filteredCount < 2"
      trigger="click"
      @command="handleDownloadWithMode"
    >
      <el-button-group>
        <button
          class="flex items-center gap-1.5 px-3 py-1.5 rounded-l-lg text-xs font-bold border border-cyan-400 bg-gradient-to-br from-cyan-500 to-cyan-600 text-white hover:from-cyan-600 hover:to-cyan-700 hover:shadow-xl hover:shadow-cyan-500/50 hover:-translate-y-0.5 active:translate-y-0 transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:translate-y-0"
          :disabled="filteredCount < 2"
          @click="handleDownloadZip"
        >
          <FileArchive :size="14" />
          打包下载 ZIP
        </button>
        <button
          class="flex items-center px-2 py-1.5 rounded-r-lg text-xs font-bold border border-l-0 border-cyan-400 bg-gradient-to-br from-cyan-500 to-cyan-600 text-white hover:from-cyan-600 hover:to-cyan-700 hover:shadow-xl hover:shadow-cyan-500/50 hover:-translate-y-0.5 active:translate-y-0 transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:translate-y-0"
          :disabled="filteredCount < 2"
        >
          <ChevronDown :size="14" />
        </button>
      </el-button-group>
      <template #dropdown>
        <el-dropdown-menu>
          <el-dropdown-item command="original">
            <span class="text-xs">下载原始内容</span>
          </el-dropdown-item>
          <el-dropdown-item command="processed">
            <span class="text-xs">下载处理后内容</span>
          </el-dropdown-item>
          <el-dropdown-item command="both">
            <span class="text-xs">同时下载两种内容</span>
          </el-dropdown-item>
        </el-dropdown-menu>
      </template>
    </el-dropdown>
  </div>
</template>
