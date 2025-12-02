#!/usr/bin/env pwsh
<#
.SYNOPSIS
    Pull and start Pype Web from GHCR using docker-compose
.DESCRIPTION
    Uses docker-compose.production.yml to pull and start the Pype Web container from GitHub Container Registry
.PARAMETER Tag
    Image tag to pull (default: latest, can also be set in .env.production)
.PARAMETER Pull
    Force pull the latest image before starting
.EXAMPLE
    .\production-up.ps1
.EXAMPLE
    .\production-up.ps1 -Tag "v1.0.0"
.EXAMPLE
    .\production-up.ps1 -Pull
#>

param(
    [string]$Tag,
    [switch]$Pull
)

$ErrorActionPreference = "Stop"

function Write-ColorOutput($ForegroundColor) {
    $fc = $host.UI.RawUI.ForegroundColor
    $host.UI.RawUI.ForegroundColor = $ForegroundColor
    if ($args) {
        Write-Output $args
    }
    $host.UI.RawUI.ForegroundColor = $fc
}

Write-ColorOutput Green "=== Pype Web - Production Deployment ==="
Write-Host ""

# Check if Docker is running
Write-ColorOutput Cyan "Checking Docker..."
try {
    docker info | Out-Null
    Write-ColorOutput Green "✓ Docker is running"
} catch {
    Write-ColorOutput Red "✗ Docker is not running. Please start Docker Desktop."
    exit 1
}

# Check if .env.production exists
if (-not (Test-Path ".env.production")) {
    Write-ColorOutput Red "✗ .env.production file not found!"
    Write-Host "Create a .env.production file with your configuration."
    exit 1
}

Write-ColorOutput Green "✓ Found .env.production"
Write-Host ""

# Set IMAGE_TAG if provided
if ($Tag) {
    $env:IMAGE_TAG = $Tag
    Write-ColorOutput Cyan "Using image tag: $Tag"
}

# Pull images if requested
if ($Pull) {
    Write-ColorOutput Cyan "Pulling latest images..."
    docker-compose -f docker-compose.production.yml pull
    Write-ColorOutput Green "✓ Images pulled"
    Write-Host ""
}

# Start services
Write-ColorOutput Cyan "Starting Pype Web..."
docker-compose -f docker-compose.production.yml up -d

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-ColorOutput Green "✓ Pype Web started successfully!"
    Write-Host ""
    Write-Host "Check status:  docker-compose -f docker-compose.production.yml ps"
    Write-Host "View logs:     docker-compose -f docker-compose.production.yml logs -f"
    Write-Host "Stop:          docker-compose -f docker-compose.production.yml down"
    Write-Host ""
} else {
    Write-ColorOutput Red "✗ Failed to start Pype Web"
    exit 1
}
