# Contrato e versionamento da API — Conectadois

Versão documental 0.1 · 05/09/2026 · Entrega parcial da tarefa 35.

O contrato executável está em [openapi-v1.json](openapi-v1.json). Ele usa OpenAPI 3.1, JSON Schema 2020-12 e descreve 24 operações em 21 caminhos. O documento cobre o núcleo estável do MVP e diferencia operações `partial` e `planned` por extensões OpenAPI. A API Node atual continua disponível em `/api`, sem garantia de compatibilidade. A rota temporária de feedback do MPV está documentada separadamente em [FEEDBACK-MPV-CONTROLADO.md](FEEDBACK-MPV-CONTROLADO.md) e deve entrar em `/api/v1` antes de ser tratada como contrato estável.

A versão permanece `0.1.0-draft` porque a tarefa 112 ainda precisa decidir a forma final das mecânicas de adivinhação e escolhas coincidentes. Nenhuma mecânica foi inventada para preencher essa lacuna. O núcleo de conta, casal, catálogo, partidas genéricas, resposta privada, revelação, progresso e analytics já tem formas e regras definidas.

## Decisões do contrato

| Tema | Decisão |
|---|---|
| Base pública | `/api/v1` no mesmo host do frontend |
| Formato | JSON UTF-8; erros em `application/problem+json` |
| Autenticação | bearer token opaco ligado a uma sessão individual |
| Autoria | obtida da sessão; `userId`, `memberId` ou `coupleId` alheios nunca escolhem autoria |
| Resposta de sucesso | envelope `{ "data": ... }`; listas acrescentam `meta` |
| Datas e horas | RFC 3339 em UTC; datas civis no formato `YYYY-MM-DD`; fuso IANA explícito |
| Identificadores | UUID gerado pelo servidor; chaves editoriais estáveis são strings versionadas |
| Paginação | cursor opaco, limite padrão 20 e máximo 100 |
| Concorrência | `ETag` e `If-Match` nas correções; `409` para conflito de estado; `412` para versão divergente |
| Idempotência | `Idempotency-Key` UUID obrigatório em comandos não naturalmente idempotentes; retenção mínima de 24 horas |
| Privacidade | antes da revelação, a rodada contém apenas `myAnswer` e o estado de participação da outra pessoa |
| Conteúdo | atividade publicada tem `key` e `version`; a rodada guarda snapshot imutável |
| Progresso | somente eventos mútuos confirmados pelo servidor; analytics não é fonte de verdade |
| Administração | agregados autorizados; conteúdo de respostas não integra métricas ou logs |

O formato de problema segue o modelo de [RFC 9457](https://www.rfc-editor.org/rfc/rfc9457.html): `type`, `title`, `status`, `code`, `detail`, `instance`, `requestId` e erros de campo opcionais. `code` é estável para decisões do cliente; `detail` é texto para pessoas e pode mudar sem versionamento.

## Recursos da v1

### Conta e sessão

- cadastro individual, login e logout;
- recuperação de senha com resposta não enumerável;
- troca de senha e revogação das sessões anteriores;
- verificação de e-mail;
- leitura e atualização da conta atual;
- preferências pessoais e temas a evitar.

O contrato nunca retorna hash, senha, token armazenado ou dados internos da sessão. O token entregue no login é opaco e possui validade explícita.

### Casal e convite

- criação do espaço do casal com fuso obrigatório;
- entrada por convite explícito;
- leitura do próprio vínculo;
- reemissão de convite, invalidando o anterior;
- encerramento unilateral do vínculo.

Entradas concorrentes disputando a última vaga precisam ser serializadas. Uma obtém sucesso e as demais recebem conflito ou convite consumido. O servidor deriva o casal da pessoa autenticada em todas as operações seguintes.

### Catálogo editorial

`GET /content/activities` serve somente revisões publicadas e filtra por tipo, tema, profundidade e duração. Retirada editorial impede novas seleções, mas não altera snapshots de partidas existentes. O contrato não expõe rascunhos, pareceres internos ou conteúdo ainda não aprovado.

### Partidas, rodadas e respostas

Uma partida é criada com dois participantes vigentes e ao menos uma rodada. O servidor seleciona o conteúdo e congela texto, opções e versão na mesma transação. Os modos confirmados no modelo atual são `questions`, `challenges` e `mixed`.

`PUT /game-sessions/{sessionId}/rounds/{roundId}/answer` é idempotente por rodada e integrante. A pessoa pode corrigir sua resposta antes da revelação usando a `ETag` mais recente. A segunda participação resolve a rodada, registra um único evento de progresso e disponibiliza `revelation` atomicamente. Depois disso a rodada é imutável.

Pular encerra a rodada sem revelar uma resposta já enviada e sem criar progresso. A consulta valida sessão, vínculo vigente, casal, partida e participante antes de retornar dados.

### Progresso e analytics

`GET /couples/me/progress` retorna a projeção reconstruível definida no modelo de dados. Contadores enviados pelo navegador são ignorados.

`POST /analytics/events` aceita apenas nomes e propriedades enumerados. Eventos financeiros foram removidos do contrato do cliente: assinatura, cancelamento e pagamento devem vir de fonte confiável do servidor. O instante recebido do cliente pode ajudar a analisar a experiência, mas o servidor registra também o momento de ingestão e não o usa para autorizar ou contabilizar progresso.

## Versionamento

Há duas versões diferentes:

1. a versão de interface aparece na URL e muda somente quando há incompatibilidade: `/api/v1`, `/api/v2`;
2. `info.version` documenta a revisão do contrato dentro da major: `0.1.0-draft`, depois `1.0.0`, `1.1.0` e correções `1.1.1`.

Enquanto o contrato estiver em `draft`, ajustes incompatíveis são permitidos mediante atualização coordenada de frontend, servidor e especificação. Depois de `1.0.0`, aplicam-se estas regras:

### Alterações compatíveis na mesma major

- novo caminho ou método;
- parâmetro de consulta opcional;
- campo opcional em resposta;
- novo tipo de problema para uma condição antes representada por erro genérico;
- aumento de limites que não reduzam proteção de segurança;
- correção de descrição, exemplo ou formato que não altere valores aceitos.

Clientes devem ignorar campos de resposta desconhecidos. O servidor rejeita campos de requisição desconhecidos para evitar erros silenciosos e vazamento acidental de dados.

### Alterações incompatíveis

- remover ou renomear caminho, método, campo ou valor aceito;
- tornar campo opcional obrigatório;
- mudar tipo, significado, unidade, autorização ou regra de privacidade;
- reduzir limite já publicado;
- adicionar valor a enum fechado que clientes tratem exaustivamente;
- alterar o momento em que uma resposta alheia se torna visível;
- reutilizar `code` de erro com outro significado.

Uma alteração incompatível exige `/api/v2`. Correção de segurança pode restringir comportamento sem aguardar nova major quando manter o comportamento expõe pessoas ou dados; o incidente e a migração devem ser documentados.

## Ciclo de vida e descontinuação

Estados: `draft` → `beta` → `stable` → `deprecated` → `sunset`.

- `draft`: consumo apenas pelo repositório, sem estabilidade prometida;
- `beta`: homologação integrada; mudanças incompatíveis exigem aviso ao time consumidor;
- `stable`: contrato publicado e coberto por testes de conformidade;
- `deprecated`: continua operando, mas recebe os cabeçalhos `Deprecation`, `Sunset` e `Link` para a versão sucessora;
- `sunset`: versão deixa de responder depois da data comunicada.

Para uma versão estável, manter no mínimo 180 dias entre o anúncio da substituta e o desligamento, salvo correção emergencial de segurança ou decisão formal anterior ao piloto. O cabeçalho `Sunset` segue [RFC 8594](https://www.rfc-editor.org/rfc/rfc8594.html), e `Deprecation` segue [RFC 9745](https://www.rfc-editor.org/rfc/rfc9745.html).

## Compatibilidade de conteúdo e eventos

Conteúdo possui versão própria e não acompanha a versão HTTP. Alterar texto, opção ou classificação cria nova revisão editorial; partidas iniciadas continuam com o snapshot anterior. Retirar uma atividade não exige nova versão da API.

Eventos de analytics também têm catálogo controlado. Adicionar evento permitido é compatível; mudar seu significado exige um novo nome. Propriedades íntimas, texto livre, nome, e-mail, resposta ou identificador de outra pessoa são proibidos.

## Mapeamento da implementação atual

| Implementação sem versão | Contrato v1 | Situação |
|---|---|---|
| `POST /api/register` | `POST /api/v1/auth/registrations` | Parcial: faltam envelope, política de senha, verificação e erros padronizados |
| `POST /api/login` | `POST /api/v1/auth/sessions` | Parcial: faltam expiração explícita, revogação e erros padronizados |
| `GET /api/me` | `GET /api/v1/users/me` | Parcial: modelo atual do casal e papéis diverge do contrato-alvo |
| `POST /api/couples/create` | `POST /api/v1/couples` | Parcial: convite ainda não expira nem é armazenado como hash |
| `POST /api/couples/join` | `POST /api/v1/couples/join` | Parcial: persistência JSON não garante a concorrência descrita |
| `GET /api/answers/{questionId}` | `GET /api/v1/game-sessions/{sessionId}/rounds/{roundId}` | Legado de pergunta fixa; não possui partida ou rodada |
| `POST /api/answers/{questionId}` | `PUT /api/v1/game-sessions/{sessionId}/rounds/{roundId}/answer` | Parcial: autoria existe, mas faltam ETag, tipos e transação de progresso |
| — | `POST /api/v1/game-sessions` | Parcial: cria partida ativa idempotente, dois participantes e snapshots no armazenamento JSON atual; PostgreSQL e transação completa seguem pendentes |
| — | `GET /api/v1/game-sessions/{sessionId}` | Parcial: retoma a partida somente para integrantes vigentes do casal e mantém respostas não reveladas |
| `POST /api/events` | `POST /api/v1/analytics/events` | Parcial: catálogo e fonte financeira precisam ser corrigidos |
| `GET /api/admin/metrics` | `GET /api/v1/admin/metrics` | Parcial: falta contrato detalhado das métricas e fontes confiáveis |

Não publicar as rotas legadas como API estável. A migração deve implementar `/api/v1` em paralelo, trocar o cliente, medir chamadas antigas e só então remover `/api`.

## Mecânicas ainda abertas

A especificação não inclui tentativa de adivinhação nem escolha coincidente. A tarefa 112 deve decidir formato, alternância de papéis, condição de revelação, fechamento e conteúdo do primeiro piloto. Depois da decisão:

- adicionar subrecursos e schemas na mesma v1 apenas se forem independentes e compatíveis;
- não ampliar enums fechados usados pelo cliente sem validar consumidores;
- publicar uma nova major se a decisão mudar a semântica de `GameSession`, `RoundView`, autoria ou revelação;
- criar testes de isolamento específicos antes de marcar as tarefas 113 e 114 como integradas.

## Governança do contrato

Toda mudança de API deve:

1. alterar primeiro `docs/openapi-v1.json` e registrar impacto compatível ou incompatível;
2. passar pelo validador `node scripts/validate-openapi.mjs`;
3. atualizar servidor, cliente e testes de conformidade na mesma entrega quando houver implementação;
4. ter revisão de backend, frontend e segurança quando tocar autenticação, casal ou respostas;
5. atualizar este documento, arquitetura, modelo de dados e plano quando mudar uma decisão;
6. nunca registrar exemplos com contas, tokens ou respostas reais.

## Critérios para estabilizar em 1.0.0

- tarefa 112 decidida e refletida no contrato;
- threat model da tarefa 36 aplicado;
- inventário LGPD da tarefa 37 reconciliado;
- `/api/v1` implementada sem dependência das rotas legadas;
- schemas de métricas detalhados e fontes financeiras confiáveis;
- testes de contrato, autorização, concorrência, idempotência e isolamento aprovados;
- erros e cabeçalhos observados iguais ao OpenAPI;
- aprovação conjunta de produto, frontend, backend e segurança.

Até esses critérios, a tarefa 35 fica **Em andamento**, com contrato-base entregue e lacunas rastreadas.
