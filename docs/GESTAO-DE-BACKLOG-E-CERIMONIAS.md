# Gestão de backlog e cerimônias — Conectadois

## 1. Modelo operacional

O Conectadois trabalhará com **fluxo Kanban e ciclos quinzenais de compromisso**. Isso mantém uma direção comum a cada duas semanas e permite tratar imediatamente incidentes críticos, riscos de privacidade e aprendizados do piloto.

A planilha `Plano de trabalho/acompanhamento-app-do-amor.xlsx` é a fonte operacional do portfólio. Uma ferramenta visual poderá ser adotada, mas cada cartão deverá manter o ID da tarefa correspondente no Plano Mestre.

Tatyele Lopes, como Product Owner (PO), responde pela ordem do backlog, pelo objetivo do ciclo e pelo aceite de produto. A liderança técnica (TL) responde por viabilidade, decomposição técnica e autorização de liberação. Os demais papéis seguem a matriz RACI.

## 2. Estrutura do backlog

| Nível | Uso | Exemplo |
|---|---|---|
| Objetivo | resultado de negócio ou aprendizado | validar um ritual recorrente entre casais |
| Iniciativa | frente que move o objetivo | rotina de perguntas e revelação mútua |
| Épico | conjunto coerente de entregas | pareamento do casal |
| História/tarefa | incremento verificável em até um ciclo | convidar parceiro por código |
| Subtarefa | passo de até dois dias | validar expiração do código |
| Bug/risco | correção ou exposição a tratar | impedir acesso entre casais |

Pesquisa e conteúdo usam a mesma fila: entrevista é tarefa de aprendizado e atividade editorial pode ser história. Épicos e tarefas apontam para a hipótese, requisito do PRD ou risco que justificou sua existência.

### Campos obrigatórios

- ID e vínculo com o Plano Mestre, quando aplicável;
- título orientado a resultado;
- tipo, fase e área;
- problema, pessoa afetada e evidência;
- resultado esperado ou hipótese;
- prioridade e justificativa;
- responsável, dependências, riscos e estimativa;
- critérios de aceite verificáveis;
- requisitos de analytics, privacidade, acessibilidade e conteúdo;
- links para desenho, decisão ou evidência;
- status e data da última atualização.

Conteúdo íntimo real de usuários nunca será copiado para tickets. Evidências devem ser anonimizadas.

## 3. Quadro e fluxo

| Status | Significado | Regra de saída | WIP |
|---|---|---|---:|
| Funil | entrada ainda não analisada | triagem realizada | sem limite |
| Análise | valor e problema sendo esclarecidos | descartar, pesquisar ou detalhar | 5 |
| Refinamento | solução, riscos e aceite em preparação | Definition of Ready atendida | 8 |
| Pronto | apto ao próximo ciclo | selecionado no planejamento | 10 |
| Em andamento | execução iniciada | incremento pronto para revisão | 5 no time; 1 por pessoa |
| Em revisão | revisão técnica, editorial, design ou privacidade | parecer e ajustes concluídos | 4 |
| Em validação | QA, aceite do PO ou teste com casal | aceite registrado | 4 |
| Bloqueado | impedimento ou decisão pendente | impedimento removido | exige ação |
| Concluído | Definition of Done atendida | nenhuma | sem limite |
| Cancelado | perdeu valor, foi substituído ou recusado | motivo registrado | sem limite |

Equivalência na planilha:

- Funil, Análise, Refinamento e Pronto → **Não iniciado**;
- Em andamento, Em revisão, Em validação e Bloqueado → **Em andamento**;
- Concluído → **Concluído**;
- Cancelado → **Cancelado**, com justificativa.

Com o WIP atingido, o time conclui ou desbloqueia trabalho antes de iniciar outro item. Apenas incidente P0 pode furar o limite, com registro da exceção.

## 4. Entrada, triagem e prioridade

Entradas vêm de pesquisa, métricas, feedback, defeitos, observabilidade, riscos, operação e oportunidades de negócio. Toda entrada vai primeiro ao Funil; conversa ou reunião não substitui o registro.

PO e TL fazem triagem semanal. RC participa para pesquisa/conteúdo, PJ para privacidade/jurídico e QA para defeitos relevantes. O resultado será: descartar com motivo, fundir, pedir evidência, pesquisar, detalhar ou classificar como incidente.

### Ordem de prioridade

1. integridade dos usuários, privacidade, segurança e indisponibilidade crítica;
2. bloqueadores do caminho crítico ou do piloto;
3. Must do MVP e obrigações legais;
4. defeitos que impedem ativação, pareamento ou ritual principal;
5. itens que movem a North Star ou reduzem risco de hipótese;
6. Should e eficiência;
7. Could, experimentos e refinamentos cosméticos.

No mesmo nível, será usado **RICE simplificado**:

`pontuação = (alcance × impacto × confiança) ÷ esforço`

Impacto usa 0,5/1/2/3; confiança usa 0,5/0,8/1; esforço mantém a mesma unidade entre itens. RICE informa a decisão, mas MoSCoW, riscos e dependências podem mudar a ordem se a justificativa for registrada.

### Classes de serviço

| Classe | Uso | Triagem |
|---|---|---:|
| P0 — Expedite | vazamento, acesso indevido, risco à integridade ou produção indisponível | imediata |
| P1 — Crítico | jornada principal ou marco bloqueado | mesmo dia útil |
| P2 — Padrão | entrega planejada ou defeito com contorno | próxima triagem/ciclo |
| P3 — Oportunidade | melhoria sem urgência ou evidência | revisão mensal |

## 5. Definition of Ready

Um item só entra no ciclo quando:

- problema, resultado e responsável estão claros;
- critérios de aceite são testáveis;
- dependências e riscos são conhecidos;
- desenho ou conteúdo necessário está disponível ou incluído no item;
- dados pessoais, segurança e acessibilidade foram avaliados;
- eventos de métricas foram definidos quando necessários;
- o esforço cabe em um ciclo; itens maiores foram divididos;
- PO confirma valor e TL confirma viabilidade técnica.

Descoberta pode entrar com solução aberta, mas exige pergunta, método, público, prazo e critério de decisão.

## 6. Definition of Done

Uma entrega só é concluída quando, conforme sua natureza:

- aceite foi demonstrado e aprovado;
- código foi revisado, integrado e testado;
- fluxos críticos foram validados em mobile;
- acessibilidade, privacidade e segurança aplicáveis foram verificadas;
- conteúdo recebeu revisão editorial/especializada exigida;
- analytics foi testado sem capturar conteúdo íntimo;
- documentação, decisão, Plano Mestre e marco foram atualizados;
- não restam defeitos bloqueadores;
- PO aceitou o produto e TL autorizou tecnicamente a liberação.

“Código pronto” ou “texto escrito” não equivale a concluído.

## 7. Ciclo e capacidade

O ciclo dura duas semanas e possui um único objetivo expresso como resultado.

- 70% da capacidade: objetivo do ciclo e caminho crítico;
- 20%: qualidade, bugs, segurança e débito técnico;
- 10%: descoberta, refinamento e imprevistos;
- compromisso máximo: 85% da capacidade nominal após férias, feriados, suporte e cerimônias;
- item incompleto volta à priorização com causa e escopo reavaliados;
- urgência indica qual compromisso sai ou qual data muda.

## 8. Cerimônias

| Cerimônia | Cadência/duração | Participantes | Facilitador | Saída obrigatória |
|---|---|---|---|---|
| Triagem do funil | semanal, 30 min | PO, TL; especialistas sob demanda | PO | entradas classificadas |
| Refinamento | semanal, 60 min | PO, TL e responsáveis próximos | PO/TL | itens Ready, estimados e sem bloqueio oculto |
| Planejamento | início da quinzena, 60–90 min | equipe do ciclo | PO | objetivo, capacidade, compromisso e donos |
| Check-in | diário assíncrono, até 10 min | equipe | cada responsável | feito, próximo passo e bloqueio |
| Sincronização de bloqueio | sob demanda, até 15 min | envolvidos | dono do item | ação, responsável e prazo |
| Revisão produto/conteúdo | semanal, 45 min | PO, PD, RC; ER/PJ sob demanda | PD ou RC | aceite, ajuste ou decisão |
| Revisão técnica/risco | semanal, 45 min | TL, engenharia, DP e QA | TL | decisões, riscos e liberação |
| Demo e aceite | fim da quinzena, 60 min | equipe e interessados | PO | itens aceitos/reabertos e feedback |
| Retrospectiva | fim da quinzena, 45 min | equipe | rotativo | uma melhoria com dono e prazo |
| Reposição do quadro | após demo, 20 min | PO e TL | PO | fila Pronto ordenada |
| Revisão de roadmap | mensal, 60 min | PO, TL, RC e GO | PO | prioridades, marcos e riscos |
| Go/no-go | por marco | PO, TL, QA, PJ e responsáveis | PO | decisão, condições e exceções |

Com até quatro pessoas, cerimônias podem ser combinadas preservando suas saídas. Reunião sem pauta, decisão ou registro vira atualização assíncrona.

## 9. Comunicação, bloqueios e decisão

O check-in informa: concluído, próximo passo, bloqueio/ajuda e risco ao ciclo.

- bloqueio é sinalizado imediatamente no item;
- causa, impacto, pessoa capaz de resolver e próxima ação são registrados;
- líder da frente age no mesmo dia útil;
- bloqueio acima de dois dias úteis escala para PO e TL;
- segurança, privacidade ou proteção do usuário interrompem a liberação sem esperar cerimônia.

PO decide ordem, escopo e aceite; TL decide arquitetura e liberabilidade; PJ bloqueia inconformidade; ER aprova conteúdo profundo ou sensível. Divergências seguem a RACI e são registradas.

## 10. Métricas de saúde do fluxo

| Métrica | Meta inicial |
|---|---:|
| Ciclos com objetivo cumprido | ≥ 80% |
| Itens planejados que entram Ready | 100% |
| Trabalho não planejado | ≤ 15% da capacidade |
| Bloqueios acima de 2 dias | 0 críticos; ≤ 2 totais |
| Retrabalho/reabertura | ≤ 10% |
| Itens simultâneos por pessoa | ≤ 1 |
| Defeitos P0/P1 ao fim do ciclo | 0 |
| Tempo de ciclo mediano | baseline após 3 ciclos |

Métricas medem o sistema, não indivíduos. Metas e WIP serão revistos após três ciclos reais.

## 11. Governança

- PO mantém uma ordem global; TL explicita dependências e débito técnico;
- responsáveis atualizam itens no check-in e antes da demo;
- QA valida evidência; RC/ER validam conteúdo; PJ valida o que exigir parecer;
- item sem movimento por 30 dias retorna à triagem;
- cancelados mantêm histórico e motivo;
- mudança de escopo exige retirada, capacidade adicional ou nova data;
- Plano Mestre é reconciliado ao fim de cada ciclo e antes de cada marco.

## 12. Configuração no plano

A planilha passa a conter a aba **Governança Backlog**, com fluxo, WIP, cerimônias, Ready, Done, classes de serviço e métricas. Este documento é a política detalhada; a aba é a referência rápida da operação.

## 13. Checklist de implantação

- [ ] Tatyele Lopes aprova o objetivo e a ordem inicial;
- [ ] nomes substituem funções quando os profissionais forem designados;
- [ ] primeiro ciclo atende à Definition of Ready;
- [ ] capacidade e indisponibilidades estão registradas;
- [ ] calendário recorrente está criado;
- [ ] canal de check-in e registro de decisão estão disponíveis;
- [ ] WIP está visível no quadro;
- [ ] ferramenta externa, se usada, aponta para os IDs do Plano Mestre;
- [ ] revisão das métricas está agendada para o fim do terceiro ciclo.

## 14. Aprovação

| Papel | Nome | Decisão | Data |
|---|---|---|---|
| Product Owner | Tatyele Lopes | Aprovar / ajustar |  |
| Liderança técnica | A nomear | Aprovar / ajustar |  |
| Qualidade | A nomear | Consultar |  |
| Pesquisa e Conteúdo | A nomear | Consultar |  |
