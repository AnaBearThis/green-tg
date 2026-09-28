import type { SVGProps } from 'react'

// Иконки в стиле Telegram: контур 24×24, цвет берётся из currentColor
const PATHS = {
  menu: <path d="M4 6h16M4 12h16M4 18h16" strokeWidth="2" />,
  compose: (
    <>
      <path d="M11 4H6a2 2 0 00-2 2v12a2 2 0 002 2h12a2 2 0 002-2v-5" />
      <path d="M17.5 3.5a2.1 2.1 0 013 3L12 15l-4 1 1-4z" />
    </>
  ),
  addUser: <path d="M16 19a4 4 0 00-8 0M12 12a3 3 0 100-6 3 3 0 000 6M19 8v6M16 11h6" />,
  plus: <path d="M12 5v14M5 12h14" strokeWidth="2.4" />,
  back: <path d="M15 5l-7 7 7 7" strokeWidth="2" />,
  send: (
    <path
      d="M3.4 20.4l17.45-7.48a1 1 0 000-1.84L3.4 3.6a.99.99 0 00-1.39.91L2 9.12c0 .5.37.93.87.99L17 12 2.87 13.88c-.5.07-.87.5-.87 1l.01 4.61c0 .71.73 1.2 1.39.91z"
      fill="currentColor"
      stroke="none"
    />
  ),
} as const

export type IconName = keyof typeof PATHS

export interface IconProps extends Omit<SVGProps<SVGSVGElement>, 'name'> {
  name: IconName
  size?: number
}

export function Icon({ name, size = 24, ...props }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      {...props}
    >
      {PATHS[name]}
    </svg>
  )
}
