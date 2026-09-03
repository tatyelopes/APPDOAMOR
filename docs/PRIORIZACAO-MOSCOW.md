# Priorização de funcionalidades — MoSCoW

**Projeto:** App do Amor / Conectadois  
**Versão:** 1.0 — 2 de setembro de 2026  
**Horizonte:** MVP comercial / Release 1.0  
**Base:** PRD v0.9, visão, personas provisórias, pesquisa, concorrência, monetização e métricas.

## 1. Objetivo da priorização

Proteger a proposta essencial do produto:

> Casais se divertem, descobrem coisas novas um sobre o outro, criam mais intimidade e fortalecem a conexão.

O ciclo que a Release 1.0 precisa entregar é:

```text
conhecer a proposta
→ criar conta
→ convidar e parear
→ escolher uma experiência
→ os dois participarem
→ descobrir e conversar
→ concluir com conexão
→ querer retornar
→ assinar depois de perceber valor
```

Funcionalidades que não comprovam, protegem, medem ou monetizam esse ciclo não entram como obrigatórias.

## 2. Definições MoSCoW

- **Must have:** sem o item, a Release 1.0 não entrega sua proposta, não é segura ou não pode operar comercialmente.
- **Should have:** importante e de alto valor, mas existe alternativa temporária aceitável para o lançamento.
- **Could have:** desejável se houver capacidade depois de Must e Should estabilizados.
- **Won't have now:** explicitamente fora da Release 1.0; pode ser reavaliado com evidência futura.

MoSCoW não significa que todo Must precisa aparecer no primeiro protótipo. Significa que precisa estar aprovado antes do lançamento comercial.

## 3. Critérios de decisão

Cada funcionalidade foi avaliada por:

1. contribuição para diversão, descoberta, intimidade ou fortalecimento;
2. necessidade para ativação das duas pessoas;
3. frequência e recorrência esperadas;
4. redução de risco de privacidade, segurança ou coerção;
5. necessidade legal ou operacional para cobrar;
6. diferenciação frente aos concorrentes;
7. evidência disponível versus hipótese ainda não validada;
8. esforço, dependências e risco de atrasar o núcleo.

## 4. Must have — obrigatório na Release 1.0

### M01 — Onboarding centrado em diversão e descoberta

Explicar rapidamente que o casal vai jogar, descobrir e se aproximar. Não comunicar terapia, crise ou avaliação do relacionamento.

**Por que é Must:** define expectativa e influencia o aceite da pessoa convidada.  
**Aceite mínimo:** proposta compreensível, opção de criar conta ou entrar e linguagem inclusiva.

### M02 — Cadastro, login e segurança de conta

Conta individual com e-mail, senha protegida, verificação, recuperação, logout e expiração de sessão.

**Por que é Must:** respostas e vínculo são pessoais; compartilhamento de conta quebra privacidade.  
**Aceite mínimo:** fluxos completos e testados, proteção contra força bruta e enumeração.

### M03 — Criação do espaço e convite

Uma pessoa cria o espaço do casal e envia código ou link com mensagem leve.

**Por que é Must:** inicia o ciclo bilateral.  
**Aceite mínimo:** convite fácil de compartilhar, código válido e benefício claro para a pessoa convidada.

### M04 — Pareamento com consentimento

A segunda pessoa aceita explicitamente o vínculo; somente duas contas compõem o casal.

**Por que é Must:** sem a segunda pessoa não existe unidade de valor.  
**Aceite mínimo:** estados de espera, sucesso, código inválido/expirado e espaço já completo.

### M05 — Desvinculação individual e segura

Qualquer pessoa pode sair sem autorização da outra.

**Por que é Must:** autonomia e segurança relacional.  
**Aceite mínimo:** acesso futuro interrompido e destino do histórico explicado antes da confirmação.

### M06 — Home com momento principal

Apresentar uma experiência recomendada, retomada do que está pendente e acesso simples para explorar.

**Por que é Must:** reduz indecisão e leva rapidamente ao valor.  
**Aceite mínimo:** estado diferente para convite pendente, resposta pendente, revelação pronta e momento disponível.

### M07 — Catálogo estruturado de conteúdo

Perguntas e atividades armazenadas fora da interface, com objetivo, tema, profundidade, formato, duração, fase, status e cuidados.

**Por que é Must:** conteúdo é o produto; código fixo não permite operação editorial segura.  
**Aceite mínimo:** API serve somente conteúdo publicado e permite retirada sem nova versão do frontend.

### M08 — Perguntas em níveis de profundidade

Oferecer conteúdo leve, médio e profundo; conteúdo íntimo fica em fluxo opt-in.

**Por que é Must:** sustenta diversão na entrada e aprofundamento progressivo.  
**Aceite mínimo:** casal escolhe nível e pode pular sem justificativa.

### M09 — Resposta selada

Cada pessoa responde sem ver nem ser influenciada pela resposta da outra.

**Por que é Must:** é parte do núcleo e da diferenciação.  
**Aceite mínimo:** regra aplicada no servidor, inclusive contra chamada direta à API.

### M10 — Revelação mútua

As respostas aparecem somente depois da participação de ambas, com orientação para continuar a conversa.

**Por que é Must:** transforma duas respostas em descoberta compartilhada.  
**Aceite mínimo:** comportamento consistente nos dois dispositivos e nenhuma revelação unilateral.

### M11 — Jogo “eu respondo, você adivinha”

Uma pessoa registra uma preferência e a outra tenta prever, seguida de comparação e conversa.

**Por que é Must:** torna diversão e conhecimento mútuo visíveis já no MVP.  
**Aceite mínimo:** perguntas de baixo risco no início; placar nunca mede amor ou compatibilidade.

### M12 — Atividade “escolham juntos”

Cada pessoa seleciona opções em segredo e o app revela somente coincidências.

**Por que é Must:** gera descoberta e pode levar a uma experiência fora da tela.  
**Aceite mínimo:** ao menos um conjunto validado de escolhas e fechamento em intenção ou plano.

### M13 — Sessão com início, meio e fechamento

Cada experiência indica duração, progresso e conclusão, terminando em descoberta, continuação ou gesto.

**Por que é Must:** evita catálogo passivo e deixa claro o valor entregue.  
**Aceite mínimo:** sessão pode ser concluída ou pausada sem perda indevida.

### M14 — Controles de conteúdo e consentimento

Pular, pausar, evitar tema, aceitar conteúdo íntimo e ocultar conteúdo de notificações.

**Por que é Must:** profundidade não pode ser imposta.  
**Aceite mínimo:** conteúdo íntimo exige opt-in bilateral e escolha pode ser alterada.

### M15 — Gestão editorial mínima

Equipe autorizada cria, revisa, etiqueta, versiona, publica e retira atividades.

**Por que é Must:** o catálogo precisa evoluir com pesquisa e controle de risco.  
**Aceite mínimo:** autoria, versão, estado editorial, evidência de origem e revisão ficam registrados.

### M16 — Conteúdo inicial validado

Banco mínimo produzido a partir das entrevistas, testado com casais e revisado editorialmente.

**Por que é Must:** quantidade sem qualidade não entrega diferenciação.  
**Aceite mínimo sugerido:** 60 atividades — 30 leves, 20 médias e 10 profundas — distribuídas em pelo menos três formatos; volume final depende da pesquisa.

### M17 — Perfil e preferências essenciais

Nome, pronomes opcionais, fase da relação, temas de interesse/evitação e frequência desejada.

**Por que é Must:** inclusão e segurança exigem configuração mínima.  
**Aceite mínimo:** cada pessoa controla dados individuais; preferências bilaterais respeitam a escolha mais restritiva.

### M18 — Plano gratuito funcional

Permitir parear e concluir regularmente um ciclo real de descoberta.

**Por que é Must:** aquisição bilateral exige demonstração antes da cobrança.  
**Aceite mínimo:** segurança integral, uma experiência rotativa por dia e primeira jornada completa.

### M19 — Assinatura Premium por casal

Planos mensal e anual; uma compra libera as duas contas vinculadas.

**Por que é Must:** sustenta o modelo comercial.  
**Aceite mínimo:** teste, compra, restauração, renovação, cancelamento e reembolso transparentes.

### M20 — Analytics e painel administrativo

Medir North Star, aquisição, ativação, engajamento, retenção, monetização e segurança sem conteúdo íntimo.

**Por que é Must:** decisões do lançamento dependem de visibilidade do funil bilateral.  
**Aceite mínimo:** acesso protegido, eventos mínimos, agregação correta e usuário comum bloqueado.

### M21 — Privacidade, LGPD e termos

Política, termos, base legal, consentimentos, inventário, retenção, exclusão e canal de direitos.

**Por que é Must:** o produto trata dados pessoais e íntimos.  
**Aceite mínimo:** revisão jurídica, fluxos auditáveis e linguagem clara antes da cobrança.

### M22 — Infraestrutura segura de produção

PostgreSQL, HTTPS, segredos, backups, restauração, logs e ambientes separados.

**Por que é Must:** JSON local e configuração de protótipo não suportam produção.  
**Aceite mínimo:** migrações, backup restaurado em teste e nenhuma resposta íntima em logs.

### M23 — Autorização e isolamento entre casais

Toda operação valida pessoa, vínculo e permissão no servidor.

**Por que é Must:** falha expõe dados de outro casal.  
**Aceite mínimo:** suíte negativa demonstra isolamento e bloqueia enumeração de IDs.

### M24 — Estados, responsividade e acessibilidade essenciais

Tratar carregamento, vazio, erro, offline, celulares e uso assistivo.

**Por que é Must:** experiência de duas pessoas falha se uma não consegue concluir.  
**Aceite mínimo:** fluxos críticos em dispositivos-alvo, teclado, foco, contraste e leitor de tela.

### M25 — Suporte, exclusão e incidentes

Canal de suporte e procedimentos para conta, cobrança, conteúdo e segurança.

**Por que é Must:** operação comercial e dados íntimos exigem resposta humana.  
**Aceite mínimo:** responsáveis, prazos, escalonamento e comunicação definidos.

## 5. Should have — alta prioridade após os Must

### S01 — Teste educativo de formas de afeto

Escolhas forçadas para explorar como cada pessoa demonstra e prefere receber carinho, com nomenclatura e propriedade intelectual revisadas.

**Alternativa temporária:** atividades de preferências de carinho sem apresentar uma metodologia proprietária.

### S02 — Comparação consentida de resultados

Mostrar convergências e diferenças sem “gap”, desperdício ou nota de compatibilidade.

**Alternativa temporária:** cada pessoa vê o próprio resultado e escolhe o que compartilhar.

### S03 — Trilhas por objetivo

Coleções como “sair da rotina”, “conhecer melhor”, “mais intimidade” e “planos para o futuro”.

**Alternativa temporária:** filtros por tema e profundidade.

### S04 — Personalização por fase da relação

Recomendar atividades para relação recente, coabitação, filhos, distância, longa duração ou transição.

**Alternativa temporária:** escolha manual da coleção.

### S05 — Notificações neutras e configuráveis

Lembrar sem revelar conteúdo ou acusar a pessoa que não respondeu.

**Alternativa temporária:** retorno voluntário ao app e lembretes operacionais mínimos.

### S06 — Histórico do casal

Registrar atividades e descobertas que ambas escolheram preservar.

**Alternativa temporária:** histórico técnico limitado, sem interface de memória.

### S07 — Favoritos e “jogar depois”

Salvar atividades para outro momento.

**Alternativa temporária:** iniciar imediatamente ou encontrar novamente pelo catálogo.

### S08 — Feedback de conteúdo

Depois da sessão, registrar se foi divertida, aproximou, pareceu repetitiva ou causou desconforto.

**Alternativa temporária:** entrevistas e formulário do piloto.

### S09 — Convite por link profundo

Abrir o aplicativo diretamente no pareamento, além do código manual.

**Alternativa temporária:** copiar e inserir código.

### S10 — Acessibilidade ampliada

Redução de movimento, ajuste de texto, alternativas multimodais e testes com pessoas com deficiência.

**Alternativa temporária:** conformidade essencial nos fluxos críticos.

## 6. Could have — se houver capacidade

### C01 — Teste dos quatro temperamentos

Manter como experimental até revisão especializada. Não deve atrasar os jogos centrais.

### C02 — Streak opcional e não punitivo

Celebrar continuidade sem reiniciar progresso, expor ausência ou criar culpa.

### C03 — Sessões “Date Night”

Experiências temáticas de 15 a 30 minutos para jantar, viagem ou noite em casa.

### C04 — Nossa história

Comparação de memórias e perspectivas, com cuidado para não declarar uma versão “correta”.

### C05 — Memórias compartilhadas

Guardar apenas itens escolhidos explicitamente pelas duas pessoas.

### C06 — Áudio nas atividades

Alternativa a texto, com controles de privacidade e ambiente compartilhado.

### C07 — Modo offline parcial

Permitir consultar conteúdo previamente carregado e sincronizar depois, preservando a regra de revelação.

### C08 — Oferta de fundadores e presente

Preço inaugural ou assinatura-presente com consentimento e regras transparentes.

### C09 — Relatório privado mensal

Resumo de participação e temas, sem nota do relacionamento ou exposição de conteúdo.

### C10 — Widgets discretos

Atalhos e lembretes sem revelar tema íntimo na tela inicial.

## 7. Won't have now — fora da Release 1.0

### W01 — Multiplayer com outros casais

Amplia risco, moderação e escopo antes de validar a experiência a dois.

### W02 — IA gerando conteúdo personalizado diretamente

Exige consentimento, governança, avaliações e proteção de dados ainda não disponíveis.

### W03 — Terapeuta ou árbitro de IA

Incompatível com a proposta e de alto risco ético.

### W04 — Matriz 4×4 e índice de compatibilidade

Pode rotular, simplificar a relação e comunicar validade que ainda não existe.

### W05 — Diagnósticos psicológicos

O app é conexão e entretenimento, não avaliação clínica.

### W06 — Geolocalização e check-in

Não são necessários para o núcleo e podem facilitar vigilância.

### W07 — Provas obrigatórias de desafios

Foto, áudio ou confirmação do parceiro não serão exigidos para provar carinho.

### W08 — Acesso a mensagens, contatos ou gastos

Fora da finalidade e incompatível com minimização de dados.

### W09 — Ranking de casais ou de parceiros

Transforma conexão em comparação e pode gerar constrangimento.

### W10 — Streak punitivo, perda de nível ou cobrança automática

Retenção não será construída por culpa.

### W11 — Anúncios comportamentais

Conflitam com confiança, intimidade, foco da sessão e incentivos do produto.

### W12 — Marketplace de terapia, presentes ou encontros

Muda o modelo operacional e adiciona complexidade antes do product-market fit.

### W13 — Aplicativos nativos separados no primeiro lançamento

Priorizar web responsivo/PWA enquanto o núcleo é validado. Reavaliar distribuição nativa com dados de uso e conversão.

### W14 — Conteúdo para menores

Exige decisão jurídica, editorial e de segurança própria.

## 8. Resumo executivo da priorização

| Categoria | Quantidade | Papel no lançamento |
|---|---:|---|
| Must | 25 | Valor central, segurança, operação e monetização |
| Should | 10 | Personalização, recorrência e profundidade adicional |
| Could | 10 | Encantamento e expansão controlada |
| Won't now | 14 | Proteção contra dispersão e risco prematuro |

A quantidade de itens não equivale ao esforço. Os Must devem consumir aproximadamente 60%–70% da capacidade disponível; Should, 20%–30%; Could, no máximo 10%–15%. Se os Must excederem a capacidade, reduzir amplitude do catálogo e refinamentos, nunca segurança, pareamento, experiência mútua ou operação básica.

## 9. Sequência recomendada

### Bloco A — fundação segura

M02, M03, M04, M05, M07, M14, M21, M22 e M23.

### Bloco B — primeiro valor do casal

M01, M06, M08, M09, M10, M11, M12 e M13.

### Bloco C — conteúdo e validação

M15, M16, M17, M20, M24 e M25.

### Bloco D — comercialização

M18 e M19, depois de o piloto atingir critérios de segurança e ativação.

### Bloco E — retenção e personalização

Shoulds priorizados pelos dados do piloto; Coulds somente depois.

## 10. Cortes se houver atraso

Cortar nesta ordem:

1. todos os Could;
2. S10, S07, S06 e S09;
3. S02, S01 e S04, mantendo atividades equivalentes sem testes complexos;
4. reduzir quantidade de temas, preservando qualidade e três formatos centrais;
5. adiar monetização e lançar piloto fechado gratuito, se segurança e operação comercial ainda não estiverem prontas.

Nunca cortar para cumprir data:

- autorização e isolamento;
- desvinculação e consentimento;
- proteção de respostas;
- requisitos legais para comercialização;
- backup e recuperação;
- tratamento de erro nos fluxos críticos;
- revisão de conteúdo profundo ou íntimo.

## 11. Critérios para mover itens

### Should → Must

Mover somente se pesquisa ou piloto demonstrar que o item é necessário para ativação, retenção, segurança ou compra, e houver capacidade aprovada.

### Could → Should

Mover quando resolver uma necessidade recorrente de mais de um segmento e superar alternativas mais simples em teste.

### Won't → backlog ativo

Exigir nova evidência, revisão de risco, impacto no posicionamento, estimativa e decisão explícita de produto. Popularidade em concorrentes não é justificativa suficiente.

## 12. Questões que afetam a prioridade final

1. Qual formato gera mais descoberta observável nas entrevistas: selado, adivinhação ou coincidências?
2. Quantas atividades são suficientes para quatro semanas sem repetição percebida?
3. O teste de formas de afeto pode ser publicado com segurança jurídica e editorial?
4. A PWA atende notificações e comportamento esperado nos dispositivos prioritários?
5. Qual conteúdo gratuito maximiza pareamento sem eliminar motivação para Premium?
6. Quais requisitos as lojas impõem à assinatura no momento da distribuição?
7. Qual é a capacidade real da equipe e a data-alvo?

## 13. Decisão

A Release 1.0 será considerada protegida quando todos os Must estiverem concluídos e testados, os Should selecionados couberem na capacidade restante e nenhum Could ou Won't estiver bloqueando o ciclo central.

Esta priorização deve ser revisada depois das entrevistas, do protótipo dos formatos e do piloto. Mudanças devem registrar evidência, impacto, item removido e responsável pela decisão — adicionar prioridade sem retirar escopo não é priorização.
