import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { cx } from '../../lib/cx'
import s from './ListItem.module.css'

export interface ListItemProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'title'> {
  title: ReactNode
  /** Слева, обычно Avatar */
  leading?: ReactNode
  /** Справа от заголовка: время, статус */
  meta?: ReactNode
  subtitle?: ReactNode
  /** Справа от подзаголовка, обычно Badge */
  badge?: ReactNode
  /** Сколько строк подзаголовка показывать до многоточия */
  subtitleLines?: number
  active?: boolean
}

/** Строка списка: аватар, заголовок, мета и подзаголовок */
export function ListItem({
  title,
  leading,
  meta,
  subtitle,
  badge,
  subtitleLines = 2,
  active = false,
  className,
  ...props
}: ListItemProps) {
  return (
    <button type="button" className={cx(s.item, active && s.active, className)} aria-current={active || undefined} {...props}>
      {leading}
      <span className={s.body}>
        <span className={s.top}>
          <span className={s.title}>{title}</span>
          {meta && <span className={s.meta}>{meta}</span>}
        </span>
        {(subtitle || badge) && (
          <span className={s.bottom}>
            <span className={s.subtitle} style={{ WebkitLineClamp: subtitleLines }}>
              {subtitle}
            </span>
            {badge}
          </span>
        )}
      </span>
    </button>
  )
}
