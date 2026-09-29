import { useCallback, useState } from 'react'
import type { Credentials, NotificationBody } from '../../api'
import { notificationToAction } from '../../chats'
import { useChatActions, useChats, useInstanceSettings, useMarkChatRead, useNotificationPolling } from '../../hooks'
import { cx } from '../../shared/lib/cx'
import { Chip } from '../../shared/ui'
import { ChatView } from '../ChatView/ChatView'
import { Sidebar } from '../Sidebar/Sidebar'
import s from './Messenger.module.css'

interface Props {
  creds: Credentials
  onLogout: () => void
}

export function Messenger({ creds, onLogout }: Props) {
  const { chats, dispatch, takeEarlyStatus } = useChats(creds.idInstance)
  const [activeChatId, setActiveChatId] = useState<string | null>(null)
  const activeChat = activeChatId ? chats[activeChatId] : undefined

  const onNotification = useCallback(
    (body: NotificationBody) => {
      const action = notificationToAction(body)
      if (action) dispatch(action)
    },
    [dispatch],
  )

  const polling = useNotificationPolling(creds, onNotification)
  const settings = useInstanceSettings(creds)
  const markRead = useMarkChatRead(creds, activeChat, dispatch)
  const { createChat, send } = useChatActions(creds, dispatch, takeEarlyStatus)

  const openNewChat = async (input: string) => {
    const result = await createChat(input)
    if (result.chatId) setActiveChatId(result.chatId)
    return result.error ?? null
  }

  return (
    <div className={s.root} data-active={Boolean(activeChat)}>
      <Sidebar
        chats={chats}
        activeChatId={activeChatId}
        idInstance={creds.idInstance}
        receivesHere={polling.isLeader}
        pollError={polling.error || settings.error || markRead.error}
        receiving={settings.receiving}
        onEnableReceiving={settings.enableReceiving}
        onSelect={setActiveChatId}
        onCreateChat={openNewChat}
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
