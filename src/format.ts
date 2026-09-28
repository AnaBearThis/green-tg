const timeFormat = new Intl.DateTimeFormat('ru-RU', { hour: '2-digit', minute: '2-digit' })
const dateFormat = new Intl.DateTimeFormat('ru-RU', { day: '2-digit', month: '2-digit' })
const dayFormat = new Intl.DateTimeFormat('ru-RU', { day: 'numeric', month: 'long' })

export const formatTime = (time: number) => timeFormat.format(time)

const isToday = (time: number) => new Date(time).toDateString() === new Date().toDateString()

/** Время для списка чатов: сегодня — часы и минуты, иначе дата. */
export const formatListTime = (time: number) => (isToday(time) ? timeFormat.format(time) : dateFormat.format(time))

/** Разделитель дней в ленте сообщений. */
export const formatDay = (time: number) => (isToday(time) ? 'Сегодня' : dayFormat.format(time))
