import { describe, it, expect, vi } from 'vitest'

// Mock xlsx module
vi.mock('xlsx', () => ({
  read: vi.fn(),
  utils: {
    sheet_to_json: vi.fn(),
    sheet_to_csv: vi.fn(),
    aoa_to_sheet: vi.fn(),
  },
}))

// Mock uuid
vi.mock('@/utils/uuid', () => ({
  generateUUID: vi.fn(() => 'test-uuid-0000-0000-000000000001'),
}))

import { calculateArrayBufferHash, getFileExtension, isExcelFile } from '@/utils/excel'

describe('excel utils', () => {
  describe('calculateArrayBufferHash', () => {
    it('should return a string hash for an ArrayBuffer', () => {
      const data = new Uint8Array([1, 2, 3, 4, 5])
      const buffer = data.buffer
      const hash = calculateArrayBufferHash(buffer)
      expect(typeof hash).toBe('string')
      expect(hash.length).toBeGreaterThan(0)
    })

    it('should return different hashes for different content', () => {
      const data1 = new Uint8Array([1, 2, 3])
      const data2 = new Uint8Array([4, 5, 6])
      const hash1 = calculateArrayBufferHash(data1.buffer)
      const hash2 = calculateArrayBufferHash(data2.buffer)
      expect(hash1).not.toBe(hash2)
    })

    it('should return the same hash for identical content', () => {
      const data1 = new Uint8Array([1, 2, 3])
      const data2 = new Uint8Array([1, 2, 3])
      const hash1 = calculateArrayBufferHash(data1.buffer)
      const hash2 = calculateArrayBufferHash(data2.buffer)
      expect(hash1).toBe(hash2)
    })
  })

  describe('getFileExtension', () => {
    it('should return .xlsx for xlsx files', () => {
      expect(getFileExtension('test.xlsx')).toBe('.xlsx')
    })

    it('should return .xls for xls files', () => {
      expect(getFileExtension('test.xls')).toBe('.xls')
    })

    it('should be case insensitive', () => {
      expect(getFileExtension('test.XLSX')).toBe('.xlsx')
    })
  })

  describe('isExcelFile', () => {
    it('should return true for .xlsx files', () => {
      expect(isExcelFile('test.xlsx')).toBe(true)
    })

    it('should return true for .xls files', () => {
      expect(isExcelFile('test.xls')).toBe(true)
    })

    it('should return false for non-excel files', () => {
      expect(isExcelFile('test.json')).toBe(false)
      expect(isExcelFile('test.csv')).toBe(false)
      expect(isExcelFile('test.txt')).toBe(false)
    })
  })
})
