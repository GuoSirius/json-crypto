import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock db module
vi.mock('@/utils/db', () => ({
  saveExcelStoreData: vi.fn(() => Promise.resolve()),
  loadExcelStoreData: vi.fn(() => Promise.resolve(null)),
  clearExcelStoreData: vi.fn(() => Promise.resolve()),
}))

// Mock uuid
vi.mock('@/utils/uuid', () => ({
  generateUUID: vi.fn(() => 'test-uuid-0000-0000-000000000001'),
}))

// Mock excel utils
vi.mock('@/utils/excel', () => ({
  readFileAsArrayBuffer: vi.fn(() => Promise.resolve(new ArrayBuffer(8))),
  calculateArrayBufferHash: vi.fn(() => 'test-hash-123'),
  parseExcelBuffer: vi.fn(() => ({
    sheets: [
      {
        id: 'test-uuid-0000-0000-000000000001',
        originalName: 'Sheet1',
        displayName: 'Sheet1',
        format: 'json',
        rawData: 'a,b,c\n1,2,3',
        parsedData: '[{"a":1,"b":2,"c":3}]',
        parseError: null,
        selected: false,
      },
    ],
    error: null,
  })),
  isExcelFile: vi.fn((name: string) => name.endsWith('.xlsx') || name.endsWith('.xls')),
}))

import { useExcelStore } from '@/stores/excelStore'

describe('excelStore', () => {
  let store: ReturnType<typeof useExcelStore>

  beforeEach(async () => {
    vi.clearAllMocks()
    await useExcelStore().reset()
    store = useExcelStore()
  })

  describe('init', () => {
    it('should initialize store with empty state', async () => {
      await store.init()
      expect(store.state.files).toHaveLength(0)
      expect(store.state.activeFileIndex).toBe(0)
    })
  })

  describe('hasData', () => {
    it('should return false when no files', () => {
      expect(store.hasData()).toBe(false)
    })
  })

  describe('getFilteredFiles', () => {
    it('should filter files by search keyword', async () => {
      await store.init()
      // Manually add mock data to state
      store.state.files.push({
        id: '1',
        name: 'test-file.xlsx',
        contentHash: 'hash1',
        sheets: [],
        activeSheetIndex: 0,
      })
      store.state.files.push({
        id: '2',
        name: 'other-file.xlsx',
        contentHash: 'hash2',
        sheets: [],
        activeSheetIndex: 0,
      })

      store.setSearchKeyword('test')
      expect(store.getFilteredFiles()).toHaveLength(1)
      expect(store.getFilteredFiles()[0].name).toBe('test-file.xlsx')

      store.setSearchKeyword('')
      expect(store.getFilteredFiles()).toHaveLength(2)
    })
  })

  describe('sheet operations', () => {
    it('should toggle sheet selection', async () => {
      await store.init()
      store.state.files.push({
        id: '1',
        name: 'test.xlsx',
        contentHash: 'hash1',
        sheets: [
          { id: 's1', originalName: 'Sheet1', displayName: 'Sheet1', format: 'json', rawData: '', parsedData: '[]', parseError: null, selected: false },
          { id: 's2', originalName: 'Sheet2', displayName: 'Sheet2', format: 'json', rawData: '', parsedData: '[]', parseError: null, selected: false },
        ],
        activeSheetIndex: 0,
      })

      store.toggleSheetSelection(0, 0)
      expect(store.state.files[0].sheets[0].selected).toBe(true)

      store.invertSheetSelection(0)
      expect(store.state.files[0].sheets[0].selected).toBe(false)
      expect(store.state.files[0].sheets[1].selected).toBe(true)
    })

    it('should select all sheets in a file', async () => {
      await store.init()
      store.state.files.push({
        id: '1',
        name: 'test.xlsx',
        contentHash: 'hash1',
        sheets: [
          { id: 's1', originalName: 'Sheet1', displayName: 'Sheet1', format: 'json', rawData: '', parsedData: '[]', parseError: null, selected: false },
          { id: 's2', originalName: 'Sheet2', displayName: 'Sheet2', format: 'json', rawData: '', parsedData: '[]', parseError: null, selected: false },
        ],
        activeSheetIndex: 0,
      })

      store.selectAllSheets(0, true)
      expect(store.state.files[0].sheets[0].selected).toBe(true)
      expect(store.state.files[0].sheets[1].selected).toBe(true)

      store.selectAllSheets(0, false)
      expect(store.state.files[0].sheets[0].selected).toBe(false)
      expect(store.state.files[0].sheets[1].selected).toBe(false)
    })
  })

  describe('getSelectedSheets', () => {
    it('should return only selected sheets', async () => {
      await store.init()
      store.state.files.push({
        id: '1',
        name: 'test.xlsx',
        contentHash: 'hash1',
        sheets: [
          { id: 's1', originalName: 'Sheet1', displayName: 'Sheet1', format: 'json', rawData: '', parsedData: '[]', parseError: null, selected: true },
          { id: 's2', originalName: 'Sheet2', displayName: 'Sheet2', format: 'json', rawData: '', parsedData: '[]', parseError: null, selected: false },
        ],
        activeSheetIndex: 0,
      })

      const selected = store.getSelectedSheets()
      expect(selected).toHaveLength(1)
      expect(selected[0].sheet.originalName).toBe('Sheet1')
    })
  })

  describe('deleteFile', () => {
    it('should remove a file and adjust activeFileIndex', async () => {
      await store.init()
      store.state.files.push(
        { id: '1', name: 'a.xlsx', contentHash: 'h1', sheets: [], activeSheetIndex: 0 },
        { id: '2', name: 'b.xlsx', contentHash: 'h2', sheets: [], activeSheetIndex: 0 }
      )
      store.setActiveFileIndex(1)

      store.deleteFile(1)
      expect(store.state.files).toHaveLength(1)
      expect(store.state.activeFileIndex).toBe(0)
    })
  })

  describe('sheet displayName operations', () => {
    it('should update sheet displayName directly', async () => {
      await store.init()
      store.state.files.push({
        id: '1',
        name: 'test.xlsx',
        contentHash: 'hash1',
        sheets: [
          { id: 's1', originalName: 'Sheet1', displayName: 'Sheet1', format: 'json', rawData: '', parsedData: '[]', parseError: null, selected: false },
        ],
        activeSheetIndex: 0,
      })

      // 更新显示名称（不自动还原）
      store.updateSheetDisplayName(0, 0, '自定义名称')
      expect(store.state.files[0].sheets[0].displayName).toBe('自定义名称')

      // 可以输入任意内容，包括空格的中间状态
      store.updateSheetDisplayName(0, 0, '')
      expect(store.state.files[0].sheets[0].displayName).toBe('')
    })

    it('should restore displayName to original when empty on blur', async () => {
      await store.init()
      store.state.files.push({
        id: '1',
        name: 'test.xlsx',
        contentHash: 'hash1',
        sheets: [
          { id: 's1', originalName: '原始名称', displayName: '自定义名称', format: 'json', rawData: '', parsedData: '[]', parseError: null, selected: false },
        ],
        activeSheetIndex: 0,
      })

      // 失焦时如果为空，还原为原始名称
      store.restoreSheetDisplayNameIfEmpty(0, 0)
      expect(store.state.files[0].sheets[0].displayName).toBe('自定义名称')

      // 设置为空后失焦
      store.updateSheetDisplayName(0, 0, '')
      store.restoreSheetDisplayNameIfEmpty(0, 0)
      expect(store.state.files[0].sheets[0].displayName).toBe('原始名称')
    })

    it('should reset sheet displayName to original', async () => {
      await store.init()
      store.state.files.push({
        id: '1',
        name: 'test.xlsx',
        contentHash: 'hash1',
        sheets: [
          { id: 's1', originalName: 'Sheet1', displayName: '自定义名称', format: 'json', rawData: '', parsedData: '[]', parseError: null, selected: false },
        ],
        activeSheetIndex: 0,
      })

      store.resetSheetDisplayName(0, 0)
      expect(store.state.files[0].sheets[0].displayName).toBe('Sheet1')
    })

    it('should set displayName to filename', async () => {
      await store.init()
      store.state.files.push({
        id: '1',
        name: 'my-data.xlsx',
        contentHash: 'hash1',
        sheets: [
          { id: 's1', originalName: 'Sheet1', displayName: 'Sheet1', format: 'json', rawData: '', parsedData: '[]', parseError: null, selected: false },
        ],
        activeSheetIndex: 0,
      })

      store.setSheetDisplayNameAsFileName(0, 0)
      // 去掉扩展名作为工作表名
      expect(store.state.files[0].sheets[0].displayName).toBe('my-data')
    })
  })

  describe('sheet format operations', () => {
    it('should update sheet format', async () => {
      await store.init()
      store.state.files.push({
        id: '1',
        name: 'test.xlsx',
        contentHash: 'hash1',
        sheets: [
          { id: 's1', originalName: 'Sheet1', displayName: 'Sheet1', format: 'json', rawData: 'a,b\n1,2', parsedData: '[]', parseError: null, selected: false },
        ],
        activeSheetIndex: 0,
      })

      // updateSheetFormat 会触发重新解析，在测试环境下 XLSX 为 mock
      // 只需验证函数调用不会报错（SheetFormat 只支持 'json' | 'csv'）
      expect(() => store.updateSheetFormat(0, 0, 'csv')).not.toThrow()
    })
  })

  describe('sheet parsedData operations', () => {
    it('should update sheet parsedData', async () => {
      await store.init()
      store.state.files.push({
        id: '1',
        name: 'test.xlsx',
        contentHash: 'hash1',
        sheets: [
          { id: 's1', originalName: 'Sheet1', displayName: 'Sheet1', format: 'json', rawData: '{"a":1}', parsedData: '[{"a":1}]', parseError: null, selected: false },
        ],
        activeSheetIndex: 0,
      })

      store.updateSheetParsedData(0, 0, '[{"b":2}]')
      expect(store.state.files[0].sheets[0].parsedData).toBe('[{"b":2}]')
    })
  })
})
