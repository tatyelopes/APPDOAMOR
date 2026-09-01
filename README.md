# Entre Nós

MVP mobile-first de um aplicativo de conexão para casais, criado a partir do PRD em `Projeto.docx`.

## O que já funciona

- Onboarding e perfil básico do casal
- Tela inicial com streak, pergunta e gesto do dia
- Jogo de perguntas nos níveis leve e profundo
- Teste das cinco linguagens do amor por escolha forçada
- Resultado e dica prática conforme a linguagem predominante
- Progresso persistido localmente no navegador
- Layout responsivo para celular e desktop
- Conta individual com e-mail, senha protegida por hash e sessão autenticada
- Backend local com sincronização entre navegadores e código de convite
- Respostas privadas armazenadas no servidor, bloqueadas até a participação de ambos
- Tela de revelação mútua das respostas

## Executar

Requer Node.js 20 ou superior.

```powershell
npm.cmd install --cache .npm-cache
npm.cmd run dev
```

Abra o endereço exibido no terminal. Para validar a versão de produção:

```powershell
npm.cmd run build
```

## Próximos ciclos

1. Questionário completo, pontuação separada para dar/receber amor e análise do casal
2. Migrar a persistência JSON local para PostgreSQL antes da publicação
3. Teste dos quatro temperamentos e matriz de compatibilidade
4. Desafios, provas, assinatura, multiplayer, relatórios e IA

## Observação de privacidade

Esta versão já separa as sessões e impede a revelação unilateral. Antes da publicação, o armazenamento local do servidor deve migrar para PostgreSQL, HTTPS e criptografia adequada para dados íntimos conforme o PRD.
