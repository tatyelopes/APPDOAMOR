import { useEffect, useState } from 'react'
import { apiRequest } from '../../shared/api/http-client'
import type { AdminMetrics } from '../../shared/types/domain'

type Props = { token: string; onBack: () => void }

function Metric({ label, value, detail }: { label: string; value: string | number; detail: string }) {
  return <article className="admin-metric"><small>{label}</small><strong>{value}</strong><p>{detail}</p></article>
}

export function AdminDashboard({ token, onBack }: Props) {
  const [metrics, setMetrics] = useState<AdminMetrics | null>(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  async function load() {
    setLoading(true); setError('')
    try { setMetrics(await apiRequest<AdminMetrics>('/admin/metrics', {}, token)) }
    catch (reason) { setError(reason instanceof Error ? reason.message : 'Não foi possível carregar as métricas.') }
    finally { setLoading(false) }
  }

  useEffect(() => { void load() }, [])

  if (loading) return <section className="page admin-dashboard"><button className="back" onClick={onBack}>← Voltar</button><p>Consolidando métricas…</p></section>
  if (!metrics) return <section className="page admin-dashboard"><button className="back" onClick={onBack}>← Voltar</button><p className="form-error">{error}</p><button className="secondary" onClick={load}>Tentar novamente</button></section>

  const maxTrend = Math.max(1, ...metrics.trend.map(item => item.activeCouples))
  return <section className="page admin-dashboard fade-in">
    <div className="admin-heading"><div><div className="eyebrow">PAINEL ADMINISTRATIVO</div><h1>Saúde do produto</h1><p>Dados agregados, sem conteúdo de respostas ou resultados íntimos.</p></div><button className="secondary" onClick={load}>Atualizar</button></div>
    <article className="north-star-card"><div><small>NORTH STAR</small><h2>{metrics.northStar.name}</h2><p>Casais que concluíram ao menos uma experiência mútua nos últimos 7 dias.</p></div><strong>{metrics.northStar.value}</strong><span>{metrics.northStar.rate}% dos {metrics.northStar.eligibleCouples} casais pareados</span></article>

    <h2 className="admin-section-title">Aquisição e ativação</h2>
    <div className="admin-grid">
      <Metric label="NOVOS USUÁRIOS · 7 DIAS" value={metrics.acquisition.registeredUsers7d} detail={`${metrics.acquisition.registeredUsers30d} nos últimos 30 dias`} />
      <Metric label="ESPAÇOS CRIADOS" value={metrics.acquisition.coupleSpacesCreated} detail="convites iniciados" />
      <Metric label="CASAIS PAREADOS" value={metrics.activation.pairedCouples} detail={`${metrics.activation.inviteToPairRate}% dos espaços`} />
      <Metric label="PRIMEIRA EXPERIÊNCIA" value={metrics.activation.couplesWithFirstMutualExperience} detail={`${metrics.activation.pairedToFirstExperienceRate}% dos casais pareados`} />
    </div>

    <h2 className="admin-section-title">Engajamento e retenção</h2>
    <div className="admin-grid">
      <Metric label="CASAIS ATIVOS · 7 DIAS" value={metrics.engagement.weeklyActiveCouples} detail={`${metrics.engagement.monthlyActiveCouples} ativos em 30 dias`} />
      <Metric label="EXPERIÊNCIAS MÚTUAS · 7 DIAS" value={metrics.engagement.mutualExperiences7d} detail={`${metrics.engagement.reciprocityRate7d}% de reciprocidade`} />
      <Metric label="RETENÇÃO D7" value={`${metrics.retention.day7.rate}%`} detail={`${metrics.retention.day7.retained} de ${metrics.retention.day7.eligible} elegíveis`} />
      <Metric label="RETENÇÃO D30" value={`${metrics.retention.day30.rate}%`} detail={`${metrics.retention.day30.retained} de ${metrics.retention.day30.eligible} elegíveis`} />
      <Metric label="RETENÇÃO D90" value={`${metrics.retention.day90.rate}%`} detail={`${metrics.retention.day90.retained} de ${metrics.retention.day90.eligible} elegíveis`} />
    </div>

    <h2 className="admin-section-title">Tendência semanal</h2>
    <div className="admin-trend">{metrics.trend.map(item => <div key={item.start}><span title={`${item.activeCouples} casais ativos`} style={{ height: `${Math.max(4, item.activeCouples / maxTrend * 100)}%` }} /><small>{new Date(`${item.start}T12:00:00`).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}</small><b>{item.activeCouples}</b></div>)}</div>

    <h2 className="admin-section-title">Monetização e segurança</h2>
    <div className="admin-grid">
      <Metric label="TESTES PREMIUM" value={metrics.monetization.trialsStarted} detail={`${metrics.monetization.trialToPaidRate}% converteram`} />
      <Metric label="CASAIS PAGANTES" value={metrics.monetization.payingCouples} detail={`${metrics.monetization.cancellations} cancelamentos registrados`} />
      <Metric label="INCIDENTES DE PRIVACIDADE" value={metrics.safety.privacyIncidents} detail="meta permanente: zero" />
      <Metric label="SINAIS DE SEGURANÇA" value={metrics.safety.safetyHelpOpened + metrics.safety.notificationsMuted + metrics.safety.unlinkedCouples} detail="ajuda, silenciamento e desvinculação" />
    </div>
    <footer className="admin-footer"><span>Atualizado em {new Date(metrics.generatedAt).toLocaleString('pt-BR')}</span><button className="text-button" onClick={onBack}>Voltar ao aplicativo</button></footer>
  </section>
}
