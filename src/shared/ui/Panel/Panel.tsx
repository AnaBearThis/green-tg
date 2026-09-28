import type { ElementType, HTMLAttributes } from 'react'
import { cx } from '../../lib/cx'
import s from './Panel.module.css'

export interface PanelProps extends HTMLAttributes<HTMLElement> {
  /** HTML-тег обёртки: div, aside, header, form, ... */
  as?: ElementType
  radius?: 'md' | 'lg' | 'pill'
  padding?: 'none' | 'sm' | 'md' | 'lg'
}

const PADDING = { none: s.padNone, sm: s.padSm, md: s.padMd, lg: s.padLg } as const

/** Плавающая скруглённая панель — основной строительный блок интерфейса */
export function Panel({ as: Tag = 'div', radius = 'lg', padding = 'none', className, ...props }: PanelProps) {
  return <Tag className={cx(s.panel, s[radius], PADDING[padding], className)} {...props} />
}
