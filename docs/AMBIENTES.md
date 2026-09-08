# Ambientes local, homologação e produção

Definição da tarefa 38, em 08/09/2026. Responsável técnico: DevOps/Plataforma, com revisão da Liderança Técnica. Tatyele Lopes responde pelo aceite de produto e pela decisão de lançamento.

Esta estratégia está definida; a infraestrutura remota ainda não está provisionada. Provedor, região, domínio, orçamento e responsáveis nominais de operação permanecem pendentes nas tarefas 16, 92, 122 e 123. Os endereços abaixo são convenções, sem reserva ou publicação realizada.

## Matriz de ambientes

| Aspecto | Local (`local`) | Homologação (`staging`) | Produção (`production`) |
| --- | --- | --- | --- |
| Finalidade | Desenvolvimento e diagnóstico | Validar versão candidata e ensaiar publicação | Atender os casais do piloto e versões liberadas |
| Público | Pessoa desenvolvedora | Equipe e avaliadores autorizados | Usuários convidados após go/no-go |
| Endereço | `http://127.0.0.1:5173`, API em `127.0.0.1:8787` | `https://homologacao.<dominio-aprovado>` | `https://app.<dominio-aprovado>` |
| Aplicação | Vite e API Node em processos locais | Arquivos compilados e API Node atrás de entrada HTTPS | Mesmo artefato validado em homologação, atrás de entrada HTTPS |
| Dados atuais | JSON local com dados fictícios | Nenhum ambiente ativo | Nenhum ambiente ativo |
| Persistência alvo | PostgreSQL local com mesma versão principal e migrações | PostgreSQL exclusivo de homologação | PostgreSQL exclusivo de produção |
| Conteúdo | Fixtures e catálogo candidato | Fixtures e versão editorial candidata | Somente catálogo aprovado e publicado |
| Credenciais | Exclusivas de desenvolvimento | Cofre e identidade exclusivos de homologação | Cofre e identidade exclusivos de produção |
| Integrações futuras | Simuladores ou captura local | Sandbox e destinatários de teste autorizados | Provedores aprovados e preferências do usuário |
| Acesso operacional | Máquina local | Equipe autenticada, MFA no painel do provedor | Privilégio mínimo, MFA e trilha de acesso |
| `NODE_ENV` | `development` | `production` | `production` |

Piloto com dados reais conta como produção, mesmo com poucos participantes. Homologação usa dados sintéticos; validação humana que exigir dados pessoais reais passa pelos mesmos critérios de liberação e privacidade de produção. Não copiar contas, sessões, respostas, eventos ou backups de produção para desenvolvimento ou homologação.

## Topologia e isolamento

Cada ambiente remoto terá sua própria entrada HTTPS, serviço de API, banco, identidade de execução, segredos, backups e destino de observabilidade. Homologação não terá permissão de rede ou credenciais para acessar recursos de produção. Separar os projetos ou unidades equivalentes do provedor e testar essa restrição.

O navegador acessará frontend e API na mesma origem: `/` entrega os arquivos de `dist` e `/api/*` encaminha à API daquele ambiente, preservando o caminho completo. O cliente atual usa `/api` e não precisa receber endereço de banco ou URL absoluta de API. Quando o contrato v1 for implementado, a entrada também deverá preservar `/api/v1/*`.

A entrada deve aplicar fallback da SPA apenas às páginas do frontend. Erros de `/api/*` não podem retornar `index.html`. O processo Node atual serve somente a API; servir `dist`, configurar TLS e supervisionar o processo são trabalho de provisionamento. A porta da API e o banco não serão expostos diretamente à internet.

Homologação deverá reproduzir versões de runtime e banco, migrações, cabeçalhos, autenticação, limites e política de cache de produção. Tamanho de instância, domínio, credenciais, dados e destinatários podem variar. Versões exatas serão fixadas no CI com instalação pelo lockfile (tarefas 39, 40 e 83).

## Configuração existente e contrato futuro

As únicas variáveis de aplicação lidas hoje em `server/src/config.js` são `HOST`, `PORT`, `DATABASE_FILE` e `ADMIN_EMAILS`. O código não seleciona ambiente automaticamente e não valida essas entradas. `NODE_ENV` é configuração do runtime/ferramentas; atribuir `production` não adiciona controles de segurança ao backend.

| Variável | Uso atual ou planejado | Regra |
| --- | --- | --- |
| `HOST` | Atual, interface de escuta da API | Local: `127.0.0.1`. Remoto: interface exigida pelo provedor, com entrada privada; `0.0.0.0` somente com isolamento de rede |
| `PORT` | Atual, porta HTTP interna | Local: `8787`, conforme proxy do Vite. Remoto: porta injetada pelo provedor |
| `DATABASE_FILE` | Atual, arquivo JSON | Exclusivo do protótipo local; caminho relativo ao diretório de execução ou absoluto. Não usar em homologação integrada ou produção |
| `ADMIN_EMAILS` | Atual, lista administrativa separada por vírgula | Vazio por padrão; contas de teste locais. Em remoto, cadastro restrito e auditado, sem reutilizar lista local |
| `NODE_ENV` | Runtime e ferramentas | Valores definidos na matriz; homologação também executa build de produção |
| `APP_ENV` | Planejado, identidade explícita do ambiente | `local`, `staging` ou `production`; implementar e validar na tarefa 123 |
| `APP_ORIGIN` | Planejado, origem pública canônica | URL exata por ambiente, HTTPS nos remotos; usar na validação de origem e links, tarefa 123 |
| `DATABASE_URL` | Planejado, conexão PostgreSQL | Credencial de servidor exclusiva, injetada pelo cofre; implementar adaptador na tarefa 41 |

As três variáveis planejadas ainda não têm efeito no app. A tarefa 123 deverá rejeitar ambiente desconhecido, porta inválida, origem ausente ou incompatível e JSON fora de local; a tarefa 41 deverá rejeitar conexão de banco ausente ou inválida. Não adotar fallback para dados locais quando um serviço remoto falhar.

O frontend continuará sem segredos. Não usar prefixo `VITE_` para senhas, tokens, chaves ou conexão de banco: variáveis com esse prefixo são expostas no código entregue ao navegador. Modo do Vite e `NODE_ENV` são conceitos distintos; a estratégia usa um build de produção promovido entre os ambientes, sem embutir configurações privadas. [Referência: variáveis e modos do Vite](https://vite.dev/guide/env-and-mode.html).

Arquivos `.env` e `.env.*` e dados locais estão ignorados pelo Git; apenas modelos `.env.*.example` sem segredos são versionados. Isso não constitui cofre, bloqueio de commit ou rotação: esses controles pertencem às tarefas 40, 42 e 83. Segredos remotos serão injetados no processo pela plataforma, sem incluí-los em artefatos, logs ou planilhas.

## Executar localmente hoje

Executar a partir da raiz do repositório. A referência verificada nesta entrega é Node `24.20.0` e Vite instalado `8.2.2`; a fixação de versões e análise de dependências continuam nas tarefas 39, 40 e 83.

Instalar dependências e copiar o modelo apenas se ainda não existir configuração local:

~~~powershell
npm.cmd ci --cache .npm-cache
if (-not (Test-Path -LiteralPath .env.local)) {
  Copy-Item -LiteralPath .env.local.example -Destination .env.local
}
~~~

No primeiro terminal, carregar explicitamente a configuração da API:

~~~powershell
node --env-file=.env.local server/index.mjs
~~~

No segundo terminal, iniciar o frontend com endereço e porta previsíveis:

~~~powershell
npm.cmd exec -- vite --host 127.0.0.1 --port 5173 --strictPort
~~~

Abrir `http://127.0.0.1:5173`. O proxy de desenvolvimento encaminha `/api` para `http://127.0.0.1:8787`. Se alterar a porta da API, ajustar também `vite.config.ts`. O JSON existente é preservado pelo modelo; ele não deve conter dados reais. Para um conjunto novo de fixtures, apontar `DATABASE_FILE` para outro arquivo dentro de `server/data`.

O Node carrega `.env.local` pelo argumento `--env-file`; variáveis já definidas no terminal têm precedência. O script existente `npm.cmd run dev` não carrega esse arquivo para a API e usa interfaces abertas (`0.0.0.0`), portanto os dois comandos acima são a referência para desenvolvimento restrito à máquina. [Referência: carregamento de arquivo de ambiente no Node](https://nodejs.org/api/cli.html#--env-filefile).

Para conferir a compilação:

~~~powershell
npm.cmd run build
~~~

`npm.cmd run preview` serve para inspeção local do build. Não representa homologação, configuração completa da API ou serviço de produção. [Referência: publicação estática com Vite](https://vite.dev/guide/static-deploy.html).

## Promoção de versões

1. Desenvolver em branch curta e revisar o código antes de integrar em `main`. Branches são fluxo de código; cada ambiente terá configuração e recursos próprios.
2. No CI, instalar pelo lockfile, compilar, executar validadores e testes aplicáveis, analisar dependências e segredos. Produzir artefato identificado por commit, hash e versão do schema. Não embutir `.env`, dados, credenciais ou backups.
3. Publicar o candidato em homologação, aplicar migrações e registrar checks de jornada bilateral, isolamento, cache, segurança e recuperação. Previews temporários, se criados, terão as mesmas restrições de dados de homologação e expiração ao encerrar a revisão.
4. Registrar aceite de QA, revisão técnica e decisão de produto. A primeira liberação passa pelas tarefas 96–98; nenhuma ameaça crítica do modelo pode permanecer aberta no piloto.
5. Promover o mesmo artefato verificado para produção, com segredos de produção injetados em execução. Registrar operador, commit, artefato, migrações, horário, evidências e versão anterior na tarefa 99.
6. Verificar a jornada com duas contas sintéticas controladas, alertas e disponibilidade após publicar. Diante de falha, interromper promoção e executar o procedimento de retorno.

O pipeline, a publicação e esses controles são requisitos a implementar nas tarefas 40, 123, 92 e 99. Nenhum deploy é realizado pela definição da tarefa 38.

## Dados, recuperação e operação

Migrar para PostgreSQL antes da homologação integrada. Usar a mesma sequência de migrações nos três ambientes, com usuário de migração separado da identidade de execução. Testes locais devem operar em banco descartável; ensaios de recuperação terão recursos isolados, identificados e sem permissão para sobrescrever produção.

Mudanças de schema devem permitir retorno à versão anterior do aplicativo, preferindo adicionar estrutura, migrar dados e remover campos em outra versão. Reimplantar artefato anterior não desfaz migração de banco. Alterações incompatíveis exigem ensaio e plano explícito de restauração antes da promoção.

Metas operacionais iniciais para o piloto: RPO de até 24 horas e RTO de até 4 horas. São metas de projeto, ainda não medidas. Configurar backup cifrado diário e antes de migração, retenção operacional inicial de 30 dias, respeitando o limite RT-12 de 90 dias do inventário. Ensaiar restauração antes do piloto e após mudança relevante de persistência; medir tempos, conferir integridade, invalidar sessões antigas e reaplicar exclusões. Evidências e ajustes das metas pertencem às tarefas 118 e 93.

Logs, métricas e alertas terão identificação de ambiente e versão, sem respostas íntimas, tokens, convites, corpos de requisição ou listas de e-mails. Alertas mínimos: indisponibilidade, erros da API, falha de banco, backup ausente e capacidade. A tarefa 43 implementará sondas de saúde e prontidão sem dados privados, destinando a prontidão às verificações internas; o backend atual ainda não tem esses endpoints.

Homologação terá acesso restrito na entrada, sinalização de ambiente e bloqueio de indexação. `robots.txt` ou `noindex` não substituem autenticação. Envios externos usarão sandbox ou destinatários autorizados. A produção seguirá as preferências e consentimentos implementados; o piloto gratuito não habilitará cobrança.

## Critérios e responsabilidades de ativação

| Verificação exigida | Evidência | Responsável / tarefa |
| --- | --- | --- |
| Banco e credenciais isolados | Conexão de homologação não acessa produção; migrações e concorrência testadas | Backend e DevOps / 41, 81, 123 |
| Segredos exclusivos | Inventário, injeção, rotação e permissões verificadas | DevOps / 42 |
| Publicação reproduzível | Artefato identificado, pipeline e promoção exercitados | DevOps / 40, 123, 99 |
| TLS, origem e cache | HTTPS, cabeçalhos, CORS restrito, respostas privadas sem cache e testes de sessão entre ambientes | Liderança Técnica e QA / 73, 84, 92, 119, 123 |
| Recuperação | Backup restaurado em recurso isolado, integridade e tempos registrados | DevOps / 118, 93 |
| Observabilidade | Sondas e alertas testados, inspeção de ausência de conteúdo privado | DevOps / 43 |
| Fornecedor e domínio | Região, custo, saída, operadores e domínio registrados | PO, DevOps e Privacidade / 16, 92, 122, 123 |
| Dados reais e piloto | Gates do threat model e inventário atendidos, QA/UAT e decisão registrados | QA, Liderança Técnica, Privacidade e PO / 84, 87, 90, 96–98, 121, 122 |

O JSON atual, CORS `*`, sessões e convites ainda mantêm as limitações documentadas no [modelo de ameaças](MODELAGEM-DE-AMEACAS.md). A definição dos ambientes não encerra essas ameaças nem torna o protótipo apto para o piloto externo. Os critérios acima serão comprovados na implementação e no lançamento.

## Acompanhamento

A tarefa 38 fica concluída como estratégia documentada. As tarefas 41, 42, 43, 92 e 118 recebem os requisitos por ambiente e continuam não iniciadas. A tarefa 123 registra o provisionamento de homologação e a validação de configuração, que ainda não tinham item próprio. O marco MC4 passa a explicitar homologação operacional. A planilha e seu gerador continuam sendo a referência do status de execução.
