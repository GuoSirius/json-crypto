import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'
import JsonEditor from '@/components/JsonEditor.vue'

// Mock Element Plus ElMessage
vi.mock('element-plus', () => ({
  ElMessage: {
    warning: vi.fn(),
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
  },
}))

// Mock lucide-vue-next icons as simple spans
vi.mock('lucide-vue-next', () => ({
  Copy: { name: 'Copy', template: '<span class="icon-copy" />' },
  Check: { name: 'Check', template: '<span class="icon-check" />' },
  Download: { name: 'Download', template: '<span class="icon-download" />' },
  Trash2: { name: 'Trash2', template: '<span class="icon-trash" />' },
  RotateCcw: { name: 'RotateCcw', template: '<span class="icon-refresh" />' },
  Lock: { name: 'Lock', template: '<span class="icon-lock" />' },
  Unlock: { name: 'Unlock', template: '<span class="icon-unlock" />' },
}))

// Prepare clipboard mock
const mockWriteText = vi.fn()

function createWrapper(props: Partial<{
  label: string
  modelValue: string
  readonly: boolean
  mode: 'encrypt' | 'decrypt'
  hasSource: boolean
}> = {}) {
  return mount(JsonEditor, {
    props: {
      label: '原数据',
      modelValue: '',
      readonly: false,
      mode: 'encrypt',
      hasSource: true,
      ...props,
    },
  })
}

describe('JsonEditor.vue', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Mock clipboard at the window level
    mockWriteText.mockResolvedValue(undefined)
    ;(globalThis as any).navigator = {
      ...navigator,
      clipboard: { writeText: mockWriteText },
    }
  })

  afterEach(() => {
    // Restore
    ;(globalThis as any).navigator = {
      ...navigator,
      clipboard: undefined,
    }
  })

  it('renders label text', () => {
    const wrapper = createWrapper({ label: '测试标签' })
    expect(wrapper.text()).toContain('测试标签')
  })

  it('renders textarea with correct value', () => {
    const wrapper = createWrapper({ modelValue: '{"key": "value"}' })
    const textarea = wrapper.find('textarea')
    expect(textarea.element.value).toBe('{"key": "value"}')
  })

  it('sets textarea to readonly when readonly prop is true', () => {
    const wrapper = createWrapper({ readonly: true })
    expect(wrapper.find('textarea').attributes('readonly')).toBeDefined()
  })

  it('does not set textarea to readonly when readonly prop is false', () => {
    const wrapper = createWrapper({ readonly: false })
    expect(wrapper.find('textarea').attributes('readonly')).toBeUndefined()
  })

  it('emits update:modelValue when textarea input changes', async () => {
    const wrapper = createWrapper()
    const textarea = wrapper.find('textarea')
    await textarea.setValue('{"new": "data"}')
    expect(wrapper.emitted('update:modelValue')).toHaveLength(1)
    expect(wrapper.emitted('update:modelValue')![0]).toEqual(['{"new": "data"}'])
  })

  it('shows 还原 button when not readonly', () => {
    const wrapper = createWrapper({ readonly: false })
    expect(wrapper.text()).toContain('还原')
  })

  it('hides 还原 button when readonly', () => {
    const wrapper = createWrapper({ readonly: true })
    expect(wrapper.text()).not.toContain('还原')
  })

  it('shows 加密 button when mode is encrypt and not readonly', () => {
    const wrapper = createWrapper({ mode: 'encrypt', readonly: false })
    expect(wrapper.text()).toContain('加密')
  })

  it('shows 解密 button when mode is decrypt and not readonly', () => {
    const wrapper = createWrapper({ mode: 'decrypt', readonly: false })
    expect(wrapper.text()).toContain('解密')
  })

  it('hides 加密 button when mode is decrypt', () => {
    const wrapper = createWrapper({ mode: 'decrypt', readonly: false })
    expect(wrapper.text()).not.toContain('加密')
  })

  it('hides 解密 button when mode is encrypt', () => {
    const wrapper = createWrapper({ mode: 'encrypt', readonly: false })
    expect(wrapper.text()).not.toContain('解密')
  })

  it('hides 加密/解密 buttons when readonly', () => {
    const wrapper = createWrapper({ readonly: true, mode: 'encrypt' })
    expect(wrapper.text()).not.toContain('加密')
    expect(wrapper.text()).not.toContain('解密')
  })

  it('disables 加密 button when hasSource is false', () => {
    const wrapper = createWrapper({ mode: 'encrypt', readonly: false, hasSource: false })
    // Find the encrypt button - it should have disabled attribute
    const buttons = wrapper.findAll('button')
    const encryptBtn = buttons.find(b => b.text().includes('加密'))
    expect(encryptBtn!.attributes('disabled')).toBeDefined()
  })

  it('enables 加密 button when hasSource is true', () => {
    const wrapper = createWrapper({ mode: 'encrypt', readonly: false, hasSource: true })
    const buttons = wrapper.findAll('button')
    const encryptBtn = buttons.find(b => b.text().includes('加密'))
    expect(encryptBtn!.attributes('disabled')).toBeUndefined()
  })

  it('shows 清空 button when readonly and modelValue is non-empty', () => {
    const wrapper = createWrapper({ readonly: true, modelValue: 'some data' })
    expect(wrapper.text()).toContain('清空')
  })

  it('hides 清空 button when readonly but modelValue is empty', () => {
    const wrapper = createWrapper({ readonly: true, modelValue: '' })
    expect(wrapper.text()).not.toContain('清空')
  })

  it('hides 清空 button when not readonly', () => {
    const wrapper = createWrapper({ readonly: false, modelValue: 'data' })
    expect(wrapper.text()).not.toContain('清空')
  })

  it('shows 复制 button always', () => {
    const wrapper = createWrapper()
    expect(wrapper.text()).toContain('复制')
  })

  it('shows 下载 button always', () => {
    const wrapper = createWrapper()
    expect(wrapper.text()).toContain('下载')
  })

  it('emits refresh when 还原 button is clicked for non-processed data', async () => {
    const wrapper = createWrapper({ readonly: false, label: '原数据' })
    const refreshBtn = wrapper.findAll('button').find(b => b.text().includes('还原'))
    await refreshBtn!.trigger('click')
    expect(wrapper.emitted('refresh')).toHaveLength(1)
  })

  it('emits restore when 还原 button is clicked for processed data', async () => {
    const wrapper = createWrapper({ readonly: false, label: '处理后数据' })
    const restoreBtn = wrapper.findAll('button').find(b => b.text().includes('还原'))
    await restoreBtn!.trigger('click')
    expect(wrapper.emitted('restore')).toHaveLength(1)
  })

  it('emits encrypt when 加密 button is clicked', async () => {
    const wrapper = createWrapper({ mode: 'encrypt', readonly: false, hasSource: true })
    const encryptBtn = wrapper.findAll('button').find(b => b.text().includes('加密'))
    await encryptBtn!.trigger('click')
    expect(wrapper.emitted('encrypt')).toHaveLength(1)
  })

  it('emits decrypt when 解密 button is clicked', async () => {
    const wrapper = createWrapper({ mode: 'decrypt', readonly: false, hasSource: true })
    const decryptBtn = wrapper.findAll('button').find(b => b.text().includes('解密'))
    await decryptBtn!.trigger('click')
    expect(wrapper.emitted('decrypt')).toHaveLength(1)
  })

  it('emits download when 下载 button is clicked', async () => {
    const wrapper = createWrapper({ modelValue: '{"test": 1}' })
    const downloadBtn = wrapper.findAll('button').find(b => b.text().includes('下载'))
    await downloadBtn!.trigger('click')
    expect(wrapper.emitted('download')).toHaveLength(1)
  })

  it('emits clear when 清空 button is clicked', async () => {
    const wrapper = createWrapper({ readonly: true, modelValue: 'data' })
    const clearBtn = wrapper.findAll('button').find(b => b.text().includes('清空'))
    await clearBtn!.trigger('click')
    expect(wrapper.emitted('clear')).toHaveLength(1)
  })

  it('calls clipboard API and emits copy success when 复制 is clicked with content', async () => {
    const wrapper = createWrapper({ modelValue: '{"hello": "world"}' })
    const copyBtn = wrapper.findAll('button').find(b => b.text().includes('复制'))
    await copyBtn!.trigger('click')

    expect(mockWriteText).toHaveBeenCalledWith('{"hello": "world"}')
    // After 1500ms timeout the copied state resets, but we can check the success message
    const { ElMessage } = await import('element-plus')
    expect(ElMessage.success).toHaveBeenCalledWith('已复制到剪贴板')
  })

  it('shows warning when copy is clicked with empty content', async () => {
    const wrapper = createWrapper({ modelValue: '' })
    const copyBtn = wrapper.findAll('button').find(b => b.text().includes('复制'))
    await copyBtn!.trigger('click')

    const { ElMessage } = await import('element-plus')
    expect(ElMessage.warning).toHaveBeenCalledWith('没有可复制的内容')
  })

  it('shows warning when download is clicked with empty content', async () => {
    const wrapper = createWrapper({ modelValue: '' })
    const downloadBtn = wrapper.findAll('button').find(b => b.text().includes('下载'))
    await downloadBtn!.trigger('click')

    const { ElMessage } = await import('element-plus')
    expect(ElMessage.warning).toHaveBeenCalledWith('没有可下载的内容')
  })

  it('shows textarea placeholder text', () => {
    const wrapper = createWrapper({ modelValue: '' })
    const textarea = wrapper.find('textarea')
    expect(textarea.attributes('placeholder')).toContain('数据将显示在此处')
  })
})
