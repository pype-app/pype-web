# Teste de Runtime Configuration
# Execute estes comandos para verificar que funciona

Write-Host "=== Teste de Runtime Configuration ===" -ForegroundColor Cyan
Write-Host ""

# Passo 1: Verificar .env.production atual
Write-Host "1. URL atual no .env.production:" -ForegroundColor Yellow
Get-Content .env.production | Select-String "PYPE_API_URL"
Write-Host ""

# Passo 2: Build da imagem (se ainda não existe)
Write-Host "2. Building imagem (se necessário)..." -ForegroundColor Yellow
docker build -t pype-web:test .
Write-Host ""

# Passo 3: Rodar com primeira URL
Write-Host "3. Rodando container com URL atual..." -ForegroundColor Yellow
docker stop pype-web-test 2>$null
docker rm pype-web-test 2>$null
docker run -d --name pype-web-test `
  -e PYPE_API_URL=http://primeira-api:8000 `
  -p 3081:3000 `
  pype-web:test

Write-Host "Aguardando container iniciar..." -ForegroundColor Gray
Start-Sleep -Seconds 8
Write-Host ""

# Passo 4: Verificar config retornada
Write-Host "4. Verificando config do endpoint /api/config:" -ForegroundColor Yellow
try {
    $config = Invoke-RestMethod -Uri "http://localhost:3081/api/config"
    Write-Host "   PYPE_API_URL retornado: $($config.PYPE_API_URL)" -ForegroundColor Green
} catch {
    Write-Host "   Erro ao buscar config: $_" -ForegroundColor Red
}
Write-Host ""

# Passo 5: Mudar URL sem rebuild
Write-Host "5. Mudando URL (SEM rebuild)..." -ForegroundColor Yellow
docker stop pype-web-test
docker rm pype-web-test
docker run -d --name pype-web-test `
  -e PYPE_API_URL=http://NOVA-API-MUDOU:9999 `
  -p 3081:3000 `
  pype-web:test

Write-Host "Aguardando container reiniciar..." -ForegroundColor Gray
Start-Sleep -Seconds 8
Write-Host ""

# Passo 6: Verificar nova config
Write-Host "6. Verificando NOVA config:" -ForegroundColor Yellow
try {
    $config = Invoke-RestMethod -Uri "http://localhost:3081/api/config"
    Write-Host "   PYPE_API_URL retornado: $($config.PYPE_API_URL)" -ForegroundColor Green
    
    if ($config.PYPE_API_URL -eq "http://NOVA-API-MUDOU:9999") {
        Write-Host ""
        Write-Host "✅ SUCESSO! A URL mudou sem rebuild!" -ForegroundColor Green
        Write-Host "   Isso significa que você pode mudar o .env.production" -ForegroundColor Green
        Write-Host "   e só recriar o container, sem rebuildar a imagem!" -ForegroundColor Green
    } else {
        Write-Host ""
        Write-Host "❌ Algo deu errado. A URL não mudou." -ForegroundColor Red
    }
} catch {
    Write-Host "   Erro ao buscar config: $_" -ForegroundColor Red
}
Write-Host ""

# Limpeza
Write-Host "7. Limpando..." -ForegroundColor Yellow
docker stop pype-web-test
docker rm pype-web-test
Write-Host "Teste concluído!" -ForegroundColor Cyan
