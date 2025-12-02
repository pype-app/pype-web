#!/usr/bin/env pwsh
# Script para reorganizar documentação do Pype Web

$ErrorActionPreference = "Stop"

Write-Host "=== Reorganizando Documentação - Pype Web ===" -ForegroundColor Green
Write-Host ""

# Criar estrutura de pastas
Write-Host "Criando estrutura de pastas..." -ForegroundColor Cyan
New-Item -ItemType Directory -Force -Path "docs/deployment" | Out-Null
New-Item -ItemType Directory -Force -Path "docs/development" | Out-Null
New-Item -ItemType Directory -Force -Path "docs/guides" | Out-Null

# Documentos de Deployment
Write-Host "Movendo documentos de deployment..." -ForegroundColor Cyan
if (Test-Path "DOCKER.md") {
    Move-Item -Force "DOCKER.md" "docs/deployment/"
    Write-Host "  OK DOCKER.md -> docs/deployment/" -ForegroundColor Green
}
if (Test-Path "PRODUCTION.md") {
    Move-Item -Force "PRODUCTION.md" "docs/deployment/"
    Write-Host "  OK PRODUCTION.md -> docs/deployment/" -ForegroundColor Green
}
if (Test-Path "scripts/README.md") {
    Move-Item -Force "scripts/README.md" "docs/deployment/scripts-guide.md"
    Write-Host "  OK scripts/README.md -> docs/deployment/scripts-guide.md" -ForegroundColor Green
}

Write-Host ""
Write-Host "OK Reorganizacao concluida!" -ForegroundColor Green
Write-Host ""
Write-Host "Nova estrutura em docs/:" -ForegroundColor Cyan
Get-ChildItem -Path "docs" -Recurse -File | Select-Object FullName | ForEach-Object { 
    $relativePath = $_.FullName.Replace((Get-Location).Path + "\", "")
    Write-Host "  - $relativePath"
}
