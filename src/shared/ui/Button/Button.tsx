import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { cx } from '../../lib/cx'
import { Spinner } from '../Spinner/Spinner'
import s from './Button.module.css'

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'ghostAccent' | 'ghostDanger'
export type ButtonSize = 'xs' | 'sm' | 'md' | 'lg'

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  /** 'circle' — круглая кнопка под иконку */
  shape?: 'rounded' | 'circle'
  /** Показывает спиннер вместо иконки и блокирует кнопку */
  loading?: boolean
  icon?: ReactNode
  fullWidth?: boolean
  align?: 'center' | 'start'
}

export function Button({
  variant = 'primary',
  size = 'md',
  shape = 'rounded',
  loading = false,
  icon,
  fullWidth = false,
  align = 'center',
  type = 'button',
  disabled,
  className,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={cx(
        s.button,
        s[variant],
        s[size],
        shape === 'circle' && s.circle,
        fullWidth && s.fullWidth,
        align === 'start' && s.alignStart,
        className,
      )}
      {...props}
    >
      {loading ? <Spinner size={size === 'lg' ? 20 : 16} color="inherit" /> : icon}
      {children}
    </button>
  )
}
