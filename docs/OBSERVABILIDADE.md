# Observabilidade básica

**Data:** 17/09/2026  
**Escopo:** tarefa 43, demonstração controlada e base reutilizável para os ambientes futuros.

## Resultado

A API registra eventos estruturados, mede seu funcionamento, diferencia processo vivo de armazenamento pronto e possui monitoramento externo gratuito. A implementação não envia respostas íntimas, sugestões, corpos de requisição, e-mails, convites, tokens ou conexões de banco para logs e métricas.

## Sondas

| Rota | Finalidade | Resposta | Acesso |
| --- | --- | --- | --- |
| `GET /api/health` | Confirmar que o processo HTTP está vivo | `200 {"status":"ok"}` | Público e mínimo; usado pelo Render |
| `GET /api/ready` | Confirmar que o armazenamento e o schema estão acessíveis | `200 {"status":"ready"}` ou `503 {"status":"not_ready"}` | Público e mínimo; usado pelo monitor |
| `GET /api/ops/metrics` | Diagnóstico de requisições, erros, prontidão, memória e versão | JSON operacional | Protegido temporariamente pelo mesmo bearer token da exportação |

A prontidão executa uma consulta real e verifica a migração do feedback quando há PostgreSQL. No fallback local, detecta arquivo JSON inválido. Nenhuma sonda retorna endereço, credencial, mensagem interna ou conteúdo armazenado.

## Logs estruturados

Cada linha é um objeto JSON com horário UTC, nível, evento, serviço, ambiente e versão. Requisições da API registram somente:

- request ID gerado ou validado pelo servidor;
- método e rota normalizada, sem parâmetros ou query string;
- status HTTP e duração;
- código e tipo genérico do erro, sem mensagem ou stack com dados imprevisíveis.

Erros `500` retornam uma mensagem genérica e o request ID. Os eventos de início, migração e falha de prontidão seguem o mesmo formato. Arquivos estáticos não geram uma linha por requisição, evitando ruído.

## Métricas

As métricas ficam em memória e recomeçam a cada deploy ou reinício. Elas incluem:

- total e requisições em andamento;
- totais por classe de status e rota normalizada;
- quantidade de erros `5xx`;
- verificações e falhas de prontidão, último estado e latência;
- tempo de atividade, ambiente, versão e memória do processo.

Para consultar localmente, sem mostrar a chave:

```powershell
$token = [Environment]::GetEnvironmentVariable('MPV_EXPORT_TOKEN', 'User')
$headers = @{ Authorization = "Bearer $token" }
Invoke-RestMethod 'https://momento-a-dois-teste.onrender.com/api/ops/metrics' -Headers $headers
Remove-Variable token
```

O uso compartilhado do token é uma simplificação exclusiva desta demonstração controlada. Homologação e produção definitivas devem ter identidade de observabilidade separada, MFA no provedor, retenção e auditoria de acesso nas tarefas 42, 84 e 123.

## Alerta gratuito

O workflow `.github/workflows/monitor.yml` consulta a prontidão a cada 15 minutos e também pode ser executado manualmente. São feitas três tentativas para tolerar a inicialização lenta do serviço gratuito.

Se todas falharem, o GitHub abre uma única issue chamada **[Monitoramento] MVP indisponível ou sem acesso ao banco**. Quando a sonda volta a responder, o workflow comenta o horário de recuperação e encerra a issue. O workflow possui somente `contents: read` e `issues: write`, não usa segredo do aplicativo e não registra o corpo recebido.

Para receber o aviso por e-mail ou pelo aplicativo do GitHub, a responsável deve manter as notificações de **Actions** e **Issues** do repositório habilitadas. O monitor identifica indisponibilidade e falha de banco; a execução agendada pode sofrer atraso do próprio GitHub.

## Verificação

```powershell
npm.cmd run validate:observability
```

O teste cobre logs em JSON, canário privado ausente dos logs, IDs de requisição, vida e prontidão separadas, falha de armazenamento, métricas protegidas, contadores, capacidade do processo, agenda do monitor, permissão mínima e encerramento após recuperação.

## Limites e próximas integrações

Esta é a observabilidade básica da tarefa 43. Métricas duráveis, histórico, dashboards, alertas de taxa de erro e capacidade por ambiente serão ligados ao destino definitivo da tarefa 123. Backup ausente e restauração pertencem às tarefas 118 e 93. Auditoria de ações administrativas e de segurança continua nas tarefas 59 e 84. Nenhum desses itens exige ampliar os dados registrados nos logs atuais.
