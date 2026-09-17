import { useEffect, useMemo, useRef, useState } from 'react'
import loveStyleSample from '../game/love-style-sample.json'
import CardDeckPicker from './CardDeckPicker'
import MpvFeedback from './MpvFeedback'

type LoveQuestion = (typeof loveStyleSample.questions)[number]

type LoveStyleSampleProps = {
  onBack: () => void
  onChooseAnother: () => void
  onSessionComplete: () => void
  onSessionRestart: () => void
}

function drawQuestions() {
  const shuffled = [...loveStyleSample.questions]
  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1))
    ;[shuffled[index], shuffled[randomIndex]] = [shuffled[randomIndex], shuffled[index]]
  }
  return shuffled.slice(0, loveStyleSample.questionsPerSession)
}

function emptyScores() {
  return Object.fromEntries(loveStyleSample.categories.map((category) => [category.id, 0]))
}

export default function LoveStyleSample({
  onBack,
  onChooseAnother,
  onSessionComplete,
  onSessionRestart,
}: LoveStyleSampleProps) {
  const [remainingQuestions, setRemainingQuestions] = useState<LoveQuestion[]>(drawQuestions)
  const [currentQuestion, setCurrentQuestion] = useState<LoveQuestion | null>(null)
  const [roundIndex, setRoundIndex] = useState(0)
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [scores, setScores] = useState<Record<string, number>>(emptyScores)
  const [completed, setCompleted] = useState(false)
  const headingRef = useRef<HTMLHeadingElement>(null)

  const rankedCategories = useMemo(
    () =>
      loveStyleSample.categories
        .map((category) => ({ ...category, score: scores[category.id] ?? 0 }))
        .sort((first, second) => second.score - first.score),
    [scores],
  )

  useEffect(() => {
    if (currentQuestion || completed) headingRef.current?.focus()
  }, [completed, currentQuestion])

  function revealQuestion(index: number) {
    const question = remainingQuestions[index]
    setRemainingQuestions((current) => current.filter((_, itemIndex) => itemIndex !== index))
    setCurrentQuestion(question)
    setSelectedCategory(null)
  }

  function confirmAnswer() {
    if (!selectedCategory) return
    setScores((current) => ({
      ...current,
      [selectedCategory]: (current[selectedCategory] ?? 0) + 1,
    }))

    if (roundIndex === loveStyleSample.questionsPerSession - 1) {
      setCompleted(true)
      onSessionComplete()
      return
    }

    setRoundIndex((current) => current + 1)
    setCurrentQuestion(null)
    setSelectedCategory(null)
  }

  function playAgain() {
    setRemainingQuestions(drawQuestions())
    setCurrentQuestion(null)
    setRoundIndex(0)
    setSelectedCategory(null)
    setScores(emptyScores())
    setCompleted(false)
    onSessionRestart()
  }

  if (completed) {
    const primary = rankedCategories[0]
    const secondary = rankedCategories[1]

    return (
      <main className="mpv-play" aria-labelledby="love-result-title">
        <section className="mpv-complete-card mpv-game-love-style-sample">
          <div className="mpv-complete-symbol" aria-hidden="true">
            ♡
          </div>
          <p className="mpv-eyebrow">SEU RESULTADO INDICATIVO</p>
          <h1 id="love-result-title" ref={headingRef} tabIndex={-1}>
            {primary.label}
          </h1>
          <p>{primary.shortDescription}</p>

          <div className="mpv-love-secondary">
            <small>OUTRA PREFERÊNCIA FORTE</small>
            <strong>{secondary.label}</strong>
            <p>{secondary.shortDescription}</p>
          </div>

          <div className="mpv-love-score-list" aria-label="Distribuição das preferências">
            {rankedCategories.map((category) => (
              <div className="mpv-love-score" key={category.id}>
                <div>
                  <span>{category.label}</span>
                  <strong>
                    {category.score}/{loveStyleSample.questionsPerSession}
                  </strong>
                </div>
                <span aria-hidden="true">
                  <i
                    style={{
                      width: `${(category.score / loveStyleSample.questionsPerSession) * 100}%`,
                    }}
                  />
                </span>
              </div>
            ))}
          </div>

          <p className="mpv-love-disclaimer">
            Esta é uma amostra autoral para reflexão, sem vínculo com testes oficiais. Ela não é
            diagnóstico e suas respostas não foram salvas.
          </p>

          <MpvFeedback
            gameId="love-style-sample"
            onPlayAgain={playAgain}
            onFinish={onChooseAnother}
          />
        </section>
      </main>
    )
  }

  const progress = (roundIndex / loveStyleSample.questionsPerSession) * 100

  if (!currentQuestion) {
    return (
      <main className="mpv-play" aria-labelledby="mpv-deck-title">
        <div className="mpv-play-topbar">
          <button className="mpv-back-button" type="button" onClick={onBack}>
            <span aria-hidden="true">←</span> Voltar às instruções
          </button>
          <p>
            Pergunta {roundIndex + 1} de {loveStyleSample.questionsPerSession}
          </p>
        </div>
        <div
          className="mpv-progress-track"
          role="progressbar"
          aria-label="Progresso da amostra"
          aria-valuemin={0}
          aria-valuemax={loveStyleSample.questionsPerSession}
          aria-valuenow={roundIndex}
        >
          <span style={{ width: `${progress}%` }} />
        </div>
        <CardDeckPicker
          availableCards={remainingQuestions.length}
          round={roundIndex + 1}
          totalRounds={loveStyleSample.questionsPerSession}
          onChoose={revealQuestion}
        />
      </main>
    )
  }

  return (
    <main className="mpv-play" aria-labelledby="love-question-title">
      <div className="mpv-play-topbar">
        <button className="mpv-back-button" type="button" onClick={onBack}>
          <span aria-hidden="true">←</span> Voltar às instruções
        </button>
        <p aria-live="polite">
          Pergunta {roundIndex + 1} de {loveStyleSample.questionsPerSession}
        </p>
      </div>

      <div
        className="mpv-progress-track"
        role="progressbar"
        aria-label="Progresso da amostra"
        aria-valuemin={1}
        aria-valuemax={loveStyleSample.questionsPerSession}
        aria-valuenow={roundIndex + 1}
      >
        <span
          style={{ width: `${((roundIndex + 1) / loveStyleSample.questionsPerSession) * 100}%` }}
        />
      </div>

      <article className="mpv-question-card mpv-game-love-style-sample">
        <div className="mpv-question-mark" aria-hidden="true">
          ♡
        </div>
        <p className="mpv-eyebrow">COMO VOCÊ PREFERE RECEBER CARINHO?</p>
        <h1 id="love-question-title" ref={headingRef} tabIndex={-1}>
          {currentQuestion.prompt}
        </h1>

        <div className="mpv-love-options" role="group" aria-label="Escolha uma resposta">
          {currentQuestion.options.map((option, index) => (
            <button
              className={`mpv-option-button ${selectedCategory === option.categoryId ? 'is-selected' : ''}`}
              key={option.categoryId}
              type="button"
              aria-pressed={selectedCategory === option.categoryId}
              onClick={() => setSelectedCategory(option.categoryId)}
            >
              <span>{String.fromCharCode(65 + index)}</span>
              {option.label}
            </button>
          ))}
        </div>

        <p className="mpv-choice-privacy">Escolha a opção que mais combina com você hoje.</p>
        <button
          className="mpv-primary-button mpv-choice-confirm"
          type="button"
          disabled={!selectedCategory}
          onClick={confirmAnswer}
        >
          {roundIndex === loveStyleSample.questionsPerSession - 1
            ? 'Ver meu resultado'
            : 'Escolher próxima carta'}
          <span aria-hidden="true">→</span>
        </button>
      </article>
    </main>
  )
}
