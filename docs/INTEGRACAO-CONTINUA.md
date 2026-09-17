# Integração contínua

## Estado

O pipeline de integração contínua está configurado em `.github/workflows/ci.yml`. A [primeira execução remota](https://github.com/tatyelopes/APPDOAMOR/actions/runs/35267092012) foi aprovada em 17/09/2026, concluindo a tarefa 40 do plano.

O fluxo verifica o código, os contratos técnicos e o plano operacional. Ele não publica o aplicativo no Render, não acessa dados reais e não requer segredos.

## Quando o pipeline é executado

- Em todo `push` para a branch `main`.
- Em todo pull request.
- Manualmente pela opção **Run workflow** no GitHub Actions.

Execuções anteriores da mesma branch são canceladas quando uma mais nova começa. Isso reduz consumo desnecessário de minutos e evita validar uma versão já substituída.

## Ambiente reproduzível

- Runner padrão `ubuntu-24.04`.
- Node.js `24.20.0`, igual ao ambiente declarado para a demonstração no Render.
- Cache oficial do npm baseado no `package-lock.json`.
- Instalação com `npm ci --ignore-scripts`, sem executar scripts de dependências durante a instalação.
- Permissão mínima de leitura do conteúdo do repositório.
- Limite de 20 minutos por execução.

## Gates obrigatórios

Uma alteração só fica verde quando todos estes passos passam:

1. lint;
2. conferência de formatação;
3. compilação TypeScript e Vite;
4. validação do contrato OpenAPI;
5. validação da modelagem de ameaças;
6. validação do inventário LGPD;
7. validação da API e da exportação de feedback;
8. validação da execução com configuração de produção;
9. validação automatizada da experiência móvel em cinco tamanhos de tela;
10. validação da estrutura, das dependências e das fórmulas do plano operacional.

A validação móvel usa o navegador Chrome já presente na imagem padrão do runner. O script também preserva compatibilidade local com Edge, Chrome e Chromium em Windows, Linux e macOS.

## Reproduzir localmente

No Windows, execute a partir da raiz do repositório:

```powershell
npm.cmd ci --ignore-scripts
npm.cmd run lint
npm.cmd run format:check
npm.cmd run build
npm.cmd run validate:openapi
npm.cmd run validate:threat-model
npm.cmd run validate:lgpd
npm.cmd run validate:mpv-feedback
npm.cmd run validate:mpv-production
node scripts/validate-mobile-mpv.mjs
powershell -NoProfile -ExecutionPolicy Bypass -File scripts/validate-project-plan.ps1
```

## Operação e custo

O pipeline usa apenas runners padrão hospedados pelo GitHub e não inclui serviços pagos, runners maiores nem etapas de deploy. Em repositórios públicos, o uso dos runners padrão do GitHub Actions é gratuito. Se o repositório ficar privado, passa a valer a franquia mensal da conta; sem forma de pagamento válida, novas execuções ficam bloqueadas após o consumo da franquia em vez de gerar cobrança automática.

Referências oficiais: [faturamento do GitHub Actions](https://docs.github.com/en/billing/concepts/product-billing/github-actions), [uso do Node.js no GitHub Actions](https://docs.github.com/en/actions/tutorials/build-and-test-code/nodejs) e [software do runner Ubuntu 24.04](https://github.com/actions/runner-images/blob/main/images/ubuntu/Ubuntu2404-Readme.md).

Falhas devem ser abertas na execução correspondente em **Actions > CI**. O nome da etapa indica qual gate impediu a aprovação. Como não há deploy nesse fluxo, uma falha não altera o MVP que já está publicado.
