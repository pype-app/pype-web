#!/usr/bin/env pwsh
<#
.SYNOPSIS
    Manage Pype Web Docker container
.DESCRIPTION
    Quick commands to manage the Pype Web container
.PARAMETER Action
    Action to perform: logs, stop, start, restart, remove, status
.PARAMETER ContainerName
    Container name (default: pype-web)
.PARAMETER Follow
    Follow logs in real-time (only for 'logs' action)
.EXAMPLE
    .\docker-manage.ps1 -Action logs
    .\docker-manage.ps1 -Action logs -Follow
    .\docker-manage.ps1 -Action restart
    .\docker-manage.ps1 -Action status
#>

param(
    [Parameter(Mandatory=$true)]
    [ValidateSet("logs", "stop", "start", "restart", "remove", "status", "stats")]
    [string]$Action,
    [string]$ContainerName = "pype-web",
    [switch]$Follow
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

# Check if container exists
$containerExists = docker ps -a --filter "name=$ContainerName" --format "{{.Names}}" 2>$null
if ($containerExists -ne $ContainerName) {
    Write-ColorOutput Red "✗ Container '$ContainerName' not found."
    Write-Host "Run .\pull-and-run.ps1 first to create the container."
    exit 1
}

switch ($Action) {
    "logs" {
        Write-ColorOutput Cyan "Showing logs for '$ContainerName'..."
        if ($Follow) {
            docker logs -f $ContainerName
        } else {
            docker logs --tail 100 $ContainerName
        }
    }
    "stop" {
        Write-ColorOutput Cyan "Stopping '$ContainerName'..."
        docker stop $ContainerName
        Write-ColorOutput Green "✓ Container stopped"
    }
    "start" {
        Write-ColorOutput Cyan "Starting '$ContainerName'..."
        docker start $ContainerName
        Write-ColorOutput Green "✓ Container started"
    }
    "restart" {
        Write-ColorOutput Cyan "Restarting '$ContainerName'..."
        docker restart $ContainerName
        Write-ColorOutput Green "✓ Container restarted"
    }
    "remove" {
        Write-ColorOutput Yellow "This will stop and remove the container."
        $confirm = Read-Host "Are you sure? (y/N)"
        if ($confirm -eq "y" -or $confirm -eq "Y") {
            docker stop $ContainerName 2>$null | Out-Null
            docker rm $ContainerName
            Write-ColorOutput Green "✓ Container removed"
        } else {
            Write-Host "Cancelled."
        }
    }
    "status" {
        Write-ColorOutput Cyan "Container Status:"
        docker ps -a --filter "name=$ContainerName" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}\t{{.Image}}"
        Write-Host ""
        Write-ColorOutput Cyan "Health Status:"
        $health = docker inspect --format='{{.State.Health.Status}}' $ContainerName 2>$null
        if ($health) {
            Write-Host "  Health: $health"
        } else {
            Write-Host "  Health: N/A"
        }
    }
    "stats" {
        Write-ColorOutput Cyan "Container Stats (Press Ctrl+C to exit):"
        docker stats $ContainerName
    }
}
