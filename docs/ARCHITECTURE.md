# Arquitetura do repositório

O projeto adota um monorepositório simples, com frontend React e API Node no mesmo pacote. A organização é **feature-first**: regras e telas ficam próximas do domínio a que pertencem; recursos genéricos ficam em `shared`.

## Estrutura

```text
.
├── docs/                       # Decisões e documentação técnica
├── server/
│   ├── data/                   # Persistência local (ignorada pelo Git)
│   ├── src/
│   │   ├── config.js           # Ambiente e configuração da aplicação
│   │   ├── infra/              # Banco, provedores e adaptadores externos
│   │   └── shared/             # Utilitários independentes de domínio
│   └── index.mjs               # Composition root e servidor HTTP
└── src/
    ├── app/                    # Bootstrap, estilos globais e composição
    ├── features/               # Módulos funcionais (próxima extração)
    ├── shared/
    │   ├── api/                # Cliente HTTP base
    │   ├── storage/            # Persistência no navegador
    │   └── types/              # Contratos compartilhados no frontend
    └── App.tsx                 # Experiência atual; migração incremental
```

## Regra de dependência

```text
app → features → shared
API/rotas → serviços de domínio → infra/shared
```

- `shared` nunca importa de `features` ou `app`.
- Uma feature não acessa diretamente detalhes de outra feature.
- Componentes não chamam `fetch` nem usam chaves literais do `localStorage`; usam os adaptadores em `shared`.
- O `index.mjs` configura o processo e conecta as dependências. Regras novas devem entrar em módulos de domínio, não no composition root.

## Padrão de uma feature

```text
features/nome-da-feature/
├── components/                # UI privada da feature
├── hooks/                     # Estado e orquestração React
├── services/                  # Casos de uso e acesso à API
├── types.ts                   # Tipos privados do domínio
└── index.ts                   # API pública do módulo
```

Crie apenas as pastas necessárias. Arquivos e diretórios vazios não devem ser adicionados.

## Convenções

- Pastas e arquivos utilitários: `kebab-case`.
- Componentes React: `PascalCase.tsx`.
- Hooks: prefixo `use`, por exemplo `useSession.ts`.
- Um módulo só expõe sua API pública por `index.ts` quando houver mais de um consumidor.
- Tipos globais devem ser raros; prefira tipos próximos da feature.
- Variáveis de ambiente ficam centralizadas em `server/src/config.js`.
- Testes devem ficar ao lado do arquivo testado (`*.test.ts`/`*.test.tsx`).

## Evolução recomendada

O `App.tsx` ainda reúne as telas do MVP para evitar uma reescrita arriscada. As próximas alterações devem extrair, uma a uma, as features `auth`, `couples`, `questions`, `love-languages` e `temperaments`, mantendo o comportamento coberto por testes antes de cada movimento.


## Modelo de dados

O [modelo lógico de dados](MODELO-DE-DADOS.md) e o [esquema DBML](modelo-de-dados.dbml) definem usuários, vínculos de casal, autenticação, partidas, rodadas, respostas e progresso para PostgreSQL. Incluem regras de acesso, integridade, concorrência e mapeamento do JSON atual. São a referência da tarefa 34 para contrato de API e futuras migrações; a persistência atual ainda usa JSON.
