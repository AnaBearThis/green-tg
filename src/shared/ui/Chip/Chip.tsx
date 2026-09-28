import type { HTMLAttributes } from 'react'
import { cx } from '../../lib/cx'
import s from './Chip.module.css'

/** Небольшая плашка с текстом */
export function Chip({ className, ...props }: HTMLAttributes<HTMLSpanElement>) {
  return <span className={cx(s.chip, className)} {...props} />
}
