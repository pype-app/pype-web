## 🎯 Objetivo

Melhorar a experiência do usuário no fluxo de dry-run e adicionar suporte a teste de YAML customizado (não salvo).

## ✨ Principais Mudanças

### 1. Remoção de Toasts Desnecessários
- ✅ Todos os toasts removidos do `useDryRun.ts` (6 ocorrências)
- ✅ Apenas modal de results é exibido
- ✅ Callbacks (`onComplete`, `onError`) são mantidos para integração

### 2. Suporte a YAML Customizado
- ✅ `useDryRun.startDryRun()` aceita `yamlOverride?: string`
- ✅ `DryRunButton` recebe prop `yamlContent`
- ✅ `PipelineEditor` conecta valor do Monaco Editor ao dry-run
- ✅ Frontend envia YAML editado ao backend (não o salvo)

### 3. Correção de Controle do Modal
- ✅ Modal abre uma vez e permanece aberto
- ✅ Modal não fecha automaticamente
- ✅ Conteúdo atualiza em tempo real durante polling
- ✅ Modal só fecha por ação do usuário (botão X ou Close)

### 4. Tratamento de Erros Melhorado
- ✅ Erros de validação formatados corretamente
- ✅ Detalhes de erros exibidos (path, message)
- ✅ Não mais mensagens "[object Object]"

## 📝 Arquivos Modificados

**Frontend:**
- `src/hooks/useDryRun.ts` - Toasts removidos, yamlOverride adicionado
- `src/components/pipelines/DryRunButton.tsx` - Prop yamlContent
- `src/components/pipelines/DryRunManager.tsx` - Modal permanece aberto
- `src/components/editor/PipelineEditor.tsx` - Conecta editor ao dry-run

## 🧪 Como Testar

1. Editar pipeline no Monaco Editor sem salvar
2. Clicar em "Test Run"
3. Modal de results deve abrir IMEDIATAMENTE e permanecer aberto
4. Nenhum toast deve aparecer durante o fluxo
5. Conteúdo do modal atualiza em tempo real
6. Dry-run executa o YAML editado (não o salvo)

## 📚 Referências

- Task: IMP-005 Dry-Run UI Feature
- Backend PR: #150 (pype-admin)

## ✅ Checklist

- [x] Build compilando sem erros TypeScript
- [x] Toasts removidos corretamente
- [x] Modal permanece aberto durante execução
- [x] YAML customizado sendo enviado ao backend
- [x] Erros formatados corretamente
