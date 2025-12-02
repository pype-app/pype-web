# Scripts - Pype Web

Scripts de automação organizados por categoria.

## 📁 Estrutura

### 🐳 [docker/](./docker/)
Scripts para gerenciamento de containers Docker

- **[login.ps1](./docker/login.ps1)** - Autenticação no GHCR
- **[pull-and-run.ps1](./docker/pull-and-run.ps1)** - Baixar e executar container individual
- **[manage.ps1](./docker/manage.ps1)** - Gerenciar containers (logs, restart, stop)

### 🚀 [production/](./production/)
Scripts para deploy em produção

- **[up.ps1](./production/up.ps1)** - Iniciar aplicação em produção (docker-compose)
- **[down.ps1](./production/down.ps1)** - Parar aplicação em produção

### 🔧 [utils/](./utils/)
Scripts utilitários e ferramentas auxiliares

- **[reorganize-docs.ps1](./utils/reorganize-docs.ps1)** - Script de reorganização de documentação

## 🚀 Uso Rápido

### Deploy em Produção (Recomendado)

```powershell
# Iniciar aplicação
.\production\up.ps1 -Pull

# Parar aplicação
.\production\down.ps1
```

### Gerenciamento Individual de Container

```powershell
# Login no GHCR (se necessário)
.\docker\login.ps1

# Baixar e executar container
.\docker\pull-and-run.ps1

# Gerenciar container
.\docker\manage.ps1 -Action logs -Follow
.\docker\manage.ps1 -Action restart
.\docker\manage.ps1 -Action status
```

## 📖 Documentação Detalhada

Para guias completos, consulte:
- [Deployment Guide](../docs/deployment/PRODUCTION.md)
- [Scripts Guide](../docs/deployment/scripts-guide.md)
- [Docker Guide](../docs/deployment/DOCKER.md)

## 🔗 Links Relacionados

- [Documentação Principal](../docs/)
- [README do Projeto](../README.md)
