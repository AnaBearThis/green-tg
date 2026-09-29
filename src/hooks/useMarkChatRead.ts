import { useEffect, useState } from 'react'
import { readChat, type Credentials } from '../api'
import type { Chat, ChatsAction } from '../chats'
import { errorText } from '../shared/lib/errors'
import { usePageVisible } from './usePageVisible'

/**
 * Открытый чат на видимой вкладке считается прочитанным: сбрасываем счётчик
 * и вызываем readChat, чтобы у собеседника появились две галочки.
 */
export function useMarkChatRead(creds: Credentials, chat: Chat | undefined, dispatch: (action: ChatsAction) => void) {
  const visible = usePageVisible()
  const [error, setError] = useState('')
  const chatId = chat?.chatId
  const unread = chat?.unread ?? 0

  useEffect(() => {
    if (!chatId || !visible || !unread) return
    dispatch({ type: 'read', chatId })
    readChat(creds, chatId)
      .then(() => setError(''))
      .catch((e) => setError(`Не удалось отметить чат прочитанным: ${errorText(e)}`))
  }, [creds, chatId, unread, visible, dispatch])

  return { error }
}
