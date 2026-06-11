import { useState, useCallback } from 'react'

const STORAGE_KEY = 'wc_unlocked'
const SECRET = import.meta.env.VITE_SECRET_KEY as string | undefined

function isUnlocked(): boolean {
  try {
    return localStorage.getItem(STORAGE_KEY) === SECRET && !!SECRET
  } catch {
    return false
  }
}

export function useSecretKey() {
  const [unlocked, setUnlocked] = useState<boolean>(isUnlocked)
  const [showModal, setShowModal] = useState(false)

  const tryUnlock = useCallback((input: string): boolean => {
    if (!SECRET) return false
    if (input === SECRET) {
      try {
        localStorage.setItem(STORAGE_KEY, input)
      } catch {
        // localStorage unavailable — still allow in-session unlock
      }
      setUnlocked(true)
      setShowModal(false)
      return true
    }
    return false
  }, [])

  const lock = useCallback(() => {
    try {
      localStorage.removeItem(STORAGE_KEY)
    } catch {
      // ignore
    }
    setUnlocked(false)
  }, [])

  const openModal = useCallback(() => setShowModal(true), [])
  const closeModal = useCallback(() => setShowModal(false), [])

  const key: string = unlocked ? (SECRET ?? '') : ''

  return { unlocked, key, showModal, openModal, closeModal, tryUnlock, lock }
}
