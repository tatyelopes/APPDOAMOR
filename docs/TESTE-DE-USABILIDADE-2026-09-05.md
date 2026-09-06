# Teste de usabilidade — rodada 0

**Produto:** Conectadois — App do Amor  
**Data:** 05/09/2026  
**Escopo:** implementação React/Node disponível no repositório  
**Resultado:** aprovado com ressalvas para avaliação interna; ainda não validado com participantes

## Objetivo e limite desta rodada

Esta rodada avaliou se as jornadas implementadas são compreensíveis e executáveis antes do recrutamento de casais. Foi feita uma inspeção especializada com percurso cognitivo e um percurso automatizado em navegador real. Não houve participantes externos; por isso, não foram calculados SUS, SEQ, tempo humano, taxa de abandono ou percepção de confiança.

A tarefa 30 do plano permanece **Em andamento**. A rodada moderada com integrantes do público-alvo continua necessária antes de considerar o fluxo validado.

## Ambiente e método

- Microsoft Edge em modo headless, com banco temporário isolado e API local;
- viewport mobile de 390 × 844 px e desktop de 1440 × 900 px;
- doze estados de interface inspecionados quanto a overflow horizontal, identificação dos controles e dimensão dos alvos de toque;
- percurso bilateral com duas contas independentes;
- compilação TypeScript/Vite e validadores existentes dos protótipos de revelação e resultados;
- inspeção heurística baseada em visibilidade do estado, correspondência com o mundo real, controle do usuário, prevenção e recuperação de erros, consistência e acessibilidade de interação.

O executor reproduzível está em `scripts/run-usability-browser.mjs` e usa apenas dados temporários, removidos ao final.

## Tarefas percorridas

| ID | Tarefa | Resultado técnico | Evidência principal |
|---|---|---|---|
| T1 | Entender a proposta e avançar pelo onboarding | Passou com ressalva | Três etapas avançam; link de conta existente leva primeiro ao cadastro |
| T2 | Criar a primeira conta | Passou | Cadastro integrado levou à escolha de pareamento |
| T3 | Criar espaço, obter convite e conectar a segunda conta | Passou com ressalva | Código funcionou e as contas foram pareadas; atualização e cópia têm recuperação fraca de erro |
| T4 | Responder em segredo e aguardar a outra pessoa | Passou com ressalva | Estado de espera é claro; falha de rede no salvamento não aparece na interface |
| T5 | Completar a resposta pela segunda conta e revelar | Passou | A API devolveu duas respostas apenas depois das duas participações |
| T6 | Concluir o teste de linguagens do amor | Passou com ressalva | Cinco escolhas levam ao resultado; sair perde o andamento sem confirmação |
| T7 | Concluir o teste de temperamentos | Passou com ressalva | Dez escolhas levam ao resultado; sair perde o andamento e o conteúdo ainda carece de validação especializada |

As sete jornadas chegaram ao estado esperado. Isso demonstra viabilidade funcional no roteiro controlado e não mede sucesso de pessoas usando o produto sem assistência.

## Resultados mensuráveis

- 7 de 7 jornadas técnicas concluídas;
- 12 de 12 estados sem overflow horizontal nos viewports avaliados;
- 0 botões sem texto ou `aria-label` entre os controles inspecionados;
- primeiro foco por teclado no onboarding: “Já tenho uma conta”;
- regra de revelação confirmada: duas respostas retornadas somente após as duas contas participarem;
- compilação aprovada;
- validadores dos protótipos de revelação e de testes/resultados aprovados;
- nenhuma conta ou resposta persistida fora do banco temporário da execução.

## Achados priorizados

| ID | Severidade | Jornada | Achado e impacto | Recomendação | Plano relacionado |
|---|---|---|---|---|---|
| UT-01 | Alta | Onboarding/login | “Já tenho uma conta” encerra o onboarding, mas abre a tela no modo de cadastro. A pessoa que retorna precisa descobrir um segundo link para chegar ao login. | Abrir o formulário diretamente em modo login e preservar o retorno ao onboarding. | 61 e 62 |
| UT-02 | Alta | Resposta privada/pareamento | O salvamento da resposta e algumas atualizações são disparados sem estado de envio e sem mensagem quando a rede ou a API falham. A pessoa pode acreditar que uma resposta íntima foi guardada quando não foi. | Exibir envio, sucesso e erro persistente; permitir nova tentativa sem perder o texto. | 63, 67 e 73 |
| UT-03 | Alta | Home/progresso | O contador começa em três dias e cresce por ações locais, inclusive visualização e conclusão individual. Ele pode comunicar um progresso do casal que o servidor não confirmou. | Derivar sequência e conquistas apenas de participações mútuas persistidas. | 55, 65 e 71 |
| UT-04 | Média | Testes | Sair de um teste em andamento não oferece pausa, confirmação nem retomada. O risco é maior no percurso de dez cenários. | Salvar cada resposta, oferecer “Continuar depois” e confirmar o descarte. | 26, 69, 70 e 73 |
| UT-05 | Média | Mobile/acessibilidade | Há alvos abaixo de 44 × 44 px: indicadores do onboarding com 8 px, avatar e gesto diário com 38 px e ações textuais com cerca de 20–36 px de altura. Isso aumenta erros de toque. | Ampliar a área clicável preservando a aparência e validar foco, contraste e leitor de tela. | 74 e 75 |
| UT-06 | Média | Convite | A interface pode mostrar “Código copiado” quando a API de clipboard não está disponível e não explica falhas de permissão. | Confirmar o resultado real, oferecer seleção manual e manter o código facilmente selecionável. | 63 e 73 |
| UT-07 | Média | Resultados | Cinco escolhas de linguagem e dez cenários de temperamento produzem textos afirmativos e recomendações ao parceiro. Sem validação especializada, pessoas podem interpretar o conteúdo como classificação confiável. | Reforçar caráter educativo e experimental; validar instrumento, textos e recomendações com especialista antes do piloto. | 26, 76 e 77 |
| UT-08 | Baixa | Espera de pareamento | “Já usaram o código” depende de a pessoa entender que o botão verifica a conexão; se a consulta falhar, a tela volta ao estado anterior sem orientação. | Usar “Verificar conexão”, mostrar a última verificação e explicar o que fazer se o convite não funcionar. | 63 e 73 |
| UT-09 | Baixa | Navegação | A aba “Nós” aparece ativa durante testes e resultados, mas ao ser acionada abre a resposta privada. A relação entre nome, estado ativo e destino é ambígua. | Definir o destino de “Nós” e marcar como ativa apenas a seção que representa o conteúdo atual. | 20, 28 e 60 |

Nenhum achado indica vazamento de respostas no percurso exercitado. UT-01, UT-02 e UT-03 devem ser corrigidos antes de convidar participantes externos, porque afetam entrada, confiança e significado do progresso.

## Pontos que funcionaram bem

- a proposta de conexão a dois aparece antes da criação de conta;
- a escolha entre criar espaço e usar convite corresponde ao modelo mental do casal;
- a espera explica os três passos do pareamento e mantém o código visível;
- a resposta privada informa que o conteúdo continua oculto até a segunda participação;
- a revelação apresenta as respostas lado a lado e oferece uma orientação de conversa;
- a interface permaneceu responsiva nas larguras verificadas;
- os testes mostram progresso e instruções antes das escolhas.

## Critério para a próxima rodada

Depois dos achados altos, conduzir uma rodada moderada com 5 a 6 casais, preferencialmente em seus próprios celulares. Cada pessoa deve passar individualmente por onboarding, cadastro, convite, resposta privada e um teste; o casal conclui junto a revelação. O moderador não deve explicar os rótulos dos botões durante a tarefa.

Registrar por tarefa:

- conclusão sem ajuda, com ajuda ou falha;
- tempo e pontos de hesitação;
- erros de toque, retornos e abandono;
- SEQ de 1 a 7 após cada tarefa;
- compreensão de quem vê cada resposta e quando;
- confiança no resultado dos testes;
- SUS ao fim e entrevista curta do casal.

Meta preliminar para avançar: pelo menos 80% das pessoas concluindo onboarding, pareamento e resposta privada sem ajuda; 100% compreendendo a regra de revelação; nenhum incidente de privacidade; SEQ mediano de pelo menos 5 nas jornadas críticas. Achados que bloqueiem entrada, pareamento ou compreensão da privacidade devem reabrir o fluxo antes de nova rodada.

## Comandos de verificação

```powershell
npm.cmd run build
node scripts/validate-revelation-prototype.mjs
node scripts/validate-tests-prototype.mjs
node scripts/run-usability-browser.mjs
```
