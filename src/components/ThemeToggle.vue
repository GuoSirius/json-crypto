<script setup lang="ts">
import { Monitor, Moon, Sun } from 'lucide-vue-next'
import { useTheme, type ThemeMode } from '../composables/useTheme'

const { mode, setMode } = useTheme()

const options: { value: ThemeMode; label: string; icon: typeof Monitor }[] = [
  { value: 'light', label: '亮色', icon: Sun },
  { value: 'dark', label: '暗黑', icon: Moon },
  { value: 'system', label: '跟随系统', icon: Monitor },
]
</script>

<template>
  <div class="flex items-center gap-1 rounded-xl p-1 bg-app-fill border border-app-border shadow-md">
    <button
      v-for="opt in options"
      :key="opt.value"
      class="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer relative"
      :class="mode === opt.value
        ? 'bg-gradient-to-br from-blue-500 to-purple-600 text-white shadow-lg shadow-blue-500/40 hover:shadow-xl hover:-translate-y-0.5 hover:scale-[1.02]'
        : 'bg-transparent text-app-text-regular hover:bg-gradient-to-br hover:from-blue-500/10 hover:to-purple-500/10 hover:text-blue-400 hover:shadow-md hover:shadow-blue-500/20 hover:-translate-y-0.5'"
      :title="opt.label"
      @click="setMode(opt.value)"
    >
      <component :is="opt.icon" :size="14" />
    </button>
  </div>
</template>
