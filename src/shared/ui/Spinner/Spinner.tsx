import { cx } from '../../lib/cx'
import s from './Spinner.module.css'

export interface SpinnerProps {
  size?: number
  /** По умолчанию — акцентный цвет; 'inherit' берёт цвет родителя */
  color?: 'accent' | 'inherit'
  label?: string
  className?: string
}

export function Spinner({ size = 18, color = 'accent', label = 'Загрузка', className }: SpinnerProps) {
  return (
    <span
      className={cx(s.spinner, className)}
      style={{ width: size, height: size, color: color === 'accent' ? 'var(--accent)' : undefined }}
      role="status"
      aria-label={label}
    />
  )
}
