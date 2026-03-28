import { reactive, watch } from 'vue'
import type { JsonFile, CryptoConfig, StoreData } from '../types'
import { saveStoreData, loadStoreData, clearStoreData } from '../utils/db'
import { generateUUID } from '../utils/uuid'
import { detectEncrypted, cleanData, calculateMD5 } from '../utils/crypto'

const defaultCryptoConfig: CryptoConfig = {
  algorithm: 'AES',
  key: 'public/elab2024.png',
  mode: 'encrypt',
  wrapWithQuotes: false,
}

export type FileFilter = 'all' | 'pending-encrypt' | 'pending-decrypt' | 'unencrypted' | 'undecrypted'

const state = reactive<StoreData & { filter: FileFilter; searchKeyword: string }>({
  files: [],
  activeIndex: 0,
  pasteText: '',
  cryptoConfig: { ...defaultCryptoConfig },
  filter: 'all',
  searchKeyword: '',
})

let initialized = false

export function useJsonStore() {
  async function init() {
    if (initialized) return
    initialized = true
    const saved = await loadStoreData()
    if (saved) {
      state.files = saved.files || []
      state.activeIndex = saved.activeIndex || 0
      state.pasteText = saved.pasteText || ''
      state.cryptoConfig = { ...defaultCryptoConfig, ...saved.cryptoConfig, wrapWithQuotes: (saved.cryptoConfig as any)?.wrapWithQuotes ?? false }
      state.filter = (saved as any).filter || 'all'
      state.searchKeyword = (saved as any).searchKeyword || ''
    }
  }

  async function persist() {
    // 深度克隆数据,移除 Vue 的响应式代理
    const dataToSave: StoreData & { filter?: FileFilter; searchKeyword?: string } = {
      files: state.files.map(file => ({
        id: file.id,
        name: file.name,
        content: file.content,
        md5: file.md5,
        processed: file.processed,
        status: file.status,
        editedContent: file.editedContent,
      })),
      activeIndex: state.activeIndex,
      pasteText: state.pasteText,
      cryptoConfig: { ...state.cryptoConfig },
      filter: state.filter,
      searchKeyword: state.searchKeyword,
    }
    try {
      await saveStoreData(dataToSave)
    } catch (error) {
      console.error('Failed to persist store data:', error)
    }
  }

  async function addFiles(fileList: File[]): Promise<{addedCount: number; duplicateCount: number; duplicateNames: string[]}> {
    let addedCount = 0
    let duplicateCount = 0
    const duplicateNames: string[] = []
    
    // 获取已有文件信息，用于去重
    const existingFiles = new Map<string, string>()
    for (const f of state.files) {
      existingFiles.set(f.name, f.md5)
    }
    
    for (const file of fileList) {
      let content = ''
      let md5 = ''
      
      try {
        content = await readFileAsText(file)
        // 清理引号包裹的内容
        const { cleaned: sanitizedContent } = cleanData(content)
        content = sanitizeContent(sanitizedContent)
        // 计算 MD5
        md5 = calculateMD5(content)
        
        // 检查是否已存在（文件名相同且 MD5 相同）
        const existingMD5 = existingFiles.get(file.name)
        if (existingMD5 === md5) {
          duplicateCount++
          duplicateNames.push(file.name)
          continue
        }
        
        const fileData = {
          id: generateUUID(),
          name: file.name,
          content,
          md5,
          processed: '',
          status: 'pending' as const,
        }
        state.files.push(fileData)
        existingFiles.set(file.name, md5)
        addedCount++
      } catch (error) {
        state.files.push({
          id: generateUUID(),
          name: file.name,
          content: '',
          md5: '',
          processed: '',
          status: 'error' as const,
        })
        existingFiles.set(file.name, '')
        addedCount++
      }
    }
    return {addedCount, duplicateCount, duplicateNames}
  }

  function readFileAsText(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = (e) => {
        const result = e.target?.result
        if (typeof result === 'string') {
          resolve(result)
        } else {
          reject(new Error('File content is not text'))
        }
      }
      reader.onerror = () => reject(new Error('File read error'))
      reader.readAsText(file, 'UTF-8')
    })
  }

  function sanitizeContent(content: string): string {
    // 移除 null 字符和不可序列化的字符
    return content
      .replace(/\0/g, '')
      .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F-\x9F]/g, '')
      .trim()
  }

  function setPasteText(text: string) {
    // 清理引号包裹的内容
    const { cleaned } = cleanData(text)
    state.pasteText = cleaned
  }

  function setActiveIndex(index: number) {
    state.activeIndex = index
  }

  function updateProcessed(index: number, result: string, status: JsonFile['status'] = 'done') {
    if (state.files[index]) {
      state.files[index].processed = result
      state.files[index].status = status
    }
  }

  function getCurrentSource(): string {
    if (state.files.length > 0) {
      return state.files[state.activeIndex]?.content || ''
    }
    return state.pasteText
  }

  function getCurrentProcessed(): string {
    if (state.files.length > 0) {
      return state.files[state.activeIndex]?.processed || ''
    }
    return ''
  }

  function hasData(): boolean {
    return state.files.length > 0 || !!state.pasteText.trim()
  }

  function isFileMode(): boolean {
    return state.files.length > 0
  }

  function detectAndSetCryptoMode(content: string) {
    const isEncrypted = detectEncrypted(content)
    state.cryptoConfig.mode = isEncrypted ? 'decrypt' : 'encrypt'
    state.cryptoConfig.key = 'public/elab2024.png'
  }

  function setFilter(filter: FileFilter) {
    state.filter = filter
  }

  function setSearchKeyword(keyword: string) {
    state.searchKeyword = keyword
  }

function getFilteredFiles(): JsonFile[] {
  const filter = state.filter
  const keyword = state.searchKeyword.toLowerCase().trim()
  
  return state.files.filter(file => {
    // 文件名搜索过滤
    if (keyword && !file.name.toLowerCase().includes(keyword)) {
      return false
    }
    
    // 状态过滤
    if (filter === 'all') {
      return true
    }
    
    const isEncrypted = detectEncrypted(file.content)
    
    if (filter === 'pending-encrypt') {
      return !isEncrypted
    } else if (filter === 'pending-decrypt') {
      return isEncrypted
    } else if (filter === 'unencrypted') {
      return !isEncrypted && !file.processed
    } else if (filter === 'undecrypted') {
      return isEncrypted && !file.processed
    }
    return true
  })
}

  // 获取过滤后文件在原始数组中的索引
  function getFilteredIndexes(): number[] {
    const filtered = getFilteredFiles()
    const indexes: number[] = []
    for (let i = 0; i < state.files.length; i++) {
      if (filtered.includes(state.files[i])) {
        indexes.push(i)
      }
    }
    return indexes
  }

  async function reset() {
    await clearStoreData()
    state.files.splice(0, state.files.length)
    state.activeIndex = 0
    state.pasteText = ''
    state.cryptoConfig = { ...defaultCryptoConfig }
    state.filter = 'all'
    state.searchKeyword = ''
    initialized = false
  }

  // 清除历史处理数据，保留当前文件，用于新上传前确认
  async function resetForNewUpload() {
    // 清除处理后的数据和状态
    for (const file of state.files) {
      file.processed = ''
      file.status = 'pending'
    }
    state.pasteText = ''
    state.activeIndex = 0
    // 加密配置保留
    await persist()
  }

  // Auto-persist on state change
  watch(
    () => [state.files, state.activeIndex, state.pasteText, state.cryptoConfig, state.filter, state.searchKeyword],
    () => persist(),
    { deep: true }
  )

  return {
    state,
    init,
    addFiles,
    setPasteText,
    setActiveIndex,
    updateProcessed,
    getCurrentSource,
    getCurrentProcessed,
    hasData,
    isFileMode,
    reset,
    resetForNewUpload,
    persist,
    detectAndSetCryptoMode,
    setFilter,
    setSearchKeyword,
    getFilteredFiles,
    getFilteredIndexes,
  }
}
