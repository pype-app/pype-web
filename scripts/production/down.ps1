#!/usr/bin/env pwsh
<#
.SYNOPSIS
    Stop Pype Web production deployment
.DESCRIPTION
    Stops containers started with docker-compose.production.yml
.PARAMETER Remove
    Also remove containers and networks (keeps volumes)
.PARAMETER Volumes
    Also remove volumes (WARNING: deletes all data)
.EXAMPLE
    .\production-down.ps1
.EXAMPLE
    .\production-down.ps1 -Remove
.EXAMPLE
    .\production-down.ps1 -Remove -Volumes
#>

param(
    [switch]$Remove,
    [switch]$Volumes
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

Write-ColorOutput Yellow "=== Stopping Pype Web ==="
Write-Host ""

if ($Volumes) {
    Write-ColorOutput Red "WARNING: This will remove all volumes and delete data!"
    $confirm = Read-Host "Are you sure? Type 'yes' to confirm"
    if ($confirm -ne "yes") {
        Write-Host "Cancelled."
        exit 0
    }
    docker-compose -f docker-compose.production.yml down -v
} elseif ($Remove) {
    docker-compose -f docker-compose.production.yml down
} else {
    docker-compose -f docker-compose.production.yml stop
}

if ($LASTEXITCODE -eq 0) {
    Write-ColorOutput Green "✓ Pype Web stopped successfully"
} else {
    Write-ColorOutput Red "✗ Failed to stop Pype Web"
    exit 1
}
