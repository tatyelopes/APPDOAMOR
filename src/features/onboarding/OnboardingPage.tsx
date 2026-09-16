import { useState } from 'react'

type OnboardingPageProps = { onComplete: () => void; onLogin: () => void }

const steps = [
  {
    eyebrow: 'BEM-VINDOS AO CONECTADOIS',
    title: (
      <>
        Mais presença.
        <br />
        <em>Mais vocês.</em>
      </>
    ),
    description:
      'Um espaço íntimo para casais conversarem, se conhecerem e transformarem pequenos momentos em conexão de verdade.',
    icon: '♡',
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
    icon: '✦',
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
    highlight: 'Privacidade desde o primeiro momento',
  },
]

export function OnboardingPage({ onComplete, onLogin }: OnboardingPageProps) {
  const [step, setStep] = useState(0)
  const current = steps[step]

  return (
    <div className="onboarding-shell">
      <header className="onboarding-header">
        <div className="auth-brand">
          <span className="brand-mark">C</span>
          <span className="brand-wordmark">
            <span>conecta</span>
            <span className="brand-name-accent">dois</span>
          </span>
        </div>
        <button className="onboarding-login" onClick={onLogin}>
          Já tenho uma conta
        </button>
      </header>
      <main className="onboarding-stage fade-in" key={step}>
        <div className="onboarding-visual" aria-hidden="true">
          <span className="visual-orbit orbit-one" />
          <span className="visual-orbit orbit-two" />
          <strong>{current.icon}</strong>
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
