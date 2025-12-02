# Scripts - Pype Web

Scripts de automação do Pype Web.

## 🐳 Docker Scripts

### `docker/pull-and-run.ps1`
Pull and run the Pype Web container from GitHub Container Registry.

**Configuração:**
- O script lê automaticamente as variáveis do arquivo `.env.production`
- Parâmetros da linha de comando têm prioridade sobre o arquivo `.env`
- Se não houver `.env.production`, usa valores padrão

**Uso:**
```powershell
cd scripts

# Uso básico (lê configurações do .env.production)
.\docker\pull-and-run.ps1

# Especificar arquivo .env customizado
.\docker\pull-and-run.ps1 -EnvFile ".env.local"

# Sobrescrever valores do .env com parâmetros
.\docker\pull-and-run.ps1 -Port 8080

# Especificar tag e API
.\docker\pull-and-run.ps1 -Tag "v1.0.0" -ApiUrl "http://api.example.com:8080"

# Todas as opções
.\docker\pull-and-run.ps1 -Tag "latest" -Port 3000 -ApiUrl "http://localhost:8080" -ContainerName "pype-web" -EnvFile ".env.production"
```

**Ordem de prioridade das configurações:**
1. Parâmetros da linha de comando (maior prioridade)
2. Arquivo `.env.production` (ou especificado via `-EnvFile`)
3. Valores padrão (menor prioridade)

### `docker/login.ps1`
Authenticate with GitHub Container Registry to pull private images.

**Uso:**
```powershell
cd scripts

# Interativo (will prompt for token)
.\docker\login.ps1

# With token parameter
.\docker\login.ps1 -Token "ghp_yourtoken"

# Custom username
.\docker\login.ps1 -Token "ghp_yourtoken" -Username "yourusername"
```

**Note:** You need a GitHub Personal Access Token with `read:packages` scope.  
Create one at: https://github.com/settings/tokens/new?scopes=read:packages

### `docker/manage.ps1`
Quick management commands for the Pype Web container.

**Uso:**
```powershell
cd scripts

# View logs (last 100 lines)
.\docker\manage.ps1 -Action logs

# Follow logs in real-time
.\docker\manage.ps1 -Action logs -Follow

# Check container status
.\docker\manage.ps1 -Action status

# View resource usage stats
.\docker\manage.ps1 -Action stats

# Stop container
.\docker\manage.ps1 -Action stop

# Start container
.\docker\manage.ps1 -Action start

# Restart container
.\docker\manage.ps1 -Action restart

# Remove container
.\docker\manage.ps1 -Action remove
```

## 🚀 Production Scripts

### `production/up.ps1`
Start Pype Web using docker-compose.production.yml

**Uso:**
```powershell
# Start with default settings from .env.production
.\production\up.ps1

# Pull latest images before starting
.\production\up.ps1 -Pull

# Use specific image tag
.\production\up.ps1 -Tag "v1.0.0"

# Pull and use specific tag
.\production\up.ps1 -Tag "v1.0.0" -Pull
```

### `production/down.ps1`
Stop Pype Web production deployment

**Uso:**
```powershell
# Stop containers (keeps them for restart)
.\production\down.ps1

# Stop and remove containers
.\production\down.ps1 -Remove

# Stop and remove everything including volumes (⚠️ deletes data!)
.\production\down.ps1 -Remove -Volumes
```

## 🚀 Fluxo de Uso Rápido

### Método 1: Production (Recomendado)

1. **Configuração inicial**:
   ```powershell
   # Editar .env.production com suas configurações
   notepad .env.production
   ```

2. **Iniciar aplicação:**
   ```powershell
   .\production\up.ps1 -Pull
   ```

3. **Gerenciar:**
   ```powershell
   # Verificar status
   docker-compose -f docker-compose.production.yml ps
   
   # Ver logs
   docker-compose -f docker-compose.production.yml logs -f
   
   # Parar
   .\production\down.ps1
   ```

### Método 2: Container Individual

1. **Configuração inicial** (se estiver usando registry privado):
   ```powershell
   cd scripts
   .\docker\login.ps1
   ```

2. **Baixar e executar o container:**
   ```powershell
   .\docker\pull-and-run.ps1
   ```

3. **Gerenciar o container:**
   ```powershell
   # Verificar se está rodando
   .\docker\manage.ps1 -Action status
   
   # Ver logs
   .\docker\manage.ps1 -Action logs -Follow
   ```

## 🔍 Troubleshooting

### Problemas de Autenticação
Se você receber erros de autenticação ao baixar:
```powershell
# Fazer login no GHCR
cd scripts
.\docker\login.ps1

# Então tente baixar novamente
.\docker\pull-and-run.ps1
```

### Container Não Inicia
Verifique os logs para erros:
```powershell
cd scripts
.\docker\manage.ps1 -Action logs
```

### Porta Já Está em Uso
Use uma porta diferente:
```powershell
cd scripts
.\docker\pull-and-run.ps1 -Port 8080
```

## 🔧 Scripts Disponíveis

_Futuramente, scripts de automação serão adicionados aqui._

### Planejado

- Scripts de build e deploy
- Utilitários de desenvolvimento
- Scripts de migração
- Ferramentas de teste e qualidade

## 💡 Como Usar

Para adicionar novos scripts:
1. Crie um arquivo com extensão apropriada (`.ps1`, `.sh`, `.js`, etc.)
2. Adicione comentários explicativos no início
3. Atualize este README com instruções de uso
4. Faça commit com mensagem descritiva

## 📝 Scripts do Package.json

Os scripts principais já estão configurados no `package.json`:

```bash
# Desenvolvimento
npm run dev

# Build
npm run build

# Produção
npm start

# Lint
npm run lint

# Testes
npm test
```

## 🔗 Links Úteis

- [README Principal](../README.md)
- [Scripts do Pype Admin](../../pype-admin/scripts/README.md)
- [Scripts do Pype Landing](../../pype-landing/scripts/README.md)
