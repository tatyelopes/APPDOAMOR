import { useState } from 'react'
import { apiRequest } from '../../shared/api/http-client'
import type { ApiUser } from '../../shared/types/domain'

type Props = {
  token: string
  user: ApiUser
  onUpdate: (user: ApiUser) => void
  onLogout: () => void
}

export function PairingWaitingPage({ token, user, onUpdate, onLogout }: Props) {
  const [copied, setCopied] = useState(false)
  const [busy, setBusy] = useState(false)
  const code = user.couple?.code || ''

  async function copyCode() {
    await navigator.clipboard?.writeText(code)
    setCopied(true)
    window.setTimeout(() => setCopied(false), 1600)
  }

  async function refresh() {
    setBusy(true)
    try {
      const data = await apiRequest<{ user: ApiUser }>('/me', {}, token)
      onUpdate(data.user)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="auth-shell pairing-waiting-shell">
      <div className="auth-brand">
        <span className="brand-mark">C</span>
        <span className="brand-wordmark">
          <span>conecta</span>
          <span className="brand-name-accent">dois</span>
        </span>
      </div>
      <section className="pairing-waiting fade-in">
        <div className="pairing-success">✓</div>
        <div className="eyebrow">ESPAÇO CRIADO</div>
        <h1>
          Agora, convide
          <br />
          <em>seu amor.</em>
        </h1>
        <p>
          Envie este código para a outra pessoa. Ela deve criar a própria conta e escolher “Tenho um
          convite”.
        </p>
        <button className="pairing-code" onClick={copyCode}>
          <small>CÓDIGO DO CASAL</small>
          <strong>{code}</strong>
          <span>{copied ? 'Código copiado!' : 'Clique para copiar'}</span>
        </button>
        <div className="pairing-steps">
          <article>
            <span>1</span>
            <p>Compartilhe o código</p>
          </article>
          <i>→</i>
          <article>
            <span>2</span>
            <p>Seu amor cria uma conta</p>
          </article>
          <i>→</i>
          <article>
            <span>3</span>
            <p>Vocês se conectam</p>
          </article>
        </div>
        <button className="primary" disabled={busy} onClick={refresh}>
          {busy ? 'Verificando…' : 'Já usaram o código'} <span>→</span>
        </button>
        <button className="text-button" onClick={onLogout}>
          Sair desta conta
        </button>
      </section>
    </div>
  )
}
