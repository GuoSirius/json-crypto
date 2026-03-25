<script setup lang="ts">
import { computed } from 'vue'
import { FileJson, Check, AlertCircle, Plus, Filter } from 'lucide-vue-next'
import type { JsonFile } from '../types'
import type { FileFilter } from '../stores/jsonStore'

const props = defineProps<{
  files: JsonFile[]
  activeIndex: number
  filter: FileFilter
}>()

const emit = defineEmits<{
  select: [md5: string]
  add: []
  'update:filter': [filter: FileFilter]
}>()

const filterOptions: { value: FileFilter; label: string }[] = [
  { value: 'all', label: '全部' },
  { value: 'pending-encrypt', label: '待加密' },
  { value: 'pending-decrypt', label: '待解密' },
]

const displayedFiles = computed(() => {
  const f = props.filter
  if (f === 'all') {
    return props.files
  }
  // 根据原始文件内容判断是否需要加密或解密
  return props.files.filter(file => {
    const isEncrypted = detectEncrypted(file.content)
    if (f === 'pending-encrypt') {
      // 待加密：原始内容未加密
      return !isEncrypted
    } else if (f === 'pending-decrypt') {
      // 待解密：原始内容已加密
      return isEncrypted
    }
    return true
  })
})

// 计算当前选中项在过滤后数组中的索引
const activeIndexInFiltered = computed(() => {
  if (props.activeIndex < 0 || props.activeIndex >= props.files.length) return -1
  const activeFile = props.files[props.activeIndex]
  return displayedFiles.value.findIndex(f => f.id === activeFile.id)
})

function detectEncrypted(content: string): boolean {
  // 简化检测：如果是 base64 编码的且包含特殊字符，视为已加密
  return content.length > 20 && /^[A-Za-z0-9+/=]+$/.test(content.trim())
}

function handleFilterChange(e: Event) {
  const value = (e.target as HTMLSelectElement).value as FileFilter
  emit('update:filter', value)
}
</script>

<template>
  <div class="flex flex-col h-full">
    <div class="px-3 py-2 border-b border-dark-border bg-gradient-to-r from-dark-card to-dark-bg flex items-center justify-between gap-2">
      <h3 class="text-xs font-bold text-gray-200">文件列表</h3>
      <button
        class="flex items-center gap-1 px-2 py-1 rounded text-xs font-semibold border border-sky-400 bg-gradient-to-br from-sky-500 to-sky-600 text-white hover:from-sky-600 hover:to-sky-700 hover:shadow-md hover:shadow-sky-500/40 hover:-translate-y-0.5 active:translate-y-0 transition-all cursor-pointer"
        @click="emit('add')"
      >
        <Plus :size="11" />
        添加
      </button>
    </div>
    <!-- Filter Dropdown -->
    <div class="px-3 py-1.5 border-b border-dark-border bg-dark-bg">
      <div class="flex items-center gap-1.5">
        <Filter :size="12" class="text-gray-400" />
        <select
          :value="filter"
          class="flex-1 bg-dark-card border border-dark-border rounded px-1.5 py-1 text-xs text-gray-200 focus:outline-none focus:border-primary cursor-pointer"
          @change="handleFilterChange"
        >
          <option v-for="opt in filterOptions" :key="opt.value" :value="opt.value">
            {{ opt.label }}
          </option>
        </select>
      </div>
    </div>
    <div class="flex-1 overflow-y-auto">
      <div
        v-for="(file, index) in displayedFiles"
        :key="file.md5"
        class="flex items-center gap-1.5 px-3 py-1.5 cursor-pointer transition-all border-b border-dark-border/50"
        :class="index === activeIndexInFiltered ? 'bg-primary/15 border-l-3 border-l-primary' : 'hover:bg-dark-bg/70'"
        @click="emit('select', file.md5)"
      >
        <FileJson :size="13" class="text-gray-400 shrink-0" />
        <div class="flex-1 min-w-0">
          <p class="text-xs font-medium text-gray-200 truncate" :title="file.name">{{ file.name }}</p>
        </div>
        <Check v-if="file.status === 'done'" :size="12" class="text-green-400 shrink-0" />
        <AlertCircle v-else-if="file.status === 'error'" :size="12" class="text-red-400 shrink-0" />
      </div>
      <div v-if="displayedFiles.length === 0" class="px-4 py-8 text-center text-gray-500 text-sm">
        {{ files.length > 0 ? '筛选结果为空' : '暂无文件' }}
      </div>
    </div>
  </div>
</template>
