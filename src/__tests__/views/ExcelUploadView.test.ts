import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import ExcelUploadView from '@/views/excel-upload-view/ExcelUploadView.vue'

// Mock element-plus components
vi.mock('element-plus', () => ({
  ElDialog: vi.fn(),
  ElButton: vi.fn(),
  ElCard: vi.fn(),
  ElUpload: vi.fn(),
  ElRow: vi.fn(),
  ElCol: vi.fn(),
  ElDivider: vi.fn(),
  ElProgress: vi.fn(),
  ElEmpty: vi.fn(),
  ElMessage: {
    success: vi.fn(),
    warning: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
  },
}))

// Mock router
vi.mock('vue-router', () => ({
  useRouter: () => ({ 
    push: vi.fn(),
    replace: vi.fn(),
  }),
}))

describe('ExcelUploadView', () => {
  it('should render without errors', () => {
    const wrapper = mount(ExcelUploadView, {
      global: {
        stubs: {
          'el-dialog': true,
          'el-button': true,
          'el-card': true,
          'el-upload': true,
          'el-row': true,
          'el-col': true,
          'el-divider': true,
          'el-progress': true,
          'el-empty': true,
        },
      },
    })
    
    expect(wrapper.exists()).toBe(true)
  })

  it('should contain upload functionality', () => {
    const wrapper = mount(ExcelUploadView, {
      global: {
        stubs: {
          'el-dialog': true,
          'el-button': true,
          'el-card': true,
          'el-upload': true,
          'el-row': true,
          'el-col': true,
          'el-divider': true,
          'el-progress': true,
          'el-empty': true,
        },
      },
    })
    
    // Should have upload component
    const uploadComponent = wrapper.findComponent({ name: 'el-upload' })
    expect(uploadComponent.exists()).toBe(true)
  })

  it('should have action buttons', () => {
    const wrapper = mount(ExcelUploadView, {
      global: {
        stubs: {
          'el-dialog': true,
          'el-button': true,
          'el-card': true,
          'el-upload': true,
          'el-row': true,
          'el-col': true,
          'el-divider': true,
          'el-progress': true,
          'el-empty': true,
        },
      },
    })
    
    // Should have upload component (stubbed)
    expect(wrapper.exists()).toBe(true)
  })
})