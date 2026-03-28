<script setup lang="ts">
import { computed } from 'vue'
import { FileJson, Check, AlertCircle, Plus, Filter, Search, X } from 'lucide-vue-next'
import type { JsonFile } from '../types'
import type { FileFilter } from '../stores/jsonStore'

const props = defineProps<{
  files: JsonFile[]
  activeIndex: number
  filter: FileFilter
  searchKeyword: string
}>()

const emit = defineEmits<{
  select: [md5: string]
  add: []
  'update:filter': [filter: FileFilter]
  'update:searchKeyword': [keyword: string]
}>()

const filterOptions: { value: FileFilter; label: string }[] = [
  { value: 'all', label: '全部' },
  { value: 'pending-encrypt', label: '待加密' },
  { value: 'pending-decrypt', label: '待解密' },
  { value: 'unencrypted', label: '未加密' },
  { value: 'undecrypted', label: '未解密' },
]

const displayedFiles = computed(() => {
  const f = props.filter
  const keyword = props.searchKeyword.toLowerCase().trim()
  
  return props.files.filter(file => {
    // 文件名搜索过滤
    if (keyword && !file.name.toLowerCase().includes(keyword)) {
      return false
    }
    
    // 状态过滤
    if (f === 'all') {
      return true
    }
    // 根据原始文件内容判断是否需要加密或解密
    const isEncrypted = detectEncrypted(file.content)
    
    if (f === 'pending-encrypt') {
      // 待加密：原始内容需要加密
      return !isEncrypted
    } else if (f === 'pending-decrypt') {
      // 待解密：原始内容需要解密
      return isEncrypted
    } else if (f === 'unencrypted') {
      // 未加密：原始内容需要加密，但尚未处理
      return !isEncrypted && !file.processed
    } else if (f === 'undecrypted') {
      // 未解密：原始内容需要解密，但是尚未处理
      return isEncrypted && !file.processed
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

function handleSearchInput(e: Event) {
  const value = (e.target as HTMLInputElement).value
  emit('update:searchKeyword', value)
}

function clearSearch() {
  emit('update:searchKeyword', '')
}
</script>

<template>
  <div class="flex flex-col h-full">
    <div class="px-3 py-2 border-b border-app-border bg-gradient-to-r from-app-card to-app-bg flex items-center justify-between gap-2">
      <h3 class="text-xs font-bold text-app-text-primary">文件列表</h3>
      <button
        class="flex items-center gap-1 px-2 py-1 rounded text-xs font-semibold border border-sky-400 bg-gradient-to-br from-sky-500 to-sky-600 text-white hover:from-sky-600 hover:to-sky-700 hover:shadow-md hover:shadow-sky-500/40 hover:-translate-y-0.5 active:translate-y-0 transition-all cursor-pointer"
        @click="emit('add')"
      >
        <Plus :size="11" />
        添加
      </button>
    </div>
    <!-- Filter Dropdown -->
    <div class="px-3 py-1.5 border-b border-app-border bg-app-bg">
      <div class="flex items-center gap-1.5">
        <Filter :size="12" class="text-app-text-regular" />
        <select
          :value="filter"
          class="flex-1 bg-app-card border border-app-border rounded px-1.5 py-1 text-xs text-app-text-primary focus:outline-none focus:border-primary cursor-pointer"
          @change="handleFilterChange"
        >
          <option v-for="opt in filterOptions" :key="opt.value" :value="opt.value">
            {{ opt.label }}
          </option>
        </select>
      </div>
    </div>
    <!-- Search Input -->
    <div class="px-2 py-1.5 border-b border-app-border bg-app-bg">
      <div class="relative w-full">
        <Search :size="11" class="absolute left-2 top-1/2 -translate-y-1/2 text-app-text-regular shrink-0" />
        <input
          type="text"
          :value="searchKeyword"
          @input="handleSearchInput"
          placeholder="输入关键词查找..."
          class="w-full bg-app-card border border-app-border rounded pl-6.5 pr-7 py-1 text-xs text-app-text-primary placeholder-app-text-placeholder focus:outline-none focus:border-primary transition-colors box-border min-w-0"
        />
        <X
          v-if="searchKeyword"
          :size="11"
          class="absolute right-2 top-1/2 -translate-y-1/2 text-app-text-regular hover:text-app-text-primary cursor-pointer shrink-0 z-10"
          @click="clearSearch"
        />
      </div>
    </div>
    <div class="flex-1 overflow-y-auto">
      <div
        v-for="(file, index) in displayedFiles"
        :key="file.md5"
        class="flex items-center gap-1.5 px-3 py-1.5 cursor-pointer transition-all border-b border-app-border/50"
        :class="index === activeIndexInFiltered ? 'bg-primary/15 border-l-3 border-l-primary' : 'hover:bg-app-fill'"
        @click="emit('select', file.md5)"
      >
        <FileJson :size="13" class="text-app-text-regular shrink-0" />
        <div class="flex-1 min-w-0">
          <p class="text-xs font-medium text-app-text-primary truncate" :title="file.name">{{ file.name }}</p>
        </div>
        <!-- 来源标签 -->
        <span
          v-if="file.source === 'excel-import'"
          class="text-[9px] px-1 py-0.5 rounded bg-violet-500/20 text-violet-400 border border-violet-500/30 shrink-0"
          title="来自Excel带入"
        >
          Excel
        </span>
        <Check v-if="file.status === 'done'" :size="12" class="text-green-400 shrink-0" />
        <AlertCircle v-else-if="file.status === 'error'" :size="12" class="text-red-400 shrink-0" />
      </div>
      <div v-if="displayedFiles.length === 0" class="px-4 py-8 text-center text-app-text-placeholder text-sm">
        {{ files.length > 0 ? '筛选结果为空' : '暂无文件' }}
      </div>
    </div>
  </div>
</template>
