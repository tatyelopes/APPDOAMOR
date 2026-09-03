# Métricas de sucesso e North Star — Conectadois

**Versão:** 1.0 — 2 de setembro de 2026  
**Objetivo:** medir valor entregue ao casal, saúde do funil, sustentabilidade e segurança sem acessar conteúdo íntimo.

## 1. North Star

### Casais com experiência mútua significativa na semana

**Definição:** quantidade de casais pareados que concluíram ao menos uma experiência mútua nos últimos 7 dias.

**Taxa exibida:** casais com experiência mútua nos últimos 7 dias ÷ total de casais pareados × 100.

No MVP, uma experiência mútua é contabilizada quando as duas contas respondem à mesma pergunta privada. O evento é gravado uma única vez por casal e pergunta. Conforme novos fluxos forem implementados, poderão entrar na definição apenas experiências que exigem contribuição ou confirmação dos dois — nunca simples visualizações.

**Por que esta métrica:** ela combina ativação dos dois parceiros, reciprocidade, valor entregue e recorrência. Downloads, cadastros, tempo de tela e respostas individuais podem crescer sem que o casal se conecte; por isso não são a North Star.

## 2. Árvore de métricas

| Dimensão | Métrica | Definição | Uso |
|---|---|---|---|
| Aquisição | Novos usuários 7/30 dias | Cadastros concluídos no período | Acompanhar alcance |
| Aquisição | Espaços criados | Casais iniciados com código de convite | Medir intenção de parear |
| Ativação | Conversão convite → pareamento | Casais com duas contas ÷ espaços criados | Encontrar fricção bilateral |
| Ativação | Pareamento → primeira experiência | Casais com primeira experiência mútua ÷ casais pareados | Confirmar primeiro valor |
| Engajamento | Casais ativos semanais | Casais com ação significativa em 7 dias | Medir hábito |
| Engajamento | Casais ativos mensais | Casais com ação significativa em 30 dias | Medir alcance ativo |
| Engajamento | Experiências mútuas semanais | Total de experiências concluídas pelos dois em 7 dias | Medir frequência de valor |
| Engajamento | Reciprocidade | Casais com conclusão mútua ÷ casais com resposta iniciada no período | Detectar abandono do parceiro |
| Retenção | D7, D30 e D90 | Casais elegíveis que voltaram a uma ação significativa após cada marco | Medir continuidade |
| Monetização | Testes Premium | Casais que iniciaram teste | Medir interesse comercial |
| Monetização | Conversão teste → pago | Casais assinantes ÷ casais que testaram | Validar oferta e preço |
| Monetização | Casais pagantes | Assinaturas iniciadas menos casais com cancelamento registrado | Acompanhar base pagante |
| Segurança | Incidentes de privacidade | Incidentes confirmados | Guardrail com meta zero |
| Segurança | Sinais de segurança | Ajuda aberta, notificações silenciadas e desvinculações | Investigar pressão ou inadequação |

## 3. Eventos instrumentados

### Eventos automáticos do servidor

- `user_registered`
- `user_logged_in`
- `couple_created`
- `couple_paired`
- `answer_submitted`
- `mutual_experience_completed`

### Eventos do produto

- `home_viewed`
- `question_session_started` e `question_session_completed`
- `love_language_test_started` e `love_language_test_completed`
- `temperament_test_started` e `temperament_test_completed`
- `mutual_reveal_viewed`
- `daily_gesture_completed`
- eventos preparados para faturamento e segurança: `trial_started`, `subscription_started`, `subscription_cancelled`, `notification_muted` e `safety_help_opened`.

Eventos de monetização permanecem zerados até os respectivos fluxos existirem. O painel não simula receita nem assinaturas.

## 4. Privacidade da medição

O armazenamento analítico contém somente:

- nome técnico do evento;
- data e hora;
- identificadores internos de usuário e casal;
- propriedades permitidas: origem, plano, tela, nível e identificador técnico da pergunta.

Não são enviados ao evento textos de respostas, alternativas escolhidas, linguagem do amor, temperamento, nomes, e-mails ou conteúdo de conversas. Métricas administrativas são agregadas e o endpoint exige conta autorizada.

Antes da produção, a persistência JSON deve migrar para PostgreSQL, com política de retenção, trilha de auditoria, backup, controles de acesso e revisão LGPD.

## 5. Acesso administrativo

Defina os e-mails autorizados no ambiente do servidor, separados por vírgula:

```powershell
$env:ADMIN_EMAILS='administradora@dominio.com.br'
npm.cmd run dev
```

Depois, entre no aplicativo com exatamente esse e-mail. O botão **Métricas** aparecerá no cabeçalho de uma conta pareada. Uma administradora ainda não pareada também pode acessar diretamente `/admin` após autenticar. A autorização é verificada novamente no servidor; esconder o botão não é o controle de segurança.

Em produção, configurar `ADMIN_EMAILS` no provedor de hospedagem e substituir essa autorização simples por papéis persistidos, MFA e auditoria antes de ampliar a equipe administrativa.

## 6. Metas iniciais para o piloto

Metas abaixo são hipóteses operacionais e devem ser recalibradas após 4–8 semanas:

| Indicador | Meta piloto |
|---|---:|
| Convite → pareamento | ≥ 55% |
| Pareamento → primeira experiência mútua | ≥ 60% |
| North Star / casais pareados | ≥ 35% por semana |
| Reciprocidade semanal | ≥ 65% |
| Retenção D7 | ≥ 35% |
| Retenção D30 | ≥ 20% |
| Incidentes confirmados de privacidade | 0 |

Ainda não estabelecer meta de conversão paga antes de disponibilizar o teste Premium e validar a entrega gratuita.

## 7. Limitações atuais

- O painel mostra contagens desde a implantação da instrumentação; ações anteriores não são reconstruídas.
- Retenção exige que o casal tenha `createdAt`, portanto dados legados sem data não entram no denominador.
- A experiência mútua atual é a pergunta privada; outros fluxos ainda são individuais ou presenciais e não contam na North Star.
- Incidentes de privacidade precisam de um fluxo operacional de registro; até ele existir, “zero” significa nenhum incidente registrado no sistema, não prova ausência absoluta.
- Métricas financeiras completas — MRR, ARR, ARPPU, churn de receita e LTV — dependem da integração de cobrança.
