import type { HTMLAttributes } from 'react'
import { cx } from '../../lib/cx'
import s from './Badge.module.css'

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  count: number
  /** Больше этого числа показывается как «max+» */
  max?: number
  tone?: 'accent' | 'muted' | 'inverted'
}

/** Счётчик, например непрочитанных сообщений. При count ≤ 0 ничего не рисует. */
export function Badge({ count, max = 999, tone = 'accent', className, ...props }: BadgeProps) {
  if (count <= 0) return null
  return (
    <span className={cx(s.badge, s[tone], className)} {...props}>
      {count > max ? `${max}+` : count}
    </span>
  )
}
