$ErrorActionPreference = "Stop"
$projectRoot = Split-Path -Parent $PSScriptRoot
$url = "http://127.0.0.1:4173/index.html"
$logDirectory = Join-Path $projectRoot ".logs"
$stdoutLog = Join-Path $logDirectory "server.log"
$stderrLog = Join-Path $logDirectory "server-error.log"

function Show-ErrorAndWait([string]$message) {
  Add-Type -AssemblyName PresentationFramework -ErrorAction SilentlyContinue
  if ([System.Windows.MessageBox]) {
    [System.Windows.MessageBox]::Show($message, "ValueTime Error", "OK", "Error") | Out-Null
  } else {
    Write-Host $message -ForegroundColor Red
    Read-Host "Press Enter to exit"
  }
}

if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
  Show-ErrorAndWait "Node.js is not installed.`n`nInstall the LTS version from https://nodejs.org and run this file again."
  exit 1
}

$alreadyRunning = $false
try {
  $response = Invoke-WebRequest -Uri $url -UseBasicParsing -TimeoutSec 2
  $alreadyRunning = $response.StatusCode -eq 200 -and $response.Content -match "ValueTime"
} catch {}

if (-not $alreadyRunning) {
  $portOwner = Get-NetTCPConnection -LocalPort 4173 -State Listen -ErrorAction SilentlyContinue
  if ($portOwner) {
    Show-ErrorAndWait "Port 4173 is being used by another program.`nClose that program and try again."
    exit 1
  }

  New-Item -ItemType Directory -Path $logDirectory -Force | Out-Null
  Start-Process -FilePath "node" `
    -ArgumentList "scripts\dev-server.mjs" `
    -WorkingDirectory $projectRoot `
    -WindowStyle Hidden `
    -RedirectStandardOutput $stdoutLog `
    -RedirectStandardError $stderrLog | Out-Null

  $started = $false
  for ($attempt = 0; $attempt -lt 20; $attempt++) {
    Start-Sleep -Milliseconds 250
    try {
      $response = Invoke-WebRequest -Uri $url -UseBasicParsing -TimeoutSec 1
      if ($response.StatusCode -eq 200) {
        $started = $true
        break
      }
    } catch {}
  }

  if (-not $started) {
    Show-ErrorAndWait "The site server could not be started.`nError log: $stderrLog"
    exit 1
  }
}

Start-Process $url
