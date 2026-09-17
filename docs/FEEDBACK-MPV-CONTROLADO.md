# Feedback centralizado do MPV — versão controlada

**Versão:** 1.0
**Data:** 16/09/2026
**Status:** publicado no ambiente gratuito controlado em 16/09/2026; a versão ampliada de 17/09/2026 aceita feedback das três experiências e aguarda nova passagem física no Chrome. Safari continua adiado e não validado.

## Objetivo

Receber em um ponto central os três sinais do MPV e a sugestão opcional, sem cadastro, nomes, respostas das rodadas, endereço IP persistido ou uso do canal de analytics.

## Fluxo

1. O navegador gera um identificador aleatório de submissão.
2. `POST /api/mpv/feedback` valida origem, limite de requisições, jogo, sinais e sugestão.
3. O servidor usa o identificador para impedir duplicação em tentativas repetidas.
4. O registro recebe ID e horário do servidor e é salvo em PostgreSQL quando `DATABASE_URL` está configurada; localmente, o JSON permanece como fallback de desenvolvimento.
5. A interface só confirma o envio após resposta de sucesso da API.
6. A pessoa responsável exporta os registros por uma rota protegida, sem expor o token ao frontend.

## Contrato controlado

### Enviar feedback

`POST /api/mpv/feedback`

Não exige conta. Corpo JSON:

```json
{
  "submissionId": "identificador-aleatorio-com-16-ou-mais-caracteres",
  "gameId": "discovery-together",
  "clarity": "yes",
  "connection": "yes",
  "replayIntent": "yes",
  "suggestion": "Mais exemplos nas instruções"
}
```

Regras:

- `gameId`: `discovery-together`, `guess-about-me` ou `love-style-sample`;
- os três sinais: `yes` ou `no`;
- `suggestion`: opcional, texto com até 500 caracteres;
- `submissionId`: idempotência; o mesmo valor não cria outro registro;
- até 20 tentativas por endereço de rede a cada hora, mantidas apenas em memória;
- quando `APP_ORIGIN` estiver configurada, origem diferente é rejeitada.

Respostas principais: `201` criado, `200` reenvio já registrado, `400` conteúdo inválido, `403` origem rejeitada e `429` limite temporário.

### Exportar CSV

`GET /api/mpv/feedback/export`

Exige `Authorization: Bearer <MPV_EXPORT_TOKEN>`. O segredo precisa ter no mínimo 32 caracteres e nunca pode usar prefixo `VITE_` ou ser enviado ao navegador. O CSV neutraliza valores que poderiam ser interpretados como fórmula por planilhas.

Use o comando local. Na máquina da responsável, o script também procura o segredo salvo no perfil do Windows quando ele não estiver carregado no terminal:

```powershell
npm.cmd run export:mpv-feedback -- -ApiBaseUrl 'https://momento-a-dois-teste.onrender.com'
```

O arquivo é criado em `server/exports/`, diretório ignorado pelo Git.

## Configuração

```text
APP_ORIGIN=https://endereco-exato-do-teste.example
MPV_EXPORT_TOKEN=<segredo aleatório com pelo menos 32 caracteres>
MPV_FEEDBACK_RETENTION_DAYS=90
DATABASE_FILE=server/data/database.json
DATABASE_URL=<conexão PostgreSQL opcional para o feedback>
```

O proxy do Vite aceita `API_PROXY_TARGET` para testes automatizados. Nenhuma dessas variáveis secretas deve receber prefixo `VITE_`.

## Serviço publicado para o teste controlado

O build do frontend e a API podem operar no mesmo serviço e na mesma origem:

```powershell
npm.cmd ci --cache .npm-cache
npm.cmd run build
npm.cmd start
```

O provedor deve executar o build, iniciar `npm.cmd start`, encaminhar HTTPS para a porta definida em `PORT`, verificar `GET /api/health` e montar armazenamento persistente no caminho configurado em `DATABASE_FILE`. `APP_ORIGIN` precisa ser exatamente o endereço HTTPS entregue aos participantes. O serviço envia `noindex`, também inclui `robots.txt` e não usa o nome do aplicativo na página do teste.

Para exportar de um serviço remoto:

```powershell
npm.cmd run export:mpv-feedback -- -ApiBaseUrl 'https://endereco-do-teste.example'
```

O token continua apenas no terminal da pessoa responsável e no cofre do provedor.

O provisionamento sem custo está declarado em `render.yaml`: Web Service gratuito e PostgreSQL gratuito na região `virginia`. O segredo `MPV_EXPORT_TOKEN` é gerado pelo Render e não é versionado. Esse banco gratuito expira 30 dias após a criação, não possui backup automático e deve ser exportado antes do vencimento.

## Limites da versão controlada

- o JSON é usado somente como fallback local; o serviço remoto usa PostgreSQL;
- o PostgreSQL gratuito expira em 30 dias e não possui backup automático;
- o rate limit é local ao processo e não substitui proteção na entrada HTTPS;
- a exportação usa segredo operacional único, ainda sem usuários administrativos, MFA ou auditoria;
- feedback real exige transparência, retenção aplicada, canal de direitos e acesso restrito;
- esta rota é temporária em `/api`; o contrato estável deve ser incorporado a `/api/v1` antes de produção.

O serviço HTTPS, o envio e a exportação foram verificados em 16/09/2026, e o registro sintético usado na validação foi removido. A base ficou vazia para iniciar o teste. O endereço permanece sem indexação, mas isso não equivale a controle de acesso.

Antes de ampliar o compartilhamento além do teste controlado, ainda são necessários banco durável, backup, monitoramento e aprovação dos gates registrados no inventário LGPD.

## Verificação

```powershell
npm.cmd run validate:mpv-feedback
npm.cmd run validate:mpv-production
node scripts/validate-mobile-mpv.mjs
```

Os testes cobrem envio anônimo, idempotência, validação, limite do texto, origem, exportação protegida, neutralização de fórmulas, ausência de IP persistido e integração móvel.
