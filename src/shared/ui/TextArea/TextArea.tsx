import type { ComponentProps, KeyboardEvent } from 'react'
import { cx } from '../../lib/cx'
import s from './TextArea.module.css'

export interface TextAreaProps extends ComponentProps<'textarea'> {
  /** Вызывается по Enter без Shift (Shift+Enter переносит строку) */
  onSubmitKey?: () => void
}

/** Многострочное поле-капсула, растущее по содержимому */
export function TextArea({ onSubmitKey, onKeyDown, className, rows = 1, ...props }: TextAreaProps) {
  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    onKeyDown?.(e)
    if (onSubmitKey && !e.defaultPrevented && e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) {
      e.preventDefault()
      onSubmitKey()
    }
  }

  return <textarea rows={rows} className={cx(s.textarea, className)} onKeyDown={handleKeyDown} {...props} />
}
