import { Fragment, useEffect, useRef, useState, type FormEvent } from 'react'
import type { Chat } from '../../chats'
import { formatDay, formatTime } from '../../format'
import { cx } from '../../shared/lib/cx'
import { Avatar, IconButton, MessageBubble, Panel, Separator, TextArea } from '../../shared/ui'
import { StatusIcon } from '../StatusIcon/StatusIcon'
import s from './ChatView.module.css'

interface Props {
  chat: Chat
  onSend: (text: string) => void
  onBack: () => void
  className?: string
}

const MAX_LENGTH = 4096

const sameDay = (a: number, b: number) => new Date(a).toDateString() === new Date(b).toDateString()

export function ChatView({ chat, onSend, onBack, className }: Props) {
  const [text, setText] = useState('')
  const listRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    const list = listRef.current
    if (list) list.scrollTop = list.scrollHeight
  }, [chat.messages.length])

  useEffect(() => inputRef.current?.focus(), [])

  const submit = (e?: FormEvent) => {
    e?.preventDefault()
    const value = text.trim()
    if (!value) return
    onSend(value)
    setText('')
  }

  return (
    <main className={cx(s.root, className)}>
      <header className={s.header}>
        <IconButton icon="back" label="Назад к списку чатов" variant="secondary" size="lg" className={s.back} onClick={onBack} />
        <Panel radius="pill" className={s.peer}>
          <Avatar name={chat.name} seed={chat.chatId} size={44} />
          <div className={s.peerText}>
            <div className={s.peerName}>{chat.name}</div>
            <div className={s.peerSub}>Telegram · ID {chat.chatId}</div>
          </div>
        </Panel>
      </header>

      <div className={s.messages} ref={listRef}>
        <div className={s.messagesInner}>
          {chat.messages.length === 0 && <Separator>Напишите первое сообщение</Separator>}
          {chat.messages.map((m, i) => {
            const prev = chat.messages[i - 1]
            const next = chat.messages[i + 1]
            const newDay = !prev || !sameDay(prev.time, m.time)
            // хвостик — у последнего сообщения в группе подряд идущих от одного автора
            const tail = !next || next.outgoing !== m.outgoing || !sameDay(next.time, m.time)
            return (
              <Fragment key={m.id}>
                {newDay && <Separator>{formatDay(m.time)}</Separator>}
                <MessageBubble
                  direction={m.outgoing ? 'out' : 'in'}
                  tail={tail}
                  meta={
                    <>
                      {formatTime(m.time)}
                      {m.outgoing && <StatusIcon status={m.status} error={m.error} />}
                    </>
                  }
                >
                  {m.text}
                </MessageBubble>
              </Fragment>
            )
          })}
        </div>
      </div>

      <form className={s.composer} onSubmit={submit}>
        <TextArea
          ref={inputRef}
          className={s.composerInput}
          value={text}
          maxLength={MAX_LENGTH}
          onChange={(e) => setText(e.target.value)}
          onSubmitKey={submit}
          placeholder="Сообщение…"
          aria-label="Текст сообщения"
        />
        <IconButton
          type="submit"
          icon="send"
          iconClassName={s.sendIcon}
          label="Отправить"
          size="lg"
          variant={text.trim() ? 'primary' : 'secondary'}
          disabled={!text.trim()}
        />
      </form>
    </main>
  )
}
