import * as XLSX from 'xlsx'
import type { SheetData, SheetFormat } from '../types'
import { generateUUID } from './uuid'

/**
 * 读取 Excel 文件的 ArrayBuffer，返回解析后的工作表列表
 */
export function parseExcelBuffer(buffer: ArrayBuffer): { sheets: SheetData[]; error: string | null } {
  try {
    const workbook = XLSX.read(buffer, { type: 'array' })
    const sheets: SheetData[] = workbook.SheetNames.map((name) => {
      const sheet = workbook.Sheets[name]
      const rawData = XLSX.utils.sheet_to_csv(sheet)

      // 默认尝试 JSON 解析
      const { parsedData, parseError } = convertSheetData(sheet, 'json')

      return {
        id: generateUUID(),
        originalName: name,
        displayName: name,
        format: 'json' as SheetFormat,
        rawData,
        parsedData,
        parseError,
        selected: false,
      }
    })

    if (sheets.length === 0) {
      return { sheets: [], error: '工作簿中没有任何工作表' }
    }

    return { sheets, error: null }
  } catch (error) {
    const msg = error instanceof Error ? error.message : '未知解析错误'
    return { sheets: [], error: msg }
  }
}

/**
 * 清理 CSV 数据：去掉末尾空行和无效逗号
 */
function cleanCSVData(csvData: string): string {
  const lines = csvData.split('\n')
  // 过滤掉空行和只有空白字符的行
  const cleanedLines = lines.filter(line => line.trim() !== '')
  // 清理每行末尾的逗号
  const trimmedLines = cleanedLines.map(line => line.replace(/,\s*$/, '').trim())
  return trimmedLines.join('\n')
}

/**
 * 清理 JSON 数据：去掉数组末尾的空项
 */
function cleanJSONData(jsonStr: string): string {
  try {
    const data = JSON.parse(jsonStr)
    // 如果是数组，去掉末尾的空项（null 或空对象）
    if (Array.isArray(data)) {
      // 过滤掉末尾的空项
      while (data.length > 0) {
        const lastItem = data[data.length - 1]
        if (lastItem === null || lastItem === undefined || 
            (typeof lastItem === 'object' && Object.keys(lastItem).length === 0)) {
          data.pop()
        } else {
          break
        }
      }
    }
    return JSON.stringify(data, null, 2)
  } catch {
    return jsonStr
  }
}

/**
 * 将工作表转换为指定格式的字符串
 */
export function convertSheetData(sheet: XLSX.WorkSheet, format: SheetFormat): { parsedData: string; parseError: string | null } {
  try {
    if (format === 'json') {
      const jsonData = XLSX.utils.sheet_to_json(sheet, { defval: null })
      let jsonStr = JSON.stringify(jsonData, null, 2)
      // 清理 JSON 数据
      jsonStr = cleanJSONData(jsonStr)
      return { parsedData: jsonStr, parseError: null }
    } else {
      let csvData = XLSX.utils.sheet_to_csv(sheet)
      // 清理 CSV 数据
      csvData = cleanCSVData(csvData)
      return { parsedData: csvData, parseError: null }
    }
  } catch (error) {
    const msg = error instanceof Error ? error.message : '格式转换失败'
    return { parsedData: '', parseError: msg }
  }
}

/**
 * 根据 ArrayBuffer 计算内容哈希（用于去重）
 * 使用简单的字符串哈希，避免将整个文件转为字符串计算 MD5
 */
export function calculateArrayBufferHash(buffer: ArrayBuffer): string {
  const view = new Uint8Array(buffer)
  let hash = 0
  // 采样计算：取前、中、后各 1024 字节
  const len = view.length
  const sampleSize = 1024
  const regions = [
    view.slice(0, Math.min(sampleSize, len)),
    view.slice(Math.floor(len / 2) - sampleSize / 2, Math.floor(len / 2) + sampleSize / 2),
    view.slice(Math.max(0, len - sampleSize)),
  ]
  for (const region of regions) {
    for (let i = 0; i < region.length; i++) {
      hash = ((hash << 5) - hash + region[i]) | 0
    }
  }
  // 附加文件长度增加区分度
  hash = ((hash << 5) - hash + len) | 0
  return Math.abs(hash).toString(36)
}

/**
 * 读取文件为 ArrayBuffer
 */
export function readFileAsArrayBuffer(file: File): Promise<ArrayBuffer> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const result = e.target?.result
      if (result instanceof ArrayBuffer) {
        resolve(result)
      } else {
        reject(new Error('文件读取结果不是 ArrayBuffer'))
      }
    }
    reader.onerror = () => reject(new Error('文件读取失败'))
    reader.readAsArrayBuffer(file)
  })
}

/**
 * 获取文件扩展名
 */
export function getFileExtension(filename: string): string {
  return filename.slice(filename.lastIndexOf('.')).toLowerCase()
}

/**
 * 验证是否为支持的 Excel 文件格式
 */
export function isExcelFile(filename: string): boolean {
  const ext = getFileExtension(filename)
  return ext === '.xlsx' || ext === '.xls'
}
