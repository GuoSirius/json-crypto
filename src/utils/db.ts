import { openDB, type DBSchema } from 'idb'
import type { StoreData, ExcelStoreData } from '../types'

interface AppDB extends DBSchema {
  jsonStore: {
    key: string
    value: StoreData
  }
  excelStore: {
    key: string
    value: ExcelStoreData
  }
}

const DB_NAME = 'json-crypto-db'
const DB_VERSION = 2

export async function getDB() {
  return openDB<AppDB>(DB_NAME, DB_VERSION, {
    upgrade(db, oldVersion) {
      if (!db.objectStoreNames.contains('jsonStore')) {
        db.createObjectStore('jsonStore')
      }
      if (oldVersion < 2 && !db.objectStoreNames.contains('excelStore')) {
        db.createObjectStore('excelStore')
      }
    },
  })
}

// ========== JSON Store ==========

const JSON_STORE_NAME = 'jsonStore'
const JSON_STORE_KEY = 'app-data'

export async function saveStoreData(data: StoreData) {
  const db = await getDB()
  await db.put(JSON_STORE_NAME, data, JSON_STORE_KEY)
}

export async function loadStoreData(): Promise<StoreData | null> {
  const db = await getDB()
  return (await db.get(JSON_STORE_NAME, JSON_STORE_KEY)) ?? null
}

export async function clearStoreData() {
  const db = await getDB()
  await db.delete(JSON_STORE_NAME, JSON_STORE_KEY)
}

// ========== Excel Store ==========

const EXCEL_STORE_NAME = 'excelStore'
const EXCEL_STORE_KEY = 'excel-data'

export async function saveExcelStoreData(data: ExcelStoreData) {
  const db = await getDB()
  await db.put(EXCEL_STORE_NAME, data, EXCEL_STORE_KEY)
}

export async function loadExcelStoreData(): Promise<ExcelStoreData | null> {
  const db = await getDB()
  return (await db.get(EXCEL_STORE_NAME, EXCEL_STORE_KEY)) ?? null
}

export async function clearExcelStoreData() {
  const db = await getDB()
  await db.delete(EXCEL_STORE_NAME, EXCEL_STORE_KEY)
}
