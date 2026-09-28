import type { HTMLAttributes, ReactNode } from 'react'
import { cx } from '../../lib/cx'
import s from './Alert.module.css'

export interface AlertProps extends HTMLAttributes<HTMLDivElement> {
  tone?: 'warning' | 'error' | 'info'
  /** Кнопка действия под текстом */
  action?: ReactNode
}

export function Alert({ tone = 'info', action, className, children, ...props }: AlertProps) {
  return (
    <div role={tone === 'error' ? 'alert' : 'status'} className={cx(s.alert, s[tone], className)} {...props}>
      <div>{children}</div>
      {action}
    </div>
  )
}
