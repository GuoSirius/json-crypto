import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createRouter, createWebHistory } from 'vue-router'
import AppSidebar from '@/components/AppSidebar.vue'

// Mock useSidebar composable
vi.mock('@/composables/useSidebar', () => ({
  useSidebar: vi.fn(() => ({
    isOpen: true,
    toggleSidebar: vi.fn(),
    isHovered: false,
    setHovered: vi.fn(),
  }))
}))

// Mock useTheme composable
vi.mock('@/composables/useTheme', () => ({
  useTheme: vi.fn(() => ({
    theme: 'light',
    setTheme: vi.fn(),
  }))
}))

// Mock router
const mockRouter = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', name: 'upload', component: { template: '<div>Upload</div>' } },
    { path: '/process', name: 'process', component: { template: '<div>Process</div>' } },
    { path: '/excel-upload', name: 'excel-upload', component: { template: '<div>Excel Upload</div>' } },
    { path: '/excel-process', name: 'excel-process', component: { template: '<div>Excel Process</div>' } },
  ]
})

describe('AppSidebar.vue', () => {
  it('renders correctly with default state', async () => {
    const wrapper = mount(AppSidebar, {
      global: {
        plugins: [mockRouter],
      }
    })

    // 侧边栏应该渲染
    expect(wrapper.find('.sidebar').exists()).toBe(true)
    
    // 应该包含导航链接
    expect(wrapper.find('nav').exists()).toBe(true)
    
    // 应该包含主题切换按钮
    expect(wrapper.find('.theme-button').exists()).toBe(true)
  })

  it('renders navigation items correctly', async () => {
    const wrapper = mount(AppSidebar, {
      global: {
        plugins: [mockRouter],
      }
    })

    // 应该包含所有导航项
    const navItems = wrapper.findAll('.menu-item')
    expect(navItems.length).toBe(4)
    
    // 检查导航项文本（当侧边栏展开时）
    const navTexts = navItems.map(item => item.text())
    expect(navTexts).toContain('JSON上传')
    expect(navTexts).toContain('JSON处理')
    expect(navTexts).toContain('Excel上传')
    expect(navTexts).toContain('Excel处理')
  })

  it('applies active class to current route', async () => {
    // 设置当前路由为 /process
    await mockRouter.push('/process')
    
    const wrapper = mount(AppSidebar, {
      global: {
        plugins: [mockRouter],
      }
    })

    // 等待路由解析完成
    await wrapper.vm.$nextTick()
    
    // 找到处理页面的导航项
    // 注意：AppSidebar 使用 button 元素，没有 href 属性
    const processNavItems = wrapper.findAll('.menu-item')
    const processNavItem = processNavItems.find(item => item.text().includes('JSON处理'))
    expect(processNavItem?.exists()).toBe(true)
    
    // 应该应用 active 类
    expect(processNavItem?.classes()).toContain('menu-item-active')
  })

  it('toggles sidebar when toggle button is clicked', async () => {
    const mockToggleSidebar = vi.fn()
    
    // 重新 mock useSidebar 以捕获点击
    vi.mocked(require('@/composables/useSidebar').useSidebar).mockReturnValueOnce({
      isOpen: true,
      toggleSidebar: mockToggleSidebar,
      isHovered: false,
      setHovered: vi.fn(),
    })
    
    const wrapper = mount(AppSidebar, {
      global: {
        plugins: [mockRouter],
      }
    })

    // 找到切换按钮
    const toggleButton = wrapper.find('.sidebar-toggle')
    expect(toggleButton.exists()).toBe(true)
    
    // 点击切换按钮
    await toggleButton.trigger('click')
    
    // 应该调用 toggleSidebar 方法
    expect(mockToggleSidebar).toHaveBeenCalledTimes(1)
  })

  it('shows tooltips when sidebar is collapsed', async () => {
    // Mock sidebar 为关闭状态
    vi.mocked(require('@/composables/useSidebar').useSidebar).mockReturnValueOnce({
      isOpen: false,
      toggleSidebar: vi.fn(),
      isHovered: false,
      setHovered: vi.fn(),
    })
    
    const wrapper = mount(AppSidebar, {
      global: {
        plugins: [mockRouter],
      }
    })

    // 当侧边栏关闭时，应该显示工具提示
    const navItems = wrapper.findAll('.nav-item')
    navItems.forEach(item => {
      // 每个导航项都应该有 title 属性用于工具提示
      expect(item.attributes('title')).toBeTruthy()
    })
  })

  it('handles mouse hover events', async () => {
    const mockSetHovered = vi.fn()
    
    // 重新 mock useSidebar
    vi.mocked(require('@/composables/useSidebar').useSidebar).mockReturnValueOnce({
      isOpen: false,
      toggleSidebar: vi.fn(),
      isHovered: false,
      setHovered: mockSetHovered,
    })
    
    const wrapper = mount(AppSidebar, {
      global: {
        plugins: [mockRouter],
      }
    })

    // 触发鼠标进入事件
    await wrapper.find('.sidebar').trigger('mouseenter')
    
    // 应该调用 setHovered(true)
    expect(mockSetHovered).toHaveBeenCalledWith(true)
    
    // 触发鼠标离开事件
    await wrapper.find('.sidebar').trigger('mouseleave')
    
    // 应该调用 setHovered(false)
    expect(mockSetHovered).toHaveBeenCalledWith(false)
  })

  it('renders theme toggle component', async () => {
    const wrapper = mount(AppSidebar, {
      global: {
        plugins: [mockRouter],
      }
    })

    // 应该包含 ThemeToggle 组件
    const themeToggle = wrapper.findComponent({ name: 'ThemeToggle' })
    expect(themeToggle.exists()).toBe(true)
  })

  it('applies correct CSS classes based on sidebar state', async () => {
    // 测试打开状态
    vi.mocked(require('@/composables/useSidebar').useSidebar).mockReturnValueOnce({
      isOpen: true,
      toggleSidebar: vi.fn(),
      isHovered: false,
      setHovered: vi.fn(),
    })
    
    const wrapperOpen = mount(AppSidebar, {
      global: {
        plugins: [mockRouter],
      }
    })
    
    // 当侧边栏打开时，应该应用 'open' 类
    expect(wrapperOpen.find('.sidebar').classes()).toContain('open')
    
    // 测试关闭状态
    vi.mocked(require('@/composables/useSidebar').useSidebar).mockReturnValueOnce({
      isOpen: false,
      toggleSidebar: vi.fn(),
      isHovered: false,
      setHovered: vi.fn(),
    })
    
    const wrapperClosed = mount(AppSidebar, {
      global: {
        plugins: [mockRouter],
      }
    })
    
    // 当侧边栏关闭时，应该应用 'closed' 类
    expect(wrapperClosed.find('.sidebar').classes()).toContain('closed')
  })

  it('navigates to correct routes when clicking nav items', async () => {
    const wrapper = mount(AppSidebar, {
      global: {
        plugins: [mockRouter],
      }
    })

    // 点击 JSON 处理导航项
    const processNavItem = wrapper.find('.nav-item[href="/process"]')
    await processNavItem.trigger('click')
    
    // 应该导航到 /process 路由
    expect(mockRouter.currentRoute.value.path).toBe('/process')
    
    // 点击 Excel 上传导航项
    const excelUploadNavItem = wrapper.find('.nav-item[href="/excel-upload"]')
    await excelUploadNavItem.trigger('click')
    
    // 应该导航到 /excel-upload 路由
    expect(mockRouter.currentRoute.value.path).toBe('/excel-upload')
  })
})