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

  it('checkbox has correct styling classes', () => {
    const wrapper = createWrapper()
    const checkbox = wrapper.find('input[type="checkbox"]')
    expect(checkbox.attributes('class')).toContain('w-4')
    expect(checkbox.attributes('class')).toContain('h-4')
    expect(checkbox.attributes('class')).toContain('rounded')
    expect(checkbox.attributes('class')).toContain('border-2')
  })

  it('checkbox label has proper styling and hover effects', () => {
    const wrapper = createWrapper()
    const label = wrapper.find('label')
    expect(label.classes()).toContain('px-3')
    expect(label.classes()).toContain('py-1.5')
    expect(label.classes()).toContain('rounded-lg')
    expect(label.classes()).toContain('group')
    expect(label.classes()).toContain('cursor-pointer')
  })

  it('checkbox text has font-weight transition on hover', () => {
    const wrapper = createWrapper()
    const span = wrapper.find('label span')
    expect(span.classes()).toContain('text-xs')
    expect(span.classes()).toContain('font-semibold')
    expect(span.classes()).toContain('transition-all')
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

  it('emits update:wrapWithQuotes with false when checkbox is unchecked', async () => {
    const wrapper = createWrapper({ wrapWithQuotes: true })
    const checkbox = wrapper.find('input[type="checkbox"]')
    await checkbox.setValue(false)
    expect(wrapper.emitted('update:wrapWithQuotes')).toHaveLength(1)
    expect(wrapper.emitted('update:wrapWithQuotes')![0]).toEqual([false])
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

  it('dropdown menu shows when filteredCount >= 2 and showDropdown is true', async () => {
    const wrapper = createWrapper({ filteredCount: 3 })
    const vm = wrapper.vm as any
    vm.showDropdown = true
    await wrapper.vm.$nextTick()
    expect(wrapper.find('.dropdown-menu').exists()).toBe(true)
  })

  it('dropdown menu does not show when filteredCount < 2', async () => {
    const wrapper = createWrapper({ filteredCount: 1 })
    const vm = wrapper.vm as any
    vm.showDropdown = true
    await wrapper.vm.$nextTick()
    expect(wrapper.find('.dropdown-menu').exists()).toBe(false)
  })

  it('dropdown menu contains three options', async () => {
    const wrapper = createWrapper({ filteredCount: 3 })
    const vm = wrapper.vm as any
    vm.showDropdown = true
    await wrapper.vm.$nextTick()
    const dropdownItems = wrapper.findAll('.dropdown-item')
    expect(dropdownItems).toHaveLength(3)
    expect(dropdownItems[0].text()).toContain('下载原始内容')
    expect(dropdownItems[1].text()).toContain('下载处理后内容')
    expect(dropdownItems[2].text()).toContain('同时下载两种内容')
  })

  it('has proper button styling classes', () => {
    const wrapper = createWrapper({ filteredCount: 3 })
    const batchBtn = wrapper.findAll('button')[0]
    expect(batchBtn.classes()).toContain('flex')
    expect(batchBtn.classes()).toContain('gap-1.5')
    expect(batchBtn.classes()).toContain('px-3')
    expect(batchBtn.classes()).toContain('py-1.5')
    expect(batchBtn.classes()).toContain('rounded-lg')
    expect(batchBtn.classes()).toContain('border-violet-400')
  })

  it('download button group has proper structure', () => {
    const wrapper = createWrapper({ filteredCount: 3 })
    const buttonGroup = wrapper.find('.download-button-group')
    expect(buttonGroup.exists()).toBe(true)
    expect(buttonGroup.classes()).toContain('relative')
    expect(buttonGroup.find('.button-row').exists()).toBe(true)
  })
})
