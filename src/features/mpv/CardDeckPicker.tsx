import { useEffect, useRef, useState } from 'react'

type CardDeckPickerProps = {
  availableCards: number
  round: number
  totalRounds: number
  onChoose: (index: number) => void
}

export default function CardDeckPicker({
  availableCards,
  round,
  totalRounds,
  onChoose,
}: CardDeckPickerProps) {
  const [openingIndex, setOpeningIndex] = useState<number | null>(null)
  const timerRef = useRef<number | null>(null)
  const headingRef = useRef<HTMLHeadingElement>(null)

  useEffect(() => {
    headingRef.current?.focus()
    return () => {
      if (timerRef.current !== null) window.clearTimeout(timerRef.current)
    }
  }, [])

  function chooseCard(index: number) {
    if (openingIndex !== null) return
    setOpeningIndex(index)
    timerRef.current = window.setTimeout(() => onChoose(index), 360)
  }

  return (
    <section className="mpv-deck-picker" aria-labelledby="mpv-deck-title">
      <p className="mpv-eyebrow">ESCOLHA SUA CARTA</p>
      <h1 id="mpv-deck-title" ref={headingRef} tabIndex={-1}>
        Qual carta chama você?
      </h1>
      <p className="mpv-deck-hint">Toque em uma carta fechada para revelar a próxima pergunta.</p>

      <div className={`mpv-card-deck mpv-card-deck-${availableCards}`}>
        {Array.from({ length: availableCards }, (_, index) => (
          <button
            className={`mpv-facedown-card ${openingIndex === index ? 'is-opening' : ''}`}
            key={`${round}-${index}`}
            type="button"
            aria-label={`Abrir carta ${index + 1} de ${availableCards}`}
            disabled={openingIndex !== null}
            onClick={() => chooseCard(index)}
          >
            <span className="mpv-card-back-frame" aria-hidden="true">
              <span className="mpv-card-back-orbit" />
              <span className="mpv-card-back-heart">♡</span>
              <span className="mpv-card-back-stars">✦ · ✦</span>
            </span>
          </button>
        ))}
      </div>

      <p className="mpv-deck-progress" aria-live="polite">
        Carta {round} de {totalRounds}
      </p>
    </section>
  )
}
