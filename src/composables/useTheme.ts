import { ref, computed, watchEffect, onScopeDispose } from 'vue'

export type ThemeMode = 'dark' | 'light' | 'system'
export type ResolvedTheme = 'dark' | 'light'

const STORAGE_KEY = 'json-crypto-theme'
const mediaQuery = typeof window !== 'undefined' ? window.matchMedia('(prefers-color-scheme: dark)') : null

const mode = ref<ThemeMode>((localStorage.getItem(STORAGE_KEY) as ThemeMode) || 'dark')

function getSystemTheme(): ResolvedTheme {
  return mediaQuery?.matches ? 'dark' : 'light'
}

const resolvedTheme = computed<ResolvedTheme>(() => {
  return mode.value === 'system' ? getSystemTheme() : mode.value
})

function applyTheme(theme: ResolvedTheme) {
  const root = document.documentElement
  if (theme === 'dark') {
    root.classList.add('dark')
  } else {
    root.classList.remove('dark')
  }
}

// 响应式监听 matchMedia 变化
let stopMediaListener: (() => void) | null = null

function startMediaListener() {
  if (!mediaQuery) return
  const handler = () => {
    if (mode.value === 'system') {
      applyTheme(getSystemTheme())
    }
  }
  mediaQuery.addEventListener('change', handler)
  stopMediaListener = () => mediaQuery.removeEventListener('change', handler)
}

function stopMediaListenerCleanup() {
  stopMediaListener?.()
  stopMediaListener = null
}

export function useTheme() {
  // 初始化：立即应用主题（同步，防闪烁）
  applyTheme(resolvedTheme.value)
  startMediaListener()

  // 响应式切换
  watchEffect(() => {
    applyTheme(resolvedTheme.value)
  })

  function setMode(newMode: ThemeMode) {
    mode.value = newMode
    localStorage.setItem(STORAGE_KEY, newMode)
  }

  function init() {
    // 在 main.ts 中调用，确保首次渲染前应用主题
    applyTheme(resolvedTheme.value)
    startMediaListener()
  }

  function dispose() {
    stopMediaListenerCleanup()
  }

  const isDark = computed(() => resolvedTheme.value === 'dark')

  return {
    mode,
    resolvedTheme,
    isDark,
    setTheme: setMode,
    init,
    dispose,
  }
}
