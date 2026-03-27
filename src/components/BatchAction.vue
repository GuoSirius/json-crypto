<script setup lang="ts">
import { Layers, FileArchive, ChevronDown, ChevronUp } from 'lucide-vue-next'
import type { DownloadMode } from '../types'
import { ref } from 'vue'

const props = defineProps<{
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

const showDropdown = ref(false)

function handleDownloadZip() {
  emit('downloadZip')
}

function handleDownloadWithMode(mode: DownloadMode) {
  emit('downloadZipWithMode', mode)
  showDropdown.value = false
}

function toggleDropdown() {
  if (props.filteredCount >= 2) {
    showDropdown.value = !showDropdown.value
  }
}

function handleClickOutside(event: MouseEvent) {
  const target = event.target as HTMLElement
  if (!target.closest('.download-button-group')) {
    showDropdown.value = false
  }
}
</script>

<template>
  <div class="flex items-center gap-2" @click="handleClickOutside">
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
    <div class="download-button-group relative">
      <div class="button-row">
        <button
          class="download-main-button"
          :disabled="filteredCount < 2"
          @click="handleDownloadZip"
        >
          <FileArchive :size="14" />
          打包下载 ZIP
        </button>
        <button
          class="download-dropdown-button"
          :disabled="filteredCount < 2"
          @click.stop="toggleDropdown"
        >
          <ChevronDown v-if="!showDropdown" :size="14" />
          <ChevronUp v-else :size="14" />
        </button>
      </div>
      <div
        v-if="showDropdown && filteredCount >= 2"
        class="dropdown-menu"
      >
        <button
          class="dropdown-item"
          @click="handleDownloadWithMode('original')"
        >
          下载原始内容
        </button>
        <button
          class="dropdown-item"
          @click="handleDownloadWithMode('processed')"
        >
          下载处理后内容
        </button>
        <button
          class="dropdown-item"
          @click="handleDownloadWithMode('both')"
        >
          同时下载两种内容
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.download-button-group {
  position: relative;
  display: inline-block;
}

.button-row {
  display: flex;
  align-items: stretch;
  border: 1px solid #3b82f6;
  border-radius: 0.5rem;
  overflow: hidden;
}

.download-main-button {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.375rem 0.75rem;
  font-size: 0.75rem;
  font-weight: bold;
  border: none;
  background: linear-gradient(to bottom right, #06b6d4, #0284c7);
  color: white;
  cursor: pointer;
  transition: all 0.2s ease;
}

.download-main-button:hover {
  background: linear-gradient(to bottom right, #0891b2, #0369a1);
  box-shadow: 0 0.5rem 1rem rgba(59, 130, 246, 0.5);
  transform: translateY(-0.125rem);
}

.download-main-button:active {
  transform: translateY(0);
}

.download-main-button:disabled {
  opacity: 0.4;
  cursor: not-allowed;
  transform: none;
}

.download-dropdown-button {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2rem;
  border: none;
  border-left: 1px solid #3b82f6;
  background: linear-gradient(to bottom right, #06b6d4, #0284c7);
  color: white;
  cursor: pointer;
  transition: all 0.2s ease;
  padding: 0;
  margin: 0;
}

.download-dropdown-button:hover {
  background: linear-gradient(to bottom right, #0891b2, #0369a1);
}

.download-dropdown-button:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.dropdown-menu {
  position: absolute;
  top: 100%;
  right: 0;
  margin-top: 0.25rem;
  background: var(--app-card);
  border: 1px solid var(--app-border);
  border-radius: 0.5rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  z-index: 1000;
  min-width: 12rem;
  overflow: hidden;
}

.dropdown-item {
  display: block;
  width: 100%;
  padding: 0.5rem 1rem;
  font-size: 0.75rem;
  font-weight: medium;
  text-align: left;
  border: none;
  background: transparent;
  color: var(--app-text-regular);
  cursor: pointer;
  transition: all 0.2s ease;
}

.dropdown-item:hover {
  background: var(--app-fill);
  color: var(--app-text-primary);
}

/* 暗黑主题适配 */
html.dark .dropdown-menu {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}
</style>
