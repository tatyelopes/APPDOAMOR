# Gestão segura de segredos

## Objetivo e estado

Esta baseline implementa a parte controlável da tarefa 42 sem serviço pago: inventário, separação por ambiente, geração local segura, validação em runtime, bloqueio de commit e gate no CI. O Render já injeta a conexão PostgreSQL internamente e gera o token de exportação fora do repositório.

A tarefa permanece em andamento até existirem homologação e produção definitivas com identidades próprias, responsáveis nominais e uma primeira rotação registrada. Arquivo `.env`, variável de CI e painel do provedor não devem ser tratados como intercambiáveis.

## Inventário

| Segredo | Uso | Ambientes | Armazenamento permitido | Exposição proibida | Rotação inicial |
| --- | --- | --- | --- | --- | --- |
| `DATABASE_URL` | conexão da API e executor de migrações | local, homologação e produção | `.env` local ignorado; segredo do provedor remoto | frontend, log, documentação, planilha, issue | na troca de ambiente, pessoa ou suspeita; no máximo 90 dias no piloto |
| `POSTGRES_PASSWORD` | criação do PostgreSQL local | somente local | `.env.postgres.local` ignorado | Git, captura compartilhada, comando gravado em histórico | quando a configuração local for recriada ou exposta |
| `MPV_EXPORT_TOKEN` | autorizar exportação de feedback | local e cada ambiente remoto | `.env` local ignorado; segredo gerado pelo provedor | `VITE_*`, URL, frontend, log, mensagem ou CSV | antes de cada rodada externa e imediatamente após exposição |
| Credenciais futuras de e-mail/notificação | enviar mensagens transacionais | homologação e produção | cofre do provedor aprovado | cliente, banco, analytics e repositório | conforme fornecedor e após mudança de acesso |
| Chave futura de criptografia | proteger conteúdo S4 | homologação e produção | KMS/cofre com identidade da aplicação | variável de frontend, arquivo, backup junto dos dados | política do KMS e rotação ensaiada |

Tokens de sessão, recuperação e convite são credenciais de usuário, não configuração operacional. Hash, TTL, revogação e rotação deles pertencem às tarefas 45–49 e não são resolvidos por esta baseline.

## Onde cada ambiente guarda segredos

- **Local:** `.env.local` e `.env.postgres.local`, ambos ignorados pelo Git, com dados exclusivamente fictícios. Cada pessoa gera os próprios valores.
- **CI:** os testes atuais não consomem segredos persistentes. Usuário, senha e banco do PostgreSQL são valores sintéticos declarados no workflow e o container é descartado.
- **Demonstração controlada:** `DATABASE_URL` vem da ligação privada com o banco do Render e `MPV_EXPORT_TOKEN` usa valor gerado pelo Render. Nenhum dos dois entra no código ou build do frontend.
- **Homologação e produção futuras:** projetos, identidades, conexões e tokens distintos. Uma identidade não recebe leitura do outro ambiente. Produção exige MFA no painel e privilégio mínimo.

Segredos do GitHub, quando algum job futuro realmente precisar deles, devem usar GitHub Environments distintos e aprovação para produção. Não criar segredo apenas para duplicar um valor que o provedor já injeta diretamente.

## Configuração local

O comando abaixo cria os dois arquivos privados, gera senha e token com `crypto.randomBytes`, não mostra os valores e recusa sobrescrita:

```powershell
npm.cmd run secrets:init
```

Depois, iniciar PostgreSQL e aplicar as migrações conforme [Banco de dados e migrações](BANCO-DE-DADOS-E-MIGRACOES.md). Não copie credenciais remotas para desenvolvimento.

## Controles automatizados

`npm.cmd run validate:secrets` executa:

1. varredura dos arquivos rastreados por chaves privadas, assinaturas conhecidas, credenciais PostgreSQL literais e segredos com prefixo `VITE_`;
2. testes da validação de runtime para token forte, URL PostgreSQL, ausência de placeholders e obrigatoriedade dos segredos remotos.

O hook pre-commit verifica o conteúdo staged e oculta valores nos achados. O CI repete a varredura completa. O scanner é uma barreira preventiva, não uma garantia de que um segredo nunca vazou; revisão humana e rotação continuam obrigatórias.

Uma auditoria explícita dos patches já presentes no histórico pode ser executada com `npm.cmd run scan:secrets:history`. Ela informa apenas commit, arquivo e regra, sem reproduzir possíveis valores. O CI verifica o estado rastreado atual; a auditoria histórica deve ser repetida antes de abrir o repositório ou após incorporar histórico externo.

A API recusa:

- qualquer variável `VITE_*` cujo nome indique segredo, token, senha, chave privada ou URL de banco;
- `DATABASE_URL` inválida, sem credenciais ou com placeholder;
- `MPV_EXPORT_TOKEN` menor que 32 caracteres ou demonstrativo;
- execução com `NODE_ENV=production` sem banco ou token de exportação.

Mensagens informam somente o nome da configuração inválida. Nunca incluem o valor recebido.

## Rotação

1. Abrir um registro a partir de [REGISTRO-DE-ROTACAO-DE-SEGREDOS.md](templates/REGISTRO-DE-ROTACAO-DE-SEGREDOS.md), sem copiar o segredo.
2. Identificar ambiente, sistema consumidor, responsável, motivo e dependências.
3. Gerar o novo valor no cofre ou provedor do ambiente.
4. Atualizar somente os consumidores autorizados e reiniciar ou publicar a aplicação.
5. Confirmar saúde, migrações, envio e exportação usando dado sintético.
6. Revogar o valor anterior assim que a transição for comprovada.
7. Registrar horários, executor, aprovador, evidência e próxima revisão, nunca o valor.

Para `DATABASE_URL`, a rotação deve trocar a credencial do usuário da aplicação sem alterar o usuário de migração futuro. Para `MPV_EXPORT_TOKEN`, qualquer cópia anterior deixa de exportar imediatamente após a rotação.

## Suspeita de exposição

Tratar como incidente, mesmo quando não houver prova de uso:

1. revogar ou rotacionar imediatamente no ambiente afetado;
2. interromper deploys que ainda usem o valor antigo;
3. verificar acessos e exportações sem registrar conteúdo íntimo;
4. remover o valor de superfícies públicas, mas não considerar a remoção do histórico como revogação;
5. avaliar impacto, titulares e obrigações com Privacidade/Jurídico;
6. registrar causa, janela, ambientes e medidas sem reproduzir o segredo.

Se um valor entrar no Git, ele deve ser considerado comprometido mesmo após apagar o arquivo. Rotacionar primeiro; reescrever histórico exige análise específica e coordenação com todas as cópias do repositório.

## Critérios para concluir a tarefa 42

- controles locais, runtime, pre-commit e CI aprovados;
- segredos atuais do MPV mantidos somente no provedor;
- homologação e produção definitivas com identidades e valores exclusivos;
- responsáveis e acessos nominais aprovados;
- primeira rotação de cada segredo remoto executada e registrada;
- nenhuma credencial conhecida no histórico ou artefatos.
