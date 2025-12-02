#!/usr/bin/env pwsh
<#
.SYNOPSIS
    Pull and run Pype Web container from GitHub Container Registry
.DESCRIPTION
    This script pulls the latest Pype Web image from GHCR and runs it on Docker Desktop
.PARAMETER Tag
    Image tag to pull (default: latest)
.PARAMETER Port
    Local port to expose (default: 3000)
.PARAMETER ApiUrl
    Pype API URL (default: http://localhost:8080)
.EXAMPLE
    .\pull-and-run.ps1
.EXAMPLE
    .\pull-and-run.ps1 -Tag "v1.0.0" -Port 8080 -ApiUrl "http://api.example.com"
#>

param(
    [string]$Tag = "latest",
    [int]$Port,
    [string]$ApiUrl,
    [string]$ContainerName = "pype-web",
    [string]$EnvFile = ".env.production"
)

$ErrorActionPreference = "Stop"

# Colors for output
function Write-ColorOutput($ForegroundColor) {
    $fc = $host.UI.RawUI.ForegroundColor
    $host.UI.RawUI.ForegroundColor = $ForegroundColor
    if ($args) {
        Write-Output $args
    }
    $host.UI.RawUI.ForegroundColor = $fc
}

# Function to load .env file
function Load-EnvFile {
    param([string]$FilePath)
    
    if (Test-Path $FilePath) {
        Write-ColorOutput Cyan "Loading environment variables from: $FilePath"
        $envVars = @{}
        
        Get-Content $FilePath | ForEach-Object {
            $line = $_.Trim()
            # Skip empty lines and comments
            if ($line -and -not $line.StartsWith('#')) {
                if ($line -match '^([^=]+)=(.*)$') {
                    $key = $matches[1].Trim()
                    $value = $matches[2].Trim()
                    # Remove quotes if present
                    $value = $value -replace '^["'']|["'']$', ''
                    $envVars[$key] = $value
                }
            }
        }
        
        Write-ColorOutput Green "✓ Loaded $($envVars.Count) environment variables"
        return $envVars
    } else {
        Write-ColorOutput Yellow "⚠ Environment file not found: $FilePath"
        Write-Host "  Using default values or parameters..."
        return @{}
    }
}

Write-ColorOutput Green "=== Pype Web - Pull and Run Script ==="
Write-Host ""

# Load environment variables from file
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$envFilePath = Join-Path (Split-Path -Parent $scriptDir) $EnvFile
$envVars = Load-EnvFile -FilePath $envFilePath

# Set configuration with priority: Parameter > .env file > Default
if (-not $Port) {
    $Port = if ($envVars.ContainsKey('PORT')) { [int]$envVars['PORT'] } else { 3000 }
}
if (-not $ApiUrl) {
    $ApiUrl = if ($envVars.ContainsKey('PYPE_API_URL')) { $envVars['PYPE_API_URL'] } else { "http://localhost:8080" }
}
$NodeEnv = if ($envVars.ContainsKey('NODE_ENV')) { $envVars['NODE_ENV'] } else { "production" }
# Run the container
Write-ColorOutput Cyan "`nStarting container..."
try {
    # Build environment variables for docker run
    $dockerEnvArgs = @(
        "-e", "NODE_ENV=$NodeEnv",
        "-e", "PORT=$Port",
        "-e", "PYPE_API_URL=$ApiUrl"
    )
    
    # Add any additional environment variables from .env file
    foreach ($key in $envVars.Keys) {
        if ($key -notin @('NODE_ENV', 'PORT', 'PYPE_API_URL')) {
            $dockerEnvArgs += "-e"
            $dockerEnvArgs += "$key=$($envVars[$key])"
        }
    }
    
    docker run -d `
        --name $ContainerName `
        -p "${Port}:${Port}" `
        $dockerEnvArgs `
        --restart unless-stopped `
        $FullImageName

    Write-ColorOutput Green "✓ Container started successfully"
} catch {
    Write-ColorOutput Red "✗ Failed to start container"
    exit 1
}ry {
    docker info | Out-Null
    Write-ColorOutput Green "✓ Docker is running"
} catch {
    Write-ColorOutput Red "✗ Docker is not running. Please start Docker Desktop."
    exit 1
}

# Stop and remove existing container if it exists
Write-ColorOutput Cyan "`nChecking for existing container..."
$existingContainer = docker ps -a --filter "name=$ContainerName" --format "{{.Names}}" 2>$null
if ($existingContainer -eq $ContainerName) {
    Write-ColorOutput Yellow "Found existing container '$ContainerName'. Stopping and removing..."
    docker stop $ContainerName 2>$null | Out-Null
    docker rm $ContainerName 2>$null | Out-Null
    Write-ColorOutput Green "✓ Removed existing container"
}

# Pull the image
Write-ColorOutput Cyan "`nPulling image from GHCR..."
Write-Host "This may take a few minutes depending on your internet connection..."
try {
    docker pull $FullImageName
    Write-ColorOutput Green "✓ Image pulled successfully"
} catch {
    Write-ColorOutput Red "✗ Failed to pull image. Check if:"
    Write-Host "  - You have internet connection"
    Write-Host "  - The image exists in GHCR"
    Write-Host "  - You are authenticated (run: docker login ghcr.io)"
    exit 1
}

# Run the container
Write-ColorOutput Cyan "`nStarting container..."
try {
    docker run -d `
        --name $ContainerName `
        -p "${Port}:${Port}" `
        -e NODE_ENV=production `
        -e PORT=$Port `
        -e PYPE_API_URL=$ApiUrl `
        --restart unless-stopped `
        $FullImageName

    Write-ColorOutput Green "✓ Container started successfully"
} catch {
    Write-ColorOutput Red "✗ Failed to start container"
    exit 1
}

# Wait for container to be healthy
Write-ColorOutput Cyan "`nWaiting for container to be healthy..."
$maxAttempts = 30
$attempt = 0
$healthy = $false

while ($attempt -lt $maxAttempts -and -not $healthy) {
    Start-Sleep -Seconds 2
    $attempt++
    
    $health = docker inspect --format='{{.State.Health.Status}}' $ContainerName 2>$null
    
    if ($health -eq "healthy") {
        $healthy = $true
        Write-ColorOutput Green "✓ Container is healthy"
    } else {
        Write-Host "  Waiting... (attempt $attempt/$maxAttempts) [Status: $health]"
    }
}

if (-not $healthy) {
    Write-ColorOutput Yellow "⚠ Container health check timeout. Container may still be starting..."
}

# Show container status
Write-Host ""
Write-ColorOutput Cyan "Container Status:"
docker ps --filter "name=$ContainerName" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

Write-Host ""
Write-ColorOutput Green "=== Container is running! ==="
Write-Host ""
Write-Host "Access the application at: http://localhost:$Port"
Write-Host ""
Write-Host "Useful commands:"
Write-Host "  View logs:      docker logs $ContainerName"
Write-Host "  Follow logs:    docker logs -f $ContainerName"
Write-Host "  Stop:           docker stop $ContainerName"
Write-Host "  Restart:        docker restart $ContainerName"
Write-Host "  Remove:         docker rm -f $ContainerName"
Write-Host ""
