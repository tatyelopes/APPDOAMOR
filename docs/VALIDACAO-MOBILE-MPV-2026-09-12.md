# Validação mobile do MPV — 12/09/2026

**Resultado:** checklist parcialmente aprovado; tarefa 132 permanece em andamento.

## Escopo executado

- build de produção do MPV;
- Microsoft Edge 152, motor Chromium 152, com emulação móvel;
- viewports `320 × 568`, `360 × 800`, `390 × 844`, `412 × 915` e `667 × 375` em paisagem;
- 45 estados de tela inspecionados;
- fluxos completos de **Descoberta a Dois** e **Adivinhe de Mim**;
- entrada, instruções, voltar, reinício, três rodadas, pulo disponível, passagem do aparelho, revelação, feedback e encerramento;
- rotação durante a tela protegida de passagem do aparelho;
- acionamento real por evento de toque em um cartão de jogo.

## Critérios aprovados

| Critério | Resultado | Evidência |
|---|---|---|
| Layout sem rolagem horizontal | Aprovado | Nenhum estouro nos 45 estados e cinco viewports |
| Entrada e seleção por toque | Aprovado | Toque abriu corretamente **Descoberta a Dois** |
| Descoberta a Dois | Aprovado | Três rodadas, avanço, pulo e fechamento concluídos |
| Adivinhe de Mim | Parcial | Três rodadas, sigilo, alternância e revelação funcionam; pulo ausente |
| Rotação | Aprovado | Estado protegido preservado ao alternar `390 × 844` e `844 × 390` |
| Voltar para instruções e seleção | Parcial | Navegação funciona, mas abandona rodada sem confirmação |
| Reinício | Aprovado | **Jogar novamente** reinicia na rodada 1 |
| Feedback | Aprovado | Três sinais, envio, encerramento e layout móvel funcionam |
| Legibilidade principal | Aprovado com ressalva | Perguntas e ações principais legíveis; textos auxiliares pequenos listados abaixo |

## Achados que impedem a aprovação final

### MOB-01 — Adivinhe de Mim não permite pular

**Severidade:** alta.

O critério de aceite do fluxo determina que os dois jogos permitam pular. O controle existe em **Descoberta a Dois**, mas não aparece em nenhuma etapa de **Adivinhe de Mim**.

**Correção esperada:** permitir pular a rodada, limpar escolha e palpite e avançar sem revelar conteúdo.

### MOB-02 — saída durante a rodada não solicita confirmação

**Severidade:** alta.

Na segunda rodada, **Voltar às instruções** e o logotipo descartaram o estado imediatamente. Nenhuma confirmação foi chamada e, ao iniciar novamente, o jogo retornou à rodada 1.

**Correção esperada:** pedir “Encerrar esta sessão?” antes de sair e manter o usuário na rodada quando houver cancelamento. O logotipo não deve abandonar silenciosamente uma sessão ativa.

### MOB-03 — alvos de feedback têm 40 px

**Severidade:** média; encaminhado para a tarefa 133.

Os controles **Sim** e **Não** mediram 40 px de altura em todos os viewports. O restante das ações críticas atingiu pelo menos 44 px.

**Correção esperada:** elevar os dois alvos para pelo menos 44 px e revalidar foco e toque.

## Observações de legibilidade

- o selo **Teste com casais** usa 8 px nos viewports menores;
- a nota de privacidade usa 11 px;
- perguntas, opções e ações principais permaneceram legíveis e sem cortes.

Esses textos auxiliares devem ser revistos junto à tarefa 133, sem bloquear isoladamente o fluxo funcional.

## Limitação do ensaio

O ensaio cobriu o navegador Chromium disponível no ambiente com emulação de tamanho, toque e rotação. Não substitui uma passagem final em aparelhos físicos com Chrome Android e Safari iOS.

## Decisão

A responsividade estrutural está aprovada, mas o checklist mobile completo permanece **em andamento** até corrigir MOB-01, MOB-02 e MOB-03 e repetir os cenários afetados.
