import type { ComponentProps, ReactNode } from 'react'
import { cx } from '../../lib/cx'
import s from './PillInput.module.css'

export interface PillInputProps extends ComponentProps<'input'> {
  /** Иконка слева */
  leading?: ReactNode
  /** Кнопка или индикатор справа */
  trailing?: ReactNode
  /** Класс для обёртки-капсулы; className применяется к самому input */
  wrapperClassName?: string
}

/** Поле-капсула в стиле поиска Telegram */
export function PillInput({ leading, trailing, wrapperClassName, className, ...props }: PillInputProps) {
  return (
    <div className={cx(s.pill, wrapperClassName)}>
      {leading && <span className={s.slot}>{leading}</span>}
      <input className={cx(s.input, className)} {...props} />
      {trailing && <span className={s.slot}>{trailing}</span>}
    </div>
  )
}
