import { describe, it, expect, vi, beforeEach } from 'vitest'
import { encrypt, decrypt, calculateMD5 } from '@/utils/crypto'
import { formatJson, compressJson } from '@/utils/json'

vi.mock('@/utils/db', () => ({
  saveStoreData: vi.fn(() => Promise.resolve()),
  loadStoreData: vi.fn(() => Promise.resolve(null)),
  clearStoreData: vi.fn(() => Promise.resolve()),
}))

vi.mock('@/utils/uuid', () => ({
  generateUUID: vi.fn((i?: number) => `test-uuid-${i ?? 0}`),
}))

const TEST_KEY = 'public/elab2024.png'

// Helper to generate test data of a given size in bytes
function generateJsonData(targetSizeKB: number): string {
  const obj: Record<string, string> = {}
  let currentSize = 0
  let index = 0
  while (currentSize < targetSizeKB * 1024) {
    const value = `v${index}_` + 'x'.repeat(50)
    obj[`k${String(index).padStart(5, '0')}`] = value
    currentSize += value.length + 8 // approximate key + value size
    index++
  }
  return JSON.stringify(obj)
}

function generatePlainText(targetSizeKB: number): string {
  return 'a'.repeat(targetSizeKB * 1024)
}

describe('Performance Benchmarks', () => {
  describe('Encryption performance', () => {
    it('AES encrypt 10KB text < 500ms', () => {
      const data = generatePlainText(10)
      const start = performance.now()
      encrypt(data, 'AES', TEST_KEY)
      const elapsed = performance.now() - start
      expect(elapsed).toBeLessThan(500)
    })

    it('AES encrypt 100KB text < 2000ms', () => {
      const data = generatePlainText(100)
      const start = performance.now()
      encrypt(data, 'AES', TEST_KEY)
      const elapsed = performance.now() - start
      expect(elapsed).toBeLessThan(2000)
    })

    it('AES decrypt 10KB text < 500ms', () => {
      const data = generatePlainText(10)
      const encrypted = encrypt(data, 'AES', TEST_KEY)
      const start = performance.now()
      decrypt(encrypted, 'AES', TEST_KEY)
      const elapsed = performance.now() - start
      expect(elapsed).toBeLessThan(500)
    })

    it('Base64 encode/decode 100KB text < 500ms', () => {
      const data = generatePlainText(100)
      const start = performance.now()
      const encoded = encrypt(data, 'Base64', TEST_KEY)
      decrypt(encoded, 'Base64', TEST_KEY)
      const elapsed = performance.now() - start
      expect(elapsed).toBeLessThan(500)
    })

    it('AES encrypt + decrypt round-trip 10KB < 1000ms', () => {
      const data = generateJsonData(10)
      const start = performance.now()
      const encrypted = encrypt(data, 'AES', TEST_KEY)
      const decrypted = decrypt(encrypted, 'AES', TEST_KEY)
      const elapsed = performance.now() - start
      expect(decrypted).toBe(data)
      expect(elapsed).toBeLessThan(1000)
    })
  })

  describe('JSON processing performance', () => {
    it('formatJson 10KB JSON < 100ms', () => {
      const json = generateJsonData(10)
      const start = performance.now()
      formatJson(json)
      const elapsed = performance.now() - start
      expect(elapsed).toBeLessThan(100)
    })

    it('compressJson 10KB JSON < 100ms', () => {
      const json = generateJsonData(10)
      // First format it, then compress
      const formatted = formatJson(json)
      const start = performance.now()
      compressJson(formatted)
      const elapsed = performance.now() - start
      expect(elapsed).toBeLessThan(100)
    })

    it('formatJson 100KB JSON < 500ms', () => {
      const json = generateJsonData(100)
      const start = performance.now()
      formatJson(json)
      const elapsed = performance.now() - start
      expect(elapsed).toBeLessThan(500)
    })

    it('compressJson 100KB JSON < 500ms', () => {
      const json = generateJsonData(100)
      const formatted = formatJson(json)
      const start = performance.now()
      compressJson(formatted)
      const elapsed = performance.now() - start
      expect(elapsed).toBeLessThan(500)
    })

    it('format → compress round-trip 10KB < 200ms', () => {
      const json = generateJsonData(10)
      const start = performance.now()
      const formatted = formatJson(json)
      const compressed = compressJson(formatted)
      const elapsed = performance.now() - start
      expect(JSON.parse(compressed)).toEqual(JSON.parse(json))
      expect(elapsed).toBeLessThan(200)
    })
  })

  describe('MD5 calculation performance', () => {
    it('calculateMD5 10KB text < 50ms', () => {
      const data = generatePlainText(10)
      const start = performance.now()
      calculateMD5(data)
      const elapsed = performance.now() - start
      expect(elapsed).toBeLessThan(50)
    })

    it('calculateMD5 100KB text < 200ms', () => {
      const data = generatePlainText(100)
      const start = performance.now()
      calculateMD5(data)
      const elapsed = performance.now() - start
      expect(elapsed).toBeLessThan(200)
    })
  })

  describe('Store performance (bulk operations)', () => {
    it('should add 20 files and filter within acceptable time', async () => {
      const { useJsonStore } = await import('@/stores/jsonStore')
      const store = useJsonStore()
      await store.reset()
      await store.init()

      function createMockFile(name: string, content: string): File {
        return new File([content], name, { type: 'application/json' })
      }

      const files = Array.from({ length: 20 }, (_, i) =>
        createMockFile(`perf_test_${i}.json`, `{"index":${i},"data":"${'x'.repeat(100)}"}`)
      )

      const start = performance.now()
      await store.addFiles(files)
      const addElapsed = performance.now() - start

      expect(store.state.files).toHaveLength(20)
      expect(addElapsed).toBeLessThan(3000)

      // Test filter performance
      const filterStart = performance.now()
      store.setFilter('all')
      store.getFilteredFiles()
      const filterElapsed = performance.now() - filterStart

      expect(filterElapsed).toBeLessThan(100)

      // Test search performance
      const searchStart = performance.now()
      store.setSearchKeyword('perf_test_15')
      store.getFilteredFiles()
      const searchElapsed = performance.now() - searchStart

      expect(searchElapsed).toBeLessThan(100)
    })
  })
})
