import { useCallback, useEffect, useReducer, useRef } from 'react'
import { chatsReducer, type ChatsAction, type StatusAction } from '../chats'
import { config } from '../config'
import { openTabChannel } from '../shared/lib/tabs'
import { loadChats, saveChats } from '../storage'

// Сколько «ранних» статусов помнить: хватает с запасом, при этом Map не растёт бесконечно
const EARLY_STATUS_LIMIT = 200

/**
 * Состояние чатов инстанса: редьюсер, сохранение в localStorage и синхронизация между вкладками.
 * Каждое действие применяется локально и рассылается остальным вкладкам, поэтому у всех одинаковое состояние.
 */
export function useChats(idInstance: string) {
  const [chats, applyLocal] = useReducer(chatsReducer, idInstance, loadChats)
  const channelRef = useRef<ReturnType<typeof openTabChannel<ChatsAction>> | null>(null)
  // Статус может прийти раньше, чем ответ sendMessage с idMessage (в том числе в другой вкладке)
  const earlyStatuses = useRef(new Map<string, StatusAction>())

  const apply = useCallback((action: ChatsAction) => {
    if (action.type === 'status') {
      const early = earlyStatuses.current
      early.set(action.id, action)
      if (early.size > EARLY_STATUS_LIMIT) early.delete(early.keys().next().value!)
    }
    applyLocal(action)
  }, [])

  useEffect(() => {
    const channel = openTabChannel<ChatsAction>(`${config.storagePrefix}:chats:${idInstance}`, apply)
    channelRef.current = channel
    return () => {
      channel.close()
      channelRef.current = null
    }
  }, [idInstance, apply])

  useEffect(() => saveChats(idInstance, chats), [idInstance, chats])

  const dispatch = useCallback(
    (action: ChatsAction) => {
      apply(action)
      channelRef.current?.post(action)
    },
    [apply],
  )

  /** Забирает статус, пришедший раньше, чем стал известен idMessage */
  const takeEarlyStatus = useCallback((idMessage: string) => {
    const status = earlyStatuses.current.get(idMessage)
    earlyStatuses.current.delete(idMessage)
    return status
  }, [])

  return { chats, dispatch, takeEarlyStatus }
}
