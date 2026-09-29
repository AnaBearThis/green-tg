import { useRef, useState, type FormEvent } from 'react'
import { lastMessage, sortedChats, type Chats } from '../../chats'
import { formatListTime } from '../../format'
import type { ReceivingState } from '../../hooks'
import { cx } from '../../shared/lib/cx'
import { Alert, Avatar, Badge, Button, EmptyState, Icon, IconButton, ListItem, Menu, Panel, PillInput, Spinner } from '../../shared/ui'
import { StatusIcon } from '../StatusIcon/StatusIcon'
import s from './Sidebar.module.css'

interface Props {
  chats: Chats
  activeChatId: string | null
  idInstance: string
  /** false — очередь уведомлений читает другая открытая вкладка */
  receivesHere?: boolean
  /** Предупреждение о проблемах со связью или настройками */
  pollError: string
  receiving: ReceivingState
  onEnableReceiving: () => void
  onSelect: (chatId: string) => void
  /** Возвращает текст ошибки или null при успехе */
  onCreateChat: (input: string) => Promise<string | null>
  onLogout: () => void
  className?: string
}

export function Sidebar({
  chats,
  activeChatId,
  idInstance,
  receivesHere = true,
  pollError,
  receiving,
  onEnableReceiving,
  onSelect,
  onCreateChat,
  onLogout,
  className,
}: Props) {
  const [recipient, setRecipient] = useState('')
  const [error, setError] = useState('')
  const [creating, setCreating] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    if (!recipient.trim() || creating) return
    setCreating(true)
    setError('')
    const err = await onCreateChat(recipient)
    setCreating(false)
    if (err) setError(err)
    else setRecipient('')
  }

  const list = sortedChats(chats)

  return (
    <Panel as="aside" className={cx(s.root, className)}>
      <div className={s.header}>
        <Menu
          icon="menu"
          label="Меню"
          header={
            <>
              Инстанс {idInstance}
              {!receivesHere && <div>Сообщения принимает другая вкладка</div>}
            </>
          }
          items={[{ label: 'Выйти', onSelect: onLogout, danger: true }]}
        />
        <h1 className={s.title}>Чаты</h1>
        <IconButton icon="compose" label="Новый чат" variant="ghostAccent" onClick={() => inputRef.current?.focus()} />
      </div>

      <form className={s.newChat} onSubmit={submit}>
        <PillInput
          ref={inputRef}
          value={recipient}
          onChange={(e) => {
            setRecipient(e.target.value)
            setError('')
          }}
          placeholder="Новый чат: номер телефона"
          inputMode="tel"
          aria-label="Номер телефона получателя"
          leading={<Icon name="addUser" size={20} />}
          trailing={
            creating ? (
              <Spinner label="Поиск пользователя" />
            ) : (
              recipient.trim() && <IconButton type="submit" icon="plus" label="Создать чат" variant="primary" size="xs" />
            )
          }
        />
      </form>

      {error && (
        <Alert tone="error" className={s.alert}>
          {error}
        </Alert>
      )}
      {pollError && (
        <Alert tone="warning" className={s.alert}>
          {pollError}
        </Alert>
      )}
      {(receiving === 'disabled' || receiving === 'enabling') && (
        <Alert
          tone="warning"
          className={s.alert}
          action={
            <Button size="sm" loading={receiving === 'enabling'} onClick={onEnableReceiving}>
              Включить
            </Button>
          }
        >
          Приём сообщений или отметок о прочтении выключен в настройках инстанса (нужны пустой webhookUrl, incomingWebhook
          и outgoingWebhook = yes).
        </Alert>
      )}
      {receiving === 'pending' && (
        <Alert tone="warning" className={s.alert}>
          Настройки сохранены. Инстанс перезапустится, приём заработает в течение 5 минут.
        </Alert>
      )}

      <ul className={s.list}>
        {list.length === 0 && (
          <li>
            <EmptyState>Чатов пока нет. Введите номер телефона выше, чтобы начать переписку.</EmptyState>
          </li>
        )}
        {list.map((chat) => {
          const last = lastMessage(chat)
          return (
            <li key={chat.chatId}>
              <ListItem
                active={chat.chatId === activeChatId}
                onClick={() => onSelect(chat.chatId)}
                leading={<Avatar name={chat.name} seed={chat.chatId} />}
                title={chat.name}
                meta={
                  last && (
                    <>
                      {last.outgoing && <StatusIcon status={last.status} className={s.status} />}
                      {formatListTime(last.time)}
                    </>
                  )
                }
                badge={<Badge count={chat.unread ?? 0} tone={chat.chatId === activeChatId ? 'inverted' : 'accent'} />}
                subtitle={
                  last ? (
                    <>
                      {last.outgoing && <span className={s.you}>Вы: </span>}
                      {last.text}
                    </>
                  ) : (
                    'Нет сообщений'
                  )
                }
              />
            </li>
          )
        })}
      </ul>
    </Panel>
  )
}
