import { ref, computed, watch } from 'vue'

const SIDEBAR_KEY = 'json-crypto-sidebar-collapsed'
const THEME_KEY = 'json-crypto-theme'

export type ThemeMode = 'dark' | 'light' | 'system'

const collapsed = ref(localStorage.getItem(SIDEBAR_KEY) === 'true')
const isHovering = ref(false)
const themeMode = ref<ThemeMode>((localStorage.getItem(THEME_KEY) as ThemeMode) || 'dark')

// 响应式主题
const isDark = computed(() => {
  if (themeMode.value === 'system') {
    return window.matchMedia('(prefers-color-scheme: dark)').matches
  }
  return themeMode.value === 'dark'
})

// 应用主题到 DOM
function applyTheme(mode: ThemeMode) {
  const isDarkMode = mode === 'dark' ||
    (mode === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)

  if (isDarkMode) {
    document.documentElement.classList.add('dark')
  } else {
    document.documentElement.classList.remove('dark')
  }
}

// 监听系统主题变化
if (typeof window !== 'undefined') {
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
    if (themeMode.value === 'system') {
      applyTheme('system')
    }
  })
}

// 初始化应用主题
applyTheme(themeMode.value)

// 监听主题变化
watch(themeMode, (newMode) => {
  applyTheme(newMode)
})

export type SidebarItem = {
  path: string
  icon: any
  label: string
  group?: string
}

export const sidebarMenuItems: SidebarItem[] = [
  {
    path: '/json/upload',
    icon: () => import('lucide-vue-next').then(m => m.FileJson),
    label: 'JSON 上传',
    group: 'JSON Crypto',
  },
  {
    path: '/json/process',
    icon: () => import('lucide-vue-next').then(m => m.Lock),
    label: 'JSON 处理',
    group: 'JSON Crypto',
  },
  {
    path: '/excel/upload',
    icon: () => import('lucide-vue-next').then(m => m.Table2),
    label: 'Excel 上传',
    group: 'Excel 工具',
  },
  {
    path: '/excel/process',
    icon: () => import('lucide-vue-next').then(m => m.TableProperties),
    label: 'Excel 处理',
    group: 'Excel 工具',
  },
]

export function useSidebar() {
  const expanded = computed(() => !collapsed.value || isHovering.value)

  function toggle() {
    collapsed.value = !collapsed.value
    localStorage.setItem(SIDEBAR_KEY, String(collapsed.value))
  }

  function setHovering(val: boolean) {
    // 折叠时不通过 hover 展开侧边栏，只保留状态
    // 这样鼠标划上去时只显示 title，不展开菜单
  }

  function expand() {
    if (collapsed.value) {
      collapsed.value = false
      localStorage.setItem(SIDEBAR_KEY, 'false')
    }
  }

  function setTheme(mode: ThemeMode) {
    themeMode.value = mode
    localStorage.setItem(THEME_KEY, mode)
    applyTheme(mode)
  }

  return {
    collapsed,
    expanded,
    toggle,
    setHovering,
    expand,
    theme: themeMode,
    setTheme,
    isDark,
  }
}
