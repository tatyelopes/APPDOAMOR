# Responsáveis e matriz RACI — Conectadois

**Versão:** 1.0 — 2 de setembro de 2026  
**Responsável final pelo produto:** Tatyele Lopes, fundadora e Product Owner  
**Status:** estrutura de papéis definida; nomes das funções técnicas e especializadas devem ser confirmados antes do início dos respectivos trabalhos.

## 1. Objetivo

Definir quem lidera, executa, aprova e acompanha cada frente do Conectadois, evitando:

- decisões sem responsável;
- múltiplas pessoas acreditando possuir a aprovação final;
- atividades críticas de segurança ou conteúdo sem revisão;
- concentração invisível de trabalho na fundadora;
- atrasos causados por consulta tardia;
- lançamento sem aceite técnico, jurídico ou de qualidade.

## 2. Convenção RACI

- **R — Responsible / Responsável pela execução:** realiza ou coordena diretamente o trabalho.
- **A — Accountable / Aprovador final:** responde pelo resultado e toma a decisão final. Deve existir apenas um A por entrega.
- **C — Consulted / Consultado:** contribui antes da decisão.
- **I — Informed / Informado:** recebe a decisão ou o andamento, sem bloquear a entrega.

RACI não substitui colaboração. Ele esclarece quem decide quando opiniões divergem.

## 3. Estrutura mínima de papéis

| Código | Papel | Ocupação | Responsabilidades principais | Dedicação de referência |
|---|---|---|---|---:|
| **PO** | Fundadora e Product Owner | **Tatyele Lopes** | visão, prioridade, escopo, aceite, orçamento, marca e decisão de lançamento | alta |
| **TL** | Liderança técnica | a nomear | arquitetura, segurança técnica, padrões, decisões de engenharia e liberação técnica | alta |
| **BE** | Engenharia backend/dados | a nomear | API, autenticação, PostgreSQL, autorização, analytics e integrações | alta |
| **FE** | Engenharia frontend | a nomear | PWA, fluxos, estado, acessibilidade técnica e instrumentação cliente | alta |
| **PD** | Product Designer | a nomear | jornada, UX, UI, protótipos, design system e testes de usabilidade | média/alta |
| **RC** | Pesquisa e Conteúdo | a nomear | recrutamento, entrevistas, síntese, taxonomia, escrita e operação editorial | alta no discovery |
| **ER** | Especialista em Relacionamentos | a contratar/nomear | revisão ética e técnica de atividades profundas, afeto, conflito e intimidade | parcial |
| **QA** | Qualidade | a nomear | estratégia, testes, compatibilidade, regressão, UAT e evidência de aceite | média/alta |
| **DP** | DevOps/Plataforma | a nomear ou acumular com TL | ambientes, CI/CD, segredos, banco, backup e observabilidade | parcial/média |
| **PJ** | Privacidade e Jurídico | apoio externo ou interno a nomear | LGPD, termos, propriedade intelectual, consentimento e risco jurídico | parcial |
| **GO** | Growth e Operações | a nomear ou acumular com PO | recrutamento, comunicação, suporte, lançamento, aquisição e rotina operacional | média no piloto |

### Acúmulos aceitáveis no início

- TL pode acumular DP.
- BE e FE podem ser uma pessoa full-stack se o cronograma for recalculado.
- PO pode acumular GO temporariamente.
- RC pode acumular redação editorial.

### Acúmulos não recomendados sem revisão independente

- autora de conteúdo profundo ser a única revisora especializada;
- pessoa que implementa autorização ser a única a testá-la;
- PO ser a única aprovadora de privacidade/jurídico;
- desenvolvimento aprovar sozinho o go/no-go;
- entrevistadora usar respostas individuais para mediar o casal.

## 4. Autoridade de decisão

| Decisão | Aprovador final | Responsável pela recomendação | Consultados |
|---|---|---|---|
| Visão, público e proposta de valor | PO | PO/RC | PD, GO |
| Escopo e prioridade | PO | PO | TL, PD, RC, QA |
| Arquitetura e padrão técnico | TL | TL | BE, FE, DP, QA |
| Segurança de aplicação | TL | TL/BE | QA, PJ, DP |
| Privacidade, LGPD e termos | PJ | PJ | PO, TL, RC |
| Jornada e interface | PO | PD | RC, FE, QA |
| Conteúdo leve e médio | RC | RC | PD, PO |
| Conteúdo profundo ou íntimo | ER | RC/ER | PJ, PO, PD |
| Aceite funcional | PO | QA | PD, TL, RC |
| Liberação técnica | TL | QA/DP | BE, FE, PJ |
| Go/no-go do piloto | PO | PO | TL, QA, PJ, RC, GO |
| Incidente crítico de segurança | TL | TL/DP | PO, PJ, QA |
| Comunicação a participantes em incidente | PO | GO/PJ | TL, QA |
| Preço e monetização | PO | PO/GO | PJ, TL |

Conteúdo profundo ou íntimo não é publicado sem aceite do ER. Questões legais não são decididas por produto ou engenharia sem PJ.

## 5. Matriz RACI por frente

Legenda: R, A, C, I e `R/A` quando o mesmo papel executa e aprova uma entrega de baixo risco.

| Frente/entrega | PO | TL | BE | FE | PD | RC | ER | QA | DP | PJ | GO |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| Visão e proposta de valor | A/R | I | I | I | C | C | I | I | I | I | C |
| Público e personas | A | I | I | I | C | R | C | I | I | I | C |
| Entrevistas e síntese | A | I | I | I | C | R | C | I | I | C | C |
| Concorrência e modelo de negócio | A/R | I | I | I | C | C | I | I | I | C | C |
| PRD, MoSCoW e escopo | A/R | C | C | C | C | C | I | C | I | C | C |
| Cronograma e governança | A/R | C | I | I | C | C | I | C | C | I | C |
| Naming e identidade | A | I | I | I | R | C | I | I | I | C | C |
| Jornada, IA e wireframes | A | I | I | C | R | C | I | C | I | I | I |
| Protótipo e usabilidade | A | I | I | C | R | C | I | C | I | I | C |
| Arquitetura | I | A/R | C | C | I | I | I | C | C | C | I |
| Modelo de dados e API | I | A | R | C | I | C | I | C | C | C | I |
| Ameaças e autorização | I | A/R | R | C | I | I | I | R | C | C | I |
| Ambientes, CI/CD e banco | I | A | C | C | I | I | I | C | R | C | I |
| Backend e analytics | I | A | R | C | I | C | I | C | C | I | I |
| Frontend/PWA | I | A | C | R | C | C | I | C | C | I | I |
| Catálogo e gestão editorial | A | C | R | C | C | R | C | C | I | C | I |
| Conteúdo leve/médio | I | I | I | I | C | A/R | C | C | I | C | I |
| Conteúdo profundo/íntimo | C | I | I | I | C | R | A | C | I | C | I |
| Testes automatizados | I | A | R | R | I | I | I | R | C | I | I |
| QA exploratório e UAT | A | C | C | C | C | C | I | R | C | I | C |
| Acessibilidade | A | C | I | R | R | C | I | R | I | I | I |
| LGPD, termos e consentimentos | C | C | C | C | I | C | C | I | I | A/R | I |
| Suporte e incidentes | A | C | I | I | I | C | I | C | C | C | R |
| Recrutamento do piloto | A | I | I | I | C | C | I | I | I | C | R |
| Operação do piloto | A | C | C | C | C | R | C | R | C | C | R |
| Métricas e relatório do piloto | A | C | R | I | C | R | C | C | I | I | C |
| Go/no-go | A | C | I | I | I | C | I | C | I | C | C |
| Publicação | A | C | I | I | I | I | I | C | R | C | C |

## 6. Responsáveis por fase

| Fase | Responsável operacional principal | Aprovador |
|---|---|---|
| Descoberta | PO ou RC, conforme a atividade | PO |
| Planejamento | PO | PO |
| Marca | PD | PO |
| UX/UI | PD | PO |
| Arquitetura | TL | TL |
| Infraestrutura | DP | TL |
| Backend | BE | TL |
| Frontend | FE | TL |
| Conteúdo | RC | RC ou ER para conteúdo sensível |
| Qualidade | QA | PO para aceite e TL para liberação técnica |
| Jurídico | PJ | PJ |
| Lançamento | GO ou DP, conforme a atividade | PO |
| Pós-lançamento | GO/PO | PO |

Essas regras foram aplicadas à coluna “Responsável” da planilha operacional. O nome da pessoa deve substituir o papel depois da designação, mantendo o papel entre parênteses durante a transição.

## 7. RACI dos marcos

| Marco | R | A | C | I |
|---|---|---|---|---|
| MC1 — Baseline aprovada | PO | PO | TL, PD, RC, QA | equipe |
| MC2 — Personas e oportunidades | RC | PO | PD, ER, GO | TL, QA |
| MC3 — Mecânicas e padrão editorial | PD, RC | PO | ER, FE, QA | TL, BE |
| MC4 — Fundação técnica | TL, BE, DP | TL | FE, QA, PJ | PO |
| MC5 — MVP feature-complete | BE, FE | TL | PD, RC, QA | PO, GO |
| MC6 — Conteúdo do piloto | RC | ER | PO, PD, PJ | TL, QA, GO |
| MC7 — Release candidate | QA, DP | TL | PO, PJ, BE, FE | RC, GO |
| MC8 — Go/no-go | PO | PO | TL, QA, PJ, RC, GO | equipe |
| MC9 — Piloto concluído | RC, GO | PO | QA, TL, PD | equipe |
| MC10 — Decisão comercial | PO, RC | PO | TL, QA, PJ, GO | equipe |

## 8. Rituais e facilitadores

| Ritual | Facilitador | Quem decide | Registro |
|---|---|---|---|
| Planejamento quinzenal | PO | PO sobre prioridade; TL sobre viabilidade | backlog e objetivo do ciclo |
| Check-in diário assíncrono | cada R | responsável da frente remove bloqueio | canal da equipe |
| Revisão produto/conteúdo | PD ou RC | PO/RC/ER conforme matéria | decisão editorial/produto |
| Revisão técnica e risco | TL | TL | riscos e decisões técnicas |
| Demo e aceite | PO | PO e TL nos respectivos aceites | aceite ou ajuste por tarefa |
| Retrospectiva | papel rotativo | equipe escolhe melhoria | ação, responsável e prazo |
| Go/no-go | PO | PO, respeitando bloqueios TL/PJ | ata de decisão |

## 9. Escalonamento

### Produto versus técnica

PO decide prioridade e resultado desejado; TL decide se a implementação é segura e tecnicamente liberável. Se houver conflito, o item não é liberado até existir alternativa aceita por ambos.

### Produto versus privacidade/jurídico

PJ pode bloquear tratamento de dados, termo, conteúdo ou fluxo incompatível com obrigação legal. PO decide se ajusta, adia ou remove o item.

### Conteúdo versus especialista

RC decide conteúdo leve/médio. ER possui aprovação final de conteúdo profundo, íntimo, de conflito ou que use teorias psicológicas.

### Prazo

- bloqueio crítico: decisão no mesmo dia útil;
- decisão normal: até dois dias úteis;
- sem decisão: escalar ao A indicado;
- risco crítico de segurança/privacidade: interromper publicação.

## 10. Cobertura das 107 tarefas

A planilha usa as seguintes regras para o campo Responsável:

- descoberta de produto, mercado e negócio → PO;
- pesquisa → RC;
- planejamento e gestão → PO;
- branding e design → PD;
- marca/jurídico → PJ;
- UX/UI → PD;
- arquitetura → TL, com dados sob BE e privacidade sob PJ;
- infraestrutura → DP;
- backend → BE;
- frontend → FE;
- conteúdo → RC;
- qualidade → QA;
- jurídico → PJ;
- lançamento de infraestrutura → DP;
- lançamento de produto/operação → GO;
- pós-lançamento → PO, GO ou TL conforme a área.

Essa designação é operacional e deve ser revisada quando pessoas forem nomeadas ou quando capacidade real exigir redistribuição.

## 11. Vagas/nomeações críticas

Antes do marco correspondente, confirmar:

| Papel | Prazo máximo | Risco se vazio |
|---|---:|---|
| RC | antes do recrutamento | entrevistas e conteúdo sem dono |
| TL | antes de decisões de arquitetura | risco técnico e de segurança |
| BE/FE | antes da construção do núcleo | cronograma inviável |
| PD | antes dos protótipos | experiência não validada |
| ER | antes do conteúdo profundo | risco ético e editorial |
| PJ | antes do inventário LGPD e termos | piloto/comercialização bloqueados |
| QA | antes do feature-complete | qualidade tardia e retrabalho |
| GO | antes do recrutamento do piloto | coorte e suporte insuficientes |

## 12. Riscos de responsabilidade

- **PO sobrecarregada:** delegar facilitação, pesquisa operacional e acompanhamento diário.
- **TL acumulando desenvolvimento e plataforma:** reduzir trabalho paralelo ou nomear apoio DP.
- **RC sem especialista:** limitar conteúdo a temas leves/médios.
- **QA entrando tarde:** incluir critérios e automação desde a história.
- **PJ consultado no fim:** revisar dados e conteúdo antes de implementação.
- **Múltiplos aprovadores:** manter um único A por entrega.
- **Papéis sem nomes:** tratar como bloqueio de cronograma, não como detalhe administrativo.

## 13. Próximas ações

1. Tatyele confirma ou ajusta sua função de Product Owner.
2. Nomear TL, RC e PD primeiro, pois desbloqueiam as frentes iniciais.
3. Confirmar se BE/FE serão duas pessoas ou uma função full-stack.
4. Contratar ou designar ER e PJ antes de conteúdo profundo e dados reais.
5. Nomear QA antes do início da construção do núcleo.
6. Substituir papéis por nomes na planilha sem remover a referência ao papel.
7. Revisar capacidade e recalcular o cronograma se houver acúmulos.
8. Revalidar a RACI no início do piloto e antes do lançamento comercial.

## 14. Aprovação

| Papel | Nome | Decisão | Data |
|---|---|---|---|
| Fundadora/Product Owner | Tatyele Lopes | Aprovar / ajustar |  |
| Liderança técnica |  | Aceitar papel / ajustar |  |
| Pesquisa e conteúdo |  | Aceitar papel / ajustar |  |
| Product Design |  | Aceitar papel / ajustar |  |
| Qualidade |  | Aceitar papel / ajustar |  |
| Privacidade/jurídico |  | Aceitar papel / ajustar |  |

Mudanças de papel devem atualizar este documento, a planilha e os marcos afetados.
