# Testes de formulários do Zeev — guia prático (aprendizados)

Documento de apoio para testar formulários do Zeev no ambiente de homologação.
Reúne contexto, como preencher, **como anexar arquivos**, checklist e armadilhas.

---

## 1. Ambiente e contexto

- Homologação: `https://hmlcrptech.zeev.it`
- Modo simulação (teste de formulário): `/manage/process-test?<token>&inpStSimulation=S`
- O formulário normalmente roda **num iframe**:
  - Tarefa em execução: `/2.0/task?c=<token>`
  - Abertura/nova solicitação: `/2.0/request?c=<token>`
- Container principal do formulário: `#containerRequest`
  - Classes dinâmicas relevantes: `crp-form`, `crp-workspace`, `crp-proto`,
    `crp-aba-geral` (aba Geral ativa), `crp-approval-view` (etapa "sem ação"),
    `crp-resumo-vazio` (resumo sem conteúdo), `crp-documentos`.
- Estrutura base:
  - `#ContainerForm.crp-form-shell` → `#BoxFrmExecute.crp-work-grid`
  - Coluna esquerda: `.crp-context-column` com `#crp-info-card`
    (título + abas + `#crp-summary`)
  - Coluna direita: `.crp-action-column` com `.crp-actions`
    (`.crp-action-content` = campos editáveis/condicionais)
  - Rodapé de ações: `#controllers` (botões: Salvar, Concluir `#btnFinish`,
    `#BtnSend` em abertura, `#btnApprove` em aprovação, etc.)
- Abas: `#crp-tab-crp-summary` (Geral), `#crp-tab-containerMessages`,
  `#crp-tab-containerFiles`, `#crp-tab-containerHistory`.
- Cabeçalho: `.crp-header h5` = nome do fluxo; `.crp-header h1` = nome da tarefa.

### Fluxo de exemplo (contratação)
`Iniciar contratação` (abertura) → `T01 Informar dados` → `T02 Aprovar`
→ etapas intermediárias → `T08 Fornecer documentação` → `T05 Exame admissional` → ...

---

## 2. Como navegar na simulação

1. Abrir `/manage/process-test?...&inpStSimulation=S`.
2. `Iniciar teste` → abre `/2.0/request` (nova solicitação).
3. Preencher e clicar **Enviar solicitação** (`#BtnSend`) → inicia o processo.
4. Na lista, clicar na linha da tarefa (linha com `onclick="...tasklist_open_task..."`)
   → abre a tarefa num iframe `/2.0/task`.
5. Botões de apoio: `Recarregar` (`#btnReloadTasks`), `Limpar testes`
   (`#btnClearSimulation`).

> Ao recarregar a página, tudo que não foi **concluído/salvo** no servidor se perde
> (inclusive anexos). Ver seção 6.

---

## 3. Identificar campos

Dentro de `#containerRequest`:

- `input` / `select` / `textarea`
- Rótulo: `data-label` (ou `label`), ou a célula `td.col0` da linha
- Obrigatório: `data-required="true"` (ou `required`)
- Tipo do campo: `data-fieldformat` → `TEXT`, `TEXTAREA`, `SELECT`, `DATA`,
  `FILE`, `FILE_VIEW`, `SUGGEST2`, `CHECKBOX`
- Sugestão/autocomplete: `data-special-type="suggest"` ou
  `data-fieldformat="SUGGEST2"`
- Radio: agrupado por `name`; Checkbox: `input[type=checkbox]`
- Campos **condicionais**: aparecem conforme escolhas (radio/select). Sempre
  verificar visibilidade real (rect + ancestrais com `display:none`/`hidden`).

Verificação de visibilidade usada nos testes:

```js
const vis = el => {
  const r = el.getBoundingClientRect();
  if (!(r.width > 0 && r.height > 0)) return false;
  let n = el;
  while (n && n.nodeType === 1) {
    const cs = getComputedStyle(n);
    if (n.hidden || cs.display === 'none') return false;
    n = n.parentElement;
  }
  return true;
};
```

---

## 4. Preencher campos

Disparar eventos para o Zeev reconhecer a mudança:

```js
const fire = el => ['input','change','blur']
  .forEach(t => el.dispatchEvent(new Event(t, { bubbles: true })));
```

- **Texto / textarea**: `el.value = '...'; fire(el);`
- **Select**: escolher opção não vazia → `el.value = opts[0].value; fire(el);`
- **Radio**: marcar 1 por `name` e disparar `change`. Para condicionais que
  revelam subformulários (dependentes, deficiência, reabilitado), preferir
  **"Não"** para evitar exigir documentos extras.
- **Data (`data-fieldformat="DATA"`)**: pode ser input nativo `type=date`
  (flatpickr-mobile) ou texto com máscara `dd/mm/aaaa`. Usar datas coerentes
  (ex.: início 5 dias à frente).
- **Máscaras (`data-inputmask`)**: respeitar o formato. Ex.: **Telefone de
  contato de emergência** usa máscara de fixo `(99) 9999.9999` — celular
  `(11) 99999-8888` é rejeitado/reformatado. Conferir `data-inputmask`.
- **Sugestão (`SUGGEST2`)**: **não adianta setar `.value`** (o Zeev limpa).
  É preciso digitar ≥ 3 letras e **clicar numa sugestão**:
  - digitar no campo → aguardar ~1,5s → a lista aparece em
    `ul.typeahead.dropdown-menu li a`
  - clicar no item desejado (ex.: Gestor = "Ester Arraiz de Matos";
    Líder = "Alex Sandro Gomes dos Santos")
- **Dados válidos importam**: CPF inválido pode **travar a conclusão**
  (ver seção 7). Exemplo de CPF válido: `529.982.247-25`.

---

## 5. Anexar arquivos (o aprendizado principal)

### Estrutura
- Campo: `data-fieldformat="FILE"` (ou `FILE_VIEW`).
- Botão "Anexar" tem `onclick="execv2.form.fileUpload.open('<token>', this)"`.
- Clicar abre um **modal com iframe**: `.../files/upload?c=<token>&i=<row>`.

Dentro do modal de upload:
- `<input name="files[]" type="file">`
- `#inpDsDocType` (tipo de documento — preencher)
- `#inpDsResume` (observação; limitado a <1024)
- `#inpChkStRequesterFile` (checkbox opcional)
- `__RequestVerificationToken` (hidden)
- Botões: **Cancelar** (`upload.cancel()`) e **Iniciar upload agora** (`upload.doIt()`)

### Como o envio funciona (por que às vezes falha)
`upload.doIt()`:
1. Valida `#inpDsResume` e `.template-upload .error`.
2. Conta `#fileupload .template-upload .name` que casem `acceptDocFileTypes`.
3. Se `> 0`, aciona o start do plugin **blueimp jQuery File Upload** e faz o
   upload AJAX; se **0**, apenas fecha o modal **sem enviar**.

➡️ Se a linha `.template-upload` não existir, nada é enviado (campo fica vazio).
Foi a causa de falhas intermitentes em alguns documentos.

### Técnica que funciona (confiável)

> O CDP `DOM.setFileInputFiles`/`setInputFiles` está **bloqueado** ("Not allowed")
> neste ambiente. Por isso, construímos o `File` **dentro da página** a partir
> de base64 e adicionamos à **fila do widget** (não basta `input.files` + `change`).

```js
// dentro do iframe /files/upload
const $ = window.jQuery;
const bin = atob(b64);                 // b64 = imagem/arquivo em base64
const arr = new Uint8Array(bin.length);
for (let i = 0; i < bin.length; i++) arr[i] = bin.charCodeAt(i);
const file = new File([arr], 'exemplo.png', { type: 'image/png' });

$('#fileupload').fileupload('add', { files: [file] });   // <— CRIA a linha .template-upload
// preencher tipo de documento
document.getElementById('inpDsDocType').value = 'exemplo';
```

Depois:
1. Aguardar `#fileupload .template-upload` existir.
2. Clicar **“Iniciar upload agora”**.
3. Aguardar ~5s e validar o campo: `el.value` com `../Storage/.../arquivo_....png`
   e/ou `.containerFormFileLink` com o nome.

### Passo a passo para anexar um campo

```js
// pseudo-rotina "doUpload(id)"
// 1. fechar modais pendentes (upload.cancel / colorbox)
// 2. ff = re-obter o frame do formulário (document.readyState != 'loading')
// 3. ff.addScriptTag({ path: '.../b64.js' })  // define window.__CRP_B64
// 4. se o campo já tem value -> pular
// 5. clicar no botão: td.querySelector('button[onclick*="fileUpload"]').click()
// 6. uf = aguardar frame '/files/upload' com input[name="files[]"]
// 7. uf.evaluate: $('#fileupload').fileupload('add', { files:[file] })
//    (b64 vindo de window.parent.__CRP_B64)
// 8. aguardar .template-upload; clicar "Iniciar upload agora"
// 9. aguardar ~5s; re-obter ff; validar campo
// 10. fechar modal; repetir
```

### Regras de ouro
- **Cada upload re-renderiza a tarefa** (o frame é recriado, `Execution context
  was destroyed`). **Re-obter o frame a cada iteração** e aguardar `readyState`.
- **Anexos só persistem ao concluir a tarefa.** Recarregar antes de concluir
  perde anexos/campos não salvos.
- **Ordem correta: anexar TODOS os documentos primeiro → preencher os campos por
  último → concluir.** (uploads resetam campos de texto ainda não salvos).
- Ter paciência/retry: o widget às vezes precisa de 2ª tentativa.

### Documentos obrigatórios vistos no fluxo de contratação (T08)
RG, CPF, CNH, Comprovante de Endereço, CTPS, PIS/PASEP, Carteira de Vacinação,
Certidão, Comprovante de Escolaridade, Comprovação de Experiências,
Foto para Marketing, Foto para Crachá, Currículo (13 no total).

---

## 6. Concluir a tarefa

1. Botão **Concluir** (`#btnFinish`, chama `conclude()`).
2. Validações:
   - Campos obrigatórios vazios → colorbox **“Atenção! Ocorreram os seguintes
     erros: ..."** (lista os campos/anexos pendentes).
   - **Checklist** obrigatório → `#ContainerConclusionCheckList` com
     `input[type=checkbox]` (marcar todos) antes de concluir.
3. Confirm **“Finalizar tarefa / Você deseja finalizar esta tarefa?”**
   (`.cryo-confirm-dialog`) → clicar **Finalizar**.
4. Modal **“Finalizando a tarefa”** (gif) → avança para a próxima tarefa.

Outros botões:
- Aprovação: `#btnApprove` (“Aprovar”) → confirm “Aprovar tarefa”.
- `customBtn_Revisão solicitada` (“Solicitar revisão”).

---

## 7. Problemas comuns e como resolver

| Sintoma | Causa provável | Solução |
|---|---|---|
| Anexo não persiste / campo vazio após "Iniciar upload" | Linha `.template-upload` não criada | `$('#fileupload').fileupload('add', {files:[file]})` |
| `DOM.setFileInputFiles: Not allowed` | CDP de file input bloqueado no ambiente | Construir `File` via base64 + fila do widget |
| `Execution context was destroyed` | Form re-renderizou após upload | Re-obter o frame e tratar/retry |
| Anexos somem ao recarregar | Tarefa não concluída (não salvou) | Concluir para persistir |
| Campos de texto somem | Upload re-renderizou e resetou | Preencher campos **depois** dos anexos |
| Trava em “Finalizando a tarefa” | Dados inválidos (CPF/PIS/datas) com erro silencioso | Usar dados válidos (CPF `529.982.247-25`, etc.) |
| Telefone rejeitado | Máscara de fixo `(99) 9999.9999` | Usar formato de fixo (ex.: `(11) 3333-4444`) |
| Campo de sugestão vazio | `SUGGEST2` não aceita `value` direto | Digitar ≥3 letras e escolher da lista |
| Card de ações oculto indevidamente | Loop do modo "sem ação" | Corrigido: módulos reabrem antes de medir |
| Erros no console "Permissions policy violation: unload" | Inofensivo (jQuery/orquestra) | Ignorar |

---

## 8. Referências de DOM/IDs úteis

- `#containerRequest` — raiz do formulário
- `#crp-info-card`, `#crp-summary`, `.crp-actions`, `.crp-action-content`
- `#controllers`, `#btnFinish`, `#BtnSend`, `#btnApprove`
- `#ContainerConclusionCheckList` — checklist
- `#colorbox` / `.cryo-confirm-dialog` — confirmações (Finalizar/Aprovar/Atenção)
- `#fileupload`, `.template-upload`, `input[name="files[]"]`, `#inpDsDocType`
- `ul.typeahead.dropdown-menu li a` — sugestões (SUGGEST2)

---

## 9. Checklist rápido para uma nova sessão de teste

- [ ] Abrir homologação `/manage/process-test?...inpStSimulation=S`
- [ ] `Iniciar teste` → preencher abertura → `Enviar solicitação`
- [ ] Abrir a tarefa na lista (linha `tasklist_open_task`)
- [ ] Anexar **todos** os documentos obrigatórios (método da seção 5)
- [ ] Preencher os campos (texto/select/radio; sugestões via lista; datas/máscaras)
- [ ] Marcar checklist se houver
- [ ] `Concluir` → se listar pendências, resolver e repetir
- [ ] Confirmar "Finalizar tarefa" e aguardar avançar
- [ ] Repetir na próxima tarefa

---

## 10. Exemplo de dados usados no teste

- CPF: `529.982.247-25` (válido)
- PIS/PASEP: `12044550952`
- E-mail: `teste.interface@example.com`
- Telefone/celular (com máscara de fixo): `(11) 3333-4444`
- CEP: `01000-000` · Cidade: `São Paulo` · UF: escolher opção válida
- Datas: nascimento `01/01/1990`; expedição RG `01/01/2015`; início contrato ~hoje+5
- Nomes: `Maria Teste` (mãe), `José Teste` (pai), `Contato Teste` (emergência)
- Arquivo de anexo: `exemplo.png` (imagem), via base64 no widget
