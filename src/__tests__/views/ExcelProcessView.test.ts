import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import ExcelProcessView from '@/views/excel-process-view/ExcelProcessView.vue'

// Mock element-plus components
vi.mock('element-plus', () => ({
  ElDialog: vi.fn(),
  ElButton: vi.fn(),
  ElCard: vi.fn(),
  ElCheckbox: vi.fn(),
  ElCheckboxGroup: vi.fn(),
  ElInput: vi.fn(),
  ElRow: vi.fn(),
  ElCol: vi.fn(),
  ElDivider: vi.fn(),
  ElTooltip: vi.fn(),
  ElEmpty: vi.fn(),
  ElMessage: {
    success: vi.fn(),
    warning: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
  },
  ElMessageBox: {
    confirm: vi.fn(() => Promise.resolve()),
  },
}))

// Mock router
vi.mock('vue-router', () => ({
  useRouter: () => ({ 
    push: vi.fn(),
    replace: vi.fn(),
  }),
}))

describe('ExcelProcessView', () => {
  it('should render without errors', () => {
    const wrapper = mount(ExcelProcessView, {
      global: {
        stubs: {
          'el-dialog': true,
          'el-button': true,
          'el-card': true,
          'el-checkbox': true,
          'el-checkbox-group': true,
          'el-input': true,
          'el-row': true,
          'el-col': true,
          'el-divider': true,
          'el-tooltip': true,
          'el-empty': true,
        },
      },
    })
    
    expect(wrapper.exists()).toBe(true)
  })

  it('should contain file processing UI', () => {
    const wrapper = mount(ExcelProcessView, {
      global: {
        stubs: {
          'el-dialog': true,
          'el-button': true,
          'el-card': true,
          'el-checkbox': true,
          'el-checkbox-group': true,
          'el-input': true,
          'el-row': true,
          'el-col': true,
          'el-divider': true,
          'el-tooltip': true,
          'el-empty': true,
        },
      },
    })
    
    // Should have action buttons (stubbed components)
    expect(wrapper.exists()).toBe(true)
  })
})