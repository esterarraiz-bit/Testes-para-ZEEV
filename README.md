# CRP — Zeev Assets modularizados

Os dois arquivos enviados foram divididos em módulos por responsabilidade. A entrega usa **composição no build**, sem dependências npm: Node.js reúne os arquivos na ordem original. No Zeev continuam sendo carregados apenas um JS e um CSS.

## Usar agora

1. Copie `src/`, `scripts/`, `package.json` e `dist/` para seu repositório (integre o package.json se já houver um).
2. Os arquivos `dist/crp-form.js` e `dist/crp-form.css` já estão gerados.
3. No carregador existente do Zeev, substitua as URLs antigas pelas URLs públicas desses dois arquivos. Mantenha o mecanismo de carregamento que já funciona. Não carregue a versão antiga junto da nova.
4. Valide primeiro em um formulário de teste. Este pacote foi verificado estaticamente; não foi executado em uma sessão autenticada do Zeev.

Exemplo de URLs se o pacote for colocado na raiz de AutomacaoCRPTech/zeev-assets e servido pelo jsDelivr:

```text
https://cdn.jsdelivr.net/gh/AutomacaoCRPTech/zeev-assets@SEU_COMMIT/dist/crp-form.js
https://cdn.jsdelivr.net/gh/AutomacaoCRPTech/zeev-assets@SEU_COMMIT/dist/crp-form.css
```

Troque `SEU_COMMIT` pelo mesmo hash ou tag nos dois endereços. As URLs são modelos; nada foi publicado. Se precisar manter as URLs antigas, publique o conteúdo de `dist/` nos caminhos que seu carregador já usa.

## Editar e gerar

Edite os módulos em `src/`, depois execute, na pasta do projeto:

```bash
npm run build
npm run check
```

Não precisa executar `npm install`: o build utiliza somente bibliotecas nativas do Node.js. Envie também os arquivos gerados em `dist/` ao Git. Não edite `dist/` diretamente: a próxima geração sobrescreve essas alterações.

## Arquivos principais

- `src/js/main.js`: define a ordem dos módulos JavaScript.
- `src/js/core/main.js`: mantém a closure original e reúne funções que compartilham estado.
- `src/css/main.css`: define a ordem dos estilos.
- `scripts/build.mjs`: expande as inclusões, verifica a sintaxe do JS gerado e grava `dist/`.

As linhas `// @include "..."` são diretivas do build deste pacote, não comandos nativos do navegador. Não aponte o Zeev para `src/js/main.js`: use `dist/crp-form.js`. Os arquivos de `core/` compartilham o escopo privado original após a montagem; não são módulos ES independentes. Essa escolha preserva os handlers e funções globais existentes, sem alterar a forma como o Zeev recebe o código.

## Organização JavaScript

| Pasta/arquivo | Responsabilidade |
|---|---|
| core/dom.js | Criação e movimentação de elementos no mesmo formulário |
| core/workspace.js | Colunas, cards e estrutura principal |
| core/abas.js | Abas, rótulos, contadores e renderização |
| core/visibilidade-acoes.js | Visibilidade do card de ações |
| core/aviso-anexos.js | Aviso de anexos obrigatórios |
| core/atualizacao.js | Orquestração e atualização do layout |
| core/arquivos-campos.js | Apresentação dos anexos nos campos |
| core/mensagens.js | Apresentação das mensagens |
| core/numero-processo.js | Identificação do processo |
| core/historico.js | Classificação dos status e subprocesso |
| core/ciclo-de-vida.js | Observer, agendamento, CRPForm e inicialização |
| modulos/salvar.js | Posicionamento do botão Salvar |
| modulos/sem-acao.js | Apresentação das tarefas sem ação |
| modulos/nfse.js | Extração de XML e validação de arquivos de NF |
| modulos/autocomplete.js | Posicionamento das sugestões |
| modulos/nome-curto-anexo.js | Nome de arquivo resumido |
| modulos/resumo.js | Grupos vazios e largura dos campos |
| modulos/tabelas.js | Contagem e modo consulta/edição |

## CSS e compatibilidade

Os módulos CSS são numerados e mantêm a ordem exata do arquivo original. Regras antigas e ajustes posteriores foram preservados, inclusive quando tratam do mesmo componente: reorganizá-los ou deduplicá-los nesta etapa poderia mudar a cascata. Alguns módulos são complementos de outros. O build resolve os imports locais, entregando um único CSS sem requisições adicionais.

A rotina NFSe foi isolada, mas continua incluída e mantém as funções globais e a inicialização originais. Removê-la do principal deve ser uma decisão separada, após conferir quais formulários dependem dela.

## Verificação realizada

Os arquivos gerados reproduzem integralmente o texto original dos anexos (normalizando apenas eventuais quebras de linha CRLF para LF). A ordem, as closures, funções globais, seletores, cores, observers e timers foram mantidos. O build verifica a sintaxe JavaScript antes de gravar. `npm run check` verifica se os gerados correspondem aos módulos; não testa o funcionamento dentro do Zeev.

Antes de publicar, confira no formulário de teste: abas e contadores; resumo e campos editáveis; anexar/apagar; inserir/excluir linhas; consulta; histórico/Subprocesso; Salvar e concluir. Se o fluxo usa NFSe, confira também essa extração.

Para voltar à versão anterior, restaure as URLs antigas no carregador ou a versão anterior dos arquivos publicados.
