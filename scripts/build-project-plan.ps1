param([string]$OutputPath = (Join-Path $PSScriptRoot '..\Plano de trabalho\acompanhamento-app-do-amor.xlsx'))

$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.IO.Compression
$utf8 = [System.Text.UTF8Encoding]::new($false)
$tasksCsv = @'
ID;Fase;Área;Tarefa;Entregável;Prioridade;Dependência;Responsável;Status;Estimativa (h);Início planejado;Fim planejado;Observações
1;Descoberta;Produto;Definir visão e proposta de valor;Documento de visão;Crítica;;;Concluído;4;;;Visão revisada com foco em conexão descoberta intimidade diversão e fortalecimento do relacionamento em docs/VISAO-E-PROPOSTA-DE-VALOR.md
2;Descoberta;Produto;Definir público-alvo e personas;Personas validadas;Alta;1;;Em andamento;8;;;Público e personas provisórias definidos em docs/PUBLICO-ALVO-E-PERSONAS.md, validação depende das entrevistas da tarefa 3
3;Descoberta;Pesquisa;Entrevistar casais do público-alvo;Relatório de entrevistas;Alta;2;;Em andamento;20;;;Protocolo e ficha disponíveis em Markdown e Word na pasta docs, pendentes recrutamento campo e síntese
4;Descoberta;Pesquisa;Mapear dores necessidades e hábitos;Mapa de oportunidades;Alta;3;;Concluído;8;;;Pesquisa consolidada em docs/PESQUISA-CASAIS-BRASILEIROS.md
5;Descoberta;Mercado;Analisar concorrentes diretos e indiretos;Análise competitiva;Média;1;;Concluído;8;;;Mapeamento consolidado em docs/ANALISE-CONCORRENTES.md com benchmark incluindo Lovify posicionamento e oportunidades
6;Descoberta;Negócio;Definir modelo de negócio e monetização;Modelo de receita;Alta;4,5;;Concluído;8;;;Freemium B2C e assinatura por casal definidos em docs/MODELO-DE-NEGOCIO-E-MONETIZACAO.md com preços unit economics e experimentos
7;Descoberta;Produto;Definir métricas de sucesso e North Star;Árvore de métricas;Alta;1;;Concluído;5;;;North Star árvore de métricas metas e governança documentadas em docs/METRICAS-DE-SUCESSO.md
8;Planejamento;Produto;Consolidar PRD do produto;PRD aprovado;Crítica;2,4,6,7;;Em andamento;16;;;PRD v0.9 consolidado em Markdown e Word, pendente validação das personas priorização final e aprovação
9;Planejamento;Produto;Priorizar funcionalidades pelo método MoSCoW;Escopo priorizado;Crítica;8;;Concluído;6;;;Priorização da Release 1.0 consolidada em docs/PRIORIZACAO-MOSCOW.md e Word com Must Should Could Won't critérios e cortes
10;Planejamento;Produto;Definir escopo do MVP;Backlog do MVP;Crítica;9;;Concluído;6;;;MVP piloto PWA de 6 semanas com 40 a 60 casais, três mecânicas e backlog de 38 itens consolidado em docs/ESCOPO-MVP.md e Word
11;Planejamento;Gestão;Definir cronograma marcos e cadência;Roadmap de execução;Alta;10;;Concluído;6;07/09/2026;05/03/2027;Linha de base com fases marcos cadência caminho crítico e riscos em docs/CRONOGRAMA-MARCOS-E-CADENCIA.md e Word
12;Planejamento;Gestão;Definir responsáveis e matriz RACI;Matriz RACI;Média;11;Product Owner — Tatyele Lopes;Concluído;4;;;Papéis autoridade matriz RACI e responsáveis das 107 tarefas consolidados em docs/RESPONSAVEIS-E-MATRIZ-RACI.md e Word
13;Planejamento;Gestão;Configurar gestão de backlog e cerimônias;Quadro operacional;Alta;11,12;Product Owner — Tatyele Lopes;Concluído;4;;;Kanban com ciclos quinzenais fluxo WIP DoR DoD RICE cerimônias e métricas configurados em docs/GESTAO-DE-BACKLOG-E-CERIMONIAS.md e na aba Governança Backlog
14;Marca;Branding;Validar nome Conectadois e alternativas;Decisão de naming;Alta;1;;Não iniciado;8;;;
15;Marca;Jurídico;Pesquisar disponibilidade no INPI;Parecer preliminar;Alta;14;;Não iniciado;4;;;
16;Marca;Branding;Registrar domínio e perfis sociais;Ativos digitais reservados;Alta;14;;Não iniciado;3;;;
17;Marca;Branding;Definir posicionamento tom de voz e slogan;Guia verbal;Média;14;Product Designer;Concluído;8;;;Posicionamento plataforma de mensagens tom de voz vocabulário aplicações e sistema de slogans consolidados em docs/POSICIONAMENTO-TOM-DE-VOZ-E-SLOGAN.md e Word; validar com casais e revisar se o naming mudar
18;Marca;Design;Consolidar logotipo paleta e tipografia;Identidade visual;Alta;14,17;Product Designer;Concluído;16;;;Identidade revisada conforme decisão da fundadora: símbolo 3D original da pasta Identidade visual restaurado no app e wordmark conectadois com dois em dourado; guia Word e preview horizontal atualizados
19;UX/UI;Pesquisa;Mapear jornada completa do casal;Mapa de jornada;Alta;8;Pesquisa e Conteúdo;Concluído;10;;;Jornada bilateral em 15 etapas consolidada em docs/JORNADA-COMPLETA-DO-CASAL.md e Word com trilhas de iniciador e convidado emoções fricções métricas blueprint exceções e oportunidades; hipóteses pendentes de validação nas entrevistas
20;UX/UI;Arquitetura;Criar arquitetura de informação;Mapa de navegação;Alta;19;;Não iniciado;8;;;
21;UX/UI;UX;Desenhar fluxo de onboarding;Fluxo validado;Crítica;20;;Em andamento;6;;;
22;UX/UI;UX;Desenhar cadastro login e recuperação;Fluxo validado;Crítica;20;;Em andamento;8;;;
23;UX/UI;UX;Desenhar pareamento e convite do casal;Fluxo validado;Crítica;20;;Em andamento;8;;;
24;UX/UI;UX;Desenhar home e rotina diária;Fluxo validado;Alta;20;;Não iniciado;8;;;
25;UX/UI;UX;Desenhar perguntas e revelação mútua;Fluxo validado;Alta;20;;Não iniciado;10;;;
26;UX/UI;UX;Desenhar testes e resultados;Fluxo validado;Alta;20;;Não iniciado;10;;;
27;UX/UI;Design;Criar wireframes mobile-first;Wireframes completos;Alta;21-26;;Não iniciado;20;;;
28;UX/UI;Design;Criar design system e tokens;Biblioteca visual;Alta;18,27;;Não iniciado;20;;;
29;UX/UI;Design;Produzir protótipo de alta fidelidade;Protótipo navegável;Alta;27,28;;Não iniciado;30;;;
30;UX/UI;Pesquisa;Executar teste de usabilidade;Relatório de usabilidade;Alta;29;;Não iniciado;16;;;
31;UX/UI;Design;Aplicar melhorias do teste;Protótipo aprovado;Alta;30;;Não iniciado;12;;;
32;Arquitetura;Engenharia;Definir arquitetura frontend e backend;Documento de arquitetura;Crítica;10;;Concluído;8;;;
33;Arquitetura;Engenharia;Definir padrão de pastas e dependências;Convenções documentadas;Alta;32;;Concluído;5;;;
34;Arquitetura;Dados;Modelar usuários casais sessões respostas e progresso;Modelo de dados;Crítica;32;;Não iniciado;12;;;
35;Arquitetura;API;Definir contrato e versionamento da API;Especificação OpenAPI;Alta;34;;Não iniciado;12;;;
36;Arquitetura;Segurança;Realizar modelagem de ameaças;Threat model;Crítica;34,35;;Não iniciado;12;;;
37;Arquitetura;Privacidade;Mapear dados pessoais e base legal LGPD;Inventário de dados;Crítica;34;;Não iniciado;12;;;
38;Infraestrutura;DevOps;Definir ambientes local homologação produção;Estratégia de ambientes;Alta;32;;Não iniciado;6;;;
39;Infraestrutura;DevOps;Configurar lint formatação e hooks;Qualidade automatizada;Alta;33;;Não iniciado;6;;;
40;Infraestrutura;DevOps;Configurar pipeline de CI;Pipeline funcional;Alta;39;;Não iniciado;10;;;
41;Infraestrutura;DevOps;Provisionar banco PostgreSQL;Banco por ambiente;Crítica;34,38;;Não iniciado;10;;;
42;Infraestrutura;DevOps;Configurar gestão segura de segredos;Cofre de segredos;Crítica;38;;Não iniciado;6;;;
43;Infraestrutura;Observabilidade;Configurar logs métricas e alertas;Observabilidade básica;Alta;38;;Não iniciado;12;;;
44;Backend;Autenticação;Implementar cadastro de usuário;Endpoint testado;Crítica;34,35;;Em andamento;12;;;
45;Backend;Autenticação;Implementar login logout e sessões;Endpoints testados;Crítica;44;;Em andamento;12;;;
46;Backend;Autenticação;Implementar recuperação e troca de senha;Fluxo seguro;Alta;45;;Não iniciado;12;;;
47;Backend;Autenticação;Implementar verificação de e-mail;Fluxo de confirmação;Alta;44;;Não iniciado;10;;;
48;Backend;Casal;Implementar criação de casal e código;Endpoint testado;Crítica;44;;Em andamento;10;;;
49;Backend;Casal;Implementar entrada e validação de convite;Endpoint testado;Crítica;48;;Em andamento;10;;;
50;Backend;Casal;Implementar desfazer vínculo com segurança;Endpoint auditável;Alta;49;;Não iniciado;10;;;
51;Backend;Perfil;Implementar perfil e preferências;Endpoints testados;Média;44;;Não iniciado;10;;;
52;Backend;Conteúdo;Modelar e servir perguntas e categorias;API de conteúdo;Alta;35,41;;Não iniciado;12;;;
53;Backend;Respostas;Implementar respostas privadas;API testada;Crítica;49,52;;Em andamento;16;;;
54;Backend;Respostas;Garantir revelação somente após ambos responderem;Regra testada;Crítica;53;;Em andamento;12;;;
55;Backend;Progresso;Implementar streak histórico e conquistas;API de progresso;Média;49;;Não iniciado;16;;;
56;Backend;Testes;Implementar linguagens do amor e resultado;Serviço de avaliação;Alta;49;;Não iniciado;16;;;
57;Backend;Testes;Implementar temperamentos e resultado;Serviço de avaliação;Alta;49;;Não iniciado;16;;;
58;Backend;Notificações;Implementar preferências e notificações;Serviço de notificações;Média;49;;Não iniciado;20;;;
59;Backend;Admin;Criar gestão segura de conteúdo;Painel ou API administrativa;Baixa;52;;Não iniciado;24;;;
60;Frontend;Base;Implementar bootstrap tema e navegação;Base da aplicação;Crítica;28,32;;Em andamento;14;;;
61;Frontend;Onboarding;Implementar onboarding responsivo;Tela funcional;Crítica;21,28;;Concluído;12;;;
62;Frontend;Autenticação;Implementar cadastro e login;Telas integradas;Crítica;22,44,45;;Em andamento;16;;;
63;Frontend;Casal;Implementar criação entrada e espera do pareamento;Fluxo integrado;Crítica;23,48,49;;Concluído;18;;;
64;Frontend;Perfil;Implementar perfil conta e preferências;Tela integrada;Alta;51;;Em andamento;12;;;
65;Frontend;Home;Implementar home personalizada;Tela integrada;Alta;24,55;;Em andamento;20;;;
66;Frontend;Perguntas;Implementar perguntas por nível;Experiência integrada;Alta;25,52;;Em andamento;16;;;
67;Frontend;Respostas;Implementar resposta privada e espera;Experiência integrada;Crítica;53,54;;Em andamento;18;;;
68;Frontend;Respostas;Implementar tela de revelação mútua;Experiência integrada;Crítica;54,67;;Em andamento;12;;;
69;Frontend;Testes;Implementar teste de linguagens do amor;Experiência integrada;Alta;26,56;;Em andamento;18;;;
70;Frontend;Testes;Implementar teste de temperamentos;Experiência integrada;Alta;26,57;;Em andamento;20;;;
71;Frontend;Progresso;Implementar streak histórico e conquistas;Experiência integrada;Média;55,65;;Não iniciado;18;;;
72;Frontend;Notificações;Implementar central e preferências;Experiência integrada;Média;58;;Não iniciado;16;;;
73;Frontend;Estados;Implementar loading vazio erro e offline;Estados consistentes;Alta;60-72;;Não iniciado;16;;;
74;Frontend;Acessibilidade;Aplicar WCAG foco teclado contraste e leitores;Auditoria aprovada;Alta;60-73;;Não iniciado;20;;;
75;Frontend;Responsividade;Validar celulares tablets e desktop;Matriz responsiva;Alta;60-74;;Não iniciado;16;;;
76;Conteúdo;Editorial;Revisar textos linguagem inclusiva e tom;Conteúdo aprovado;Alta;17,60-72;;Não iniciado;12;;;
77;Conteúdo;Especialista;Validar perguntas e recomendações com especialista;Parecer de conteúdo;Crítica;52,56,57;;Não iniciado;20;;;
78;Qualidade;Testes;Definir estratégia e critérios de aceite;Plano de testes;Crítica;10,35;;Não iniciado;8;;;
79;Qualidade;Backend;Criar testes unitários dos serviços;Suíte automatizada;Alta;44-59,78;;Não iniciado;30;;;
80;Qualidade;Frontend;Criar testes de componentes e hooks;Suíte automatizada;Alta;60-75,78;;Não iniciado;30;;;
81;Qualidade;Integração;Criar testes de integração da API;Suíte automatizada;Crítica;44-59,78;;Não iniciado;24;;;
82;Qualidade;E2E;Automatizar cadastro pareamento e revelação;Fluxos E2E;Crítica;61-70,78;;Não iniciado;32;;;
83;Qualidade;Segurança;Executar análise de dependências e vulnerabilidades;Relatório corrigido;Crítica;36,40;;Não iniciado;12;;;
84;Qualidade;Segurança;Testar autorização e isolamento entre casais;Relatório corrigido;Crítica;49,53,54;;Não iniciado;20;;;
85;Qualidade;Performance;Medir Core Web Vitals e API;Relatório de performance;Alta;73,75;;Não iniciado;12;;;
86;Qualidade;Compatibilidade;Testar navegadores e dispositivos reais;Matriz aprovada;Alta;75;;Não iniciado;16;;;
87;Qualidade;Produto;Executar QA exploratório completo;Relatório de QA;Crítica;79-86;;Não iniciado;24;;;
88;Jurídico;Privacidade;Redigir política de privacidade;Documento publicado;Crítica;37;;Não iniciado;16;;;
89;Jurídico;Termos;Redigir termos de uso;Documento publicado;Crítica;6,37;;Não iniciado;16;;;
90;Jurídico;Privacidade;Implementar consentimentos e direitos LGPD;Fluxos auditáveis;Crítica;37,88;;Não iniciado;20;;;
91;Jurídico;Operação;Definir canal de suporte e exclusão de conta;Processo operacional;Alta;50,90;;Não iniciado;8;;;
92;Lançamento;DevOps;Configurar domínio DNS HTTPS e produção;Ambiente publicado;Crítica;16,38,42;;Não iniciado;12;;;
93;Lançamento;Dados;Executar migrações e backup inicial;Banco pronto;Crítica;41,92;;Não iniciado;8;;;
94;Lançamento;Produto;Preparar landing page e materiais;Página de lançamento;Alta;17,18;;Não iniciado;20;;;
95;Lançamento;Operação;Preparar FAQ suporte e incidentes;Playbook operacional;Alta;91;;Não iniciado;12;;;
96;Lançamento;Homologação;Executar UAT com grupo piloto;Aceite do produto;Crítica;87,90,92-95;;Não iniciado;24;;;
97;Lançamento;Produto;Corrigir bloqueadores do piloto;Release candidate;Crítica;96;;Não iniciado;30;;;
98;Lançamento;Gestão;Realizar checklist go/no-go;Decisão documentada;Crítica;97;;Não iniciado;4;;;
99;Lançamento;DevOps;Publicar versão de produção;Release 1.0;Crítica;98;;Não iniciado;6;;;
100;Pós-lançamento;Operação;Monitorar erros segurança e disponibilidade;Relatório da primeira semana;Crítica;99;;Não iniciado;20;;;
101;Pós-lançamento;Produto;Analisar ativação retenção e pareamento;Dashboard de métricas;Alta;7,99;;Não iniciado;12;;;
102;Pós-lançamento;Pesquisa;Coletar feedback e entrevistas;Relatório pós-lançamento;Alta;99;;Não iniciado;20;;;
103;Pós-lançamento;Produto;Priorizar melhorias e roadmap V2;Roadmap V2;Alta;100-102;;Não iniciado;10;;;
104;Pós-lançamento;Engenharia;Planejar escalabilidade e custos;Plano de capacidade;Média;100,101;;Não iniciado;10;;;
105;Pós-lançamento;Gestão;Realizar retrospectiva do projeto;Lições aprendidas;Média;100-103;;Não iniciado;5;;;
106;Backend;Analytics;Instrumentar eventos e agregação de métricas;API administrativa de métricas;Crítica;7,34,35;;Concluído;20;;;Eventos sem conteúdo íntimo e endpoint protegido implementados em server/src/analytics.js
107;Frontend;Administração;Criar painel administrativo de métricas;Dashboard administrativo;Alta;106;;Concluído;18;;;Painel de North Star aquisição ativação engajamento retenção monetização e segurança implementado
'@

$tasks = $tasksCsv | ConvertFrom-Csv -Delimiter ';'
$lastPlanRow = $tasks.Count + 1
$phaseOwners = @{
  'Descoberta'='Product Owner'; 'Planejamento'='Product Owner'; 'Marca'='Product Designer'; 'UX/UI'='Product Designer'
  'Arquitetura'='Liderança Técnica'; 'Infraestrutura'='DevOps/Plataforma'; 'Backend'='Engenharia Backend'
  'Frontend'='Engenharia Frontend'; 'Conteúdo'='Pesquisa e Conteúdo'; 'Qualidade'='Qualidade'
  'Jurídico'='Privacidade/Jurídico'; 'Lançamento'='Growth e Operações'; 'Pós-lançamento'='Product Owner'
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
$phases = @('Descoberta','Planejamento','Marca','UX/UI','Arquitetura','Infraestrutura','Backend','Frontend','Conteúdo','Qualidade','Jurídico','Lançamento','Pós-lançamento')
$milestones = @(
  @('MC1','Baseline aprovada','13','Em andamento','PRD, escopo, MoSCoW, papéis e pesquisa aprovados','18/09/2026'),
  @('MC2','Personas e oportunidades validadas','4','Em andamento','24 entrevistas analisadas e personas revisadas','02/10/2026'),
  @('MC3','Mecânicas e padrão editorial aprovados','31','Não iniciado','Três protótipos testados e primeiro lote revisado','16/10/2026'),
  @('MC4','Fundação técnica pronta','43','Em andamento','PostgreSQL, ambientes, CI, backup e segurança-base','23/10/2026'),
  @('MC5','MVP feature-complete','75','Em andamento','Jornada completa em dois dispositivos e painel funcional','20/11/2026'),
  @('MC6','Conteúdo do piloto aprovado','77','Não iniciado','60 atividades com rastreabilidade, teste e revisão','27/11/2026'),
  @('MC7','Release candidate','96','Não iniciado','QA, segurança, acessibilidade, LGPD e UAT sem bloqueador','18/12/2026'),
  @('MC8','Go/no-go do piloto','98','Não iniciado','Coorte, suporte, métricas e release confirmados','08/01/2027'),
  @('MC9','Piloto concluído','102','Não iniciado','Seis semanas de uso, dados íntegros e entrevistas agendadas','19/02/2027'),
  @('MC10','Decisão do MVP comercial','103','Não iniciado','Relatório do piloto e recomendação aprovados','05/03/2027')
)
$risks = @(
  @('R01','Privacidade de respostas íntimas','Segurança','Alta','Crítico','Criptografia, autorização por casal e testes de isolamento','','Aberto'),
  @('R02','Baixa adesão do parceiro','Produto','Alta','Alto','Simplificar convite, lembretes e medir conversão do pareamento','','Aberto'),
  @('R03','Conteúdo percebido como diagnóstico','Conteúdo','Média','Alto','Revisão por especialista e avisos claros de caráter educativo','','Aberto'),
  @('R04','Vazamento de credenciais ou sessões','Segurança','Média','Crítico','Hash forte, expiração, rotação e gestão de segredos','','Aberto'),
  @('R05','Atraso por escopo excessivo','Gestão','Alta','Alto','Proteger MVP, controlar mudanças e revisar prioridades semanalmente','','Aberto'),
  @('R06','Dependência do armazenamento JSON','Tecnologia','Alta','Alto','Migrar para PostgreSQL antes da publicação','','Aberto'),
  @('R07','Não conformidade com LGPD','Jurídico','Média','Crítico','Inventário de dados, consentimento, exclusão e revisão jurídica','','Aberto'),
  @('R08','Problemas de desempenho em mobile','Tecnologia','Média','Médio','Orçamento de performance, imagens otimizadas e testes em aparelhos reais','','Aberto'),
  @('R09','Capacidade da equipe abaixo da premissa','Gestão','Alta','Alto','Confirmar responsáveis e horas, recalcular datas ou reduzir amplitude antes do ciclo','','Aberto'),
  @('R10','Recesso e recrutamento atrasam o piloto','Gestão','Média','Alto','Antecipar UAT, congelar escopo em dezembro e manter recrutamento contínuo','','Aberto')
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
  @('PLANO DE ACOMPANHAMENTO — APP DO AMOR','',''),
  @('Atualizado em',(Get-Date -Format 'dd/MM/yyyy HH:mm'),''),
  @('Indicador','Valor','Leitura'),
  @('Total de tarefas',@{v=0;s=2;f="COUNTA('Plano Mestre'!A2:A$lastPlanRow)"},'escopo completo'),
  @('Tarefas concluídas',@{v=0;s=2;f="COUNTIF('Plano Mestre'!I2:I$lastPlanRow,`"Concluído`")"},'entregas finalizadas'),
  @('Em andamento',@{v=0;s=2;f="COUNTIF('Plano Mestre'!I2:I$lastPlanRow,`"Em andamento`")"},'trabalho ativo'),
  @('Não iniciadas',@{v=0;s=2;f="COUNTIF('Plano Mestre'!I2:I$lastPlanRow,`"Não iniciado`")"},'fila restante'),
  @('Progresso geral',@{v=0;s=3;f="AVERAGE('Plano Mestre'!M2:M$lastPlanRow)"},'baseado no status'),
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
  @('Análise','Descartar, pesquisar ou detalhar','5','Não iniciado','PO/TL'),
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
