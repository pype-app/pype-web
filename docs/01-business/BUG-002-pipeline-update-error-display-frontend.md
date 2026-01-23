# BUG-002: Mensagem de Erro Genérica no Toast ao Salvar Pipeline

**Status**: 🔴 Aberto  
**Prioridade**: Alta  
**Reportado em**: 23/01/2026  
**Módulo**: Frontend - Pipeline Editor

---

## 📋 Descrição

Ao salvar um pipeline e ocorrer erro na API (HTTP 400), o toast de erro exibe mensagens genéricas como `[object Object]` ao invés de mostrar a descrição legível do erro retornado pelo backend.

---

## 🐛 Comportamento Atual

1. Usuário edita um pipeline
2. Clica em "Salvar"
3. Backend retorna HTTP 400 com corpo de erro
4. **Toast exibe**: 
   ```
   Erro ao salvar pipeline: Dados inválidos:
   [object Object]
   [object Object]
   ```
5. Console do navegador mostra objeto AxiosError completo, mas sem tratamento adequado

---

## ✅ Comportamento Esperado

### Cenário 1: Erro com Mensagem Estruturada da API
**DADO** que a API retorna HTTP 400 com body:
```json
{
  "success": false,
  "message": "Validação falhou",
  "errors": {
    "yamlDefinition": ["YAML inválido na linha 15"],
    "cronExpression": ["Expressão CRON inválida"]
  }
}
```

**ENTÃO** o toast deve exibir:
```
❌ Erro ao salvar pipeline

Validação falhou:
• yamlDefinition: YAML inválido na linha 15
• cronExpression: Expressão CRON inválida
```

### Cenário 2: Erro Sem Estrutura Clara
**DADO** que a API retorna HTTP 400 sem body estruturado  
**ENTÃO** o toast deve exibir:
```
❌ Erro ao salvar pipeline

Erro desconhecido (status 400). Verifique os dados e tente novamente.
```

### Cenário 3: Erro de Rede
**DADO** que a requisição falha por timeout ou erro de rede  
**ENTÃO** o toast deve exibir:
```
❌ Erro de conexão

Não foi possível comunicar com o servidor. Verifique sua conexão.
```

---

## 🔍 Passos para Reproduzir

1. Fazer login na aplicação
2. Acessar a lista de pipelines
3. Clicar em "Editar" em qualquer pipeline existente
4. **NÃO alterar nenhum campo**
5. Clicar em "Salvar"
6. **Resultado**: Toast exibe `[object Object]` ao invés de mensagem legível

---

## 📊 Evidências

### Console do Navegador
```javascript
📤 Enviando dados do pipeline: Object
🔧 YAML sendo enviado: pipeline: "production_op_closed"...

Erro ao salvar pipeline:
AxiosError {
  code: "ERR_BAD_REQUEST",
  message: "Request failed with status code 400",
  response: {
    data: {...},  // <- Objeto não está sendo extraído corretamente
    status: 400,
    statusText: 'Bad Request'
  }
}
```

### Toast Exibido
```
Erro ao salvar pipeline: Dados inválidos:
[object Object]
[object Object]
```

---

## 🎯 Critérios de Aceite

### AC1: Extração Correta de Mensagens de Erro
**DADO** que a API retorna HTTP 4xx/5xx com `response.data.message`  
**QUANDO** o frontend processa o erro  
**ENTÃO** deve extrair e exibir `response.data.message` no toast

### AC2: Formatação de Erros de Validação
**DADO** que a API retorna `response.data.errors` (objeto campo → mensagens)  
**QUANDO** o toast for exibido  
**ENTÃO** deve listar todos os erros de forma legível:
- Usar bullet points (`•`) para cada campo
- Mostrar nome do campo e mensagem

### AC3: Fallback para Erros Genéricos
**DADO** que a API retorna erro sem `message` ou `errors`  
**QUANDO** o frontend processar a resposta  
**ENTÃO** deve exibir mensagem genérica: `"Erro ao processar requisição (HTTP {statusCode})"`

### AC4: Tratamento de Erros de Rede
**DADO** que a requisição falha por timeout/network error  
**QUANDO** não há `response.data` disponível  
**ENTÃO** deve exibir: `"Erro de conexão. Verifique sua rede e tente novamente."`

### AC5: Log Estruturado no Console (Dev Mode)
**DADO** que `NODE_ENV === 'development'`  
**QUANDO** ocorre erro  
**ENTÃO** deve logar no console:
- Erro completo (para debug)
- URL da requisição
- Payload enviado
- Resposta recebida

---

## 🔗 Relacionado

- **Backend**: BUG-001-pipeline-update-400-backend.md
- **Arquivo suspeito**: `pype-web/src/components/pipelines/PipelineEditor.tsx` (handler de save)
- **Lib de API**: `pype-web/src/lib/api-client.ts` (interceptor de erros do Axios)

---

## 💡 Notas Técnicas para o DEV

### Implementação Sugerida (Exemplo)

**Arquivo**: `src/lib/api-client.ts` ou `src/utils/error-handler.ts`

```typescript
export function formatApiError(error: any): string {
  // Caso 1: Resposta estruturada da API
  if (error.response?.data) {
    const { message, errors } = error.response.data;
    
    if (errors && typeof errors === 'object') {
      const errorList = Object.entries(errors)
        .map(([field, messages]) => `• ${field}: ${Array.isArray(messages) ? messages.join(', ') : messages}`)
        .join('\n');
      return `${message || 'Validação falhou'}:\n${errorList}`;
    }
    
    if (message) return message;
  }
  
  // Caso 2: Erro HTTP sem body
  if (error.response?.status) {
    return `Erro ao processar requisição (HTTP ${error.response.status})`;
  }
  
  // Caso 3: Erro de rede
  if (error.code === 'ERR_NETWORK' || !error.response) {
    return 'Erro de conexão. Verifique sua rede e tente novamente.';
  }
  
  // Fallback
  return error.message || 'Erro desconhecido';
}
```

**Uso no componente**:
```typescript
try {
  await updatePipeline(id, data);
  toast.success('Pipeline salvo com sucesso!');
} catch (error) {
  const errorMessage = formatApiError(error);
  toast.error(`Erro ao salvar pipeline:\n${errorMessage}`);
  
  if (process.env.NODE_ENV === 'development') {
    console.error('Erro detalhado:', error);
  }
}
```

---

## 🧪 Checklist de Testes

- [ ] Erro 400 com `message` e `errors` estruturados
- [ ] Erro 400 sem body (resposta vazia)
- [ ] Erro 500 do servidor
- [ ] Timeout de requisição
- [ ] Erro de rede (offline)
- [ ] Erro com `errors` sendo string (não objeto)
- [ ] Erro com `errors` sendo array vazio
