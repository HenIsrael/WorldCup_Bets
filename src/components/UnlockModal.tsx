import { useEffect, useRef, useState } from 'react'

interface UnlockModalProps {
  onUnlock: (key: string) => boolean
  onClose: () => void
}

export default function UnlockModal({ onUnlock, onClose }: UnlockModalProps) {
  const [value, setValue] = useState('')
  const [error, setError] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [onClose])

  const submit = () => {
    const ok = onUnlock(value)
    if (!ok) {
      setError(true)
      setValue('')
      inputRef.current?.focus()
    }
  }

  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true" aria-label="Unlock Bet button">
      <div className="modal">
        <button className="modal__close" onClick={onClose} aria-label="Close">✕</button>
        <p className="modal__icon" aria-hidden="true">🔒</p>
        <h2 className="modal__title">Enter secret key</h2>
        <p className="modal__desc">The Bet feature is protected. Enter your key to unlock it.</p>
        <input
          ref={inputRef}
          className={`modal__input${error ? ' modal__input--error' : ''}`}
          type="password"
          placeholder="Secret key…"
          value={value}
          onChange={(e) => { setValue(e.target.value); setError(false) }}
          onKeyDown={(e) => { if (e.key === 'Enter') submit() }}
          aria-invalid={error}
        />
        {error && <p className="modal__error">Wrong key, try again.</p>}
        <button className="btn modal__submit" onClick={submit}>
          Unlock
        </button>
      </div>
    </div>
  )
}
