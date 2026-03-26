import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import CryptoConfig from '@/components/CryptoConfig.vue'
import type { CryptoAlgorithm, CryptoMode } from '@/types'

// Stub Element Plus components
const ElSelect = {
  name: 'ElSelect',
  props: ['modelValue', 'size'],
  template: '<select :value="modelValue" @change="$emit(\'update:modelValue\', $event.target.value)"><slot /></select>',
}
const ElOption = {
  name: 'ElOption',
  props: ['label', 'value'],
  template: '<option :value="value">{{ label }}</option>',
}
const ElRadioGroup = {
  name: 'ElRadioGroup',
  props: ['modelValue', 'size'],
  template: '<div class="mock-el-radio-group"><slot /></div>',
}
const ElRadioButton = {
  name: 'ElRadioButton',
  props: ['value', 'label'],
  template: '<button class="mock-radio-btn" :data-value="value"><slot /></button>',
}

// Mock lucide-vue-next icons
vi.mock('lucide-vue-next', () => ({
  Eye: { name: 'Eye', template: '<svg class="icon-eye" />' },
  EyeOff: { name: 'EyeOff', template: '<svg class="icon-eye-off" />' },
}))

function createWrapper(props: Partial<{
  algorithm: CryptoAlgorithm
  secretKey: string
  mode: CryptoMode
}> = {}) {
  return mount(CryptoConfig, {
    props: {
      algorithm: 'AES' as CryptoAlgorithm,
      secretKey: '',
      mode: 'encrypt' as CryptoMode,
      ...props,
    },
    global: {
      components: { ElSelect, ElOption, ElRadioGroup, ElRadioButton },
    },
  })
}

describe('CryptoConfig.vue', () => {
  it('renders algorithm label and select', () => {
    const wrapper = createWrapper()
    expect(wrapper.text()).toContain('算法')
    expect(wrapper.find('select').exists()).toBe(true)
  })

  it('renders all 6 algorithm options', () => {
    const wrapper = createWrapper()
    const options = wrapper.findAll('option')
    const values = options.map(o => o.attributes('value'))
    expect(values).toEqual(['AES', 'DES', 'TripleDES', 'RC4', 'Rabbit', 'Base64'])
  })

  it('renders mode label and radio buttons', () => {
    const wrapper = createWrapper()
    expect(wrapper.text()).toContain('模式')
    const radioBtns = wrapper.findAll('.mock-radio-btn')
    expect(radioBtns).toHaveLength(2)
  })

  it('renders encrypt and decrypt radio labels', () => {
    const wrapper = createWrapper()
    const radioBtns = wrapper.findAll('.mock-radio-btn')
    expect(radioBtns[0].text()).toContain('加密')
    expect(radioBtns[1].text()).toContain('解密')
  })

  it('renders secret key label and input', () => {
    const wrapper = createWrapper()
    expect(wrapper.text()).toContain('密钥')
    const input = wrapper.find('input[type="password"]')
    expect(input.exists()).toBe(true)
    expect(input.attributes('placeholder')).toBe('输入密钥...')
  })

  it('renders secret key input with type password by default', () => {
    const wrapper = createWrapper({ secretKey: 'testkey' })
    const input = wrapper.find('input')
    expect(input.attributes('type')).toBe('password')
  })

  it('toggles password visibility when eye button is clicked', async () => {
    const wrapper = createWrapper({ secretKey: 'mysecret' })
    const toggleBtn = wrapper.findAll('button').find(b => b.find('svg') !== undefined)
    // The component has a button for toggling key visibility
    // Find the button inside the relative container
    const eyeBtn = wrapper.find('button[type="button"]')
    expect(eyeBtn.exists()).toBe(true)

    // Initially password
    expect(wrapper.find('input[type="password"]').exists()).toBe(true)

    // Click to show
    await eyeBtn.trigger('click')
    expect(wrapper.find('input[type="text"]').exists()).toBe(true)

    // Click to hide
    await eyeBtn.trigger('click')
    expect(wrapper.find('input[type="password"]').exists()).toBe(true)
  })

  it('displays the secret key value in input', () => {
    const wrapper = createWrapper({ secretKey: 'abc123' })
    expect(wrapper.find('input').element.value).toBe('abc123')
  })

  it('emits update:secretKey when input value changes', async () => {
    const wrapper = createWrapper()
    const input = wrapper.find('input')
    await input.setValue('newkey')
    expect(wrapper.emitted('update:secretKey')).toHaveLength(1)
    expect(wrapper.emitted('update:secretKey')![0]).toEqual(['newkey'])
  })

  it('renders all section dividers', () => {
    const wrapper = createWrapper()
    const dividers = wrapper.findAll('.h-6')
    // Should have at least 2 vertical dividers between sections
    expect(dividers.length).toBeGreaterThanOrEqual(2)
  })
})
