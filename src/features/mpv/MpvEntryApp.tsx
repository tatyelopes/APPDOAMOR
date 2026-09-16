import { useEffect, useMemo, useState } from 'react'
import cardBank from '../game/mpv-cards.json'
import DiscoveryTogetherGame from './DiscoveryTogetherGame'
import GuessAboutMeGame from './GuessAboutMeGame'
import './mpv-entry.css'

type GameId = 'discovery-together' | 'guess-about-me'

type GamePresentation = {
  id: GameId
  slug: string
  eyebrow: string
  title: string
  description: string
  promise: string
  duration: string
  symbol: string
  steps: string[]
}

const games: GamePresentation[] = [
  {
    id: 'discovery-together',
    slug: 'descoberta-a-dois',
    eyebrow: 'CONVERSA LEVE',
    title: 'Descoberta a Dois',
    description: 'Perguntas simples para lembrar, imaginar e descobrir algo novo juntos.',
    promise: 'Respondam em voz alta e conversem sem pressa.',
    duration: '3 perguntas · cerca de 4 min',
    symbol: '“',
    steps: [
      'Leiam uma pergunta juntos.',
      'Cada pessoa responde em voz alta.',
      'Conversem e avancem quando quiserem.',
    ],
  },
  {
    id: 'guess-about-me',
    slug: 'adivinhe-de-mim',
    eyebrow: 'PALPITE E REVELAÇÃO',
    title: 'Adivinhe de Mim',
    description: 'Uma pessoa escolhe em segredo e a outra tenta adivinhar a resposta.',
    promise: 'Passem o celular, façam o palpite e descubram se acertaram.',
    duration: '3 rodadas · cerca de 5 min',
    symbol: '?',
    steps: [
      'Uma pessoa escolhe uma opção em segredo.',
      'Passem o celular para a outra pessoa adivinhar.',
      'Revelem a resposta e alternem os papéis.',
    ],
  },
]

export default function MpvEntryApp() {
  const [selectedGame, setSelectedGame] = useState<GamePresentation | null>(null)
  const [activeGame, setActiveGame] = useState<GameId | null>(null)
  const [sessionInProgress, setSessionInProgress] = useState(false)

  const cardCounts = useMemo(
    () =>
      Object.fromEntries(cardBank.games.map((game) => [game.id, game.cards.length])) as Record<
        GameId,
        number
      >,
    [],
  )

  useEffect(() => {
    document.title = 'Um momento a dois'
  }, [])

  function chooseGame(game: GamePresentation) {
    setSelectedGame(game)
    setActiveGame(null)
    setSessionInProgress(false)
  }

  function returnToGames() {
    if (sessionInProgress && !window.confirm('Encerrar esta sessão?')) {
      return
    }

    setSelectedGame(null)
    setActiveGame(null)
    setSessionInProgress(false)
  }

  function returnToInstructions() {
    if (sessionInProgress && !window.confirm('Encerrar esta sessão?')) {
      return
    }

    setActiveGame(null)
    setSessionInProgress(false)
  }

  function startGame(gameId: GameId) {
    setActiveGame(gameId)
    setSessionInProgress(true)
  }

  const discoveryCards =
    cardBank.games.find((game) => game.id === 'discovery-together')?.cards ?? []
  const guessCards = cardBank.games.flatMap((game) =>
    game.id === 'guess-about-me'
      ? game.cards.flatMap((card) =>
          'options' in card
            ? [
                {
                  id: card.id,
                  theme: card.theme,
                  prompt: card.prompt,
                  options: card.options,
                },
              ]
            : [],
        )
      : [],
  )

  return (
    <div className="mpv-entry-shell">
      <header className="mpv-entry-header">
        <button
          className="mpv-logo-button"
          type="button"
          aria-label="Voltar à seleção de jogos"
          onClick={returnToGames}
        >
          <span aria-hidden="true">♡</span>
        </button>
        <span className="mpv-test-badge">TESTE COM CASAIS</span>
      </header>

      {selectedGame?.id === 'discovery-together' && activeGame === 'discovery-together' ? (
        <DiscoveryTogetherGame
          cards={discoveryCards}
          rounds={cardBank.roundsPerSession}
          onBack={returnToInstructions}
          onChooseAnother={returnToGames}
          onSessionComplete={() => setSessionInProgress(false)}
          onSessionRestart={() => setSessionInProgress(true)}
        />
      ) : selectedGame?.id === 'guess-about-me' && activeGame === 'guess-about-me' ? (
        <GuessAboutMeGame
          cards={guessCards}
          rounds={cardBank.roundsPerSession}
          onBack={returnToInstructions}
          onChooseAnother={returnToGames}
          onSessionComplete={() => setSessionInProgress(false)}
          onSessionRestart={() => setSessionInProgress(true)}
        />
      ) : selectedGame ? (
        <main className="mpv-instructions" aria-labelledby="selected-game-title">
          <button className="mpv-back-button" type="button" onClick={returnToGames}>
            <span aria-hidden="true">←</span> Escolher outro jogo
          </button>

          <div className={`mpv-instruction-card mpv-game-${selectedGame.id}`}>
            <div className="mpv-game-symbol" aria-hidden="true">
              {selectedGame.symbol}
            </div>
            <p className="mpv-eyebrow">{selectedGame.eyebrow}</p>
            <h1 id="selected-game-title">{selectedGame.title}</h1>
            <p className="mpv-instruction-promise">{selectedGame.promise}</p>

            <ol className="mpv-step-list">
              {selectedGame.steps.map((step, index) => (
                <li key={step}>
                  <span>{index + 1}</span>
                  <p>{step}</p>
                </li>
              ))}
            </ol>

            <div className="mpv-selection-summary" aria-live="polite">
              <span aria-hidden="true">✓</span>
              <div>
                <strong>Jogo selecionado</strong>
                <p>
                  {cardBank.roundsPerSession} rodadas sorteadas entre {cardCounts[selectedGame.id]}{' '}
                  cartas leves.
                </p>
              </div>
            </div>

            <button
              className="mpv-primary-button mpv-start-button"
              type="button"
              onClick={() => startGame(selectedGame.id)}
            >
              Começar {selectedGame.title}
              <span aria-hidden="true">→</span>
            </button>
          </div>
        </main>
      ) : (
        <main className="mpv-entry-main" aria-labelledby="mpv-title">
          <section className="mpv-entry-intro">
            <p className="mpv-eyebrow">UM MOMENTO SÓ DE VOCÊS</p>
            <h1 id="mpv-title">
              Escolham um jogo.
              <em> Descubram algo novo.</em>
            </h1>
            <p>
              Dois jogos rápidos para conversar, rir e se conhecer um pouco mais — juntos no mesmo
              celular.
            </p>
            <ul className="mpv-benefits" aria-label="Como funciona">
              <li>
                <span aria-hidden="true">✓</span> Sem cadastro
              </li>
              <li>
                <span aria-hidden="true">✓</span> Apenas 3 rodadas
              </li>
              <li>
                <span aria-hidden="true">✓</span> Vocês podem pular
              </li>
            </ul>
          </section>

          <section className="mpv-game-picker" aria-labelledby="choose-game-title">
            <div className="mpv-picker-heading">
              <p className="mpv-eyebrow">PARA COMEÇAR</p>
              <h2 id="choose-game-title">Qual combina com vocês agora?</h2>
            </div>

            <div className="mpv-game-grid">
              {games.map((game) => (
                <button
                  className={`mpv-game-card mpv-game-${game.id}`}
                  key={game.id}
                  type="button"
                  onClick={() => chooseGame(game)}
                  aria-label={`Escolher ${game.title}. ${game.description}`}
                >
                  <span className="mpv-game-symbol" aria-hidden="true">
                    {game.symbol}
                  </span>
                  <span className="mpv-game-copy">
                    <small>{game.eyebrow}</small>
                    <strong>{game.title}</strong>
                    <span>{game.description}</span>
                    <em>{game.duration}</em>
                  </span>
                  <span className="mpv-card-arrow" aria-hidden="true">
                    →
                  </span>
                </button>
              ))}
            </div>

            <p className="mpv-privacy-note">
              <span aria-hidden="true">♡</span> Suas respostas ficam entre vocês. O teste não pede
              nomes nem guarda o conteúdo da conversa.
            </p>
          </section>
        </main>
      )}

      <footer className="mpv-entry-footer">DESCUBRAM MAIS, CONECTEM-SE MAIS</footer>
    </div>
  )
}
