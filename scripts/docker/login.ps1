#!/usr/bin/env pwsh
<#
.SYNOPSIS
    Login to GitHub Container Registry
.DESCRIPTION
    This script helps you authenticate with GHCR to pull private images
.PARAMETER Token
    GitHub Personal Access Token (PAT) with read:packages scope
.PARAMETER Username
    GitHub username (default: daniel-buona)
.EXAMPLE
    .\docker-login.ps1 -Token "ghp_yourtoken"
#>

param(
    [Parameter(Mandatory=$false)]
    [string]$Token,
    [string]$Username = "daniel-buona"
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

Write-ColorOutput Green "=== GitHub Container Registry - Login ==="
Write-Host ""

# Check if Docker is running
try {
    docker info | Out-Null
    Write-ColorOutput Green "✓ Docker is running"
} catch {
    Write-ColorOutput Red "✗ Docker is not running. Please start Docker Desktop."
    exit 1
}

Write-Host ""

# Get token if not provided
if (-not $Token) {
    Write-Host "You need a GitHub Personal Access Token (PAT) with 'read:packages' scope."
    Write-Host "Create one at: https://github.com/settings/tokens/new?scopes=read:packages"
    Write-Host ""
    $Token = Read-Host "Enter your GitHub PAT" -AsSecureString
    $Token = [Runtime.InteropServices.Marshal]::PtrToStringAuto(
        [Runtime.InteropServices.Marshal]::SecureStringToBSTR($Token)
    )
}

# Login to GHCR
Write-ColorOutput Cyan "Logging in to ghcr.io..."
try {
    $Token | docker login ghcr.io -u $Username --password-stdin
    Write-ColorOutput Green "`n✓ Successfully logged in to ghcr.io"
    Write-Host ""
    Write-Host "You can now pull private images from GHCR."
    Write-Host "Run: .\pull-and-run.ps1"
} catch {
    Write-ColorOutput Red "`n✗ Login failed. Please check your credentials."
    exit 1
}
