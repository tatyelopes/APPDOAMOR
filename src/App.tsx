import { useEffect, useMemo, useState } from 'react'

type Screen = 'home' | 'questions' | 'test' | 'result' | 'profile' | 'private'
type Member = 'owner' | 'partner'
type Profile = { name: string; email: string; partner: string; anniversary: string; inviteCode: string }
type Language = 'Tempo de qualidade' | 'Palavras de afirmação' | 'Atos de serviço' | 'Toque físico' | 'Presentes'
type PrivateAnswers = Record<string, Partial<Record<Member, string>>>
type ApiUser = { id: string; name: string; email: string; couple: null | { id: string; code: string; anniversary: string; partner: null | { id: string; name: string } } }
type RemoteAnswer = { complete: boolean; mine: string; answers: { name: string; text: string }[] }
const API = '/api'

async function request<T>(path: string, options: RequestInit = {}, token = ''): Promise<T> {
  try {
    const response = await fetch(`${API}${path}`, { ...options, headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}), ...options.headers } })
    const data = await response.json()
    if (!response.ok) throw new Error(data.error || 'Não foi possível concluir a solicitação.')
    return data
  } catch (error) {
    if (error instanceof TypeError) throw new Error('Não foi possível conectar ao servidor. Inicie o aplicativo com “npm.cmd run dev” e tente novamente.')
    throw error
  }
}

const questions = [
  { category: 'Memórias', level: 1, text: 'Qual lembrança nossa sempre consegue fazer você sorrir?' },
  { category: 'Curiosidades', level: 1, text: 'Se pudéssemos acordar amanhã em qualquer lugar, onde seria?' },
  { category: 'Carinho', level: 1, text: 'Qual pequeno gesto meu faz você se sentir cuidado(a)?' },
  { category: 'Futuro', level: 2, text: 'Que sonho você gostaria que construíssemos juntos nos próximos anos?' },
  { category: 'Valores', level: 2, text: 'O que significa ter uma vida bem vivida para você?' },
  { category: 'Parceria', level: 2, text: 'Em qual situação você mais sente que formamos um time?' },
]
const quiz: { a: { text: string; language: Language }; b: { text: string; language: Language } }[] = [
  { a: { text: 'Ter uma conversa sem pressa, só nós dois', language: 'Tempo de qualidade' }, b: { text: 'Ouvir algo sincero que meu amor admira em mim', language: 'Palavras de afirmação' } },
  { a: { text: 'Receber ajuda em uma tarefa cansativa', language: 'Atos de serviço' }, b: { text: 'Ganhar um abraço demorado ao fim do dia', language: 'Toque físico' } },
  { a: { text: 'Receber uma lembrancinha pensada em mim', language: 'Presentes' }, b: { text: 'Fazer um passeio juntos, sem celular', language: 'Tempo de qualidade' } },
  { a: { text: 'Receber uma mensagem dizendo por que sou especial', language: 'Palavras de afirmação' }, b: { text: 'Ter algo resolvido por mim num dia corrido', language: 'Atos de serviço' } },
  { a: { text: 'Andar de mãos dadas ou ficar bem pertinho', language: 'Toque físico' }, b: { text: 'Ganhar algo simples que lembre uma história nossa', language: 'Presentes' } },
]
const tips: Record<Language, string> = {
  'Tempo de qualidade': 'Separem 20 minutos hoje para uma conversa sem telas.',
  'Palavras de afirmação': 'Elogie uma qualidade da personalidade do seu amor.',
  'Atos de serviço': 'Assuma hoje uma pequena tarefa que costuma ficar com seu amor.',
  'Toque físico': 'Ao se encontrarem, experimentem um abraço de 20 segundos.',
  'Presentes': 'Escolha uma lembrança simples ligada a uma história de vocês.',
}
const makeCode = () => `AMOR-${Math.random().toString(36).slice(2, 6).toUpperCase()}`
const blankProfile: Profile = { name: '', email: '', partner: '', anniversary: '', inviteCode: makeCode() }
const readProfile = (): Profile => {
  const saved = JSON.parse(localStorage.getItem('entrenos-profile') || 'null')
  return saved ? { ...blankProfile, ...saved } : blankProfile
}

export default function App() {
  const [token, setToken] = useState(() => localStorage.getItem('entrenos-token') || '')
  const [user, setUser] = useState<ApiUser | null>(null)
  const [loading, setLoading] = useState(Boolean(token))

  useEffect(() => {
    if (!token) return
    request<{ user: ApiUser }>('/me', {}, token).then(data => setUser(data.user)).catch(() => { localStorage.removeItem('entrenos-token'); setToken('') }).finally(() => setLoading(false))
  }, [token])

  function signedIn(nextToken: string, nextUser: ApiUser) {
    localStorage.setItem('entrenos-token', nextToken); setToken(nextToken); setUser(nextUser); setLoading(false)
  }
  if (loading) return <div className="loading-screen"><span className="brand-mark">e</span><p>Preparando o espaço de vocês…</p></div>
  if (!token || !user) return <Auth onSuccess={signedIn} />
  if (!user.couple) return <Connect token={token} user={user} onConnected={setUser} onLogout={() => { localStorage.removeItem('entrenos-token'); setToken(''); setUser(null) }} />
  return <Experience token={token} user={user} onUser={setUser} onLogout={() => { localStorage.removeItem('entrenos-token'); setToken(''); setUser(null) }} />
}

function Auth({ onSuccess }: { onSuccess: (token: string, user: ApiUser) => void }) {
  const [mode, setMode] = useState<'login' | 'register'>('register')
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [error, setError] = useState(''); const [busy, setBusy] = useState(false)
  async function submit(event: React.FormEvent) {
    event.preventDefault(); setBusy(true); setError('')
    try { const data = await request<{ token: string; user: ApiUser }>(`/${mode}`, { method: 'POST', body: JSON.stringify(form) }); onSuccess(data.token, data.user) }
    catch (reason) { setError(reason instanceof Error ? reason.message : 'Erro inesperado.') } finally { setBusy(false) }
  }
  return <div className="auth-shell"><div className="auth-brand"><span className="brand-mark">e</span><span>entre nós</span></div><section className="auth-card fade-in"><div className="eyebrow">SEU ESPAÇO SEGURO</div><h1>{mode === 'register' ? 'Comece uma história a dois.' : 'Que bom ter você de volta.'}</h1><p>{mode === 'register' ? 'Crie seu acesso individual. Depois, conecte-se ao seu amor.' : 'Entre para continuar os momentos de vocês.'}</p><form onSubmit={submit}>{mode === 'register' && <label>Seu nome<input required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} /></label>}<label>Seu e-mail<input required type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} /></label><label>Senha<input required minLength={6} type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} placeholder="Mínimo de 6 caracteres" /></label>{error && <p className="form-error">{error}</p>}<button className="primary" disabled={busy}>{busy ? 'Aguarde…' : mode === 'register' ? 'Criar minha conta →' : 'Entrar →'}</button></form><button className="text-button" onClick={() => { setMode(mode === 'register' ? 'login' : 'register'); setError('') }}>{mode === 'register' ? 'Já tenho conta' : 'Quero criar uma conta'}</button></section></div>
}

function Connect({ token, user, onConnected, onLogout }: { token: string; user: ApiUser; onConnected: (user: ApiUser) => void; onLogout: () => void }) {
  const [joinCode, setJoinCode] = useState(''); const [anniversary, setAnniversary] = useState(''); const [error, setError] = useState('')
  async function action(path: string, payload: object) { try { setError(''); const data = await request<{ user: ApiUser }>(path, { method: 'POST', body: JSON.stringify(payload) }, token); onConnected(data.user) } catch (reason) { setError(reason instanceof Error ? reason.message : 'Erro inesperado.') } }
  return <div className="auth-shell"><div className="auth-brand"><span className="brand-mark">e</span><span>entre nós</span></div><section className="connect-card fade-in"><div className="eyebrow">OLÁ, {user.name.toUpperCase()}</div><h1>Como vocês querem se conectar?</h1><p>Uma pessoa cria o espaço e compartilha o código. A outra entra com esse código.</p><div className="connect-options"><article><span>01</span><h2>Criar nosso espaço</h2><label>Data de início <small>(opcional)</small><input type="date" value={anniversary} onChange={e => setAnniversary(e.target.value)} /></label><button className="primary" onClick={() => action('/couples/create', { anniversary })}>Criar e receber código →</button></article><div className="or">OU</div><article><span>02</span><h2>Tenho um convite</h2><label>Código do casal<input value={joinCode} onChange={e => setJoinCode(e.target.value.toUpperCase())} placeholder="AMOR-0000" /></label><button className="primary" onClick={() => action('/couples/join', { code: joinCode })}>Entrar no espaço →</button></article></div>{error && <p className="form-error">{error}</p>}<button className="text-button" onClick={onLogout}>Sair desta conta</button></section></div>
}

function Experience({ token, user, onUser, onLogout }: { token: string; user: ApiUser; onUser: (user: ApiUser) => void; onLogout: () => void }) {
  const initialProfile: Profile = { name: user.name, email: user.email, partner: user.couple?.partner?.name || '', anniversary: user.couple?.anniversary || '', inviteCode: user.couple?.code || '' }
  const [profile] = useState<Profile>(initialProfile)
  const [draft] = useState<Profile>(initialProfile)
  const [screen, setScreen] = useState<Screen>('home')
  const [member] = useState<Member>('owner')
  const [answerDraft, setAnswerDraft] = useState('')
  const [questionIndex, setQuestionIndex] = useState(0)
  const [level, setLevel] = useState(1)
  const [quizIndex, setQuizIndex] = useState(0)
  const [answers, setAnswers] = useState<Language[]>([])
  const [streak, setStreak] = useState(() => Number(localStorage.getItem('entrenos-streak') || 3))
  const [copied, setCopied] = useState(false)
  const [remote, setRemote] = useState<RemoteAnswer>({ complete: false, mine: '', answers: [] })

  useEffect(() => localStorage.setItem('entrenos-member', member), [member])
  useEffect(() => localStorage.setItem('entrenos-streak', String(streak)), [streak])

  const currentName = user.name
  const otherName = user.couple?.partner?.name || 'seu amor'
  const filtered = questions.filter(question => question.level === level)
  const privateQuestion = questions[3]
  const responses = remote.complete ? { owner: remote.answers.find(a => a.name === currentName)?.text || remote.mine, partner: remote.answers.find(a => a.name !== currentName)?.text || '' } : { owner: remote.mine }
  const bothAnswered = remote.complete
  const result = useMemo(() => {
    const scores = answers.reduce<Partial<Record<Language, number>>>((all, value) => ({ ...all, [value]: (all[value] || 0) + 1 }), {})
    return (Object.entries(scores).sort((a, b) => b[1]! - a[1]!)[0]?.[0] || 'Tempo de qualidade') as Language
  }, [answers])

  async function refreshAnswers() {
    const data = await request<RemoteAnswer>('/answers/question-3', {}, token); setRemote(data); setAnswerDraft(data.mine)
  }
  function openPrivate() {
    setScreen('private'); void refreshAnswers()
  }
  function savePrivate(event: React.FormEvent) {
    event.preventDefault()
    if (!answerDraft.trim()) return
    void request('/answers/question-3', { method: 'POST', body: JSON.stringify({ text: answerDraft.trim() }) }, token).then(refreshAnswers)
  }
  function choose(language: Language) {
    const next = [...answers, language]; setAnswers(next)
    if (quizIndex === quiz.length - 1) { setStreak(value => value + 1); setScreen('result') } else setQuizIndex(value => value + 1)
  }
  async function copyCode() {
    await navigator.clipboard?.writeText(user.couple?.code || ''); setCopied(true); window.setTimeout(() => setCopied(false), 1500)
  }

  return <div className="app-shell">
    <header className="topbar">
      <button className="brand" onClick={() => setScreen('home')}><span className="brand-mark">e</span><span>entre nós</span></button>
      <div className="account-actions"><span className="active-name">{currentName}</span><button className="avatar" onClick={() => setScreen('profile')}>{currentName.charAt(0).toUpperCase()}</button></div>
    </header>
    <main>
      {screen === 'profile' && <section className="onboarding page fade-in"><div className="eyebrow">CONTA E CONEXÃO</div><h1>O espaço de vocês</h1><p className="lead">Sua conta é individual e está conectada ao espaço compartilhado do casal.</p><div className="connection-card"><div><div className="eyebrow">CONTA ATUAL</div><h2>{user.name}</h2><p>{user.email}</p></div><button className="invite-code" onClick={copyCode}><small>CÓDIGO DO CASAL</small><b>{user.couple?.code}</b><span>{copied ? 'Copiado!' : 'Copiar código'}</span></button><div className="member-row"><span><i className="member-dot" /> {user.couple?.partner ? `Conectado(a) com ${user.couple.partner.name}` : 'Aguardando seu amor entrar pelo código'}</span><button className="secondary" onClick={() => request<{ user: ApiUser }>('/me', {}, token).then(data => onUser(data.user))}>Atualizar</button></div><button className="text-button" onClick={onLogout}>Sair desta conta</button></div></section>}

      {screen === 'home' && <section className="page home fade-in">
        <div className="welcome"><div><div className="eyebrow">BOA NOITE, {currentName.toUpperCase()}</div><h1>Um pouco mais perto,<br/><em>todos os dias.</em></h1></div><div className="streak"><span>✦</span><b>{streak} dias</b><small>de conexão</small></div></div>
        <article className="daily-card"><div className="card-copy"><span className="pill light">RESPOSTA PRIVADA</span><h2>{privateQuestion.text}</h2><p>{bothAnswered ? 'As duas respostas estão prontas para serem descobertas.' : responses[member] ? `Sua resposta está guardada. Falta ${otherName} responder.` : 'Sua resposta fica em segredo até que os dois participem.'}</p><button onClick={openPrivate}>{bothAnswered ? 'Revelar respostas' : responses[member] ? 'Acompanhar resposta' : 'Responder em segredo'} <span>→</span></button></div><div className="orb">♡</div></article>
        <div className="section-title"><span>EXPLOREM JUNTOS</span><h2>Escolham o momento de hoje</h2></div>
        <div className="feature-grid">
          <button className="feature warm" onClick={() => { setLevel(1); setQuestionIndex(0); setScreen('questions') }}><span className="feature-icon">?</span><div><small>CONVERSAS</small><h3>Perguntas que aproximam</h3><p>Leves, profundas e feitas para vocês.</p></div><b>→</b></button>
          <button className="feature sage" onClick={() => { setQuizIndex(0); setAnswers([]); setScreen('test') }}><span className="feature-icon">♡</span><div><small>DESCUBRAM-SE</small><h3>As linguagens do amor</h3><p>Entenda como cada um dá e recebe carinho.</p></div><b>→</b></button>
          <button className="feature lilac" onClick={openPrivate}><span className="feature-icon">◉</span><div><small>ESPAÇO SEGURO</small><h3>Revelação mútua</h3><p>Cada um responde sem influenciar o outro.</p></div><b>→</b></button>
        </div><div className="tip"><span>✦</span><div><small>GESTO DE HOJE</small><p>{tips[result]}</p></div><button onClick={() => setStreak(value => value + 1)}>✓</button></div>
      </section>}

      {screen === 'private' && <section className="page private-flow fade-in">
        <button className="back" onClick={() => setScreen('home')}>← Voltar</button>
        {!bothAnswered ? <><div className="privacy-badge">◉ PRIVADO ATÉ OS DOIS RESPONDEREM</div>
          <div className="quiz-intro"><div className="eyebrow">PERGUNTA PARA {currentName.toUpperCase()}</div><h1>{privateQuestion.text}</h1><p>{responses[member] ? 'Sua resposta está salva e continua privada.' : `${otherName} não verá sua resposta antes de responder.`}</p></div>
          <form className="answer-form" onSubmit={savePrivate}><textarea value={answerDraft} onChange={e => setAnswerDraft(e.target.value)} placeholder="Escreva com sinceridade. Este é um espaço seguro..." maxLength={500} /><div><small>{answerDraft.length}/500</small><button className="primary" type="submit">{responses[member] ? 'Atualizar resposta' : 'Guardar minha resposta'} →</button></div></form>
          {responses[member] && <div className="waiting-card"><span>✓</span><div><b>Sua parte está pronta</b><p>Agora é a vez de {otherName}. A resposta aparecerá quando a outra conta participar.</p></div><button className="secondary" onClick={refreshAnswers}>Atualizar status</button></div>}</>
          : <div className="reveal"><div className="result-mark">♡</div><div className="eyebrow">REVELAÇÃO MÚTUA</div><h1>Agora vocês podem se escutar.</h1><p className="lead">Leiam sem interromper. Depois conversem sobre o que mais tocou cada um.</p><div className="reveal-grid">{remote.answers.map(answer => <article key={answer.name}><small>{answer.name.toUpperCase()}</small><p>“{answer.text}”</p></article>)}</div><button className="primary" onClick={() => { setStreak(value => value + 1); setScreen('home') }}>Concluir momento juntos →</button></div>}
      </section>}

      {screen === 'questions' && <section className="page game fade-in"><button className="back" onClick={() => setScreen('home')}>← Voltar</button><div className="game-head"><div><div className="eyebrow">CONVERSAS QUE APROXIMAM</div><h1>Sem pressa. Só presença.</h1></div><span>{questionIndex + 1} / {filtered.length}</span></div><div className="level-switch"><button className={level === 1 ? 'active' : ''} onClick={() => { setLevel(1); setQuestionIndex(0) }}>Leve</button><button className={level === 2 ? 'active' : ''} onClick={() => { setLevel(2); setQuestionIndex(0) }}>Profundo</button></div><article className="question-card"><span className="pill">{filtered[questionIndex].category}</span><div className="quote">“</div><h2>{filtered[questionIndex].text}</h2><p>Olhem um para o outro. Uma pessoa responde por vez.</p></article><div className="game-actions"><button className="secondary" onClick={() => setQuestionIndex(value => (value - 1 + filtered.length) % filtered.length)}>← Anterior</button><button className="primary" onClick={() => questionIndex === filtered.length - 1 ? setScreen('home') : setQuestionIndex(value => value + 1)}>{questionIndex === filtered.length - 1 ? 'Concluir sessão' : 'Próxima pergunta →'}</button></div></section>}

      {screen === 'test' && <section className="page quiz fade-in"><button className="back" onClick={() => setScreen('home')}>← Sair do teste</button><div className="progress"><i style={{ width: `${((quizIndex + 1) / quiz.length) * 100}%` }} /></div><div className="quiz-intro"><div className="eyebrow">LINGUAGENS DO AMOR · {quizIndex + 1} DE {quiz.length}</div><h1>O que faria você se sentir<br/><em>mais amado(a)?</em></h1><p>Não existe resposta certa. Escolha a que mais toca você.</p></div><div className="choices"><button onClick={() => choose(quiz[quizIndex].a.language)}><span>A</span><p>{quiz[quizIndex].a.text}</p><i>○</i></button><div>OU</div><button onClick={() => choose(quiz[quizIndex].b.language)}><span>B</span><p>{quiz[quizIndex].b.text}</p><i>○</i></button></div></section>}
      {screen === 'result' && <section className="page result fade-in"><div className="result-mark">♡</div><div className="eyebrow">SEU JEITO DE RECEBER AMOR</div><h1>{result}</h1><p className="lead">Você se sente especialmente amado(a) quando esse cuidado aparece nas pequenas escolhas do cotidiano.</p><div className="result-card"><small>UMA IDEIA PARA HOJE</small><p>{tips[result]}</p></div><button className="primary" onClick={() => setScreen('home')}>Voltar ao nosso espaço →</button></section>}
    </main>
    <nav className="bottom-nav"><button className={screen === 'home' ? 'active' : ''} onClick={() => setScreen('home')}><span>⌂</span>Início</button><button className={screen === 'questions' ? 'active' : ''} onClick={() => setScreen('questions')}><span>◌</span>Explorar</button><button className={screen === 'private' || screen === 'test' || screen === 'result' ? 'active' : ''} onClick={openPrivate}><span>♡</span>Nós</button><button className={screen === 'profile' ? 'active' : ''} onClick={() => setScreen('profile')}><span>♙</span>Perfil</button></nav>
  </div>
}
