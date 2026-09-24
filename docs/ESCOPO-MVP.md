# Escopo do MVP — Conectadois / App do Amor

> Este é o plano completo do aplicativo e permanece válido. O [MPV de validação de formato](ESCOPO-MPV.md) é uma trilha adicional de teste; seus resultados serão usados como insumo para uma revisão futura deste plano, sem substituição automática.

**Versão:** 1.0 — 2 de setembro de 2026  
**Produto:** Conectadois / App do Amor  
**Formato escolhido:** PWA responsiva, piloto fechado  
**Duração recomendada:** 6 semanas  
**Coorte recomendada:** 40 a 60 casais  
**Modelo no piloto:** gratuito, sem cobrança real  
**Status:** escopo-base para planejamento e execução

## 1. Decisão de escopo

O MVP não será uma versão reduzida de todas as ideias do produto. Será a menor experiência completa capaz de provar que:

1. uma pessoa consegue convidar a outra sem o convite parecer cobrança ou terapia;
2. as duas conseguem participar com baixa fricção;
3. uma atividade divertida gera descoberta real sobre a pessoa parceira;
4. essa descoberta produz conversa, intimidade ou vontade de continuar;
5. o casal retorna voluntariamente em outra ocasião;
6. tudo acontece com privacidade, autonomia e segurança suficientes.

### Hipótese central

> Se oferecermos a casais brasileiros perguntas e jogos curtos, divertidos e progressivamente profundos, com participação das duas pessoas e revelação compartilhada, eles descobrirão coisas novas um sobre o outro, sentirão maior conexão e retornarão para novas experiências.

## 2. O que o MVP entrega

Uma PWA mobile-first em que cada integrante cria sua conta, entra em um espaço privado do casal e participa de atividades em dois dispositivos. O casal pode:

- responder separadamente e revelar junto;
- responder sobre si e a outra pessoa tentar adivinhar;
- escolher opções em segredo e descobrir coincidências;
- avançar de temas leves para mais profundos;
- encerrar a sessão com uma descoberta, continuação de conversa ou pequeno gesto;
- controlar temas, pular atividades e sair do vínculo;
- retornar para uma nova experiência recomendada.

A administração acompanha ativação, uso conjunto, retenção e segurança por dados agregados, sem visualizar o texto das respostas.

## 3. Público do MVP

### Segmento principal

Casais brasileiros adultos, principalmente entre 25 e 44 anos, juntos há aproximadamente 1 a 10 anos, que gostam da relação e querem sair da rotina, se conhecer melhor e aumentar a intimidade de forma divertida.

### Composição da coorte

Entre 40 e 60 casais, procurando incluir:

- relações recentes, intermediárias e longas;
- casais que moram juntos e separados;
- casais com e sem filhos;
- relacionamentos à distância;
- casais LGBTQIA+;
- diferentes regiões, raças, rendas e níveis de familiaridade digital;
- pessoas com necessidades de acessibilidade.

### Fora do recrutamento ativo

- menores de 18 anos;
- pessoas buscando mediação clínica ou diagnóstico;
- relações com coerção ou risco imediato;
- participantes sem consentimento individual;
- pessoas que não possuem acesso mínimo a smartphone e internet.

## 4. Experiência principal

```text
1. Ver proposta
2. Criar conta individual
3. Criar espaço do casal
4. Compartilhar convite
5. Segunda pessoa aceitar e criar conta
6. Escolher ou receber uma atividade leve
7. Ambas participarem
8. Ver revelação ou comparação
9. Conversar ou realizar um gesto
10. Avaliar brevemente a experiência
11. Retornar para nova atividade
```

### Momento “aha”

O momento de valor ocorre quando o casal conclui a primeira experiência e pelo menos uma pessoa pensa ou diz algo equivalente a:

> “Eu não sabia isso sobre você.”

### North Star

**Casais que concluem ao menos uma experiência mútua significativa nos últimos 7 dias.**

## 5. Funcionalidades incluídas

### 5.1 Entrada e contas

- onboarding curto com proposta de diversão, descoberta e conexão;
- cadastro individual por nome, e-mail e senha;
- login, logout e sessão autenticada;
- recuperação de senha para o piloto externo;
- aceite de termos e privacidade do piloto;
- indicação clara de que o app não é terapia.

### 5.2 Pareamento

- criação do espaço privado do casal;
- código de convite e link compartilhável;
- mensagem de convite leve e editável;
- entrada da segunda pessoa com consentimento;
- estado de espera e atualização;
- tratamento de convite inválido, expirado ou já utilizado;
- limite de duas contas por espaço.

### 5.3 Home

- momento recomendado do dia;
- retomada de resposta ou revelação pendente;
- acesso às três mecânicas principais;
- indicação de duração e profundidade;
- histórico mínimo de sessões concluídas, sem exibir respostas na home.

### 5.4 Mecânica A — resposta guardada

- mesma pergunta para ambas as pessoas;
- resposta individual selada;
- estado “aguardando a outra pessoa”;
- revelação somente depois das duas respostas;
- continuação de conversa opcional;
- conclusão da experiência.

### 5.5 Mecânica B — eu respondo, você adivinha

- uma pessoa responde sobre si;
- a outra tenta adivinhar;
- uma variação pode usar gestos ou desafios que a primeira pessoa gostaria de receber;
- inversão de papéis na mesma sessão ou na seguinte;
- comparação com linguagem positiva;
- pontos apenas como diversão opcional;
- pergunta final: “O que te surpreendeu?”;
- depois da revelação, o desafio só vira convite de ação mediante aceite bilateral, com opções de adaptar, trocar ou pular.

### 5.6 Mecânica C — escolham juntos

- cada pessoa escolhe opções em segredo;
- apenas coincidências são reveladas;
- possibilidade de campo “outra ideia”;
- fechamento em conversa, intenção ou plano simples;
- nenhuma cobrança para executar a escolha.

### 5.7 Conteúdo e progressão

- três níveis: leve, médio e profundo;
- escolha explícita do nível antes de selecionar as cartas da sessão;
- desafios disponíveis como formato próprio, modo misto e variação controlada da adivinhação;
- conteúdo íntimo excluído do primeiro ciclo público do MVP, podendo existir apenas em teste moderado específico;
- temas iniciais: gostos e preferências, histórias e memórias, carinho e conexão, sonhos e futuro;
- indicação de tema, duração e nível antes de começar;
- pular atividade sem justificativa;
- evitar tema nas preferências;
- pelo menos 60 atividades validadas antes do piloto completo.

Distribuição inicial recomendada:

| Profundidade | Quantidade | Papel |
|---|---:|---|
| Leve | 30 | diversão, curiosidade e primeira ativação |
| Média | 20 | histórias, afeto, hábitos e planos |
| Profunda | 10 | valores, mudanças, sonhos e vulnerabilidade moderada |

Distribuir as 60 atividades entre as três mecânicas; evitar que uma única atividade seja contada como várias apenas por trocar pequenas palavras.

### 5.8 Fechamento e feedback

- destacar a descoberta da sessão;
- sugerir uma continuação de conversa ou pequeno gesto;
- feedback opcional de um toque: divertida, aproximou, repetitiva ou desconfortável;
- opção de comentário livre sem pedir conteúdo da resposta;
- sugestão de próxima experiência, sem criar pressão.

### 5.9 Perfil, preferências e segurança

- nome e dados da conta;
- pronomes opcionais;
- fase da relação e interesses básicos;
- temas a evitar;
- cadência preferida;
- ocultação de conteúdo sensível em notificações;
- pular, pausar ou denunciar conteúdo;
- desvinculação individual;
- exclusão de conta e explicação do destino dos dados;
- acesso discreto a ajuda e recursos de emergência.

### 5.10 Administração e aprendizado

- painel protegido por conta administrativa;
- North Star;
- cadastros e espaços criados;
- conversão convite → pareamento;
- pareamento → primeira experiência;
- casais ativos, experiências mútuas e reciprocidade;
- retenção D7 e D30; D90 somente depois do período necessário;
- feedback agregado de conteúdo;
- desvinculação, notificações silenciadas e acesso à ajuda;
- exportação agregada para análise do piloto;
- nenhum texto de resposta ou resultado íntimo no painel.

### 5.11 Operação técnica mínima

- banco PostgreSQL em homologação e produção do piloto;
- HTTPS;
- ambientes local, homologação e piloto;
- gestão de segredos;
- backup automatizado e restauração testada;
- logs sem conteúdo íntimo;
- monitoramento de disponibilidade e erros;
- autorização e isolamento entre casais testados;
- estados de carregamento, vazio, erro e conexão instável;
- responsividade e acessibilidade dos fluxos críticos.

## 6. Funcionalidades experimentais que não bloqueiam o MVP

O protótipo atual contém recursos que podem ser apresentados a uma subamostra, mas não entram no critério de conclusão do MVP:

### Teste de formas de afeto

Pode permanecer atrás de sinalização “experimental” no primeiro piloto se houver revisão editorial e jurídica. O MVP não depende da marca “Cinco Linguagens do Amor” nem de uma análise definitiva do casal. O resultado bilateral e os lembretes semanais ficam fora do primeiro piloto, mas são obrigatórios na iteração seguinte antes do lançamento, conforme a tarefa 143. O resumo conjunto exige duas conclusões compatíveis e compartilhamento explícito, apresenta forças, complementaridades, oportunidades de cuidado e sugestões práticas sem nota de compatibilidade. Lembretes derivados dessas sugestões são opt-in individual.

### Teste dos quatro temperamentos

Pode ser testado como conteúdo educativo, sem diagnóstico, compatibilidade ou recomendação automatizada. Deve ser removido do piloto se não houver validação especializada a tempo.

### Streak

Pode ser testado apenas de forma opcional e não punitiva. Não bloqueará lançamento e não será usado como principal métrica de sucesso.

## 7. Fora do escopo do MVP

- cobrança e assinatura reais;
- paywall e teste Premium;
- multiplayer com outros casais;
- IA gerando perguntas ou conselhos;
- terapeuta ou árbitro de IA;
- índice ou matriz de compatibilidade;
- diagnóstico psicológico;
- conteúdo sexual explícito;
- geolocalização e check-in;
- prova obrigatória por foto, áudio ou confirmação do parceiro;
- ranking público ou comparação entre casais;
- pontuação do desempenho da pessoa parceira;
- acesso a mensagens, contatos, calendário, gastos ou localização;
- anúncios comportamentais;
- marketplace de terapia, presentes ou encontros;
- aplicativo nativo separado para iOS e Android;
- modo offline completo;
- memórias com fotos e vídeos;
- relatório mensal avançado;
- áudio nas atividades;
- conteúdo para menores de 18 anos;
- B2B2C e ferramentas para profissionais.

“Fora do MVP” não significa cancelado. Significa que não pode consumir capacidade antes de o experimento principal ser concluído.

## 8. Backlog ordenado do MVP

### Épico 1 — fundação e dados

| ID | História/entrega | Prioridade | Dependências |
|---|---|---:|---|
| MVP-001 | Modelo de usuários, casais, convites, atividades, respostas, sessões e eventos | P0 | PRD e escopo |
| MVP-002 | PostgreSQL, migrações e dados por ambiente | P0 | MVP-001 |
| MVP-003 | Autorização por usuário/casal e política de acesso | P0 | MVP-001 |
| MVP-004 | HTTPS, segredos, backup e observabilidade | P0 | ambientes |
| MVP-005 | Inventário de dados, retenção e base legal | P0 | MVP-001 |

### Épico 2 — conta e pareamento

| ID | História/entrega | Prioridade | Dependências |
|---|---|---:|---|
| MVP-006 | Onboarding revisado com proposta central | P0 | conteúdo verbal |
| MVP-007 | Cadastro, login, logout e sessão segura | P0 | MVP-001–003 |
| MVP-008 | Recuperação de senha e verificação de e-mail | P0 | MVP-007 |
| MVP-009 | Criar espaço, código/link e convite | P0 | MVP-007 |
| MVP-010 | Entrar, validar e concluir pareamento | P0 | MVP-009 |
| MVP-011 | Estado de espera e retomada | P0 | MVP-009–010 |
| MVP-012 | Desvincular e excluir conta com segurança | P0 | MVP-003, MVP-010 |

### Épico 3 — conteúdo

| ID | História/entrega | Prioridade | Dependências |
|---|---|---:|---|
| MVP-013 | Entrevistar 12 casais e sintetizar resultados | P0 | personas provisórias |
| MVP-014 | Taxonomia e critérios editoriais | P0 | MVP-013 |
| MVP-015 | Produzir banco inicial de atividades | P0 | MVP-013–014 |
| MVP-016 | Revisar inclusão, segurança e linguagem | P0 | MVP-015 |
| MVP-017 | Testar atividades com casais | P0 | MVP-015–016 |
| MVP-018 | Gestão editorial mínima e API de conteúdo | P0 | MVP-001, MVP-014 |

### Épico 4 — experiência do casal

| ID | História/entrega | Prioridade | Dependências |
|---|---|---:|---|
| MVP-019 | Home e recomendação principal | P0 | MVP-010, MVP-018 |
| MVP-020 | Resposta guardada e espera | P0 | MVP-003, MVP-018 |
| MVP-021 | Revelação mútua | P0 | MVP-020 |
| MVP-022 | Eu respondo, você adivinha | P0 | MVP-018 |
| MVP-023 | Escolham juntos | P0 | MVP-018 |
| MVP-024 | Níveis, filtros e indicação de duração | P0 | MVP-018 |
| MVP-025 | Fechamento em descoberta/conversa/gesto | P0 | MVP-020–024 |
| MVP-026 | Feedback de conteúdo | P1 | MVP-025 |
| MVP-027 | Preferências e temas a evitar | P0 | MVP-018 |

### Épico 5 — medição e administração

| ID | História/entrega | Prioridade | Dependências |
|---|---|---:|---|
| MVP-028 | Instrumentar funil e experiências | P0 | MVP-007–025 |
| MVP-029 | Painel administrativo agregado | P0 | MVP-028 |
| MVP-030 | Métricas de feedback e conteúdo | P1 | MVP-026, MVP-028 |
| MVP-031 | Exportação agregada do piloto | P1 | MVP-029–030 |

### Épico 6 — qualidade e operação

| ID | História/entrega | Prioridade | Dependências |
|---|---|---:|---|
| MVP-032 | Estados de erro, vazio, espera e rede instável | P0 | fluxos completos |
| MVP-033 | Acessibilidade e responsividade críticas | P0 | interface completa |
| MVP-034 | Testes unitários, integração e E2E dos fluxos críticos | P0 | implementação |
| MVP-035 | Testes de autorização e isolamento | P0 | MVP-003, implementação |
| MVP-036 | Política, termos e consentimento do piloto | P0 | MVP-005 |
| MVP-037 | Canal de suporte e resposta a incidentes | P0 | MVP-004, MVP-036 |
| MVP-038 | UAT e correção de bloqueadores | P0 | MVP-001–037 |

P0 significa necessário para iniciar o piloto completo. P1 pode ser executado manualmente durante a primeira coorte se houver alternativa definida.

## 9. Critérios de aceite por fluxo

### Entrada

- participante entende que o app é divertido, feito para casais e não é terapia;
- cadastro funciona em celular;
- erros não apagam dados preenchidos sem necessidade.

### Pareamento

- duas contas distintas conseguem parear em dispositivos diferentes;
- nenhum terceiro entra no espaço;
- convite inválido ou usado recebe mensagem clara;
- tempo entre convite e pareamento é registrado.

### Atividade

- ambas entendem a regra sem mediação;
- respostas são guardadas e sincronizadas;
- uma pessoa não acessa a resposta alheia antes da condição correta;
- conclusão e próxima ação ficam claras;
- qualquer pessoa pode pular ou sair.

### Administração

- conta comum recebe 403 no endpoint de métricas;
- painel não exibe textos ou resultados íntimos;
- eventos duplicados não inflam artificialmente a North Star;
- indicadores têm definição documentada.

### Segurança

- testes negativos confirmam isolamento entre casais;
- logs não incluem senha ou resposta;
- desvinculação interrompe acesso;
- backup pode ser restaurado;
- incidente possui canal e responsável.

## 10. Métricas e metas do piloto

### Métricas principais

| Métrica | Meta inicial | Interpretação |
|---|---:|---|
| Convite → pareamento | ≥ 55% | convite e entrada funcionam |
| Pareamento → primeira experiência mútua | ≥ 60% | casal chega ao primeiro valor |
| North Star semanal | ≥ 35% dos casais pareados | existe uso conjunto recorrente |
| Reciprocidade semanal | ≥ 65% | atividades iniciadas recebem participação |
| Retenção D7 | ≥ 35% | há motivação para voltar |
| Retenção D30 | ≥ 20% | valor persiste além da novidade |
| Sessões com “descobri algo novo” | ≥ 60% das avaliações | proposta central é percebida |
| Sessões avaliadas como divertidas | ≥ 70% | entretenimento funciona como entrada |
| Incidentes confirmados de privacidade | 0 | guardrail obrigatório |

As metas são hipóteses direcionais, não comprovação estatística. Avaliar números junto de entrevistas pós-uso.

### Dados qualitativos

Entrevistar pelo menos 12 casais da coorte após uso para compreender:

- o que descobriram;
- qual formato mais aproximou;
- onde o app pareceu artificial ou trabalhoso;
- por que retornaram ou abandonaram;
- como receberam o convite;
- se houve pressão ou desconforto;
- que valor justificaria pagamento.

## 11. Critérios de decisão após o MVP

### Prosseguir para MVP comercial

- segurança sem incidente crítico aberto;
- ativação e primeira experiência próximas ou acima das metas;
- evidência qualitativa recorrente de descoberta e conexão;
- pelo menos um formato demonstra retenção;
- casais pedem mais conteúdo ou demonstram disposição a pagar;
- problemas encontrados são corrigíveis sem alterar a tese central.

### Iterar

- pareamento funciona, mas retorno é baixo;
- diversão é percebida, mas descoberta é superficial;
- um formato funciona e os demais confundem;
- segmentos apresentam respostas muito diferentes;
- valor existe, mas frequência ou duração estão erradas.

### Reconsiderar ou pivotar

- segunda pessoa raramente aceita mesmo após testar mensagens;
- atividades não geram descoberta ou conversa observável;
- uso conjunto parece obrigação para a maioria;
- retenção permanece muito baixa após duas iterações relevantes;
- riscos de privacidade não podem ser controlados com a capacidade disponível.

## 12. Definition of Done do MVP

O MVP estará concluído somente quando:

- todos os itens P0 do backlog estiverem aceitos;
- 60 atividades tiverem origem, revisão e teste registrados;
- os três formatos centrais funcionarem em dois dispositivos;
- autorização e revelação mútua tiverem testes automatizados;
- desvinculação, exclusão e ajuda estiverem disponíveis;
- banco, backup, HTTPS, logs e monitoramento estiverem configurados;
- painel administrativo e definições de métricas estiverem validados;
- termos e privacidade do piloto estiverem aprovados;
- acessibilidade crítica e dispositivos-alvo tiverem sido verificados;
- UAT não possuir bloqueador aberto;
- coorte, suporte e protocolo de pesquisa estiverem preparados.

Código implementado sem validação com casais não significa MVP concluído.

## 13. Estado atual versus escopo

| Área | Estado atual | Para o MVP |
|---|---|---|
| Onboarding | Implementado inicialmente | revisar mensagem e testar |
| Cadastro/login | Implementado parcialmente | completar recuperação, verificação e segurança |
| Pareamento | Código e espera implementados | adicionar link, expiração e testes |
| Perguntas | Pequeno conjunto no frontend | migrar para catálogo e produzir 60 validadas |
| Resposta selada | Implementada no protótipo | endurecer autorização e testar isolamento |
| Revelação | Implementada inicialmente | completar estados, feedback e aceite |
| Adivinhação | Não implementada como fluxo central | construir |
| Escolhas coincidentes | Não implementada | construir |
| Preferências/segurança | Parcial | completar pular, temas, desvincular, excluir e ajuda |
| Analytics/admin | Primeira versão implementada | persistir em PostgreSQL, ampliar eventos e testar |
| Conteúdo editorial | Não implementado | criar modelo, API e operação mínima |
| Infraestrutura | JSON local | PostgreSQL, HTTPS, backup, segredos e observabilidade |
| Qualidade | Build manual | testes automatizados, dispositivos e UAT |

## 14. Dependências críticas

1. entrevistas com casais e síntese de conteúdo;
2. validação das personas;
3. aprovação do PRD e deste escopo;
4. modelo de dados e contrato de API;
5. arquitetura de produção e PostgreSQL;
6. revisão de privacidade/LGPD;
7. revisão especializada do conteúdo;
8. definição da equipe e capacidade;
9. cronograma do piloto;
10. recrutamento e suporte da coorte.

## 15. Controle de mudança

Qualquer nova funcionalidade proposta antes do fim do MVP deve responder:

1. Qual hipótese central ela testa?
2. Qual item atual será removido ou adiado?
3. Existe alternativa manual?
4. Qual risco e dependência adiciona?
5. Que evidência justifica a mudança?

Sem respostas e decisão explícita, o item permanece fora do MVP.

## 16. Aprovação do escopo

| Papel | Nome | Decisão | Data |
|---|---|---|---|
| Responsável pelo produto |  | Aprovar / ajustar |  |
| Liderança técnica |  | Aprovar / ajustar |  |
| Conteúdo/pesquisa |  | Aprovar / ajustar |  |
| Privacidade/jurídico |  | Aprovar / ajustar |  |

### Decisões que precisam de confirmação

- piloto de 6 semanas com 40–60 casais;
- PWA responsiva como primeiro canal;
- três mecânicas centrais;
- quatro temas iniciais;
- banco mínimo de 60 atividades;
- ausência de cobrança real no piloto;
- testes de afeto e temperamentos como experimentais e não bloqueadores;
- conteúdo íntimo fora do primeiro ciclo amplo;
- critérios quantitativos e qualitativos de avanço.
