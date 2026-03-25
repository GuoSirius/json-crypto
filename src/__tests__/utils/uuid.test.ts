import { describe, it, expect } from 'vitest'
import { generateUUID } from '@/utils/uuid'

describe('generateUUID', () => {
  it('should return a string', () => {
    expect(typeof generateUUID()).toBe('string')
  })

  it('should match UUID v4 format', () => {
    const uuid = generateUUID()
    // UUID v4 format: xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx
    const pattern = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
    expect(uuid).toMatch(pattern)
  })

  it('should be 36 characters long (with hyphens)', () => {
    expect(generateUUID()).toHaveLength(36)
  })

  it('should have the correct version digit (4) at position 14', () => {
    const uuid = generateUUID()
    expect(uuid[14]).toBe('4')
  })

  it('should have a valid variant digit at position 19', () => {
    const uuid = generateUUID()
    expect(['8', '9', 'a', 'b', 'A', 'B']).toContain(uuid[19])
  })

  it('should generate unique values across multiple calls', () => {
    const uuids = new Set<string>()
    const iterations = 100
    for (let i = 0; i < iterations; i++) {
      uuids.add(generateUUID())
    }
    expect(uuids.size).toBe(iterations)
  })

  it('should contain only hex characters and hyphens', () => {
    const uuid = generateUUID()
    const withoutHyphens = uuid.replace(/-/g, '')
    expect(withoutHyphens).toMatch(/^[0-9a-f]+$/)
  })
})
