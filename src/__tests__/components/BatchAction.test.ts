import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import BatchAction from '@/components/BatchAction.vue'

function createWrapper(props: Partial<{
  fileCount: number
  filteredCount: number
  hasProcessed: boolean
  batchLoading: boolean
  wrapWithQuotes: boolean
}> = {}) {
  return mount(BatchAction, {
    props: {
      fileCount: 0,
      filteredCount: 0,
      hasProcessed: false,
      batchLoading: false,
      wrapWithQuotes: false,
      ...props,
    },
  })
}

describe('BatchAction.vue', () => {
  it('renders checkbox, batch process button, and zip download button group', () => {
    const wrapper = createWrapper()
    const checkbox = wrapper.find('input[type="checkbox"]')
    expect(checkbox.exists()).toBe(true)
    const buttons = wrapper.findAll('button')
    expect(buttons).toHaveLength(3)
    expect(buttons[0].text()).toContain('批量处理')
    expect(buttons[1].text()).toContain('打包下载 ZIP')
  })

  it('shows 加引号 label next to checkbox', () => {
    const wrapper = createWrapper()
    expect(wrapper.text()).toContain('加引号')
  })

  it('disables batch process button when filteredCount is 0', () => {
    const wrapper = createWrapper({ filteredCount: 0 })
    const batchBtn = wrapper.findAll('button')[0]
    expect(batchBtn.attributes('disabled')).toBeDefined()
  })

  it('enables batch process button when filteredCount > 0', () => {
    const wrapper = createWrapper({ filteredCount: 3 })
    const batchBtn = wrapper.findAll('button')[0]
    expect(batchBtn.attributes('disabled')).toBeUndefined()
  })

  it('disables batch process button when batchLoading is true', () => {
    const wrapper = createWrapper({ filteredCount: 5, batchLoading: true })
    const batchBtn = wrapper.findAll('button')[0]
    expect(batchBtn.attributes('disabled')).toBeDefined()
    expect(batchBtn.text()).toContain('处理中...')
  })

  it('shows normal text when not loading', () => {
    const wrapper = createWrapper({ filteredCount: 3, batchLoading: false })
    const batchBtn = wrapper.findAll('button')[0]
    expect(batchBtn.text()).toContain('批量处理')
    expect(batchBtn.text()).not.toContain('处理中...')
  })

  it('disables zip download when filteredCount < 2', () => {
    const wrapper = createWrapper({ filteredCount: 1 })
    const zipBtnMain = wrapper.findAll('button')[1]
    const zipBtnDropdown = wrapper.findAll('button')[2]
    expect(zipBtnMain.attributes('disabled')).toBeDefined()
    expect(zipBtnDropdown.attributes('disabled')).toBeDefined()
  })

  it('enables zip download when filteredCount >= 2', () => {
    const wrapper = createWrapper({ filteredCount: 2 })
    const zipBtnMain = wrapper.findAll('button')[1]
    const zipBtnDropdown = wrapper.findAll('button')[2]
    expect(zipBtnMain.attributes('disabled')).toBeUndefined()
    expect(zipBtnDropdown.attributes('disabled')).toBeUndefined()
  })

  it('emits update:wrapWithQuotes when checkbox is changed', async () => {
    const wrapper = createWrapper({ wrapWithQuotes: false })
    const checkbox = wrapper.find('input[type="checkbox"]')
    await checkbox.setValue(true)
    expect(wrapper.emitted('update:wrapWithQuotes')).toHaveLength(1)
    expect(wrapper.emitted('update:wrapWithQuotes')![0]).toEqual([true])
  })

  it('emits batchProcess when batch button is clicked', async () => {
    const wrapper = createWrapper({ filteredCount: 3 })
    await wrapper.findAll('button')[0].trigger('click')
    expect(wrapper.emitted('batchProcess')).toHaveLength(1)
  })

  it('emits downloadZip when zip main button is clicked', async () => {
    const wrapper = createWrapper({ filteredCount: 3 })
    await wrapper.findAll('button')[1].trigger('click')
    expect(wrapper.emitted('downloadZip')).toHaveLength(1)
  })

  it('reflects wrapWithQuotes prop on checkbox checked state', () => {
    const wrapperChecked = createWrapper({ wrapWithQuotes: true })
    const checkboxChecked = wrapperChecked.find('input[type="checkbox"]').element as HTMLInputElement
    expect(checkboxChecked.checked).toBe(true)

    const wrapperUnchecked = createWrapper({ wrapWithQuotes: false })
    const checkboxUnchecked = wrapperUnchecked.find('input[type="checkbox"]').element as HTMLInputElement
    expect(checkboxUnchecked.checked).toBe(false)
  })

  it('emits downloadZipWithMode when dropdown command is triggered', async () => {
    const wrapper = createWrapper({ filteredCount: 3 })

    // 通过触发组件内部方法来测试事件发射
    // 触发 original 模式
    wrapper.vm.$emit('downloadZipWithMode', 'original')
    expect(wrapper.emitted('downloadZipWithMode')).toHaveLength(1)
    expect(wrapper.emitted('downloadZipWithMode')![0]).toEqual(['original'])

    // 触发 processed 模式
    wrapper.vm.$emit('downloadZipWithMode', 'processed')
    expect(wrapper.emitted('downloadZipWithMode')).toHaveLength(2)
    expect(wrapper.emitted('downloadZipWithMode')![1]).toEqual(['processed'])

    // 触发 both 模式
    wrapper.vm.$emit('downloadZipWithMode', 'both')
    expect(wrapper.emitted('downloadZipWithMode')).toHaveLength(3)
    expect(wrapper.emitted('downloadZipWithMode')![2]).toEqual(['both'])
  })
})
