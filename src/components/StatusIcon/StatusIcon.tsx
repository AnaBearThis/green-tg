import type { MessageStatus } from '../../chats'
import { cx } from '../../shared/lib/cx'
import s from './StatusIcon.module.css'

const TITLES: Record<MessageStatus, string> = {
  sending: 'Отправляется',
  sent: 'Отправлено',
  delivered: 'Доставлено',
  read: 'Прочитано',
  error: 'Не отправлено',
}

/** Отметки как в Telegram: часы — отправляется, ✓ — отправлено или доставлено, ✓✓ — прочитано. */
export interface StatusIconProps {
  status?: MessageStatus
  /** Причина ошибки для подсказки */
  error?: string
  className?: string
}

export function StatusIcon({ status = 'sent', error, className }: StatusIconProps) {
  const title = status === 'error' && error ? `${TITLES.error}: ${error}` : TITLES[status]

  return (
    <span className={cx(s.icon, status === 'error' && s.error, className)} title={title} role="img" aria-label={title}>
      <svg viewBox="0 0 19 12" width="19" height="12" aria-hidden="true">
        {status === 'sending' && (
          <g fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round">
            <circle cx="12" cy="6" r="5" />
            <path d="M12 3.3V6l1.8 1.2" />
          </g>
        )}
        {status === 'error' && (
          <g>
            <circle cx="12" cy="6" r="5.5" fill="currentColor" />
            <path d="M12 3v3.6M12 8.6v.2" stroke="var(--status-error-mark, #fff)" strokeWidth="1.5" strokeLinecap="round" />
          </g>
        )}
        {(status === 'sent' || status === 'delivered' || status === 'read') && (
          <path
            d={status === 'read' ? 'M1.5 6.5l3 3 6-7M7.5 8.5l1 1 6-7' : 'M4.5 6.5l3 3 6-7'}
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        )}
      </svg>
    </span>
  )
}
