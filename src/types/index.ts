export interface JsonFile {
  id: string
  name: string
  content: string
  md5: string
  processed: string
  status: 'pending' | 'done' | 'error'
}

export type CryptoAlgorithm = 'AES' | 'DES' | 'TripleDES' | 'RC4' | 'Rabbit' | 'Base64'
export type CryptoMode = 'encrypt' | 'decrypt'

export interface CryptoConfig {
  algorithm: CryptoAlgorithm
  key: string
  mode: CryptoMode
  wrapWithQuotes: boolean
}

export interface StoreData {
  files: JsonFile[]
  activeIndex: number
  pasteText: string
  cryptoConfig: CryptoConfig
  filter?: 'all' | 'pending-encrypt' | 'pending-decrypt' | 'unencrypted' | 'undecrypted'
  searchKeyword?: string
}
