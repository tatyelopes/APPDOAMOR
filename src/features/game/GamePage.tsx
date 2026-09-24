import { useState } from 'react'
import activities from './activities.json'
import './game.css'

type Mode = 'questions' | 'multipleChoice' | 'challenges' | 'mixed'
type Intensity = 'light' | 'deep'
type GameCard = { text: string; challenge: boolean; options?: string[] }
const multipleChoiceOptions = ['Uma lembrança', 'Um desejo', 'Uma dúvida', 'Um pequeno gesto']
const deepMultipleChoiceOptions = [
  'Um sentimento',
  'Uma necessidade',
  'Um limite',
  'Um sonho em comum',
]
export function GamePage({
  players,
  onBack,
  track,
  initialStarted = false,
}: {
  players: [string, string]
  onBack: () => void
  track: (name: string, properties?: Record<string, string>) => void
  initialStarted?: boolean
}) {
  const [theme, setTheme] = useState(activities[0].theme)
  const [intensity, setIntensity] = useState<Intensity>('light')
  const [mode, setMode] = useState<Mode>('questions')
  const [started, setStarted] = useState(initialStarted)
  const [index, setIndex] = useState(0)
  const [player, setPlayer] = useState(0)
  const [draft, setDraft] = useState('')
  const [results, setResults] = useState<Record<string, string>>({})
  const [finished, setFinished] = useState(false)
  const selected = activities.find((item) => item.theme === theme)!
  const activityIndex = intensity === 'light' ? 0 : 1
  const cards: GameCard[] =
    mode === 'multipleChoice'
      ? [
          {
            text:
              intensity === 'light'
                ? `Ao conversar sobre ${theme.toLowerCase()}, qual jeito de começar você prefere?`
                : `Sobre ${theme.toLowerCase()}, o que vocês gostariam de compreender melhor?`,
            challenge: false,
            options: intensity === 'light' ? multipleChoiceOptions : deepMultipleChoiceOptions,
          },
        ]
      : [
          ...(mode !== 'challenges'
            ? [{ text: selected.questions[activityIndex], challenge: false }]
            : []),
          ...(mode !== 'questions'
            ? [{ text: selected.challenges[activityIndex], challenge: true }]
            : []),
        ]
  const card = cards[index]
  const both = Boolean(results[`${index}-0`] && results[`${index}-1`])
  function advance() {
    if (index === cards.length - 1) {
      setFinished(true)
      track('question_session_completed', { mode, theme, intensity })
    } else setIndex(index + 1)
    setPlayer(0)
    setDraft('')
  }
  function record(value: string) {
    setResults((previous) => ({ ...previous, [`${index}-${player}`]: value }))
    setDraft('')
    setPlayer(1)
  }
  return (
    <section className="page game fade-in">
      <button className="back" onClick={onBack}>
        ← Sair do jogo
      </button>
      {!started ? (
        <div className="game-setup">
          <div className="eyebrow">UM MOMENTO A DOIS</div>
          <h1>Como vocês querem jogar?</h1>
          <p>
            Joguem juntos neste dispositivo. As respostas ficam apenas nesta sessão e aparecem após
            os dois participarem.
          </p>
          <div className="theme-picker">
            <div className="theme-picker-head">
              <span>Escolham um tema</span>
              <small>{theme}</small>
            </div>
            <div className="theme-options" role="listbox" aria-label="Tema do jogo">
              {activities.map((item) => (
                <button
                  type="button"
                  role="option"
                  aria-selected={theme === item.theme}
                  className={`theme-chip ${theme === item.theme ? 'active' : ''}`}
                  key={item.theme}
                  onClick={() => setTheme(item.theme)}
                >
                  <span>♥</span>
                  {item.theme}
                </button>
              ))}
            </div>
          </div>
          <fieldset className="intensity-picker">
            <legend>Nível da pergunta</legend>
            {(
              [
                ['light', 'Leve', 'Para começar com naturalidade e descontração.'],
                ['deep', 'Profunda', 'Para conversas mais íntimas e reflexivas.'],
              ] as const
            ).map(([value, title, description]) => (
              <label
                className={`intensity-option ${intensity === value ? 'active' : ''}`}
                key={value}
              >
                <input
                  type="radio"
                  name="question-intensity"
                  value={value}
                  aria-label={`Nível: ${title}`}
                  checked={intensity === value}
                  onChange={() => setIntensity(value)}
                />
                <span>
                  <strong>{title}</strong>
                  <small>{description}</small>
                </span>
              </label>
            ))}
          </fieldset>
          <fieldset>
            <legend>Formato do jogo</legend>
            {(
              [
                ['questions', 'Perguntas discursivas', 'Respondam com suas próprias palavras.'],
                [
                  'multipleChoice',
                  'Múltipla escolha',
                  'Escolham entre respostas prontas e comparem depois.',
                ],
                ['challenges', 'Desafios', 'Cumpram pequenas atividades juntos.'],
                ['mixed', 'Perguntas e desafios', 'Alternem conversas e ações.'],
              ] as const
            ).map(([value, title, description]) => (
              <label className={`game-mode ${mode === value ? 'active' : ''}`} key={value}>
                <input
                  type="radio"
                  name="game-mode"
                  value={value}
                  aria-label={`Formato: ${title}`}
                  checked={mode === value}
                  onChange={() => setMode(value)}
                />
                <span>
                  <strong>{title}</strong>
                  <small>{description}</small>
                </span>
              </label>
            ))}
          </fieldset>
          <p>
            Vocês podem pular qualquer atividade. Nos desafios, combinem antes o que é confortável
            para os dois.
          </p>
          <button
            className="primary"
            onClick={() => {
              setStarted(true)
              track('question_session_started', { mode, theme, intensity })
            }}
          >
            Começar jogo →
          </button>
        </div>
      ) : finished ? (
        <div className="game-setup">
          <h1>Momento concluído!</h1>
          <p>
            {cards.filter((_, i) => results[`${i}-0`] && results[`${i}-1`]).length} de{' '}
            {cards.length} atividades com participação dos dois.
          </p>
          <button
            className="primary"
            onClick={() => {
              setStarted(false)
              setFinished(false)
              setIndex(0)
              setPlayer(0)
              setResults({})
              setDraft('')
            }}
          >
            Jogar novamente
          </button>
        </div>
      ) : (
        <>
          <div className="game-head">
            <h1>{card.challenge ? 'Desafio a dois' : 'Conversem com calma'}</h1>
            <span>
              {index + 1} / {cards.length}
            </span>
          </div>
          <article className="question-card">
            <div className="question-tags">
              <span className="pill">{theme}</span>
              <span className="pill intensity-tag">
                {intensity === 'light' ? 'Leve' : 'Profunda'}
              </span>
            </div>
            <h2>{card.text}</h2>
          </article>
          {both ? (
            <div aria-live="polite">
              <h2>{card.challenge ? 'Desafio cumprido pelos dois!' : 'As respostas de vocês'}</h2>
              <div className="reveal-grid">
                {players.map((name, i) => (
                  <article key={i}>
                    <small>{name}</small>
                    <p className="game-answer">{results[`${index}-${i}`]}</p>
                  </article>
                ))}
              </div>
              <button className="primary" onClick={advance}>
                {index === cards.length - 1 ? 'Concluir sessão' : 'Próxima atividade →'}
              </button>
            </div>
          ) : (
            <div className="answer-form">
              <h2>Vez de {players[player]}</h2>
              {card.challenge ? (
                <button className="primary" onClick={() => record('Cumpri o desafio')}>
                  Cumpri o desafio ✓
                </button>
              ) : (
                <form
                  onSubmit={(event) => {
                    event.preventDefault()
                    if (draft.trim()) record(draft.trim())
                  }}
                >
                  {card.options ? (
                    <>
                      <span className="choice-answer-label">Escolha uma opção</span>
                      <div className="choice-answer-grid" role="radiogroup" aria-label="Respostas">
                        {card.options.map((option) => (
                          <button
                            type="button"
                            role="radio"
                            aria-checked={draft === option}
                            className={draft === option ? 'active' : ''}
                            key={option}
                            onClick={() => setDraft(option)}
                          >
                            <span>{draft === option ? '✓' : '○'}</span>
                            {option}
                          </button>
                        ))}
                      </div>
                    </>
                  ) : (
                    <>
                      <label htmlFor="game-answer">Sua resposta</label>
                      <textarea
                        id="game-answer"
                        maxLength={500}
                        value={draft}
                        onChange={(event) => setDraft(event.target.value)}
                        placeholder="Escreva com suas próprias palavras…"
                        required
                      />
                      <small>{draft.length}/500</small>
                    </>
                  )}
                  <button className="primary" disabled={!draft.trim()}>
                    Confirmar resposta
                  </button>
                </form>
              )}
              {player === 1 && (
                <p>
                  Passe o dispositivo para {players[1]}. A primeira participação está registrada.
                </p>
              )}
            </div>
          )}
          {!both && (
            <button className="text-button" onClick={advance}>
              Pular atividade →
            </button>
          )}
        </>
      )}
    </section>
  )
}
