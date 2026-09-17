param([string]$OutputPath = (Join-Path $PSScriptRoot '..\Plano de trabalho\acompanhamento-app-do-amor.xlsx'))

$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.IO.Compression
$utf8 = [System.Text.UTF8Encoding]::new($false)
# Plano completo do aplicativo, preservado como linha de base operacional.
$appPlanTasksCsv = @'
ID;Fase;Área;Tarefa;Entregável;Prioridade;Dependência;Responsável;Status;Estimativa (h);Início planejado;Fim planejado;Observações
1;Descoberta;Produto;Definir visão e proposta de valor;Documento de visão;Crítica;;;Concluído;4;;;Visão revisada com foco em conexão descoberta intimidade diversão e fortalecimento do relacionamento em docs/VISAO-E-PROPOSTA-DE-VALOR.md
2;Descoberta;Produto;Definir público-alvo e personas;Personas validadas;Alta;1;;Em andamento;8;;;Público e personas provisórias definidos em docs/PUBLICO-ALVO-E-PERSONAS.md, validação depende das entrevistas da tarefa 3
3;Descoberta;Pesquisa;Entrevistar casais do público-alvo;Relatório de entrevistas;Alta;2;;Em andamento;20;;;Protocolo e ficha disponíveis em Markdown e Word na pasta docs — formulário nomeado como Jogo para Casais — Pesquisa de Experiência, texto introdutório informal e imagem de fundo sem marca disponíveis — pendentes montagem final do Forms, recrutamento, campo e síntese
4;Descoberta;Pesquisa;Mapear dores necessidades e hábitos;Mapa de oportunidades;Alta;3;;Em andamento;8;;;Pesquisa secundária consolidada em docs/PESQUISA-CASAIS-BRASILEIROS.md - síntese das entrevistas e validação das oportunidades dependem da tarefa 3
5;Descoberta;Mercado;Analisar concorrentes diretos e indiretos;Análise competitiva;Média;1;;Concluído;8;;;Mapeamento consolidado em docs/ANALISE-CONCORRENTES.md com benchmark incluindo Lovify posicionamento e oportunidades
6;Descoberta;Negócio;Definir modelo de negócio e monetização;Modelo de receita;Alta;4,5;;Concluído;8;;;Freemium B2C e assinatura por casal definidos em docs/MODELO-DE-NEGOCIO-E-MONETIZACAO.md com preços unit economics e experimentos
7;Descoberta;Produto;Definir métricas de sucesso e North Star;Árvore de métricas;Alta;1;;Concluído;5;;;North Star árvore de métricas metas e governança documentadas em docs/METRICAS-DE-SUCESSO.md
8;Planejamento;Produto;Consolidar PRD do produto;PRD aprovado;Crítica;2,4,6,7;;Em andamento;16;;;PRD v0.9 consolidado em Markdown e Word, pendente validação das personas priorização final e aprovação
9;Planejamento;Produto;Priorizar funcionalidades pelo método MoSCoW;Escopo priorizado;Crítica;8;;Concluído;6;;;Priorização da Release 1.0 consolidada em docs/PRIORIZACAO-MOSCOW.md e Word com Must Should Could Won't critérios e cortes
10;Planejamento;Produto;Definir escopo do MVP;Backlog do MVP;Crítica;9;;Concluído;6;;;MVP piloto PWA de 6 semanas com 40 a 60 casais, três mecânicas e backlog de 38 itens consolidado em docs/ESCOPO-MVP.md e Word
11;Planejamento;Gestão;Definir cronograma marcos e cadência;Roadmap de execução;Alta;10;;Concluído;6;07/09/2026;05/03/2027;Linha de base em docs/CRONOGRAMA-MARCOS-E-CADENCIA.md e Word - revisão identificou datas por tarefa e capacidade nominal pendentes de replanejamento com a baseline 112 - datas dos marcos permanecem premissas
12;Planejamento;Gestão;Definir responsáveis e matriz RACI;Matriz RACI;Média;11;Product Owner — Tatyele Lopes;Concluído;4;;;Estrutura de papéis e RACI documentadas - papéis padrão aplicados às tarefas atuais pelo gerador - nomes técnicos e capacidade ainda a confirmar - documento e Word têm recorte histórico das 107 tarefas iniciais
13;Planejamento;Gestão;Configurar gestão de backlog e cerimônias;Quadro operacional;Alta;11,12;Product Owner — Tatyele Lopes;Concluído;4;;;Kanban com ciclos quinzenais fluxo WIP DoR DoD RICE cerimônias e métricas configurados em docs/GESTAO-DE-BACKLOG-E-CERIMONIAS.md e na aba Governança Backlog
14;Marca;Branding;Validar nome Conectadois e alternativas;Decisão de naming;Alta;1;;Não iniciado;8;;;
15;Marca;Jurídico;Pesquisar disponibilidade no INPI;Parecer preliminar;Alta;14;;Não iniciado;4;;;
16;Marca;Branding;Registrar domínio e perfis sociais;Ativos digitais reservados;Alta;14;;Não iniciado;3;;;
17;Marca;Branding;Definir posicionamento tom de voz e slogan;Guia verbal;Média;14;Product Designer;Concluído;8;;;Posicionamento plataforma de mensagens tom de voz vocabulário aplicações e sistema de slogans consolidados em docs/POSICIONAMENTO-TOM-DE-VOZ-E-SLOGAN.md e Word —  validar com casais e revisar se o naming mudar
18;Marca;Design;Consolidar logotipo paleta e tipografia;Identidade visual;Alta;14,17;Product Designer;Concluído;16;;;Identidade revisada conforme decisão da fundadora: símbolo 3D original da pasta Identidade visual restaurado no app e wordmark conectadois com dois em dourado —  guia Word e preview horizontal atualizados
19;UX/UI;Pesquisa;Mapear jornada completa do casal;Mapa de jornada e fluxograma visual;Alta;8;Pesquisa e Conteúdo;Concluído;12;;;Jornada bilateral em 15 etapas consolidada em docs/JORNADA-COMPLETA-DO-CASAL.md e Word —  fluxograma detalhado em docs/FLUXOGRAMA-JORNADA-COMPLETA-DO-CASAL.md e imagem vetorial pronta para compartilhamento em docs/FLUXOGRAMA-JORNADA-COMPLETA-DO-CASAL.svg —  inclui decisões recuperações regras transversais e marcos mensuráveis —  hipóteses pendentes de validação nas entrevistas
20;UX/UI;Arquitetura;Criar arquitetura de informação;Mapa de navegação;Alta;19;Product Designer;Concluído;12;;;Arquitetura mobile-first documentada em docs/ARQUITETURA-DE-INFORMACAO.md com mapa geral quatro áreas principais inventário de 29 telas objetos de informação regras de acesso rotas conceituais estados escopo por versão critérios de aceite e plano de validação
21;UX/UI;UX;Desenhar fluxo de onboarding;Fluxo validado;Crítica;20;Product Designer;Em andamento;6;;;Fluxo funcional completo documentado em docs/FLUXO-DE-ONBOARDING.md e diagrama compartilhável em docs/FLUXO-DE-ONBOARDING.svg —  cobre descoberta direta convite recebido consentimento exceções acessibilidade analytics e critérios de aceite —  pendentes protótipo navegável e validação com usuários nas tarefas 29 e 30
22;UX/UI;UX;Desenhar cadastro login e recuperação;Fluxo validado;Crítica;20;Product Designer;Em andamento;8;;;Fluxo funcional documentado em docs/FLUXO-DE-CADASTRO-LOGIN-E-RECUPERACAO.md e diagrama em docs/FLUXO-DE-CADASTRO-LOGIN-E-RECUPERACAO.svg —  cobre conta individual contexto de convite validações verificação de e-mail recuperação de senha sessões segurança acessibilidade analytics e lacunas da implementação —  pendentes protótipo e validação nas tarefas 29 e 30
23;UX/UI;UX;Desenhar pareamento e convite do casal;Fluxo validado;Crítica;20;;Em andamento;8;;;
24;UX/UI;UX;Desenhar home e rotina diária;Fluxo validado;Alta;20;Product Designer;Em andamento;8;;;Desenho em docs/HOME-E-ROTINA-DIARIA.md e protótipo navegável em docs/prototipo-home-rotina.html - 13 estados da home e rotina com perguntas desafios e modo misto - pendentes revisão visual e validação com casais na tarefa 30
25;UX/UI;UX;Desenhar perguntas e revelação mútua;Fluxo validado;Alta;20;Product Designer;Em andamento;10;;;Desenho em docs/PERGUNTAS-E-REVELACAO-MUTUA.md e protótipo docs/prototipo-perguntas-revelacao.html - discursiva múltipla escolha desafios espera correção pulo retomada e revelação bilateral - verificação de estados automatizada - validação visual e com casais pendentes na tarefa 30
26;UX/UI;UX;Desenhar testes e resultados;Fluxo validado;Alta;20;Product Designer;Em andamento;10;;;Desenho em docs/TESTES-E-RESULTADOS.md e protótipo docs/prototipo-testes-resultados.html - formas de afeto e temperamentos experimentais com pausa revisão resultado parcial empate compartilhamento opcional e revogação - verificação de estados em scripts/validate-tests-prototype.mjs - revisão visual editorial especializada e validação com casais pendentes
27;UX/UI;Design;Criar wireframes mobile-first;Wireframes completos;Alta;21-26;Product Designer;Em andamento;20;;;Home rotina diária perguntas com revelação e testes com resultados desenhados em protótipos HTML responsivos na pasta docs - demais telas e validação visual completa pendentes
28;UX/UI;Design;Criar design system e tokens;Biblioteca visual;Alta;18,27;;Em andamento;20;;;Tokens em src/assets/brand/brand-tokens.css e guia docs/IDENTIDADE-VISUAL.md existentes - biblioteca de componentes estados acessibilidade e validação visual pendentes
29;UX/UI;Design;Produzir protótipo de alta fidelidade;Protótipo navegável;Alta;27,28;Product Designer;Em andamento;30;;;Protótipos locais da home perguntas e revelação mútua e testes com resultados em docs - inclui perspectivas simuladas rede pausa revisão e compartilhamento opcional de resumo - integração das demais jornadas revisão visual e testes com casais pendentes
30;UX/UI;Pesquisa;Executar teste de usabilidade;Relatório de usabilidade;Alta;29;;Em andamento;16;;;Rodada 0 especializada executada em 05/09/2026 com sete jornadas bilaterais e doze estados responsivos - relatório em docs/TESTE-DE-USABILIDADE-2026-09-05.md - nove achados registrados - validação moderada com casais e métricas humanas ainda pendentes
31;UX/UI;Design;Aplicar melhorias do teste;Protótipo aprovado;Alta;30;;Não iniciado;12;;;Correções dos achados UT-01 a UT-09 da rodada 0 pendentes - priorizar entrada em login feedback de falhas integridade do progresso retomada dos testes e alvos de toque antes da rodada com participantes
32;Arquitetura;Engenharia;Definir arquitetura frontend e backend;Documento de arquitetura;Crítica;10;;Concluído;8;;;
33;Arquitetura;Engenharia;Definir padrão de pastas e dependências;Convenções documentadas;Alta;32;;Concluído;5;;;
34;Arquitetura;Dados;Modelar usuários casais sessões respostas e progresso;Modelo de dados;Crítica;32;;Concluído;12;;;Modelo lógico em docs/MODELO-DE-DADOS.md e docs/modelo-de-dados.dbml com 10 entidades e 12 relacionamentos - autenticação partidas respostas desafios e progresso - regras de integridade privacidade e migração documentadas
35;Arquitetura;API;Definir contrato e versionamento da API;Especificação OpenAPI;Alta;34,112;;Em andamento;12;;;Contrato-base v1 em docs/openapi-v1.json com 21 caminhos 24 operações política de versões erros idempotência concorrência privacidade e migração documentados em docs/CONTRATO-E-VERSIONAMENTO-DA-API.md - validador em scripts/validate-openapi.mjs - estabilização 1.0 depende da decisão 112 threat model 36 LGPD 37 implementação e testes de conformidade
36;Arquitetura;Segurança;Realizar modelagem de ameaças;Threat model;Crítica;34,35;;Concluído;12;;;Baseline STRIDE e OWASP em docs/MODELAGEM-DE-AMEACAS.md com diagrama ativos fronteiras 23 ameaças 30 controles 21 testes gates de piloto e riscos residuais - 13 ameaças críticas 9 altas e 1 média - estado atual não apto para piloto externo - revalidar após tarefas 112-114 PostgreSQL provedores e antes da release candidate
37;Arquitetura;Privacidade;Mapear dados pessoais e base legal LGPD;Inventário de dados;Crítica;34;Privacidade/Jurídico;Concluído;12;05/09/2026;05/09/2026;Inventário v1 em docs/INVENTARIO-DE-DADOS-E-BASES-LEGAIS-LGPD.md - 17 grupos e 20 operações com finalidade necessidade bases dos artigos 7 e 11 acesso compartilhamento retenção direitos incidentes e gates - enquadramento sujeito a aprovação jurídica
38;Infraestrutura;DevOps;Definir ambientes local homologação produção;Estratégia de ambientes;Alta;32;DevOps/Plataforma;Concluído;6;;;Estratégia em docs/AMBIENTES.md com matriz local staging production isolamento configuração atual e futura promoção recuperação e gates - modelo .env.local.example e regras Git - definição concluída em 08/09/2026 sem provisionamento ou deploy remoto
39;Infraestrutura;DevOps;Configurar lint formatação e hooks;Qualidade automatizada;Alta;33;DevOps/Plataforma;Concluído;6;08/09/2026;08/09/2026;ESLint flat configurado para JavaScript TypeScript e React, Prettier e EditorConfig aplicados, hook pre-commit com Husky e lint-staged ativo e comandos de qualidade documentados no README
40;Infraestrutura;DevOps;Configurar pipeline de CI;Pipeline funcional;Alta;39;DevOps/Plataforma;Em andamento;10;17/09/2026;;Workflow GitHub Actions criado em .github/workflows/ci.yml com Ubuntu 24.04 Node 24.20.0 cache npm instalação por lockfile permissões somente leitura concorrência timeout e gates de lint formato build OpenAPI ameaças LGPD feedback produção matriz móvel e planilha — documentação em docs/INTEGRACAO-CONTINUA.md — aguarda primeira execução remota aprovada
41;Infraestrutura;DevOps;Provisionar banco PostgreSQL;Banco por ambiente;Crítica;34,38;Engenharia Backend;Em andamento;10;;;Adaptador DATABASE_URL e schema idempotente implementados para o feedback do MPV em 16/09/2026 com PostgreSQL gratuito temporário no Render - ainda provisionar local staging e production definitivos com identidades distintas migrações integridade concorrência e migração dos demais dados
42;Infraestrutura;DevOps;Configurar gestão segura de segredos;Cofre de segredos;Crítica;38;;Não iniciado;6;;;Cofre identidades e chaves exclusivos por ambiente conforme docs/AMBIENTES.md - injeção em runtime privilégio mínimo inventário rotação e auditoria - modelos e gitignore não substituem esses controles
43;Infraestrutura;Observabilidade;Configurar logs métricas e alertas;Observabilidade básica;Alta;38;DevOps/Plataforma;Em andamento;12;;;Sonda mínima GET /api/health implementada sem dados privados em 16/09/2026 - ainda separar logs métricas e alertas por ambiente e versão implementar prontidão do armazenamento e testar alertas de indisponibilidade erros banco backup e capacidade sem conteúdo íntimo ou segredos
44;Backend;Autenticação;Implementar cadastro de usuário;Endpoint testado;Crítica;34,35;;Em andamento;12;;;
45;Backend;Autenticação;Implementar login logout e sessões;Endpoints testados;Crítica;44;;Em andamento;12;;;
46;Backend;Autenticação;Implementar recuperação e troca de senha;Fluxo seguro;Alta;45;;Não iniciado;12;;;
47;Backend;Autenticação;Implementar verificação de e-mail;Fluxo de confirmação;Alta;44;;Não iniciado;10;;;
48;Backend;Casal;Implementar criação de casal e código;Endpoint testado;Crítica;44;;Em andamento;10;;;
49;Backend;Casal;Implementar entrada e validação de convite;Endpoint testado;Crítica;48;;Em andamento;10;;;
50;Backend;Casal;Implementar desfazer vínculo com segurança;Endpoint auditável;Alta;49;;Não iniciado;10;;;
51;Backend;Perfil;Implementar perfil e preferências;Endpoints testados;Média;44;;Não iniciado;10;;;
52;Backend;Conteúdo;Modelar e servir perguntas e categorias;API de conteúdo;Alta;35,41,115;;Não iniciado;12;;;Catálogo versionado deve servir apenas conteúdo aprovado e publicado com tema nível duração e formato - permitir retirada sem nova versão do app - integrar fonte editorial 115
53;Backend;Respostas;Implementar respostas privadas;API testada;Crítica;49,52,111;;Em andamento;16;;;Endpoint da pergunta fixa existe - generalizar para partida rodada e autoria por conta com idempotência e correção apenas antes da revelação
54;Backend;Respostas;Garantir revelação somente após ambos responderem;Regra testada;Crítica;53;;Em andamento;12;;;
55;Backend;Progresso;Implementar streak histórico e conquistas;API de progresso;Alta;54,111;;Não iniciado;16;;;Derivar progresso de participação mútua confirmada - substituir contador local inicializado em 3 e incrementado por cliques - releitura e pulo não contam
56;Backend;Testes;Implementar linguagens do amor e resultado;Serviço de avaliação;Alta;49;;Não iniciado;16;;;
57;Backend;Testes;Implementar temperamentos e resultado;Serviço de avaliação;Alta;49;;Não iniciado;16;;;
58;Backend;Notificações;Implementar preferências e notificações;Serviço de notificações;Média;49;;Não iniciado;20;;;
59;Backend;Admin;Criar gestão segura de conteúdo;Painel ou API administrativa;Alta;52;;Não iniciado;24;;;Operação mínima de revisão publicação e retirada com autorização e auditoria - CMS completo não é exigido antes do piloto se existir alternativa segura nas tarefas 52 e 115
60;Frontend;Base;Implementar bootstrap tema e navegação;Base da aplicação;Crítica;28,32;;Em andamento;14;;;
61;Frontend;Onboarding;Implementar onboarding responsivo;Tela funcional;Crítica;21,28;;Em andamento;12;;;Três telas implementadas - reaberto na revisão: Já tenho uma conta usa conclusão genérica e abre cadastro - faltam pular e validação do fluxo documentado
62;Frontend;Autenticação;Implementar cadastro e login;Telas integradas;Crítica;22,44,45;;Em andamento;16;;;
63;Frontend;Casal;Implementar criação entrada e espera do pareamento;Fluxo integrado;Crítica;23,48,49;;Em andamento;18;;;Criação entrada e espera implementadas - reaberto na revisão: erro de atualização sem mensagem e cópia pode informar sucesso sem clipboard - integração e validação completas pendentes
64;Frontend;Perfil;Implementar perfil conta e preferências;Tela integrada;Alta;51;;Em andamento;12;;;
65;Frontend;Home;Implementar home personalizada;Tela integrada;Alta;24,55,116;;Em andamento;20;;;Home atual parcial - integrar estados em docs/HOME-E-ROTINA-DIARIA.md com pendências reais e progresso confirmado sem valores demonstrativos
66;Frontend;Perguntas;Implementar perguntas por nível;Experiência integrada;Alta;25,52,116;;Em andamento;16;;;Jogo local por temas implementado em 109 - níveis leve médio profundo e catálogo remoto ainda pendentes - harmonizar formato e mecânica na tarefa 112
67;Frontend;Respostas;Implementar resposta privada e espera;Experiência integrada;Crítica;53,54;;Em andamento;18;;;
68;Frontend;Respostas;Implementar tela de revelação mútua;Experiência integrada;Crítica;54,67;;Em andamento;12;;;
69;Frontend;Testes;Implementar teste de linguagens do amor;Experiência integrada;Alta;26,56;;Em andamento;18;;;
70;Frontend;Testes;Implementar teste de temperamentos;Experiência integrada;Alta;26,57;;Em andamento;20;;;
71;Frontend;Progresso;Implementar streak histórico e conquistas;Experiência integrada;Média;55,65;;Não iniciado;18;;;
72;Frontend;Notificações;Implementar central e preferências;Experiência integrada;Média;58;;Não iniciado;16;;;
73;Frontend;Estados;Implementar loading vazio erro e offline;Estados consistentes;Alta;60-72;;Não iniciado;16;;;
74;Frontend;Acessibilidade;Aplicar WCAG foco teclado contraste e leitores;Auditoria aprovada;Alta;60-73;;Não iniciado;20;;;
75;Frontend;Responsividade;Validar celulares tablets e desktop;Matriz responsiva;Alta;60-74;;Não iniciado;16;;;
76;Conteúdo;Editorial;Revisar textos linguagem inclusiva e tom;Conteúdo aprovado;Alta;17,108,110;;Não iniciado;12;;;Revisão editorial pode começar pelos lotes candidatos antes de concluir frontend - incluir textos de interface à medida que forem implementados
77;Conteúdo;Especialista;Validar perguntas e recomendações com especialista;Parecer de conteúdo;Crítica;108,110,115;;Não iniciado;20;;;Validar lotes e recomendações antes de publicação - distinguir conteúdo candidato de aprovado e seleção mínima de 60 atividades - conteúdo íntimo restrito conforme baseline do piloto
78;Qualidade;Testes;Definir estratégia e critérios de aceite;Plano de testes;Crítica;10,35;;Não iniciado;8;;;
79;Qualidade;Backend;Criar testes unitários dos serviços;Suíte automatizada;Alta;44-59,78;;Não iniciado;30;;;Incluir regras de autenticação autoria duas participações idempotência transições de rodada e progresso - não há suíte versionada identificada nesta revisão
80;Qualidade;Frontend;Criar testes de componentes e hooks;Suíte automatizada;Alta;60-75,78;;Não iniciado;30;;;
81;Qualidade;Integração;Criar testes de integração da API;Suíte automatizada;Crítica;44-59,78,111;;Não iniciado;24;;;Incluir escritas concorrentes falha de persistência retomada isolamento e reenvios - usar dados de teste sem tocar em contas reais
82;Qualidade;E2E;Automatizar cadastro pareamento e revelação;Fluxos E2E;Crítica;61-70,78,116;;Não iniciado;32;;;Dois contextos autenticados independentes - validar ida e volta da home retomada perguntas desafios pulo e revelação sem vazamento
83;Qualidade;Segurança;Executar análise de dependências e vulnerabilidades;Relatório corrigido;Crítica;36,40;;Não iniciado;12;;;Aplicar SEC-26 e ST-20 de docs/MODELAGEM-DE-AMEACAS.md - versões fixadas análise de dependências e segredos SBOM revisão de artefato e bloqueio de promoção com vulnerabilidade crítica explorável
84;Qualidade;Segurança;Testar autorização e isolamento entre casais;Relatório corrigido;Crítica;49,53,54;;Não iniciado;20;;;Executar casos ST-01 a ST-19 aplicáveis de docs/MODELAGEM-DE-AMEACAS.md com ênfase em BOLA BFLA convite sessão revelação corrida desvinculação logs admin e cache - nenhum vazamento S3 ou S4 e nenhuma ameaça crítica aberta antes do piloto
85;Qualidade;Performance;Medir Core Web Vitals e API;Relatório de performance;Alta;73,75;;Não iniciado;12;;;
86;Qualidade;Compatibilidade;Testar navegadores e dispositivos reais;Matriz aprovada;Alta;75;;Não iniciado;16;;;
87;Qualidade;Produto;Executar QA exploratório completo;Relatório de QA;Crítica;79-86;;Não iniciado;24;;;
88;Jurídico;Privacidade;Redigir política de privacidade;Documento publicado;Crítica;37;;Não iniciado;16;;;Usar operações OP-01 a OP-20 e decisões DEC-01 DEC-02 DEC-05 e DEC-08 do inventário LGPD - identificar controlador encarregado operadores transferências finalidades bases prazos direitos e limites da revelação ao parceiro
89;Jurídico;Termos;Redigir termos de uso;Documento publicado;Crítica;6,37;;Não iniciado;16;;;
90;Jurídico;Privacidade;Implementar consentimentos e direitos LGPD;Fluxos auditáveis;Crítica;37,88;;Não iniciado;20;;;Implementar CS-01 a CS-05 e DEC-03 DEC-04 DEC-06 DEC-07 DEC-09 e DEC-10 do inventário LGPD - consentimento específico para conteúdo potencialmente sensível revogação exportação exclusão propagação e RIPD antes do piloto
91;Jurídico;Operação;Definir canal de suporte e exclusão de conta;Processo operacional;Alta;50,90;;Não iniciado;8;;;Designar e publicar encarregado ou justificativa aplicável - operacionalizar OP-16 e OP-19 com verificação proporcional prazos RT-01 RT-05 RT-10 fila de operadores e separação de dados do parceiro
92;Lançamento;DevOps;Configurar domínio DNS HTTPS e produção;Ambiente publicado;Crítica;16,38,42,123;;Não iniciado;12;;;Provisionar produção conforme docs/AMBIENTES.md após homologação 123 - frontend e API na mesma origem entrada HTTPS banco privado recursos isolados e artefato validado - domínio provedor região e custo ainda pendentes
93;Lançamento;Dados;Executar migrações e backup inicial;Banco pronto;Crítica;41,92,118;;Não iniciado;8;;;Migração com staging e conferência dos dados legados - backup inicial e restauração comprovada antes de declarar banco pronto
94;Lançamento;Produto;Preparar landing page e materiais;Página de lançamento;Alta;17,18;;Não iniciado;20;;;
95;Lançamento;Operação;Preparar FAQ suporte e incidentes;Playbook operacional;Alta;91;;Não iniciado;12;;;Incluir DEC-11 do inventário LGPD - contato 24x7 avaliação de risco ou dano relevante registro de decisão e comunicação à ANPD e titulares em até 3 dias úteis quando aplicável
96;Lançamento;Homologação;Executar UAT com grupo piloto;Aceite do produto;Crítica;87,90,92-95,77,116,117,119,121,122;;Não iniciado;24;;;UAT do ciclo bilateral conforme baseline 112 - mecânicas 113 e 114 entram no aceite se mantidas para o piloto - reunir evidências de conteúdo privacidade fornecedores e operação
97;Lançamento;Produto;Corrigir bloqueadores do piloto;Release candidate;Crítica;96;;Não iniciado;30;;;
98;Lançamento;Gestão;Realizar checklist go/no-go;Decisão documentada;Crítica;97;;Não iniciado;4;;;
99;Lançamento;DevOps;Publicar versão de produção;Release 1.0;Crítica;98;;Não iniciado;6;;;
100;Pós-lançamento;Operação;Monitorar erros segurança e disponibilidade;Relatório da primeira semana;Crítica;99;;Não iniciado;20;;;
101;Pós-lançamento;Produto;Analisar ativação retenção e pareamento;Dashboard de métricas;Alta;7,99;;Não iniciado;12;;;
102;Pós-lançamento;Pesquisa;Coletar feedback e entrevistas;Relatório pós-lançamento;Alta;99;;Não iniciado;20;;;
103;Pós-lançamento;Produto;Priorizar melhorias e roadmap V2;Roadmap V2;Alta;100-102;;Não iniciado;10;;;
104;Pós-lançamento;Engenharia;Planejar escalabilidade e custos;Plano de capacidade;Média;100,101;;Não iniciado;10;;;
105;Pós-lançamento;Gestão;Realizar retrospectiva do projeto;Lições aprendidas;Média;100-103;;Não iniciado;5;;;
106;Backend;Analytics;Instrumentar eventos e agregação de métricas;API administrativa de métricas;Crítica;7,34,35,111;;Em andamento;20;;;Endpoint e agregações implementados - reaberto: eventos financeiros aceitos do cliente reativação não recupera pagantes retenção acumulada rotulada D7 e mode descartado - definir fontes confiáveis e testar métricas
107;Frontend;Administração;Criar painel administrativo de métricas;Dashboard administrativo;Alta;106;;Em andamento;18;;;Painel implementado - reaberto para distinguir não instrumentado de zero e esclarecer coortes origem dos dados e limitações - aceite depende da correção e validação da tarefa 106
108;Conteúdo;Editorial;Produzir banco inicial de perguntas de múltipla escolha;Planilha editorial de perguntas;Crítica;19,17;Pesquisa e Conteúdo;Em andamento;20;;;75 perguntas de múltipla escolha candidatas em Conteúdo/banco-de-perguntas-conectadois.xlsx - produção precede revisão 76 e parecer 77 - pendentes revisão editorial aprovação e seleção do lote do piloto
109;Frontend;Jogo;Incluir seleção inicial de temas e formatos;Perguntas discursivas e desafios no mesmo dispositivo;Alta;108;Engenharia Frontend;Concluído;12;;;Onze temas com dois formatos e modo misto - respostas por jogador e confirmação individual de desafios - pular e reiniciar disponíveis
110;Conteúdo;Editorial;Ampliar todos os temas com perguntas discursivas e desafios;44 novas atividades no app e banco editorial;Alta;108;Pesquisa e Conteúdo;Em andamento;8;;;Duas perguntas e dois desafios por tema implementados - 22 desafios separados na aba Desafios e perguntas nas abas temáticas - revisão editorial e especializada pendentes antes de publicação
111;Backend;Sessões de jogo;Persistir partidas rodadas e participantes;Serviço de partidas com autorização por casal;Alta;34,35,41,49,52;Engenharia Backend;Não iniciado;16;;;Implementar modelo de partidas e snapshots de conteúdo - integrar respostas e progresso com transações e testes de concorrência
112;Planejamento;Produto;Reconciliar temas formatos mecânicas e escopo do piloto;Baseline e matriz de rastreabilidade;Crítica;8,10,34;Product Owner — Tatyele Lopes;Não iniciado;8;;;Conciliar perguntas desafios e misto com resposta guardada adivinhação e coincidências - decidir primeiro piloto e atualizar PRD escopo MoSCoW modelo e cronograma - estimativa preliminar
113;Backend;Jogos;Implementar mecânica bilateral de adivinhação;Fluxo integrado com inversão de papéis;Alta;112,35,52,111;Liderança Técnica;Não iniciado;24;;;Já previsto no escopo MVP - execução condicionada à decisão 112 - incluir modelo de tentativas API interface e testes de autoria - estimativa preliminar
114;Backend;Jogos;Implementar mecânica de escolhas coincidentes;Fluxo de escolhas e fechamento;Alta;112,35,52,111;Liderança Técnica;Não iniciado;24;;;Já previsto no escopo MVP - execução condicionada à decisão 112 - revelar somente coincidências e permitir outra ideia - incluir API interface e testes - estimativa preliminar
115;Conteúdo;Operação editorial;Unificar fonte editorial e validar importação do catálogo;Conteúdo versionado e validado;Crítica;108,110,112;Pesquisa e Conteúdo;Não iniciado;16;;;IDs estáveis por atividade tema nível duração formato revisão e publicação - planilhas como visões sem duplicar contagem - validação de schema cobertura e referências - estimativa preliminar
116;Frontend;Sessões de jogo;Integrar partidas remotas e retomada em duas contas;Jornada bilateral integrada;Crítica;111,53,54,109;Engenharia Frontend;Não iniciado;24;;;Distinguir jogo local e remoto - autoria por conta retomada estados de rede pulo e revelação em perguntas desafios e misto - sem confirmar pela outra pessoa - estimativa preliminar
117;Frontend;Feedback;Coletar feedback opcional por atividade;Sinais de relevância e desconforto;Alta;116,52;Engenharia Frontend;Não iniciado;12;;;Previsto no piloto - feedback curto opcional sem expor respostas íntimas e triagem editorial agregada - retirada usa operação 52 e 59 - estimativa preliminar
118;Infraestrutura;Recuperação;Ensaiar restauração de backup e retorno de migração;Evidência de recuperação;Crítica;41,38;DevOps/Plataforma;Não iniciado;8;;;Ensaiar em recurso isolado conforme docs/AMBIENTES.md - metas iniciais RPO 24h RTO 4h backup diário e antes de migração retenção 30 dias - medir recuperação conferir integridade invalidar sessões e reaplicar exclusões - estimativa preliminar
119;Frontend;PWA;Configurar instalação PWA e política de cache;Manifest instalação e offline seguro;Alta;38,60,73;Engenharia Frontend;Não iniciado;12;;;Formato PWA previsto no MVP - definir shell público sem cache de respostas privadas e validar atualização saída da conta e experiência offline - estimativa preliminar
120;Planejamento;Qualidade do plano;Revisar coerência geral entre acompanhamento e entregas;Relatório e plano reconciliado;Alta;34,24,109,110;Product Owner — Tatyele Lopes;Concluído;6;;;Revisão em docs/REVISAO-GERAL-2026-09-04.md - confronto Excel código e documentos build aprovado achados rastreados notas CSV corrigidas e validador scripts/validate-project-plan.ps1
121;Jurídico;Privacidade;Elaborar RIPD e testes de balanceamento;RIPD e LIAs aprovados;Crítica;36,37,112;Privacidade/Jurídico;Não iniciado;20;;;Concluir DEC-06 e DEC-10 do inventário LGPD - LIA-01 segurança LIA-02 analytics necessidade proporcionalidade salvaguardas risco residual e aceite formal antes do piloto
122;Jurídico;Fornecedores;Cadastrar operadores e transferências internacionais;Registro de operadores e contratos;Crítica;37,38,42;Privacidade/Jurídico;Não iniciado;12;;;Concluir DEC-05 do inventário LGPD - due diligence DPA suboperadores regiões retenção saída incidentes e mecanismo válido da Resolução CD/ANPD 19/2024 antes de dados reais
123;Infraestrutura;DevOps;Provisionar homologação e validar configuração por ambiente;Homologação isolada com evidências;Alta;16,38,40,41,42,43,122;DevOps/Plataforma;Não iniciado;16;;;Implementar docs/AMBIENTES.md com HTTPS acesso restrito dados sintéticos API na mesma origem e isolamento de produção - validar APP_ENV APP_ORIGIN PORT e rejeitar JSON remoto - testar publicação e registrar provedor região custo e configuração sem segredos - estimativa preliminar
'@

$mpvTasksCsv = @'
ID;Fase;Área;Tarefa;Entregável;Prioridade;Dependência;Responsável;Status;Estimativa (h);Início planejado;Fim planejado;Observações
124;MPV de teste;Produto;Definir hipótese e critérios de decisão do MPV;Hipótese e métricas do MPV;Crítica;;Product Owner — Tatyele Lopes;Concluído;3;12/09/2026;12/09/2026;Trilha adicional ao plano completo — validar se casais entendem e desejam repetir jogos curtos de conexão no mesmo celular — critérios em docs/ESCOPO-MPV.md
125;MPV de teste;Produto;Congelar o escopo em dois jogos passa-e-joga;Backlog mínimo aprovado;Crítica;124;Product Owner — Tatyele Lopes;Concluído;3;12/09/2026;12/09/2026;Escopo inicial de Descoberta a Dois e Adivinhe de Mim concluído — exceção posterior autorizada pela Product Owner em 17/09/2026 adiciona amostra autoral e baralho visual nas tarefas 140 e 141
126;MPV de teste;UX;Simplificar a jornada para entrada escolha jogo rodada e feedback;Fluxo do MPV;Crítica;125;Product Designer;Concluído;4;13/09/2026;17/09/2026;Fluxo ampliado em docs/FLUXO-MPV.md com entrada direta três experiências cartas fechadas dois jogos amostra individual três sinais sugestão opcional exceções e critérios de aceite
127;MPV de teste;Editorial;Selecionar doze cartas leves para os dois jogos;Lote mínimo de conteúdo;Alta;125;Conteúdo;Concluído;4;13/09/2026;14/09/2026;Lote aprovado em docs/CONTEUDO-MPV.md e src/features/game/mpv-cards.json — seis cartas por jogo com IDs únicos origem rastreável e quatro alternativas por carta de adivinhação — concluído antecipadamente em 12/09/2026
128;MPV de teste;Frontend;Criar entrada direta e seleção entre os dois jogos;Tela inicial funcional;Crítica;126;Engenharia Frontend;Concluído;5;15/09/2026;17/09/2026;Entrada direta responsiva ampliada para três experiências sem cadastro ou pareamento com apresentação neutra sem o nome do aplicativo em título metadados cabeçalho ou rodapé e aplicativo completo preservado — atualizada em 17/09/2026
129;MPV de teste;Jogo 1;Implementar Descoberta a Dois;Jogo 1 funcional;Crítica;127,128;Engenharia Frontend;Concluído;8;16/09/2026;17/09/2026;Fluxo responsivo implementado com três perguntas únicas sorteadas, orientação para respostas em voz alta, avanço, opção de pular, progresso e encerramento sem armazenar respostas — concluído antecipadamente em 12/09/2026
130;MPV de teste;Jogo 2;Implementar Adivinhe de Mim;Jogo 2 funcional;Crítica;127,128;Engenharia Frontend;Concluído;10;16/09/2026;18/09/2026;Fluxo responsivo implementado com três cartas únicas, escolha secreta, passagem protegida do aparelho, palpite, revelação, contagem de acertos e alternância automática de papéis sem armazenar respostas — concluído antecipadamente em 12/09/2026
131;MPV de teste;Feedback;Adicionar fechamento e feedback de três sinais;Feedback funcional;Alta;129,130;Engenharia Frontend;Concluído;4;19/09/2026;17/09/2026;Feedback binário integrado aos dois jogos e à amostra individual com textos adaptados e registro central de clareza reflexão ou conexão e intenção de repetir sem respostas das rodadas — ampliado em 17/09/2026
132;MPV de teste;Compatibilidade;Validar fluxo crítico em celulares;Checklist mobile aprovado;Crítica;128-131;Qualidade;Concluído;5;16/09/2026;16/09/2026;Aprovado com ressalva para o escopo controlado no Chrome após passagem física confirmada pela Product Owner feedback real com três sinais positivos saúde exportação persistência dois jogos e 95 estados móveis revalidados — registro técnico removido e base vazia — modelo sistema e versão não informados — Safari adiado por decisão da Product Owner e explicitamente não validado
133;MPV de teste;Acessibilidade;Corrigir barreiras críticas de uso;Checklist de acessibilidade;Alta;128-131;Qualidade;Em andamento;4;20/09/2026;21/09/2026;Todos os alvos incluindo cartas fechadas permanecem com pelo menos 44 px e nomes acessíveis aprovados em 185 estados móveis — pendentes validações formais de foco contraste e redução de movimento
134;MPV de teste;Qualidade;Executar QA do caminho feliz e falhas básicas;MPV candidato à validação;Crítica;132,133,138,139;Qualidade;Em andamento;5;16/09/2026;21/09/2026;API serviço integrado três experiências baralho visual e matriz de 185 estados revalidados automaticamente em 17/09/2026 — pendem verificações formais da tarefa 133 e nova passagem física da tarefa 142 — Safari fora da cobertura atual
135;MPV de teste;Operação;Disponibilizar demonstração controlada;Link de demonstração;Crítica;134;Engenharia Frontend;Concluído;4;16/09/2026;17/09/2026;Versão ampliada publicada por HTTPS no Render gratuito com três experiências baralho visual Web Service PostgreSQL de 1 GB sonda de saúde CORS restrito bloqueio de indexação e segredo operacional — novo gameId persistido e exportado base técnica limpa e banco expira em 16/10/2026 sem backup
136;MPV de teste;Validação;Validar o formato com cinco casais;Placar dos critérios de decisão;Crítica;135,142;Product Owner — Tatyele Lopes;Não iniciado;8;23/09/2026;27/09/2026;Cada casal usa as experiências sem mediação e envia os três sinais do produto com sugestão de melhoria opcional — não há entrevistas nem etapa de pesquisa dentro do MPV — iniciar após a nova passagem física da versão ampliada
137;MPV de teste;Produto;Incorporar aprendizados ao plano inicial do aplicativo;Decisão e recomendações registradas;Crítica;136;Product Owner — Tatyele Lopes;Não iniciado;3;28/09/2026;28/09/2026;Registrar continuar ajustar ou encerrar o formato e quais evidências devem orientar a futura revisão do plano completo sem alterá-lo automaticamente
138;MPV de teste;Feedback;Adicionar sugestões abertas opcionais ao feedback;Campo de sugestões funcional;Alta;131;Engenharia Frontend;Concluído;3;16/09/2026;16/09/2026;Campo opcional de até 500 caracteres implementado com orientação para não inserir dados pessoais e cobertura na matriz móvel — concluído em 16/09/2026
139;MPV de teste;Backend;Centralizar feedback e disponibilizar exportação controlada;API e CSV protegidos;Crítica;138;Engenharia Backend;Concluído;6;16/09/2026;17/09/2026;POST anônimo com validação idempotência controle de origem rate limit armazenamento PostgreSQL remoto fallback JSON local e exportação CSV protegida — schema ampliado e validado ao vivo para love-style-sample em 17/09/2026 sem armazenar respostas ou resultado
140;MPV de teste;Experimento;Adicionar amostra autoral de preferências afetivas;Amostra individual funcional;Alta;126,128,139;Engenharia Frontend;Concluído;10;17/09/2026;17/09/2026;Cinco perguntas sorteadas entre seis situações autorais com cinco famílias de preferência pontuação somente em memória resultado com duas preferências fortes distribuição completa aviso não oficial e feedback adaptado — conteúdo não replica questionários comerciais
141;MPV de teste;UX;Apresentar perguntas como cartas fechadas escolhidas pela pessoa;Baralho visual acessível;Alta;129,130,140;Engenharia Frontend;Concluído;8;17/09/2026;17/09/2026;Componente visual em HTML e CSS aplicado às três experiências com escolha real entre cartas restantes animação rótulos acessíveis alvos mínimos de 44 px redução de movimento e reinício validado
142;MPV de teste;Qualidade;Revalidar versão ampliada e repetir passagem física no Chrome;Aceite da iteração ampliada;Crítica;133,134,140,141;Qualidade;Em andamento;4;17/09/2026;18/09/2026;Versão ampliada publicada e aprovada em cinco viewports 185 estados 15 feedbacks sintéticos três experiências baralho resultado nome oculto PostgreSQL e exportação ao vivo — registro técnico removido e acesso externo ao banco fechado — pendente somente repetir a passagem física no Chrome — Safari segue adiado
'@

$tasksCsv = $appPlanTasksCsv.TrimEnd() + [Environment]::NewLine + (($mpvTasksCsv -split '\r?\n' | Select-Object -Skip 1) -join [Environment]::NewLine)
$tasks = $tasksCsv | ConvertFrom-Csv -Delimiter ';'
$lastPlanRow = $tasks.Count + 1
$phaseOwners = @{
  'Descoberta'='Product Owner'; 'Planejamento'='Product Owner'; 'Marca'='Product Designer'; 'UX/UI'='Product Designer'
  'Arquitetura'='Liderança Técnica'; 'Infraestrutura'='DevOps/Plataforma'; 'Backend'='Engenharia Backend'
  'Frontend'='Engenharia Frontend'; 'Conteúdo'='Pesquisa e Conteúdo'; 'Qualidade'='Qualidade'
  'Jurídico'='Privacidade/Jurídico'; 'Lançamento'='Growth e Operações'; 'Pós-lançamento'='Product Owner'
  'MPV de teste'='Product Owner'
}
foreach($task in $tasks) {
  if(-not $task.Responsável) { $task.Responsável = $phaseOwners[$task.Fase] }
  if($task.Área -eq 'Pesquisa') { $task.Responsável = 'Pesquisa e Conteúdo' }
  elseif($task.Área -in @('Jurídico','Privacidade','Termos')) { $task.Responsável = 'Privacidade/Jurídico' }
  elseif($task.Área -in @('Engenharia','API','Segurança') -and $task.Fase -eq 'Arquitetura') { $task.Responsável = 'Liderança Técnica' }
  elseif($task.Área -eq 'Dados' -and $task.Fase -eq 'Arquitetura') { $task.Responsável = 'Engenharia Backend' }
  elseif($task.Área -in @('DevOps','Observabilidade')) { $task.Responsável = 'DevOps/Plataforma' }
  elseif($task.Fase -eq 'Lançamento' -and $task.Área -in @('DevOps','Dados')) { $task.Responsável = 'DevOps/Plataforma' }
  elseif($task.Fase -eq 'Pós-lançamento' -and $task.Área -eq 'Operação') { $task.Responsável = 'Growth e Operações' }
  elseif($task.Fase -eq 'Pós-lançamento' -and $task.Área -eq 'Engenharia') { $task.Responsável = 'Liderança Técnica' }
}
$phases = @('Descoberta','Planejamento','Marca','UX/UI','Arquitetura','Infraestrutura','Backend','Frontend','Conteúdo','Qualidade','Jurídico','Lançamento','Pós-lançamento','MPV de teste')
$milestones = @(
  @('MPV1','Escopo e fluxo do teste aprovados','126','Concluído','Dois jogos um aparelho critérios de decisão e fluxo documentados','12/09/2026'),
  @('MPV2','Três experiências jogáveis','141','Concluído','Dois jogos amostra autoral baralho visual e feedback funcionando','17/09/2026'),
  @('MPV3','Demonstração do teste pronta','142','Em andamento','Link controlado disponível e nova passagem física da versão ampliada pendente no Chrome','22/09/2026'),
  @('MPV4','Aprendizados incorporados','137','Não iniciado','Sinais de cinco casais registrados como insumo para revisão futura do plano completo','28/09/2026'),
  @('MC1','Baseline aprovada','13','Em andamento','PRD escopo MoSCoW papéis e pesquisa aprovados','18/09/2026'),
  @('MC2','Personas e oportunidades validadas','4','Em andamento','24 entrevistas analisadas e personas revisadas','02/10/2026'),
  @('MC3','Mecânicas e padrão editorial aprovados','31','Não iniciado','Três protótipos testados e primeiro lote revisado','16/10/2026'),
  @('MC4','Fundação técnica pronta','123','Em andamento','PostgreSQL CI segredos observabilidade recuperação 118 e homologação operacional 123 conforme estratégia 38','23/10/2026'),
  @('MC5','MVP feature-complete','75','Em andamento','Jornada bilateral validada incluindo 111 e 116 e métricas 106-107 — 113-114 conforme decisão 112','20/11/2026'),
  @('MC6','Conteúdo do piloto aprovado','77','Não iniciado','60 atividades aprovadas com origem nível teste e revisão — tarefas 77 108 110 e 115','27/11/2026'),
  @('MC7','Release candidate','96','Não iniciado','QA segurança acessibilidade privacidade UAT e restauração 118 sem bloqueador — PWA 119 validada','18/12/2026'),
  @('MC8','Go/no-go do piloto','98','Não iniciado','Coorte suporte métricas e release confirmados','08/01/2027'),
  @('MC9','Piloto concluído','102','Não iniciado','Seis semanas de uso dados íntegros e entrevistas agendadas','19/02/2027'),
  @('MC10','Decisão do MVP comercial','103','Não iniciado','Relatório do piloto e recomendação aprovados','05/03/2027')
)
$risks = @(
  @('R01','Privacidade de respostas íntimas','Segurança','Alta','Crítico','Criptografia autorização por casal e testes de isolamento','','Aberto'),
  @('R02','Baixa adesão do parceiro','Produto','Alta','Alto','Simplificar convite lembretes e medir conversão do pareamento','','Aberto'),
  @('R03','Conteúdo percebido como diagnóstico','Conteúdo','Média','Alto','Amostra autoral com aviso não oficial e não diagnóstico — manter revisão especializada antes de ampliar','','Aberto'),
  @('R04','Vazamento de credenciais ou sessões','Segurança','Média','Crítico','Hash forte expiração rotação e gestão de segredos','','Aberto'),
  @('R05','Atraso por escopo excessivo','Gestão','Alta','Alto','Proteger MVP controlar mudanças e revisar prioridades semanalmente','','Aberto'),
  @('R06','Dependência do armazenamento JSON','Tecnologia','Alta','Alto','Feedback remoto já usa PostgreSQL temporário - migrar os demais dados e provisionar banco definitivo antes da publicação ampla','','Aberto'),
  @('R07','Não conformidade com LGPD','Jurídico','Média','Crítico','Inventário v1 concluído — resolver DEC-01 a DEC-11 implementar consentimentos e direitos aprovar RIPD LIAs operadores e revisão jurídica','Privacidade/Jurídico','Aberto'),
  @('R08','Problemas de desempenho em mobile','Tecnologia','Média','Médio','Orçamento de performance imagens otimizadas e testes em aparelhos reais','','Aberto'),
  @('R09','Capacidade da equipe abaixo da premissa','Gestão','Alta','Alto','Confirmar responsáveis e horas recalcular datas ou reduzir amplitude antes do ciclo','','Aberto'),
  @('R10','Recesso e recrutamento atrasam o piloto','Gestão','Média','Alto','Antecipar UAT congelar escopo em dezembro e manter recrutamento contínuo','','Aberto'),
  @('R11','Autorização quebrada expõe dados entre casais','Segurança','Alta','Crítico','Autorização por sujeito ação e recurso DTOs mínimos e testes negativos ST-01 a ST-05','Liderança Técnica','Aberto'),
  @('R12','Convite curto permite sequestro da segunda vaga','Segurança','Alta','Crítico','Pelo menos 128 bits hash expiração uso único rate limit e testes ST-06 a ST-08','Liderança Técnica','Aberto'),
  @('R13','Eventos do cliente adulteram métricas do piloto','Dados','Alta','Alto','Derivar métricas críticas no servidor rejeitar eventos financeiros e testar replay','Engenharia Backend','Aberto'),
  @('R14','Cache ou notificação expõe conteúdo íntimo','Privacidade','Média','Crítico','No-store service worker sem S3 ou S4 notificações discretas e teste em aparelho compartilhado','Privacidade/Jurídico','Aberto'),
  @('MR01','Escopo do MPV crescer antes da validação','MPV','Alta','Alto','Ampliação autorizada pela Product Owner em 17/09/2026 — separar sinais por experiência e exigir revalidação física antes dos cinco casais','Product Owner — Tatyele Lopes','Em acompanhamento'),
  @('MR02','Regras dos jogos não serem entendidas sem ajuda','MPV','Média','Alto','Instrução em uma tela exemplo curto e critério de conclusão sem mediação','Product Designer','Aberto'),
  @('MR03','Perguntas do teste causarem desconforto','MPV','Baixa','Alto','Usar apenas cartas leves permitir pular e não armazenar respostas','Conteúdo','Aberto'),
  @('MR04','Conteúdo influenciar mais que o formato','MPV','Média','Médio','Analisar feedback separadamente entre os dois jogos e a amostra autoral para não misturar efeito de conteúdo e interação','Product Owner — Tatyele Lopes','Aberto'),
  @('MR05','Falha no celular impedir a sessão de teste','MPV','Média','Alto','Validar o caminho crítico nos navegadores alvo e manter reinício simples','Engenharia Frontend','Aberto'),
  @('MR06','Sugestão aberta conter nomes contatos ou detalhes pessoais','Privacidade','Média','Alto','Limitar a 500 caracteres orientar a não inserir dados pessoais restringir a exportação e excluir a base gratuita em até 30 dias','Privacidade/Jurídico','Aberto')
)

function Escape([object]$Value) { if ($null -eq $Value) { return '' }; return [System.Security.SecurityElement]::Escape([string]$Value) }
function Col([int]$Number) { $name=''; while($Number -gt 0){$Number--; $name=[char](65+($Number%26))+$name; $Number=[math]::Floor($Number/26)}; return $name }
function Cell([int]$Row,[int]$Column,[object]$Value,[int]$Style=0,[string]$Formula='') {
  $ref="$(Col $Column)$Row"; if($Formula){return "<c r=`"$ref`" s=`"$Style`"><f>$(Escape $Formula)</f><v>0</v></c>"}
  if($Value -is [int] -or $Value -is [double] -or $Value -is [decimal]){return "<c r=`"$ref`" s=`"$Style`"><v>$Value</v></c>"}
  return "<c r=`"$ref`" s=`"$Style`" t=`"inlineStr`"><is><t>$(Escape $Value)</t></is></c>"
}
function Sheet([array]$Rows,[int[]]$Widths,[int]$FreezeRow=1,[string]$AutoFilter='') {
  $cols=''; for($i=0;$i-lt$Widths.Count;$i++){$n=$i+1;$cols+="<col min=`"$n`" max=`"$n`" width=`"$($Widths[$i])`" customWidth=`"1`"/>"}
  $xml='<?xml version="1.0" encoding="UTF-8" standalone="yes"?><worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">'
  $xml+="<sheetViews><sheetView workbookViewId=`"0`"><pane ySplit=`"$FreezeRow`" topLeftCell=`"A$($FreezeRow+1)`" activePane=`"bottomLeft`" state=`"frozen`"/></sheetView></sheetViews><cols>$cols</cols><sheetData>"
  for($r=0;$r-lt$Rows.Count;$r++){ $xml+="<row r=`"$($r+1)`">"; for($c=0;$c-lt$Rows[$r].Count;$c++){ $item=$Rows[$r][$c]; if($item -is [hashtable]){$xml+=Cell ($r+1) ($c+1) $item.v $item.s $item.f}else{$xml+=Cell ($r+1) ($c+1) $item ($(if($r-eq 0){1}else{0}))} }; $xml+='</row>' }
  $xml+='</sheetData>'; if($AutoFilter){$xml+="<autoFilter ref=`"$AutoFilter`"/>"}; $xml+='<pageMargins left="0.3" right="0.3" top="0.5" bottom="0.5" header="0.2" footer="0.2"/></worksheet>'; return $xml
}

$planRows = ,@('ID','Fase','Área','Tarefa','Entregável','Prioridade','Dependência','Responsável','Status','Estimativa (h)','Início planejado','Fim planejado','% concluído','Observações')
foreach($t in $tasks){$pct = switch($t.Status){'Concluído'{1};'Em andamento'{0.5};default{0}}; $planRows += ,@([int]$t.ID,$t.Fase,$t.Área,$t.Tarefa,$t.Entregável,$t.Prioridade,$t.Dependência,$t.Responsável,$t.Status,[int]$t.'Estimativa (h)',$t.'Início planejado',$t.'Fim planejado',@{v=$pct;s=3},$t.Observações)}
$dashRows = @(
  @('PLANO DE ACOMPANHAMENTO — APP DO AMOR + MPV DE TESTE','',''),
  @('Atualizado em',(Get-Date -Format 'dd/MM/yyyy HH:mm'),''),
  @('Indicador','Valor','Leitura'),
  @('Total de tarefas',@{v=0;s=2;f="COUNTA('Plano Mestre'!A2:A$lastPlanRow)"},'escopo completo'),
  @('Tarefas concluídas',@{v=0;s=2;f="COUNTIF('Plano Mestre'!I2:I$lastPlanRow,`"Concluído`")"},'entregas finalizadas'),
  @('Em andamento',@{v=0;s=2;f="COUNTIF('Plano Mestre'!I2:I$lastPlanRow,`"Em andamento`")"},'trabalho ativo'),
  @('Não iniciadas',@{v=0;s=2;f="COUNTIF('Plano Mestre'!I2:I$lastPlanRow,`"Não iniciado`")"},'fila restante'),
  @('Progresso por status',@{v=0;s=3;f="AVERAGE('Plano Mestre'!M2:M$lastPlanRow)"},'não mede prontidão do produto'),
  @('Horas estimadas',@{v=0;s=2;f="SUM('Plano Mestre'!J2:J$lastPlanRow)"},'esforço total'),
  @('','',''),
  @('FASES','Tarefas','Concluídas')
)
foreach($p in $phases){$dashRows += ,@($p,@{v=0;s=2;f=("COUNTIF('Plano Mestre'!B2:B$lastPlanRow,`"$p`")")},@{v=0;s=2;f=("COUNTIFS('Plano Mestre'!B2:B$lastPlanRow,`"$p`",'Plano Mestre'!I2:I$lastPlanRow,`"Concluído`")")})}
$milestoneRows=,@('ID','Marco','Tarefas até','Status','Critério de aceite','Data planejada','Data real'); foreach($m in $milestones){$milestoneRows+=,@($m[0],$m[1],[int]$m[2],$m[3],$m[4],$m[5],'')}
$riskRows=,@('ID','Risco','Categoria','Probabilidade','Impacto','Mitigação','Responsável','Status'); foreach($r in $risks){$riskRows+=,$r}
$governanceRows = @(
  @('GESTÃO DE BACKLOG E CERIMÔNIAS','','','',''),
  @('Modelo','Kanban com compromisso quinzenal','','',''),
  @('Dono da prioridade','Product Owner — Tatyele Lopes','','',''),
  @('Fonte operacional','Plano Mestre; ferramenta externa deve referenciar o mesmo ID','','',''),
  @('','','','',''),
  @('FLUXO','REGRA DE SAÍDA','WIP','EQUIVALÊNCIA NO PLANO','RESPONSÁVEL'),
  @('Funil','Triagem realizada','Sem limite','Não iniciado','PO'),
  @('Análise','Descartar pesquisar ou detalhar','5','Não iniciado','PO/TL'),
  @('Refinamento','Definition of Ready atendida','8','Não iniciado','PO/TL'),
  @('Pronto','Selecionado no planejamento','10','Não iniciado','PO'),
  @('Em andamento','Incremento pronto para revisão','5 no time; 1 por pessoa','Em andamento','Dono do item'),
  @('Em revisão','Parecer e ajustes concluídos','4','Em andamento','Revisor aplicável'),
  @('Em validação','Aceite registrado','4','Em andamento','QA/PO'),
  @('Bloqueado','Impedimento removido','Exige ação','Em andamento','Dono + PO/TL'),
  @('Concluído','Definition of Done atendida','Sem limite','Concluído','PO/TL'),
  @('Cancelado','Motivo registrado','Sem limite','Cancelado','PO'),
  @('','','','',''),
  @('CERIMÔNIA','CADÊNCIA','DURAÇÃO','FACILITADOR','SAÍDA'),
  @('Triagem do funil','Semanal','30 min','PO','Entradas classificadas'),
  @('Refinamento','Semanal','60 min','PO/TL','Itens Ready e estimados'),
  @('Planejamento','Início da quinzena','60–90 min','PO','Objetivo, compromisso e donos'),
  @('Check-in','Diário assíncrono','Até 10 min','Cada responsável','Progresso, próximo passo e bloqueios'),
  @('Revisão produto/conteúdo','Semanal','45 min','PD ou RC','Aceite, ajuste ou decisão'),
  @('Revisão técnica e risco','Semanal','45 min','TL','Decisões, riscos e liberação'),
  @('Demo e aceite','Fim da quinzena','60 min','PO','Aceites, reaberturas e feedback'),
  @('Retrospectiva','Fim da quinzena','45 min','Rotativo','Uma melhoria com dono e prazo'),
  @('Revisão de roadmap','Mensal','60 min','PO','Marcos, riscos e prioridades'),
  @('Go/no-go','Por marco','Conforme pauta','PO','Decisão e condições'),
  @('','','','',''),
  @('DEFINITION OF READY','CRITÉRIO','','',''),
  @('Ready 1','Problema, resultado e responsável claros','','',''),
  @('Ready 2','Aceite testável, dependências e riscos conhecidos','','',''),
  @('Ready 3','Privacidade, segurança, acessibilidade e analytics avaliados','','',''),
  @('Ready 4','Cabe no ciclo; PO confirma valor e TL viabilidade','','',''),
  @('','','','',''),
  @('DEFINITION OF DONE','CRITÉRIO','','',''),
  @('Done 1','Aceite demonstrado e aprovado','','',''),
  @('Done 2','Revisões e testes aplicáveis aprovados','','',''),
  @('Done 3','Analytics, documentação e plano atualizados','','',''),
  @('Done 4','Sem bloqueador; PO aceita e TL autoriza liberação','','',''),
  @('','','','',''),
  @('CLASSE','USO','TRIAGEM','',''),
  @('P0 — Expedite','Segurança, privacidade, integridade ou produção indisponível','Imediata','',''),
  @('P1 — Crítico','Jornada principal ou marco bloqueado','Mesmo dia útil','',''),
  @('P2 — Padrão','Planejado ou defeito com contorno','Próxima triagem/ciclo','',''),
  @('P3 — Oportunidade','Melhoria sem urgência ou evidência','Revisão mensal','',''),
  @('','','','',''),
  @('MÉTRICA','META INICIAL','','',''),
  @('Objetivo do ciclo cumprido','≥ 80% dos ciclos','','',''),
  @('Itens planejados que entram Ready','100%','','',''),
  @('Trabalho não planejado','≤ 15% da capacidade','','',''),
  @('Bloqueios acima de 2 dias','0 críticos; ≤ 2 totais','','',''),
  @('Retrabalho/reabertura','≤ 10%','','',''),
  @('Itens simultâneos por pessoa','≤ 1','','',''),
  @('Defeitos P0/P1 ao fim do ciclo','0','','','')
)

$styles='<?xml version="1.0" encoding="UTF-8" standalone="yes"?><styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><fonts count="3"><font><sz val="10"/><name val="Aptos"/></font><font><b/><color rgb="FFFFFFFF"/><sz val="10"/><name val="Aptos"/></font><font><b/><color rgb="FFD4A94E"/><sz val="16"/><name val="Aptos Display"/></font></fonts><fills count="4"><fill><patternFill patternType="none"/></fill><fill><patternFill patternType="gray125"/></fill><fill><patternFill patternType="solid"><fgColor rgb="FF3D1F3D"/></patternFill></fill><fill><patternFill patternType="solid"><fgColor rgb="FFF3E9D7"/></patternFill></fill></fills><borders count="2"><border/><border><bottom style="thin"><color rgb="FFD8C8B4"/></bottom></border></borders><cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs><cellXfs count="4"><xf numFmtId="0" fontId="0" fillId="0" borderId="1" xfId="0" applyAlignment="1"><alignment vertical="top" wrapText="1"/></xf><xf numFmtId="0" fontId="1" fillId="2" borderId="0" xfId="0" applyAlignment="1"><alignment vertical="center" wrapText="1"/></xf><xf numFmtId="0" fontId="2" fillId="3" borderId="0" xfId="0"/><xf numFmtId="10" fontId="0" fillId="0" borderId="1" xfId="0" applyNumberFormat="1" applyAlignment="1"><alignment vertical="top"/></xf></cellXfs></styleSheet>'
$workbook='<?xml version="1.0" encoding="UTF-8" standalone="yes"?><workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheets><sheet name="Visão Geral" sheetId="1" r:id="rId1"/><sheet name="Plano Mestre" sheetId="2" r:id="rId2"/><sheet name="Marcos" sheetId="3" r:id="rId3"/><sheet name="Riscos" sheetId="4" r:id="rId4"/><sheet name="Governança Backlog" sheetId="5" r:id="rId5"/></sheets><calcPr calcId="191029" fullCalcOnLoad="1"/></workbook>'
$rels='<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/><Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet2.xml"/><Relationship Id="rId3" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet3.xml"/><Relationship Id="rId4" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet4.xml"/><Relationship Id="rId5" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet5.xml"/><Relationship Id="rId6" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/></Relationships>'
$rootRels='<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/></Relationships>'
$types='<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/><Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/><Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/><Override PartName="/xl/worksheets/sheet2.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/><Override PartName="/xl/worksheets/sheet3.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/><Override PartName="/xl/worksheets/sheet4.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/><Override PartName="/xl/worksheets/sheet5.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/></Types>'

$parts=@{
  '[Content_Types].xml'=$types; '_rels/.rels'=$rootRels; 'xl/workbook.xml'=$workbook; 'xl/_rels/workbook.xml.rels'=$rels; 'xl/styles.xml'=$styles
  'xl/worksheets/sheet1.xml'=(Sheet $dashRows @(36,20,34) 3 '')
  'xl/worksheets/sheet2.xml'=(Sheet $planRows @(7,18,18,48,32,13,18,18,16,14,16,16,13,36) 1 "A1:N$($planRows.Count)")
  'xl/worksheets/sheet3.xml'=(Sheet $milestoneRows @(10,38,14,18,55,18,18) 1 "A1:G$($milestoneRows.Count)")
  'xl/worksheets/sheet4.xml'=(Sheet $riskRows @(10,42,18,16,14,58,18,16) 1 "A1:H$($riskRows.Count)")
  'xl/worksheets/sheet5.xml'=(Sheet $governanceRows @(30,70,22,25,30) 1 '')
}

$fullOutput=[System.IO.Path]::GetFullPath($OutputPath); [System.IO.Directory]::CreateDirectory([System.IO.Path]::GetDirectoryName($fullOutput))|Out-Null
$temp="$fullOutput.tmp"; if(Test-Path $temp){Remove-Item -LiteralPath $temp}
$stream=[System.IO.File]::Open($temp,[System.IO.FileMode]::CreateNew); $zip=[System.IO.Compression.ZipArchive]::new($stream,[System.IO.Compression.ZipArchiveMode]::Create)
try{foreach($name in $parts.Keys){$entry=$zip.CreateEntry($name,[System.IO.Compression.CompressionLevel]::Optimal);$writer=[System.IO.StreamWriter]::new($entry.Open(),$utf8);try{$writer.Write($parts[$name])}finally{$writer.Dispose()}}}finally{$zip.Dispose();$stream.Dispose()}
Move-Item -LiteralPath $temp -Destination $fullOutput -Force
Write-Output "Planilha criada: $fullOutput ($($tasks.Count) tarefas)"
