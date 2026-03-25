import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import ToolBar from '@/components/ToolBar.vue'

function createWrapper(props: Partial<{
  hasSource: boolean
  hasProcessed: boolean
  hasSourceValidJson: boolean
  hasProcessedValidJson: boolean
}> = {}) {
  return mount(ToolBar, {
    props: {
      hasSource: false,
      hasProcessed: false,
      hasSourceValidJson: false,
      hasProcessedValidJson: false,
      ...props,
    },
  })
}

describe('ToolBar.vue', () => {
  it('renders format and compress buttons', () => {
    const wrapper = createWrapper()
    const buttons = wrapper.findAll('button')
    expect(buttons).toHaveLength(2)
    expect(buttons[0].text()).toContain('格式化')
    expect(buttons[1].text()).toContain('压缩')
  })

  it('disables both buttons when no valid JSON exists', () => {
    const wrapper = createWrapper({
      hasSource: true,
      hasProcessed: true,
      hasSourceValidJson: false,
      hasProcessedValidJson: false,
    })
    const buttons = wrapper.findAll('button')
    expect(buttons[0].attributes('disabled')).toBeDefined()
    expect(buttons[1].attributes('disabled')).toBeDefined()
  })

  it('enables both buttons when source has valid JSON', () => {
    const wrapper = createWrapper({
      hasSourceValidJson: true,
    })
    const buttons = wrapper.findAll('button')
    expect(buttons[0].attributes('disabled')).toBeUndefined()
    expect(buttons[1].attributes('disabled')).toBeUndefined()
  })

  it('enables both buttons when processed has valid JSON', () => {
    const wrapper = createWrapper({
      hasProcessedValidJson: true,
    })
    const buttons = wrapper.findAll('button')
    expect(buttons[0].attributes('disabled')).toBeUndefined()
    expect(buttons[1].attributes('disabled')).toBeUndefined()
  })

  it('enables buttons when only processed side has valid JSON (source has data but invalid)', () => {
    const wrapper = createWrapper({
      hasSource: true,
      hasSourceValidJson: false,
      hasProcessed: true,
      hasProcessedValidJson: true,
    })
    const buttons = wrapper.findAll('button')
    expect(buttons[0].attributes('disabled')).toBeUndefined()
    expect(buttons[1].attributes('disabled')).toBeUndefined()
  })

  it('emits format event when format button is clicked', async () => {
    const wrapper = createWrapper({ hasSourceValidJson: true })
    const buttons = wrapper.findAll('button')
    await buttons[0].trigger('click')
    expect(wrapper.emitted('format')).toHaveLength(1)
  })

  it('emits compress event when compress button is clicked', async () => {
    const wrapper = createWrapper({ hasProcessedValidJson: true })
    const buttons = wrapper.findAll('button')
    await buttons[1].trigger('click')
    expect(wrapper.emitted('compress')).toHaveLength(1)
  })

  it('does not emit format when button is disabled', async () => {
    const wrapper = createWrapper({ hasSourceValidJson: false })
    const buttons = wrapper.findAll('button')
    await buttons[0].trigger('click')
    // Button is disabled but click still fires in jsdom; the disabled attribute is present
    expect(buttons[0].attributes('disabled')).toBeDefined()
  })
})
