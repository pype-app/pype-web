# BUG-003: Dry-Run retorna executionId undefined no frontend

**Status:** ✅ **RESOLVIDO E APROVADO** (2026-01-25)  
**Data de Identificação:** 2026-01-25  
**Data de Resolução:** 2026-01-25  
**Aprovação:** Manual (sem QA formal)  
**Severidade:** Alta  
**Componente:** Frontend (pype-web) + Backend (pype-admin)  
**Funcionalidade Afetada:** Execução Dry-Run de Pipelines

---

## 📋 Descrição do Problema

Ao executar um dry-run de pipeline através da interface web, o frontend não consegue capturar o `executionId` retornado pela API, resultando em uma tentativa de polling com valor `undefined` na URL.

---

## ❌ Comportamento Atual (Incorreto)

1. Usuário clica em "Executar Dry-Run" na interface web
2. Frontend envia POST para `/pipelines/crud/{pipelineId}/dry-run?sampleSize=10`
3. Backend responde HTTP 200 com JSON contendo o `executionId` (exemplo: `cc9487d4-18e2-431a-a030-b32a4db5df14`)
4. Frontend tenta fazer polling do status fazendo GET para `/pipelines/crud/dry-runs/undefined` ❌
5. O polling falha porque `executionId` está undefined

### Evidências do Log Backend:
```
[15:09:41 INF] Dry-run created for pipeline 7a3b6e24-9399-4dd1-b4f5-5d16eb7e2aa3 (ExecutionId: cc9487d4-18e2-431a-a030-b32a4db5df14)
[15:09:41 INF] Request finished HTTP/1.1 POST .../dry-run?sampleSize=10 - 200 null application/json
```

### Evidências da Requisição do Frontend:
```bash
# Segunda requisição (polling) - executionId está "undefined"
curl 'http://localhost:8080/pipelines/crud/dry-runs/undefined'
```

---

## ✅ Comportamento Esperado (Correto)

1. Usuário clica em "Executar Dry-Run" na interface web
2. Frontend envia POST para `/pipelines/crud/{pipelineId}/dry-run?sampleSize=10`
3. Backend responde HTTP 200 com JSON contendo o `executionId`
4. Frontend **extrai corretamente** o `executionId` da resposta
5. Frontend inicia polling fazendo GET para `/pipelines/crud/dry-runs/{executionId}` ✅
6. Usuário visualiza o progresso da execução em tempo real

---

## 🔍 Análise Técnica

### Provável Causa
O código do frontend que consome a resposta do endpoint POST `/dry-run` não está:
- Extraindo o campo `executionId` do objeto de resposta JSON, **OU**
- Armazenando o valor em uma variável de estado antes de iniciar o polling

### Hipóteses de Código Problemático (sem confirmação)
```typescript
// Possível código atual (ERRADO):
const response = await apiClient.post(`/pipelines/crud/${id}/dry-run`);
// Falta: const executionId = response.data.executionId;
pollDryRunStatus(undefined); // ❌ executionId não foi extraído

// Código correto deveria ser:
const response = await apiClient.post(`/pipelines/crud/${id}/dry-run`);
const executionId = response.data.executionId; // ✅ Extrai da resposta
pollDryRunStatus(executionId); // ✅ Passa o valor correto
```

---

## 📦 Passos para Reproduzir

1. Acesse a interface web (http://localhost:3080)
2. Faça login com credenciais válidas
3. Navegue para qualquer pipeline existente
4. Clique no botão "Executar Dry-Run" (ou equivalente)
5. Observe:
   - No Network DevTools do navegador: a primeira requisição POST retorna 200 OK com executionId
   - A segunda requisição GET tenta acessar `/dry-runs/undefined`
   - O polling falha e o usuário não vê o progresso da execução

---

## 🎯 Critérios de Aceite (Para QA Validar)

### ✅ CA-01: ExecutionId Capturado
- **Dado** que o backend retorna um executionId válido (UUID v4)
- **Quando** o frontend recebe a resposta do POST `/dry-run`
- **Então** o executionId deve ser corretamente extraído e armazenado

### ✅ CA-02: Polling com ExecutionId Válido
- **Dado** que o dry-run foi iniciado
- **Quando** o frontend inicia o polling de status
- **Então** a URL deve conter o executionId real (exemplo: `/dry-runs/cc9487d4-18e2-431a-a030-b32a4db5df14`)
- **E** o valor não deve ser `undefined` ou `null`

### ✅ CA-03: Acompanhamento de Progresso
- **Dado** que o polling está funcionando corretamente
- **Quando** o dry-run está em execução
- **Então** o usuário deve visualizar:
  - Status atual da execução (Running, Completed, Failed)
  - Logs em tempo real (se disponível)
  - Progresso de cada step do pipeline

### ✅ CA-04: Tratamento de Erro de Rede
- **Dado** que o POST `/dry-run` falha por erro de rede
- **Quando** a resposta não contém executionId
- **Então** o sistema deve exibir mensagem de erro clara
- **E** não deve tentar iniciar o polling com valor undefined

---

## 📝 Notas Adicionais

### Contexto da Requisição Original
- **Pipeline ID:** `7a3b6e24-9399-4dd1-b4f5-5d16eb7e2aa3`
- **ExecutionId Gerado:** `cc9487d4-18e2-431a-a030-b32a4db5df14`
- **Sample Size:** 10
- **Tenant:** daniel (Pro plan)
- **User:** Daniel Buona (Owner)

### Componentes Envolvidos
- **Frontend:** Provavelmente arquivo relacionado a execução de pipelines (exemplo: `src/components/pipelines/*` ou `src/app/(dashboard)/pipelines/*`)
- **API Client:** `src/lib/api-client.ts` ou store de pipelines
- **Zustand Store:** Possivelmente `src/store/pipelines.ts`

### Impacto
- **Usuários Afetados:** Todos que tentam executar dry-run via interface web
- **Workaround Disponível:** Executar dry-run via API diretamente (curl/Postman) e acompanhar logs no backend
- **Bloqueio:** Impede validação de pipelines antes de ativar o schedule

---

## ✅ RESOLUÇÃO APLICADA (2026-01-25)

### Root Cause Identificado
O bug era **TRIPLO** (frontend type mismatch + backend table mismatch + job Hangfire não enfileirado):

1. **Frontend:** Interface TypeScript esperava `dryRunId` mas backend retornava `executionId`
2. **Backend:** POST criava registro em `PipelineExecutions`, mas GET buscava em `DryRunExecutions` (tabela diferente)
3. **Hangfire:** Registro criado no banco mas job NÃO era enfileirado → dry-run nunca executava

### Correções Implementadas

**Frontend (pype-web):**
- ✅ `src/types/dry-run.ts`: Interface `StartDryRunResponse` corrigida para usar `executionId` (não `dryRunId`)
- ✅ `src/hooks/useDryRun.ts`: Destructuring corrigido + type guard para validar status response

**Backend (pype-admin):**
- ✅ `PipelineCommandService.cs`: Alterado para criar `DryRunExecution` em tabela `DryRunExecutions` (não mais `PipelineExecution`)
- ✅ `PipelineCommandService.cs`: Adicionado enfileiramento Hangfire (`_backgroundJobClient.Enqueue(() => PipelineJobs.ExecuteDryRun(...)`)
- ✅ `Pipelines.Crud.Endpoints.cs`: Status response corrigido para `"pending"` (era `"completed"`)
- ✅ `Pipelines.Crud.Endpoints.cs`: Input validation adicionado (`Math.Clamp(sampleSize, 1, 1000)`)
- ✅ `PipelineModels.cs`: `DryRunCommand` atualizado com parâmetro `SampleSize`

### Code Review
- **Score:** 9.8/10
- **Status:** APROVADO PARA PRODUÇÃO
- **Reviewer:** Code Reviewer - Pype BMAD Architecture

### Testes de Aceitação (Validados)
- ✅ POST dry-run retorna `status: "pending"` (não "completed")
- ✅ Hangfire dashboard mostra job enfileirado
- ✅ GET /dry-runs/{id} retorna 200 (não 404)
- ✅ Polling funciona (status muda: pending → running → completed)
- ✅ Input validation: `sampleSize=-1` → Clampa para 1
- ✅ Input validation: `sampleSize=9999999` → Clampa para 1000

### Arquivos Modificados
- `pype-web/src/types/dry-run.ts`
- `pype-web/src/hooks/useDryRun.ts`
- `pype-admin/src/Pype.Admin/Services/Pipelines/PipelineCommandService.cs`
- `pype-admin/src/Pype.Admin/Services/Pipelines/PipelineModels.cs`
- `pype-admin/src/Pype.Admin/Routes/Pipelines.Crud.Endpoints.cs`

---

## 🔗 Referências

- **Documentação Técnica:** Ver `docs/02-architecture/BUG-003-README.md`
- **Implementation Summary:** Ver `docs/03-development/BUG-003-implementation-summary.md`
- **Code Review:** Ver `docs/04-qa/BUG-003-code-review.md`
- **Lessons Learned:** Ver `pype-admin/docs/LESSONS_LEARNED.md` (seção 2026-01-25)
- **Endpoint Backend:** `POST /pipelines/crud/{pipelineId}/dry-run`
- **Endpoint Polling:** `GET /pipelines/crud/dry-runs/{executionId}`
