import CryptoJS from 'crypto-js'
import type { CryptoAlgorithm, CryptoMode } from '../types'

/**
 * 计算字符串的 MD5 哈希值
 */
export function calculateMD5(content: string): string {
  return CryptoJS.MD5(content).toString()
}

const algoMap: Record<Exclude<CryptoAlgorithm, 'Base64'>, typeof CryptoJS.AES> = {
  AES: CryptoJS.AES,
  DES: CryptoJS.DES,
  TripleDES: CryptoJS.TripleDES,
  RC4: CryptoJS.RC4,
  Rabbit: CryptoJS.Rabbit,
}

function getCryptoLib(algorithm: CryptoAlgorithm) {
  if (algorithm === 'Base64') return null
  return algoMap[algorithm]
}

export function encrypt(data: string, algorithm: CryptoAlgorithm, key: string): string {
  try {
    if (algorithm === 'Base64') {
      return CryptoJS.enc.Base64.stringify(CryptoJS.enc.Utf8.parse(data))
    }
    const lib = getCryptoLib(algorithm)
    if (!lib) return data
    return lib.encrypt(data, key).toString()
  } catch (error) {
    console.error('Encryption error:', error)
    throw new Error(`加密失败: ${error instanceof Error ? error.message : '未知错误'}`)
  }
}

export function decrypt(data: string, algorithm: CryptoAlgorithm, key: string): string {
  try {
    if (algorithm === 'Base64') {
      // 处理可能包含非 Base64 字符的情况
      const cleanedData = data.replace(/[^A-Za-z0-9+/=]/g, '')
      if (!cleanedData) {
        throw new Error('无效的 Base64 数据')
      }
      const result = CryptoJS.enc.Base64.parse(cleanedData).toString(CryptoJS.enc.Utf8)
      if (!result && cleanedData) {
        throw new Error('Base64 解码失败，数据可能已损坏')
      }
      return result
    }
    
    const lib = getCryptoLib(algorithm)
    if (!lib) return data
    
    const bytes = lib.decrypt(data, key)
    
    // 检查解密是否成功
    if (!bytes || bytes.sigBytes <= 0) {
      throw new Error('解密失败：密钥不正确或数据已损坏')
    }
    
    try {
      const result = bytes.toString(CryptoJS.enc.Utf8)
      // 验证解密结果是否有效
      if (!result && data.trim()) {
        throw new Error('解密后数据为空，可能是密钥错误')
      }
      return result
    } catch (utf8Error) {
      // UTF-8 转换失败，说明密钥错误或数据损坏
      console.error('UTF-8 conversion error:', utf8Error)
      throw new Error('解密失败：密钥不正确或数据格式错误（Malformed UTF-8）')
    }
  } catch (error) {
    console.error('Decryption error:', error)
    // 提取更友好的错误信息
    if (error instanceof Error) {
      if (error.message.includes('Malformed UTF-8')) {
        throw new Error('解密失败：密钥不正确或数据已损坏')
      }
      if (error.message.includes('invalid key')) {
        throw new Error('解密失败：密钥不正确')
      }
      throw new Error(error.message)
    }
    throw new Error('解密失败：未知错误')
  }
}

export function processCrypto(data: string, mode: CryptoMode, algorithm: CryptoAlgorithm, key: string): string {
  return mode === 'encrypt' ? encrypt(data, algorithm, key) : decrypt(data, algorithm, key)
}

/**
 * 去除字符串外层的引号（单引号或双引号）
 * 如果字符串被成对的单引号或双引号包裹，则移除它们
 */
export function removeOuterQuotes(data: string): string {
  const trimmed = data.trim()
  if (trimmed.length >= 2) {
    // 检查双引号包裹
    if (trimmed.startsWith('"') && trimmed.endsWith('"')) {
      return trimmed.slice(1, -1)
    }
    // 检查单引号包裹
    if (trimmed.startsWith("'") && trimmed.endsWith("'")) {
      return trimmed.slice(1, -1)
    }
  }
  return data
}

/**
 * 检测数据是否是加密后的内容
 * 通过特征判断：
 * 1. Base64 编码（仅包含特定字符）
 * 2. CryptoJS 加密后的格式（通常是 U2FsdGVkX1 开头的 Base64）
 * 3. 不是有效的 JSON 格式
 * 4. 可能被引号包裹
 */
export function detectEncrypted(data: string): boolean {
  // 先尝试去除引号
  const cleaned = removeOuterQuotes(data)
  const trimmed = cleaned.trim()
  
  // 空数据不算加密
  if (!trimmed) return false
  
  // 检查是否是有效的 JSON
  try {
    const parsed = JSON.parse(trimmed)
    // 如果是有效的 JSON 对象或数组，通常不是加密数据
    if (parsed !== null && (typeof parsed === 'object' || Array.isArray(parsed))) {
      return false
    }
  } catch {
    // JSON 解析失败，可能是加密数据
  }
  
  // CryptoJS 加密后的数据通常以 U2FsdGVkX1 开头
  if (trimmed.startsWith('U2FsdGVkX1')) {
    return true
  }
  
  // Base64 特征检测
  // Base64 只包含 A-Z, a-z, 0-9, +, /, = 字符
  // 且长度通常是 4 的倍数
  const base64Pattern = /^[A-Za-z0-9+/=]+$/
  const isBase64Format = base64Pattern.test(trimmed)
  const isMultipleOf4 = trimmed.length % 4 === 0
  const hasMinLength = trimmed.length >= 4
  
  // 如果符合 Base64 格式且不是纯数字，很可能是加密数据
  if (isBase64Format && isMultipleOf4 && hasMinLength && isNaN(trimmed as any)) {
    return true
  }
  
  // 其他情况默认认为是未加密的 JSON
  return false
}

/**
 * 清理数据，去除外层引号（如果有）
 * 并返回清理后的数据以及是否去除了引号
 */
export function cleanData(data: string): { cleaned: string; hadQuotes: boolean } {
  const original = data.trim()
  const cleaned = removeOuterQuotes(original)
  return {
    cleaned,
    hadQuotes: cleaned !== original,
  }
}
