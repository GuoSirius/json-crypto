import { describe, it, expect } from 'vitest'
import { formatJson, compressJson, isValidJson } from '@/utils/json'

describe('formatJson', () => {
  it('should format a simple JSON object', () => {
    const result = formatJson('{"name":"test","value":123}')
    expect(result).toBe('{\n  "name": "test",\n  "value": 123\n}')
  })

  it('should format a JSON array', () => {
    const result = formatJson('[1,2,3]')
    expect(result).toBe('[\n  1,\n  2,\n  3\n]')
  })

  it('should format nested JSON structures', () => {
    const input = '{"outer":{"inner":"value"},"items":[1,2,3]}'
    const result = formatJson(input)
    expect(result).toContain('  "outer"')
    expect(result).toContain('    "inner"')
    expect(result).toContain('  "items"')
  })

  it('should use 2-space indentation', () => {
    const result = formatJson('{"a":1}')
    expect(result).toContain('  "a"')  // 2 spaces before key
  })

  it('should throw for invalid JSON', () => {
    expect(() => formatJson('not json')).toThrow()
  })

  it('should throw for empty string', () => {
    expect(() => formatJson('')).toThrow()
  })

  it('should re-format already formatted JSON without issues', () => {
    const formatted = '{\n  "name": "test"\n}'
    const result = formatJson(formatted)
    expect(result).toBe('{\n  "name": "test"\n}')
  })

  it('should format JSON with null values', () => {
    const result = formatJson('{"key":null}')
    expect(result).toBe('{\n  "key": null\n}')
  })

  it('should format JSON with boolean values', () => {
    const result = formatJson('{"active":true,"deleted":false}')
    expect(result).toBe('{\n  "active": true,\n  "deleted": false\n}')
  })

  it('should format JSON with number values', () => {
    const result = formatJson('{"int":42,"float":3.14,"neg":-10}')
    expect(result).toBe('{\n  "int": 42,\n  "float": 3.14,\n  "neg": -10\n}')
  })

  it('should throw for truncated JSON', () => {
    expect(() => formatJson('{"key":')).toThrow()
    expect(() => formatJson('{"key":"value"')).toThrow()
  })

  it('should throw for JSON with trailing comma', () => {
    expect(() => formatJson('{"key":"value",}')).toThrow()
  })
})

describe('compressJson', () => {
  it('should compress a formatted JSON object', () => {
    const formatted = '{\n  "name": "test",\n  "value": 123\n}'
    const result = compressJson(formatted)
    expect(result).toBe('{"name":"test","value":123}')
  })

  it('should compress a JSON array', () => {
    const formatted = '[\n  1,\n  2,\n  3\n]'
    const result = compressJson(formatted)
    expect(result).toBe('[1,2,3]')
  })

  it('should compress nested JSON structures', () => {
    const formatted = '{\n  "outer": {\n    "inner": "value"\n  }\n}'
    const result = compressJson(formatted)
    expect(result).toBe('{"outer":{"inner":"value"}}')
  })

  it('should not change already compressed JSON', () => {
    const compressed = '{"name":"test","value":123}'
    const result = compressJson(compressed)
    expect(result).toBe(compressed)
  })

  it('should throw for invalid JSON', () => {
    expect(() => compressJson('not json')).toThrow()
  })

  it('should throw for empty string', () => {
    expect(() => compressJson('')).toThrow()
  })

  it('should handle JSON with various value types', () => {
    const result = compressJson('{"str":"hello","num":42,"bool":true,"null":null}')
    expect(result).toBe('{"str":"hello","num":42,"bool":true,"null":null}')
  })
})

describe('isValidJson', () => {
  // Valid JSON cases
  it('should return true for valid JSON object', () => {
    expect(isValidJson('{"key":"value"}')).toBe(true)
  })

  it('should return true for valid JSON array', () => {
    expect(isValidJson('[1,2,3]')).toBe(true)
  })

  it('should return true for valid JSON number', () => {
    expect(isValidJson('42')).toBe(true)
  })

  it('should return true for valid JSON string', () => {
    expect(isValidJson('"hello"')).toBe(true)
  })

  it('should return true for valid JSON boolean', () => {
    expect(isValidJson('true')).toBe(true)
    expect(isValidJson('false')).toBe(true)
  })

  it('should return true for valid JSON null', () => {
    expect(isValidJson('null')).toBe(true)
  })

  it('should return true for nested JSON', () => {
    expect(isValidJson('{"a":{"b":{"c":1}}}')).toBe(true)
  })

  it('should return true for formatted JSON (with whitespace)', () => {
    expect(isValidJson('{\n  "key": "value"\n}')).toBe(true)
  })

  // Invalid JSON cases
  it('should return false for empty string', () => {
    expect(isValidJson('')).toBe(false)
  })

  it('should return false for whitespace-only string', () => {
    expect(isValidJson('   ')).toBe(false)
    expect(isValidJson('\n\t')).toBe(false)
  })

  it('should return false for plain text', () => {
    expect(isValidJson('hello world')).toBe(false)
  })

  it('should return false for truncated JSON object', () => {
    expect(isValidJson('{"key":')).toBe(false)
    expect(isValidJson('{"key":"value"')).toBe(false)
  })

  it('should return false for JSON with trailing comma', () => {
    expect(isValidJson('{"key":"value",}')).toBe(false)
  })

  it('should return false for single quotes JSON', () => {
    expect(isValidJson("{'key':'value'}")).toBe(false)
  })

  it('should return false for undefined', () => {
    expect(isValidJson('undefined')).toBe(false)
  })

  it('should return false for unquoted keys', () => {
    expect(isValidJson('{key:"value"}')).toBe(false)
  })

  it('should return false for comments in JSON', () => {
    expect(isValidJson('{"key":"value"}// comment')).toBe(false)
  })
})

describe('Boundary Cases', () => {
  describe('Deeply nested JSON', () => {
    it('should format deeply nested JSON (20 levels)', () => {
      let obj: any = { deep: true }
      for (let i = 0; i < 19; i++) {
        obj = { level: i, child: obj }
      }
      const json = JSON.stringify(obj)
      const result = formatJson(json)
      expect(result).toContain('  "level"')
      // Verify it can be parsed back
      expect(JSON.parse(result)).toBeTruthy()
    })

    it('should compress deeply nested JSON', () => {
      let obj: any = { deep: true }
      for (let i = 0; i < 19; i++) {
        obj = { level: i, child: obj }
      }
      const formatted = JSON.stringify(obj, null, 2)
      const result = compressJson(formatted)
      expect(result).toBe(JSON.stringify(obj))
    })
  })

  describe('Large JSON objects', () => {
    it('should format JSON with 1000 keys', () => {
      const obj: Record<string, number> = {}
      for (let i = 0; i < 1000; i++) {
        obj[`key_${String(i).padStart(4, '0')}`] = i
      }
      const json = JSON.stringify(obj)
      const result = formatJson(json)
      expect(result.split('\n').length).toBeGreaterThan(1000)
    })

    it('should compress JSON with 1000 keys', () => {
      const obj: Record<string, number> = {}
      for (let i = 0; i < 1000; i++) {
        obj[`key_${i}`] = i
      }
      const formatted = JSON.stringify(obj, null, 2)
      const result = compressJson(formatted)
      expect(result).not.toContain('\n')
    })
  })

  describe('Special characters in JSON', () => {
    it('should handle JSON with Unicode escape sequences', () => {
      const json = '{"name":"\\u00e9\\u00e8\\u00ea\\u00eb","emoji":"\\ud83d\\ude00"}'
      const result = formatJson(json)
      expect(JSON.parse(result)).toBeTruthy()
    })

    it('should handle JSON string values with tab and newline', () => {
      const json = '{"text":"line1\\nline2\\ttabbed"}'
      const result = formatJson(json)
      expect(result).toContain('line1\\nline2\\ttabbed')
    })

    it('should handle JSON with backslash characters', () => {
      const json = '{"path":"C:\\\\Users\\\\test","regex":"\\\\d+"}'
      const result = formatJson(json)
      expect(JSON.parse(result)).toBeTruthy()
    })
  })

  describe('Empty and minimal JSON', () => {
    it('should format empty object', () => {
      const result = formatJson('{}')
      expect(result).toContain('{')
      expect(result).toContain('}')
      // JSON.stringify({}, null, 2) produces '{}'
      expect(result).toBe('{}')
    })

    it('should format empty array', () => {
      const result = formatJson('[]')
      expect(result).toContain('[')
      expect(result).toContain(']')
      // JSON.stringify([], null, 2) produces '[]'
      expect(result).toBe('[]')
    })

    it('should compress empty object', () => {
      expect(compressJson('{}')).toBe('{}')
    })

    it('should compress empty array', () => {
      expect(compressJson('[]')).toBe('[]')
    })

    it('should validate empty object and array', () => {
      expect(isValidJson('{}')).toBe(true)
      expect(isValidJson('[]')).toBe(true)
    })
  })

  describe('Numeric edge cases', () => {
    it('should handle scientific notation numbers', () => {
      const json = '{"big":1e+100,"small":1.5e-10,"neg":-3.2e+5}'
      const result = formatJson(json)
      expect(JSON.parse(result)).toBeTruthy()
    })

    it('should handle very large and very small numbers', () => {
      const json = '{"max":1.7976931348623157e+308,"min":5e-324}'
      const result = formatJson(json)
      expect(JSON.parse(result)).toBeTruthy()
    })

    it('should handle integer and float edge cases', () => {
      const json = '{"zero":0,"neg_zero":-0,"int_max":9007199254740991}'
      const result = formatJson(json)
      expect(JSON.parse(result)).toBeTruthy()
    })
  })

  describe('Round-trip consistency', () => {
    it('formatJson → compressJson should produce equivalent JSON', () => {
      const original = '{"a":1,"b":"test","c":[1,2,3],"d":{"nested":true}}'
      const formatted = formatJson(original)
      const compressed = compressJson(formatted)
      expect(JSON.parse(compressed)).toEqual(JSON.parse(original))
    })

    it('compressJson → formatJson should produce consistent output', () => {
      const formatted = '{\n  "name": "test",\n  "value": 42\n}'
      const compressed = compressJson(formatted)
      const reformatted = formatJson(compressed)
      expect(reformatted).toBe(formatted)
    })
  })
})
