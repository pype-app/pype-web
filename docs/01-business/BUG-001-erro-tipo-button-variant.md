# BUG-001: Erro de Tipo na Propriedade Variant do Button em ErrorDisplay

**Data de Reporte:** 2026-01-23  
**Severidade:** 🔴 Bloqueador (Build Failure)  
**Tipo:** Bug de Compilação TypeScript  
**Componente:** Frontend (pype-web)  
**Arquivo Afetado:** `src/components/errors/ErrorDisplay.tsx:162`

---

## 📋 Resumo

O build do projeto pype-web está falhando devido a um erro de tipo TypeScript no componente `ErrorDisplay`. O componente `Button` está recebendo a variante `"default"`, mas esse valor não está incluído na união de tipos válidos para a propriedade `variant`.

---

## 🐛 Comportamento Atual

### Erro de Compilação
```
./src/components/errors/ErrorDisplay.tsx:162:15
Type error: Type '"default"' is not assignable to type 
'"primary" | "secondary" | "outline" | "ghost" | "danger" | undefined'.

160 | <Button
161 | size="sm"
162 | variant="default"
     | ^
163 | onClick={() => onApplySuggestion(primarySuggestion)}
164 | >
165 | ✨ Apply Suggestion: {primarySuggestion}
```

### Código Problemático (linha 160-166)
```tsx
<Button
  size="sm"
  variant="default"  // ❌ Valor inválido
  onClick={() => onApplySuggestion(primarySuggestion)}
>
  ✨ Apply Suggestion: {primarySuggestion}
</Button>
```

### Contexto Técnico
- **Tipo Definido em:** `src/components/ui/Button.tsx:4`
- **Variantes Válidas:** `'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | undefined`
- **Variante Usada:** `"default"` (não existe)

---

## ✅ Comportamento Esperado

### Objetivo de Negócio
O botão de "Apply Suggestion" deve aparecer com uma estilização que destaque a ação primária/positiva sugerida pelo sistema de erros inteligente.

### Critérios de Aceite (QA)

**Dado** que o sistema exibe um erro com sugestão aplicável  
**Quando** o componente `ErrorDisplay` renderiza o botão "✨ Apply Suggestion"  
**Então** o botão deve:
1. ✅ Compilar sem erros TypeScript
2. ✅ Usar uma variante válida do componente `Button`
3. ✅ Ter aparência visual de ação primária (destacada)
4. ✅ Manter consistência com o design system do Pype

### Sugestões de Correção
- **Opção 1 (Recomendada):** Alterar `variant="default"` para `variant="primary"` (ação principal)
- **Opção 2:** Alterar para `variant="secondary"` (se for ação secundária)
- **Opção 3:** Remover a propriedade `variant` (usa o padrão do componente)

---

## 🔍 Passos para Reproduzir

1. **Configurar ambiente:**
   ```bash
   cd c:\projetos\pype-app\pype-web
   npm install
   ```

2. **Executar build:**
   ```bash
   npm run build
   ```

3. **Verificar saída:**
   ```
   Running TypeScript ..Failed to compile.
   Type error: Type '"default"' is not assignable to type...
   ```

4. **Arquivo afetado:**
   - Abrir `src/components/errors/ErrorDisplay.tsx`
   - Localizar linha 162
   - Observar propriedade `variant="default"`

---

## 🎯 Impacto

### Impacto Técnico
- ❌ **Build bloqueado:** Impossível gerar versão de produção
- ❌ **Deploy impedido:** Não pode subir para GHCR/Azure
- ⚠️ **Type Safety quebrado:** Contrato de interface violado

### Impacto de Negócio
- ❌ **Nenhum deploy possível** até correção
- ⏱️ **Bloqueio de features:** Outras features não podem ser entregues
- 🔴 **Severity = Bloqueador:** Prioridade máxima

---

## 📝 Notas Adicionais

### Histórico do Erro
Este erro foi introduzido no componente `ErrorDisplay`, que faz parte do sistema de mensagens de erro inteligentes (ref: `IMP-011-mensagens-erro-frontend.md`). O componente está funcional em dev mode (Next.js ignora alguns erros TS), mas falha no build de produção.

### Componentes Relacionados
- `src/components/ui/Button.tsx` - Define os tipos de variantes
- `src/components/errors/ErrorDisplay.tsx` - Componente que usa o Button incorretamente

### Contexto de Uso
O botão é exibido quando:
- O erro retornado pela API contém sugestões aplicáveis
- A primeira sugestão contém um valor extraível (regex match `/'([^']+)'/`)
- O callback `onApplySuggestion` está disponível

---

## ✋ Ação Necessária

**Para o desenvolvedor responsável pela correção:**
1. Decidir qual variante melhor representa a ação "Apply Suggestion"
2. Alterar linha 162 de `ErrorDisplay.tsx`
3. Validar que o build passa: `npm run build`
4. Testar visualmente se a estilização está adequada
5. Garantir consistência com outros botões de ação primária no sistema

---

**Documentado por:** GitHub Copilot (Business Analyst)  
**Próxima Etapa:** Encaminhar para desenvolvedor frontend para correção
