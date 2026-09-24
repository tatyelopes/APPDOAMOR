import { useState } from 'react'
import conectadoisLogo from '../../../Identidade visual/logo-conectadois-dourado-transparente.png'

type OnboardingPageProps = {
  onComplete: () => void
  onLogin: () => void
  initialStep?: number
}

const steps = [
  {
    eyebrow: 'BEM-VINDOS AO CONECTADOIS',
    title: (
      <>
        Mais conexão.
        <br />
        <em>Mais vocês.</em>
      </>
    ),
    description:
      'Um espaço íntimo para casais conversarem, se conhecerem e transformarem pequenos momentos em conexão de verdade.',
    icon: '♡',
    showLogo: true,
    showBoardPiece: false,
    highlight: 'Criado para ser vivido a dois',
  },
  {
    eyebrow: 'CONEXÃO NO DIA A DIA',
    title: (
      <>
        Descubram novas formas
        <br />
        de <em>se aproximar.</em>
      </>
    ),
    description:
      'Perguntas, testes e gestos de carinho ajudam vocês a sair do automático sem transformar o amor em obrigação.',
    icon: 'peão',
    showLogo: false,
    showBoardPiece: true,
    highlight: 'Experiências rápidas e significativas',
  },
  {
    eyebrow: 'UM ESPAÇO SEGURO',
    title: (
      <>
        Cada resposta no
        <br />
        <em>tempo de vocês.</em>
      </>
    ),
    description:
      'Nas experiências privadas, uma resposta só é revelada quando os dois participam. Sem pressão e sem influência.',
    icon: '◉',
    showLogo: false,
    showBoardPiece: false,
    highlight: 'Privacidade desde o primeiro momento',
  },
]

export function OnboardingPage({ onComplete, onLogin, initialStep = 0 }: OnboardingPageProps) {
  const [step, setStep] = useState(() => {
    if (!Number.isFinite(initialStep)) return 0
    return Math.min(steps.length - 1, Math.max(0, Math.trunc(initialStep)))
  })
  const current = steps[step]

  return (
    <div className="onboarding-shell">
      <header className="onboarding-header">
        <button className="onboarding-login" onClick={onLogin}>
          <span className="login-label-full">Já tenho uma conta</span>
          <span className="login-label-short">Entrar</span>
        </button>
      </header>
      <main className="onboarding-stage fade-in" key={step}>
        <div className="onboarding-visual" aria-hidden="true">
          <span className="visual-orbit orbit-one" />
          <span className="visual-orbit orbit-two" />
          {current.showLogo ? (
            <img className="onboarding-visual-logo" src={conectadoisLogo} alt="" />
          ) : current.showBoardPiece ? (
            <svg className="onboarding-board-piece" viewBox="0 0 220 220" aria-hidden="true">
              <defs>
                <linearGradient id="pawn-body" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0" stopColor="#fff0c9" />
                  <stop offset="0.46" stopColor="#efc276" />
                  <stop offset="1" stopColor="#bd7629" />
                </linearGradient>
                <radialGradient id="pawn-head" cx="34%" cy="26%" r="72%">
                  <stop offset="0" stopColor="#fff8de" />
                  <stop offset="0.5" stopColor="#efc276" />
                  <stop offset="1" stopColor="#c47d2d" />
                </radialGradient>
                <filter id="pawn-shadow" x="-30%" y="-30%" width="160%" height="180%">
                  <feDropShadow
                    dx="0"
                    dy="10"
                    stdDeviation="8"
                    floodColor="#160915"
                    floodOpacity="0.58"
                  />
                </filter>
              </defs>
              <g filter="url(#pawn-shadow)" stroke="#9b5d20" strokeWidth="3">
                <path
                  d="M82 82h56c-1 24 8 43 31 70 7 8 11 17 12 27H39c1-10 5-19 12-27 23-27 32-46 31-70Z"
                  fill="url(#pawn-body)"
                  strokeLinejoin="round"
                />
                <rect x="32" y="165" width="156" height="32" rx="16" fill="url(#pawn-body)" />
                <circle cx="110" cy="49" r="32" fill="url(#pawn-head)" />
              </g>
              <ellipse cx="99" cy="38" rx="10" ry="7" fill="#fff9e8" opacity="0.72" />
              <path
                d="M70 151c15-19 23-39 24-58"
                fill="none"
                stroke="#fff1cb"
                strokeLinecap="round"
                strokeWidth="7"
                opacity="0.42"
              />
            </svg>
          ) : (
            <strong>{current.icon}</strong>
          )}
          <small>2</small>
        </div>
        <section className="onboarding-copy">
          <div className="eyebrow">{current.eyebrow}</div>
          <h1>{current.title}</h1>
          <p>{current.description}</p>
          <div className="onboarding-highlight">
            <span>✓</span>
            {current.highlight}
          </div>
          <div className="onboarding-actions">
            <div className="onboarding-dots" aria-label={`Etapa ${step + 1} de ${steps.length}`}>
              {steps.map((_, index) => (
                <button
                  key={index}
                  className={index === step ? 'active' : ''}
                  onClick={() => setStep(index)}
                  aria-label={`Ir para etapa ${index + 1}`}
                />
              ))}
            </div>
            <button
              className="primary"
              onClick={() =>
                step === steps.length - 1 ? onComplete() : setStep((value) => value + 1)
              }
            >
              {step === steps.length - 1 ? 'Criar minha conta' : 'Continuar'} <span>→</span>
            </button>
          </div>
        </section>
      </main>
      <footer className="onboarding-footer">Conexão que vira memória.</footer>
    </div>
  )
}
