import { useEffect, useState } from 'react'
import { canReceive, getSettings, REQUIRED_SETTINGS, setSettings, type Credentials } from '../api'
import { errorText } from '../shared/lib/errors'

export type ReceivingState = 'unknown' | 'ok' | 'disabled' | 'enabling' | 'pending'

/** Проверяет, что инстанс настроен на приём сообщений и статусов по HTTP API, и умеет это включить */
export function useInstanceSettings(creds: Credentials) {
  const [receiving, setReceiving] = useState<ReceivingState>('unknown')
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false
    getSettings(creds)
      .then((settings) => !cancelled && setReceiving(canReceive(settings) ? 'ok' : 'disabled'))
      // не удалось проверить — не мешаем работе, проблема проявится в опросе очереди
      .catch(() => {})
    return () => {
      cancelled = true
    }
  }, [creds])

  const enableReceiving = async () => {
    setReceiving('enabling')
    setError('')
    try {
      await setSettings(creds, REQUIRED_SETTINGS)
      setReceiving('pending')
    } catch (e) {
      setReceiving('disabled')
      setError(`Не удалось изменить настройки: ${errorText(e)}`)
    }
  }

  return { receiving, enableReceiving, error }
}
