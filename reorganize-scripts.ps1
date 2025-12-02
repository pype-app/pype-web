#!/usr/bin/env pwsh
# Script para reorganizar scripts do Pype Web

$ErrorActionPreference = "Stop"

Write-Host "=== Reorganizando Scripts - Pype Web ===" -ForegroundColor Green
Write-Host ""

# Criar estrutura de pastas
Write-Host "Criando estrutura de pastas..." -ForegroundColor Cyan
New-Item -ItemType Directory -Force -Path "scripts/docker" | Out-Null
New-Item -ItemType Directory -Force -Path "scripts/production" | Out-Null
New-Item -ItemType Directory -Force -Path "scripts/utils" | Out-Null

Write-Host "OK Estrutura criada" -ForegroundColor Green
Write-Host ""

# === DOCKER SCRIPTS ===
Write-Host "Organizando scripts Docker..." -ForegroundColor Cyan
$dockerScripts = @(
    @{From="scripts/pull-and-run.ps1"; To="scripts/docker/pull-and-run.ps1"},
    @{From="scripts/docker-manage.ps1"; To="scripts/docker/manage.ps1"},
    @{From="scripts/docker-login.ps1"; To="scripts/docker/login.ps1"}
)

foreach ($script in $dockerScripts) {
    if (Test-Path $script.From) {
        Move-Item -Force $script.From $script.To
        Write-Host "  OK $($script.From) -> $($script.To)" -ForegroundColor Green
    }
}

# === PRODUCTION SCRIPTS ===
Write-Host ""
Write-Host "Organizando scripts de producao..." -ForegroundColor Cyan
$prodScripts = @(
    @{From="production-up.ps1"; To="scripts/production/up.ps1"},
    @{From="production-down.ps1"; To="scripts/production/down.ps1"}
)

foreach ($script in $prodScripts) {
    if (Test-Path $script.From) {
        Move-Item -Force $script.From $script.To
        Write-Host "  OK $($script.From) -> $($script.To)" -ForegroundColor Green
    }
}

# === UTILS (temporarios) ===
Write-Host ""
Write-Host "Movendo scripts temporarios..." -ForegroundColor Cyan
if (Test-Path "reorganize-docs.ps1") {
    Move-Item -Force "reorganize-docs.ps1" "scripts/utils/reorganize-docs.ps1"
    Write-Host "  OK reorganize-docs.ps1 -> scripts/utils/" -ForegroundColor Green
}

Write-Host ""
Write-Host "OK Reorganizacao concluida!" -ForegroundColor Green
Write-Host ""
Write-Host "Nova estrutura em scripts/:" -ForegroundColor Cyan
Get-ChildItem -Path "scripts" -Directory | ForEach-Object {
    Write-Host ""
    Write-Host "  Pasta $($_.Name)/" -ForegroundColor Yellow
    Get-ChildItem -Path $_.FullName -File | ForEach-Object {
        Write-Host "     - $($_.Name)" -ForegroundColor Gray
    }
}
