import { useEffect, useRef, useState } from 'react'
import MpvFeedback from './MpvFeedback'

type DiscoveryCard = {
  id: string
  theme: string
  prompt: string
}

type DiscoveryTogetherGameProps = {
  cards: DiscoveryCard[]
  rounds: number
  onBack: () => void
  onChooseAnother: () => void
  onSessionComplete: () => void
  onSessionRestart: () => void
}

function drawCards(cards: DiscoveryCard[], rounds: number) {
  const shuffled = [...cards]

  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1))
    ;[shuffled[index], shuffled[randomIndex]] = [shuffled[randomIndex], shuffled[index]]
  }

  return shuffled.slice(0, Math.min(rounds, shuffled.length))
}

export default function DiscoveryTogetherGame({
  cards,
  rounds,
  onBack,
  onChooseAnother,
  onSessionComplete,
  onSessionRestart,
}: DiscoveryTogetherGameProps) {
  const [sessionCards, setSessionCards] = useState(() => drawCards(cards, rounds))
  const [roundIndex, setRoundIndex] = useState(0)
  const [completed, setCompleted] = useState(false)
  const headingRef = useRef<HTMLHeadingElement>(null)

  const currentCard = sessionCards[roundIndex]
  const isLastRound = roundIndex === sessionCards.length - 1

  useEffect(() => {
    headingRef.current?.focus()
  }, [completed, roundIndex])

  function advanceRound() {
    if (isLastRound) {
      setCompleted(true)
      onSessionComplete()
      return
    }

    setRoundIndex((currentRound) => currentRound + 1)
  }

  function playAgain() {
    setSessionCards(drawCards(cards, rounds))
    setRoundIndex(0)
    setCompleted(false)
    onSessionRestart()
  }

  if (completed) {
    return (
      <main className="mpv-play" aria-labelledby="discovery-complete-title">
        <section className="mpv-complete-card mpv-game-discovery-together">
          <div className="mpv-complete-symbol" aria-hidden="true">
            ♡
          </div>
          <p className="mpv-eyebrow">MOMENTO CONCLUÍDO</p>
          <h1 id="discovery-complete-title" ref={headingRef} tabIndex={-1}>
            Três perguntas. Um pouco mais de vocês.
          </h1>
          <p>
            Obrigado por reservarem este momento juntos. As respostas ficaram apenas entre vocês e
            não foram salvas.
          </p>

          <MpvFeedback
            gameId="discovery-together"
            onPlayAgain={playAgain}
            onFinish={onChooseAnother}
          />
        </section>
      </main>
    )
  }

  if (!currentCard) {
    return null
  }

  const progress = ((roundIndex + 1) / sessionCards.length) * 100

  return (
    <main className="mpv-play" aria-labelledby="discovery-question-title">
      <div className="mpv-play-topbar">
        <button className="mpv-back-button" type="button" onClick={onBack}>
          <span aria-hidden="true">←</span> Voltar às instruções
        </button>
        <p aria-live="polite">
          Pergunta {roundIndex + 1} de {sessionCards.length}
        </p>
      </div>

      <div
        className="mpv-progress-track"
        role="progressbar"
        aria-label="Progresso do jogo"
        aria-valuemin={1}
        aria-valuemax={sessionCards.length}
        aria-valuenow={roundIndex + 1}
      >
        <span style={{ width: `${progress}%` }} />
      </div>

      <article className="mpv-question-card mpv-game-discovery-together">
        <div className="mpv-question-mark" aria-hidden="true">
          “
        </div>
        <p className="mpv-eyebrow">{currentCard.theme.toUpperCase()}</p>
        <h1 id="discovery-question-title" ref={headingRef} tabIndex={-1}>
          {currentCard.prompt}
        </h1>

        <div className="mpv-speaking-guide">
          <span aria-hidden="true">1 + 2</span>
          <p>
            <strong>Respondam um de cada vez.</strong>A primeira pessoa fala em voz alta. Depois, é
            a vez da outra.
          </p>
        </div>

        <div className="mpv-question-actions">
          <button className="mpv-primary-button" type="button" onClick={advanceRound}>
            {isLastRound ? 'Concluir jogo' : 'Próxima pergunta'}
            <span aria-hidden="true">→</span>
          </button>
          <button className="mpv-skip-button" type="button" onClick={advanceRound}>
            Pular esta pergunta
          </button>
        </div>
      </article>
    </main>
  )
}
