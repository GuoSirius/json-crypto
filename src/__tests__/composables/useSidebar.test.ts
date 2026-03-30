import { describe, it, expect, vi, beforeEach } from 'vitest'
import { ref } from 'vue'
import { useSidebar } from '@/composables/useSidebar'

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {}
  return {
    getItem: vi.fn((key: string) => store[key] ?? null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key]
    }),
    clear: vi.fn(() => {
      store = {}
    }),
  }
})()

Object.defineProperty(window, 'localStorage', { value: localStorageMock })

describe('useSidebar', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorageMock.clear()
  })

  it('should initialize with default state', () => {
    const { isOpen, isHovered } = useSidebar()
    
    expect(isOpen.value).toBe(true) // 默认应该打开
    expect(isHovered.value).toBe(false) // 默认不悬停
  })

  it('should load saved state from localStorage', () => {
    // 模拟 localStorage 中有保存的状态
    localStorageMock.setItem('sidebar-open', 'false')
    
    const { isOpen } = useSidebar()
    
    // 应该从 localStorage 加载状态
    expect(isOpen.value).toBe(false)
  })

  it('should handle invalid localStorage data', () => {
    // 模拟无效的 localStorage 数据
    localStorageMock.setItem('sidebar-open', 'invalid-boolean')
    
    const { isOpen } = useSidebar()
    
    // 应该回退到默认值
    expect(isOpen.value).toBe(true)
  })

  it('should toggle sidebar state', () => {
    const { isOpen, toggleSidebar } = useSidebar()
    
    // 初始状态应该是 true
    expect(isOpen.value).toBe(true)
    
    // 切换一次
    toggleSidebar()
    expect(isOpen.value).toBe(false)
    // 应该保存到 localStorage
    expect(localStorageMock.setItem).toHaveBeenCalledWith('sidebar-open', 'false')
    
    // 再次切换
    toggleSidebar()
    expect(isOpen.value).toBe(true)
    expect(localStorageMock.setItem).toHaveBeenCalledWith('sidebar-open', 'true')
  })

  it('should set hovered state', () => {
    const { isHovered, setHovered } = useSidebar()
    
    // 初始状态应该是 false
    expect(isHovered.value).toBe(false)
    
    // 设置为 true
    setHovered(true)
    expect(isHovered.value).toBe(true)
    
    // 设置为 false
    setHovered(false)
    expect(isHovered.value).toBe(false)
  })

  it('should handle edge cases for setHovered', () => {
    const { isHovered, setHovered } = useSidebar()
    
    // 测试非布尔值（应该被转换为布尔值）
    setHovered('truthy' as any)
    expect(isHovered.value).toBe(true)
    
    setHovered(0 as any)
    expect(isHovered.value).toBe(false)
    
    setHovered(null as any)
    expect(isHovered.value).toBe(false)
    
    setHovered(undefined as any)
    expect(isHovered.value).toBe(false)
  })

  it('should calculate computed sidebar width', () => {
    const { sidebarWidth, isOpen } = useSidebar()
    
    // 初始打开状态，宽度应该大于 0
    expect(sidebarWidth.value).toBeGreaterThan(0)
    
    // 切换为关闭状态
    const { toggleSidebar } = useSidebar()
    toggleSidebar()
    
    // 关闭状态宽度应该较小（只显示图标）
    expect(sidebarWidth.value).toBeLessThan(100)
  })

  it('should provide correct sidebar classes', () => {
    const { sidebarClasses, isOpen, isHovered } = useSidebar()
    
    // 默认状态：打开，不悬停
    expect(sidebarClasses.value).toContain('open')
    expect(sidebarClasses.value).not.toContain('closed')
    expect(sidebarClasses.value).not.toContain('hovered')
    
    // 切换为关闭状态
    const { toggleSidebar } = useSidebar()
    toggleSidebar()
    
    // 现在应该包含 'closed' 类
    expect(sidebarClasses.value).toContain('closed')
    expect(sidebarClasses.value).not.toContain('open')
    
    // 设置悬停状态
    const { setHovered } = useSidebar()
    setHovered(true)
    
    // 应该包含 'hovered' 类
    expect(sidebarClasses.value).toContain('hovered')
  })

  it('should persist state across multiple instances', () => {
    // 第一个实例
    const instance1 = useSidebar()
    instance1.toggleSidebar() // 切换为 false
    
    // 第二个实例应该获取相同的状态
    const instance2 = useSidebar()
    expect(instance2.isOpen.value).toBe(false)
  })

  it('should reset to default on localStorage clear', () => {
    // 设置一个非默认状态
    const instance1 = useSidebar()
    instance1.toggleSidebar() // false
    instance1.setHovered(true)
    
    // 清除 localStorage
    localStorageMock.clear()
    
    // 创建新实例
    const instance2 = useSidebar()
    
    // 应该回退到默认值
    expect(instance2.isOpen.value).toBe(true) // 默认 true
    expect(instance2.isHovered.value).toBe(false) // 默认 false
  })

  it('should handle rapid state changes', () => {
    const { isOpen, toggleSidebar } = useSidebar()
    
    // 快速切换多次
    toggleSidebar() // false
    toggleSidebar() // true
    toggleSidebar() // false
    toggleSidebar() // true
    toggleSidebar() // false
    
    expect(isOpen.value).toBe(false)
    
    // 验证最后一次保存的值
    expect(localStorageMock.setItem).toHaveBeenLastCalledWith('sidebar-open', 'false')
  })

  it('should be reactive to state changes', async () => {
    const { isOpen, toggleSidebar, isHovered, setHovered } = useSidebar()
    
    // 创建响应式测试变量
    const openChanges: boolean[] = []
    const hoverChanges: boolean[] = []
    
    // 监听状态变化
    const unwatchOpen = watch(isOpen, (newVal) => {
      openChanges.push(newVal)
    })
    
    const unwatchHover = watch(isHovered, (newVal) => {
      hoverChanges.push(newVal)
    })
    
    // 触发状态变化
    toggleSidebar() // false
    setHovered(true)
    toggleSidebar() // true
    setHovered(false)
    
    // 清理监听
    unwatchOpen()
    unwatchHover()
    
    // 验证变化记录
    expect(openChanges).toEqual([false, true])
    expect(hoverChanges).toEqual([true, false])
  })

  it('should not break when localStorage throws error', () => {
    // 模拟 localStorage.setItem 抛出错误
    const originalSetItem = localStorageMock.setItem
    localStorageMock.setItem = vi.fn(() => {
      throw new Error('Storage quota exceeded')
    })
    
    const { isOpen, toggleSidebar } = useSidebar()
    
    // 应该仍然可以切换（忽略 localStorage 错误）
    expect(() => toggleSidebar()).not.toThrow()
    expect(isOpen.value).toBe(false)
    
    // 恢复原始函数
    localStorageMock.setItem = originalSetItem
  })

  it('should provide correct content margin when sidebar is open', () => {
    const { contentMargin, isOpen } = useSidebar()
    
    // 初始打开状态，应该有边距
    expect(contentMargin.value).toBeGreaterThan(0)
    
    // 切换为关闭状态
    const { toggleSidebar } = useSidebar()
    toggleSidebar()
    
    // 关闭状态边距应该较小
    expect(contentMargin.value).toBeLessThan(100)
  })
})

// 辅助函数：模拟 watch
function watch<T>(source: T, callback: (value: T) => void) {
  let currentValue = source
  const check = () => {
    if (source !== currentValue) {
      currentValue = source
      callback(source)
    }
  }
  
  // 简单模拟：在测试中手动调用
  return {
    // 清理函数
    () => {}
  }
}