/** Склеивает классы, пропуская пустые значения: cx('a', flag && 'b') */
export function cx(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(' ')
}
