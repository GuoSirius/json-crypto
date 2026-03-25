<script setup lang="ts">
import { ref } from 'vue'
import type { CryptoAlgorithm, CryptoMode } from '../types'
import { Eye, EyeOff } from 'lucide-vue-next'

const props = defineProps<{
  algorithm: CryptoAlgorithm
  secretKey: string
  mode: CryptoMode
}>()

const emit = defineEmits<{
  'update:algorithm': [value: CryptoAlgorithm]
  'update:secretKey': [value: string]
  'update:mode': [value: CryptoMode]
}>()

const showKey = ref(false)

function updateKey(event: Event) {
  emit('update:secretKey', (event.target as HTMLInputElement).value)
}

const algorithms: { label: string; value: CryptoAlgorithm }[] = [
  { label: 'AES', value: 'AES' },
  { label: 'DES', value: 'DES' },
  { label: 'TripleDES', value: 'TripleDES' },
  { label: 'RC4', value: 'RC4' },
  { label: 'Rabbit', value: 'Rabbit' },
  { label: 'Base64', value: 'Base64' },
]
</script>

<template>
  <div class="flex items-center gap-4">
    <div class="flex items-center gap-2 whitespace-nowrap">
      <span class="text-sm font-semibold text-app-text-regular">算法</span>
      <el-select
        :model-value="algorithm"
        size="default"
        class="w-36!"
        @update:model-value="emit('update:algorithm', $event as CryptoAlgorithm)"
      >
        <el-option
          v-for="algo in algorithms"
          :key="algo.value"
          :label="algo.label"
          :value="algo.value"
        />
      </el-select>
    </div>

    <div class="h-6 w-px bg-app-border/60"></div>

    <div class="flex items-center gap-2">
      <span class="text-sm font-semibold text-app-text-regular">模式</span>
      <el-radio-group
        :model-value="mode"
        size="default"
        class="mode-group"
        @update:model-value="emit('update:mode', $event as CryptoMode)"
      >
        <el-radio-button value="encrypt">加密</el-radio-button>
        <el-radio-button value="decrypt">解密</el-radio-button>
      </el-radio-group>
    </div>

    <div class="h-6 w-px bg-app-border/60"></div>

    <div class="flex items-center gap-2">
      <span class="text-sm font-semibold text-app-text-regular">密钥</span>
      <div class="relative">
        <input
          :value="secretKey"
          :type="showKey ? 'text' : 'password'"
          placeholder="输入密钥..."
          class="px-3 py-2.5 pr-10 w-52 bg-app-fill border-2 border-app-border rounded-xl text-sm text-app-text-primary focus:outline-none focus:border-primary/60 focus:ring-2 focus:ring-primary/30 transition-all placeholder-app-text-placeholder"
          @input="updateKey"
        />
        <button
          type="button"
          class="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center bg-app-fill border border-app-border/60 rounded-lg text-app-text-regular hover:text-primary hover:border-primary/50 hover:bg-app-fill-strong transition-all cursor-pointer"
          @click="showKey = !showKey"
        >
          <EyeOff v-if="showKey" :size="16" />
          <Eye v-else :size="16" />
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.mode-group :deep(.el-radio-button__inner) {
  background-color: var(--app-fill) !important;
  border-color: var(--app-border) !important;
  color: var(--app-text-regular) !important;
  box-shadow: none !important;
  transition: all 0.3s ease;
}

.mode-group :deep(.el-radio-button__inner:hover) {
  color: var(--app-text-primary) !important;
  background-color: var(--app-fill-strong) !important;
}

.mode-group :deep(.el-radio-button.is-active .el-radio-button__inner) {
  background-color: var(--el-color-primary) !important;
  border-color: var(--el-color-primary) !important;
  color: white !important;
  box-shadow: 0 0 0 2px color-mix(in srgb, var(--el-color-primary) 30%, transparent) !important;
}

.mode-group :deep(.el-radio-button:first-child .el-radio-button__inner) {
  border-top-left-radius: 0.5rem;
  border-bottom-left-radius: 0.5rem;
}

.mode-group :deep(.el-radio-button:last-child .el-radio-button__inner) {
  border-top-right-radius: 0.5rem;
  border-bottom-right-radius: 0.5rem;
}
</style>
