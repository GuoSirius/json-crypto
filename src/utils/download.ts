import JSZip from 'jszip'
import { saveAs } from 'file-saver'
import type { JsonFile, DownloadMode, SheetData, SheetFormat, BatchDownloadMode } from '../types'

export function downloadFile(content: string, filename: string, mimeType = 'application/json;charset=utf-8') {
  const blob = new Blob([content], { type: mimeType })
  saveAs(blob, filename)
}

export async function downloadAsZip(
  files: JsonFile[],
  sourceContents: string[],
  mode: DownloadMode = 'processed',
  suffix = '_processed'
) {
  const zip = new JSZip()

  if (mode === 'both') {
    const originalFolder = zip.folder('original')
    const processedFolder = zip.folder('processed')
    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      const originalName = file.name
      const processedName = file.name.replace(/\.json$/i, '') + suffix + '.json'
      originalFolder?.file(originalName, sourceContents[i] || file.content)
      processedFolder?.file(processedName, file.processed)
    }
  } else {
    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      const content = mode === 'original'
        ? (sourceContents[i] || file.content)
        : file.processed
      const name = mode === 'original'
        ? file.name
        : file.name.replace(/\.json$/i, '') + suffix + '.json'
      zip.file(name, content)
    }
  }

  const blob = await zip.generateAsync({ type: 'blob' })
  saveAs(blob, 'json-crypto-output.zip')
}

// ========== Excel 工作表下载 ==========

function getSheetExtension(format: SheetFormat): string {
  return format === 'json' ? '.json' : '.csv'
}

function getSheetMimeType(format: SheetFormat): string {
  return format === 'json' ? 'application/json;charset=utf-8' : 'text/csv;charset=utf-8'
}

/**
 * 下载单个工作表
 */
export function downloadSheet(sheet: SheetData) {
  const ext = getSheetExtension(sheet.format)
  const filename = sheet.displayName + ext
  const content = sheet.parseError ? sheet.rawData : sheet.parsedData
  const mimeType = getSheetMimeType(sheet.format)
  downloadFile(content, filename, mimeType)
}

/**
 * 批量下载多个工作表为 ZIP
 * @param sheets 工作表信息数组（含所属文件名）
 * @param mode 下载模式：grouped 按Excel文件名分目录，flat 平铺
 */
export async function downloadSheetsAsZip(
  sheets: { fileName: string; sheet: SheetData }[],
  mode: BatchDownloadMode = 'flat'
) {
  const zip = new JSZip()

  if (mode === 'grouped') {
    // 按 Excel 文件名分组
    const grouped = new Map<string, { fileName: string; sheet: SheetData }[]>()
    for (const item of sheets) {
      const list = grouped.get(item.fileName) || []
      list.push(item)
      grouped.set(item.fileName, list)
    }

    for (const [excelName, items] of grouped) {
      const folderName = excelName.replace(/\.(xlsx|xls)$/i, '')
      const folder = zip.folder(folderName)
      if (!folder) continue
      for (const item of items) {
        const ext = getSheetExtension(item.sheet.format)
        const filename = item.sheet.displayName + ext
        const content = item.sheet.parseError ? item.sheet.rawData : item.sheet.parsedData
        folder.file(filename, content)
      }
    }
  } else {
    // 平铺模式，检查重名
    const nameCount = new Map<string, number>()
    for (const item of sheets) {
      const ext = getSheetExtension(item.sheet.format)
      let baseName = item.sheet.displayName + ext

      // 检查重名
      const count = nameCount.get(baseName) || 0
      if (count > 0) {
        // 重名时加上 Excel 文件名前缀
        const excelBase = item.fileName.replace(/\.(xlsx|xls)$/i, '')
        baseName = `${excelBase}_${item.sheet.displayName}${ext}`
      }
      nameCount.set(baseName, count + 1)

      // 最终再检查一次（加了前缀后仍可能重名）
      const finalCount = nameCount.get(baseName) || 0
      let finalName = baseName
      if (finalCount > 0) {
        const dotIndex = baseName.lastIndexOf('.')
        const stem = baseName.substring(0, dotIndex)
        const extStr = baseName.substring(dotIndex)
        finalName = `${stem}_${finalCount}${extStr}`
      }

      const content = item.sheet.parseError ? item.sheet.rawData : item.sheet.parsedData
      zip.file(finalName, content)
    }
  }

  const blob = await zip.generateAsync({ type: 'blob' })
  saveAs(blob, 'excel-sheets-output.zip')
}
