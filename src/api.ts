// Клиент GREEN-API для Telegram: https://green-api.com/telegram/docs/api/
import { config } from './config'

export interface Credentials {
  apiUrl: string
  idInstance: string
  apiTokenInstance: string
}

export class ApiError extends Error {
  status: number

  constructor(status: number, message: string) {
    super(message)
    this.status = status
  }
}

/** apiUrl по умолчанию: хост определяется первыми 4 цифрами idInstance (например, 4100 → https://4100.api.green-api.com). */
export function defaultApiUrl(idInstance: string): string {
  const prefix = idInstance.trim().slice(0, 4)
  return /^\d{4}$/.test(prefix) ? config.apiUrlTemplate.replace('{prefix}', prefix) : config.apiUrlFallback
}

async function request<T>(
  creds: Credentials,
  method: string,
  init: RequestInit & { path?: string } = {},
): Promise<T> {
  const { path = '', ...fetchInit } = init
  const base = creds.apiUrl.trim().replace(/\/+$/, '')
  const url = `${base}/waInstance${creds.idInstance.trim()}/${method}/${creds.apiTokenInstance.trim()}${path}`

  let res: Response
  try {
    res = await fetch(url, {
      ...fetchInit,
      headers: fetchInit.body ? { 'Content-Type': 'application/json' } : undefined,
    })
  } catch (e) {
    if (e instanceof DOMException && e.name === 'AbortError') throw e
    throw new ApiError(0, 'Не удалось связаться с сервером. Проверьте apiUrl и подключение к интернету.')
  }

  if (res.status === 401 || res.status === 403) {
    throw new ApiError(res.status, 'Неверный idInstance или apiTokenInstance')
  }
  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new ApiError(res.status, `Ошибка ${res.status}${text ? `: ${text.slice(0, 200)}` : ''}`)
  }

  const text = await res.text()
  return (text ? JSON.parse(text) : null) as T
}

export function getStateInstance(creds: Credentials) {
  return request<{ stateInstance: string }>(creds, 'getStateInstance')
}

export interface Settings {
  webhookUrl: string
  incomingWebhook: string
  /** Статусы исходящих: доставлено, прочитано */
  outgoingWebhook: string
}

export function getSettings(creds: Credentials) {
  return request<Settings>(creds, 'getSettings')
}

export function setSettings(creds: Credentials, settings: Partial<Settings>) {
  return request<{ saveSettings: boolean }>(creds, 'setSettings', {
    method: 'POST',
    body: JSON.stringify(settings),
  })
}

/** Нужные для чата настройки: пустой webhookUrl (иначе HTTP API не работает), входящие и статусы исходящих. */
export const REQUIRED_SETTINGS: Settings = { webhookUrl: '', incomingWebhook: 'yes', outgoingWebhook: 'yes' }

export const canReceive = (s: Settings) =>
  !s.webhookUrl && s.incomingWebhook === 'yes' && s.outgoingWebhook === 'yes'

export interface CheckAccountResult {
  exist: boolean
  chatId?: string
  username?: string
  phoneNumber?: number
}

export function checkAccount(creds: Credentials, target: { phoneNumber: number } | { username: string }) {
  return request<CheckAccountResult>(creds, 'checkAccount', {
    method: 'POST',
    body: JSON.stringify(target),
  })
}

export function sendMessage(creds: Credentials, chatId: string, message: string) {
  return request<{ idMessage: string }>(creds, 'sendMessage', {
    method: 'POST',
    body: JSON.stringify({ chatId, message }),
  })
}

/** Отмечает входящие сообщения чата прочитанными — у собеседника появятся две галочки */
export function readChat(creds: Credentials, chatId: string) {
  return request<{ setRead: boolean }>(creds, 'readChat', {
    method: 'POST',
    body: JSON.stringify({ chatId }),
  })
}

export interface Notification {
  receiptId: number
  body: NotificationBody
}

export interface NotificationBody {
  typeWebhook: string
  timestamp: number
  idMessage?: string
  /** Поля уведомления outgoingMessageStatus */
  chatId?: string
  status?: string
  description?: string
  senderData?: {
    chatId: string
    chatName?: string
    senderName?: string
  }
  messageData?: {
    typeMessage: string
    textMessageData?: { textMessage: string }
    extendedTextMessageData?: { text: string }
  }
}

/**
 * Получает одно уведомление из очереди. Сервер держит запрос до 5 секунд и возвращает null, если ничего не пришло.
 * Ответ 408 (таймаут шлюза) тоже означает пустую очередь.
 */
export async function receiveNotification(creds: Credentials, signal: AbortSignal) {
  try {
    return await request<Notification | null>(creds, 'receiveNotification', { signal })
  } catch (e) {
    if (e instanceof ApiError && e.status === 408) return null
    throw e
  }
}

export function deleteNotification(creds: Credentials, receiptId: number) {
  return request<{ result: boolean }>(creds, 'deleteNotification', {
    method: 'DELETE',
    path: `/${receiptId}`,
  })
}
