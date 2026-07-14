$ErrorActionPreference = "Stop"
$projectRoot = Split-Path -Parent $PSScriptRoot
$url = "http://127.0.0.1:4173"

try {
  Invoke-WebRequest -Uri $url -UseBasicParsing -TimeoutSec 1 | Out-Null
} catch {
  Start-Process -FilePath "node" -ArgumentList "scripts\dev-server.mjs" -WorkingDirectory $projectRoot -WindowStyle Hidden
  Start-Sleep -Milliseconds 900
}

Start-Process $url
