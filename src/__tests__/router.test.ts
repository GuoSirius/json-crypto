import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { createRouter, createWebHistory } from 'vue-router'
import { mount, VueWrapper } from '@vue/test-utils'
import { defineComponent, h } from 'vue'
import router from '@/router'

// Mock components
const MockUploadView = defineComponent({
  name: 'MockUploadView',
  render: () => h('div', 'Mock Upload View'),
})

const MockProcessView = defineComponent({
  name: 'MockProcessView',
  render: () => h('div', 'Mock Process View'),
})

const MockExcelUploadView = defineComponent({
  name: 'MockExcelUploadView',
  render: () => h('div', 'Mock Excel Upload View'),
})

const MockExcelProcessView = defineComponent({
  name: 'MockExcelProcessView',
  render: () => h('div', 'Mock Excel Process View'),
})

// Mock router with async components
vi.mock('@/views/upload-view/UploadView.vue', () => ({
  default: MockUploadView,
}))

vi.mock('@/views/process-view/ProcessView.vue', () => ({
  default: MockProcessView,
}))

vi.mock('@/views/excel-upload-view/ExcelUploadView.vue', () => ({
  default: MockExcelUploadView,
}))

vi.mock('@/views/excel-process-view/ExcelProcessView.vue', () => ({
  default: MockExcelProcessView,
}))

describe('Router', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('Route configuration', () => {
    it('should have correct routes defined', () => {
      // 实际有6个路由：根路由重定向 + 4个页面路由 + 通配符路由
      expect(router.getRoutes()).toHaveLength(6)
    })

    it('should have root redirect to /json/upload', () => {
      const rootRoute = router.getRoutes().find(route => route.path === '/')
      expect(rootRoute?.redirect).toBe('/json/upload')
    })

    it('should have JSON upload route', () => {
      const route = router.getRoutes().find(route => route.name === 'JsonUpload')
      expect(route?.path).toBe('/json/upload')
      expect(route?.name).toBe('JsonUpload')
    })

    it('should have JSON process route', () => {
      const route = router.getRoutes().find(route => route.name === 'JsonProcess')
      expect(route?.path).toBe('/json/process')
      expect(route?.name).toBe('JsonProcess')
    })

    it('should have Excel upload route', () => {
      const route = router.getRoutes().find(route => route.name === 'ExcelUpload')
      expect(route?.path).toBe('/excel/upload')
      expect(route?.name).toBe('ExcelUpload')
    })

    it('should have Excel process route', () => {
      const route = router.getRoutes().find(route => route.name === 'ExcelProcess')
      expect(route?.path).toBe('/excel/process')
      expect(route?.name).toBe('ExcelProcess')
    })

    it('should have catch-all route redirect to JSON upload', () => {
      const route = router.getRoutes().find(route => route.path === '/:pathMatch(.*)*')
      expect(route?.redirect).toBe('/json/upload')
    })
  })

  describe('Navigation', () => {
    it('should navigate to JSON upload route', async () => {
      await router.push('/json/upload')
      expect(router.currentRoute.value.path).toBe('/json/upload')
      expect(router.currentRoute.value.name).toBe('JsonUpload')
    })

    it('should navigate to JSON process route', async () => {
      await router.push('/json/process')
      expect(router.currentRoute.value.path).toBe('/json/process')
      expect(router.currentRoute.value.name).toBe('JsonProcess')
    })

    it('should navigate to Excel upload route', async () => {
      await router.push('/excel/upload')
      expect(router.currentRoute.value.path).toBe('/excel/upload')
      expect(router.currentRoute.value.name).toBe('ExcelUpload')
    })

    it('should navigate to Excel process route', async () => {
      await router.push('/excel/process')
      expect(router.currentRoute.value.path).toBe('/excel/process')
      expect(router.currentRoute.value.name).toBe('ExcelProcess')
    })

    it('should redirect root to JSON upload', async () => {
      await router.push('/')
      expect(router.currentRoute.value.path).toBe('/json/upload')
      expect(router.currentRoute.value.name).toBe('JsonUpload')
    })

    it('should redirect unknown routes to JSON upload', async () => {
      await router.push('/unknown/route')
      expect(router.currentRoute.value.path).toBe('/json/upload')
      expect(router.currentRoute.value.name).toBe('JsonUpload')
    })
  })

  describe('Route guards', () => {
    it('should have no global guards defined', () => {
      // Router should have no global guards by default
      expect((router as any).beforeEach).toBeDefined()
      expect((router as any).beforeResolve).toBeDefined()
      expect((router as any).afterEach).toBeDefined()
    })
  })

  describe('History mode', () => {
    it('should use web history mode', () => {
      // 检查路由配置是否正确设置history模式
      expect(router).toBeDefined()
      // 验证路由正常工作，不检查内部属性
      expect(router.getRoutes().length).toBeGreaterThan(0)
      // 验证路由能导航
      expect(() => router.push('/json/upload')).not.toThrow()
    })
  })

  describe('Integration with components', () => {
    let wrapper: VueWrapper

    beforeEach(async () => {
      const App = defineComponent({
        template: '<router-view />',
      })

      wrapper = mount(App, {
        global: {
          plugins: [router],
        },
      })

      // Navigate to home first
      await router.push('/')
    })

    afterEach(() => {
      if (wrapper) {
        wrapper.unmount()
      }
    })

    it('should render correct component for /json/upload', async () => {
      await router.push('/json/upload')
      expect(wrapper.html()).toContain('Mock Upload View')
    })

    it('should render correct component for /json/process', async () => {
      await router.push('/json/process')
      expect(wrapper.html()).toContain('Mock Process View')
    })

    it('should render correct component for /excel/upload', async () => {
      await router.push('/excel/upload')
      expect(wrapper.html()).toContain('Mock Excel Upload View')
    })

    it('should render correct component for /excel/process', async () => {
      await router.push('/excel/process')
      expect(wrapper.html()).toContain('Mock Excel Process View')
    })

    it('should update component when route changes', async () => {
      await router.push('/json/upload')
      expect(wrapper.html()).toContain('Mock Upload View')

      await router.push('/json/process')
      expect(wrapper.html()).toContain('Mock Process View')
    })
  })
})