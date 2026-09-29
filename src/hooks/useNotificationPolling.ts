import { useEffect, useRef, useState } from 'react'
import { deleteNotification, receiveNotification, type Credentials, type NotificationBody } from '../api'
import { config } from '../config'
import { errorText } from '../shared/lib/errors'
import { pause } from '../shared/lib/pause'
import { runInSingleTab } from '../shared/lib/tabs'

/**
 * Получение уведомлений по технологии HTTP API: receiveNotification → обработка → deleteNotification.
 * Очередь одна на инстанс, поэтому её читает только одна вкладка (Web Locks): иначе вкладки удаляли бы
 * уведомления друг у друга. Остальные вкладки получают изменения через синхронизацию в useChats.
 */
export function useNotificationPolling(creds: Credentials, onNotification: (body: NotificationBody) => void) {
  const [error, setError] = useState('')
  const [isLeader, setIsLeader] = useState(false)
  const handlerRef = useRef(onNotification)

  useEffect(() => {
    handlerRef.current = onNotification
  })

  useEffect(() => {
    const controller = new AbortController()

    runInSingleTab(`${config.storagePrefix}:poll:${creds.idInstance}`, controller.signal, async (signal) => {
      setIsLeader(true)
      while (!signal.aborted) {
        try {
          const notification = await receiveNotification(creds, signal)
          if (!notification) continue
          handlerRef.current(notification.body)
          await deleteNotification(creds, notification.receiptId)
          setError('')
        } catch (e) {
          if (signal.aborted) break
          setError(`Нет связи с GREEN-API: ${errorText(e)}`)
          await pause(config.pollRetryMs, signal)
        }
      }
      setIsLeader(false)
    })

    return () => controller.abort()
  }, [creds])

  return { error, isLeader }
}
