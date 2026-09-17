# Banco de dados e migrações

## Estado atual

O projeto possui PostgreSQL 18 local reproduzível, migrações SQL versionadas e validação de integridade contra um banco real no CI. O esquema alvo inclui contas, casais, vínculos, sessões de autenticação, partidas, participantes, rodadas, respostas, progresso, analytics e feedback do MPV.

A integração da aplicação ainda é parcial: o feedback do MPV usa PostgreSQL quando `DATABASE_URL` está configurada; os fluxos antigos de cadastro, casal, sessão, resposta e analytics continuam no JSON até que seus repositórios transacionais sejam implementados e testados. As tabelas já existem para permitir essa evolução, mas nenhuma migração de dados legados é executada automaticamente.

## Iniciar PostgreSQL local

É necessário Docker Desktop ou outro ambiente compatível com Docker Compose. Em um checkout ainda sem configuração local, execute na raiz do projeto:

```powershell
npm.cmd run secrets:init
```

O comando cria `.env.local` e `.env.postgres.local` com valores aleatórios correspondentes, sem exibi-los e sem sobrescrever arquivos existentes. Inicie o serviço:

```powershell
docker compose --env-file .env.postgres.local up -d postgres
docker compose --env-file .env.postgres.local ps
```

O banco fica acessível somente em `127.0.0.1`, por padrão na porta 5432. O volume `postgres-data` preserva os dados entre reinicializações do container. O arquivo real de configuração fica ignorado pelo Git.

## Aplicar e validar migrações

Carregue a conexão local sem expor a senha no comando:

```powershell
node --env-file=.env.postgres.local scripts/migrate-database.mjs
node --env-file=.env.postgres.local scripts/validate-postgres-database.mjs
```

Para iniciar a API com PostgreSQL, mantenha a mesma `DATABASE_URL` em `.env.local` e execute:

```powershell
node --env-file=.env.local server/index.mjs
```

O fallback JSON permanece disponível apenas quando `DATABASE_URL` está vazia. Se a variável estiver configurada e as migrações não tiverem sido aplicadas, o feedback falha de forma explícita em vez de criar tabelas silenciosamente.

Para interromper o banco sem apagar o volume:

```powershell
docker compose --env-file .env.postgres.local stop postgres
```

Remover o volume apaga os dados locais e não faz parte do fluxo normal.

## Convenção das migrações

Os arquivos ficam em `server/migrations` e seguem `NNNN_nome.sql`. O executor:

- descobre os arquivos em ordem crescente;
- mantém versão, nome, checksum SHA-256 e horário em `schema_migrations`;
- usa bloqueio consultivo para impedir dois executores simultâneos;
- aplica cada arquivo em uma transação;
- rejeita versão duplicada, arquivo vazio ou alteração em migração já aplicada;
- permite reexecução sem repetir alterações.

Uma migração aplicada é imutável. Qualquer evolução deve entrar em um novo arquivo numerado. Mudanças destrutivas exigem migração própria, plano de recuperação e ensaio conforme as tarefas 93 e 118.

## Execução nos ambientes

Quando `DATABASE_URL` está configurada, a própria API aplica as migrações antes de abrir a porta HTTP. O Render também declara `npm run db:migrate` antes de iniciar a API, oferecendo uma segunda barreira idempotente. A migração `0002_mpv_feedback.sql` reconhece a tabela de feedback já existente e registra sua versão sem apagar registros. Homologação e produção futuras deverão usar o mesmo processo com bancos e identidades separados.

O CI inicia um PostgreSQL 18 descartável, aplica todas as migrações e valida:

- histórico e checksums;
- idempotência do executor;
- aplicação automática antes de a API aceitar tráfego;
- presença das 13 tabelas operacionais, incluindo `schema_migrations`;
- unicidade de e-mail normalizado;
- limite de duas vagas vigentes por casal;
- domínio das vagas;
- idempotência do identificador de feedback;
- rollback dos dados sintéticos usados na validação.

O banco do CI não contém dados reais e é descartado ao final da execução.

A primeira execução com PostgreSQL real foi [aprovada no GitHub Actions em 17/09/2026](https://github.com/tatyelopes/APPDOAMOR/actions/runs/35269876662). A cobertura posterior também valida o bootstrap automático da API para evitar dependência da configuração externa do comando de início.

## Próximos passos da tarefa 41

Antes de concluir a tarefa 41 ainda é necessário:

1. substituir o armazenamento JSON dos fluxos antigos por repositórios PostgreSQL transacionais;
2. criar um importador explícito para dados legados, com relatório de divergências e sem transportar tokens de sessão em texto;
3. provisionar bancos definitivos e isolados de homologação e produção;
4. provar concorrência, backup e restauração nas tarefas 81, 93 e 118.

Até esses itens serem atendidos, a infraestrutura de migrações está funcional, mas a persistência completa do aplicativo continua em andamento.
