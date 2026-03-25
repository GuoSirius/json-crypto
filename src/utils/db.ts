import { openDB, type DBSchema } from 'idb'
import type { StoreData } from '../types'

interface AppDB extends DBSchema {
  jsonStore: {
    key: string
    value: StoreData
  }
}

const DB_NAME = 'json-crypto-db'
const DB_VERSION = 1
const STORE_NAME = 'jsonStore'
const STORE_KEY = 'app-data'

export async function getDB() {
  return openDB<AppDB>(DB_NAME, DB_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME)
      }
    },
  })
}

export async function saveStoreData(data: StoreData) {
  const db = await getDB()
  await db.put(STORE_NAME, data, STORE_KEY)
}

export async function loadStoreData(): Promise<StoreData | null> {
  const db = await getDB()
  return (await db.get(STORE_NAME, STORE_KEY)) ?? null
}

export async function clearStoreData() {
  const db = await getDB()
  await db.delete(STORE_NAME, STORE_KEY)
}
