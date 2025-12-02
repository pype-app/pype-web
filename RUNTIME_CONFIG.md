# Runtime Configuration Guide

## Problema Resolvido

O Next.js substitui variáveis de ambiente em **build time**, o que significa que se você alterar `.env.production` depois de buildar a imagem, as mudanças não terão efeito. A aplicação continuará usando os valores que estavam presentes durante o build.

## Solução Implementada

Implementamos **runtime configuration** que permite que as variáveis de ambiente sejam lidas quando o container inicia, não quando a imagem é buildada.

### Como Funciona

1. **Endpoint `/api/config`**: Expõe variáveis de ambiente do servidor em runtime
2. **API Client dinâmico**: Busca configuração do endpoint antes de fazer requisições
3. **Cache inteligente**: Armazena config após primeira busca para performance
4. **Fallback automático**: Usa valores padrão se o endpoint falhar

## Configurando em Diferentes Ambientes

### 1. Docker Compose (Desenvolvimento Local)

```yaml
services:
  pype-web:
    image: pype-web:latest
    environment:
      PYPE_API_URL: http://pype-admin:8080
    ports:
      - "3080:3000"
```

Ou usando arquivo `.env`:

```bash
# .env
PYPE_API_URL=http://pype-admin:8080
```

```yaml
services:
  pype-web:
    env_file:
      - .env
```

### 2. Docker Run (Manual)

```bash
docker run -d \
  -e PYPE_API_URL=http://pype-admin:8080 \
  -p 3080:3000 \
  pype-web:latest
```

### 3. Azure Web App

#### Via Portal Azure
1. Navegue até seu Web App
2. Settings → Configuration → Application settings
3. Adicione:
   - `PYPE_API_URL` = `https://pype-admin.azurewebsites.net`

#### Via Azure CLI (PowerShell)

```powershell
# Configurar Web App
az webapp config appsettings set `
  --resource-group MyResourceGroup `
  --name pype-web `
  --settings PYPE_API_URL="https://pype-admin.azurewebsites.net"

# Verificar configuração
az webapp config appsettings list `
  --resource-group MyResourceGroup `
  --name pype-web `
  --query "[?name=='PYPE_API_URL']"
```

### 4. Azure Container Instances

```powershell
az container create `
  --resource-group MyResourceGroup `
  --name pype-web `
  --image myregistry.azurecr.io/pype-web:latest `
  --cpu 1 `
  --memory 1 `
  --environment-variables `
    PYPE_API_URL=https://pype-admin.azurewebsites.net `
  --ports 3000
```

### 5. Kubernetes

#### ConfigMap

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: pype-web-config
data:
  PYPE_API_URL: "http://pype-admin:8080"
```

#### Deployment

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: pype-web
spec:
  replicas: 2
  template:
    spec:
      containers:
      - name: pype-web
        image: pype-web:latest
        ports:
        - containerPort: 3000
        envFrom:
        - configMapRef:
            name: pype-web-config
```

Aplicar:

```bash
kubectl apply -f configmap.yaml
kubectl apply -f deployment.yaml
```

### 6. Docker Swarm

```yaml
version: '3.8'
services:
  pype-web:
    image: pype-web:latest
    environment:
      PYPE_API_URL: http://pype-admin:8080
    deploy:
      replicas: 3
      update_config:
        parallelism: 1
        delay: 10s
```

Deploy:

```bash
docker stack deploy -c docker-compose.yml pype
```

## Variáveis de Ambiente Suportadas

| Variável | Descrição | Padrão | Obrigatória |
|----------|-----------|--------|-------------|
| `PYPE_API_URL` | URL da API backend | `http://localhost:8080` | Não |
| `NODE_ENV` | Ambiente Node.js | `production` | Não |
| `PORT` | Porta do servidor | `3000` | Não |

## Testando a Configuração

### 1. Verificar endpoint de config

```bash
curl http://localhost:3080/api/config
```

Resposta esperada:
```json
{
  "PYPE_API_URL": "http://pype-admin:8080"
}
```

### 2. Verificar logs do container

```bash
# Docker Compose
docker compose logs pype-web | grep "Runtime config"

# Docker
docker logs pype-web | grep "Runtime config"

# Kubernetes
kubectl logs deployment/pype-web | grep "Runtime config"
```

### 3. Testar mudança em runtime

```bash
# Parar container
docker compose down

# Editar .env
echo "PYPE_API_URL=http://new-api-url:9000" > .env

# Subir novamente (SEM rebuild)
docker compose up -d

# Verificar nova config
curl http://localhost:3080/api/config
```

## Ambiente On-Premise

Para ambientes on-premise, recomendamos:

1. **Arquivo `.env` gerenciado**:
   ```bash
   # /opt/pype/.env
   PYPE_API_URL=http://internal-api-server:8080
   ```

2. **Systemd service com env file**:
   ```ini
   [Unit]
   Description=Pype Web
   After=docker.service
   
   [Service]
   Type=oneshot
   RemainAfterExit=yes
   WorkingDirectory=/opt/pype
   EnvironmentFile=/opt/pype/.env
   ExecStart=/usr/bin/docker compose up -d
   ExecStop=/usr/bin/docker compose down
   
   [Install]
   WantedBy=multi-user.target
   ```

3. **Script de deploy**:
   ```bash
   #!/bin/bash
   # deploy.sh
   
   # Ler configuração
   source /opt/pype/.env
   
   # Pull nova imagem
   docker pull myregistry.local/pype-web:latest
   
   # Restart com nova config (sem rebuild)
   docker compose up -d --force-recreate
   
   # Verificar saúde
   sleep 5
   curl -f http://localhost:3080/api/config || exit 1
   ```

## Troubleshooting

### Config não está sendo atualizada

1. Verificar se o container foi recriado (não só restartado):
   ```bash
   docker compose up -d --force-recreate
   ```

2. Limpar cache do navegador ou testar em aba anônima

3. Verificar logs para erros:
   ```bash
   docker compose logs pype-web --tail=100
   ```

### API retorna erro 404

- Endpoint `/api/config` só existe após esta implementação
- Verifique se está usando a imagem correta
- Faça rebuild se necessário:
  ```bash
  docker compose build pype-web
  ```

### Fallback sempre é usado

- Verifique se o servidor Next.js está rodando em modo server (não static export)
- Confirme que `output: 'standalone'` está no `next.config.js`
- Verifique logs do container para erros de startup

## Segurança

⚠️ **Importante**: O endpoint `/api/config` expõe variáveis de ambiente publicamente.

**Apenas adicione variáveis não-sensíveis**:
- ✅ URLs públicas da API
- ✅ Feature flags
- ✅ Identificadores de região
- ❌ Secrets, tokens, senhas
- ❌ Chaves de API privadas

Para valores sensíveis, use variáveis de servidor SSR que nunca são expostas ao cliente.

## Resumo

✅ **Build uma vez**, configure múltiplas vezes
✅ **Não precisa rebuildar** a imagem para mudar URLs
✅ **Mesma imagem** funciona em dev, staging e produção
✅ **Configuração via ambiente** (Docker, K8s, Azure, on-premise)
