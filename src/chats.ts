import type { NotificationBody } from './api'

export interface Message {
  id: string
  text: string
  outgoing: boolean
  /** Unix-время в миллисекундах */
  time: number
  /** Только для исходящих. Сохранённые раньше сообщения без статуса считаются отправленными. */
  status?: MessageStatus
  /** Причина ошибки отправки, если её сообщил GREEN-API */
  error?: string
}

export type MessageStatus = 'sending' | 'sent' | 'delivered' | 'read' | 'error'

// Статус только растёт: запоздавший delivered не откатит read. Ошибка перекрывает всё, кроме прочтения.
const STATUS_RANK: Record<MessageStatus, number> = { sending: 0, sent: 1, delivered: 2, error: 3, read: 4 }

export interface Chat {
  chatId: string
  name: string
  createdAt: number
  messages: Message[]
  /** Входящие, которые ещё не отмечены прочитанными (в старых сохранённых чатах поля нет) */
  unread?: number
}

export type Chats = Record<string, Chat>

export type ChatsAction =
  | { type: 'reset'; chats: Chats }
  | { type: 'open'; chatId: string; name: string }
  | { type: 'add'; chatId: string; name?: string; message: Message }
  | { type: 'update'; chatId: string; id: string; patch: Partial<Message> }
  | { type: 'status'; chatId: string; id: string; status: MessageStatus; error?: string }
  | { type: 'read'; chatId: string }

export function chatsReducer(state: Chats, action: ChatsAction): Chats {
  switch (action.type) {
    case 'reset':
      return action.chats
    case 'open':
      if (state[action.chatId]) return state
      return { ...state, [action.chatId]: { chatId: action.chatId, name: action.name, createdAt: Date.now(), messages: [] } }
    case 'add': {
      const chat = state[action.chatId] ?? {
        chatId: action.chatId,
        name: action.name || action.chatId,
        createdAt: action.message.time,
        messages: [],
      }
      // одно и то же уведомление может прийти повторно, если не успели его удалить
      if (chat.messages.some((m) => m.id === action.message.id)) return state
      const unread = (chat.unread ?? 0) + (action.message.outgoing ? 0 : 1)
      return { ...state, [action.chatId]: { ...chat, unread, messages: [...chat.messages, action.message] } }
    }
    case 'update': {
      const chat = state[action.chatId]
      if (!chat) return state
      const messages = chat.messages.map((m) => (m.id === action.id ? { ...m, ...action.patch } : m))
      return { ...state, [action.chatId]: { ...chat, messages } }
    }
    case 'status': {
      // chatId в уведомлении о статусе может отличаться по формату, поэтому ищем сообщение по id во всех чатах
      const chat = state[action.chatId]?.messages.some((m) => m.id === action.id)
        ? state[action.chatId]
        : Object.values(state).find((c) => c.messages.some((m) => m.id === action.id))
      const message = chat?.messages.find((m) => m.id === action.id)
      if (!chat || !message || STATUS_RANK[action.status] <= STATUS_RANK[message.status ?? 'sent']) return state
      return chatsReducer(state, {
        type: 'update',
        chatId: chat.chatId,
        id: action.id,
        patch: { status: action.status, error: action.error },
      })
    }
    case 'read': {
      const chat = state[action.chatId]
      if (!chat?.unread) return state
      return { ...state, [action.chatId]: { ...chat, unread: 0 } }
    }
  }
}

/** Превращает уведомление в действие над чатами. Нетекстовые и служебные уведомления пропускаются. */
export function notificationToAction(body: NotificationBody): ChatsAction | null {
  const { typeWebhook, senderData, messageData, idMessage, timestamp } = body

  if (typeWebhook === 'outgoingMessageStatus') {
    if (!body.chatId || !idMessage || !body.status) return null
    const status: MessageStatus | null =
      body.status === 'delivered' || body.status === 'read'
        ? body.status
        : body.status === 'failed' || body.status === 'noAccount'
          ? 'error'
          : null
    if (!status) return null
    const error =
      body.status === 'noAccount' ? 'У получателя нет аккаунта Telegram' : status === 'error' ? body.description : undefined
    return { type: 'status', chatId: body.chatId, id: idMessage, status, error }
  }

  // outgoingAPIMessageReceived не обрабатываем: такие сообщения отправлены из этого интерфейса и уже показаны
  if (typeWebhook !== 'incomingMessageReceived' && typeWebhook !== 'outgoingMessageReceived') return null
  if (!senderData || !messageData || !idMessage) return null

  const text =
    messageData.typeMessage === 'textMessage'
      ? messageData.textMessageData?.textMessage
      : messageData.typeMessage === 'extendedTextMessage'
        ? messageData.extendedTextMessageData?.text
        : undefined
  if (text === undefined) return null

  return {
    type: 'add',
    chatId: senderData.chatId,
    name: senderData.chatName || senderData.senderName,
    message: {
      id: idMessage,
      text,
      outgoing: typeWebhook === 'outgoingMessageReceived',
      time: timestamp * 1000,
    },
  }
}

export function lastMessage(chat: Chat): Message | undefined {
  return chat.messages[chat.messages.length - 1]
}

const activity = (chat: Chat) => lastMessage(chat)?.time ?? chat.createdAt

export function sortedChats(chats: Chats): Chat[] {
  return Object.values(chats).sort((a, b) => activity(b) - activity(a))
}
