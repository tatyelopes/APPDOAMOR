# Revalidação mobile do MPV — 14/09/2026

**Resultado:** checklist aprovado na matriz emulada; tarefa 132 permanece em andamento somente até a passagem final em aparelhos físicos.

**Atualização de 16/09/2026:** a matriz foi repetida após incluir a sugestão aberta opcional e permaneceu aprovada nos 95 estados. O roteiro abaixo incorpora a passagem física que encerra a tarefa 132.

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

## Passagem física da tarefa 132

Abrir `https://momento-a-dois-teste.onrender.com` diretamente no navegador, sem instalar atalhos e sem usar modo de emulação. Executar o roteiro uma vez no Chrome de um aparelho Android e outra no Safari de um iPhone. Se o serviço estiver inativo, o primeiro carregamento pode demorar cerca de um minuto.

Não inserir nomes, respostas íntimas, e-mail, telefone ou qualquer outro dado pessoal. No feedback técnico, usar somente a frase indicada para cada plataforma. Depois das duas passagens, exportar os feedbacks e remover os registros técnicos antes de convidar os casais.

### Identificação dos aparelhos

| Plataforma | Modelo do aparelho | Versão do sistema | Versão do navegador | Rede | Data e hora | Pessoa testadora |
|---|---|---|---|---|---|---|
| Android / Chrome | A preencher | A preencher | A preencher | Wi-Fi ou móvel | A preencher | A preencher |
| iPhone / Safari | A preencher | A preencher | A preencher | Wi-Fi ou móvel | A preencher | A preencher |

### Roteiro obrigatório em cada aparelho

| Etapa | Verificação | Android / Chrome | iPhone / Safari |
|---|---|---|---|
| 1 | A página abre por HTTPS e não mostra o nome do aplicativo na tela, no título ou em avisos | ☐ | ☐ |
| 2 | A tela inicial cabe na largura em modo retrato, sem rolagem horizontal | ☐ | ☐ |
| 3 | **Descoberta a Dois** inicia por toque e completa três rodadas | ☐ | ☐ |
| 4 | **Pular esta rodada** avança sem revelar nem preservar a escolha anterior | ☐ | ☐ |
| 5 | A tela protegida de passagem do aparelho continua correta depois de girar para paisagem e voltar para retrato | ☐ | ☐ |
| 6 | Cancelar **Encerrar esta sessão?** preserva a rodada; confirmar encerra e volta à tela inicial | ☐ | ☐ |
| 7 | **Adivinhe de Mim** completa escolha, passagem do aparelho, palpite, revelação e resultado | ☐ | ☐ |
| 8 | O teclado não cobre o campo de sugestão nem impede o envio do feedback | ☐ | ☐ |
| 9 | O feedback é enviado com sucesso usando a frase técnica da plataforma | ☐ | ☐ |
| 10 | Reiniciar e trocar de jogo não recupera escolha, rodada ou sugestão da sessão anterior | ☐ | ☐ |
| 11 | Textos, botões e áreas de toque permanecem legíveis e acionáveis nas duas orientações | ☐ | ☐ |
| 12 | Não ocorreu travamento, tela em branco, mensagem técnica ou perda inesperada de estado | ☐ | ☐ |

Frases obrigatórias para identificar os registros de teste:

- Android: `TESTE FISICO 132 - ANDROID - REMOVER`
- iPhone: `TESTE FISICO 132 - IPHONE - REMOVER`

### Registro do resultado

| Plataforma | Resultado final | Falha encontrada | Evidência sem dados pessoais |
|---|---|---|---|
| Android / Chrome | ☐ Aprovado ☐ Reprovado | A preencher ou “nenhuma” | Captura ou gravação local |
| iPhone / Safari | ☐ Aprovado ☐ Reprovado | A preencher ou “nenhuma” | Captura ou gravação local |

A tarefa 132 só pode mudar para **Concluído** quando as 12 etapas estiverem aprovadas nos dois aparelhos, as identificações dos dispositivos estiverem preenchidas e os dois feedbacks técnicos tiverem sido conferidos e removidos. Qualquer falha deve registrar aparelho, sistema, navegador, etapa, comportamento observado e captura sem dados pessoais.

## Decisão

A estrutura responsiva, o caminho feliz e as regressões MOB-01, MOB-02 e MOB-03 estão aprovados na matriz emulada. O roteiro da passagem física foi incorporado em 16/09/2026. O item 132 permanece **em andamento** até obter o aceite registrado em Chrome Android e Safari iOS físicos.

## Reproduzir

```powershell
npm.cmd run build
node scripts/validate-mobile-mpv.mjs
```
