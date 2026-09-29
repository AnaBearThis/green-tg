export type Recipient = { phoneNumber: number } | { username: string }

/** Приводит ввод к параметру checkAccount: @username или номер только из цифр (8XXXXXXXXXX → 7XXXXXXXXXX). */
export function parseRecipient(input: string): Recipient | null {
  const value = input.trim()
  if (value.startsWith('@')) return value.length > 1 ? { username: value } : null
  let digits = value.replace(/\D/g, '')
  if (digits.length === 11 && digits.startsWith('8')) digits = `7${digits.slice(1)}`
  return digits.length >= 10 && digits.length <= 15 ? { phoneNumber: Number(digits) } : null
}
