import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import App from '@/App.vue'

// Mock useSidebar composable
vi.mock('@/composables/useSidebar', () => ({
  useSidebar: vi.fn(() => ({
    expanded: { value: true },
  })),
}))

// Mock vue-router
vi.mock('vue-router', () => ({
  useRoute: () => ({
    path: '/json/upload',
  }),
}))

// Mock element-plus
vi.mock('element-plus', () => ({
  ElConfigProvider: {
    template: '<div><slot /></div>',
  },
}))

// Mock AppSidebar component
vi.mock('@/components/AppSidebar.vue', () => ({
  default: {
    template: '<div>Mock Sidebar</div>',
  },
}))

describe('App.vue', () => {
  it('should render without errors', () => {
    const wrapper = mount(App, {
      global: {
        stubs: {
          'router-view': {
            template: '<div>Mock Router View</div>',
          },
        },
      },
    })
    
    expect(wrapper.exists()).toBe(true)
  })
})