import { useId, type ComponentProps, type ReactNode } from 'react'
import { cx } from '../../lib/cx'
import s from './TextField.module.css'

export interface TextFieldProps extends ComponentProps<'input'> {
  label: ReactNode
  /** Подсказка под полем; при invalid подсвечивается как ошибка */
  hint?: ReactNode
  invalid?: boolean
}

/** Поле с плавающей подписью на рамке */
export function TextField({ label, hint, invalid = false, className, id, ...props }: TextFieldProps) {
  const autoId = useId()
  const inputId = id ?? autoId
  const hintId = hint ? `${inputId}-hint` : undefined

  return (
    <div className={cx(s.field, invalid && s.invalid, className)}>
      <label className={s.label} htmlFor={inputId}>
        {label}
      </label>
      <input id={inputId} className={s.input} aria-invalid={invalid || undefined} aria-describedby={hintId} {...props} />
      {hint && (
        <span id={hintId} className={s.hint}>
          {hint}
        </span>
      )}
    </div>
  )
}
