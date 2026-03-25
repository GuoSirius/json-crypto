<script setup lang="ts">
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import { Copy, Check, Download, Trash2, RotateCcw, Lock, Unlock } from 'lucide-vue-next'
import type { CryptoMode } from '../types'

const props = defineProps<{
  label: string
  modelValue: string
  readonly?: boolean
  mode?: CryptoMode
  hasSource?: boolean
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
  'download': []
  'clear': []
  'refresh': []
  'encrypt': []
  'decrypt': []
}>()

const copied = ref(false)

function handleCopy() {
  if (!props.modelValue) {
    ElMessage.warning('没有可复制的内容')
    return
  }
  navigator.clipboard.writeText(props.modelValue).then(() => {
    copied.value = true
    ElMessage.success('已复制到剪贴板')
    setTimeout(() => { copied.value = false }, 1500)
  })
}

function handleDownload() {
  if (!props.modelValue) {
    ElMessage.warning('没有可下载的内容')
    return
  }
  emit('download')
}

function handleClear() {
  emit('clear')
}

function handleRefresh() {
  emit('refresh')
}

function handleEncrypt() {
  emit('encrypt')
}

function handleDecrypt() {
  emit('decrypt')
}

function handleInput(e: Event) {
  emit('update:modelValue', (e.target as HTMLTextAreaElement).value)
}
</script>

<template>
  <div class="flex flex-col h-full rounded-xl border border-app-border bg-app-bg overflow-hidden shadow-lg">
    <div class="flex items-center justify-between px-4 py-2.5 bg-gradient-to-r from-app-card to-app-bg border-b border-app-border">
      <span class="text-xs font-bold text-app-text-regular uppercase tracking-wide">{{ label }}</span>
      <div class="flex items-center gap-1.5">
        <button
          v-if="!readonly"
          class="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold border border-orange-400 bg-gradient-to-br from-orange-500 to-orange-600 text-white hover:from-orange-600 hover:to-orange-700 hover:shadow-md hover:shadow-orange-500/40 hover:-translate-y-0.5 active:translate-y-0 transition-all cursor-pointer"
          @click="handleRefresh"
        >
          <RotateCcw :size="12" />
          还原
        </button>
        <button
          v-if="!readonly && mode === 'encrypt'"
          class="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold border-2 border-emerald-400 bg-gradient-to-br from-emerald-500 to-emerald-600 text-white hover:from-emerald-600 hover:to-emerald-700 hover:shadow-md hover:shadow-emerald-500/40 hover:-translate-y-0.5 active:translate-y-0 transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:translate-y-0"
          :disabled="!hasSource"
          @click="handleEncrypt"
        >
          <Lock :size="12" />
          加密
        </button>
        <button
          v-if="!readonly && mode === 'decrypt'"
          class="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold border-2 border-fuchsia-400 bg-gradient-to-br from-fuchsia-500 to-fuchsia-600 text-white hover:from-fuchsia-600 hover:to-fuchsia-700 hover:shadow-md hover:shadow-fuchsia-500/40 hover:-translate-y-0.5 active:translate-y-0 transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:translate-y-0"
          :disabled="!hasSource"
          @click="handleDecrypt"
        >
          <Unlock :size="12" />
          解密
        </button>
        <button
          class="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold border border-indigo-400 bg-gradient-to-br from-indigo-500 to-indigo-600 text-white hover:from-indigo-600 hover:to-indigo-700 hover:shadow-md hover:shadow-indigo-500/40 hover:-translate-y-0.5 active:translate-y-0 transition-all cursor-pointer"
          @click="handleDownload"
        >
          <Download :size="12" />
          下载
        </button>
        <button
          v-if="readonly && modelValue"
          class="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold border border-red-400 bg-gradient-to-br from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700 hover:shadow-md hover:shadow-red-500/40 hover:-translate-y-0.5 active:translate-y-0 transition-all cursor-pointer"
          @click="handleClear"
        >
          <Trash2 :size="12" />
          清空
        </button>
        <button
          class="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold border border-teal-400 bg-gradient-to-br from-teal-500 to-teal-600 text-white hover:from-teal-600 hover:to-teal-700 hover:shadow-md hover:shadow-teal-500/40 hover:-translate-y-0.5 active:translate-y-0 transition-all cursor-pointer"
          @click="handleCopy"
        >
          <Check v-if="copied" :size="12" class="text-green-400" />
          <Copy v-else :size="12" />
          {{ copied ? '已复制' : '复制' }}
        </button>
      </div>
    </div>
    <textarea
      :value="modelValue"
      :readonly="readonly"
      class="flex-1 w-full p-4 bg-transparent text-sm text-app-text-primary font-mono resize-none focus:outline-none placeholder-app-text-placeholder box-border"
      placeholder="数据将显示在此处..."
      @input="handleInput"
    ></textarea>
  </div>
</template>
