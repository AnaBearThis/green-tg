import { cx } from '../../lib/cx'
import s from './Avatar.module.css'

// Палитра аватаров как в Telegram
const COLORS = ['#e17076', '#faa774', '#a695e7', '#7bc862', '#6ec9cb', '#65aadd', '#ee7aae']

function initials(name: string) {
  const words = name.replace(/[^\p{L}\p{N}\s]/gu, '').trim().split(/\s+/).filter(Boolean)
  if (words.length === 0) return '#'
  return (words[0][0] + (words[1]?.[0] ?? '')).toUpperCase()
}

function colorFor(seed: string) {
  let hash = 0
  for (const ch of seed) hash = (hash * 31 + ch.charCodeAt(0)) | 0
  return COLORS[Math.abs(hash) % COLORS.length]
}

export interface AvatarProps {
  name: string
  /** Строка, по которой выбирается цвет; по умолчанию — имя */
  seed?: string
  /** Картинка вместо инициалов */
  src?: string
  size?: number
  className?: string
}

export function Avatar({ name, seed = name, src, size = 54, className }: AvatarProps) {
  return (
    <div
      className={cx(s.avatar, className)}
      style={{ width: size, height: size, fontSize: size * 0.38, background: src ? undefined : colorFor(seed) }}
      aria-hidden="true"
    >
      {src ? <img className={s.image} src={src} alt="" /> : initials(name)}
    </div>
  )
}
