# Conectadois — App do Amor

Aplicativo de conexão para casais. O repositório reúne documentação de produto, protótipos e uma implementação parcial em React e Node.

## Estado atual

- Cadastro e login individuais, criação de espaço, código de convite e espera de pareamento.
- Uma pergunta privada fixa com respostas no servidor e revelação após as duas contas participarem.
- Jogo local no mesmo dispositivo com 11 temas, perguntas discursivas, desafios e modo misto. As participações desse jogo ficam em memória durante a sessão.
- Testes de linguagens do amor e temperamentos implementados no frontend, com revisão de conteúdo e integração pendentes.
- Home e painel administrativo iniciais. O contador local não representa progresso confirmado, e métricas ainda precisam das correções registradas no plano.
- Persistência backend em JSON. O modelo PostgreSQL está documentado, mas não aplicado.
- Banco editorial com 119 atividades candidatas, incluindo 22 desafios na aba Desafios. Quantidade produzida não significa aprovação para o piloto.

O projeto compila, mas ainda depende de integração bilateral completa, testes automatizados, validação com casais e preparação operacional antes do piloto externo.

## Referências

- [Plano operacional em Excel](Plano%20de%20trabalho/acompanhamento-app-do-amor.xlsx)
- [Revisão geral de 04/09/2026](docs/REVISAO-GERAL-2026-09-04.md)
- [Escopo do MVP](docs/ESCOPO-MVP.md)
- [Arquitetura](docs/ARCHITECTURE.md)
- [Ambientes local, homologação e produção](docs/AMBIENTES.md)
- [Modelo de dados](docs/MODELO-DE-DADOS.md)
- [Modelagem de ameaças](docs/MODELAGEM-DE-AMEACAS.md)
- [Inventário de dados e bases legais LGPD](docs/INVENTARIO-DE-DADOS-E-BASES-LEGAIS-LGPD.md)
- [Contrato e versionamento da API](docs/CONTRATO-E-VERSIONAMENTO-DA-API.md)
- [Especificação OpenAPI v1](docs/openapi-v1.json)
- [Desenho da home](docs/HOME-E-ROTINA-DIARIA.md)
- [Protótipo da home](docs/prototipo-home-rotina.html)
- [Desenho de testes e resultados](docs/TESTES-E-RESULTADOS.md)
- [Protótipo de testes e resultados](docs/prototipo-testes-resultados.html)
- [Feedback centralizado do MPV](docs/FEEDBACK-MPV-CONTROLADO.md)

O protótipo HTML é uma demonstração local com dados fictícios. Ele não está integrado à home do app.

## Executar e compilar

Para execução restrita à máquina e configuração explícita da API, siga o [guia de ambientes](docs/AMBIENTES.md#executar-localmente-hoje) e use `.env.local.example`. O comando rápido abaixo usa interfaces abertas e não carrega `.env.local` na API. Homologação e produção estão definidas no guia, com provisionamento pendente.

Instale as dependências com a versão de Node compatível com o pacote instalado e execute:

```powershell
npm.cmd install --cache .npm-cache
npm.cmd run dev
```

Use os endereços informados no terminal. Para compilar:

```powershell
npm.cmd run build
```

Para validar os artefatos de arquitetura e privacidade:

```powershell
npm.cmd run validate:openapi
npm.cmd run validate:threat-model
npm.cmd run validate:lgpd
npm.cmd run validate:mpv-feedback
npm.cmd run validate:mpv-production
```

Para exportar os feedbacks do MPV em CSV, configure o mesmo `MPV_EXPORT_TOKEN` da API e execute `npm.cmd run export:mpv-feedback`. O procedimento e os limites desta versão estão no [guia do feedback controlado](docs/FEEDBACK-MPV-CONTROLADO.md).

A demonstração controlada possui configuração gratuita em `render.yaml`, com frontend e API no mesmo serviço, sonda de saúde e PostgreSQL para o feedback. O banco gratuito expira em 30 dias, portanto a exportação deve ocorrer antes do vencimento.

## Qualidade do código

O projeto usa ESLint para JavaScript, TypeScript e React e Prettier para formatação. Execute as verificações com:

```powershell
npm.cmd run lint
npm.cmd run format:check
npm.cmd run build
```

Para aplicar correções automáticas, use `npm.cmd run lint:fix` e `npm.cmd run format`. O comando `npm.cmd run check` executa lint, conferência de formatação e build em sequência.

O `npm.cmd install` ativa o hook do Husky por meio do script `prepare`. Antes de cada commit, o lint-staged corrige e formata apenas os arquivos staged compatíveis; se restar algum erro de lint, o commit é interrompido.

## Atualizar o acompanhamento

O gerador é a fonte das tarefas; o Excel é o acompanhamento operacional. Após alterar tarefas ou status:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File scripts/build-project-plan.ps1
powershell -NoProfile -ExecutionPolicy Bypass -File scripts/validate-project-plan.ps1
```

A validação confere estrutura, IDs, dependências, ciclos, conteúdo, cabeçalhos e fórmulas. A planilha solicita recálculo ao abrir no Excel.

## Próximo ciclo

Reconciliar formatos e mecânicas do piloto, revisar o conteúdo candidato, implementar partidas persistidas e conectar a experiência das duas contas. O detalhamento, as prioridades e as pendências estão no plano, incluindo os itens 112–119. Não há decisão de acrescentar IA, diagnósticos, rankings ou cobrança ao piloto gratuito.
