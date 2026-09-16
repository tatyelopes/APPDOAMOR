# Lote de conteúdo do MPV

**Versão:** 1.0  
**Data:** 12/09/2026  
**Status:** selecionado para implementação

## Composição

O MPV usa doze cartas, seis para cada jogo. Cada sessão sorteia três cartas do jogo escolhido, sem repetição.

A fonte estruturada para implementação está em [`src/features/game/mpv-cards.json`](../src/features/game/mpv-cards.json).

## Critérios de seleção

- compreensão imediata, sem instrução complementar;
- tema leve e apropriado para diferentes fases do relacionamento;
- resposta sem certo ou errado;
- ausência de diagnóstico, aconselhamento ou avaliação do casal;
- ausência de sexo, religião, filhos, dinheiro, conflitos e planos de longo prazo;
- potencial de gerar conversa curta, humor ou descoberta;
- quatro alternativas distintas nas cartas de adivinhação;
- reaproveitamento do banco existente, com adaptação mínima de pessoa verbal quando necessária.

## Descoberta a Dois

| ID | Tema | Carta | Origem |
|---|---|---|---|
| DAD-001 | Humor | Qual seria o título de uma comédia sobre nós? | Descontraído, pergunta 1 |
| DAD-002 | Diversão | Que aventura divertida você gostaria de viver comigo? | Descontraído, pergunta 2 |
| DAD-003 | Memórias | Qual lembrança nossa sempre consegue fazer você sorrir? | Memórias, pergunta 1 |
| DAD-004 | Memórias | Que momento simples nosso você gostaria de reviver? | Memórias, pergunta 2 |
| DAD-005 | Imaginação | Se pudéssemos acordar amanhã em qualquer lugar, onde seria? | Curiosidades, pergunta 1 |
| DAD-006 | Curiosidade | O que você gostaria que eu descobrisse sobre você? | Curiosidades, pergunta 2 |

Orientação fixa da rodada: “Respondam em voz alta e conversem sem pressa”. Não apresentar campo de texto.

## Adivinhe de Mim

| ID | Tema | Pergunta | Alternativas |
|---|---|---|---|
| ADM-001 | Tempo livre | Se você ganhasse uma tarde livre agora, qual plano escolheria? | explorar; maratonar; comer fora; improvisar |
| ADM-002 | Humor | Em uma dupla de filme, qual papel mais combina com você? | planejar; fazer rir; resolver; levar lanches |
| ADM-003 | Brincadeira | Qual competição boba você teria mais chance de ganhar? | música; montar; lanche; pior piada |
| ADM-004 | Viagem | Qual viagem improvisada parece mais divertida para você? | praia; montanha; cidade histórica; sorte |
| ADM-005 | Talentos | Que talento inútil seria mais engraçado dominar? | vozes; dança; mágica; reconhecer músicas |
| ADM-006 | Preferências | Qual pequeno luxo melhora instantaneamente um dia comum para você? | dormir; comida favorita; banho demorado; cancelar planos |

As alternativas completas e a rastreabilidade até os IDs `DES-*` estão no JSON. A adaptação para segunda pessoa permite que uma pessoa escolha sobre si e a outra faça o palpite.

## Regras editoriais para o MPV

- manter exatamente seis cartas por jogo durante esta rodada de teste;
- não adicionar níveis, categorias selecionáveis ou texto livre;
- permitir pular qualquer carta sem justificativa;
- não pontuar acerto como conhecimento ou qualidade do relacionamento;
- na revelação, usar linguagem neutra: “Você escolheu” e “O palpite foi”;
- não armazenar escolhas, palpites ou conversas após sair ou reiniciar;
- qualquer troca de carta deve manter o mesmo nível de leveza e ser registrada neste documento e no JSON.

## Aceite do lote

- doze IDs únicos;
- seis cartas em cada jogo;
- quatro alternativas em cada carta de Adivinhe de Mim;
- nenhuma alternativa vazia ou repetida na mesma carta;
- todas as cartas possuem referência ao conteúdo de origem;
- conteúdo compatível com o fluxo definido em [`docs/FLUXO-MPV.md`](FLUXO-MPV.md).
