import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { FileFilter } from '@/stores/jsonStore'

// Mock db module BEFORE importing the store
vi.mock('@/utils/db', () => ({
  saveStoreData: vi.fn(() => Promise.resolve()),
  loadStoreData: vi.fn(() => Promise.resolve(null)),
  clearStoreData: vi.fn(() => Promise.resolve()),
}))

// Mock uuid to return deterministic values
vi.mock('@/utils/uuid', () => ({
  generateUUID: vi.fn(() => 'test-uuid-0000-0000-000000000001'),
}))

import { useJsonStore } from '@/stores/jsonStore'

// Create a mock File object
function createMockFile(name: string, content: string): File {
  const file = new File([content], name, { type: 'application/json' })
  return file
}

describe('jsonStore', () => {
  let store: ReturnType<typeof useJsonStore>

  beforeEach(async () => {
    vi.clearAllMocks()
    // Re-initialize store for each test
    await useJsonStore().reset()
    store = useJsonStore()
    // Re-init after reset (reset sets initialized = false)
    await store.init()
  })

  describe('init', () => {
    it('should initialize store with default values', async () => {
      const freshStore = useJsonStore()
      await freshStore.init()
      expect(freshStore.state.files).toEqual([])
      expect(freshStore.state.activeIndex).toBe(0)
      expect(freshStore.state.pasteText).toBe('')
      expect(freshStore.state.cryptoConfig.algorithm).toBe('AES')
      expect(freshStore.state.cryptoConfig.mode).toBe('encrypt')
      expect(freshStore.state.cryptoConfig.key).toBe('public/elab2024.png')
      expect(freshStore.state.filter).toBe('all')
      expect(freshStore.state.searchKeyword).toBe('')
    })

    it('should be idempotent - calling init multiple times has no side effect', async () => {
      await store.init()
      await store.init()
      await store.init()
      expect(store.state.files).toHaveLength(0)
    })
  })

  describe('hasData / isFileMode', () => {
    it('should return false when no data', () => {
      expect(store.hasData()).toBe(false)
      expect(store.isFileMode()).toBe(false)
    })

    it('should return true for hasData when pasteText has content', () => {
      store.setPasteText('{"key":"value"}')
      expect(store.hasData()).toBe(true)
      expect(store.isFileMode()).toBe(false)
    })

    it('should return true for both when files exist', async () => {
      const file = createMockFile('test.json', '{"key":"value"}')
      await store.addFiles([file])
      expect(store.hasData()).toBe(true)
      expect(store.isFileMode()).toBe(true)
    })
  })

  describe('setPasteText', () => {
    it('should set paste text', () => {
      store.setPasteText('{"key":"value"}')
      expect(store.state.pasteText).toBe('{"key":"value"}')
    })

    it('should clean outer quotes from paste text', () => {
      store.setPasteText('"{"key":"value"}"')
      expect(store.state.pasteText).toBe('{"key":"value"}')
    })
  })

  describe('addFiles', () => {
    it('should add a single file', async () => {
      const file = createMockFile('test.json', '{"key":"value"}')
      const result = await store.addFiles([file])
      expect(result.addedCount).toBe(1)
      expect(result.duplicateCount).toBe(0)
      expect(store.state.files).toHaveLength(1)
      expect(store.state.files[0].name).toBe('test.json')
      expect(store.state.files[0].status).toBe('pending')
    })

    it('should add multiple files', async () => {
      const files = [
        createMockFile('a.json', '{"a":1}'),
        createMockFile('b.json', '{"b":2}'),
      ]
      const result = await store.addFiles(files)
      expect(result.addedCount).toBe(2)
      expect(store.state.files).toHaveLength(2)
    })

    it('should detect duplicates by name + MD5', async () => {
      const files = [
        createMockFile('same.json', '{"same":true}'),
        createMockFile('same.json', '{"same":true}'),
      ]
      const result = await store.addFiles(files)
      expect(result.addedCount).toBe(1)
      expect(result.duplicateCount).toBe(1)
      expect(result.duplicateNames).toContain('same.json')
      expect(store.state.files).toHaveLength(1)
    })

    it('should allow same name with different content (different MD5)', async () => {
      const files = [
        createMockFile('config.json', '{"version":1}'),
        createMockFile('config.json', '{"version":2}'),
      ]
      const result = await store.addFiles(files)
      expect(result.addedCount).toBe(2)
      expect(result.duplicateCount).toBe(0)
      expect(store.state.files).toHaveLength(2)
    })

    it('should handle file read errors gracefully', async () => {
      const file = createMockFile('error.json', '')
      const result = await store.addFiles([file])
      expect(result.addedCount).toBe(1)
    })

    it('should calculate MD5 for each file', async () => {
      const file = createMockFile('test.json', '{"key":"value"}')
      await store.addFiles([file])
      expect(store.state.files[0].md5).toBeTruthy()
      expect(store.state.files[0].md5).toHaveLength(32)
    })
  })

  describe('setActiveIndex', () => {
    it('should update active index', async () => {
      await store.addFiles([
        createMockFile('a.json', '{"a":1}'),
        createMockFile('b.json', '{"b":2}'),
      ])
      store.setActiveIndex(1)
      expect(store.state.activeIndex).toBe(1)
    })
  })

  describe('getCurrentSource / getCurrentProcessed', () => {
    it('should return paste text in paste mode', () => {
      store.setPasteText('{"paste":true}')
      expect(store.getCurrentSource()).toBe('{"paste":true}')
      expect(store.getCurrentProcessed()).toBe('')
    })

    it('should return file content in file mode', async () => {
      await store.addFiles([createMockFile('test.json', '{"file":true}')])
      expect(store.getCurrentSource()).toBe('{"file":true}')
      expect(store.getCurrentProcessed()).toBe('')
    })

    it('should return processed content', async () => {
      await store.addFiles([createMockFile('test.json', '{"key":"value"}')])
      store.updateProcessed(0, '{"processed":true}', 'done')
      expect(store.getCurrentProcessed()).toBe('{"processed":true}')
    })

    it('should return empty string for invalid index', async () => {
      await store.addFiles([createMockFile('test.json', '{"key":"value"}')])
      store.setActiveIndex(999)
      expect(store.getCurrentSource()).toBe('')
    })
  })

  describe('updateProcessed', () => {
    it('should update processed content and status', async () => {
      await store.addFiles([createMockFile('test.json', '{"key":"value"}')])
      store.updateProcessed(0, '{"encrypted":"data"}', 'done')
      expect(store.state.files[0].processed).toBe('{"encrypted":"data"}')
      expect(store.state.files[0].status).toBe('done')
    })

    it('should update status to error', async () => {
      await store.addFiles([createMockFile('test.json', '{"key":"value"}')])
      store.updateProcessed(0, '操作失败', 'error')
      expect(store.state.files[0].status).toBe('error')
    })

    it('should not crash on invalid index', () => {
      store.updateProcessed(999, 'test', 'done')
    })
  })

  describe('detectAndSetCryptoMode', () => {
    it('should set mode to encrypt for plain JSON', () => {
      store.detectAndSetCryptoMode('{"key":"value"}')
      expect(store.state.cryptoConfig.mode).toBe('encrypt')
    })

    it('should set mode to decrypt for encrypted data', () => {
      store.detectAndSetCryptoMode('U2FsdGVkX1+vupwdZ+p3a2XfYkx2GGc8g9XhgO8I0sk=')
      expect(store.state.cryptoConfig.mode).toBe('decrypt')
    })

    it('should reset key to default', () => {
      store.state.cryptoConfig.key = 'custom-key'
      store.detectAndSetCryptoMode('{"key":"value"}')
      expect(store.state.cryptoConfig.key).toBe('public/elab2024.png')
    })
  })

  describe('getFilteredFiles', () => {
    const encryptedContent = 'U2FsdGVkX1+vupwdZ+p3a2XfYkx2GGc8g9XhgO8I0sk='

    beforeEach(async () => {
      await store.addFiles([
        createMockFile('plain.json', '{"plain":true}'),
        createMockFile('encrypted.json', encryptedContent),
        createMockFile('processed.json', '{"processed":true}'),
      ])
      store.state.files[2].processed = '{"result":true}'
      store.state.files[2].status = 'done'
    })

    it('should return all files with "all" filter', () => {
      store.setFilter('all')
      expect(store.getFilteredFiles()).toHaveLength(3)
    })

    it('should filter pending-encrypt (plain files)', () => {
      store.setFilter('pending-encrypt')
      const filtered = store.getFilteredFiles()
      expect(filtered).toHaveLength(2)
    })

    it('should filter pending-decrypt (encrypted files)', () => {
      store.setFilter('pending-decrypt')
      const filtered = store.getFilteredFiles()
      expect(filtered).toHaveLength(1)
      expect(filtered[0].name).toBe('encrypted.json')
    })

    it('should filter unencrypted (plain + not processed)', () => {
      store.setFilter('unencrypted')
      const filtered = store.getFilteredFiles()
      expect(filtered).toHaveLength(1)
      expect(filtered[0].name).toBe('plain.json')
    })

    it('should filter undecrypted (encrypted + not processed)', () => {
      store.setFilter('undecrypted')
      const filtered = store.getFilteredFiles()
      expect(filtered).toHaveLength(1)
      expect(filtered[0].name).toBe('encrypted.json')
    })

    it('should filter by search keyword', () => {
      store.setFilter('all')
      store.setSearchKeyword('plain')
      const filtered = store.getFilteredFiles()
      expect(filtered).toHaveLength(1)
      expect(filtered[0].name).toBe('plain.json')
    })

    it('should filter case-insensitively by keyword', () => {
      store.setFilter('all')
      store.setSearchKeyword('PLAIN')
      const filtered = store.getFilteredFiles()
      expect(filtered).toHaveLength(1)
    })

    it('should combine filter and keyword', () => {
      store.setFilter('pending-encrypt')
      store.setSearchKeyword('processed')
      const filtered = store.getFilteredFiles()
      expect(filtered).toHaveLength(1)
      expect(filtered[0].name).toBe('processed.json')
    })

    it('should return empty for non-matching keyword', () => {
      store.setFilter('all')
      store.setSearchKeyword('nonexistent')
      expect(store.getFilteredFiles()).toHaveLength(0)
    })
  })

  describe('getFilteredIndexes', () => {
    it('should return correct original indexes', async () => {
      await store.addFiles([
        createMockFile('a.json', '{"a":1}'),
        createMockFile('b.json', '{"b":2}'),
        createMockFile('c.json', '{"c":3}'),
      ])
      store.setFilter('all')
      expect(store.getFilteredIndexes()).toEqual([0, 1, 2])

      store.setSearchKeyword('b')
      expect(store.getFilteredIndexes()).toEqual([1])
    })
  })

  describe('reset', () => {
    it('should clear all state', async () => {
      await store.addFiles([createMockFile('test.json', '{"key":"value"}')])
      store.setPasteText('text')
      store.state.cryptoConfig.algorithm = 'DES'

      await store.reset()

      expect(store.state.files).toHaveLength(0)
      expect(store.state.pasteText).toBe('')
      expect(store.state.cryptoConfig.algorithm).toBe('AES')
      expect(store.state.filter).toBe('all')
      expect(store.state.searchKeyword).toBe('')
    })
  })

  describe('resetForNewUpload', () => {
    it('should clear processed data but keep files and config', async () => {
      await store.addFiles([createMockFile('test.json', '{"key":"value"}')])
      store.updateProcessed(0, '{"encrypted":"data"}', 'done')
      store.state.cryptoConfig.algorithm = 'DES'

      await store.resetForNewUpload()

      expect(store.state.files).toHaveLength(1)
      expect(store.state.files[0].processed).toBe('')
      expect(store.state.files[0].status).toBe('pending')
      expect(store.state.cryptoConfig.algorithm).toBe('DES')
    })
  })

  describe('Error Handling & Bulk Operations', () => {
    it('should handle persist failure gracefully (saveStoreData rejects)', async () => {
      // Get the mocked saveStoreData and make it reject when called
      const { saveStoreData } = await import('@/utils/db')
      
      // Create a function that returns a rejecting promise when called (not immediately)
      vi.mocked(saveStoreData).mockImplementation(() => 
        Promise.reject(new Error('DB write failed'))
      )

      // Adding a file triggers persist via watch — the rejection is caught internally
      const file = createMockFile('test.json', '{"key":"value"}')

      // Suppress the unhandled rejection from the watch-triggered persist
      const spy = vi.spyOn(console, 'error').mockImplementation(() => {})
      try {
        const result = await store.addFiles([file])
        expect(result.addedCount).toBe(1)
        // Allow the watch callback to finish
        await new Promise(resolve => setTimeout(resolve, 10))
      } finally {
        spy.mockRestore()
        // Reset the mock to prevent affecting other tests
        vi.mocked(saveStoreData).mockReset()
      }
    })

    it('should handle corrupted saved data (missing fields)', async () => {
      // Reset the module-level initialized flag
      await store.reset()

      // Make loadStoreData return corrupted data
      const { loadStoreData } = await import('@/utils/db')
      vi.mocked(loadStoreData).mockResolvedValueOnce({
        activeIndex: undefined as any,
        pasteText: undefined as any,
        cryptoConfig: undefined as any,
        files: undefined as any,
      } as any)

      const freshStore = useJsonStore()
      // Should not throw when loading corrupted data
      await expect(freshStore.init()).resolves.toBeUndefined()
    })

    it('should handle loadStoreData returning null (no saved data)', async () => {
      await store.reset()
      const { loadStoreData } = await import('@/utils/db')
      vi.mocked(loadStoreData).mockResolvedValueOnce(null)

      const freshStore = useJsonStore()
      await freshStore.init()
      expect(freshStore.state.files).toEqual([])
      expect(freshStore.state.pasteText).toBe('')
    })

    it('should batch add 20 files with different content', async () => {
      const files = Array.from({ length: 20 }, (_, i) =>
        createMockFile(`file_${i}.json`, `{"index":${i},"data":"content_${i}"}`)
      )
      const result = await store.addFiles(files)
      expect(result.addedCount).toBe(20)
      expect(result.duplicateCount).toBe(0)
      expect(store.state.files).toHaveLength(20)
    })

    it('should filter efficiently with 20 files', async () => {
      const files = Array.from({ length: 20 }, (_, i) =>
        createMockFile(`file_${i}.json`, `{"index":${i}}`)
      )
      await store.addFiles(files)

      // Mark some as processed
      for (let i = 0; i < 10; i++) {
        store.updateProcessed(i, `{"processed":${i}}`, 'done')
      }

      store.setFilter('pending-encrypt')
      const filtered = store.getFilteredFiles()
      // All files are plain JSON, so none are encrypted — all are pending-encrypt
      // But 10 are already processed, so unencrypted filter would return fewer
      expect(filtered.length).toBeGreaterThan(0)
    })

    it('should search efficiently with 20 files', async () => {
      const files = Array.from({ length: 20 }, (_, i) =>
        createMockFile(`data_${i}.json`, `{"value":${i}}`)
      )
      await store.addFiles(files)

      store.setSearchKeyword('data_15')
      const filtered = store.getFilteredFiles()
      expect(filtered).toHaveLength(1)
      expect(filtered[0].name).toBe('data_15.json')
    })

    it('should sanitize content with null characters', async () => {
      const file = createMockFile('dirty.json', '{"key":\x00"value\x00"}')
      const result = await store.addFiles([file])
      expect(result.addedCount).toBe(1)
      // Null characters should be stripped from content
      expect(store.state.files[0].content).not.toContain('\x00')
    })

    it('should handle clearStoreData failure during reset', async () => {
      const { clearStoreData } = await import('@/utils/db')
      vi.mocked(clearStoreData).mockRejectedValueOnce(new Error('DB clear failed'))

      // The store's reset() calls clearStoreData() which will reject
      // Since reset() doesn't catch the rejection, we need to handle it
      try {
        await store.reset()
      } catch {
        // Expected: clearStoreData rejection propagates from reset
      }

      // After reset (even with error), the in-memory state should still be cleared
      expect(store.state.files).toHaveLength(0)
      expect(store.state.pasteText).toBe('')
    })
  })
})
