# Escopo do MPV de validação de formato — Conectadois

**Versão:** 1.1
**Data:** 16/09/2026
**Status:** escopo congelado

## Relação com o plano completo

Este MPV é uma trilha adicional e temporária para testar o formato com casais. Ele não apaga, substitui ou suspende o plano completo do aplicativo documentado em [ESCOPO-MVP.md](ESCOPO-MVP.md) e acompanhado na planilha operacional.

Ao final do teste, os aprendizados serão registrados como insumo. Qualquer mudança no plano completo dependerá de uma revisão posterior e explícita.

## Objetivo

Validar, com o menor investimento possível, se um casal entende, conclui e deseja repetir jogos curtos de conexão no mesmo celular.

Este MPV não tenta validar cadastro, pareamento remoto, retenção de longo prazo, monetização ou a plataforma completa. A pesquisa não é pré-requisito desta trilha: o protótipo será colocado diretamente em uso e a decisão sobre o formato será tomada pelos sinais coletados no próprio fluxo.

## Hipótese

Casais conseguem jogar sem mediação, percebem descoberta ou conexão e demonstram intenção de jogar novamente.

## Recorte do produto

- aplicação web mobile-first acessada por link;
- uso presencial em um único celular no modelo passa-e-joga;
- entrada direta, sem conta e sem onboarding longo;
- experiência neutra, sem exibir o nome do aplicativo em título, cabeçalho, metadados ou rodapé;
- dois jogos com três rodadas por sessão;
- seis cartas leves por jogo, doze no total;
- opção de pular uma carta;
- fechamento curto com três sinais e sugestão aberta opcional;
- nenhum nome, contato, resposta de rodada ou escolha íntima armazenado; os sinais e a sugestão opcional são centralizados para análise do teste.

## Jogos

### 1. Descoberta a Dois

O app mostra uma pergunta leve. Cada pessoa responde em voz alta, o casal conversa e toca em avançar. A sessão termina após três cartas.

O formato valida se perguntas guiadas geram conversa e descoberta com fricção mínima.

### 2. Adivinhe de Mim

Uma pessoa escolhe em segredo uma opção sobre si, passa o aparelho e a outra tenta adivinhar. O app revela a escolha, convida a uma conversa curta e alterna os papéis.

O formato valida se a dinâmica de palpite e revelação torna a experiência mais divertida e repetível.

## Sinais coletados

Ao fim da sessão, coletar somente:

1. jogo concluído ou abandonado;
2. “Foi fácil entender como jogar?”;
3. “Vocês descobriram algo ou se sentiram mais conectados?”;
4. “Jogariam novamente?”.
5. sugestão opcional de melhoria, limitada a 500 caracteres e acompanhada de orientação para não incluir nomes, contatos ou detalhes da conversa.

Não coletar o conteúdo das respostas do casal. A sugestão aberta deve tratar somente da experiência do teste. Não realizar entrevistas nem incluir uma fase de pesquisa neste ciclo.

## Critérios de decisão

Validar com cinco casais, sem mediação durante a sessão.

Continuar para uma próxima iteração se:

- pelo menos quatro dos cinco casais concluírem sem ajuda;
- pelo menos três relatarem descoberta ou conexão;
- pelo menos três disserem que jogariam novamente;
- não houver desconforto crítico relacionado ao conteúdo ou à dinâmica.

Se os critérios não forem atingidos, ajustar somente regras, instruções ou conteúdo e repetir uma vez. Se ainda assim falhar, encerrar ou reformular o formato antes de retomar o produto completo.

## Fora do escopo deste teste

- pesquisa exploratória, entrevistas, personas e análise de mercado;
- cadastro, login, perfil, convite e pareamento entre contas;
- backend, banco de dados, sincronização e respostas remotas;
- painel administrativo, analytics de terceiros e notificações;
- níveis, progressão, streak, conquistas e histórico;
- testes de linguagens do amor, temperamentos ou compatibilidade;
- assinatura, pagamento, landing page e lançamento público;
- PWA instalável, modo offline completo e lojas de aplicativos;
- catálogo amplo, CMS e produção de dezenas de atividades;
- conteúdo íntimo, diagnóstico ou recomendação de relacionamento.

Esses itens continuam pertencendo ao plano completo quando já previstos nele; apenas não consomem capacidade da trilha de teste do MPV.

## Definition of Done

O MPV está pronto para decisão quando:

- os dois jogos funcionarem de ponta a ponta em celular;
- cada jogo tiver seis cartas leves e três rodadas por sessão;
- pular, reiniciar e trocar de jogo funcionarem;
- o feedback de três sinais e a sugestão opcional estiverem disponíveis;
- o fluxo crítico passar por QA mobile e acessibilidade básica;
- cinco casais tiverem concluído ou abandonado uma sessão;
- os resultados estiverem comparados aos critérios acima;
- a decisão de continuar, ajustar ou encerrar estiver registrada.

## Regra de proteção do escopo

Nenhuma funcionalidade entra na trilha do MPV antes da decisão sobre o formato. Qualquer inclusão nesse teste exige remover outro item de esforço equivalente e demonstrar que ela é indispensável para a validação. Essa regra não cancela nem altera o backlog do aplicativo completo.
