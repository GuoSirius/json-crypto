import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { createRouter, createMemoryHistory } from 'vue-router'
import ProcessView from '@/views/ProcessView.vue'

// Use vi.hoisted to make state accessible from vi.mock factory
const { mockStoreState, mockStoreInit, mockStoreHasData, mockStoreIsFileMode,
  mockStoreSetActiveIndex, mockStoreUpdateProcessed, mockStoreSetFilter,
  mockStoreSetSearchKeyword, mockStoreGetFilteredFiles, mockStoreGetFilteredIndexes,
  mockStoreDetectAndSetCryptoMode, mockStoreReset } = vi.hoisted(() => {
  const state: any = {
    files: [],
    activeIndex: 0,
    pasteText: '{"key": "value"}',
    cryptoConfig: { algorithm: 'AES', key: 'testkey', mode: 'encrypt', wrapWithQuotes: false },
    filter: 'all',
    searchKeyword: '',
  }
  return {
    mockStoreState: state,
    mockStoreInit: vi.fn(() => Promise.resolve()),
    mockStoreHasData: vi.fn(() => false),
    mockStoreIsFileMode: vi.fn(() => false),
    mockStoreSetActiveIndex: vi.fn(),
    mockStoreUpdateProcessed: vi.fn(),
    mockStoreSetFilter: vi.fn(),
    mockStoreSetSearchKeyword: vi.fn(),
    mockStoreGetFilteredFiles: vi.fn(() => []),
    mockStoreGetFilteredIndexes: vi.fn(() => []),
    mockStoreDetectAndSetCryptoMode: vi.fn(),
    mockStoreReset: vi.fn(() => Promise.resolve()),
  }
})

// Mock all dependencies
vi.mock('element-plus', () => ({
  ElMessage: {
    warning: vi.fn(),
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
  },
  ElMessageBox: {
    confirm: vi.fn(() => Promise.reject()), // User cancels by default
  },
}))

vi.mock('lucide-vue-next', () => ({
  ArrowLeft: { name: 'ArrowLeft', template: '<span class="icon-arrow" />' },
  FileJson: { name: 'FileJson', template: '<span class="icon-file-json" />' },
}))

// Stubs for child components
vi.mock('@/components/FileList.vue', () => ({
  default: {
    name: 'FileList',
    props: ['files', 'activeIndex', 'filter', 'searchKeyword'],
    emits: ['select', 'add', 'update:filter', 'update:searchKeyword'],
    template: '<div class="file-list-stub"><slot /></div>',
  },
}))

vi.mock('@/components/JsonEditor.vue', () => ({
  default: {
    name: 'JsonEditor',
    props: ['label', 'modelValue', 'readonly', 'mode', 'hasSource'],
    emits: ['update:modelValue', 'download', 'clear', 'refresh', 'encrypt', 'decrypt'],
    template: `<div class="json-editor-stub" :data-label="label" :data-value="modelValue" :data-readonly="readonly">
      <span>{{ label }}</span>
      <textarea :value="modelValue" :readonly="readonly" @input="$emit('update:modelValue', $event.target.value)"></textarea>
    </div>`,
  },
}))

vi.mock('@/components/ToolBar.vue', () => ({
  default: {
    name: 'ToolBar',
    props: ['hasSource', 'hasProcessed', 'hasSourceValidJson', 'hasProcessedValidJson', 'mode'],
    emits: ['format', 'compress', 'encrypt', 'decrypt'],
    template: '<div class="toolbar-stub"><slot /></div>',
  },
}))

vi.mock('@/components/CryptoConfig.vue', () => ({
  default: {
    name: 'CryptoConfig',
    props: ['algorithm', 'secretKey', 'mode'],
    emits: ['update:algorithm', 'update:secretKey', 'update:mode'],
    template: '<div class="crypto-config-stub" />',
  },
}))

vi.mock('@/components/BatchAction.vue', () => ({
  default: {
    name: 'BatchAction',
    props: ['fileCount', 'filteredCount', 'hasProcessed', 'batchLoading', 'wrapWithQuotes'],
    emits: ['batchProcess', 'downloadSingle', 'downloadZip', 'update:wrapWithQuotes'],
    template: '<div class="batch-action-stub"><slot /></div>',
  },
}))

vi.mock('@/components/ThemeToggle.vue', () => ({
  default: { name: 'ThemeToggle', template: '<div class="theme-toggle-stub" />' },
}))

// Mock utils
vi.mock('@/utils/json', () => ({
  formatJson: vi.fn((data: string) => JSON.stringify(JSON.parse(data), null, 2)),
  compressJson: vi.fn((data: string) => JSON.stringify(JSON.parse(data))),
  isValidJson: vi.fn((data: string) => {
    try { JSON.parse(data); return true } catch { return false }
  }),
}))

vi.mock('@/utils/crypto', () => ({
  processCrypto: vi.fn((_data: string, _mode: string, _algo: string, _key: string) => 'CRYPTO_RESULT'),
  detectEncrypted: vi.fn((data: string) => data.startsWith('U2FsdGVk')),
  removeOuterQuotes: vi.fn((data: string) => {
    if ((data.startsWith('"') && data.endsWith('"')) || (data.startsWith("'") && data.endsWith("'"))) {
      return data.slice(1, -1)
    }
    return data
  }),
  calculateMD5: vi.fn(() => 'mock-md5-hash-32chars00'),
  cleanData: vi.fn((data: string) => ({ cleaned: data, hadQuotes: false })),
}))

vi.mock('@/utils/download', () => ({
  downloadFile: vi.fn(),
  downloadAsZip: vi.fn(),
}))

vi.mock('@/stores/jsonStore', () => ({
  useJsonStore: () => ({
    state: mockStoreState,
    init: mockStoreInit,
    hasData: mockStoreHasData,
    isFileMode: mockStoreIsFileMode,
    setActiveIndex: mockStoreSetActiveIndex,
    updateProcessed: mockStoreUpdateProcessed,
    setFilter: mockStoreSetFilter,
    setSearchKeyword: mockStoreSetSearchKeyword,
    getFilteredFiles: mockStoreGetFilteredFiles,
    getFilteredIndexes: mockStoreGetFilteredIndexes,
    detectAndSetCryptoMode: mockStoreDetectAndSetCryptoMode,
    reset: mockStoreReset,
  }),
}))

vi.mock('element-plus', () => ({
  ElMessage: { warning: vi.fn(), success: vi.fn(), error: vi.fn(), info: vi.fn() },
  ElMessageBox: { confirm: vi.fn(() => Promise.reject()) },
  ElProgress: { name: 'ElProgress', template: '<div class="el-progress-stub" />' },
}))

function resetStoreState() {
  Object.assign(mockStoreState, {
    files: [],
    activeIndex: 0,
    pasteText: '{"key": "value"}',
    cryptoConfig: { algorithm: 'AES', key: 'testkey', mode: 'encrypt', wrapWithQuotes: false },
    filter: 'all',
    searchKeyword: '',
  })
}

let router: any

async function createTestRouter() {
  router = createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/', redirect: '/process' },
      { path: '/upload', component: { template: '<div>upload</div>' } },
      { path: '/process', component: ProcessView },
    ],
  })
  router.push('/process')
  await router.isReady()
  return router
}

describe('ProcessView.vue', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    resetStoreState()
  })

  describe('Initialization', () => {
    it('redirects to /upload when store has no data', async () => {
      mockStoreHasData.mockReturnValue(false)
      const r = await createTestRouter()
      mount(ProcessView, { global: { plugins: [r] } })
      await flushPromises()
      expect(r.currentRoute.value.path).toBe('/upload')
    })

    it('shows page content when store has paste data', async () => {
      mockStoreHasData.mockReturnValue(true)
      mockStoreIsFileMode.mockReturnValue(false)
      const r = await createTestRouter()
      const wrapper = mount(ProcessView, { global: { plugins: [r] } })
      await flushPromises()
      expect(wrapper.text()).toContain('JSON Crypto')
    })

    it('renders back button', async () => {
      mockStoreHasData.mockReturnValue(true)
      mockStoreIsFileMode.mockReturnValue(false)
      const r = await createTestRouter()
      const wrapper = mount(ProcessView, { global: { plugins: [r] } })
      await flushPromises()
      expect(wrapper.text()).toContain('返回')
    })

    it('renders CryptoConfig component', async () => {
      mockStoreHasData.mockReturnValue(true)
      const r = await createTestRouter()
      const wrapper = mount(ProcessView, { global: { plugins: [r] } })
      await flushPromises()
      expect(wrapper.find('.crypto-config-stub').exists()).toBe(true)
    })

    it('renders ThemeToggle component', async () => {
      mockStoreHasData.mockReturnValue(true)
      const r = await createTestRouter()
      const wrapper = mount(ProcessView, { global: { plugins: [r] } })
      await flushPromises()
      expect(wrapper.find('.theme-toggle-stub').exists()).toBe(true)
    })
  })

  describe('File mode', () => {
    it('shows FileList sidebar when in file mode', async () => {
      mockStoreHasData.mockReturnValue(true)
      mockStoreIsFileMode.mockReturnValue(true)
      mockStoreState.files = [{ id: '1', name: 'test.json', content: '{}', md5: 'm1', processed: '', status: 'pending' }]
      const r = await createTestRouter()
      const wrapper = mount(ProcessView, { global: { plugins: [r] } })
      await flushPromises()
      expect(wrapper.find('.file-list-stub').exists()).toBe(true)
    })

    it('hides FileList sidebar when in paste mode', async () => {
      mockStoreHasData.mockReturnValue(true)
      mockStoreIsFileMode.mockReturnValue(false)
      const r = await createTestRouter()
      const wrapper = mount(ProcessView, { global: { plugins: [r] } })
      await flushPromises()
      expect(wrapper.find('.file-list-stub').exists()).toBe(false)
    })
  })

  describe('Editors', () => {
    it('renders both source and processed editors', async () => {
      mockStoreHasData.mockReturnValue(true)
      mockStoreIsFileMode.mockReturnValue(false)
      const r = await createTestRouter()
      const wrapper = mount(ProcessView, { global: { plugins: [r] } })
      await flushPromises()
      const editors = wrapper.findAll('.json-editor-stub')
      expect(editors).toHaveLength(2)
      expect(editors[0].attributes('data-label')).toBe('原数据')
      expect(editors[1].attributes('data-label')).toBe('处理后数据')
    })

    it('sets processed editor to readonly', async () => {
      mockStoreHasData.mockReturnValue(true)
      const r = await createTestRouter()
      const wrapper = mount(ProcessView, { global: { plugins: [r] } })
      await flushPromises()
      const editors = wrapper.findAll('.json-editor-stub')
      expect(editors[0].attributes('data-readonly')).not.toBe('true')
      expect(editors[1].attributes('data-readonly')).toBe('true')
    })

    it('loads source text from paste mode', async () => {
      mockStoreHasData.mockReturnValue(true)
      mockStoreIsFileMode.mockReturnValue(false)
      mockStoreState.pasteText = '{"hello": "world"}'
      const r = await createTestRouter()
      const wrapper = mount(ProcessView, { global: { plugins: [r] } })
      await flushPromises()
      const editors = wrapper.findAll('.json-editor-stub')
      expect(editors[0].attributes('data-value')).toBe('{"hello": "world"}')
    })

    it('loads source text from file mode', async () => {
      mockStoreHasData.mockReturnValue(true)
      mockStoreIsFileMode.mockReturnValue(true)
      mockStoreState.files = [
        { id: '1', name: 'test.json', content: '{"file": "data"}', md5: 'm1', processed: '{"result": 1}', status: 'done' },
      ]
      const r = await createTestRouter()
      const wrapper = mount(ProcessView, { global: { plugins: [r] } })
      await flushPromises()
      const editors = wrapper.findAll('.json-editor-stub')
      expect(editors[0].attributes('data-value')).toBe('{"file": "data"}')
    })

    it('loads processed text from file in file mode', async () => {
      mockStoreHasData.mockReturnValue(true)
      mockStoreIsFileMode.mockReturnValue(true)
      mockStoreState.files = [
        { id: '1', name: 'test.json', content: '{}', md5: 'm1', processed: '{"processed": true}', status: 'done' },
      ]
      const r = await createTestRouter()
      const wrapper = mount(ProcessView, { global: { plugins: [r] } })
      await flushPromises()
      const editors = wrapper.findAll('.json-editor-stub')
      expect(editors[1].attributes('data-value')).toBe('{"processed": true}')
    })
  })

  describe('Auto crypto mode detection', () => {
    it('detects encrypted content and sets mode to decrypt', async () => {
      mockStoreHasData.mockReturnValue(true)
      mockStoreIsFileMode.mockReturnValue(false)
      mockStoreState.pasteText = 'U2FsdGVkX1+vupwdZ+p3a2XfYkx2GGc8g9XhgO8I0sk='
      const r = await createTestRouter()
      mount(ProcessView, { global: { plugins: [r] } })
      await flushPromises()
      expect(mockStoreDetectAndSetCryptoMode).toHaveBeenCalledWith('U2FsdGVkX1+vupwdZ+p3a2XfYkx2GGc8g9XhgO8I0sk=')
    })

    it('detects plain JSON content and sets mode to encrypt', async () => {
      mockStoreHasData.mockReturnValue(true)
      mockStoreIsFileMode.mockReturnValue(false)
      mockStoreState.pasteText = '{"key": "value"}'
      const r = await createTestRouter()
      mount(ProcessView, { global: { plugins: [r] } })
      await flushPromises()
      expect(mockStoreDetectAndSetCryptoMode).toHaveBeenCalledWith('{"key": "value"}')
    })
  })

  describe('Batch progress', () => {
    it('does not show progress bar when batch is not loading', async () => {
      mockStoreHasData.mockReturnValue(true)
      const r = await createTestRouter()
      const wrapper = mount(ProcessView, { global: { plugins: [r] } })
      await flushPromises()
      // No el-progress stub should be visible (v-if="batchLoading" is false)
      expect(wrapper.find('.el-progress-stub').exists()).toBe(false)
    })
  })

  describe('Toolbar and BatchAction', () => {
    it('renders toolbar component', async () => {
      mockStoreHasData.mockReturnValue(true)
      const r = await createTestRouter()
      const wrapper = mount(ProcessView, { global: { plugins: [r] } })
      await flushPromises()
      expect(wrapper.find('.toolbar-stub').exists()).toBe(true)
    })

    it('renders batch action component', async () => {
      mockStoreHasData.mockReturnValue(true)
      const r = await createTestRouter()
      const wrapper = mount(ProcessView, { global: { plugins: [r] } })
      await flushPromises()
      expect(wrapper.find('.batch-action-stub').exists()).toBe(true)
    })
  })

  describe('URL parameter handling', () => {
    it('handles ?file query parameter by name', async () => {
      mockStoreHasData.mockReturnValue(true)
      mockStoreIsFileMode.mockReturnValue(true)
      mockStoreState.files = [
        { id: '1', name: 'target.json', content: '{}', md5: 'm1', processed: '', status: 'pending' },
        { id: '2', name: 'other.json', content: '{}', md5: 'm2', processed: '', status: 'pending' },
      ]
      const r = createRouter({
        history: createMemoryHistory(),
        routes: [
          { path: '/process', component: ProcessView },
          { path: '/upload', component: { template: '<div>upload</div>' } },
        ],
      })
      r.push('/process?file=target.json')
      await r.isReady()
      mount(ProcessView, { global: { plugins: [r] } })
      await flushPromises()
      expect(mockStoreSetActiveIndex).toHaveBeenCalledWith(0)
    })

    it('handles ?file query parameter by index', async () => {
      mockStoreHasData.mockReturnValue(true)
      mockStoreIsFileMode.mockReturnValue(true)
      mockStoreState.files = [
        { id: '1', name: 'a.json', content: '{}', md5: 'm1', processed: '', status: 'pending' },
        { id: '2', name: 'b.json', content: '{}', md5: 'm2', processed: '', status: 'pending' },
      ]
      const r = createRouter({
        history: createMemoryHistory(),
        routes: [
          { path: '/process', component: ProcessView },
          { path: '/upload', component: { template: '<div>upload</div>' } },
        ],
      })
      r.push('/process?file=1')
      await r.isReady()
      mount(ProcessView, { global: { plugins: [r] } })
      await flushPromises()
      expect(mockStoreSetActiveIndex).toHaveBeenCalledWith(1)
    })
  })
})
