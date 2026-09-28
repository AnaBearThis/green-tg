import { Button, type ButtonProps } from '../Button/Button'
import { Icon, type IconName } from '../Icon/Icon'

export interface IconButtonProps extends Omit<ButtonProps, 'icon' | 'children' | 'shape'> {
  icon: IconName
  /** Обязательная подпись для скринридеров, заодно всплывающая подсказка */
  label: string
  iconSize?: number
  /** Класс для самой иконки, например поворот или цвет */
  iconClassName?: string
}

const ICON_SIZES = { xs: 18, sm: 20, md: 24, lg: 26 } as const

/** Круглая кнопка с одной иконкой */
export function IconButton({
  icon,
  label,
  iconSize,
  iconClassName,
  variant = 'ghost',
  size = 'md',
  title,
  ...props
}: IconButtonProps) {
  return (
    <Button
      variant={variant}
      size={size}
      shape="circle"
      icon={<Icon name={icon} size={iconSize ?? ICON_SIZES[size]} className={iconClassName} />}
      aria-label={label}
      title={title ?? label}
      {...props}
    />
  )
}
