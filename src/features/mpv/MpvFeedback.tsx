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

function createSubmissionId() {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}-${Math.random().toString(36).slice(2)}`
}

export default function MpvFeedback({ gameId, onPlayAgain, onFinish }: MpvFeedbackProps) {
  const [answers, setAnswers] = useState<FeedbackAnswers>(initialAnswers)
  const [suggestion, setSuggestion] = useState('')
  const [submissionId] = useState(createSubmissionId)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')

  const isComplete = Object.values(answers).every(Boolean)

  function updateAnswer(key: keyof FeedbackAnswers, value: SignalValue) {
    setAnswers((currentAnswers) => ({ ...currentAnswers, [key]: value }))
    setError('')
  }

  async function submitFeedback(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!isComplete || submitting) {
      return
    }

    setSubmitting(true)
    setError('')
    try {
      const response = await fetch('/api/mpv/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          submissionId,
          gameId,
          clarity: answers.clarity,
          connection: answers.connection,
          replayIntent: answers.replayIntent,
          suggestion: suggestion.trim(),
        }),
      })
      const result = (await response.json().catch(() => ({}))) as { error?: string }
      if (!response.ok) {
        throw new Error(result.error || 'Não foi possível enviar o feedback.')
      }
      setSubmitted(true)
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : 'Não foi possível enviar o feedback. Vocês podem tentar novamente.',
      )
    } finally {
      setSubmitting(false)
    }
  }

  if (submitted) {
    return (
      <section className="mpv-feedback-success" aria-labelledby="feedback-success-title">
        <span aria-hidden="true">✓</span>
        <div>
          <h2 id="feedback-success-title">Obrigado pelo feedback!</h2>
          <p>O feedback foi enviado sem nomes ou respostas das rodadas.</p>
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

      <div className="mpv-feedback-suggestion">
        <label htmlFor="mpv-feedback-suggestion">
          Sugestões de melhoria <span>(opcional)</span>
        </label>
        <p id="mpv-feedback-suggestion-hint">
          Conte o que poderia melhorar. Não inclua nomes, contatos ou detalhes da conversa.
        </p>
        <textarea
          id="mpv-feedback-suggestion"
          name="suggestion"
          rows={4}
          maxLength={500}
          value={suggestion}
          aria-describedby="mpv-feedback-suggestion-hint mpv-feedback-suggestion-count"
          placeholder="Ex.: instruções mais curtas ou mais opções de perguntas"
          onChange={(event) => {
            setSuggestion(event.target.value)
            setError('')
          }}
        />
        <output id="mpv-feedback-suggestion-count" htmlFor="mpv-feedback-suggestion">
          {suggestion.length}/500
        </output>
      </div>

      {error && (
        <p className="mpv-feedback-error" role="alert">
          {error}
        </p>
      )}

      <button
        className="mpv-primary-button mpv-feedback-submit"
        type="submit"
        disabled={!isComplete || submitting}
      >
        {submitting ? 'Enviando…' : 'Enviar feedback'}
        <span aria-hidden="true">→</span>
      </button>
      <button className="mpv-feedback-skip" type="button" onClick={onFinish}>
        Encerrar sem enviar
      </button>
    </form>
  )
}
