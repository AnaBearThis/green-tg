import { useCallback } from 'react'
import { checkAccount, sendMessage, type Credentials } from '../api'
import type { ChatsAction, StatusAction } from '../chats'
import { parseRecipient } from '../recipient'
import { errorText } from '../shared/lib/errors'

type CreateChatResult = { chatId: string; error?: undefined } | { chatId?: undefined; error: string }

/** Создание чата по номеру телефона и отправка сообщений */
export function useChatActions(
  creds: Credentials,
  dispatch: (action: ChatsAction) => void,
  takeEarlyStatus: (idMessage: string) => StatusAction | undefined,
) {
  const createChat = useCallback(
    async (input: string): Promise<CreateChatResult> => {
      const target = parseRecipient(input)
      if (!target) return { error: 'Введите номер телефона в международном формате или @username' }
      try {
        const account = await checkAccount(creds, target)
        if (!account.exist || !account.chatId) return { error: 'Пользователь Telegram с таким номером не найден' }
        const name = account.phoneNumber ? `+${account.phoneNumber}` : account.username || account.chatId
        dispatch({ type: 'open', chatId: account.chatId, name, createdAt: Date.now() })
        return { chatId: account.chatId }
      } catch (e) {
        return { error: errorText(e) }
      }
    },
    [creds, dispatch],
  )

  const send = useCallback(
    async (chatId: string, text: string) => {
      const localId = `local-${Date.now()}-${Math.random().toString(36).slice(2)}`
      dispatch({ type: 'add', chatId, message: { id: localId, text, outgoing: true, time: Date.now(), status: 'sending' } })
      try {
        const { idMessage } = await sendMessage(creds, chatId, text)
        dispatch({ type: 'update', chatId, id: localId, patch: { id: idMessage, status: 'sent' } })
        const early = takeEarlyStatus(idMessage)
        if (early) dispatch(early)
      } catch {
        dispatch({ type: 'update', chatId, id: localId, patch: { status: 'error' } })
      }
    },
    [creds, dispatch, takeEarlyStatus],
  )

  return { createChat, send }
}
