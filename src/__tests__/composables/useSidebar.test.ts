import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { useSidebar } from '@/composables/useSidebar'

// Mock localStorage
const localStorageMock = {
  store: {} as Record<string, string>,
  getItem: vi.fn((key: string) => localStorageMock.store[key] ?? null),
  setItem: vi.fn((key: string, value: string) => {
    localStorageMock.store[key] = value
  }),
  removeItem: vi.fn((key: string) => {
    delete localStorageMock.store[key]
  }),
  clear: vi.fn(() => {
    localStorageMock.store = {}
  }),
}

// 保存原始 localStorage
const originalLocalStorage = window.localStorage

describe('useSidebar', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorageMock.clear()
    Object.defineProperty(window, 'localStorage', { 
      value: localStorageMock,
      writable: true,
      configurable: true
    })
    // 重置模块缓存，让 useSidebar 重新加载
    vi.resetModules()
  })

  afterEach(() => {
    // 恢复原始 localStorage
    Object.defineProperty(window, 'localStorage', {
      value: originalLocalStorage,
      writable: true,
      configurable: true
    })
  })

  it('should initialize with default state', async () => {
    // 重新导入模块以确保使用模拟的 localStorage
    const { useSidebar } = await import('@/composables/useSidebar')
    const { collapsed } = useSidebar()
    
    // 默认应该打开，所以 collapsed 应该是 false
    expect(collapsed.value).toBe(false)
  })

  it('should load saved state from localStorage', async () => {
    // 设置 localStorage 状态
    localStorageMock.store['json-crypto-sidebar-collapsed'] = 'true'
    
    // 重新导入模块
    const { useSidebar } = await import('@/composables/useSidebar')
    const { collapsed } = useSidebar()
    
    // 应该从 localStorage 加载状态
    expect(collapsed.value).toBe(true)
  })

  it('should handle invalid localStorage data', async () => {
    // 设置无效的 localStorage 数据
    localStorageMock.store['json-crypto-sidebar-collapsed'] = 'invalid-boolean'
    
    // 重新导入模块
    const { useSidebar } = await import('@/composables/useSidebar')
    const { collapsed } = useSidebar()
    
    // 应该回退到默认状态 (false)
    expect(collapsed.value).toBe(false)
  })

  it('should toggle sidebar state', async () => {
    // 重新导入模块
    const { useSidebar } = await import('@/composables/useSidebar')
    const { collapsed, toggle } = useSidebar()
    
    // 初始状态
    expect(collapsed.value).toBe(false)
    
    // 切换
    toggle()
    expect(collapsed.value).toBe(true)
    expect(localStorageMock.setItem).toHaveBeenCalledWith('json-crypto-sidebar-collapsed', 'true')
    
    // 再次切换
    toggle()
    expect(collapsed.value).toBe(false)
    expect(localStorageMock.setItem).toHaveBeenCalledWith('json-crypto-sidebar-collapsed', 'false')
  })

  it('should not break when localStorage throws error', async () => {
    // 模拟 localStorage 抛出错误
    const originalSetItem = localStorageMock.setItem
    localStorageMock.setItem.mockImplementation(() => {
      throw new Error('Storage error')
    })
    
    // 重新导入模块
    const { useSidebar } = await import('@/composables/useSidebar')
    const { collapsed, toggle } = useSidebar()
    const initialCollapsed = collapsed.value
    
    // 模拟 console.error
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    
    // 调用 toggle，它应该不抛出错误
    expect(() => toggle()).not.toThrow()
    
    // toggle 应该仍然改变状态
    expect(collapsed.value).toBe(!initialCollapsed)
    
    // 验证 console.error 被调用
    expect(consoleSpy).toHaveBeenCalled()
    
    // 清理
    consoleSpy.mockRestore()
    
    // 恢复原始实现
    localStorageMock.setItem.mockImplementation(originalSetItem)
  })

  it('should calculate expanded correctly', async () => {
    // 重新导入模块
    const { useSidebar } = await import('@/composables/useSidebar')
    const { collapsed, expanded } = useSidebar()
    
    // 初始状态：collapsed = false, expanded = true
    expect(collapsed.value).toBe(false)
    expect(expanded.value).toBe(true)
    
    // 切换状态
    const { toggle } = useSidebar()
    toggle()
    expect(collapsed.value).toBe(true)
    expect(expanded.value).toBe(false)
  })

  it('should handle theme mode', async () => {
    // 重新导入模块
    const { useSidebar } = await import('@/composables/useSidebar')
    const { theme } = useSidebar()
    
    // 默认主题应该是 'dark'
    expect(theme.value).toBe('dark')
  })

  it('should set theme correctly', async () => {
    // 重新导入模块
    const { useSidebar } = await import('@/composables/useSidebar')
    const { theme, setTheme } = useSidebar()
    
    // 初始主题
    expect(theme.value).toBe('dark')
    
    // 设置主题为 light
    setTheme('light')
    expect(theme.value).toBe('light')
    expect(localStorageMock.setItem).toHaveBeenCalledWith('json-crypto-theme', 'light')
    
    // 设置主题为 system
    setTheme('system')
    expect(theme.value).toBe('system')
    expect(localStorageMock.setItem).toHaveBeenCalledWith('json-crypto-theme', 'system')
  })
})