/** Текст ошибки для показа пользователю */
export const errorText = (e: unknown) => (e instanceof Error ? e.message : String(e))

export const isAbortError = (e: unknown) => e instanceof DOMException && e.name === 'AbortError'
