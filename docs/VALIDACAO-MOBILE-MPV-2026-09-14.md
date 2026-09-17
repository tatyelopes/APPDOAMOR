# Revalidação mobile do MPV — 14/09/2026

**Resultado:** versão ampliada aprovada na matriz emulada em 17/09/2026; a passagem física no Chrome de 16/09 cobre somente a versão anterior e precisa ser repetida. Safari permanece adiado e sem cobertura física.

**Atualização de 16/09/2026:** a matriz foi repetida após incluir a sugestão aberta opcional e permaneceu aprovada nos 95 estados. O roteiro abaixo incorpora a passagem física que encerra a tarefa 132.

**Atualização de 17/09/2026:** após a decisão de incluir a amostra autoral de preferências afetivas e o baralho visual, a matriz passou a inspecionar 185 estados. As três experiências, a escolha de cartas fechadas, cinco perguntas da amostra, resultado, reinício e feedback foram aprovados nos cinco viewports. A tarefa 142 registra a nova passagem física necessária no Chrome.

## Escopo executado

- build de produção concluído sem erro;
- Microsoft Edge 152.0.4191.62, motor Chromium, em modo headless e com emulação móvel;
- viewports `320 × 568`, `360 × 800`, `390 × 844`, `412 × 915` e `667 × 375`;
- 185 estados de tela inspecionados pelo validador `scripts/validate-mobile-mpv.mjs`;
- fluxos completos de **Descoberta a Dois**, **Adivinhe de Mim** e **Seu jeito de receber carinho** em todos os viewports;
- escolha acessível de cartas fechadas antes de cada pergunta, com redução correta do baralho;
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
| Layout sem rolagem horizontal | Aprovado | Nenhum overflow nos 185 estados e cinco viewports |
| Entrada e seleção por toque | Aprovado | Toque abriu **Descoberta a Dois** nos cinco viewports |
| Descoberta a Dois | Aprovado | Três rodadas, avanço, pulo, feedback e reinício concluídos em toda a matriz |
| Sugestão de melhoria | Aprovado | Campo opcional aceita até 500 caracteres, envia ao servidor quando preenchido e permite envio vazio |
| Adivinhe de Mim | Aprovado | Pulo na escolha secreta e no palpite avançou, limpou escolhas e não revelou conteúdo |
| Baralho visual | Aprovado | Cartas fechadas funcionaram por toque, reduziram a cada escolha e mantiveram alvos mínimos de 44 px |
| Amostra de carinho | Aprovado | Cinco perguntas, pontuação local, duas preferências principais, aviso autoral, reinício e feedback concluídos |
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

A tarefa 132 só pode mudar para **Concluído sem ressalvas** quando as 12 etapas estiverem aprovadas nos dois aparelhos, as identificações dos dispositivos estiverem preenchidas e os dois feedbacks técnicos tiverem sido conferidos e removidos. Qualquer falha deve registrar aparelho, sistema, navegador, etapa, comportamento observado e captura sem dados pessoais.

### Resultado registrado em 16/09/2026

- a Product Owner confirmou a passagem em um celular pelo Chrome; modelo, sistema e versão do navegador não foram informados;
- o servidor recebeu um feedback do jogo **Descoberta a Dois**, com os três sinais positivos e a sugestão técnica `teste`;
- a saúde do ambiente, a exportação protegida, a persistência, os dois jogos e os 95 estados da matriz móvel foram revalidados e aprovados depois da passagem;
- o registro técnico foi conferido e removido, deixando a base vazia para os participantes;
- a passagem no Safari foi adiada por decisão da Product Owner e não pode ser considerada aprovada ou coberta por esta evidência.

**Aceite:** aprovado com ressalva para um teste controlado orientado ao Chrome. Qualquer participação pelo Safari deve ser tratada como plataforma ainda não validada; antes de declarar compatibilidade com Safari, executar o roteiro físico correspondente e registrar aparelho, sistema e versão.

### Impacto da ampliação de 17/09/2026

O aceite físico acima permanece como evidência histórica da versão com dois jogos, mas não cobre o baralho visual nem a nova amostra. A versão ampliada está aprovada automaticamente, porém não deve herdar o aceite físico anterior. Repetir no Chrome pelo menos: entrada, escolha das três experiências, abertura de cartas, um fluxo completo de cada experiência, resultado da amostra, feedback e reinício. O Safari continua fora do escopo físico atual.

## Decisão

A estrutura responsiva, os três fluxos, o baralho visual e as regressões MOB-01, MOB-02 e MOB-03 estão aprovados na matriz emulada. A tarefa 132 preserva o aceite da versão anterior. A tarefa 142 permanece em andamento até repetir a passagem física da versão ampliada no Chrome. Safari continua explicitamente não validado e deve ser retomado antes de afirmar suporte a essa plataforma.

## Reproduzir

```powershell
npm.cmd run build
node scripts/validate-mobile-mpv.mjs
```
