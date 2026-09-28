import type { HTMLAttributes } from 'react'
import { cx } from '../../lib/cx'
import s from './EmptyState.module.css'

/** Текст-заглушка для пустых списков */
export function EmptyState({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cx(s.empty, className)} {...props} />
}
