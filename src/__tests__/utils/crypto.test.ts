import { describe, it, expect } from 'vitest'
import {
  calculateMD5,
  encrypt,
  decrypt,
  processCrypto,
  removeOuterQuotes,
  detectEncrypted,
  cleanData,
} from '@/utils/crypto'

const TEST_KEY = 'public/elab2024.png'

describe('calculateMD5', () => {
  it('should return a 32-character hex string', () => {
    const result = calculateMD5('hello')
    expect(result).toHaveLength(32)
    expect(result).toMatch(/^[a-f0-9]{32}$/)
  })

  it('should produce consistent results for the same input', () => {
    expect(calculateMD5('test')).toBe(calculateMD5('test'))
  })

  it('should return different hashes for different inputs', () => {
    expect(calculateMD5('abc')).not.toBe(calculateMD5('abd'))
  })

  it('should handle empty string', () => {
    const result = calculateMD5('')
    expect(result).toHaveLength(32)
    expect(result).toBe('d41d8cd98f00b204e9800998ecf8427e')
  })

  it('should handle special characters', () => {
    const result = calculateMD5('<>&"\'\\n\\t')
    expect(result).toHaveLength(32)
  })

  it('should handle Chinese characters', () => {
    const result = calculateMD5('你好世界')
    expect(result).toHaveLength(32)
  })

  it('should handle long strings', () => {
    const longStr = 'a'.repeat(10000)
    const result = calculateMD5(longStr)
    expect(result).toHaveLength(32)
  })

  it('should handle JSON content', () => {
    const json = '{"name":"test","value":123}'
    const result = calculateMD5(json)
    expect(result).toHaveLength(32)
  })
})

describe('encrypt', () => {
  it('should encrypt with Base64 algorithm', () => {
    const result = encrypt('hello world', 'Base64', TEST_KEY)
    expect(result).toBeTruthy()
    expect(result).not.toBe('hello world')
  })

  it('should encrypt with AES algorithm', () => {
    const result = encrypt('hello world', 'AES', TEST_KEY)
    expect(result).toBeTruthy()
    expect(result).not.toBe('hello world')
  })

  it('should encrypt with DES algorithm', () => {
    const result = encrypt('hello world', 'DES', TEST_KEY)
    expect(result).toBeTruthy()
    expect(result).not.toBe('hello world')
  })

  it('should encrypt with TripleDES algorithm', () => {
    const result = encrypt('hello world', 'TripleDES', TEST_KEY)
    expect(result).toBeTruthy()
    expect(result).not.toBe('hello world')
  })

  it('should encrypt with RC4 algorithm', () => {
    const result = encrypt('hello world', 'RC4', TEST_KEY)
    expect(result).toBeTruthy()
    expect(result).not.toBe('hello world')
  })

  it('should encrypt with Rabbit algorithm', () => {
    const result = encrypt('hello world', 'Rabbit', TEST_KEY)
    expect(result).toBeTruthy()
    expect(result).not.toBe('hello world')
  })

  it('should produce different ciphertexts for different algorithms', () => {
    const data = 'test data'
    const aes = encrypt(data, 'AES', TEST_KEY)
    const des = encrypt(data, 'DES', TEST_KEY)
    const b64 = encrypt(data, 'Base64', TEST_KEY)
    expect(aes).not.toBe(des)
    expect(aes).not.toBe(b64)
    expect(des).not.toBe(b64)
  })

  it('should produce different ciphertexts for different keys', () => {
    const data = 'test data'
    const r1 = encrypt(data, 'AES', 'key1')
    const r2 = encrypt(data, 'AES', 'key2')
    expect(r1).not.toBe(r2)
  })

  it('should encrypt empty string', () => {
    const result = encrypt('', 'AES', TEST_KEY)
    expect(result).toBeTruthy()
  })

  it('should encrypt JSON content', () => {
    const json = '{"name":"test","value":123}'
    const result = encrypt(json, 'AES', TEST_KEY)
    expect(result).toBeTruthy()
    expect(result).not.toBe(json)
  })

  it('should encrypt Chinese characters', () => {
    const result = encrypt('你好世界', 'AES', TEST_KEY)
    expect(result).toBeTruthy()
  })
})

describe('decrypt', () => {
  it('should decrypt Base64 encrypted data', () => {
    const encrypted = encrypt('hello world', 'Base64', TEST_KEY)
    const decrypted = decrypt(encrypted, 'Base64', TEST_KEY)
    expect(decrypted).toBe('hello world')
  })

  it('should decrypt AES encrypted data', () => {
    const encrypted = encrypt('hello world', 'AES', TEST_KEY)
    const decrypted = decrypt(encrypted, 'AES', TEST_KEY)
    expect(decrypted).toBe('hello world')
  })

  it('should decrypt DES encrypted data', () => {
    const encrypted = encrypt('hello world', 'DES', TEST_KEY)
    const decrypted = decrypt(encrypted, 'DES', TEST_KEY)
    expect(decrypted).toBe('hello world')
  })

  it('should decrypt TripleDES encrypted data', () => {
    const encrypted = encrypt('hello world', 'TripleDES', TEST_KEY)
    const decrypted = decrypt(encrypted, 'TripleDES', TEST_KEY)
    expect(decrypted).toBe('hello world')
  })

  it('should decrypt RC4 encrypted data', () => {
    const encrypted = encrypt('hello world', 'RC4', TEST_KEY)
    const decrypted = decrypt(encrypted, 'RC4', TEST_KEY)
    expect(decrypted).toBe('hello world')
  })

  it('should decrypt Rabbit encrypted data', () => {
    const encrypted = encrypt('hello world', 'Rabbit', TEST_KEY)
    const decrypted = decrypt(encrypted, 'Rabbit', TEST_KEY)
    expect(decrypted).toBe('hello world')
  })

  it('should throw error when decrypting with wrong key', () => {
    const encrypted = encrypt('hello', 'AES', 'correct-key')
    expect(() => decrypt(encrypted, 'AES', 'wrong-key')).toThrow()
  })

  it('should throw error for invalid Base64 data', () => {
    expect(() => decrypt('not-base64!!!', 'Base64', TEST_KEY)).toThrow()
  })

  it('should round-trip JSON data', () => {
    const json = '{"name":"test","value":123,"nested":{"key":"val"}}'
    const encrypted = encrypt(json, 'AES', TEST_KEY)
    const decrypted = decrypt(encrypted, 'AES', TEST_KEY)
    expect(decrypted).toBe(json)
  })

  it('should round-trip Chinese characters', () => {
    const text = '你好世界，这是一个测试'
    const encrypted = encrypt(text, 'AES', TEST_KEY)
    const decrypted = decrypt(encrypted, 'AES', TEST_KEY)
    expect(decrypted).toBe(text)
  })

  it('should throw for Base64 with only invalid chars', () => {
    expect(() => decrypt('!!!@@@###', 'Base64', TEST_KEY)).toThrow('无效的 Base64 数据')
  })
})

describe('processCrypto', () => {
  it('should encrypt when mode is encrypt', () => {
    const result = processCrypto('hello', 'encrypt', 'AES', TEST_KEY)
    expect(result).toBeTruthy()
    expect(result).not.toBe('hello')
  })

  it('should decrypt when mode is decrypt', () => {
    const encrypted = encrypt('hello', 'AES', TEST_KEY)
    const result = processCrypto(encrypted, 'decrypt', 'AES', TEST_KEY)
    expect(result).toBe('hello')
  })

  it('should throw on decrypt failure', () => {
    expect(() => processCrypto('invalid', 'decrypt', 'AES', TEST_KEY)).toThrow()
  })
})

describe('removeOuterQuotes', () => {
  it('should remove double quotes', () => {
    expect(removeOuterQuotes('"hello"')).toBe('hello')
  })

  it('should remove single quotes', () => {
    expect(removeOuterQuotes("'hello'")).toBe('hello')
  })

  it('should not modify unquoted string', () => {
    expect(removeOuterQuotes('hello')).toBe('hello')
  })

  it('should handle empty string', () => {
    expect(removeOuterQuotes('')).toBe('')
  })

  it('should not remove quotes from single character', () => {
    expect(removeOuterQuotes('"')).toBe('"')
    expect(removeOuterQuotes("'")).toBe("'")
  })

  it('should handle strings with only one quote type', () => {
    expect(removeOuterQuotes('"hello')).toBe('"hello')
    expect(removeOuterQuotes('hello"')).toBe('hello"')
    expect(removeOuterQuotes("'hello")).toBe("'hello")
    expect(removeOuterQuotes("hello'")).toBe("hello'")
  })

  it('should handle mismatched quotes', () => {
    expect(removeOuterQuotes('"hello\'')).toBe('"hello\'')
    expect(removeOuterQuotes('\'hello"')).toBe('\'hello"')
  })

  it('should handle whitespace around quotes', () => {
    expect(removeOuterQuotes('  "hello"  ')).toBe('hello')
    expect(removeOuterQuotes("  'hello'  ")).toBe('hello')
  })

  it('should handle nested quotes (only remove outer)', () => {
    expect(removeOuterQuotes('"\'hello\'"')).toBe("'hello'")
    expect(removeOuterQuotes('\'"hello"\'')).toBe('"hello"')
  })

  it('should handle quotes around JSON', () => {
    expect(removeOuterQuotes('{"key":"value"}')).toBe('{"key":"value"}')
    expect(removeOuterQuotes('"{"key":"value"}"')).toBe('{"key":"value"}')
  })

  it('should handle string that looks like JSON but is quoted', () => {
    expect(removeOuterQuotes('"{"a":1}"')).toBe('{"a":1}')
  })
})

describe('detectEncrypted', () => {
  it('should detect CryptoJS AES encrypted data (U2FsdGVkX1 prefix)', () => {
    expect(detectEncrypted('U2FsdGVkX1+vupwdZ+p3a2XfYkx2GGc8g9XhgO8I0sk=')).toBe(true)
    expect(detectEncrypted('U2FsdGVkX18Kx6a4bH0pN3cV3aEqN8oN1ZeSgQmYz2I=')).toBe(true)
  })

  it('should detect valid Base64 encoded data (length multiple of 4)', () => {
    expect(detectEncrypted('SGVsbG8gV29ybGQ=')).toBe(true)  // "Hello World"
    expect(detectEncrypted('aGVsbG8gd29ybGQ=')).toBe(true)  // "hello world"
    expect(detectEncrypted('YWJjZGVmZ2g=')).toBe(true)      // "abcdefgh"
  })

  it('should detect short Base64-like strings (4+ chars matching pattern)', () => {
    // 'YWJj' decodes to 'abc' and is valid Base64 format
    expect(detectEncrypted('YWJj')).toBe(true)
    // 'YQ==' decodes to 'a' and is valid Base64 format
    expect(detectEncrypted('YQ==')).toBe(true)
  })

  it('should return false for empty data', () => {
    expect(detectEncrypted('')).toBe(false)
    expect(detectEncrypted('   ')).toBe(false)
  })

  it('should return false for valid JSON objects', () => {
    expect(detectEncrypted('{"key":"value"}')).toBe(false)
    expect(detectEncrypted('{"a":1,"b":2}')).toBe(false)
    expect(detectEncrypted('{"nested":{"key":"val"}}')).toBe(false)
  })

  it('should return false for valid JSON arrays', () => {
    expect(detectEncrypted('[1,2,3]')).toBe(false)
    expect(detectEncrypted('["a","b","c"]')).toBe(false)
    expect(detectEncrypted('[{"id":1}]')).toBe(false)
  })

  it('should handle JSON primitives that may be detected as Base64-like', () => {
    // 'null' is valid JSON but parsed to null, falls through to Base64 check
    // 'null' doesn't match Base64 pattern (not purely A-Za-z0-9+/=, actually it does)
    // but isNaN check should prevent false positive - actually 'null' is NOT a number so isNaN returns false
    // 'null' matches Base64 pattern and length is multiple of 4 → detected as encrypted
    expect(detectEncrypted('null')).toBe(true)
    // '42' is purely numeric → isNaN is false → should be false
    expect(detectEncrypted('42')).toBe(false)
    // 'true' matches Base64 pattern, length 4, not a number → detected as encrypted
    expect(detectEncrypted('true')).toBe(true)
    // '"hello"' parses as valid JSON string primitive, not object/array → falls through to Base64 check
    // quotes make it not match Base64 pattern → false
    expect(detectEncrypted('"hello"')).toBe(false)
  })

  it('should handle quoted encrypted data', () => {
    // Data wrapped in quotes should still be detected as encrypted
    expect(detectEncrypted('"U2FsdGVkX1+vupwdZ+p3a2XfYkx2GGc8g9XhgO8I0sk="')).toBe(true)
    expect(detectEncrypted("'U2FsdGVkX1+vupwdZ+p3a2XfYkx2GGc8g9XhgO8I0sk='")).toBe(true)
    expect(detectEncrypted('"SGVsbG8gV29ybGQ="')).toBe(true)
  })

  it('should return false for plain text', () => {
    expect(detectEncrypted('hello world')).toBe(false)
    expect(detectEncrypted('this is not encrypted')).toBe(false)
    expect(detectEncrypted('some random text with spaces')).toBe(false)
  })

  it('should return false for pure numbers (even if they look like Base64)', () => {
    expect(detectEncrypted('1234')).toBe(false)
    expect(detectEncrypted('99999999')).toBe(false)
  })

  it('should return false for whitespace-only data', () => {
    expect(detectEncrypted('   ')).toBe(false)
    expect(detectEncrypted('\n\t')).toBe(false)
  })

  it('should detect encrypted data with CryptoJS prefix and extra content', () => {
    // The U2FsdGVkX1 check is a startsWith check
    expect(detectEncrypted('U2FsdGVkX1abc123')).toBe(true)
  })

  it('should not detect JSON-like strings that happen to be Base64', () => {
    // If it's valid JSON object/array, it should NOT be considered encrypted
    expect(detectEncrypted('{"data":"abc"}')).toBe(false)
    expect(detectEncrypted('[1,2,3]')).toBe(false)
  })
})

describe('cleanData', () => {
  it('should remove double quotes and report hadQuotes as true', () => {
    const result = cleanData('"hello world"')
    expect(result.cleaned).toBe('hello world')
    expect(result.hadQuotes).toBe(true)
  })

  it('should remove single quotes and report hadQuotes as true', () => {
    const result = cleanData("'hello world'")
    expect(result.cleaned).toBe('hello world')
    expect(result.hadQuotes).toBe(true)
  })

  it('should not modify unquoted string and report hadQuotes as false', () => {
    const result = cleanData('hello world')
    expect(result.cleaned).toBe('hello world')
    expect(result.hadQuotes).toBe(false)
  })

  it('should handle empty string', () => {
    const result = cleanData('')
    expect(result.cleaned).toBe('')
    expect(result.hadQuotes).toBe(false)
  })

  it('should handle whitespace-only string', () => {
    const result = cleanData('   ')
    expect(result.cleaned).toBe('')
    expect(result.hadQuotes).toBe(false)
  })

  it('should handle quoted empty string', () => {
    const result = cleanData('""')
    expect(result.cleaned).toBe('')
    expect(result.hadQuotes).toBe(true)
  })

  it('should handle quoted JSON data', () => {
    const result = cleanData('"{"key":"value"}"')
    expect(result.cleaned).toBe('{"key":"value"}')
    expect(result.hadQuotes).toBe(true)
  })

  it('should not remove quotes from strings with only one side quoted', () => {
    const result = cleanData('"hello')
    expect(result.cleaned).toBe('"hello')
    expect(result.hadQuotes).toBe(false)
  })
})

describe('Boundary & Error Handling', () => {
  const algorithms = ['AES', 'DES', 'TripleDES', 'RC4', 'Rabbit'] as const

  describe('Special Unicode characters', () => {
    it('should round-trip emoji characters', () => {
      const data = '{"message":"Hello 🎉🚀❤️","flags":["🇨🇳","🇺🇸"]}'
      algorithms.forEach((algo) => {
        const encrypted = encrypt(data, algo, TEST_KEY)
        const decrypted = decrypt(encrypted, algo, TEST_KEY)
        expect(decrypted).toBe(data)
      })
    })

    it('should round-trip Unicode combining characters', () => {
      const data = '{"text":"café résumé naïve"}'
      algorithms.forEach((algo) => {
        const encrypted = encrypt(data, algo, TEST_KEY)
        const decrypted = decrypt(encrypted, algo, TEST_KEY)
        expect(decrypted).toBe(data)
      })
    })

    it('should round-trip mixed scripts (CJK + Latin + Arabic)', () => {
      const data = '{"zh":"中文","ja":"日本語","ko":"한국어","ar":"مرحبا"}'
      algorithms.forEach((algo) => {
        const encrypted = encrypt(data, algo, TEST_KEY)
        const decrypted = decrypt(encrypted, algo, TEST_KEY)
        expect(decrypted).toBe(data)
      })
    })

    it('should round-trip RTL text', () => {
      const data = '{"rtl":"مرحبا بالعالم"}'
      algorithms.forEach((algo) => {
        const encrypted = encrypt(data, algo, TEST_KEY)
        const decrypted = decrypt(encrypted, algo, TEST_KEY)
        expect(decrypted).toBe(data)
      })
    })
  })

  describe('Edge cases', () => {
    it('should round-trip data with null characters', () => {
      const data = '{"value":"hello\u0000world"}'
      algorithms.forEach((algo) => {
        const encrypted = encrypt(data, algo, TEST_KEY)
        const decrypted = decrypt(encrypted, algo, TEST_KEY)
        expect(decrypted).toBe(data)
      })
    })

    it('should round-trip with very long key (1000 chars)', () => {
      const longKey = 'k'.repeat(1000)
      const data = '{"test":"long key"}'
      const encrypted = encrypt(data, 'AES', longKey)
      const decrypted = decrypt(encrypted, 'AES', longKey)
      expect(decrypted).toBe(data)
    })

    it('should round-trip large text (100KB)', () => {
      const largeObj: Record<string, string> = {}
      for (let i = 0; i < 2000; i++) {
        largeObj[`key_${i}`] = `value_${i}_with_some_padding_to_make_it_longer_abcdefghij`
      }
      const data = JSON.stringify(largeObj)
      const encrypted = encrypt(data, 'AES', TEST_KEY)
      const decrypted = decrypt(encrypted, 'AES', TEST_KEY)
      expect(decrypted).toBe(data)
    })

    it('should round-trip Base64 with special characters', () => {
      const data = '{"binary":"SGVsbG8gV29ybGQ=","path":"C:\\Users\\test\\file.json"}'
      const encrypted = encrypt(data, 'Base64', TEST_KEY)
      const decrypted = decrypt(encrypted, 'Base64', TEST_KEY)
      expect(decrypted).toBe(data)
    })
  })

  describe('Error handling', () => {
    it('should throw friendly error message for wrong AES key', () => {
      const encrypted = encrypt('{"secret":true}', 'AES', 'correct-key')
      expect(() => decrypt(encrypted, 'AES', 'wrong-key')).toThrow()
    })

    it('should throw for invalid Base64 empty string', () => {
      expect(() => decrypt('', 'Base64', TEST_KEY)).toThrow()
    })

    it('should throw for Base64 whitespace-only input', () => {
      expect(() => decrypt('   ', 'Base64', TEST_KEY)).toThrow()
    })

    it('should throw when decrypting plain text as AES ciphertext', () => {
      expect(() => decrypt('not encrypted at all', 'AES', TEST_KEY)).toThrow()
    })

    it('should throw when decrypting with empty key for non-Base64 algorithms', () => {
      const data = 'some data'
      expect(() => decrypt(data, 'AES', '')).toThrow()
    })

    it('should handle single character encryption and decryption', () => {
      algorithms.forEach((algo) => {
        const encrypted = encrypt('a', algo, TEST_KEY)
        const decrypted = decrypt(encrypted, algo, TEST_KEY)
        expect(decrypted).toBe('a')
      })
    })
  })

  describe('detectEncrypted edge cases', () => {
    it('should detect data that is only U2FsdGVkX1 prefix without padding', () => {
      expect(detectEncrypted('U2FsdGVkX1')).toBe(true)
    })

    it('should not false-positive on short non-Base64 text', () => {
      expect(detectEncrypted('ab')).toBe(false)
      expect(detectEncrypted('abc')).toBe(false)
    })

    it('should handle quoted Base64 data with spaces', () => {
      expect(detectEncrypted('"  U2FsdGVkX1+test=  "')).toBe(true)
    })
  })
})
