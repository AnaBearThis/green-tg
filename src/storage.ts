import type { Credentials } from './api'
import type { Chats } from './chats'
import { config } from './config'

const CREDENTIALS_KEY = `${config.storagePrefix}:credentials`
const chatsKey = (idInstance: string) => `${config.storagePrefix}:chats:${idInstance}`

function read<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : null
  } catch {
    return null
  }
}

function write(key: string, value: unknown) {
  try {
    if (value === null) localStorage.removeItem(key)
    else localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // хранилище недоступно (приватный режим и т. п.) — работаем без сохранения
  }
}

export const loadCredentials = () => read<Credentials>(CREDENTIALS_KEY)
export const saveCredentials = (creds: Credentials | null) => write(CREDENTIALS_KEY, creds)

export const loadChats = (idInstance: string) => read<Chats>(chatsKey(idInstance)) ?? {}
export const saveChats = (idInstance: string, chats: Chats) => write(chatsKey(idInstance), chats)
