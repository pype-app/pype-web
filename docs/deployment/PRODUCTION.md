# Pype Web - Deployment Guide

Este guia explica como fazer deploy do Pype Web usando diferentes métodos.

## 📁 Arquivos de Deploy

### Arquivos Docker Compose

- **`docker-compose.yml`**: Para desenvolvimento local (build da imagem)
- **`docker-compose.production.yml`**: Para produção (usa imagem do GHCR)

### Arquivos de Ambiente

- **`.env.example`**: Template de exemplo
- **`.env.production`**: Configuração para produção (usado pelo `docker-compose.production.yml`)

### Scripts

- **`production-up.ps1`**: Inicia a aplicação em produção
- **`production-down.ps1`**: Para a aplicação em produção
- **`scripts/pull-and-run.ps1`**: Alternativa para rodar container individual

## 🚀 Deploy em Produção

### Método 1: Docker Compose (Recomendado)

**Vantagens:**
- Gerenciamento simplificado
- Configuração centralizada no `.env.production`
- Fácil atualização de versões
- Integração com outros serviços (pype-admin)

**Como usar:**

```powershell
# 1. Editar configurações
# Edite o arquivo .env.production com suas configurações

# 2. Iniciar (primeira vez ou quando quiser atualizar)
.\scripts\production\up.ps1 -Pull

# 3. Verificar status
docker-compose -f docker-compose.production.yml ps

# 4. Ver logs
docker-compose -f docker-compose.production.yml logs -f

# 5. Parar
.\scripts\production\down.ps1
```

**Opções avançadas:**

```powershell
# Usar versão específica
.\scripts\production\up.ps1 -Tag "v1.0.0"

# Apenas parar (não remove containers)
.\scripts\production\down.ps1

# Parar e remover containers
.\scripts\production\down.ps1 -Remove

# Parar e remover tudo (incluindo volumes)
.\scripts\production\down.ps1 -Remove -Volumes
```

### Método 2: Script Individual

**Vantagens:**
- Controle fino sobre parâmetros
- Não precisa do docker-compose
- Útil para testes rápidos

**Como usar:**

```powershell
cd scripts

# Executar com configurações do .env.production
.\docker\pull-and-run.ps1

# Sobrescrever configurações específicas
.\docker\pull-and-run.ps1 -Port 8080 -ApiUrl "http://api.example.com"

# Usar versão específica
.\docker\pull-and-run.ps1 -Tag "v1.0.0"

# Gerenciar o container
.\docker\manage.ps1 -Action status
.\docker\manage.ps1 -Action logs -Follow
.\docker\manage.ps1 -Action restart
```

## 🔧 Configuração

### .env.production

```env
# Tag da imagem Docker
IMAGE_TAG=latest

# Porta da aplicação
PORT=3000

# URL da API backend
PYPE_API_URL=http://localhost:8080

# Ambiente Node.js
NODE_ENV=production
```

### Variáveis Importantes

| Variável | Descrição | Padrão |
|----------|-----------|--------|
| `IMAGE_TAG` | Tag da imagem Docker a usar | `latest` |
| `PORT` | Porta onde a aplicação roda | `3000` |
| `PYPE_API_URL` | URL da API backend | `http://localhost:8080` |
| `NODE_ENV` | Ambiente Node.js | `production` |

## 🔄 Atualizando para Nova Versão

### Com Docker Compose

```powershell
# Opção 1: Atualizar para latest
.\scripts\production\down.ps1
.\scripts\production\up.ps1 -Pull

# Opção 2: Usar versão específica
# Edite .env.production e altere IMAGE_TAG=v1.2.0
.\scripts\production\down.ps1
.\scripts\production\up.ps1 -Pull

# Opção 3: Via parâmetro (sem editar .env)
.\scripts\production\down.ps1
.\scripts\production\up.ps1 -Tag "v1.2.0" -Pull
```

### Com Script Individual

```powershell
cd scripts

# Para o container atual
.\docker\manage.ps1 -Action remove

# Baixa e inicia nova versão
.\docker\pull-and-run.ps1 -Tag "v1.2.0"
```

## 📊 Monitoramento

```powershell
# Status dos containers
docker-compose -f docker-compose.production.yml ps

# Logs em tempo real
docker-compose -f docker-compose.production.yml logs -f pype-web

# Estatísticas de recursos
docker stats pype-web

# Health check
docker inspect pype-web --format='{{.State.Health.Status}}'
```

## 🐛 Troubleshooting

### Container não inicia

```powershell
# Verificar logs
docker-compose -f docker-compose.production.yml logs pype-web

# Verificar configurações
docker-compose -f docker-compose.production.yml config
```

### Porta já em uso

```powershell
# Edite .env.production e altere PORT
# Ou use via parâmetro:
.\production-up.ps1 -Pull
# (vai ler a nova porta do .env.production)
```

### Erro de autenticação no GHCR

```powershell
# Fazer login no GitHub Container Registry
docker login ghcr.io -u seu-usuario

# Depois tentar novamente
.\production-up.ps1 -Pull
```

### Reset completo

```powershell
# Para e remove tudo
.\production-down.ps1 -Remove -Volumes

# Recria do zero
.\production-up.ps1 -Pull
```

## 🔗 Integração com Pype Admin

Para conectar o Pype Web com o Pype Admin:

1. Certifique-se que o `pype-network` existe:
   ```powershell
   docker network create pype-network
   ```

2. Configure o `.env.production`:
   ```env
   PYPE_API_URL=http://pype-admin:8080
   ```

3. Inicie ambos os serviços na mesma rede.

## 📝 Desenvolvimento vs Produção

| Aspecto | Desenvolvimento | Produção |
|---------|----------------|----------|
| Docker Compose | `docker-compose.yml` | `docker-compose.production.yml` |
| Imagem | Build local | Pull do GHCR |
| Configuração | `.env` ou padrões | `.env.production` |
| Scripts | `npm run dev` | `production-up.ps1` |
| Hot Reload | ✅ Sim | ❌ Não |
| Otimização | ❌ Não | ✅ Sim |
