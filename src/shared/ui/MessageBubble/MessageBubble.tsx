import type { HTMLAttributes, ReactNode } from 'react'
import { cx } from '../../lib/cx'
import s from './MessageBubble.module.css'

export interface MessageBubbleProps extends HTMLAttributes<HTMLDivElement> {
  direction: 'in' | 'out'
  /** Хвостик — у последнего сообщения в группе */
  tail?: boolean
  /** Время, статус и т. п. в правом нижнем углу */
  meta?: ReactNode
}

export function MessageBubble({ direction, tail = false, meta, className, children, ...props }: MessageBubbleProps) {
  return (
    <div className={cx(s.bubble, s[direction], tail && s.tail, className)} {...props}>
      <span className={s.text}>{children}</span>
      {meta && <span className={s.meta}>{meta}</span>}
    </div>
  )
}
