import { describe, it, expect, vi, beforeEach } from 'vitest'

// Use vi.hoisted to avoid hoisting issues with vi.mock factory
const { mockOpenDB, mockDbPut, mockDbGet, mockDbDelete, mockCreateObjectStore } = vi.hoisted(() => ({
  mockOpenDB: vi.fn(),
  mockDbPut: vi.fn(),
  mockDbGet: vi.fn(),
  mockDbDelete: vi.fn(),
  mockCreateObjectStore: vi.fn(),
}))

vi.mock('idb', () => ({
  openDB: mockOpenDB,
}))

import { getDB, saveStoreData, loadStoreData, clearStoreData } from '@/utils/db'
import type { StoreData } from '@/types'

describe('db', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getDB', () => {
    it('should call openDB with correct parameters', async () => {
      mockOpenDB.mockImplementation((_name: string, _version: number, options?: { upgrade?: (db: any) => void }) => {
        if (options?.upgrade) {
          options.upgrade({ objectStoreNames: { contains: () => true }, createObjectStore: mockCreateObjectStore })
        }
        return Promise.resolve({ put: mockDbPut, get: mockDbGet, delete: mockDbDelete })
      })
      await getDB()
      expect(mockOpenDB).toHaveBeenCalledWith('json-crypto-db', 2, expect.objectContaining({
        upgrade: expect.any(Function),
      }))
    })

    it('should call createObjectStore when store does not exist', async () => {
      mockOpenDB.mockImplementation((_name: string, _version: number, options?: { upgrade?: (db: any) => void }) => {
        if (options?.upgrade) {
          options.upgrade({ objectStoreNames: { contains: () => false }, createObjectStore: mockCreateObjectStore })
        }
        return Promise.resolve({ put: mockDbPut, get: mockDbGet, delete: mockDbDelete })
      })
      await getDB()
      expect(mockCreateObjectStore).toHaveBeenCalledWith('jsonStore')
    })

    it('should not call createObjectStore when store already exists', async () => {
      mockOpenDB.mockImplementation((_name: string, _version: number, options?: { upgrade?: (db: any) => void }) => {
        if (options?.upgrade) {
          options.upgrade({ objectStoreNames: { contains: () => true }, createObjectStore: mockCreateObjectStore })
        }
        return Promise.resolve({ put: mockDbPut, get: mockDbGet, delete: mockDbDelete })
      })
      await getDB()
      expect(mockCreateObjectStore).not.toHaveBeenCalled()
    })
  })

  describe('saveStoreData', () => {
    it('should save data with correct store name and key', async () => {
      mockOpenDB.mockResolvedValue({ put: mockDbPut, get: mockDbGet, delete: mockDbDelete })
      const data: StoreData = {
        files: [],
        activeIndex: 0,
        pasteText: '',
        cryptoConfig: { algorithm: 'AES', key: 'test', mode: 'encrypt', wrapWithQuotes: false },
      }
      await saveStoreData(data)
      expect(mockDbPut).toHaveBeenCalledWith('jsonStore', data, 'app-data')
    })
  })

  describe('loadStoreData', () => {
    it('should load data from correct store and key', async () => {
      const mockData: StoreData = {
        files: [{ id: '1', name: 'test.json', content: '{}', md5: 'm1', processed: '', status: 'pending' }],
        activeIndex: 0,
        pasteText: '',
        cryptoConfig: { algorithm: 'AES', key: 'test', mode: 'encrypt', wrapWithQuotes: false },
      }
      mockDbGet.mockResolvedValue(mockData)
      mockOpenDB.mockResolvedValue({ put: mockDbPut, get: mockDbGet, delete: mockDbDelete })

      const result = await loadStoreData()
      expect(mockDbGet).toHaveBeenCalledWith('jsonStore', 'app-data')
      expect(result).toEqual(mockData)
    })

    it('should return null when no data exists', async () => {
      mockDbGet.mockResolvedValue(undefined)
      mockOpenDB.mockResolvedValue({ put: mockDbPut, get: mockDbGet, delete: mockDbDelete })

      const result = await loadStoreData()
      expect(result).toBeNull()
    })
  })

  describe('clearStoreData', () => {
    it('should delete data from correct store and key', async () => {
      mockOpenDB.mockResolvedValue({ put: mockDbPut, get: mockDbGet, delete: mockDbDelete })
      await clearStoreData()
      expect(mockDbDelete).toHaveBeenCalledWith('jsonStore', 'app-data')
    })
  })
})
