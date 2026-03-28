export interface JsonFile {
  id: string
  name: string
  content: string
  md5: string
  processed: string
  status: 'pending' | 'done' | 'error'
  editedContent?: string
  source?: 'upload' | 'excel-import'
}

export type CryptoAlgorithm = 'AES' | 'DES' | 'TripleDES' | 'RC4' | 'Rabbit' | 'Base64'
export type CryptoMode = 'encrypt' | 'decrypt'

export interface CryptoConfig {
  algorithm: CryptoAlgorithm
  key: string
  mode: CryptoMode
  wrapWithQuotes: boolean
}

export type DownloadMode = 'original' | 'processed' | 'both'

export interface StoreData {
  files: JsonFile[]
  activeIndex: number
  pasteText: string
  cryptoConfig: CryptoConfig
  filter?: 'all' | 'pending-encrypt' | 'pending-decrypt' | 'unencrypted' | 'undecrypted'
  searchKeyword?: string
}

// ========== Excel 相关类型 ==========

export type SheetFormat = 'json' | 'csv'

export interface SheetData {
  id: string
  originalName: string
  displayName: string
  format: SheetFormat
  rawData: string
  parsedData: string
  parseError: string | null
  selected: boolean
}

export interface ExcelFile {
  id: string
  name: string
  contentHash: string
  sheets: SheetData[]
  activeSheetIndex: number
}

export interface ExcelStoreData {
  files: ExcelFile[]
  activeFileIndex: number
  searchKeyword: string
}

export type BatchDownloadMode = 'grouped' | 'flat'
