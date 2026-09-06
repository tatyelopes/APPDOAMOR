# Revisão geral do Conectadois e do acompanhamento

Data: 04/09/2026. Referência operacional: `Plano de trabalho/acompanhamento-app-do-amor.xlsx`. Registro da revisão: tarefa 120.

## Parecer

O projeto tem uma direção coerente: conexão entre duas pessoas por conversas, descobertas e pequenos desafios, com privacidade e uma rotina sem cobrança. Visão, jornada, arquitetura de informação, desenho da home e modelo de dados convergem nessa direção.

O estágio atual é de **descoberta e desenho avançados, com implementação parcial do núcleo**. Não é ainda um MVP validado ou pronto para um piloto externo. Há muito material produzido, mas documentação, código compilável, integração bilateral e validação com usuários são evidências diferentes.

Recomendo consolidar o ciclo escolher → participar individualmente → aguardar → revelar → registrar progresso antes de ampliar funcionalidades. Perguntas e desafios já dão variedade suficiente para testar a proposta. IA, compatibilidade, rankings, novas baterias de testes e cobrança real não são a próxima prioridade.

## Escopo desta revisão

Confrontei as 111 tarefas existentes com a planilha gerada, o inventário de documentos, o escopo do MVP, o cronograma, a matriz RACI, as definições de métricas, os módulos de frontend/backend e os dois geradores de planilhas. Li os fluxos centrais e compilei o projeto. Verifiquei comportamentos de analytics com dados fictícios em memória.

Não houve teste com casais, auditoria jurídica, teste de invasão, revisão visual em dispositivos reais ou migração de banco. Não revalidei as fontes externas, preços ou dados de mercado dos documentos de pesquisa; avaliei sua posição no planejamento e a distinção entre hipótese e evidência. A ausência de um artefato no repositório não prova que ele não exista fora dele.

## Fotografia anterior aos ajustes

| Indicador | Resultado |
| --- | --- |
| Tarefas | 111 |
| Concluídas | 22 |
| Em andamento | 26 |
| Não iniciadas | 63 |
| Horas estimadas | 1.492 |
| Tarefas com alguma data preenchida | 1, a tarefa de cronograma |
| Compilação TypeScript/Vite | Aprovada |
| Suíte de testes do projeto | Não encontrei arquivos de testes nem comando de teste no package.json |
| Banco editorial | 119 atividades candidatas: 75 de múltipla escolha, 22 discursivas e 22 desafios |

O Excel correspondia ao gerador em tarefas e status. Isso não significava que todos os status refletiam o aceite real. Sua fórmula de progresso atribui 100% a concluído, 50% a em andamento e 0% aos demais, com o mesmo peso por tarefa. Antes da revisão, isso equivalia a aproximadamente 31,5% por status; não a 31,5% de um produto pronto.

## Coerência por frente

| Frente | O que existe | O que ainda falta | Parecer |
| --- | --- | --- | --- |
| Produto | Visão, personas provisórias, PRD, MoSCoW e escopo de piloto | Entrevistas executadas, síntese própria e aceite da baseline | Boa base, hipóteses ainda abertas |
| Marca | Identidade e tom definidos | Naming, disponibilidade e ativos registrados | Direção visual utilizável como nome de trabalho |
| UX | Jornada, arquitetura, onboarding, autenticação, home e protótipo local | Fluxo completo validado e testes com casais | Desenho adiantado, validação pendente |
| Dados | Modelo lógico com 10 entidades e 12 relacionamentos | Migrações, constraints executáveis e integração à API | Tarefa de modelagem concluída, persistência futura |
| Conta e casal | Cadastro, login, convite e espera | Recuperação, verificação, revogação, saída do vínculo e estados de erro | Implementação parcial |
| Jogo | 11 temas, discursivas, desafios e modo misto no mesmo dispositivo | Catálogo remoto, níveis, partidas persistidas e retomada em duas contas | Protótipo local funcional |
| Resposta privada | Uma pergunta compartilhada com bloqueio antes das duas respostas | Generalização por partida/rodada, erros, concorrência e imutabilidade após revelação | Núcleo inicial, não jornada completa |
| Conteúdo | Planilha por tema e aba Desafios | IDs estáveis, metadados completos, revisão, seleção dos 60 itens e publicação controlada | Quantidade candidata suficiente para selecionar, aprovação não demonstrada |
| Progresso | Contador no navegador e desenho de eventos no modelo | Contagem confiável, histórico e projeção de progresso | Não deve ser tratado como dado real |
| Analytics | Endpoint protegido por lista de e-mails e painel com agregados | Contratos, origem confiável, definições de coorte, estados indisponíveis e testes | Painel implementado, confiabilidade incompleta |
| Operação | Plano de lançamento e riscos | Ambientes, CI, PostgreSQL, restauração, QA, privacidade e suporte funcionando | Piloto externo ainda depende dessas entregas |

## Achados que mudam prioridades

### 1. Formato de resposta não é mecânica de jogo

O escopo do piloto define três mecânicas: resposta guardada, adivinhar a resposta da outra pessoa e revelar coincidências de escolhas. A atualização recente implementou três formatos de sessão local: perguntas, desafios e misto. São dimensões diferentes.

Adivinhação e escolhas coincidentes não tinham tarefas explícitas no plano mestre. O modelo de dados também precisa ser estendido se essas mecânicas forem mantidas: uma tentativa sobre o parceiro não pode ser confundida com uma resposta sobre si; a regra de revelar somente coincidências é diferente de revelar todas as respostas.

**Ação:** tarefa 112 para reconciliar as decisões e a taxonomia. Tarefas 113 e 114 rastreiam o que já estava escrito no MVP, com execução condicionada a essa decisão. Não alterei unilateralmente as três mecânicas prometidas nem removi os desafios solicitados.

**Recomendação de produto:** testar primeiro o ciclo de perguntas e desafios em duas contas. Decidir com evidência se adivinhação e coincidências entram no primeiro piloto ou no seguinte. Registrar a decisão no PRD, escopo, MoSCoW, modelo e cronograma.

### 2. O app ainda tem experiências desconectadas

`GamePage.tsx` usa estado em memória para os dois nomes no mesmo dispositivo. `src/App.tsx` usa `/answers/question-3` para uma pergunta privada fixa. O modelo e o protótipo de home preveem partidas remotas que ainda não existem.

Os textos atuais deixam claro o jogo local, o que é positivo. Mas respostas locais não comprovam a autoria da segunda conta. O item 109 continua concluído **somente no escopo local descrito**, não como comprovação de multiplayer remoto.

**Ação:** tarefa 111 mantém a persistência backend; nova 116 cobre integração frontend, retomada, pulo, erros e revelação em duas contas. Dependências de respostas, progresso e home foram conectadas a esse trabalho.

### 3. O catálogo tem volume, mas não tem ainda um processo único de publicação

Há perguntas antigas em `App.tsx`, atividades locais em JSON, múltipla escolha dentro de um script e cópias de demonstração no HTML da home. O JSON não possui IDs editoriais estáveis por atividade; os IDs adicionados à planilha dependem de tema, tipo e posição. Reordenar itens pode mudar a referência. As 44 atividades recentes têm intensidade “Variada” na planilha e o jogo não oferece os três níveis previstos no escopo.

A aba “Todas” consolida os itens; abas temáticas e Desafios são visões, não novos conteúdos a somar. O lote é candidato e não há evidência de 60 itens aprovados. Incluir o tema Apimentado a pedido da fundadora não equivale a autorizar publicação irrestrita no piloto: o escopo atual reserva conteúdo íntimo ao teste moderado específico.

**Ação:** tarefa 115 para fonte editorial única, IDs estáveis, nível, duração, contexto, revisão e validação de importação. Itens 52, 59 e 77 precisam atender publicação/retirada e revisão antes de exposição externa. Começar a revisão antes de terminar o frontend evita descobrir inadequações tarde demais.

### 4. Progresso e métricas ainda podem induzir a leitura errada

O streak inicia em 3 quando não existe valor local e pode aumentar ao concluir testes, clicar no gesto e reler uma revelação. Isso diverge do desenho de rotina e do modelo de progresso. O encerramento de uma sessão local é emitido mesmo quando as atividades foram puladas; esse evento integra a lista de ações consideradas significativas para engajamento, embora não conte na North Star de experiência mútua.

Em `analytics.js`, assinatura iniciada → cancelada → iniciada permanece com zero casais pagantes, porque a agregação considera conjuntos históricos em vez do estado mais recente. Eventos financeiros estão na lista aceita do cliente. O backend descarta `mode`, enviado pelo jogo; não recomendo liberar `theme` indiscriminadamente por poder conter informação sensível. Incidentes de privacidade são um zero fixo sem fonte operacional.

Retenção hoje é retorno em qualquer momento depois de D7/D30/D90, a partir da criação do casal. Uma atividade em D33 pode contar em D7. Isso precisa ser identificado como retenção acumulada após marco, ou ter janela e origem de coorte redefinidas; o rótulo D7 sozinho é ambíguo. Não é evidência de retorno exatamente no sétimo dia.

**Ação:** reabertos 106 e 107; 55 passa a depender da partida e das participações confirmadas. O painel deve usar “não instrumentado” onde não há fonte confiável, e dados financeiros futuros devem vir de fonte autorizada. Nenhuma métrica financeira precisa ser implementada para o piloto gratuito.

### 5. Alguns itens de interface estavam concluídos sem atender ao fluxo documentado

“Já tenho uma conta” no onboarding chama o mesmo callback de conclusão e abre a autenticação que inicia em cadastro. O fluxo documentado prevê entrada em login. A página de espera usa atualização manual sem mensagem de erro e pode mostrar código copiado mesmo quando a API de clipboard não existe.

**Ação:** reabertos 61 e 63, com observações concretas. A biblioteca de tokens já existe, então 28 passa de não iniciado para em andamento. Não marquei nenhuma dessas correções como implementada durante esta auditoria.

### 6. A persistência JSON é um limite real, não só uma preferência arquitetural

`loadDatabase()` captura qualquer falha de leitura/parsing e devolve um banco vazio. Uma gravação seguinte pode substituir um arquivo com problema. O servidor carrega o JSON antes de aguardar o corpo da requisição e depois grava o objeto inteiro; requisições sobrepostas podem partir do mesmo estado e sobrescrever alterações.

Não provoquei essas falhas no arquivo real. São riscos identificados pela leitura do código e devem entrar nos critérios de testes e migração. O desenho PostgreSQL ainda não foi executado nem validado pelo banco.

**Ação:** reforçados 41, 79, 81 e 93. Nova tarefa 118 exige ensaio de restauração em ambiente separado, com evidência. Backup criado sem restauração testada não basta para declarar recuperação pronta.

### 7. O cronograma parece mais preciso do que a alocação disponível permite

Somente a tarefa 11 tem datas no plano mestre. O documento de cronograma assume vários papéis, incluindo duas pessoas de engenharia, e a RACI tem funções técnicas ainda a nomear. As datas dos marcos são uma baseline, não uma previsão recalculada por capacidade real.

Nove tarefas concluídas tinham dependências ainda abertas. Isso nem sempre invalida a entrega: uma identidade provisória pode existir antes do naming, e um modelo pode ser concluído antes da API. Mas aprovação final e implementação não podem ser inferidas desse estado.

**Ação:** mantidas entregas documentais comprovadas com ressalvas. Atualizado o item 11 para registrar replanejamento pendente e o 12 para explicitar papéis versus nomes efetivamente alocados. Não inventei datas ou ocupantes. Os critérios dos marcos passam a citar tarefas novas pertinentes, sem aumentar simplesmente “tarefas até” para o maior ID.

### 8. Há uma perda silenciosa de observações no gerador

Seis linhas — 17, 18, 19, 21, 22 e 108 — usavam ponto e vírgula no texto sem aspas CSV. `ConvertFrom-Csv` descartava o trecho excedente, incluindo ressalvas de revisão. Corrigi a serialização dessas notas e acrescentei validação reproduzível para estrutura, IDs, dependências, ciclos, cabeçalhos e fórmulas da planilha.

O indicador passa a se chamar “Progresso por status” e explicita que não mede prontidão do produto. As fórmulas são gravadas com recálculo ao abrir; seus valores em cache não são uma avaliação calculada durante esta revisão.

## O que acrescentar ao plano

Estas são lacunas de rastreabilidade do escopo existente, não uma proposta de dez novas funcionalidades.

| ID | Trabalho registrado | Por quê |
| --- | --- | --- |
| 112 | Reconciliar baseline de temas, formatos, mecânicas e piloto | Evitar desenvolver documentos incompatíveis |
| 113 | Adivinhação bilateral, condicionada à baseline | Mecânica já descrita no MVP, sem item próprio |
| 114 | Escolhas coincidentes, condicionada à baseline | Mecânica já descrita no MVP, sem item próprio |
| 115 | Unificar conteúdo e validar importação/publicação | Evitar IDs instáveis e conteúdo sem aprovação |
| 116 | Integrar partidas remotas no frontend | Backend de partidas sozinho não conclui a jornada |
| 117 | Feedback opcional por atividade | Medir relevância e permitir sinalizar desconforto sem expor respostas |
| 118 | Testar restauração de backup | Evidência de recuperação antes do piloto |
| 119 | Entregar instalação PWA e política de cache | PWA é o formato escolhido, mas faltam manifest e estratégia explícita |
| 120 | Esta revisão geral | Registrar evidências e ajustes no acompanhamento |

O feedback deve ser curto e opcional: útil/não combinou, pular e sinalizar conteúdo. Relatórios agregados, sem copiar respostas íntimas. A retirada do catálogo pode usar operação mínima segura prevista em 52/59; não exige um CMS completo antes de testar a proposta.

PWA não significa cachear respostas privadas: a tarefa 119 deve definir instalação e shell público, evitando persistência offline de conteúdo íntimo e limpando caches pertinentes na saída. O contrato offline precisa ser consistente com a home desenhada.

Estimativas adicionadas são preliminares e precisam ser refinadas com responsáveis e aceite. Aumento de tarefas não representa aumento automático de prazo nem compromisso de executar mecânicas sem decidir a baseline.

## Ordem recomendada

1. **Fechar a decisão de produto:** tarefa 112 com Tatyele; concluir entrevistas e atualizar PRD. Definir o que entra no primeiro piloto e como local/remoto convivem.
2. **Preparar um lote pequeno rastreável:** 115, 108, 110, 76 e 77; selecionar atividades leves e revisar antes de integrar todo o catálogo. A meta de 60 aprovadas continua no plano para o piloto completo.
3. **Fechar a fundação do ciclo bilateral:** 35, 38, 41, 111, 53 e 54, com estratégia de testes 78 desde o início. Identidade, autoria e isolamento são a base.
4. **Integrar e validar uma jornada inteira:** 116, 55 e 65; responder em duas contas, retomar, revelar uma vez, registrar progresso e testar estados de falha. Corrigir 61/63 no mesmo ciclo.
5. **Testar valor e operação:** 30, 117, 106/107, 84, 118 e os critérios do piloto. Refinar cronograma com disponibilidade real antes de manter compromisso com marcos.

Não deixaria entrevista e teste de usabilidade para depois de todo o desenvolvimento. Também não trataria diagnóstico, compatibilidade ou cobrança como condição para provar o valor de perguntas e desafios.

## Entrega e limites

Foram atualizados o gerador, a planilha operacional, as observações/dependências de tarefas existentes, os critérios relevantes dos marcos e o README desatualizado. Nenhuma correção de produto ou alteração de banco foi executada por esta revisão. Os achados permanecem explícitos no backlog.

Compilação aprovada; exemplos de analytics reproduzidos em memória; Excel confrontado com a fonte; contagens editoriais e status de revisão conferidos; cabeçalhos, tarefas, dependências e fórmulas validados após regeneração. Revisões humanas e de uso real permanecem pendentes.
