<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { FileJson, Table2, PanelLeftClose, PanelLeftOpen, Sun, Moon, Monitor, ChevronDown } from 'lucide-vue-next'
import { useSidebar, sidebarMenuItems, type ThemeMode } from '../composables/useSidebar'

const route = useRoute()
const router = useRouter()
const { expanded, toggle, collapsed, theme, setTheme } = useSidebar()

const showThemeMenu = ref(false)

// 静态图标映射
const iconMap: Record<string, any> = {
  '/json/upload': FileJson,
  '/json/process': FileJson,
  '/excel/upload': Table2,
  '/excel/process': Table2,
}

function isActive(itemPath: string): boolean {
  return route.path === itemPath || route.path.startsWith(itemPath + '/')
}

function navigate(path: string) {
  router.push(path)
}

// 按组分类菜单
const menuGroups = computed(() => {
  const groups: { name: string; items: typeof sidebarMenuItems }[] = []
  for (const item of sidebarMenuItems) {
    const existing = groups.find(g => g.name === item.group)
    if (existing) {
      existing.items.push(item)
    } else {
      groups.push({ name: item.group!, items: [item] })
    }
  }
  return groups
})

// 主题选项
const themeOptions: { value: ThemeMode; label: string; icon: any }[] = [
  { value: 'light', label: '浅色', icon: Sun },
  { value: 'dark', label: '深色', icon: Moon },
  { value: 'system', label: '跟随系统', icon: Monitor },
]

const currentThemeOption = computed(() => {
  return themeOptions.find(opt => opt.value === theme.value) || themeOptions[2]
})

function selectTheme(mode: ThemeMode) {
  setTheme(mode)
  showThemeMenu.value = false
}

function toggleThemeMenu() {
  showThemeMenu.value = !showThemeMenu.value
}

// 点击外部关闭菜单
function handleClickOutside(event: MouseEvent) {
  const target = event.target as HTMLElement
  if (!target.closest('.theme-menu-container')) {
    showThemeMenu.value = false
  }
}

// 监听点击外部
if (typeof window !== 'undefined') {
  window.addEventListener('click', handleClickOutside)
}

const isDark = computed(() => {
  if (theme.value === 'system') {
    return window.matchMedia('(prefers-color-scheme: dark)').matches
  }
  return theme.value === 'dark'
})
</script>

<template>
  <aside
    class="sidebar"
    :class="[expanded ? 'sidebar-expanded' : 'sidebar-collapsed', { 'dark-theme': isDark, 'light-theme': !isDark }]"
  >
    <!-- Logo 区域 -->
    <div
      class="logo-area"
      @click="navigate('/json/upload')"
    >
      <div class="logo-icon">
        <FileJson :size="18" />
      </div>
      <transition name="fade-text">
        <span v-if="expanded" class="logo-text">
          JSON Crypto
        </span>
      </transition>
    </div>

    <!-- 菜单区域 -->
    <nav class="menu-area">
      <div v-for="group in menuGroups" :key="group.name" class="menu-group">
        <transition name="fade-text">
          <p v-if="expanded" class="menu-group-title">
            {{ group.name }}
          </p>
        </transition>
        <div class="menu-items">
          <button
            v-for="item in group.items"
            :key="item.path"
            class="menu-item"
            :class="{ 'menu-item-active': isActive(item.path) }"
            @click="navigate(item.path)"
          >
            <div v-if="isActive(item.path)" class="active-indicator" />
            <component
              :is="iconMap[item.path]"
              :size="18"
              class="menu-icon"
            />
            <transition name="fade-text">
              <span v-if="expanded" class="menu-label">
                {{ item.label }}
              </span>
            </transition>
            <!-- 自定义 Tooltip -->
            <span v-if="!expanded" class="menu-tooltip">
              {{ item.label }}
            </span>
          </button>
        </div>
      </div>
    </nav>

    <!-- 底部：主题切换 + 折叠按钮 -->
    <div class="bottom-area">
      <!-- 主题切换 - 展开时显示下拉菜单 -->
      <div v-if="expanded" class="theme-menu-container">
        <button
          class="bottom-button theme-button"
          @click.stop="toggleThemeMenu"
        >
          <component :is="currentThemeOption.icon" :size="16" />
          <span class="theme-button-label">{{ currentThemeOption.label }}</span>
          <ChevronDown :size="14" class="theme-chevron" :class="{ 'rotate-180': showThemeMenu }" />
        </button>
        <!-- 下拉菜单 - 宽度铺满 -->
        <div v-if="showThemeMenu" class="theme-dropdown">
          <button
            v-for="option in themeOptions"
            :key="option.value"
            class="theme-option"
            :class="{ 'theme-option-active': theme === option.value }"
            @click="selectTheme(option.value)"
          >
            <component :is="option.icon" :size="14" />
            <span>{{ option.label }}</span>
            <span v-if="theme === option.value" class="theme-check">✓</span>
          </button>
        </div>
      </div>

      <!-- 主题切换 - 收起时显示当前主题 -->
      <div v-if="!expanded" class="theme-mini-container">
        <button
          class="bottom-button bottom-button-icon"
          @click.stop="toggleThemeMenu"
        >
          <component :is="currentThemeOption.icon" :size="18" />
        </button>
        <!-- 收起时的迷你菜单 - 显示在右侧 -->
        <div v-if="showThemeMenu" class="theme-dropdown-mini" @click.stop>
          <button
            v-for="option in themeOptions"
            :key="option.value"
            class="theme-option-mini"
            :class="{ 'theme-option-active': theme === option.value }"
            @click="selectTheme(option.value)"
          >
            <component :is="option.icon" :size="16" />
          </button>
          <span class="theme-tooltip">{{ currentThemeOption.label }}</span>
        </div>
      </div>

      <!-- 折叠按钮 -->
      <button
        class="bottom-button"
        :class="expanded ? 'bottom-button-text' : 'bottom-button-icon'"
        :title="collapsed ? '展开侧边栏' : '收起侧边栏'"
        @click="toggle"
      >
        <component :is="collapsed ? PanelLeftOpen : PanelLeftClose" :size="16" />
        <transition name="fade-text">
          <span v-if="expanded">收起</span>
        </transition>
      </button>
    </div>
  </aside>
</template>

<style scoped>
.sidebar {
  position: fixed;
  left: 0;
  top: 0;
  bottom: 0;
  z-index: 40;
  display: flex;
  flex-direction: column;
  transition: all 0.3s ease-in-out;
}

/* 宽度 */
.sidebar-expanded {
  width: 208px;
}

.sidebar-collapsed {
  width: 56px;
  overflow: visible;
}

/* 浅色主题 */
.light-theme {
  background: linear-gradient(180deg, #ffffff 0%, #f8f9fc 100%);
  border-right: 1px solid #e5e7eb;
}

.light-theme .logo-area {
  border-bottom: 1px solid #e5e7eb;
}

.light-theme .logo-icon {
  background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%);
  color: white;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
}

.light-theme .logo-text {
  color: #1f2937;
  font-family: 'JetBrains Mono', monospace;
}

.light-theme .menu-group-title {
  color: #6b7280;
}

.light-theme .menu-item {
  color: #4b5563;
  background: transparent;
}

.light-theme .menu-item:hover {
  background: #f3f4f6;
  color: #111827;
}

.light-theme .menu-item-active {
  background: linear-gradient(90deg, rgba(59, 130, 246, 0.1) 0%, rgba(139, 92, 246, 0.1) 100%);
  color: #2563eb;
  border: 1px solid rgba(59, 130, 246, 0.2);
  box-shadow: 0 2px 8px rgba(59, 130, 246, 0.1);
}

.light-theme .active-indicator {
  background: #3b82f6;
}

.light-theme .menu-icon {
  color: #6b7280;
}

.light-theme .menu-item-active .menu-icon {
  color: #2563eb;
}

.light-theme .bottom-area {
  border-top: 1px solid #e5e7eb;
}

.light-theme .bottom-button {
  background: #f3f4f6;
  color: #4b5563;
}

.light-theme .bottom-button:hover {
  background: #e5e7eb;
  color: #111827;
}

/* 深色主题 */
.dark-theme {
  background: linear-gradient(180deg, #1a1a2e 0%, #16162a 100%);
  border-right: 1px solid #2d2d44;
}

.dark-theme .logo-area {
  border-bottom: 1px solid #2d2d44;
}

.dark-theme .logo-icon {
  background: linear-gradient(135deg, rgba(59, 130, 246, 0.3) 0%, rgba(139, 92, 246, 0.3) 100%);
  border: 1px solid rgba(59, 130, 246, 0.3);
  color: white;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
}

.dark-theme .logo-text {
  color: #ffffff;
  font-family: 'JetBrains Mono', monospace;
}

.dark-theme .menu-group-title {
  color: #6b7280;
}

.dark-theme .menu-item {
  color: #9ca3af;
  background: transparent;
  border: 1px solid transparent;
}

.dark-theme .menu-item:hover {
  background: #252540;
  color: #ffffff;
}

.dark-theme .menu-item-active {
  background: linear-gradient(90deg, rgba(59, 130, 246, 0.2) 0%, rgba(139, 92, 246, 0.2) 100%);
  color: #60a5fa;
  border: 1px solid rgba(59, 130, 246, 0.3);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.15);
}

.dark-theme .active-indicator {
  background: #3b82f6;
}

.dark-theme .menu-icon {
  color: #6b7280;
}

.dark-theme .menu-item-active .menu-icon {
  color: #60a5fa;
}

.dark-theme .bottom-area {
  border-top: 1px solid #2d2d44;
}

.dark-theme .bottom-button {
  background: #252540;
  color: #9ca3af;
}

.dark-theme .bottom-button:hover {
  background: #2d2d4a;
  color: #ffffff;
}

/* 通用样式 */
.logo-area {
  display: flex;
  align-items: center;
  gap: 10px;
  height: 56px;
  padding: 0 12px;
  cursor: pointer;
  transition: background 0.2s;
}

.logo-icon {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.logo-text {
  font-size: 14px;
  font-weight: 700;
  white-space: nowrap;
  overflow: hidden;
}

.menu-area {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  padding: 16px 10px;
}

.sidebar-collapsed .menu-area {
  overflow-x: visible;
  overflow-y: visible;
}

.menu-group {
  margin-bottom: 16px;
}

.menu-group-title {
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  padding: 0 10px;
  margin-bottom: 8px;
}

.menu-items {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.menu-item {
  position: relative;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px;
  border-radius: 12px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  width: 100%;
  text-align: left;
  border: none;
  outline: none;
}

.menu-item-active {
  transform: translateX(2px);
}

.active-indicator {
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 4px;
  height: 24px;
  border-radius: 0 4px 4px 0;
}

.menu-icon {
  flex-shrink: 0;
  transition: transform 0.2s;
}

.menu-item:hover .menu-icon {
  transform: scale(1.1);
}

/* 菜单项自定义 Tooltip */
.menu-tooltip {
  position: absolute;
  left: 100%;
  top: 50%;
  transform: translateY(-50%);
  margin-left: 8px;
  padding: 6px 12px;
  background: #1e1e3f;
  color: #fff;
  font-size: 12px;
  font-weight: 600;
  border-radius: 8px;
  white-space: nowrap;
  opacity: 0;
  visibility: hidden;
  transition: all 0.2s;
  pointer-events: none;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  z-index: 50;
}

.menu-tooltip::before {
  content: '';
  position: absolute;
  right: 100%;
  top: 50%;
  transform: translateY(-50%);
  border: 5px solid transparent;
  border-right-color: #1e1e3f;
}

.menu-item:hover .menu-tooltip {
  opacity: 1;
  visibility: visible;
}

.light-theme .menu-tooltip {
  background: white;
  color: #1f2937;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.light-theme .menu-tooltip::before {
  border-right-color: white;
}

.menu-label {
  font-size: 13px;
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
}

.bottom-area {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 8px;
  border-top: 1px solid;
}

.bottom-button {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 10px;
  border-radius: 10px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
  outline: none;
}

.bottom-button-text {
  justify-content: flex-start;
}

.bottom-button-icon {
  padding: 10px;
}

/* 主题下拉菜单 */
.theme-menu-container {
  position: relative;
}

.theme-button {
  width: 100%;
}

.theme-button-label {
  flex: 1;
  text-align: left;
}

.theme-chevron {
  transition: transform 0.2s;
}

.rotate-180 {
  transform: rotate(180deg);
}

.theme-dropdown {
  position: absolute;
  bottom: 100%;
  left: -8px;
  right: -8px;
  margin-bottom: 4px;
  background: inherit;
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 0 -4px 16px rgba(0, 0, 0, 0.15);
  width: calc(100% + 16px);
}

.light-theme .theme-dropdown {
  background: white;
  border: 1px solid #e5e7eb;
}

.dark-theme .theme-dropdown {
  background: #1e1e3f;
  border: 1px solid #2d2d44;
}

.theme-option {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  padding: 10px 12px;
  font-size: 12px;
  font-weight: 600;
  border: none;
  cursor: pointer;
  transition: all 0.15s;
  text-align: left;
}

.light-theme .theme-option {
  background: white;
  color: #4b5563;
}

.light-theme .theme-option:hover {
  background: #f3f4f6;
  color: #111827;
}

.dark-theme .theme-option {
  background: #1e1e3f;
  color: #9ca3af;
}

.dark-theme .theme-option:hover {
  background: #252540;
  color: #ffffff;
}

.theme-option-active {
  color: #3b82f6 !important;
}

.theme-check {
  margin-left: auto;
  color: #3b82f6;
}

/* 收起状态的主题容器 */
.theme-mini-container {
  position: relative;
}

/* 收起状态的迷你下拉菜单 - 显示在右侧 */
.theme-dropdown-mini {
  position: absolute;
  bottom: -8px;
  left: 100%;
  margin-left: 16px;
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 4px;
  padding: 6px;
  border-radius: 10px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
  z-index: 50;
}

.light-theme .theme-dropdown-mini {
  background: white;
  border: 1px solid #e5e7eb;
}

.dark-theme .theme-dropdown-mini {
  background: #1e1e3f;
  border: 1px solid #2d2d44;
}

.theme-option-mini {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 36px;
  border-radius: 8px;
  border: none;
  cursor: pointer;
  transition: all 0.15s;
}

.light-theme .theme-option-mini {
  background: white;
  color: #6b7280;
}

.light-theme .theme-option-mini:hover {
  background: #f3f4f6;
  color: #111827;
}

.dark-theme .theme-option-mini {
  background: #1e1e3f;
  color: #6b7280;
}

.dark-theme .theme-option-mini:hover {
  background: #252540;
  color: #ffffff;
}

.theme-option-mini.theme-option-active {
  background: rgba(59, 130, 246, 0.2);
  color: #3b82f6;
}

/* 主题迷你菜单的当前选项 tooltip */
.theme-tooltip {
  padding: 6px 10px;
  background: #1e1e3f;
  color: #fff;
  font-size: 11px;
  font-weight: 600;
  border-radius: 6px;
  white-space: nowrap;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}

.light-theme .theme-tooltip {
  background: white;
  color: #1f2937;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

/* 动画 */
.fade-text-enter-active,
.fade-text-leave-active {
  transition: opacity 0.15s ease;
}

.fade-text-enter-from,
.fade-text-leave-to {
  opacity: 0;
}
</style>
