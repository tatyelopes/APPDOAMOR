import { useEffect, useMemo, useState } from 'react'
import { apiRequest as request } from './shared/api/http-client'
import { readJson, storageKeys, writeJson } from './shared/storage/local-storage'
import type { ApiUser, Language, Member, Profile, RemoteAnswer, Screen, Temperament } from './shared/types/domain'
import { OnboardingPage } from './features/onboarding/OnboardingPage'
import { PairingWaitingPage } from './features/pairing/PairingWaitingPage'
import { AdminDashboard } from './features/admin/AdminDashboard'

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
const temperamentQuestions: { scenario: string; context: string; options: { text: string; temperament: Temperament }[] }[] = [
  { scenario: 'Vocês reservaram um restaurante, mas a mesa está atrasada há 30 minutos. Como você reage?', context: 'IMPREVISTOS', options: [
    { text: 'Procuro o responsável e tento resolver a situação rapidamente.', temperament: 'Colérico' },
    { text: 'Faço piada, puxo conversa e tento transformar a espera em diversão.', temperament: 'Sanguíneo' },
    { text: 'Prefiro esperar com calma para não criar um clima ruim.', temperament: 'Fleumático' },
    { text: 'Quero entender o que aconteceu e se a reserva foi registrada corretamente.', temperament: 'Melancólico' },
  ] },
  { scenario: 'Seu amor chega em casa visivelmente chateado, mas diz que não quer conversar. O que você faz?', context: 'ACOLHIMENTO', options: [
    { text: 'Pergunto diretamente o que aconteceu e proponho uma solução.', temperament: 'Colérico' },
    { text: 'Tento animar o ambiente com carinho, conversa ou alguma surpresa.', temperament: 'Sanguíneo' },
    { text: 'Respeito o espaço e fico disponível até a pessoa querer falar.', temperament: 'Fleumático' },
    { text: 'Observo os sinais e penso com cuidado na melhor forma de abordar.', temperament: 'Melancólico' },
  ] },
  { scenario: 'Vocês precisam planejar uma viagem juntos. Qual papel você assume naturalmente?', context: 'PLANEJAMENTO', options: [
    { text: 'Defino prioridades, prazos e tomo as decisões necessárias.', temperament: 'Colérico' },
    { text: 'Pesquiso experiências diferentes e contagio o outro com as ideias.', temperament: 'Sanguíneo' },
    { text: 'Ajudo no que for preciso e busco escolhas confortáveis para os dois.', temperament: 'Fleumático' },
    { text: 'Comparo preços, avaliações e organizo cada detalhe do roteiro.', temperament: 'Melancólico' },
  ] },
  { scenario: 'Durante uma discussão, você percebe que os dois estão elevando o tom. Qual é sua reação mais provável?', context: 'CONFLITOS', options: [
    { text: 'Mantenho meu ponto e quero chegar logo a uma definição.', temperament: 'Colérico' },
    { text: 'Falo tudo o que estou sentindo, mesmo que me empolgue demais.', temperament: 'Sanguíneo' },
    { text: 'Tento encerrar a tensão e retomar o assunto quando houver calma.', temperament: 'Fleumático' },
    { text: 'Relembro fatos e palavras para explicar exatamente por que me magoei.', temperament: 'Melancólico' },
  ] },
  { scenario: 'Surge uma tarde livre que vocês não haviam planejado. O que mais combina com você?', context: 'TEMPO LIVRE', options: [
    { text: 'Escolho rapidamente algo produtivo ou uma atividade com objetivo.', temperament: 'Colérico' },
    { text: 'Proponho sair e descobrir alguma coisa nova na hora.', temperament: 'Sanguíneo' },
    { text: 'Aproveito para descansar juntos, sem precisar preencher o tempo.', temperament: 'Fleumático' },
    { text: 'Prefiro uma atividade especial escolhida com alguma antecedência.', temperament: 'Melancólico' },
  ] },
  { scenario: 'Seu parceiro esquece uma tarefa importante que havia prometido fazer. Como você reage?', context: 'RESPONSABILIDADE', options: [
    { text: 'Cobro de forma objetiva e reorganizo o que precisa ser feito.', temperament: 'Colérico' },
    { text: 'Demonstro minha frustração na hora, mas costumo superar rapidamente.', temperament: 'Sanguíneo' },
    { text: 'Evito cobrar imediatamente e talvez acabe fazendo por conta própria.', temperament: 'Fleumático' },
    { text: 'Fico incomodado porque compromissos e detalhes têm muito peso para mim.', temperament: 'Melancólico' },
  ] },
  { scenario: 'Quando você quer demonstrar amor em um dia comum, o que tende a fazer?', context: 'AFETO', options: [
    { text: 'Resolvo algo importante ou ajudo a tornar o dia mais eficiente.', temperament: 'Colérico' },
    { text: 'Expresso entusiasmo, elogio e crio um momento espontâneo.', temperament: 'Sanguíneo' },
    { text: 'Ofereço presença tranquila, paciência e constância.', temperament: 'Fleumático' },
    { text: 'Preparo algo significativo, pensado nos gostos e detalhes da pessoa.', temperament: 'Melancólico' },
  ] },
  { scenario: 'O casal precisa tomar uma decisão financeira importante. Como você participa?', context: 'DECISÕES', options: [
    { text: 'Avalio o objetivo e defendo a escolha com melhor resultado.', temperament: 'Colérico' },
    { text: 'Penso nas possibilidades e no quanto a decisão pode melhorar nossa vida.', temperament: 'Sanguíneo' },
    { text: 'Busco uma opção segura que preserve a tranquilidade do casal.', temperament: 'Fleumático' },
    { text: 'Analiso riscos, números e consequências antes de concordar.', temperament: 'Melancólico' },
  ] },
  { scenario: 'Em um encontro com amigos, seu parceiro está conversando com várias pessoas. Como você costuma ficar?', context: 'VIDA SOCIAL', options: [
    { text: 'Circulo com independência e conduzo as conversas que me interessam.', temperament: 'Colérico' },
    { text: 'Entro no clima, conheço gente nova e aproveito a energia do grupo.', temperament: 'Sanguíneo' },
    { text: 'Fico confortável com poucas pessoas e acompanho o ritmo sem pressão.', temperament: 'Fleumático' },
    { text: 'Observo primeiro e prefiro conversas mais profundas e individuais.', temperament: 'Melancólico' },
  ] },
  { scenario: 'Um plano importante do casal não dá certo. O que acontece primeiro dentro de você?', context: 'FRUSTRAÇÃO', options: [
    { text: 'Penso no próximo movimento e em como recuperar o controle.', temperament: 'Colérico' },
    { text: 'Expresso o que senti e logo começo a imaginar novas possibilidades.', temperament: 'Sanguíneo' },
    { text: 'Aceito o ocorrido e tento manter a estabilidade emocional.', temperament: 'Fleumático' },
    { text: 'Analiso o que falhou e preciso de tempo para processar a decepção.', temperament: 'Melancólico' },
  ] },
]
const temperamentInsights: Record<Temperament, { essence: string; conflict: string; affection: string; rhythm: string }> = {
  'Colérico': { essence: 'Direção e iniciativa', conflict: 'Busca objetividade e solução. Pode precisar desacelerar para escutar antes de decidir.', affection: 'Demonstra cuidado assumindo responsabilidades e fazendo acontecer.', rhythm: 'Prefere movimento, metas claras e decisões rápidas.' },
  'Sanguíneo': { essence: 'Entusiasmo e expressão', conflict: 'Fala a partir da emoção e tende a se recompor rápido. Precisa cuidar para não atropelar o tempo do outro.', affection: 'Demonstra amor com presença calorosa, palavras e espontaneidade.', rhythm: 'Gosta de novidade, interação e planos flexíveis.' },
  'Fleumático': { essence: 'Estabilidade e acolhimento', conflict: 'Evita escaladas e preserva a paz. Precisa se lembrar de dizer o que sente, mesmo quando é desconfortável.', affection: 'Demonstra amor por meio da constância, paciência e disponibilidade.', rhythm: 'Valoriza previsibilidade, conforto e tempo para se adaptar.' },
  'Melancólico': { essence: 'Profundidade e cuidado', conflict: 'Processa detalhes e significados com intensidade. Pode precisar separar intenção de impacto.', affection: 'Demonstra amor por atenção aos detalhes e gestos cheios de significado.', rhythm: 'Prefere planejamento, profundidade e segurança antes de agir.' },
}
const partnerSuggestions: Record<Temperament, { intro: string; tips: { title: string; text: string }[] }> = {
  'Colérico': { intro: 'Este perfil costuma se sentir respeitado quando encontra clareza, confiança e parceria na ação.', tips: [
    { title: 'Seja direto, sem ser duro', text: 'Em assuntos importantes, diga o que precisa com objetividade e evite mensagens ambíguas.' },
    { title: 'Reconheça suas iniciativas', text: 'Valorize o esforço para resolver problemas, liderar decisões e proteger o que é importante para vocês.' },
    { title: 'Convide para desacelerar', text: 'Em conflitos, proponha uma pausa curta e retome a conversa quando ambos conseguirem realmente escutar.' },
  ] },
  'Sanguíneo': { intro: 'Este perfil tende a florescer com reciprocidade emocional, novidade e demonstrações visíveis de carinho.', tips: [
    { title: 'Demonstre entusiasmo', text: 'Celebre ideias, conquistas e pequenos momentos. Uma resposta calorosa costuma ter muito significado.' },
    { title: 'Crie experiências juntos', text: 'Inclua espontaneidade na rotina: um convite inesperado ou uma atividade nova fortalece a conexão.' },
    { title: 'Escute além da intensidade', text: 'Durante conflitos, acolha primeiro a emoção e depois ajude a organizar o que precisa ser resolvido.' },
  ] },
  'Fleumático': { intro: 'Este perfil se conecta melhor em ambientes seguros, estáveis e livres de pressão emocional excessiva.', tips: [
    { title: 'Dê tempo para responder', text: 'Evite exigir decisões ou conversas profundas imediatamente. O silêncio pode ser processamento, não indiferença.' },
    { title: 'Valorize a constância', text: 'Reconheça os cuidados discretos e a presença confiável que este perfil oferece no cotidiano.' },
    { title: 'Abra espaço com delicadeza', text: 'Faça perguntas específicas e tranquilas para que necessidades e incômodos não fiquem sempre guardados.' },
  ] },
  'Melancólico': { intro: 'Este perfil costuma se sentir amado quando percebe intenção, profundidade e atenção verdadeira aos detalhes.', tips: [
    { title: 'Cumpra o que combinar', text: 'Coerência e previsibilidade geram segurança. Se algo mudar, comunique antes e explique com sinceridade.' },
    { title: 'Cuide dos detalhes', text: 'Lembrar preferências, datas e conversas importantes comunica que a relação é tratada com atenção.' },
    { title: 'Não apresse o processamento', text: 'Depois de um conflito, ofereça tempo sem abandonar a conversa e combine quando vocês irão retomá-la.' },
  ] },
}
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
  const [token, setToken] = useState(() => localStorage.getItem(storageKeys.authToken) || '')
  const [user, setUser] = useState<ApiUser | null>(null)
  const [loading, setLoading] = useState(Boolean(token))
  const [onboardingCompleted, setOnboardingCompleted] = useState(
    () => Boolean(localStorage.getItem(storageKeys.onboardingCompleted) || token),
  )

  useEffect(() => {
    if (!token) return
    request<{ user: ApiUser }>('/me', {}, token).then(data => setUser(data.user)).catch(() => { localStorage.removeItem(storageKeys.authToken); setToken('') }).finally(() => setLoading(false))
  }, [token])

  function signedIn(nextToken: string, nextUser: ApiUser) {
    localStorage.setItem(storageKeys.authToken, nextToken); setToken(nextToken); setUser(nextUser); setLoading(false)
  }
  function completeOnboarding() {
    localStorage.setItem(storageKeys.onboardingCompleted, 'true')
    setOnboardingCompleted(true)
  }
  const content = loading
    ? <div className="loading-screen"><span className="brand-mark">♥</span><p>Preparando o espaço de vocês…</p></div>
    : !onboardingCompleted
      ? <OnboardingPage onComplete={completeOnboarding} onLogin={completeOnboarding} />
      : !token || !user
      ? <Auth onSuccess={signedIn} />
      : user.isAdmin && window.location.pathname === '/admin'
        ? <AdminDashboard token={token} onBack={() => { window.history.pushState({}, '', '/'); window.location.reload() }} />
      : !user.couple
        ? <Connect token={token} user={user} onConnected={setUser} onLogout={() => { localStorage.removeItem(storageKeys.authToken); setToken(''); setUser(null) }} />
        : !user.couple.partner
          ? <PairingWaitingPage token={token} user={user} onUpdate={setUser} onLogout={() => { localStorage.removeItem(storageKeys.authToken); setToken(''); setUser(null) }} />
        : <Experience token={token} user={user} onUser={setUser} onLogout={() => { localStorage.removeItem(storageKeys.authToken); setToken(''); setUser(null) }} />
  return <div className="concept concept-cozy">{content}</div>
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
  return <div className="auth-shell"><div className="auth-brand"><span className="brand-mark">e</span><span className="brand-wordmark"><span>conecta</span><span className="brand-name-accent">dois</span></span></div><section className="auth-card fade-in"><div className="eyebrow">SEU ESPAÇO SEGURO</div><h1>{mode === 'register' ? 'Comece uma história a dois.' : 'Que bom ter você de volta.'}</h1><p>{mode === 'register' ? 'Crie seu acesso individual. Depois, conecte-se ao seu amor.' : 'Entre para continuar os momentos de vocês.'}</p><form onSubmit={submit}>{mode === 'register' && <label>Seu nome<input required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} /></label>}<label>Seu e-mail<input required type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} /></label><label>Senha<input required minLength={6} type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} placeholder="Mínimo de 6 caracteres" /></label>{error && <p className="form-error">{error}</p>}<button className="primary" disabled={busy}>{busy ? 'Aguarde…' : mode === 'register' ? 'Criar minha conta →' : 'Entrar →'}</button></form><button className="text-button" onClick={() => { setMode(mode === 'register' ? 'login' : 'register'); setError('') }}>{mode === 'register' ? 'Já tenho conta' : 'Quero criar uma conta'}</button></section></div>
}

function Connect({ token, user, onConnected, onLogout }: { token: string; user: ApiUser; onConnected: (user: ApiUser) => void; onLogout: () => void }) {
  const [joinCode, setJoinCode] = useState(''); const [anniversary, setAnniversary] = useState(''); const [error, setError] = useState('')
  async function action(path: string, payload: object) { try { setError(''); const data = await request<{ user: ApiUser }>(path, { method: 'POST', body: JSON.stringify(payload) }, token); onConnected(data.user) } catch (reason) { setError(reason instanceof Error ? reason.message : 'Erro inesperado.') } }
  return <div className="auth-shell"><div className="auth-brand"><span className="brand-mark">e</span><span className="brand-wordmark"><span>conecta</span><span className="brand-name-accent">dois</span></span></div><section className="connect-card fade-in"><div className="eyebrow">OLÁ, {user.name.toUpperCase()}</div><h1>Como vocês querem se conectar?</h1><p>Uma pessoa cria o espaço e compartilha o código. A outra entra com esse código.</p><div className="connect-options"><article><span>01</span><h2>Criar nosso espaço</h2><label>Data de início <small>(opcional)</small><input type="date" value={anniversary} onChange={e => setAnniversary(e.target.value)} /></label><button className="primary" onClick={() => action('/couples/create', { anniversary })}>Criar e receber código →</button></article><div className="or">OU</div><article><span>02</span><h2>Tenho um convite</h2><label>Código do casal<input value={joinCode} onChange={e => setJoinCode(e.target.value.toUpperCase())} placeholder="AMOR-0000" /></label><button className="primary" onClick={() => action('/couples/join', { code: joinCode })}>Entrar no espaço →</button></article></div>{error && <p className="form-error">{error}</p>}<button className="text-button" onClick={onLogout}>Sair desta conta</button></section></div>
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
  const [temperamentIndex, setTemperamentIndex] = useState(0)
  const [temperamentAnswers, setTemperamentAnswers] = useState<Temperament[]>(() => readJson(storageKeys.temperamentAnswers, []))
  const [streak, setStreak] = useState(() => Number(localStorage.getItem(storageKeys.streak) || 3))
  const [copied, setCopied] = useState(false)
  const [remote, setRemote] = useState<RemoteAnswer>({ complete: false, mine: '', answers: [] })

  useEffect(() => localStorage.setItem(storageKeys.member, member), [member])
  useEffect(() => localStorage.setItem(storageKeys.streak, String(streak)), [streak])
  function track(name: string, properties: Record<string, string> = {}) {
    void request('/events', { method: 'POST', body: JSON.stringify({ name, properties }) }, token).catch(() => undefined)
  }
  useEffect(() => { track('home_viewed', { screen: 'home' }) }, [])

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
  const temperamentResult = useMemo(() => {
    const names: Temperament[] = ['Colérico', 'Sanguíneo', 'Fleumático', 'Melancólico']
    const counts = names.reduce<Record<Temperament, number>>((all, name) => ({ ...all, [name]: temperamentAnswers.filter(answer => answer === name).length }), {} as Record<Temperament, number>)
    const total = temperamentAnswers.length || 1
    const percentages = names.reduce<Record<Temperament, number>>((all, name) => ({ ...all, [name]: Math.round((counts[name] / total) * 100) }), {} as Record<Temperament, number>)
    const ranked = [...names].sort((a, b) => counts[b] - counts[a])
    return { percentages, ranked }
  }, [temperamentAnswers])

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
    if (quizIndex === quiz.length - 1) { track('love_language_test_completed'); setStreak(value => value + 1); setScreen('result') } else setQuizIndex(value => value + 1)
  }
  function chooseTemperament(temperament: Temperament) {
    const next = [...temperamentAnswers.slice(0, temperamentIndex), temperament]
    setTemperamentAnswers(next)
    if (temperamentIndex === temperamentQuestions.length - 1) {
      track('temperament_test_completed')
      writeJson(storageKeys.temperamentAnswers, next)
      setStreak(value => value + 1)
      setScreen('temperamentResult')
    } else setTemperamentIndex(value => value + 1)
  }
  function startTemperament() {
    track('temperament_test_started'); setTemperamentIndex(0); setTemperamentAnswers([]); setScreen('temperament')
  }
  async function copyCode() {
    await navigator.clipboard?.writeText(user.couple?.code || ''); setCopied(true); window.setTimeout(() => setCopied(false), 1500)
  }

  return <div className="app-shell">
    <header className="topbar">
      <button className="brand" onClick={() => setScreen('home')}><span className="brand-mark">♥</span><span className="brand-name"><b><span>conecta</span><span className="brand-name-accent">dois</span></b><small>descubram mais. conectem-se mais.</small></span></button>
      <div className="account-actions">{user.isAdmin && <button className="admin-shortcut" onClick={() => setScreen('admin')}>Métricas</button>}<span className="active-name">{currentName}</span><button className="avatar" onClick={() => setScreen('profile')}>{currentName.charAt(0).toUpperCase()}</button></div>
    </header>
    <main>
      {screen === 'profile' && <section className="onboarding page fade-in"><div className="eyebrow">CONTA E CONEXÃO</div><h1>O espaço de vocês</h1><p className="lead">Sua conta é individual e está conectada ao espaço compartilhado do casal.</p><div className="connection-card"><div><div className="eyebrow">CONTA ATUAL</div><h2>{user.name}</h2><p>{user.email}</p></div><button className="invite-code" onClick={copyCode}><small>CÓDIGO DO CASAL</small><b>{user.couple?.code}</b><span>{copied ? 'Copiado!' : 'Copiar código'}</span></button><div className="member-row"><span><i className="member-dot" /> {user.couple?.partner ? `Conectado(a) com ${user.couple.partner.name}` : 'Aguardando seu amor entrar pelo código'}</span><button className="secondary" onClick={() => request<{ user: ApiUser }>('/me', {}, token).then(data => onUser(data.user))}>Atualizar</button></div><button className="text-button" onClick={onLogout}>Sair desta conta</button></div></section>}

      {screen === 'admin' && <AdminDashboard token={token} onBack={() => setScreen('home')} />}

      {screen === 'home' && <section className="page home fade-in">
        <div className="welcome"><div><div className="eyebrow">BOA NOITE, {currentName.toUpperCase()}</div><h1>Um pouco mais perto,<br/><em>todos os dias.</em></h1></div><div className="streak"><span>✦</span><b>{streak} dias</b><small>de conexão</small></div></div>
        <article className="daily-card"><div className="card-copy"><span className="pill light">RESPOSTA PRIVADA</span><h2>{privateQuestion.text}</h2><p>{bothAnswered ? 'As duas respostas estão prontas para serem descobertas.' : responses[member] ? `Sua resposta está guardada. Falta ${otherName} responder.` : 'Sua resposta fica em segredo até que os dois participem.'}</p><button onClick={openPrivate}>{bothAnswered ? 'Revelar respostas' : responses[member] ? 'Acompanhar resposta' : 'Responder em segredo'} <span>→</span></button></div><div className="orb">♡</div></article>
        <div className="section-title"><span>EXPLOREM JUNTOS</span><h2>Escolham o momento de hoje</h2></div>
        <div className="feature-grid">
          <button className="feature warm" onClick={() => { track('question_session_started', { level: 'leve' }); setLevel(1); setQuestionIndex(0); setScreen('questions') }}><span className="feature-icon">?</span><div><small>CONVERSAS</small><h3>Perguntas que aproximam</h3><p>Leves, profundas e feitas para vocês.</p></div><b>→</b></button>
          <button className="feature sage" onClick={() => { track('love_language_test_started'); setQuizIndex(0); setAnswers([]); setScreen('test') }}><span className="feature-icon">♡</span><div><small>DESCUBRAM-SE</small><h3>As linguagens do amor</h3><p>Entenda como cada um dá e recebe carinho.</p></div><b>→</b></button>
          <button className="feature gold" onClick={startTemperament}><span className="feature-icon">✦</span><div><small>PERSONALIDADE</small><h3>Os 4 temperamentos</h3><p>Descubra como você reage, sente e se conecta.</p></div><b>→</b></button>
          <button className="feature lilac" onClick={openPrivate}><span className="feature-icon">◉</span><div><small>ESPAÇO SEGURO</small><h3>Revelação mútua</h3><p>Cada um responde sem influenciar o outro.</p></div><b>→</b></button>
        </div><div className="tip"><span>✦</span><div><small>GESTO DE HOJE</small><p>{tips[result]}</p></div><button onClick={() => { track('daily_gesture_completed'); setStreak(value => value + 1) }}>✓</button></div>
      </section>}

      {screen === 'private' && <section className="page private-flow fade-in">
        <button className="back" onClick={() => setScreen('home')}>← Voltar</button>
        {!bothAnswered ? <><div className="privacy-badge">◉ PRIVADO ATÉ OS DOIS RESPONDEREM</div>
          <div className="quiz-intro"><div className="eyebrow">PERGUNTA PARA {currentName.toUpperCase()}</div><h1>{privateQuestion.text}</h1><p>{responses[member] ? 'Sua resposta está salva e continua privada.' : `${otherName} não verá sua resposta antes de responder.`}</p></div>
          <form className="answer-form" onSubmit={savePrivate}><textarea value={answerDraft} onChange={e => setAnswerDraft(e.target.value)} placeholder="Escreva com sinceridade. Este é um espaço seguro..." maxLength={500} /><div><small>{answerDraft.length}/500</small><button className="primary" type="submit">{responses[member] ? 'Atualizar resposta' : 'Guardar minha resposta'} →</button></div></form>
          {responses[member] && <div className="waiting-card"><span>✓</span><div><b>Sua parte está pronta</b><p>Agora é a vez de {otherName}. A resposta aparecerá quando a outra conta participar.</p></div><button className="secondary" onClick={refreshAnswers}>Atualizar status</button></div>}</>
          : <div className="reveal"><div className="result-mark">♡</div><div className="eyebrow">REVELAÇÃO MÚTUA</div><h1>Agora vocês podem se escutar.</h1><p className="lead">Leiam sem interromper. Depois conversem sobre o que mais tocou cada um.</p><div className="reveal-grid">{remote.answers.map(answer => <article key={answer.name}><small>{answer.name.toUpperCase()}</small><p>“{answer.text}”</p></article>)}</div><button className="primary" onClick={() => { track('mutual_reveal_viewed'); setStreak(value => value + 1); setScreen('home') }}>Concluir momento juntos →</button></div>}
      </section>}

      {screen === 'questions' && <section className="page game fade-in"><button className="back" onClick={() => setScreen('home')}>← Voltar</button><div className="game-head"><div><div className="eyebrow">CONVERSAS QUE APROXIMAM</div><h1>Sem pressa. Só presença.</h1></div><span>{questionIndex + 1} / {filtered.length}</span></div><div className="level-switch"><button className={level === 1 ? 'active' : ''} onClick={() => { setLevel(1); setQuestionIndex(0) }}>Leve</button><button className={level === 2 ? 'active' : ''} onClick={() => { setLevel(2); setQuestionIndex(0) }}>Profundo</button></div><article className="question-card"><span className="pill">{filtered[questionIndex].category}</span><div className="quote">“</div><h2>{filtered[questionIndex].text}</h2><p>Olhem um para o outro. Uma pessoa responde por vez.</p></article><div className="game-actions"><button className="secondary" onClick={() => setQuestionIndex(value => (value - 1 + filtered.length) % filtered.length)}>← Anterior</button><button className="primary" onClick={() => questionIndex === filtered.length - 1 ? (track('question_session_completed', { level: String(level) }), setScreen('home')) : setQuestionIndex(value => value + 1)}>{questionIndex === filtered.length - 1 ? 'Concluir sessão' : 'Próxima pergunta →'}</button></div></section>}

      {screen === 'test' && <section className="page quiz fade-in"><button className="back" onClick={() => setScreen('home')}>← Sair do teste</button><div className="progress"><i style={{ width: `${((quizIndex + 1) / quiz.length) * 100}%` }} /></div><div className="quiz-intro"><div className="eyebrow">LINGUAGENS DO AMOR · {quizIndex + 1} DE {quiz.length}</div><h1>O que faria você se sentir<br/><em>mais amado(a)?</em></h1><p>Não existe resposta certa. Escolha a que mais toca você.</p></div><div className="choices"><button onClick={() => choose(quiz[quizIndex].a.language)}><span>A</span><p>{quiz[quizIndex].a.text}</p><i>○</i></button><div>OU</div><button onClick={() => choose(quiz[quizIndex].b.language)}><span>B</span><p>{quiz[quizIndex].b.text}</p><i>○</i></button></div></section>}
      {screen === 'temperament' && <section className="page temperament-test fade-in">
        <button className="back" onClick={() => setScreen('home')}>← Sair do teste</button>
        <div className="temperament-progress"><span>PERFIL DE TEMPERAMENTO</span><b>{temperamentIndex + 1} de {temperamentQuestions.length}</b><i><em style={{ width: `${((temperamentIndex + 1) / temperamentQuestions.length) * 100}%` }} /></i></div>
        <div className="temperament-heading"><div className="eyebrow">{temperamentQuestions[temperamentIndex].context}</div><h1>O que mais se parece<br/>com <em>você?</em></h1><p>Escolha a reação mais natural, não a que parece ideal.</p></div>
        <article className="scenario-card"><small>CENÁRIO {String(temperamentIndex + 1).padStart(2, '0')}</small><h2>{temperamentQuestions[temperamentIndex].scenario}</h2></article>
        <div className="temperament-options">{temperamentQuestions[temperamentIndex].options.map((option, index) => <button key={option.temperament} onClick={() => chooseTemperament(option.temperament)}><span>{String.fromCharCode(65 + index)}</span><p>{option.text}</p><i>→</i></button>)}</div>
      </section>}

      {screen === 'temperamentResult' && <section className="page temperament-result fade-in">
        <div className="result-mark">✦</div><div className="eyebrow">SEU MAPA DE TEMPERAMENTO</div><h1>Você é uma combinação.<br/><em>Não um rótulo.</em></h1><p className="lead">Seu resultado mostra tendências de comportamento. Todas elas podem aparecer de formas diferentes conforme o momento e a relação.</p>
        <div className="temperament-chart">{temperamentResult.ranked.map((name, index) => <div className="temperament-bar" key={name}><div><span>{name}</span><b>{temperamentResult.percentages[name]}%</b></div><i><em style={{ width: `${temperamentResult.percentages[name]}%` }} /></i>{index === 0 && <small>TENDÊNCIA MAIS PRESENTE · {temperamentInsights[name].essence}</small>}</div>)}</div>
        <div className="relationship-context"><div className="section-title"><span>NA DINÂMICA A DOIS</span><h2>Como isso pode aparecer na relação</h2></div><div className="context-grid"><article><span>01</span><small>GESTÃO DE CONFLITOS</small><p>{temperamentInsights[temperamentResult.ranked[0]].conflict}</p></article><article><span>02</span><small>EXPRESSÃO DE AFETO</small><p>{temperamentInsights[temperamentResult.ranked[0]].affection}</p></article><article><span>03</span><small>RITMO DE VIDA</small><p>{temperamentInsights[temperamentResult.ranked[0]].rhythm}</p></article></div></div>
        <section className="partner-guide"><div className="partner-guide-head"><span>GUIA PARA O PARCEIRO</span><h2>Como amar este perfil</h2><p>{partnerSuggestions[temperamentResult.ranked[0]].intro}</p></div><div className="partner-tip-grid">{partnerSuggestions[temperamentResult.ranked[0]].tips.map((tip, index) => <article key={tip.title}><span>{String(index + 1).padStart(2, '0')}</span><div><h3>{tip.title}</h3><p>{tip.text}</p></div></article>)}</div><div className="secondary-note"><b>LEMBRE TAMBÉM DO {temperamentResult.ranked[1].toUpperCase()}</b><p>Como essa é sua segunda tendência, gestos ligados a <strong>{temperamentInsights[temperamentResult.ranked[1]].essence.toLowerCase()}</strong> também podem fazer você se sentir compreendido(a).</p></div></section>
        <div className="blend-card"><span>VOCÊ TAMBÉM CARREGA</span><h2>{temperamentResult.ranked[1]}</h2><p>{temperamentInsights[temperamentResult.ranked[1]].essence} complementa sua tendência principal e traz novas possibilidades para a relação.</p></div>
        <div className="result-actions"><button className="secondary" onClick={startTemperament}>Refazer teste</button><button className="primary" onClick={() => setScreen('home')}>Voltar ao nosso espaço →</button></div>
      </section>}

      {screen === 'result' && <section className="page result fade-in"><div className="result-mark">♡</div><div className="eyebrow">SEU JEITO DE RECEBER AMOR</div><h1>{result}</h1><p className="lead">Você se sente especialmente amado(a) quando esse cuidado aparece nas pequenas escolhas do cotidiano.</p><div className="result-card"><small>UMA IDEIA PARA HOJE</small><p>{tips[result]}</p></div><button className="primary" onClick={() => setScreen('home')}>Voltar ao nosso espaço →</button></section>}
    </main>
    {screen !== 'admin' && <nav className="bottom-nav"><button className={screen === 'home' ? 'active' : ''} onClick={() => setScreen('home')}><span>⌂</span>Início</button><button className={screen === 'questions' ? 'active' : ''} onClick={() => setScreen('questions')}><span>◌</span>Explorar</button><button className={screen === 'private' || screen === 'test' || screen === 'result' ? 'active' : ''} onClick={openPrivate}><span>♡</span>Nós</button><button className={screen === 'profile' ? 'active' : ''} onClick={() => setScreen('profile')}><span>♙</span>Perfil</button></nav>}
  </div>
}
