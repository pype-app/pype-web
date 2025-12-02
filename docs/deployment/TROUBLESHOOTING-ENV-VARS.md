# Troubleshooting - Variáveis de Ambiente no Docker

## Problema: Container não respeita variáveis de ambiente

### Sintomas
- Container inicia, mas ignora `PORT` definida no `docker-compose.yml`
- Aplicação sempre roda na porta padrão (3000) mesmo passando `PORT=8080`
- Variáveis de ambiente não são refletidas dentro do container

### Solução Aplicada

#### 1. Dockerfile Corrigido

**Problema anterior:**
```dockerfile
EXPOSE $PORT          # ❌ Variável não é expandida em build time
CMD node server.js    # ❌ Sem formato array
```

**Solução:**
```dockerfile
# Adicionar HOSTNAME para Next.js
ENV NODE_ENV=production \
    PORT=3000 \
    PYPE_API_URL=http://localhost:8080 \
    HOSTNAME=0.0.0.0

# EXPOSE é apenas documentação, usar valor fixo
EXPOSE 3000

# CMD deve ser array para signals funcionarem
CMD ["node", "server.js"]
```

#### 2. Docker Compose Correto

```yaml
services:
  pype-web:
    ports:
      - "${PORT:-3000}:${PORT:-3000}"  # ✅ Mapeia porta host:container
    environment:
      NODE_ENV: ${NODE_ENV:-production}
      PORT: ${PORT:-3000}              # ✅ Passa para o container
      PYPE_API_URL: ${PYPE_API_URL:-http://pype-admin:8080}
      HOSTNAME: 0.0.0.0                # ✅ Next.js escuta em todas interfaces
```

### Conceitos Importantes

#### EXPOSE vs PORT Mapping

- **`EXPOSE`** no Dockerfile: Apenas documentação, não abre portas
- **`ports:`** no docker-compose: Realmente mapeia portas host:container
- Variáveis de ambiente no `EXPOSE` **não são expandidas**

#### Next.js Standalone Variáveis

Next.js standalone server lê estas variáveis em runtime:

| Variável | Propósito | Padrão |
|----------|-----------|--------|
| `PORT` | Porta do servidor | `3000` |
| `HOSTNAME` | Interface de rede | `localhost` |
| `NODE_ENV` | Ambiente | `production` |

**Importante:** `HOSTNAME=0.0.0.0` é necessário para aceitar conexões externas ao container.

### Como Testar

#### Teste Rápido

```powershell
# Teste com porta customizada
.\test-env-vars.ps1 -TestPort 8080 -TestApiUrl "http://custom:9999"

# Verificar se está ouvindo na porta correta
docker exec pype-web-test netstat -tulpn | grep LISTEN

# Verificar variáveis
docker exec pype-web-test printenv | grep -E '(PORT|HOSTNAME|PYPE_API_URL)'
```

#### Teste com Docker Compose

```powershell
# Editar .env.production
PORT=8080
PYPE_API_URL=http://api:9999

# Iniciar
docker-compose up -d

# Verificar
docker-compose logs pype-web
docker-compose exec pype-web printenv PORT
```

### Problemas Comuns

#### 1. "Connection refused" ao acessar localhost:PORT

**Causa:** `HOSTNAME` não está definido como `0.0.0.0`

**Solução:**
```dockerfile
ENV HOSTNAME=0.0.0.0
```

#### 2. Container usa porta errada

**Causa:** `PORT` não está sendo passada corretamente

**Verificar:**
```powershell
# Ver variáveis dentro do container
docker exec pype-web printenv PORT

# Ver logs de inicialização
docker logs pype-web
```

#### 3. Healthcheck falha

**Causa:** Healthcheck usa porta fixa ou variável não expandida

**Solução:**
```dockerfile
# Usar expressão JavaScript para ler variável em runtime
HEALTHCHECK CMD node -e "require('http').get('http://localhost:' + (process.env.PORT || 3000) + '/health', ...)"
```

#### 4. Build time vs Runtime

**Importante:** Variáveis de ambiente têm comportamentos diferentes:

```dockerfile
# ❌ Build time - não funciona para valores dinâmicos
EXPOSE $PORT

# ✅ Runtime - funciona
CMD node server.js  # Lê process.env.PORT em runtime
```

### Checklist de Diagnóstico

- [ ] `HOSTNAME=0.0.0.0` definido no Dockerfile ou docker-compose
- [ ] `PORT` passada via `environment:` no docker-compose
- [ ] Mapeamento de portas correto: `"${PORT}:${PORT}"`
- [ ] `.env.production` tem valores corretos
- [ ] Container está rodando: `docker ps | grep pype-web`
- [ ] Verificar logs: `docker logs pype-web`
- [ ] Testar dentro do container: `docker exec pype-web printenv`

### Referências

- [Next.js Standalone Output](https://nextjs.org/docs/pages/api-reference/next-config-js/output#automatically-copying-traced-files)
- [Docker Environment Variables](https://docs.docker.com/compose/environment-variables/)
- [Next.js Custom Server](https://nextjs.org/docs/pages/building-your-application/configuring/custom-server)
