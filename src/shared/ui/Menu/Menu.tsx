import { useEffect, useId, useRef, useState, type ReactNode } from 'react'
import { cx } from '../../lib/cx'
import { Button } from '../Button/Button'
import type { IconName } from '../Icon/Icon'
import { IconButton } from '../IconButton/IconButton'
import s from './Menu.module.css'

export interface MenuItem {
  label: string
  onSelect: () => void
  danger?: boolean
}

export interface MenuProps {
  /** Иконка кнопки-триггера */
  icon: IconName
  label: string
  items: MenuItem[]
  /** Необязательный текст над пунктами */
  header?: ReactNode
  /** К какому краю кнопки прижать меню */
  align?: 'start' | 'end'
  className?: string
}

/** Выпадающее меню; закрывается по клику снаружи, Escape и выбору пункта */
export function Menu({ icon, label, items, header, align = 'start', className }: MenuProps) {
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)
  const popupId = useId()

  useEffect(() => {
    if (!open) return
    const onPointer = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false)
    }
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    document.addEventListener('pointerdown', onPointer)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('pointerdown', onPointer)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  return (
    <div ref={rootRef} className={cx(s.menu, className)}>
      <IconButton
        icon={icon}
        label={label}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={open ? popupId : undefined}
        onClick={() => setOpen((v) => !v)}
      />
      {open && (
        <div id={popupId} role="menu" className={cx(s.popup, s[align])}>
          {header && <div className={s.header}>{header}</div>}
          {items.map((item) => (
            <Button
              key={item.label}
              role="menuitem"
              variant={item.danger ? 'ghostDanger' : 'ghost'}
              size="md"
              align="start"
              fullWidth
              onClick={() => {
                setOpen(false)
                item.onSelect()
              }}
            >
              {item.label}
            </Button>
          ))}
        </div>
      )}
    </div>
  )
}
