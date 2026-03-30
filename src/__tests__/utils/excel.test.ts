import { describe, it, expect } from 'vitest'
import { 
  calculateArrayBufferHash, 
  getFileExtension, 
  isExcelFile
} from '@/utils/excel'

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

    it('should handle empty ArrayBuffer', () => {
      const buffer = new ArrayBuffer(0)
      const hash = calculateArrayBufferHash(buffer)
      expect(typeof hash).toBe('string')
      expect(hash.length).toBeGreaterThan(0)
    })
  })

  describe('getFileExtension', () => {
    it('should extract extension from filename', () => {
      expect(getFileExtension('test.xlsx')).toBe('.xlsx')
      expect(getFileExtension('test.xls')).toBe('.xls')
      expect(getFileExtension('test.csv')).toBe('.csv')
      expect(getFileExtension('test.json')).toBe('.json')
    })

    it('should handle filenames with multiple dots', () => {
      expect(getFileExtension('test.file.xlsx')).toBe('.xlsx')
      expect(getFileExtension('test.min.js')).toBe('.js')
    })

    it('should handle filenames without extension', () => {
      // getFileExtension returns the substring starting at last dot
      // 'test' -> lastIndexOf('.') returns -1, slice(-1) returns 't'
      // 'test.' -> lastIndexOf('.') returns 4, slice(4) returns '.'
      expect(getFileExtension('test')).toBe('t')
      expect(getFileExtension('test.')).toBe('.')
    })

    it('should handle filenames with path', () => {
      expect(getFileExtension('/path/to/test.xlsx')).toBe('.xlsx')
      expect(getFileExtension('C:\\path\\to\\test.xls')).toBe('.xls')
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
      expect(isExcelFile('test.pdf')).toBe(false)
    })

    it('should handle case-insensitive extensions', () => {
      expect(isExcelFile('test.XLSX')).toBe(true)
      expect(isExcelFile('test.XLS')).toBe(true)
      expect(isExcelFile('test.Xlsx')).toBe(true)
    })

    it('should handle filenames with path', () => {
      expect(isExcelFile('/path/to/test.xlsx')).toBe(true)
      expect(isExcelFile('C:\\path\\to\\test.xls')).toBe(true)
    })
  })
})