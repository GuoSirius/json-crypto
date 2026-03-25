import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  encrypt, decrypt, processCrypto,
  detectEncrypted, cleanData, removeOuterQuotes,
  calculateMD5,
} from '@/utils/crypto'
import { formatJson, compressJson, isValidJson } from '@/utils/json'

// Mock db module for store tests (if needed)
vi.mock('@/utils/db', () => ({
  saveStoreData: vi.fn(() => Promise.resolve()),
  loadStoreData: vi.fn(() => Promise.resolve(null)),
  clearStoreData: vi.fn(() => Promise.resolve()),
}))

vi.mock('@/utils/uuid', () => ({
  generateUUID: vi.fn((i?: number) => `test-uuid-${i ?? 0}`),
}))

const TEST_KEY = 'public/elab2024.png'

describe('Integration: Crypto + JSON workflow', () => {
  const algorithms = ['AES', 'DES', 'TripleDES', 'RC4', 'Rabbit', 'Base64'] as const

  describe('Encrypt → Decrypt round-trip for all algorithms', () => {
    algorithms.forEach((algo) => {
      it(`should round-trip JSON data with ${algo}`, () => {
        const original = JSON.stringify({
          name: 'test',
          value: 42,
          nested: { items: [1, 2, 3] },
          special: '你好世界 🎉',
        })
        const encrypted = encrypt(original, algo, TEST_KEY)
        const decrypted = decrypt(encrypted, algo, TEST_KEY)
        expect(decrypted).toBe(original)
      })
    })
  })

  describe('Format → Encrypt → Decrypt → Compress workflow', () => {
    it('should produce same result after full workflow', () => {
      const raw = '{"name":"test","value":42}'

      // Step 1: Format
      const formatted = formatJson(raw)

      // Step 2: Encrypt
      const encrypted = encrypt(formatted, 'AES', TEST_KEY)

      // Step 3: Decrypt
      const decrypted = decrypt(encrypted, 'AES', TEST_KEY)

      // Step 4: Compress
      const compressed = compressJson(decrypted)

      // The original raw and final compressed should be equivalent JSON
      expect(JSON.parse(compressed)).toEqual(JSON.parse(raw))
    })

    it('should handle quoted data in workflow', () => {
      const raw = '{"key":"value"}'
      const quoted = `"${raw}"`

      // Clean quotes
      const { cleaned } = cleanData(quoted)
      expect(cleaned).toBe(raw)

      // Format → encrypt → decrypt → compress
      const formatted = formatJson(cleaned)
      const encrypted = encrypt(formatted, 'AES', TEST_KEY)
      const decrypted = decrypt(encrypted, 'AES', TEST_KEY)
      const compressed = compressJson(decrypted)

      expect(JSON.parse(compressed)).toEqual(JSON.parse(raw))
    })
  })

  describe('detectEncrypted integration', () => {
    it('should correctly identify encrypted data from all algorithms', () => {
      const plainJson = '{"test":true}'
      algorithms.forEach((algo) => {
        const encrypted = encrypt(plainJson, algo, TEST_KEY)
        if (algo !== 'Base64') {
          expect(encrypted.startsWith('U2FsdGVkX1')).toBe(true)
          expect(detectEncrypted(encrypted)).toBe(true)
        }
      })
    })

    it('should not false-positive on valid JSON after format', () => {
      const data = '{"users":[{"name":"alice","age":30},{"name":"bob","age":25}]}'
      const formatted = formatJson(data)
      expect(detectEncrypted(formatted)).toBe(false)
      expect(detectEncrypted(compressJson(data))).toBe(false)
    })

    it('should detect encrypted then clean quotes correctly', () => {
      const plainJson = '{"secret":"data"}'
      const encrypted = encrypt(plainJson, 'AES', TEST_KEY)
      const quoted = `"${encrypted}"`

      expect(detectEncrypted(quoted)).toBe(true)

      const { cleaned, hadQuotes } = cleanData(quoted)
      expect(hadQuotes).toBe(true)
      expect(cleaned).toBe(encrypted)
    })
  })

  describe('processCrypto integration', () => {
    it('should encrypt and detect mode automatically', () => {
      const json = '{"auto":true}'
      expect(detectEncrypted(json)).toBe(false)

      const encrypted = processCrypto(json, 'encrypt', 'AES', TEST_KEY)
      expect(detectEncrypted(encrypted)).toBe(true)
    })

    it('should decrypt detected encrypted data', () => {
      const json = '{"round":"trip"}'
      const encrypted = processCrypto(json, 'encrypt', 'AES', TEST_KEY)

      expect(detectEncrypted(encrypted)).toBe(true)

      const decrypted = processCrypto(encrypted, 'decrypt', 'AES', TEST_KEY)
      expect(decrypted).toBe(json)
    })

    it('should handle all algorithms through processCrypto', () => {
      const json = '{"algorithm":"test"}'
      algorithms.forEach((algo) => {
        const encrypted = processCrypto(json, 'encrypt', algo, TEST_KEY)
        const decrypted = processCrypto(encrypted, 'decrypt', algo, TEST_KEY)
        expect(decrypted).toBe(json)
      })
    })
  })

  describe('MD5 + Crypto integration', () => {
    it('should produce different MD5 for original and encrypted data', () => {
      const json = '{"integrity":"check"}'
      const encrypted = encrypt(json, 'AES', TEST_KEY)

      const originalMD5 = calculateMD5(json)
      const encryptedMD5 = calculateMD5(encrypted)

      expect(originalMD5).not.toBe(encryptedMD5)
    })

    it('should produce same MD5 after encrypt → decrypt round-trip', () => {
      const json = '{"integrity":"check"}'
      const encrypted = encrypt(json, 'AES', TEST_KEY)
      const decrypted = decrypt(encrypted, 'AES', TEST_KEY)

      expect(calculateMD5(json)).toBe(calculateMD5(decrypted))
    })
  })

  describe('isValidJson + cleanData + encrypt workflow', () => {
    it('should validate, clean, encrypt, decrypt, and validate again', () => {
      const raw = '"{"validated":true}"'

      const { cleaned } = cleanData(raw)
      expect(isValidJson(cleaned)).toBe(true)

      const encrypted = encrypt(cleaned, 'AES', TEST_KEY)
      expect(isValidJson(encrypted)).toBe(false)

      const decrypted = decrypt(encrypted, 'AES', TEST_KEY)
      expect(isValidJson(decrypted)).toBe(true)
      expect(JSON.parse(decrypted)).toEqual({ validated: true })
    })
  })

  describe('Multi-file batch encryption simulation', () => {
    it('should encrypt multiple files and maintain data integrity', () => {
      const files = [
        { name: 'config.json', content: '{"env":"production","port":8080}' },
        { name: 'users.json', content: '{"users":[{"id":1,"name":"alice"},{"id":2,"name":"bob"}]}' },
        { name: 'data.json', content: '{"items":[1,2,3,4,5],"total":15}' },
      ]

      const encrypted = files.map(f => ({
        name: f.name,
        original: f.content,
        encrypted: encrypt(f.content, 'AES', TEST_KEY),
      }))

      encrypted.forEach(f => {
        expect(f.encrypted).not.toBe(f.original)
        expect(f.encrypted.length).toBeGreaterThan(0)
      })

      encrypted.forEach(f => {
        const decrypted = decrypt(f.encrypted, 'AES', TEST_KEY)
        expect(decrypted).toBe(f.original)
        expect(isValidJson(decrypted)).toBe(true)
      })
    })
  })
})
