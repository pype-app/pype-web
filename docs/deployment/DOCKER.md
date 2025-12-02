# Docker Setup - Pype Web

Este documento descreve como executar o Pype Web usando Docker.

## 📋 Pré-requisitos

- Docker 20.10+
- Docker Compose 2.0+

## 🚀 Configuração Rápida

### 1. Variáveis de Ambiente

Copie e customize o arquivo de ambiente:

```bash
cp .env.example .env
```

Configure as variáveis conforme necessário:

```env
# Obrigatórios
NODE_ENV=production
PYPE_API_URL=http://pype-admin:8080

# Banco de dados
POSTGRES_PASSWORD=seu-password-seguro

# Email (opcional, para recuperação de senha)
EMAIL_SMTP_HOST=smtp.gmail.com
EMAIL_USERNAME=seu-email@gmail.com
EMAIL_PASSWORD=sua-senha-de-app
```

### 2. Executar com Docker Compose

**Apenas Pype Web (conectado ao backend local):**

```bash
docker-compose up pype-web
```

**Stack completo (Web + Admin + Engine + Banco + Redis):**

```bash
docker-compose --profile full up -d
```

### 3. Acessar Aplicação

- **Frontend**: http://localhost:3000
- **Admin API**: http://localhost:8080
- **Engine**: http://localhost:8081
- **Hangfire Dashboard**: http://localhost:8080/hangfire
- **PostgreSQL**: localhost:5432
- **Redis**: localhost:6379

## 🏗️ Estrutura do Docker Compose

### Serviços Disponíveis

#### `pype-web`
- Next.js frontend da aplicação
- Porta: 3000
- Perfil: full

#### `pype-admin`
- Backend API (Pype.Admin)
- Porta: 8080
- Perfil: full
- Dependências: PostgreSQL

#### `pype-engine`
- Motor de execução de jobs
- Porta: 8081
- Perfil: full
- Dependências: PostgreSQL, Redis

#### `postgres`
- Banco de dados PostgreSQL
- Porta: 5432
- Volume: `postgres_data`
- Perfil: full

#### `redis`
- Cache e job queue
- Porta: 6379
- Volume: `redis_data`
- Perfil: full

## 📦 Build Manual

### Build apenas do Pype Web

```bash
docker build -t pype-web:local .
```

### Build com tag customizada

```bash
docker build -t ghcr.io/seu-usuario/pype-web:v1.0.0 .
```

## 🔧 Troubleshooting

### Aplicação não conecta ao backend

**Problema**: "Connection refused" ao tentar acessar API

**Solução**:
```bash
# Verificar se admin está rodando
docker-compose ps pype-admin

# Checar logs
docker-compose logs pype-admin

# Verificar URL correta
echo $PYPE_API_URL
```

### Erro de porta em uso

**Problema**: "Address already in use"

**Solução**:
```bash
# Encerrar containers existentes
docker-compose down

# Ou usar porta diferente
docker-compose -f docker-compose.yml up -p 3001:3000
```

### Banco de dados não inicializa

**Problema**: "Connection failed" ao PostgreSQL

**Solução**:
```bash
# Verificar status do banco
docker-compose ps postgres

# Checar logs
docker-compose logs postgres

# Reiniciar banco
docker-compose restart postgres
```

## 🧹 Limpeza

### Parar containers

```bash
docker-compose down
```

### Remover volumes (cuidado - deleta dados!)

```bash
docker-compose down -v
```

### Remover imagens

```bash
docker-compose down --rmi all
```

## 📊 Monitoramento

### Ver logs em tempo real

```bash
# Todos os serviços
docker-compose logs -f

# Apenas pype-web
docker-compose logs -f pype-web

# Últimas 100 linhas
docker-compose logs --tail=100 pype-web
```

### Verificar status dos containers

```bash
docker-compose ps
```

### Executar comando dentro de container

```bash
# Acessar shell do pype-web
docker-compose exec pype-web sh

# Executar comando
docker-compose exec pype-web npm --version
```

## 🔐 Segurança

### Em Produção

1. **Change default passwords:**
   ```bash
   # Gere senha forte
   openssl rand -base64 32
   ```

2. **Update JWT Secret:**
   ```env
   JWT_SECRET_KEY=seu-token-secreto-muito-longo-e-aleatorio
   ```

3. **Configure HTTPS:**
   ```bash
   # Use nginx reverse proxy ou certificado SSL
   ```

4. **Proteja .env:**
   ```bash
   chmod 600 .env
   ```

## 📈 Performance

### Limites de Recursos

Customize em `docker-compose.yml`:

```yaml
pype-web:
  deploy:
    resources:
      limits:
        cpus: '1'
        memory: 512M
      reservations:
        cpus: '0.5'
        memory: 256M
```

### Cache Strategy

O Dockerfile usa multi-stage build e layer caching:

```dockerfile
# Layers são cacheadas para builds mais rápidos
FROM node:20-alpine AS builder
...
COPY package*.json ./  # Cache invalidado se package.json muda
RUN npm ci --frozen-lockfile
...
```

## 🚢 Deployment

### Deploy para Azure Container Registry

```bash
# Login no ACR
az acr login --name seu-registry

# Build e push
docker build -t seu-registry.azurecr.io/pype-web:v1.0.0 .
docker push seu-registry.azurecr.io/pype-web:v1.0.0

# Deploy no Azure App Service
az webapp config container set \
  --name seu-webapp \
  --resource-group seu-rg \
  --docker-custom-image-name seu-registry.azurecr.io/pype-web:v1.0.0
```

### Deploy para Docker Hub

```bash
# Login
docker login

# Tag e push
docker tag pype-web:local seu-usuario/pype-web:latest
docker push seu-usuario/pype-web:latest
```

## 📚 Referências

- [Next.js Docker Guide](https://nextjs.org/docs/deployment/docker)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [Docker Best Practices](https://docs.docker.com/develop/dev-best-practices/)

## 🆘 Suporte

Para problemas ou dúvidas:

1. Verifique os logs: `docker-compose logs`
2. Consulte a [documentação do projeto](../README.md)
3. Abra uma issue no GitHub
