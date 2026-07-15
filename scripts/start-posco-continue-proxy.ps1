$existing = Get-NetTCPConnection -LocalAddress 127.0.0.1 -LocalPort 43123 -State Listen -ErrorAction SilentlyContinue
if ($existing) {
    Write-Host "P-GPT Continue proxy is already running."
    exit 0
}

$scriptPath = Join-Path $PSScriptRoot "continue-posco-proxy.mjs"
$savedAuth = [Environment]::GetEnvironmentVariable("POSCO_PGPT_AUTH_BASE64", "User")
if (-not $savedAuth) {
    Write-Error "POSCO_PGPT_AUTH_BASE64 is not configured. Run set-posco-continue-key.ps1 first."
    exit 1
}
$env:POSCO_PGPT_AUTH_BASE64 = $savedAuth
Start-Process -FilePath "node" -ArgumentList @($scriptPath) -WindowStyle Hidden
Start-Sleep -Milliseconds 800

try {
    $health = Invoke-RestMethod -Uri "http://127.0.0.1:43123/health" -TimeoutSec 3
    if ($health.ok) {
        Write-Host "P-GPT Continue proxy started."
        exit 0
    }
} catch {
    Write-Error "Proxy failed to start: $($_.Exception.Message)"
    exit 1
}
