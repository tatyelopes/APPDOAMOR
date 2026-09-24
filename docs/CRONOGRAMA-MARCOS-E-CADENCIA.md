Definir responsáveis e matriz RACI# Cronograma, marcos e cadência — Conectadois

**Versão:** 1.1 — atualizada em 21 de setembro de 2026
**Início planejado:** 7 de setembro de 2026  
**Fim do ciclo de MVP:** 5 de março de 2027  
**Horizonte:** preparação, construção, piloto fechado de 6 semanas e decisão de avanço  
**Status:** linha de base para acompanhamento

## 1. Resultado esperado

Ao final deste cronograma, o projeto terá:

- visão, personas, PRD e escopo aprovados;
- conteúdo inicial pesquisado, produzido e validado;
- PWA com três mecânicas centrais funcionando em dois dispositivos;
- infraestrutura, privacidade e operação adequadas ao piloto;
- painel administrativo e métricas confiáveis;
- piloto de seis semanas com 40 a 60 casais;
- relatório de resultados e decisão sobre o MVP comercial.

O cronograma termina em uma decisão baseada em evidências, não em uma publicação automática.

## 2. Premissas de capacidade

Esta linha de base assume disponibilidade equivalente a:

- 1 responsável de produto/pesquisa;
- 1 designer de produto, integral ou parcial;
- 2 pessoas de engenharia com cobertura frontend e backend;
- 1 responsável por conteúdo, com apoio de especialista;
- apoio parcial de qualidade, privacidade/jurídico e operação.

Papéis podem ser acumulados, mas a capacidade total precisa existir. Com apenas uma pessoa executando produto, pesquisa, design, conteúdo e engenharia, a previsão deve ser recalculada; a duração provável será substancialmente maior.

Outras premissas:

- ciclos de duas semanas;
- decisões em até dois dias úteis;
- entrevistas recrutadas enquanto produto e arquitetura avançam;
- nenhuma funcionalidade Won't do MoSCoW entra no ciclo;
- conteúdo profundo não é publicado sem revisão;
- período de 21 de dezembro a 8 de janeiro reservado para estabilização e disponibilidade reduzida;
- piloto não começa com bloqueador crítico de segurança, privacidade ou dados.

## 3. Visão geral do cronograma

| Fase | Período | Duração | Resultado |
|---|---|---:|---|
| 0. Alinhamento e aprovação | 07/09–18/09/2026 | 2 semanas | PRD e escopo aprovados, papéis e linha de base confirmados |
| 1. Pesquisa com casais | 07/09–02/10/2026 | 4 semanas | 24 entrevistas, personas revisadas e oportunidades de conteúdo |
| 2. Conceito e conteúdo inicial | 21/09–16/10/2026 | 4 semanas | três mecânicas prototipadas e primeiro lote testado |
| 3. Fundação técnica | 21/09–23/10/2026 | 5 semanas | dados, API, ambientes, PostgreSQL e segurança-base |
| 4. Construção do núcleo | 05/10–20/11/2026 | 7 semanas | jornada bilateral e administração feature-complete |
| 5. Conteúdo do piloto | 12/10–27/11/2026 | 7 semanas | 60 atividades revisadas, testadas e publicáveis |
| 6. Qualidade e conformidade | 16/11–18/12/2026 | 5 semanas | testes, acessibilidade, privacidade e operação prontas |
| 7. Estabilização e recrutamento | 07/12/2026–08/01/2027 | 5 semanas | coorte confirmada, UAT concluído e release candidate |
| 8. Piloto fechado | 11/01–19/02/2027 | 6 semanas | uso real acompanhado com pesquisa e métricas |
| 9. Síntese e decisão | 22/02–05/03/2027 | 2 semanas | resultados, aprendizados e decisão de avanço |

As fases se sobrepõem deliberadamente. Pesquisa, conteúdo, design e engenharia precisam trocar resultados durante o ciclo, sem esperar uma fase terminar completamente para iniciar a seguinte.

## 4. Cronograma detalhado

### Fase 0 — alinhamento e aprovação

**Período:** 7 a 18 de setembro de 2026

- revisar e aprovar visão, proposta de valor e público provisório;
- revisar PRD v0.9 e questões abertas;
- aprovar escopo do MVP e priorização MoSCoW;
- definir responsáveis e capacidade real;
- confirmar canais de decisão e gestão do backlog;
- definir critérios de mudança de escopo;
- aprovar plano de recrutamento e consentimento.

**Saída:** baseline de produto e execução aprovada.

### Fase 1 — pesquisa com casais

**Período:** 7 de setembro a 2 de outubro de 2026

- semana 1: recrutamento, triagem e duas entrevistas-piloto;
- semanas 2 e 3: entrevistas individuais e sessões conjuntas selecionadas;
- semana 4: síntese, revisão das personas e oportunidades;
- debrief a cada três casais para ajustar sondagens sem mudar silenciosamente o objetivo;
- separar descoberta de problema de teste de solução.

**Saída:** 24 entrevistas individuais, mapa de ocasiões, temas, formatos e limites.

### Fase 2 — conceito e conteúdo inicial

**Período:** 21 de setembro a 16 de outubro de 2026

- prototipar resposta guardada, adivinhação e escolhas coincidentes;
- testar convite, primeira atividade, revelação e fechamento;
- definir taxonomia e guia editorial;
- produzir primeiro lote de 15 a 20 atividades;
- realizar revisão de linguagem, inclusão e risco;
- decidir profundidade e duração padrão do piloto.

**Saída:** mecânicas validadas o suficiente para implementação e conteúdo-padrão aprovado.

### Fase 3 — fundação técnica

**Período:** 21 de setembro a 23 de outubro de 2026

- fechar modelo de dados e contrato da API;
- provisionar PostgreSQL e migrações;
- separar ambientes local, homologação e piloto;
- configurar CI, segredos, logs, métricas e backup;
- modelar ameaças e mapear dados/LGPD;
- completar estratégia de autenticação e autorização;
- preparar modelo editorial de atividades.

**Saída:** fundação capaz de sustentar o núcleo sem persistência JSON.

### Fase 4 — construção do núcleo

**Período:** 5 de outubro a 20 de novembro de 2026

- ciclo 3: conta, convite, pareamento e desvinculação;
- ciclo 4: catálogo, home, resposta guardada e revelação;
- ciclo 5: três níveis, desafios, adivinhação, escolhas coincidentes e fechamento;
- ciclo 6: preferências, feedback, analytics e painel;
- testes automatizados desenvolvidos junto com cada fluxo;
- demonstração em dois dispositivos ao fim de cada ciclo.

**Saída:** feature complete do MVP, ainda não liberado para piloto.

### Fase 5 — conteúdo do piloto

**Período:** 12 de outubro a 27 de novembro de 2026

- produzir conteúdo em lotes semanais;
- manter rastreabilidade até pesquisa ou justificativa editorial;
- revisar tom, inclusão, propriedade intelectual e segurança;
- testar lotes com casais antes de publicar;
- alcançar 30 atividades leves, 20 médias e 10 profundas;
- configurar retirada rápida e feedback de conteúdo.

**Saída:** banco mínimo de 60 atividades aprovadas.

### Fase 6 — qualidade e conformidade

**Período:** 16 de novembro a 18 de dezembro de 2026

- testes unitários, integração e E2E;
- autorização e isolamento entre casais;
- acessibilidade e responsividade;
- performance e compatibilidade;
- recuperação de senha e verificação de e-mail;
- backup e restauração;
- política de privacidade, termos e consentimentos;
- suporte e resposta a incidentes;
- tarefa 143: integrar resultado bilateral de formas de afeto, sugestões aprovadas e lembrete semanal opt-in;
- QA exploratório completo.

**Saída:** candidato tecnicamente apto para UAT, incluindo a integração pré-lançamento da tarefa 143.

### Fase 7 — estabilização e recrutamento

**Período:** 7 de dezembro de 2026 a 8 de janeiro de 2027

- recrutar e confirmar 40 a 60 casais;
- realizar UAT antes do recesso somente após concluir a tarefa 143;
- corrigir bloqueadores e congelar novas funcionalidades;
- validar painel, alertas e exportação agregada;
- treinar suporte e preparar mensagens do piloto;
- usar o período de disponibilidade reduzida apenas para estabilização e correções críticas;
- realizar go/no-go em 8 de janeiro.

**Saída:** release candidate e coorte prontos.

### Fase 8 — piloto fechado

**Período:** 11 de janeiro a 19 de fevereiro de 2027

- semana 1: onboarding em ondas pequenas e observação intensiva;
- semanas 2 e 3: acompanhar ativação, reciprocidade e problemas de conteúdo;
- semana 4: pesquisa intermediária e correções não disruptivas;
- semanas 5 e 6: medir retenção, repetição e intenção de pagar;
- suporte contínuo e revisão semanal de segurança;
- não alterar definição das métricas durante a coorte sem versionamento.

**Saída:** conjunto de dados e evidências qualitativas do MVP.

### Fase 9 — síntese e decisão

**Período:** 22 de fevereiro a 5 de março de 2027

- fechar métricas da coorte;
- realizar entrevistas pós-uso;
- comparar resultados por segmento e mecânica;
- registrar atividades fortes, fracas e de risco;
- avaliar disposição a pagar e escopo comercial;
- decidir prosseguir, iterar ou reconsiderar;
- atualizar PRD, MoSCoW, roadmap e plano.

**Saída:** relatório do piloto e decisão executiva.

## 5. Marcos de controle

| Marco | Data planejada | Critério de aceite | Decisão |
|---|---:|---|---|
| **MC1 — Baseline aprovada** | 18/09/2026 | PRD, escopo, MoSCoW, papéis e pesquisa aprovados | autorizar execução |
| **MC2 — Personas e oportunidades validadas** | 02/10/2026 | 24 entrevistas analisadas e personas revisadas | confirmar público e conteúdo |
| **MC3 — Mecânicas e padrão editorial aprovados** | 16/10/2026 | três protótipos testados e primeiro lote revisado | autorizar construção integral |
| **MC4 — Fundação técnica pronta** | 23/10/2026 | PostgreSQL, ambientes, CI, backup e segurança-base | autorizar dados reais de teste |
| **MC5 — MVP feature-complete** | 20/11/2026 | núcleo do primeiro piloto e integração 143 concluídos em dois dispositivos | iniciar hardening |
| **MC6 — Conteúdo do piloto aprovado** | 27/11/2026 | 60 atividades com rastreabilidade e revisão | congelar catálogo inicial |
| **MC7 — Release candidate** | 18/12/2026 | QA, segurança, acessibilidade, LGPD, tarefa 143 e UAT sem bloqueador | preparar go/no-go |
| **MC8 — Go/no-go do piloto** | 08/01/2027 | coorte, suporte, métricas e release confirmados | liberar ou adiar piloto |
| **MC9 — Piloto concluído** | 19/02/2027 | seis semanas, dados íntegros e entrevistas agendadas | encerrar coleta principal |
| **MC10 — Decisão do MVP comercial** | 05/03/2027 | relatório e recomendação aprovados | prosseguir, iterar ou reconsiderar |

Um marco não é concluído apenas pela data. O critério de aceite precisa estar demonstrado e a decisão registrada.

## 6. Cadência de execução

### Ciclo quinzenal

Cada sprint dura duas semanas:

- **segunda-feira da primeira semana:** planejamento e objetivo do ciclo;
- **durante o ciclo:** execução, discovery contínuo e refinamento do próximo ciclo;
- **quarta-feira da segunda semana:** corte de risco e confirmação do que chega à demonstração;
- **sexta-feira da segunda semana:** demonstração, aceite, retrospectiva e atualização do plano.

### Cadência semanal

| Momento | Participantes | Duração | Resultado obrigatório |
|---|---|---:|---|
| Planejamento semanal — segunda | produto, design, engenharia, conteúdo | 45 min | prioridades, responsáveis e bloqueios |
| Check-in assíncrono — diário | equipe executora | 5 min | feito, próximo, bloqueio e decisão necessária |
| Revisão produto/conteúdo — quarta | produto, pesquisa, design, conteúdo | 45 min | protótipos e lote editorial decididos |
| Revisão técnica/risco — quinta | engenharia, qualidade, produto | 30 min | segurança, dependências e saúde da entrega |
| Demo e aceite — sexta | equipe e responsável pelo produto | 45 min | evidência, aceite ou ajuste registrado |
| Retrospectiva — sexta quinzenal | equipe executora | 30 min | uma melhoria com responsável |

Reuniões podem ser combinadas em equipes pequenas, desde que os resultados obrigatórios sejam registrados.

### Cadência de pesquisa

- debrief a cada três casais entrevistados;
- síntese semanal de padrões e contradições;
- nenhuma pergunta vira conteúdo publicado diretamente;
- teste de atividade em lote antes da aprovação editorial;
- atualização das personas ao final do campo e do piloto.

### Cadência de conteúdo

- planejamento do lote na segunda;
- escrita e pareamento editorial até quarta;
- revisão de inclusão/segurança na quinta;
- teste com casais e decisão na semana seguinte;
- revisão mensal de desempenho e feedback depois do lançamento.

### Cadência durante o piloto

- painel revisado diariamente na primeira semana;
- reunião de saúde do piloto toda segunda-feira;
- suporte e incidentes acompanhados continuamente;
- revisão de conteúdo toda quarta-feira;
- relatório semanal de ativação, North Star, reciprocidade e sinais de segurança;
- mudanças críticas por hotfix; mudanças de experiência entram em versão e coorte documentadas.

## 7. Governança de decisões

### Níveis

- **Operacional:** equipe decide dentro do escopo e registra no backlog.
- **Produto:** responsável de produto decide prioridade, conteúdo e critérios de aceite.
- **Técnico/segurança:** liderança técnica pode bloquear liberação insegura.
- **Go/no-go:** produto, técnica, qualidade e privacidade precisam concordar ou registrar exceção formal.

### Prazo de decisão

- bloqueio crítico: mesmo dia útil;
- dúvida de produto dentro do escopo: até dois dias úteis;
- mudança de escopo: reunião de controle e impacto antes de iniciar;
- risco de segurança ou privacidade: interromper a liberação até avaliação.

## 8. Gestão do backlog

- uma única fila priorizada;
- no máximo um ciclo detalhado e um ciclo refinado à frente;
- toda tarefa possui responsável, aceite, dependência e tamanho;
- trabalho não planejado precisa indicar qual item será adiado;
- bugs críticos têm precedência sobre nova funcionalidade;
- pesquisa e conteúdo usam o mesmo acompanhamento operacional;
- status e estimativas são atualizados ao menos na demo quinzenal.

## 9. Regras de mudança de escopo

Uma funcionalidade nova só entra antes do piloto se:

1. corrigir risco crítico;
2. for necessária para testar a hipótese central;
3. não possuir alternativa manual aceitável;
4. tiver impacto e dependências estimados;
5. houver item explicitamente removido ou data recalculada;
6. a decisão estiver registrada.

Itens Could e Won't da priorização não entram por preferência, concorrência ou oportunidade isolada.

## 10. Caminho crítico

```text
aprovação do escopo
→ entrevistas
→ taxonomia e conteúdo validado
→ modelo de conteúdo/API
→ três mecânicas implementadas
→ autorização e isolamento testados
→ QA, privacidade e operação
→ UAT
→ go/no-go
→ piloto de 6 semanas
→ síntese e decisão
```

Entrevistas e fundação técnica começam em paralelo, mas a versão final do catálogo depende da pesquisa. O piloto não pode ser comprimido abaixo de seis semanas sem perder leitura mínima de retenção.

## 11. Riscos de cronograma

| Risco | Sinal antecipado | Mitigação |
|---|---|---|
| Capacidade menor que a premissa | responsáveis acumulam mais de três frentes | recalcular datas ou reduzir amplitude |
| Recrutamento lento | menos de seis casais confirmados na primeira semana | canais alternativos e recrutamento contínuo |
| Conteúdo não atinge qualidade | alto desconforto ou repetição nos testes | reduzir quantidade e aprofundar revisão |
| Migração para PostgreSQL atrasa | modelo e ambiente não aprovados até 2/10 | prioridade técnica e corte de Could/Should |
| Escopo cresce | novos itens sem retirada correspondente | aplicar controle de mudança |
| Recesso reduz disponibilidade | decisões pendentes após 18/12 | congelar escopo e antecipar UAT |
| Privacidade ou segurança bloqueia | falhas de isolamento ou inventário incompleto | não iniciar piloto; corrigir e refazer go/no-go |
| Coorte abandona cedo | ativação ou reciprocidade abaixo da faixa na semana 1 | entrevistas rápidas e correção de fricção |

## 12. Indicadores de saúde da execução

- percentual do objetivo do sprint aceito;
- bloqueios com mais de dois dias;
- tarefas iniciadas versus concluídas;
- defeitos críticos abertos;
- cobertura dos fluxos críticos;
- atividades escritas, revisadas, testadas e aprovadas;
- casais recrutados e confirmados;
- riscos sem responsável;
- decisões vencidas;
- mudanças de escopo por ciclo.

Velocidade isolada não será usada para avaliar pessoas. O objetivo é previsibilidade e qualidade do sistema.

## 13. Próximas ações

### Até 11 de setembro de 2026

- nomear responsáveis;
- confirmar capacidade semanal;
- revisar questões abertas do PRD;
- aprovar coorte, duração e canal PWA;
- iniciar recrutamento das entrevistas;
- configurar backlog e rituais.

### Até 18 de setembro de 2026

- aprovar baseline;
- executar entrevistas-piloto;
- fechar modelo inicial de dados;
- definir ambiente de homologação;
- confirmar especialista de conteúdo e apoio jurídico/privacidade.

## 14. Aprovação da linha de base

| Papel | Nome | Decisão | Data |
|---|---|---|---|
| Responsável pelo produto |  | Aprovar / ajustar |  |
| Liderança técnica |  | Aprovar / ajustar |  |
| Pesquisa/conteúdo |  | Aprovar / ajustar |  |
| Qualidade/privacidade |  | Aprovar / ajustar |  |

Alterações posteriores devem registrar data, motivo, impacto no marco e pessoa responsável.
