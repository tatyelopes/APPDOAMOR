# Revalidação mobile do MPV — 14/09/2026

**Resultado:** checklist aprovado na matriz emulada; tarefa 132 permanece em andamento somente até a passagem final em aparelhos físicos.

**Atualização de 16/09/2026:** a matriz foi repetida após incluir a sugestão aberta opcional e permaneceu aprovada nos 95 estados.

## Escopo executado

- build de produção concluído sem erro;
- Microsoft Edge 152.0.4191.62, motor Chromium, em modo headless e com emulação móvel;
- viewports `320 × 568`, `360 × 800`, `390 × 844`, `412 × 915` e `667 × 375`;
- 95 estados de tela inspecionados pelo validador `scripts/validate-mobile-mpv.mjs`;
- fluxos completos de **Descoberta a Dois** e **Adivinhe de Mim** em todos os viewports;
- seleção por evento real de toque, três rodadas, pulo antes e depois da passagem do aparelho, revelação, feedback, reinício e encerramento;
- rotação durante a tela protegida de passagem do aparelho;
- cancelamento de saída preservando rodada e escolha, seguido de confirmação encerrando a sessão;
- medição automática de rolagem horizontal, alvos de ação e nomes acessíveis.
- verificação do título, metadados, conteúdo visível, chaves locais e pacote de produção para impedir exposição do nome do aplicativo.
- preenchimento e persistência de sugestão opcional, incluindo envio válido sem texto.

## Resultado por critério

| Critério | Resultado | Evidência |
|---|---|---|
| Build de produção | Aprovado | TypeScript e Vite concluídos sem erro |
| Layout sem rolagem horizontal | Aprovado | Nenhum overflow nos 95 estados e cinco viewports |
| Entrada e seleção por toque | Aprovado | Toque abriu **Descoberta a Dois** nos cinco viewports |
| Descoberta a Dois | Aprovado | Três rodadas, avanço, pulo, feedback e reinício concluídos em toda a matriz |
| Sugestão de melhoria | Aprovado | Campo opcional aceita até 500 caracteres, envia ao servidor quando preenchido e permite envio vazio |
| Adivinhe de Mim | Aprovado | Pulo na escolha secreta e no palpite avançou, limpou escolhas e não revelou conteúdo |
| Rotação | Aprovado | A passagem protegida permaneceu ativa após rotação em toda a matriz |
| Saída de sessão ativa | Aprovado | Cancelar preservou o estado e confirmar encerrou a sessão pelo botão voltar e pelo logotipo |
| Alvos de ação | Aprovado | Nenhum alvo visível abaixo de 44 px |
| Nomes acessíveis | Aprovado | Nenhum controle visível sem nome acessível nos estados inspecionados |
| Exposição do nome do aplicativo | Aprovado | Título, metadados, cabeçalho, rodapé e chave local usam apresentação neutra |

## Correções verificadas

### MOB-01 — resolvido

**Adivinhe de Mim** agora oferece **Pular esta rodada** tanto na escolha secreta quanto no palpite. O teste confirmou avanço, limpeza das duas escolhas e ausência de revelação nos cinco viewports.

### MOB-02 — resolvido

O botão de voltar e o logotipo exibem **Encerrar esta sessão?** durante uma rodada. Cancelar mantém fase, rodada e escolha; confirmar encerra e retorna ao destino correto.

### MOB-03 — resolvido

Os alvos **Sim** e **Não** passaram a ter altura mínima de 44 px. A varredura não encontrou outro alvo de ação abaixo do limite.

## Observações não bloqueantes

- o selo **Teste com casais** permanece com tamanho mínimo de 8 px;
- a nota de privacidade permanece com tamanho mínimo de 11 px;
- o navegador registrou um `404` da solicitação automática de favicon; não houve exceção da aplicação nem impacto no fluxo.
- nenhuma ocorrência do nome do aplicativo foi encontrada nos arquivos do build de produção em `dist`.

## Limitação do ensaio

O ensaio cobre Chromium local com emulação de tamanho, densidade, toque e rotação. Ele não substitui a passagem final em aparelhos físicos com Chrome Android e Safari iOS.

## Decisão

A estrutura responsiva, o caminho feliz e as regressões MOB-01, MOB-02 e MOB-03 estão aprovados na matriz emulada. O item 132 permanece **em andamento** apenas até executar a passagem final em Chrome Android e Safari iOS físicos.

## Reproduzir

```powershell
npm.cmd run build
node scripts/validate-mobile-mpv.mjs
```
