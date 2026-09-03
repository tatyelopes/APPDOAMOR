# Identidade visual — Conectadois

**Versão:** 1.0 — 2 de setembro de 2026  
**Status:** sistema visual consolidado para produto e prototipação  
**Naming:** Conectadois permanece nome de trabalho; o sistema deve ser revisto após validação jurídica e de marca.

## 1. Direção escolhida

A identidade do Conectadois combina **intimidade adulta, calor e diversão a dois**. A base ameixa cria um espaço acolhedor e privado; dourado e champagne trazem descoberta e celebração; a tipografia editorial dá profundidade, enquanto elementos arredondados preservam leveza.

O sistema visual deve comunicar:

- vínculo e participação de duas pessoas;
- diversão com propósito, sem aparência infantil;
- profundidade sem linguagem clínica;
- cuidado, segurança e privacidade;
- experiência calorosa e contemporânea.

Palavras visuais: **cúmplice, acolhedor, curioso, íntimo, luminoso e adulto**.

## 2. Logotipo

### Conceito

O símbolo combina três ideias:

1. **coração:** afeto, vínculo e intimidade;
2. **controles de jogo:** diversão, participação e experiência interativa;
3. **dois lados que se encontram:** reciprocidade e conexão do casal.

Por decisão da fundadora, o símbolo 3D existente em `Identidade visual/logo-transparente.png` é o logotipo principal. Ele preserva o acabamento dourado, o fundo ameixa e a combinação coração + controles que melhor representa a personalidade desejada para a marca.

O nome será composto como **conecta + dois**: “conecta” em creme sobre fundo escuro (ou ameixa sobre fundo claro) e **“dois” sempre em dourado**. Essa mudança destaca a experiência de duas pessoas sem separar visualmente o nome.

### Arquivos oficiais

| Arquivo | Uso |
|---|---|
| `Identidade visual/logo-transparente.png` | símbolo principal, com transparência, aplicado no produto |
| `Identidade visual/logo-conectadois-dourado.svg` | composição horizontal para avaliação, com “dois” em dourado |
| `Identidade visual/logo-sem-texto.png` | composição do símbolo sobre fundo para campanhas |
| `src/assets/brand/logo-symbol-mono.svg` | alternativa técnica monocromática, sujeita a redesenho fiel |
| `src/assets/brand/logo-symbol.svg` | estudo vetorial anterior, arquivado e não aplicado |

Os arquivos `Generatedimage_*.png` são referências exploratórias e não versões oficiais.

### Versões

- **símbolo principal:** arquivo 3D transparente em superfícies claras ou escuras com contraste e respiro;
- **horizontal escura:** símbolo + “conecta” em creme + “dois” em dourado;
- **horizontal clara:** símbolo + “conecta” em ameixa + “dois” em dourado;
- **monocromática:** uma única cor, preferencialmente preta ou branca conforme o fundo;
- **horizontal:** símbolo + “conectadois” + slogan; retirar o slogan abaixo de 360 px de largura.

### Área de proteção

Manter ao redor do logotipo um espaço mínimo equivalente a **25% do diâmetro do símbolo**. Nenhum texto, borda, fotografia ou outro elemento deve invadir essa área.

### Tamanho mínimo

| Contexto | Mínimo | Recomendado |
|---|---:|---:|
| Interface digital | 28 × 28 px | 40 × 40 px ou maior |
| Ícone de loja/PWA | 192 × 192 px | 512 × 512 px |
| Impressão | 10 mm | 15 mm ou maior |
| Logotipo horizontal | 180 px de largura | 280 px ou maior |

Em 16 px, usar uma versão específica de favicon simplificada; não reduzir o arquivo detalhado diretamente.

### Uso incorreto

Não:

- distorcer, inclinar ou alterar proporções;
- trocar as cores isoladamente;
- remover ou alterar o acabamento dourado e o fundo ameixa do símbolo escolhido;
- colocar sobre fundo com baixo contraste ou fotografia ruidosa;
- separar os elementos internos ou redesenhar os controles;
- recortar partes do símbolo ou colocá-lo dentro de botões de ação;
- combinar com o nome “APP-do-amor” como assinatura oficial;
- animar de forma acelerada, pulsante ou que gere pressão emocional.

Uma animação leve de entrada ou respiração pode ser usada em carregamento, respeitando `prefers-reduced-motion`.

## 3. Paleta principal

| Token | Hex | Função |
|---|---|---|
| Ameixa 950 | `#241123` | fundos profundos e gradientes |
| Ameixa 900 | `#3D1F3D` | cor primária, cabeçalhos e superfícies íntimas |
| Ameixa 700 | `#6B354D` | apoio, gradientes e destaques escuros |
| Dourado 600 | `#B88A2D` | bordas/detalhes sobre fundos claros |
| Dourado 500 | `#D4A94E` | acento e descoberta sobre fundos escuros |
| Champagne 400 | `#E8C39E` | títulos e realces sobre ameixa |
| Creme 100 | `#F7EFE6` | fundo claro principal |
| Branco quente | `#FFFAF5` | cards e superfícies elevadas |
| Tinta | `#2B2029` | texto principal sobre fundos claros |
| Malva neutro | `#6F5A6B` | texto secundário sobre fundos claros |

### Proporção recomendada

- 55% ameixa e fundos profundos em experiências imersivas;
- 25% creme/branco quente em leitura e formulários;
- 15% champagne e tons neutros;
- até 5% dourado como acento.

Dourado é sinal de descoberta, não preenchimento padrão. Seu excesso cria aparência luxuosa distante e reduz a leveza do produto.

## 4. Paleta de apoio

| Cor | Hex | Uso |
|---|---|---|
| Lilás cúmplice | `#8F6F91` | categorias profundas e ilustrações |
| Verde cuidado | `#A8C3A0` | conclusão, segurança e estados positivos suaves |
| Rosa encontro | `#B95269` | energia, afeto e campanhas; uso moderado |
| Erro | `#B44355` | erro e ação destrutiva, sempre com texto/ícone |
| Sucesso | `#53775A` | confirmação sobre fundo claro, sempre com texto/ícone |

Status nunca depende apenas de cor. Sempre combinar cor com rótulo, ícone ou mensagem.

## 5. Contraste e acessibilidade

- texto comum deve atingir contraste mínimo de 4,5:1;
- texto grande e elementos gráficos essenciais, pelo menos 3:1;
- ameixa escuro com creme/branco quente é a dupla preferencial de alto contraste;
- champagne e dourado funcionam sobre ameixa, mas dourado claro **não deve ser texto pequeno sobre creme ou branco**;
- malva/lilás claro em fundo ameixa deve ser validado no componente real;
- foco visível usa champagne sobre fundo escuro e ameixa sobre fundo claro;
- validar estados normal, hover, foco, desabilitado e erro;
- executar verificação automatizada e teste manual antes do release candidate.

As combinações devem ser testadas novamente se opacidade, gradiente, fotografia ou tamanho forem alterados.

## 6. Tipografia

### Família principal — Inter

**Uso:** corpo, navegação, formulários, legendas, dados, termos, mensagens e interface funcional.

Pesos: 400 para corpo; 500 para ênfase; 600 para controles; 700 apenas para informação de alta prioridade.

Motivo: alta legibilidade em telas pequenas, boa cobertura de caracteres e neutralidade suficiente para sustentar a marca.

### Família de expressão — Fraunces

**Uso:** títulos, frases de descoberta, perguntas e números editoriais de destaque.

Pesos: 500 e 600. Usar 700 somente em campanhas. Não usar em campos, mensagens longas ou textos abaixo de 18 px.

Motivo: traz calor, personalidade e profundidade sem parecer clínica ou excessivamente romântica.

### Família de acento — Baloo 2

**Uso restrito:** botões de experiências lúdicas, etiquetas de categorias e pequenos destaques divertidos.

Pesos: 600 e 700. Não usar em corpo, conteúdo sensível, privacidade, pagamento ou mensagens de erro.

Motivo: adiciona descontração; o uso limitado evita infantilização.

### Fallbacks

- Inter → Arial → sans-serif;
- Fraunces → Georgia → serif;
- Baloo 2 → Arial Rounded MT Bold → sans-serif.

Antes de produção, hospedar os arquivos WOFF2 no próprio produto, limitar pesos utilizados e aplicar `font-display: swap`. O carregamento atual via Google Fonts é aceitável para protótipo, mas deve ser revisado por desempenho, disponibilidade e privacidade.

## 7. Escala tipográfica

| Estilo | Desktop | Mobile | Fonte/peso | Altura de linha |
|---|---:|---:|---|---:|
| Display | 64 px | 44 px | Fraunces 600 | 1,05 |
| H1 | 48 px | 36 px | Fraunces 600 | 1,10 |
| H2 | 36 px | 28 px | Fraunces 600 | 1,15 |
| H3 | 24 px | 22 px | Fraunces 600 | 1,25 |
| Corpo grande | 18 px | 17 px | Inter 400 | 1,60 |
| Corpo | 16 px | 16 px | Inter 400 | 1,55 |
| Corpo pequeno | 14 px | 14 px | Inter 400 | 1,45 |
| Legenda | 12 px | 12 px | Inter 500 | 1,40 |
| Etiqueta | 11 px | 11 px | Inter 700 | 1,30 |
| Botão | 15 px | 15 px | Baloo 2 700 ou Inter 600 | 1,20 |

Evitar corpo abaixo de 14 px. Caixa alta é reservada a etiquetas curtas, com espaçamento de letras; nunca usar em parágrafos.

## 8. Composição e interface

### Formas

- cards com cantos de 16 a 24 px;
- botões com 12 a 16 px ou formato cápsula quando curto;
- círculos representam parceria, progresso e encontro;
- bordas finas e translúcidas em superfícies escuras;
- sombras suaves; evitar relevo metálico em componentes funcionais.

### Fotografia e ilustração

- mostrar casais diversos em situações naturais e cotidianas;
- priorizar interação, olhar, riso e presença, sem poses artificiais;
- evitar clichês de casamento, gênero, luxo ou romance heteronormativo;
- usar luz quente e contraste moderado;
- nunca sugerir que o app observa conversas privadas.

### Ícones

Usar ícones simples, arredondados e de espessura consistente. Coração pode aparecer com moderação. Cadeado deve representar privacidade apenas quando a proteção descrita realmente existir.

## 9. Tokens implementados

O arquivo `src/assets/brand/brand-tokens.css` centraliza:

- cores brutas de marca;
- cores semânticas iniciais;
- famílias tipográficas;
- aliases para fundo, superfície e texto.

O aplicativo passou a usar os tokens no `:root`, restaurou o símbolo 3D escolhido e aplica o nome com “dois” em dourado. Novos componentes devem usar tokens semânticos, não novos hexadecimais isolados.

## 10. Aplicações recomendadas

### Tela de entrada

- fundo ameixa com gradiente discreto;
- símbolo em destaque;
- título Fraunces em creme;
- corpo Inter em tom claro;
- CTA dourado ou champagne com texto ameixa.

### Perguntas e revelação

- títulos/perguntas em Fraunces;
- instruções e controles em Inter;
- superfícies profundas para sensação de espaço reservado;
- dourado indica descoberta, nunca resposta “certa”.

### Painel administrativo

- Inter domina dados, filtros e tabelas;
- Fraunces apenas em títulos e North Star;
- cores funcionais priorizam legibilidade sobre expressão da marca.

### Campanhas

- logotipo horizontal;
- slogan “Descubram mais. Conectem-se mais.”;
- símbolo 3D como elemento principal da marca;
- assinatura e CTA sempre em tipografia vetorial, nunca incorporados a uma imagem gerada.

## 11. Pendências antes do lançamento

1. validar o nome Conectadois e disponibilidade jurídica;
2. testar reconhecimento e associações do símbolo com casais;
3. revisar desenho vetorial com profissional de identidade para acabamento e registro;
4. gerar ícones PWA em 192 e 512 px, máscara e favicon simplificado;
5. criar versões oficiais clara, escura, uma cor e impressão;
6. hospedar fontes localmente e revisar licenças;
7. auditar contraste de todos os componentes;
8. retirar do produto as direções visuais experimentais não escolhidas;
9. substituir ocorrências residuais de “APP-do-amor” e “entre nós” após o naming final.

## 12. Governança

- Product Designer mantém arquivos mestres e tokens;
- Product Owner aprova mudanças de identidade;
- Frontend aplica componentes e tokens;
- Qualidade verifica responsividade, contraste e consistência;
- Jurídico valida nome e registro;
- Growth usa somente versões oficiais.

Alterações em cor, logotipo ou fonte exigem registro de decisão e teste nas superfícies críticas. Campanhas podem explorar composições, mas não redesenhar a marca.

## 13. Decisão consolidada

| Elemento | Escolha |
|---|---|
| Conceito | coração + jogo + encontro de duas pessoas |
| Estilo do logotipo | tridimensional dourado sobre ameixa, acolhedor, lúdico e premium |
| Wordmark | “conecta” em creme/ameixa e “dois” em dourado |
| Cor primária | Ameixa 900 — `#3D1F3D` |
| Acento | Dourado 500 — `#D4A94E` |
| Fundo claro | Creme 100 — `#F7EFE6` |
| Display | Fraunces |
| Interface | Inter |
| Acento lúdico | Baloo 2, uso restrito |
| Slogan | Descubram mais. Conectem-se mais. |
