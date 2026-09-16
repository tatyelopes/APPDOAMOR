import { FormEvent, useState } from 'react'

type GameId = 'discovery-together' | 'guess-about-me'
type SignalValue = 'yes' | 'no'

type FeedbackAnswers = {
  clarity: SignalValue | ''
  connection: SignalValue | ''
  replayIntent: SignalValue | ''
}

type MpvFeedbackProps = {
  gameId: GameId
  onPlayAgain: () => void
  onFinish: () => void
}

const STORAGE_KEY = 'mpv.feedback.v1'

const questions: {
  key: keyof FeedbackAnswers
  label: string
}[] = [
  { key: 'clarity', label: 'Foi fácil entender como jogar?' },
  {
    key: 'connection',
    label: 'Vocês descobriram algo ou se sentiram mais conectados?',
  },
  { key: 'replayIntent', label: 'Jogariam novamente?' },
]

const initialAnswers: FeedbackAnswers = {
  clarity: '',
  connection: '',
  replayIntent: '',
}

export default function MpvFeedback({ gameId, onPlayAgain, onFinish }: MpvFeedbackProps) {
  const [answers, setAnswers] = useState<FeedbackAnswers>(initialAnswers)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')

  const isComplete = Object.values(answers).every(Boolean)

  function updateAnswer(key: keyof FeedbackAnswers, value: SignalValue) {
    setAnswers((currentAnswers) => ({ ...currentAnswers, [key]: value }))
    setError('')
  }

  function submitFeedback(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!isComplete) {
      return
    }

    const record = {
      completedGame: gameId,
      clarity: answers.clarity,
      connection: answers.connection,
      replayIntent: answers.replayIntent,
    }

    try {
      const storedValue = localStorage.getItem(STORAGE_KEY)
      const parsedValue = storedValue ? JSON.parse(storedValue) : []
      const previousRecords = Array.isArray(parsedValue) ? parsedValue : []
      localStorage.setItem(STORAGE_KEY, JSON.stringify([...previousRecords, record]))
      setSubmitted(true)
    } catch {
      setError('Não foi possível guardar o feedback neste aparelho. Vocês podem tentar novamente.')
    }
  }

  if (submitted) {
    return (
      <section className="mpv-feedback-success" aria-labelledby="feedback-success-title">
        <span aria-hidden="true">✓</span>
        <div>
          <h2 id="feedback-success-title">Obrigado pelo feedback!</h2>
          <p>Os três sinais foram registrados neste aparelho sem nomes ou respostas das rodadas.</p>
        </div>

        <div className="mpv-complete-actions">
          <button className="mpv-primary-button" type="button" onClick={onPlayAgain}>
            Jogar novamente
          </button>
          <button className="mpv-secondary-button" type="button" onClick={onFinish}>
            Encerrar
          </button>
        </div>
      </section>
    )
  }

  return (
    <form className="mpv-feedback-form" onSubmit={submitFeedback}>
      <div className="mpv-feedback-heading">
        <p className="mpv-eyebrow">TRÊS SINAIS RÁPIDOS</p>
        <h2>Como foi jogar juntos?</h2>
        <p>O conteúdo da conversa não faz parte deste feedback.</p>
      </div>

      <div className="mpv-feedback-questions">
        {questions.map((question, index) => (
          <fieldset key={question.key}>
            <legend>
              <span>{index + 1}</span>
              {question.label}
            </legend>
            <div className="mpv-signal-options">
              {(['yes', 'no'] as const).map((value) => (
                <label className={answers[question.key] === value ? 'is-selected' : ''} key={value}>
                  <input
                    type="radio"
                    name={question.key}
                    value={value}
                    checked={answers[question.key] === value}
                    onChange={() => updateAnswer(question.key, value)}
                  />
                  <span>{value === 'yes' ? 'Sim' : 'Não'}</span>
                </label>
              ))}
            </div>
          </fieldset>
        ))}
      </div>

      {error && (
        <p className="mpv-feedback-error" role="alert">
          {error}
        </p>
      )}

      <button
        className="mpv-primary-button mpv-feedback-submit"
        type="submit"
        disabled={!isComplete}
      >
        Enviar feedback
        <span aria-hidden="true">→</span>
      </button>
      <button className="mpv-feedback-skip" type="button" onClick={onFinish}>
        Encerrar sem enviar
      </button>
    </form>
  )
}
