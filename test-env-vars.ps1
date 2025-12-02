#!/usr/bin/env pwsh
# Script para testar se as variáveis de ambiente estão funcionando

param(
    [int]$TestPort = 3001,
    [string]$TestApiUrl = "http://test-api:9999"
)

$ErrorActionPreference = "Stop"

Write-Host "=== Teste de Variaveis de Ambiente - Pype Web ===" -ForegroundColor Green
Write-Host ""

Write-Host "Configuracoes de teste:" -ForegroundColor Cyan
Write-Host "  PORT: $TestPort"
Write-Host "  PYPE_API_URL: $TestApiUrl"
Write-Host ""

# Criar arquivo .env temporário
$envContent = @"
NODE_ENV=production
PORT=$TestPort
PYPE_API_URL=$TestApiUrl
"@

Write-Host "Criando .env.test..." -ForegroundColor Cyan
$envContent | Out-File -FilePath ".env.test" -Encoding utf8
Write-Host "OK .env.test criado" -ForegroundColor Green
Write-Host ""

# Parar container se existir
Write-Host "Parando container existente (se houver)..." -ForegroundColor Cyan
docker stop pype-web-test 2>$null | Out-Null
docker rm pype-web-test 2>$null | Out-Null
Write-Host "OK" -ForegroundColor Green
Write-Host ""

# Build da imagem
Write-Host "Construindo imagem..." -ForegroundColor Cyan
docker build -t pype-web-test .
if ($LASTEXITCODE -ne 0) {
    Write-Host "Erro ao construir imagem" -ForegroundColor Red
    exit 1
}
Write-Host "OK Imagem construida" -ForegroundColor Green
Write-Host ""

# Rodar container com variáveis de ambiente
Write-Host "Iniciando container com variaveis de ambiente..." -ForegroundColor Cyan
docker run -d `
    --name pype-web-test `
    -p "${TestPort}:${TestPort}" `
    -e NODE_ENV=production `
    -e PORT=$TestPort `
    -e PYPE_API_URL=$TestApiUrl `
    pype-web-test

if ($LASTEXITCODE -ne 0) {
    Write-Host "Erro ao iniciar container" -ForegroundColor Red
    exit 1
}
Write-Host "OK Container iniciado" -ForegroundColor Green
Write-Host ""

# Aguardar inicialização
Write-Host "Aguardando inicializacao (10 segundos)..." -ForegroundColor Cyan
Start-Sleep -Seconds 10

# Verificar logs
Write-Host ""
Write-Host "=== LOGS DO CONTAINER ===" -ForegroundColor Yellow
docker logs pype-web-test

Write-Host ""
Write-Host "=== VERIFICANDO VARIÁVEIS ===" -ForegroundColor Yellow

# Verificar porta
Write-Host ""
Write-Host "Verificando porta..." -ForegroundColor Cyan
$portCheck = docker exec pype-web-test printenv PORT
Write-Host "  PORT no container: $portCheck" -ForegroundColor $(if ($portCheck -eq $TestPort) { "Green" } else { "Red" })

# Verificar API URL
Write-Host ""
Write-Host "Verificando API URL..." -ForegroundColor Cyan
$apiCheck = docker exec pype-web-test printenv PYPE_API_URL
Write-Host "  PYPE_API_URL no container: $apiCheck" -ForegroundColor $(if ($apiCheck -eq $TestApiUrl) { "Green" } else { "Red" })

# Verificar se está ouvindo na porta correta
Write-Host ""
Write-Host "Verificando processo..." -ForegroundColor Cyan
docker exec pype-web-test netstat -tulpn 2>$null | Select-String "LISTEN"

Write-Host ""
Write-Host "=== TESTE CONCLUIDO ===" -ForegroundColor Green
Write-Host ""
Write-Host "Para limpar:" -ForegroundColor Cyan
Write-Host "  docker stop pype-web-test"
Write-Host "  docker rm pype-web-test"
Write-Host "  docker rmi pype-web-test"
Write-Host "  Remove-Item .env.test"
Write-Host ""
