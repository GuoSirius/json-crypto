import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createRouter, createMemoryHistory } from 'vue-router'
import UploadView from '@/views/upload-view/UploadView.vue'

// Mock dependencies
vi.mock('element-plus', () => ({
  ElMessage: {
    warning: vi.fn(),
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
  },
  ElDialog: {
    name: 'ElDialog',
    template: '<div class="mock-dialog"><slot /></div>',
  },
}))

vi.mock('lucide-vue-next', () => ({
  Upload: { name: 'Upload', template: '<span class="icon-upload" />' },
  FileText: { name: 'FileText', template: '<span class="icon-file-text" />' },
  ArrowRight: { name: 'ArrowRight', template: '<span class="icon-arrow" />' },
  FileJson: { name: 'FileJson', template: '<span class="icon-file-json" />' },
  ListX: { name: 'ListX', template: '<span class="icon-list" />' },
  Trash2: { name: 'Trash2', template: '<span class="icon-trash" />' },
}))

// Mock ThemeToggle stub
vi.mock('@/components/ThemeToggle.vue', () => ({
  default: { name: 'ThemeToggle', template: '<div class="theme-toggle-stub" />' },
}))

// Mock jsonStore
const mockStoreReset = vi.fn(() => Promise.resolve())
const mockStoreInit = vi.fn(() => Promise.resolve())
const mockStoreAddFiles = vi.fn(() => Promise.resolve({ addedCount: 1, duplicateCount: 0, duplicateNames: [] }))
const mockStoreSetPasteText = vi.fn()
const mockStoreHasData = vi.fn(() => false)
const mockStoreIsFileMode = vi.fn(() => false)

vi.mock('@/stores/jsonStore', () => ({
  useJsonStore: () => ({
    reset: mockStoreReset,
    init: mockStoreInit,
    addFiles: mockStoreAddFiles,
    setPasteText: mockStoreSetPasteText,
    hasData: mockStoreHasData,
    isFileMode: mockStoreIsFileMode,
    state: {
      files: [],
      activeIndex: 0,
      pasteText: '',
      cryptoConfig: { algorithm: 'AES', key: '', mode: 'encrypt', wrapWithQuotes: false },
      filter: 'all',
      searchKeyword: '',
    },
  }),
}))

// Mock utils
vi.mock('@/utils/json', () => ({
  isValidJson: vi.fn((text: string) => {
    try { JSON.parse(text); return true } catch { return false }
  }),
}))

vi.mock('@/utils/crypto', () => ({
  calculateMD5: vi.fn(() => 'mock-md5-hash-32chars00'),
}))

let router: any

async function createTestRouter() {
  router = createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/upload', component: UploadView },
      { path: '/process', component: { template: '<div>process</div>' } },
    ],
  })
  router.push('/upload')
  await router.isReady()
  return router
}

async function mountView() {
  const r = await createTestRouter()
  const wrapper = mount(UploadView, {
    global: { plugins: [r] },
  })
  return wrapper
}

describe('UploadView.vue', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Initialization', () => {
    it('calls store init on mount', async () => {
      await mountView()
      expect(mockStoreInit).toHaveBeenCalled()
    })

    it('renders page title', async () => {
      const wrapper = await mountView()
      expect(wrapper.text()).toContain('JSON 上传')
    })

    it('renders subtitle text', async () => {
      const wrapper = await mountView()
      expect(wrapper.text()).toContain('上传 JSON 文件或粘贴文本')
    })
  })

  describe('Tab switching', () => {
    it('shows file upload area by default', async () => {
      const wrapper = await mountView()
      expect(wrapper.text()).toContain('文件上传')
      expect(wrapper.text()).toContain('文本粘贴')
    })

    it('switches to paste tab when clicked', async () => {
      const wrapper = await mountView()
      const tabs = wrapper.findAll('button')
      const pasteTab = tabs.find(t => t.text().includes('文本粘贴'))
      await pasteTab!.trigger('click')
      // Should now show textarea for pasting
      expect(wrapper.find('textarea').exists()).toBe(true)
    })
  })

  describe('File upload tab', () => {
    it('renders drag upload area', async () => {
      const wrapper = await mountView()
      expect(wrapper.text()).toContain('拖拽 JSON 文件到此处，或点击上传')
    })

    it('renders supported file type hint', async () => {
      const wrapper = await mountView()
      expect(wrapper.text()).toContain('.json')
    })
  })

  describe('Text paste tab', () => {
    it('renders textarea for JSON input', async () => {
      const wrapper = await mountView()
      const tabs = wrapper.findAll('button')
      const pasteTab = tabs.find(t => t.text().includes('文本粘贴'))
      await pasteTab!.trigger('click')

      const textarea = wrapper.find('textarea')
      expect(textarea.exists()).toBe(true)
      expect(textarea.attributes('placeholder')).toContain('JSON')
    })

    it('shows warning when navigating to next with empty paste', async () => {
      const wrapper = await mountView()
      // Switch to paste tab
      const tabs = wrapper.findAll('button')
      const pasteTab = tabs.find(t => t.text().includes('文本粘贴'))
      await pasteTab!.trigger('click')

      // Click next button
      const nextBtn = wrapper.findAll('button').find(b => b.text().includes('下一步'))
      await nextBtn!.trigger('click')

      const { ElMessage } = await import('element-plus')
      expect(ElMessage.warning).toHaveBeenCalledWith('请输入 JSON 数据')
    })

    it('shows error when navigating to next with invalid JSON', async () => {
      const wrapper = await mountView()
      // Switch to paste tab
      const tabs = wrapper.findAll('button')
      const pasteTab = tabs.find(t => t.text().includes('文本粘贴'))
      await pasteTab!.trigger('click')

      // Type invalid JSON
      const textarea = wrapper.find('textarea')
      await textarea.setValue('not valid json')

      // Click next button
      const nextBtn = wrapper.findAll('button').find(b => b.text().includes('下一步'))
      await nextBtn!.trigger('click')

      const { ElMessage } = await import('element-plus')
      expect(ElMessage.error).toHaveBeenCalledWith('JSON 格式不正确，请检查输入')
    })

    it('navigates to process page with valid JSON paste', async () => {
      const wrapper = await mountView()
      // Switch to paste tab
      const tabs = wrapper.findAll('button')
      const pasteTab = tabs.find(t => t.text().includes('文本粘贴'))
      await pasteTab!.trigger('click')

      // Type valid JSON
      const textarea = wrapper.find('textarea')
      await textarea.setValue('{"key": "value"}')

      // Click next button
      const nextBtn = wrapper.findAll('button').find(b => b.text().includes('下一步'))
      await nextBtn!.trigger('click')

      expect(mockStoreSetPasteText).toHaveBeenCalledWith('{"key": "value"}')
    })
  })

  describe('Next button', () => {
    it('renders next button', async () => {
      const wrapper = await mountView()
      expect(wrapper.text()).toContain('下一步')
    })

    it('shows warning when no files uploaded in file mode', async () => {
      const wrapper = await mountView()
      const nextBtn = wrapper.findAll('button').find(b => b.text().includes('下一步'))
      await nextBtn!.trigger('click')

      const { ElMessage } = await import('element-plus')
      expect(ElMessage.warning).toHaveBeenCalledWith('请先上传 JSON 文件')
    })
  })

  describe('Page layout', () => {
    it('renders upload and paste tabs', async () => {
      const wrapper = await mountView()
      expect(wrapper.text()).toContain('文件上传')
      expect(wrapper.text()).toContain('文本粘贴')
    })
  })
})
