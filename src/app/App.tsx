import FullApp, {
  ConnectionWireframe,
  HomeWireframe,
  LoveLanguageWireframe,
  LoveMailWireframe,
  PairingWaitingWireframe,
  ProfileWireframe,
  QuestionRoundWireframe,
  QuestionsWireframe,
  RegistrationWireframe,
} from '../App'
import { OnboardingPage } from '../features/onboarding/OnboardingPage'
import MpvEntryApp from '../features/mpv/MpvEntryApp'

function EntryWireframe() {
  const requestedStep = Number.parseInt(
    new URLSearchParams(window.location.search).get('etapa') ?? '1',
    10,
  )

  return (
    <div className="concept concept-cozy">
      <OnboardingPage
        initialStep={requestedStep - 1}
        onComplete={() => window.location.assign('/wireframes/cadastro')}
        onLogin={() => window.location.assign('/wireframes/cadastro')}
      />
    </div>
  )
}

export default function App() {
  const pathname = window.location.pathname

  if (pathname === '/wireframes/entrada') return <EntryWireframe />
  if (pathname === '/wireframes/cadastro') return <RegistrationWireframe />
  if (pathname === '/wireframes/conectar') return <ConnectionWireframe />
  if (pathname === '/wireframes/convite') return <PairingWaitingWireframe />
  if (pathname === '/wireframes/home') return <HomeWireframe />
  if (pathname === '/wireframes/perguntas') return <QuestionsWireframe />
  if (pathname === '/wireframes/pergunta') return <QuestionRoundWireframe />
  if (pathname === '/wireframes/correio') return <LoveMailWireframe />
  if (pathname === '/wireframes/perfil') return <ProfileWireframe />
  if (pathname === '/wireframes/linguagens-do-amor') return <LoveLanguageWireframe />
  if (pathname.startsWith('/app')) return <FullApp />

  return <MpvEntryApp />
}
