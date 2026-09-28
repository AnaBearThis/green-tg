import type { HTMLAttributes } from 'react'
import { cx } from '../../lib/cx'
import s from './Separator.module.css'

/** Подпись по центру ленты, например дата */
export function Separator({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div role="separator" className={cx(s.separator, className)} {...props} />
}
