import { useEffect, useRef, useState } from 'react'
import CardDeckPicker from './CardDeckPicker'
import MpvFeedback from './MpvFeedback'

type GuessCard = {
  id: string
  theme: string
  prompt: string
  options: string[]
}

type GuessAboutMeGameProps = {
  cards: GuessCard[]
  rounds: number
  onBack: () => void
  onChooseAnother: () => void
  onSessionComplete: () => void
  onSessionRestart: () => void
}

type GuessPhase = 'deck' | 'secret' | 'handoff' | 'guess' | 'reveal' | 'complete'

function drawCards(cards: GuessCard[], rounds: number) {
  const shuffled = [...cards]

  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1))
    ;[shuffled[index], shuffled[randomIndex]] = [shuffled[randomIndex], shuffled[index]]
  }

  return shuffled.slice(0, Math.min(rounds, shuffled.length))
}

export default function GuessAboutMeGame({
  cards,
  rounds,
  onBack,
  onChooseAnother,
  onSessionComplete,
  onSessionRestart,
}: GuessAboutMeGameProps) {
  const [remainingCards, setRemainingCards] = useState(() => drawCards(cards, rounds))
  const [currentCard, setCurrentCard] = useState<GuessCard | null>(null)
  const [roundIndex, setRoundIndex] = useState(0)
  const [phase, setPhase] = useState<GuessPhase>('deck')
  const [secretChoice, setSecretChoice] = useState<number | null>(null)
  const [guessChoice, setGuessChoice] = useState<number | null>(null)
  const [matches, setMatches] = useState(0)
  const headingRef = useRef<HTMLHeadingElement>(null)

  const totalRounds = Math.min(rounds, cards.length)
  const chooser = roundIndex % 2 === 0 ? 'Pessoa 1' : 'Pessoa 2'
  const guesser = roundIndex % 2 === 0 ? 'Pessoa 2' : 'Pessoa 1'
  const isLastRound = roundIndex === totalRounds - 1
  const isMatch = secretChoice !== null && guessChoice === secretChoice

  useEffect(() => {
    if (phase !== 'deck') headingRef.current?.focus()
  }, [phase, roundIndex])

  function revealCard(index: number) {
    const selectedCard = remainingCards[index]
    setRemainingCards((current) => current.filter((_, itemIndex) => itemIndex !== index))
    setCurrentCard(selectedCard)
    setPhase('secret')
  }

  function confirmSecretChoice() {
    if (secretChoice !== null) setPhase('handoff')
  }

  function revealAnswer() {
    if (guessChoice === null) return
    if (guessChoice === secretChoice) setMatches((currentMatches) => currentMatches + 1)
    setPhase('reveal')
  }

  function advanceRound() {
    if (isLastRound) {
      setSecretChoice(null)
      setGuessChoice(null)
      setCurrentCard(null)
      setPhase('complete')
      onSessionComplete()
      return
    }

    setRoundIndex((currentRound) => currentRound + 1)
    setSecretChoice(null)
    setGuessChoice(null)
    setCurrentCard(null)
    setPhase('deck')
  }

  function playAgain() {
    setRemainingCards(drawCards(cards, rounds))
    setCurrentCard(null)
    setRoundIndex(0)
    setSecretChoice(null)
    setGuessChoice(null)
    setMatches(0)
    setPhase('deck')
    onSessionRestart()
  }

  if (phase === 'complete') {
    return (
      <main className="mpv-play" aria-labelledby="guess-complete-title">
        <section className="mpv-complete-card mpv-game-guess-about-me">
          <div className="mpv-complete-symbol" aria-hidden="true">
            ♡
          </div>
          <p className="mpv-eyebrow">JOGO CONCLUÍDO</p>
          <h1 id="guess-complete-title" ref={headingRef} tabIndex={-1}>
            Vocês acertaram {matches} de {totalRounds} palpites.
          </h1>
          <p>
            Mais importante que acertar foi descobrir as respostas. Nenhuma escolha foi salva pelo
            aplicativo.
          </p>

          <MpvFeedback gameId="guess-about-me" onPlayAgain={playAgain} onFinish={onChooseAnother} />
        </section>
      </main>
    )
  }

  const progress = (roundIndex / totalRounds) * 100

  if (phase === 'deck' || !currentCard) {
    return (
      <main className="mpv-play" aria-labelledby="mpv-deck-title">
        <div className="mpv-play-topbar">
          <button className="mpv-back-button" type="button" onClick={onBack}>
            <span aria-hidden="true">←</span> Voltar às instruções
          </button>
          <p>
            Rodada {roundIndex + 1} de {totalRounds}
          </p>
        </div>
        <div
          className="mpv-progress-track"
          role="progressbar"
          aria-label="Progresso do jogo"
          aria-valuemin={0}
          aria-valuemax={totalRounds}
          aria-valuenow={roundIndex}
        >
          <span style={{ width: `${progress}%` }} />
        </div>
        <CardDeckPicker
          availableCards={remainingCards.length}
          round={roundIndex + 1}
          totalRounds={totalRounds}
          onChoose={revealCard}
        />
      </main>
    )
  }

  const currentProgress = ((roundIndex + 1) / totalRounds) * 100

  if (phase === 'handoff') {
    return (
      <main className="mpv-play" aria-labelledby="guess-handoff-title">
        <div className="mpv-play-topbar">
          <button className="mpv-back-button" type="button" onClick={onBack}>
            <span aria-hidden="true">←</span> Sair do jogo
          </button>
          <p>
            Rodada {roundIndex + 1} de {totalRounds}
          </p>
        </div>

        <div
          className="mpv-progress-track"
          role="progressbar"
          aria-label="Progresso do jogo"
          aria-valuemin={1}
          aria-valuemax={totalRounds}
          aria-valuenow={roundIndex + 1}
        >
          <span style={{ width: `${currentProgress}%` }} />
        </div>

        <section className="mpv-handoff-card mpv-game-guess-about-me">
          <div className="mpv-handoff-symbol" aria-hidden="true">
            ⇄
          </div>
          <p className="mpv-eyebrow">RESPOSTA OCULTA</p>
          <h1 id="guess-handoff-title" ref={headingRef} tabIndex={-1}>
            Passe o celular para {guesser}.
          </h1>
          <p>{chooser}, não conte a resposta ainda. A próxima tela é segura para o palpite.</p>
          <button className="mpv-primary-button" type="button" onClick={() => setPhase('guess')}>
            Estou com o celular
            <span aria-hidden="true">→</span>
          </button>
        </section>
      </main>
    )
  }

  const isSecretPhase = phase === 'secret'
  const selectedChoice = isSecretPhase ? secretChoice : guessChoice
  const player = isSecretPhase ? chooser : guesser

  return (
    <main className="mpv-play" aria-labelledby="guess-question-title">
      <div className="mpv-play-topbar">
        <button className="mpv-back-button" type="button" onClick={onBack}>
          <span aria-hidden="true">←</span> Voltar às instruções
        </button>
        <p aria-live="polite">
          Rodada {roundIndex + 1} de {totalRounds}
        </p>
      </div>

      <div
        className="mpv-progress-track"
        role="progressbar"
        aria-label="Progresso do jogo"
        aria-valuemin={1}
        aria-valuemax={totalRounds}
        aria-valuenow={roundIndex + 1}
      >
        <span style={{ width: `${currentProgress}%` }} />
      </div>

      <article className="mpv-question-card mpv-game-guess-about-me">
        <div className="mpv-player-turn">
          <span aria-hidden="true">{isSecretPhase ? '♡' : '?'}</span>
          <p>
            <small>{isSecretPhase ? 'ESCOLHA SECRETA' : 'HORA DO PALPITE'}</small>
            <strong>{player}, esta etapa é sua.</strong>
          </p>
        </div>

        <p className="mpv-eyebrow">{currentCard.theme.toUpperCase()}</p>
        <h1 id="guess-question-title" ref={headingRef} tabIndex={-1}>
          {currentCard.prompt}
        </h1>

        {phase === 'reveal' ? (
          <div className="mpv-reveal" aria-live="polite">
            <div className={`mpv-reveal-message ${isMatch ? 'is-match' : ''}`}>
              <span aria-hidden="true">{isMatch ? '✓' : '♡'}</span>
              <p>
                <strong>{isMatch ? 'Vocês combinaram!' : 'Respostas diferentes!'}</strong>
                {isMatch
                  ? `${guesser} acertou o palpite.`
                  : 'Uma boa chance para contar o motivo da escolha.'}
              </p>
            </div>

            <dl className="mpv-answer-reveal">
              <div>
                <dt>Resposta de {chooser}</dt>
                <dd>{currentCard.options[secretChoice!]}</dd>
              </div>
              <div>
                <dt>Palpite de {guesser}</dt>
                <dd>{currentCard.options[guessChoice!]}</dd>
              </div>
            </dl>

            <button className="mpv-primary-button" type="button" onClick={advanceRound}>
              {isLastRound ? 'Concluir jogo' : 'Escolher próxima carta'}
              <span aria-hidden="true">→</span>
            </button>
          </div>
        ) : (
          <>
            <div className="mpv-option-grid" role="group" aria-label="Opções de resposta">
              {currentCard.options.map((option, index) => (
                <button
                  className={`mpv-option-button ${selectedChoice === index ? 'is-selected' : ''}`}
                  key={option}
                  type="button"
                  aria-pressed={selectedChoice === index}
                  onClick={() => (isSecretPhase ? setSecretChoice(index) : setGuessChoice(index))}
                >
                  <span>{String.fromCharCode(65 + index)}</span>
                  {option}
                </button>
              ))}
            </div>

            <p className="mpv-choice-privacy">
              {isSecretPhase
                ? 'A resposta será escondida antes de passar o celular.'
                : `Qual opção você acha que ${chooser} escolheu?`}
            </p>

            <button
              className="mpv-primary-button mpv-choice-confirm"
              type="button"
              disabled={selectedChoice === null}
              onClick={isSecretPhase ? confirmSecretChoice : revealAnswer}
            >
              {isSecretPhase ? 'Ocultar e passar o celular' : 'Revelar resposta'}
              <span aria-hidden="true">→</span>
            </button>
            <button
              className="mpv-skip-button mpv-choice-skip"
              type="button"
              onClick={advanceRound}
            >
              Pular esta rodada
            </button>
          </>
        )}
      </article>
    </main>
  )
}
