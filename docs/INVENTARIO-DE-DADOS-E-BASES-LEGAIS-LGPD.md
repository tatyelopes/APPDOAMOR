# Inventário de dados pessoais e bases legais — Conectadois

Versão 1.0 · 05/09/2026 · Entrega da tarefa 37.

Este documento registra as operações de tratamento conhecidas no produto atual e no modelo planejado, associa finalidade, necessidade, base legal, acesso, compartilhamento e retenção, e transforma as lacunas em decisões verificáveis. É um artefato operacional de privacidade desde a concepção. A aprovação jurídica, a identificação formal do controlador e a implementação dos controles continuam obrigatórias antes de um piloto externo.

O inventário parte do código e dos documentos existentes em 05/09/2026 e foi atualizado em 16/09/2026 com o feedback centralizado do MPV. Hoje o protótipo usa JSON no servidor, guarda respostas, eventos e feedbacks sem criptografia de campo, mantém tokens de sessão em texto no servidor e no `localStorage`, e persiste localmente respostas do teste de temperamento. O modelo alvo prevê PostgreSQL, hashes de tokens, isolamento por casal e respostas bilaterais. O inventário distingue esse estado atual do tratamento planejado; ele não declara conformidade da implementação.

## Decisões de enquadramento

1. O serviço é destinado a adultos. Crianças e adolescentes ficam fora do escopo até existir uma decisão específica, verificação de idade proporcional ao risco e avaliação do melhor interesse. A tela de entrada deve obter declaração de maioridade e impedir o cadastro quando a pessoa informar idade inferior a 18 anos.
2. Respostas livres, escolhas, temas evitados e resultados de testes podem revelar saúde, religião, opinião política, vida sexual ou outros dados sensíveis. Eles recebem a classificação conservadora de **potencialmente sensível**, ainda que determinada resposta concreta não revele uma categoria do artigo 5º, II.
3. O parceiro é destinatário de respostas apenas na revelação bilateral informada. Uma pessoa não concede, revoga nem substitui o consentimento da outra.
4. Identificadores pseudônimos continuam sendo dados pessoais. Métricas só deixam o escopo da LGPD quando a anonimização for efetiva e a reidentificação não for razoavelmente reversível.
5. Consentimento não será agrupado nos termos de uso. Cada finalidade opcional ou sensível terá ação afirmativa, texto destacado, versão, data, prova e revogação tão simples quanto a concessão.
6. O legítimo interesse só será usado após teste documentado de finalidade, necessidade, balanceamento e salvaguardas. Ele não é base para tratar conteúdo sensível.
7. Obrigação legal e exercício regular de direitos só serão usados quando houver obrigação, processo ou necessidade probatória concreta. Não justificam retenção genérica e indefinida.

## Papéis e titulares

| Elemento | Definição operacional | Situação em 05/09/2026 |
| --- | --- | --- |
| Controlador | Pessoa jurídica que decidirá finalidades e elementos essenciais do Conectadois | **A formalizar** antes do piloto; não inferir a partir do nome da autora ou do repositório |
| Encarregado e canal | Canal entre titulares, controlador e ANPD | **A designar e publicar**; tarefa 91 |
| Operadores | Hospedagem, banco, e-mail, notificações, monitoramento, backup e suporte que tratarem dados por instrução | Fornecedores ainda não selecionados; contratar com instruções, confidencialidade, segurança, suboperadores, retorno e eliminação |
| Destinatário independente | Parceiro do titular, limitado à revelação que integra a experiência | Precisa de aviso claro, controle bilateral e bloqueio imediato após desvinculação |
| Titulares principais | Usuários com conta e seus parceiros | Mapeados abaixo |
| Outros titulares | Participantes de pesquisa, solicitantes de suporte e pessoas citadas em texto livre | Minimizar; orientar o usuário a não inserir dados de terceiros; separar pesquisa e suporte do produto |
| Equipe autorizada | Operação, suporte, segurança e administração | Acesso por função, menor privilégio, MFA, justificativa e trilha sem conteúdo íntimo |

## Grupos de dados

| ID | Dados e exemplos | Classificação | Origem | Sistemas atuais ou previstos |
| --- | --- | --- | --- | --- |
| DG-01 | Nome, UUID e estado da conta | Pessoal comum | Titular e servidor | `users`, API, JSON atual e PostgreSQL previsto |
| DG-02 | E-mail e dados de contato | Pessoal comum | Titular | `users`, autenticação, futuro e-mail e suporte |
| DG-03 | Hash e salt de senha, token de sessão, datas de expiração e revogação | Credencial de alto impacto | Titular e servidor | `users`, `sessions`, `auth_sessions`, navegador |
| DG-04 | Identificador do casal, membros, posição, entrada, saída e estado do vínculo | Pessoal relacional | Titulares e servidor | `couples`, `couple_members` |
| DG-05 | Código ou hash de convite, emissão, expiração, consumo e tentativas | Segredo temporário e metadado pessoal | Servidor e usuário convidante | API, banco e logs mínimos |
| DG-06 | Aniversário do casal, fuso e datas de pareamento | Pessoal relacional | Titulares e dispositivo | `couples`, sessões de jogo |
| DG-07 | Partida, rodada, tema, tipo, versão do conteúdo, status e horários | Pessoal comportamental | Uso e servidor | `game_sessions`, `session_rounds` |
| DG-08 | Resposta livre, alternativa, confirmação de desafio e momento de envio | **Potencialmente sensível** | Titular | `answers`, JSON atual e banco previsto |
| DG-09 | Respostas e resultados de linguagens do amor | Pessoal inferido e **potencialmente sensível** | Titular e algoritmo local | Memória do navegador; persistência futura só mediante decisão |
| DG-10 | Respostas, percentuais e resultado de temperamento | Pessoal inferido e **potencialmente sensível** | Titular e algoritmo local | `localStorage` atual; persistência remota não aprovada |
| DG-11 | Temas escolhidos, temas evitados e preferências de conteúdo | Pessoal inferido e **potencialmente sensível** | Titular e uso | Navegador e futura configuração do casal |
| DG-12 | Rodadas concluídas, desafios, dias ativos, sequência e conquistas | Pessoal comportamental | Servidor e uso | `progress_events`, `couple_progress`, `localStorage` atual |
| DG-13 | IP, user-agent, dispositivo, timestamps, falhas, autenticação e eventos de segurança | Pessoal técnico | Rede, dispositivo e servidor | Logs e monitoramento previstos |
| DG-14 | Eventos de produto, IDs de usuário e casal, origem, modo e propriedades permitidas | Pessoal de uso; alto risco se correlacionado | Cliente e servidor | `analyticsEvents` atual e analytics previsto |
| DG-15 | Mensagens de suporte, pedidos e resposta ao exercício de direitos | Pessoal comum e conteúdo possivelmente sensível | Titular e equipe | Canal a definir e registro restrito |
| DG-16 | Versão de aviso e consentimento, aceite, recusa, revogação e prova de atendimento | Pessoal de conformidade | Titular e servidor | Registro auditável previsto |
| DG-17 | Gravação, notas, transcrição e perfil de recrutamento de pesquisa | Pessoal e possivelmente sensível | Participante e pesquisador | Repositório de pesquisa separado, a definir |
| DG-18 | Três sinais do MPV, sugestão opcional, jogo, identificador idempotente e horário | Anônimo por desenho, mas texto livre pode conter dado pessoal ou sensível inserido indevidamente | Participante e servidor | `mpvFeedback` no JSON controlado; exportação CSV restrita |

## Registro das operações de tratamento

“Status” descreve o produto em 05/09/2026. “Base proposta” exige validação jurídica pelo controlador antes de produção.

| ID | Operação, dados e titulares | Finalidade e necessidade | Base legal proposta | Acesso ou compartilhamento | Retenção e descarte | Status |
| --- | --- | --- | --- | --- | --- | --- |
| OP-01 | Onboarding e preferências iniciais; DG-01 e opções mínimas; usuário | Configurar a experiência solicitada e registrar conclusão | Art. 7º, V, execução de contrato ou procedimento a pedido do titular | Próprio usuário; equipe apenas em agregado | Durante a conta; preferências removidas na exclusão | Parcial: conclusão fica no navegador |
| OP-02 | Cadastro, login e conta; DG-01 a DG-03; usuário | Criar conta, autenticar e manter acesso | Art. 7º, V | Autenticação e suporte restrito; operador de infraestrutura futuro | Conta ativa; credenciais revogadas no logout ou exclusão; prazos em RT-01 e RT-02 | Implementado com riscos técnicos abertos |
| OP-03 | Sessão, prevenção a abuso e segurança; DG-03, DG-05 e DG-13; usuários e atacantes identificáveis | Proteger contas, serviço e titulares, investigar falhas | Art. 7º, IX, após LIA-01; Art. 11, II, g, somente quando estritamente necessário à prevenção à fraude e segurança do titular | Segurança e infraestrutura; autoridade apenas por dever válido | RT-02 e RT-09; minimizar IP e nunca registrar resposta, senha ou token | Parcial; falta LIA, rate limit e logs seguros |
| OP-04 | Criação e envio de convite; DG-04 e DG-05; usuário e convidado | Formar o casal a pedido do usuário | Art. 7º, V | Remetente e destinatário escolhido; provedor de mensagem somente se contratado | Até consumo ou 72 horas por padrão, máximo de 7 dias; depois apagar hash; RT-03 | Implementado de forma insegura; correção obrigatória |
| OP-05 | Aceite do convite e vínculo; DG-01, DG-04 e DG-05; duas pessoas | Associar exatamente duas contas e controlar acesso | Art. 7º, V | Dois membros veem identidade mínima e estado do vínculo | Enquanto o vínculo estiver ativo; saída e exclusão em OP-19 e DEC-04 | Implementado parcialmente |
| OP-06 | Aniversário e fuso; DG-06; casal | Personalizar datas, sequências e lembretes solicitados | Art. 7º, V; aniversário deve ser opcional se não for necessário | Dois membros; serviço de notificação futuro recebe apenas o mínimo | Enquanto a função estiver ativa ou até correção ou exclusão | Implementado parcialmente |
| OP-07 | Criação e execução de partidas; DG-04 e DG-07; casal | Entregar perguntas, desafios e retomada do jogo | Art. 7º, V | Dois membros; backend autorizado por casal | RT-04; snapshots sem resposta seguem a partida | Planejado no modelo alvo; local no protótipo |
| OP-08 | Guardar e revelar respostas bilaterais; DG-08; dois membros | Permitir resposta privada e revelação somente após as duas submissões | Art. 11, I, consentimento específico e destacado para dado potencialmente sensível; Art. 7º, I, se a resposta for apenas dado comum | Autor durante espera; parceiro após condição bilateral; operadores estritamente necessários; equipe sem acesso rotineiro | RT-05; cifrar; encerrar acesso na desvinculação; política compartilhada em DEC-04 | Implementado no JSON sem controles suficientes; bloqueia piloto |
| OP-09 | Desafios e progresso mútuo; DG-07 e DG-12; casal | Registrar participação e fornecer histórico e sequência | Art. 7º, V | Dois membros; métricas apenas agregadas | RT-06; evento não contém texto ou alternativa | Local e remoto parcial; fonte confiável planejada |
| OP-10 | Teste e inferência de linguagens do amor; DG-09; usuário | Gerar resultado educativo solicitado | Art. 11, I, quando respostas ou inferência puderem revelar dado sensível; Art. 7º, I, nos demais casos | Próprio titular por padrão; parceiro somente por compartilhamento granular | Processar em memória por padrão; persistir só com consentimento separado; RT-07 | Executado em memória; consentimento e aviso ausentes |
| OP-11 | Teste e inferência de temperamento; DG-10; usuário | Gerar resultado educativo solicitado | Art. 11, I, quando respostas ou inferência puderem revelar dado sensível; Art. 7º, I, nos demais casos | Próprio titular por padrão; parceiro somente por compartilhamento granular | Sessão por padrão; `localStorage` atual deve ser removido ou submetido a consentimento e RT-07 | Implementado localmente sem consentimento |
| OP-12 | Seleção e exclusão de temas; DG-11; usuário ou casal | Evitar conteúdo indesejado e montar partida | Art. 11, I, para preferência que revele dado sensível; Art. 7º, V, para seleção comum necessária à sessão | Backend recebe chaves mínimas; parceiro não vê a causa da exclusão | Preferência de sessão por padrão; persistência opcional conforme RT-07 | Planejado; exige desenho de privacidade |
| OP-13 | Telemetria essencial de produto; DG-12 a DG-14; usuários | Medir funcionamento, funil e qualidade sem conteúdo íntimo | Art. 7º, IX, somente após LIA-02; consentimento do art. 7º, I, para analytics não essencial | Produto e dados por função; operador contratado; nenhuma venda | RT-08; agregar cedo; eliminar IDs e propriedades livres | Implementado com IDs e eventos confiados ao cliente; bloqueia piloto |
| OP-14 | Dashboard e métricas administrativas; DG-14; usuários | Operar o piloto e avaliar resultados | Art. 7º, IX, enquanto houver dado pessoal e LIA-02 aprovado; dado efetivamente anônimo fica fora do escopo pessoal | Administradores autorizados; saída preferencialmente agregada | Agregados anônimos conforme finalidade; dados fonte seguem RT-08 | Parcial; controle administrativo e origem das métricas pendentes |
| OP-15 | Mensagens transacionais e notificações; DG-01, DG-02, DG-04 e DG-07; usuários | Verificação, recuperação, convite e lembrete solicitado | Art. 7º, V; Art. 7º, IX, somente para alerta de segurança coberto por LIA | Provedor contratado recebe endereço e template mínimo; parceiro não recebe conteúdo de resposta | Fila até entrega; registro técnico conforme RT-09; notificações discretas | Planejado; fornecedor não selecionado |
| OP-16 | Suporte e exercício de direitos; DG-01, DG-02, DG-15 e DG-16; titulares | Autenticar pedido, responder e demonstrar atendimento | Art. 7º, II, cumprimento da LGPD; Art. 7º, VI, quando houver necessidade probatória concreta; Art. 11, II, d, apenas para prova que inclua dado sensível | Encarregado, suporte restrito e jurídico quando necessário | RT-10; separar anexos e apagar conteúdo excedente | Planejado; canal e procedimento pendentes |
| OP-17 | Pesquisa, teste de usabilidade e feedback do MPV; DG-17 e DG-18; participantes | Aprender com uso e melhorar o produto | Art. 7º, I, consentimento; consentimento separado para áudio ou vídeo e para citação identificável; Art. 11, I, se texto inserido indevidamente revelar dado sensível | Equipe de pesquisa autorizada; transcrição por operador contratado se houver | RT-11; sugestão do MPV por padrão até 90 dias; anonimizar a síntese e permitir retirada até a anonimização | Coleta e exportação controladas implementadas; transparência, canal de retirada e aprovação ainda bloqueiam piloto externo |
| OP-18 | Backup, auditoria e continuidade; cópia mínima dos DG aplicáveis; usuários | Restaurar serviço, provar ações críticas e responder a incidente | A base acompanha a operação original; Art. 7º, II ou VI e Art. 11, II, d, só para retenção legal ou probatória concreta; Art. 11, II, g, só para segurança | Infraestrutura, segurança e auditor autorizado; acesso excepcional | RT-12; criptografia, ciclo automático e deleção lógica propagada | Backup e trilha seguros ainda não implementados |
| OP-19 | Desvincular casal, revogar consentimento e excluir conta; DG-01 a DG-16; titulares | Encerrar acesso, atender escolha e cumprir direitos | Art. 7º, II, para cumprir a LGPD; retenção excepcional pelos arts. 16 e 11, II, d, se aplicável | Titular, sistema e equipe mínima de direitos; ex-parceiro perde acesso imediatamente | RT-01, RT-05 e RT-10; decisão sobre dados compartilhados em DEC-04 | Planejado; bloqueia piloto |
| OP-20 | Marketing e comunicação não essencial; DG-01, DG-02 e DG-16; usuários | Enviar novidades ou campanhas escolhidas | Art. 7º, I, consentimento livre, granular e separado | Provedor de comunicação contratado | Até descadastro ou fim da campanha; lista mínima de supressão para respeitar oposição | Fora do MVP e deve permanecer desativado |

## Matriz de necessidade e proibições

| Contexto | Dados mínimos permitidos | Não coletar ou enviar |
| --- | --- | --- |
| Cadastro | Nome de exibição, e-mail, senha transmitida apenas para derivação de hash e declaração de maioridade | Data de nascimento completa, gênero, CPF, telefone e contatos sem requisito aprovado |
| Convite | Token forte, IDs técnicos, expiração e estado | Resposta, resultado de teste, lista de contatos ou motivo do convite |
| Jogo | IDs de casal, partida, rodada, autor autenticado, resposta e timestamps necessários | Localização precisa, contatos, microfone, câmera ou conteúdo de outras aplicações |
| Analytics | Nome de evento permitido, tempo, IDs pseudônimos quando indispensáveis, modo e origem enumerados | Texto de resposta, prompt completo, e-mail, senha, token, convite, propriedades livres, dado financeiro declarado pelo cliente |
| Pesquisa e feedback do MPV | Jogo, três sinais, sugestão opcional, ID idempotente e horário do servidor | Nome, contato, IP persistido, resposta da rodada, escolha secreta ou detalhe da conversa |
| Logs | Código de erro, rota normalizada, correlação, tempo e ator pseudônimo quando necessário | Corpo de requisição, cabeçalho de autorização, segredo, convite e conteúdo íntimo |
| Notificação | Template discreto, destino e identificador técnico | Resposta, resultado, tema íntimo ou prévia legível em tela bloqueada |
| Administração | Contagens e coortes mínimas; acesso identificável só para suporte justificado | Conteúdo de respostas e resultados individuais em dashboard |

## Retenção preliminar

Os prazos abaixo são política de produto proposta e precisam de aprovação jurídica, configuração técnica e contrato equivalente com operadores. O relógio conta do evento indicado; suspensão por obrigação ou litígio exige registro de fundamento, escopo e revisão.

| ID | Conjunto | Prazo ou gatilho proposto | Método e exceção |
| --- | --- | --- | --- |
| RT-01 | Conta e vínculo | Enquanto ativos; excluir dados primários em até 30 dias após pedido autenticado | Revogar acesso imediatamente; manter somente o exigido pelo art. 16 com fundamento documentado |
| RT-02 | Sessão de autenticação | Token até expiração ou revogação; padrão máximo de 30 dias | Servidor guarda hash; apagar token do cliente no logout; evidência mínima migra para RT-09 |
| RT-03 | Convite | Até consumo, cancelamento ou 72 horas; máximo técnico de 7 dias | Guardar apenas hash; apagar ao vencer; tentativas seguem RT-09 |
| RT-04 | Partida e rodada sem conteúdo de resposta | Enquanto o casal desejar histórico; revisão anual de necessidade | Excluir ou anonimizar com a conta e o vínculo conforme DEC-04 |
| RT-05 | Respostas e revelações | Durante vínculo ativo e finalidade escolhida; eliminar ou anonimizar em até 30 dias após gatilho aprovado em DEC-04 | Cópias de backup expiram em RT-12; retenção excepcional exige base do art. 16 |
| RT-06 | Progresso | Enquanto conta e casal ativos | Preferir eventos sem conteúdo; excluir ou anonimizar após encerramento conforme DEC-04 |
| RT-07 | Testes e preferências | Memória ou sessão por padrão; se o titular optar por salvar, enquanto a função estiver ativa e até revogação | Apagar do navegador e servidor; compartilhamento com parceiro é escolha separada |
| RT-08 | Analytics identificável ou pseudônimo | Até 180 dias no piloto | Agregar e anonimizar antes quando possível; agregado reidentificável mantém o mesmo prazo |
| RT-09 | Logs técnicos e de segurança | Até 90 dias, salvo incidente aberto ou obrigação específica | Rotação automática; restrição por função; sem payload íntimo |
| RT-10 | Pedidos de suporte e direitos | Conteúdo por até 12 meses após encerramento; prova mínima pelo prazo jurídico aprovado | Separar prova de atendimento de anexos e conversa excedente |
| RT-11 | Pesquisa | Gravação até transcrição validada ou 90 dias; notas identificáveis até 12 meses; síntese anônima conforme finalidade | Consentimento pode definir prazo menor; apagar a chave de identificação na anonimização |
| RT-12 | Backups | Ciclo máximo de 90 dias | Cifrar; impedir restauração permanente de dado excluído; reaplicar fila de exclusão após restauração |

## Consentimentos e transparência exigidos

| ID | Momento | Informação e escolha mínimas | Evidência |
| --- | --- | --- | --- |
| CS-01 | Antes da primeira resposta ou preferência potencialmente sensível | Categorias possíveis, finalidade, persistência, parceiro como destinatário, condição bilateral, prazo, riscos, recusa sem perda das funções não dependentes e revogação | Usuário, finalidade, versão do texto, ação afirmativa, data e origem; nunca inferir do uso |
| CS-02 | Antes de salvar resultado de teste | Diferença entre processar localmente, salvar e compartilhar; caráter educativo e ausência de diagnóstico | Escolhas independentes para salvar e compartilhar |
| CS-03 | Antes de analytics não essencial | Eventos, operador, retenção e forma de recusar | Preferência versionada; ausência de escolha significa desativado |
| CS-04 | Antes de pesquisa e gravação | Objetivo, equipe, uso de fala ou imagem, prazo e retirada | Termo da pesquisa separado da conta do produto |
| CS-05 | Antes de marketing | Canal, frequência e finalidade | Opt-in separado por canal e descadastro em cada mensagem |

A revogação de CS-01 interrompe novas respostas sensíveis e inicia a política de exclusão aplicável, sem afetar a licitude do tratamento anterior. Se a resposta já tiver sido revelada, a interface deve explicar o que será removido do serviço e o limite técnico sobre informação que o parceiro já viu ou copiou. Essa limitação não autoriza manter a resposta na plataforma.

## Direitos dos titulares

O canal da tarefa 91 deve aceitar pedidos sem exigir login quando o titular perdeu acesso, mas precisa verificar identidade de forma proporcional e sem coletar documentos em excesso.

| Direito | Resposta operacional |
| --- | --- |
| Informação e confirmação | Informar operações, bases, duração, agentes e compartilhamentos; confirmação imediata quando possível |
| Acesso | Visão simplificada imediata e relatório completo em até 15 dias, incluindo origem, critérios e finalidade |
| Correção | Corrigir conta, contato, aniversário e preferências; registrar a propagação aos operadores |
| Anonimização, bloqueio ou eliminação | Localizar dado desnecessário, excessivo ou irregular em produção, analytics, suporte e filas de backup |
| Portabilidade | Exportar formato estruturado quando regulamentado, preservando segredo do parceiro e direitos de terceiros |
| Informação sobre compartilhamento | Listar parceiro e operadores ou destinatários efetivamente usados, inclusive país quando aplicável |
| Consentimento | Informar consequências da recusa, permitir revogação e eliminar dado baseado em consentimento, ressalvado o art. 16 |
| Oposição | Receber contestação de tratamento sem consentimento e revisar LIA, necessidade e salvaguardas |
| Decisão automatizada | Explicar lógica e permitir revisão humana se resultado ou perfil passar a produzir efeito relevante sobre o titular |

Exportação de casal deve separar: dados fornecidos pela pessoa, dados observados sobre sua conta e dados compartilhados. Uma pessoa não recebe resposta privada ainda não revelada nem dados exclusivos do parceiro. A exclusão e a desvinculação precisam revogar sessões, abandonar partidas abertas, bloquear endpoints compartilhados e propagar a decisão aos operadores.

## Acesso, operadores e transferências

| Função | Acesso permitido | Controle obrigatório |
| --- | --- | --- |
| Usuário | Própria conta, própria resposta pendente e conteúdo bilateral já revelado durante vínculo válido | Autenticação, autorização por recurso e novo bloqueio a cada leitura |
| Parceiro | Identidade mínima do vínculo e resposta somente após revelação bilateral | Sem acesso após saída; sem exportar dado privado do outro |
| Suporte | Conta e estado técnico necessários ao chamado | MFA, justificativa, tempo limitado e trilha; conteúdo íntimo mascarado |
| Segurança | Metadados técnicos e evidência de incidente | Acesso excepcional, segregado e auditado; conteúdo apenas quando inevitável e autorizado |
| Produto e dados | Eventos aprovados e agregados | Sem resposta livre, e-mail, token ou convite; limiar contra grupos pequenos |
| Pesquisa do MPV | Sinais e sugestões opcionais exportados para análise do teste | Token de exportação em cofre, acesso restrito, arquivo fora do Git e exclusão ao fim da retenção |
| Administrador editorial | Conteúdo e versões editoriais | Sem acesso a respostas, perfis ou vínculo individual |
| Operador | Somente o conjunto descrito no contrato e por instrução | DPA, confidencialidade, suboperadores, controles, incidente, auditoria, devolução e eliminação |

Antes de contratar qualquer serviço, preencher um cadastro com razão social, papel, serviço, categorias, titulares, finalidade, região de armazenamento, suboperadores, medidas, prazo e método de saída. Nenhum operador de produção ou transferência internacional está aprovado neste inventário. Se houver armazenamento ou acesso fora do Brasil, registrar também a hipótese dos artigos 7º ou 11 e um mecanismo válido do artigo 33, seguindo a Resolução CD/ANPD nº 19/2024.

## Incidentes e RIPD

O fluxo de incidente deve identificar sistemas e titulares afetados, categorias e volume, sensibilidade, possibilidade de fraude, discriminação, dano material ou reputacional, medidas já adotadas e evidências. O controlador decide e documenta se há risco ou dano relevante. Quando houver, a comunicação à ANPD e aos titulares deve ocorrer em três dias úteis, ressalvado prazo legal específico, conforme a Resolução CD/ANPD nº 15/2024. O registro interno do incidente deve existir mesmo quando a conclusão for não comunicar.

Um Relatório de Impacto à Proteção de Dados Pessoais deve ser concluído antes do piloto, porque o produto combina conteúdo íntimo potencialmente sensível, inferências de perfil, relação entre dois titulares, revelação a terceiro conhecido e riscos críticos de acesso indevido. O RIPD documentará necessidade, proporcionalidade, riscos residuais, medidas, responsáveis e aceite formal; esta conclusão pode ser revisada pelo encarregado e pelo jurídico.

## Pendências e gates

| ID | Decisão ou implementação necessária | Dono proposto | Gate |
| --- | --- | --- | --- |
| DEC-01 | Formalizar controlador, CNPJ, endereço, representante e jurisdição | Jurídico e direção | Antes de publicar política ou termos |
| DEC-02 | Designar encarregado ou justificar dispensa aplicável e publicar canal | Jurídico e operação | Antes do piloto externo |
| DEC-03 | Implementar declaração de maioridade e procedimento para conta de menor detectada | Produto, jurídico e engenharia | Antes de cadastro externo |
| DEC-04 | Definir destino de respostas, progresso e histórico quando uma pessoa desvincula ou exclui a conta | Produto, jurídico e privacidade | Antes de persistir respostas bilaterais |
| DEC-05 | Selecionar operadores, completar due diligence, contratos e mapa de transferência internacional | Segurança, jurídico e DevOps | Antes de enviar dado real a terceiro |
| DEC-06 | Aprovar LIA-01 de segurança e LIA-02 de analytics; reduzir telemetria se o teste não fechar | Privacidade e jurídico | Antes de ativar logs e analytics em produção |
| DEC-07 | Implementar CS-01 a CS-05, histórico de versões e revogação | Produto, design e engenharia | Antes do tratamento correspondente |
| DEC-08 | Converter o inventário em política de privacidade e termos coerentes, sem prometer E2EE inexistente | Jurídico e conteúdo | Antes do piloto externo |
| DEC-09 | Implementar acesso, exportação, correção, exclusão e fila de propagação aos operadores | Engenharia e operação | Antes do piloto externo |
| DEC-10 | Elaborar e aprovar RIPD com risco residual e evidência dos controles de segurança | Encarregado, segurança e direção | Antes do go/no-go |
| DEC-11 | Criar playbook, contato 24x7, matriz de severidade e modelo de comunicação de incidente | Segurança, jurídico e operação | Antes de produção |

O protótipo **não está apto para piloto externo** enquanto OP-08, OP-13 e OP-19 permanecerem sem os controles indicados e DEC-01 a DEC-11 não tiverem sido resolvidas nos respectivos gates. As tarefas 88, 90, 91, 95, 98, 121 e 122 devem usar este inventário como entrada.

## Fontes normativas e orientação oficial

- [Lei nº 13.709/2018 — LGPD, texto compilado](https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2018/lei/l13709compilado.htm): conceitos e princípios; bases dos arts. 7º e 11; término e conservação dos arts. 15 e 16; direitos dos arts. 18 a 20; transferências do art. 33; registros e RIPD dos arts. 37 e 38; segurança e incidentes dos arts. 46 a 48.
- [Guia Orientativo das Hipóteses Legais — Legítimo Interesse](https://www.gov.br/anpd/pt-br/assuntos/noticias/anpd-lanca-guia-orientativo-sobre-legitimo-interesse): teste de finalidade, necessidade, balanceamento e salvaguardas.
- [Direitos dos titulares](https://www.gov.br/anpd/pt-br/assuntos/titular-de-dados-1/direito-dos-titulares): conteúdo e prazos operacionais de confirmação e acesso.
- [Enunciado CD/ANPD nº 1/2023](https://bibliotecadigital.mj.gov.br/bitstream/1/10215/2/Enunciado_ANPD_2023_1.html): bases dos arts. 7º ou 11 para crianças e adolescentes, sempre com prevalência do melhor interesse e análise concreta.
- [Resolução CD/ANPD nº 15/2024 — comunicação de incidente](https://www.gov.br/anpd/pt-br/canais_atendimento/agente-de-tratamento/comunicado-de-incidente-de-seguranca-cis): avaliação e prazo de três dias úteis quando houver risco ou dano relevante.
- [Resolução CD/ANPD nº 19/2024 — transferência internacional](https://www.gov.br/anpd/pt-br/acesso-a-informacao/institucional/atos-normativos/regulamentacoes_anpd/resolucao-cd-anpd-no-19-de-23-de-agosto-de-2024): mecanismos, cláusulas padrão e transparência.
- [Guia de cookies e proteção de dados pessoais](https://www.gov.br/anpd/pt-br/centrais-de-conteudo/materiais-educativos-e-publicacoes/guia-orientativo-cookies-e-protecao-de-dados-pessoais.pdf): necessidade, transparência e escolhas para armazenamento e rastreamento no dispositivo.
- [Guia sobre atuação do encarregado](https://www.gov.br/anpd/pt-br/assuntos/noticias/anpd-lanca-guia-sobre-atuacao-do-encarregado): canal e atribuições relacionadas aos titulares e à ANPD.

## Critérios de manutenção

Atualizar este inventário antes de adicionar campo, evento, integração, destinatário, finalidade, inferência ou país de processamento. Toda mudança precisa indicar OP e DG afetados, confirmar necessidade, base, retenção, aviso, acesso, contrato e teste. A validação automática verifica estrutura e cobertura; a aprovação jurídica avalia o enquadramento e não pode ser substituída pelo script.
