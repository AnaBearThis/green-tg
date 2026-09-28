import { useEffect, useReducer, useRef, useState } from 'react'
import {
  canReceive,
  checkAccount,
  deleteNotification,
  getSettings,
  readChat,
  receiveNotification,
  REQUIRED_SETTINGS,
  sendMessage,
  setSettings,
  type Credentials,
} from '../../api'
import { config } from '../../config'
import { chatsReducer, notificationToAction, type ChatsAction } from '../../chats'
import { loadChats, saveChats } from '../../storage'
import { cx } from '../../shared/lib/cx'
import { Chip } from '../../shared/ui'
import { ChatView } from '../ChatView/ChatView'
import s from './Messenger.module.css'
import { Sidebar, type ReceivingState } from '../Sidebar/Sidebar'

interface Props {
  creds: Credentials
  onLogout: () => void
}

const errorText = (e: unknown) => (e instanceof Error ? e.message : String(e))

function pause(ms: number, signal: AbortSignal) {
  return new Promise<void>((resolve) => {
    const timer = setTimeout(resolve, ms)
    signal.addEventListener('abort', () => {
      clearTimeout(timer)
      resolve()
    })
  })
}

/** Приводит ввод к параметру checkAccount: @username или номер только из цифр (8XXXXXXXXXX → 7XXXXXXXXXX). */
function parseRecipient(input: string): { phoneNumber: number } | { username: string } | null {
  const value = input.trim()
  if (value.startsWith('@')) return value.length > 1 ? { username: value } : null
  let digits = value.replace(/\D/g, '')
  if (digits.length === 11 && digits.startsWith('8')) digits = `7${digits.slice(1)}`
  return digits.length >= 10 && digits.length <= 15 ? { phoneNumber: Number(digits) } : null
}

export function Messenger({ creds, onLogout }: Props) {
  const [chats, dispatch] = useReducer(chatsReducer, creds.idInstance, loadChats)
  const [activeChatId, setActiveChatId] = useState<string | null>(null)
  const [pollError, setPollError] = useState('')
  // Статус может прийти раньше, чем ответ sendMessage с idMessage: запоминаем его и применяем после ответа
  const earlyStatuses = useRef(new Map<string, Extract<ChatsAction, { type: 'status' }>>())
  const [receiving, setReceiving] = useState<ReceivingState>('unknown')

  // Без нужных настроек входящие сообщения и статусы не попадают в очередь HTTP API
  useEffect(() => {
    let cancelled = false
    getSettings(creds)
      .then((settings) => !cancelled && setReceiving(canReceive(settings) ? 'ok' : 'disabled'))
      .catch(() => {})
    return () => {
      cancelled = true
    }
  }, [creds])

  const enableReceiving = async () => {
    setReceiving('enabling')
    try {
      await setSettings(creds, REQUIRED_SETTINGS)
      setReceiving('pending')
    } catch (e) {
      setReceiving('disabled')
      setPollError(`Не удалось изменить настройки: ${errorText(e)}`)
    }
  }

  useEffect(() => saveChats(creds.idInstance, chats), [creds.idInstance, chats])

  // Получение сообщений по технологии HTTP API: receiveNotification → обработка → deleteNotification
  useEffect(() => {
    const controller = new AbortController()
    const { signal } = controller

    ;(async () => {
      while (!signal.aborted) {
        try {
          const notification = await receiveNotification(creds, signal)
          if (!notification) continue
          const action = notificationToAction(notification.body)
          if (action?.type === 'status') earlyStatuses.current.set(action.id, action)
          if (action) dispatch(action)
          await deleteNotification(creds, notification.receiptId)
          setPollError('')
        } catch (e) {
          if (signal.aborted) break
          setPollError(`Нет связи с GREEN-API: ${errorText(e)}`)
          await pause(config.pollRetryMs, signal)
        }
      }
    })()

    return () => controller.abort()
  }, [creds])

  const [pageVisible, setPageVisible] = useState(() => document.visibilityState === 'visible')

  useEffect(() => {
    const onChange = () => setPageVisible(document.visibilityState === 'visible')
    document.addEventListener('visibilitychange', onChange)
    return () => document.removeEventListener('visibilitychange', onChange)
  }, [])

  // Открытый чат на видимой вкладке считается прочитанным: сбрасываем счётчик и сообщаем в Telegram
  const activeUnread = (activeChatId && chats[activeChatId]?.unread) || 0
  useEffect(() => {
    if (!activeChatId || !pageVisible || !activeUnread) return
    dispatch({ type: 'read', chatId: activeChatId })
    readChat(creds, activeChatId).catch((e) => setPollError(`Не удалось отметить чат прочитанным: ${errorText(e)}`))
  }, [creds, activeChatId, activeUnread, pageVisible])

  const createChat = async (input: string): Promise<string | null> => {
    const target = parseRecipient(input)
    if (!target) return 'Введите номер телефона в международном формате или @username'
    try {
      const account = await checkAccount(creds, target)
      if (!account.exist || !account.chatId) return 'Пользователь Telegram с таким номером не найден'
      const name = account.phoneNumber ? `+${account.phoneNumber}` : account.username || account.chatId
      dispatch({ type: 'open', chatId: account.chatId, name })
      setActiveChatId(account.chatId)
      return null
    } catch (e) {
      return errorText(e)
    }
  }

  const send = async (chatId: string, text: string) => {
    const localId = `local-${Date.now()}-${Math.random().toString(36).slice(2)}`
    dispatch({ type: 'add', chatId, message: { id: localId, text, outgoing: true, time: Date.now(), status: 'sending' } })
    try {
      const { idMessage } = await sendMessage(creds, chatId, text)
      dispatch({ type: 'update', chatId, id: localId, patch: { id: idMessage, status: 'sent' } })
      const early = earlyStatuses.current.get(idMessage)
      if (early) dispatch(early)
    } catch {
      dispatch({ type: 'update', chatId, id: localId, patch: { status: 'error' } })
    }
  }

  const activeChat = activeChatId ? chats[activeChatId] : undefined

  return (
    <div className={s.root} data-active={Boolean(activeChat)}>
      <Sidebar
        chats={chats}
        activeChatId={activeChatId}
        idInstance={creds.idInstance}
        pollError={pollError}
        receiving={receiving}
        onEnableReceiving={enableReceiving}
        onSelect={setActiveChatId}
        onCreateChat={createChat}
        onLogout={onLogout}
        className={s.sidebar}
      />
      {activeChat ? (
        <ChatView
          key={activeChat.chatId}
          chat={activeChat}
          onSend={(text) => send(activeChat.chatId, text)}
          onBack={() => setActiveChatId(null)}
          className={s.main}
        />
      ) : (
        <main className={cx(s.empty, s.main)}>
          <Chip>Выберите чат или создайте новый по номеру телефона</Chip>
        </main>
      )}
    </div>
  )
}
