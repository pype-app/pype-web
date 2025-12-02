# Deploy script - Pull latest image from GHCR and restart
# Usage: .\deploy-from-ghcr.ps1 [tag]

param(
    [string]$Tag = "latest"
)

$ImageName = "ghcr.io/daniel-buona/pypie/pype-web:$Tag"

Write-Host "=== Deploy Pype Web from GHCR ===" -ForegroundColor Cyan
Write-Host ""

# Check if logged in to GHCR
Write-Host "1. Checking GHCR authentication..." -ForegroundColor Yellow
$loginCheck = docker pull $ImageName 2>&1
if ($LASTEXITCODE -ne 0 -and $loginCheck -match "unauthorized") {
    Write-Host "   Not logged in to GHCR. Please login first:" -ForegroundColor Red
    Write-Host "   `$env:GITHUB_TOKEN = 'your_token'" -ForegroundColor Gray
    Write-Host "   `$env:GITHUB_TOKEN | docker login ghcr.io -u daniel-buona --password-stdin" -ForegroundColor Gray
    exit 1
}
Write-Host "   ✓ Authenticated" -ForegroundColor Green
Write-Host ""

# Pull latest image
Write-Host "2. Pulling image: $ImageName" -ForegroundColor Yellow
docker pull $ImageName
if ($LASTEXITCODE -ne 0) {
    Write-Host "   ✗ Failed to pull image" -ForegroundColor Red
    exit 1
}
Write-Host "   ✓ Image pulled successfully" -ForegroundColor Green
Write-Host ""

# Stop current container
Write-Host "3. Stopping current container..." -ForegroundColor Yellow
docker compose -f docker-compose.production.yml down
Write-Host "   ✓ Container stopped" -ForegroundColor Green
Write-Host ""

# Start with new image
Write-Host "4. Starting container with new image..." -ForegroundColor Yellow
$env:IMAGE_TAG = $Tag
docker compose -f docker-compose.production.yml up -d
if ($LASTEXITCODE -ne 0) {
    Write-Host "   ✗ Failed to start container" -ForegroundColor Red
    exit 1
}
Write-Host "   ✓ Container started" -ForegroundColor Green
Write-Host ""

# Wait for healthcheck
Write-Host "5. Waiting for health check..." -ForegroundColor Yellow
Start-Sleep -Seconds 10

$healthy = docker inspect --format='{{.State.Health.Status}}' pype-web 2>$null
if ($healthy -eq "healthy") {
    Write-Host "   ✓ Container is healthy" -ForegroundColor Green
} else {
    Write-Host "   ⚠ Container status: $healthy" -ForegroundColor Yellow
    Write-Host "   Check logs with: docker compose -f docker-compose.production.yml logs" -ForegroundColor Gray
}
Write-Host ""

# Show status
Write-Host "6. Deployment complete!" -ForegroundColor Green
Write-Host ""
Write-Host "Container: " -NoNewline
docker ps --filter name=pype-web --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
Write-Host ""
Write-Host "View config: curl http://localhost:8020/api/config" -ForegroundColor Gray
Write-Host "View logs:   docker compose -f docker-compose.production.yml logs -f" -ForegroundColor Gray
