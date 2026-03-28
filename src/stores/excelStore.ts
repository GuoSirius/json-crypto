import { reactive, watch } from 'vue'
import type { ExcelFile, ExcelStoreData, SheetFormat } from '../types'
import { saveExcelStoreData, loadExcelStoreData, clearExcelStoreData } from '../utils/db'
import { generateUUID } from '../utils/uuid'
import { readFileAsArrayBuffer, calculateArrayBufferHash, parseExcelBuffer, isExcelFile, convertSheetData } from '../utils/excel'
import * as XLSX from 'xlsx'

const state = reactive<ExcelStoreData & { filter: string }>({
  files: [],
  activeFileIndex: 0,
  searchKeyword: '',
  filter: '',
})

let initialized = false

export function useExcelStore() {
  async function init() {
    if (initialized) return
    initialized = true
    const saved = await loadExcelStoreData()
    if (saved) {
      state.files = saved.files || []
      state.activeFileIndex = saved.activeFileIndex || 0
      state.searchKeyword = saved.searchKeyword || ''
    }
  }

  async function persist() {
    const dataToSave: ExcelStoreData = {
      files: state.files.map(f => ({
        id: f.id,
        name: f.name,
        contentHash: f.contentHash,
        sheets: f.sheets.map(s => ({
          id: s.id,
          originalName: s.originalName,
          displayName: s.displayName,
          format: s.format,
          rawData: s.rawData,
          parsedData: s.parsedData,
          parseError: s.parseError,
          selected: s.selected,
        })),
        activeSheetIndex: f.activeSheetIndex,
      })),
      activeFileIndex: state.activeFileIndex,
      searchKeyword: state.searchKeyword,
    }
    try {
      await saveExcelStoreData(dataToSave)
    } catch (error) {
      console.error('Failed to persist excel store data:', error)
    }
  }

  async function addFiles(fileList: File[]): Promise<{ addedCount: number; duplicateCount: number; errorFiles: string[] }> {
    let addedCount = 0
    let duplicateCount = 0
    const errorFiles: string[] = []

    // 已有文件的 name+hash 映射，用于去重
    const existingMap = new Map<string, string>()
    for (const f of state.files) {
      existingMap.set(f.name, f.contentHash)
    }

    for (const file of fileList) {
      if (!isExcelFile(file.name)) {
        errorFiles.push(`${file.name}: 不支持的文件格式`)
        continue
      }

      try {
        const buffer = await readFileAsArrayBuffer(file)
        const hash = calculateArrayBufferHash(buffer)

        // 去重：同名且内容哈希相同
        if (existingMap.get(file.name) === hash) {
          duplicateCount++
          continue
        }

        const { sheets, error } = parseExcelBuffer(buffer)

        if (error) {
          errorFiles.push(`${file.name}: ${error}`)
          continue
        }

        const excelFile: ExcelFile = {
          id: generateUUID(),
          name: file.name,
          contentHash: hash,
          sheets,
          activeSheetIndex: 0,
        }

        state.files.push(excelFile)
        existingMap.set(file.name, hash)
        addedCount++
      } catch (error) {
        errorFiles.push(`${file.name}: ${error instanceof Error ? error.message : '读取失败'}`)
      }
    }

    return { addedCount, duplicateCount, errorFiles }
  }

  function setActiveFileIndex(index: number) {
    state.activeFileIndex = index
  }

  function setActiveSheetIndex(fileIndex: number, sheetIndex: number) {
    if (state.files[fileIndex]) {
      state.files[fileIndex].activeSheetIndex = sheetIndex
    }
  }

  function updateSheetDisplayName(fileIndex: number, sheetIndex: number, name: string) {
    const sheet = state.files[fileIndex]?.sheets[sheetIndex]
    if (sheet) {
      // 直接设置用户输入的值，不自动还原
      sheet.displayName = name
    }
  }

  function restoreSheetDisplayNameIfEmpty(fileIndex: number, sheetIndex: number) {
    const sheet = state.files[fileIndex]?.sheets[sheetIndex]
    if (sheet && sheet.displayName.trim() === '') {
      sheet.displayName = sheet.originalName
    }
  }

  function updateSheetFormat(fileIndex: number, sheetIndex: number, format: SheetFormat) {
    const file = state.files[fileIndex]
    const sheet = file?.sheets[sheetIndex]
    if (!file || !sheet) return

    const oldFormat = sheet.format
    sheet.format = format

    // 重新解析数据
    try {
      // 从 rawData 重新解析为 worksheet
      const workbook = XLSX.read(sheet.rawData, { type: 'string' })
      const worksheet = workbook.Sheets[workbook.SheetNames[0]]
      
      // 使用工具函数转换并清理数据
      const { parsedData, parseError } = convertSheetData(worksheet, format)
      sheet.parsedData = parsedData
      sheet.parseError = parseError
    } catch (error) {
      // 恢复原格式
      sheet.format = oldFormat
      sheet.parsedData = ''
      sheet.parseError = error instanceof Error ? error.message : '格式转换失败'
    }
  }

  function updateSheetParsedData(fileIndex: number, sheetIndex: number, data: string) {
    const sheet = state.files[fileIndex]?.sheets[sheetIndex]
    if (sheet) {
      sheet.parsedData = data
    }
  }

  function resetSheetDisplayName(fileIndex: number, sheetIndex: number) {
    const sheet = state.files[fileIndex]?.sheets[sheetIndex]
    if (sheet) {
      sheet.displayName = sheet.originalName
    }
  }

  function setSheetDisplayNameAsFileName(fileIndex: number, sheetIndex: number) {
    const file = state.files[fileIndex]
    const sheet = file?.sheets[sheetIndex]
    if (file && sheet) {
      // 去掉扩展名作为工作表名
      const baseName = file.name.replace(/\.(xlsx|xls)$/i, '')
      sheet.displayName = baseName
    }
  }

  function toggleSheetSelection(fileIndex: number, sheetIndex: number) {
    const sheet = state.files[fileIndex]?.sheets[sheetIndex]
    if (sheet) {
      sheet.selected = !sheet.selected
    }
  }

  function selectAllSheets(fileIndex: number, selected: boolean) {
    const file = state.files[fileIndex]
    if (file) {
      for (const sheet of file.sheets) {
        sheet.selected = selected
      }
    }
  }

  function invertSheetSelection(fileIndex: number) {
    const file = state.files[fileIndex]
    if (file) {
      for (const sheet of file.sheets) {
        sheet.selected = !sheet.selected
      }
    }
  }

  function selectAllSheetsGlobal(selected: boolean) {
    for (const file of state.files) {
      for (const sheet of file.sheets) {
        sheet.selected = selected
      }
    }
  }

  function invertSheetSelectionGlobal() {
    for (const file of state.files) {
      for (const sheet of file.sheets) {
        sheet.selected = !sheet.selected
      }
    }
  }

  function setSearchKeyword(keyword: string) {
    state.searchKeyword = keyword
  }

  function getFilteredFiles(): ExcelFile[] {
    const keyword = state.searchKeyword.toLowerCase().trim()
    if (!keyword) return state.files
    return state.files.filter(f => f.name.toLowerCase().includes(keyword))
  }

  function getSelectedSheets(): { file: ExcelFile; sheetIndex: number; sheet: import('../types').SheetData }[] {
    const result: { file: ExcelFile; sheetIndex: number; sheet: import('../types').SheetData }[] = []
    for (const file of state.files) {
      for (let i = 0; i < file.sheets.length; i++) {
        if (file.sheets[i].selected) {
          result.push({ file, sheetIndex: i, sheet: file.sheets[i] })
        }
      }
    }
    return result
  }

  function hasData(): boolean {
    return state.files.length > 0
  }

  function deleteFile(index: number) {
    state.files.splice(index, 1)
    if (state.activeFileIndex >= state.files.length) {
      state.activeFileIndex = Math.max(0, state.files.length - 1)
    }
  }

  async function reset() {
    await clearExcelStoreData()
    state.files.splice(0, state.files.length)
    state.activeFileIndex = 0
    state.searchKeyword = ''
    initialized = false
  }

  // Auto-persist
  watch(
    () => [state.files, state.activeFileIndex, state.searchKeyword],
    () => persist(),
    { deep: true }
  )

  return {
    state,
    init,
    addFiles,
    setActiveFileIndex,
    setActiveSheetIndex,
    updateSheetDisplayName,
    restoreSheetDisplayNameIfEmpty,
    updateSheetFormat,
    updateSheetParsedData,
    resetSheetDisplayName,
    setSheetDisplayNameAsFileName,
    toggleSheetSelection,
    selectAllSheets,
    invertSheetSelection,
    selectAllSheetsGlobal,
    invertSheetSelectionGlobal,
    setSearchKeyword,
    getFilteredFiles,
    getSelectedSheets,
    hasData,
    deleteFile,
    reset,
    persist,
  }
}
