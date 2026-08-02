param(
  [int]$PollSeconds = 5,
  [int]$StableSeconds = 20
)

$ErrorActionPreference = "Continue"
function Find-Git {
  $command = Get-Command git -ErrorAction SilentlyContinue
  if ($command) { return $command.Source }

  $desktopGit = Get-ChildItem "$env:LOCALAPPDATA\GitHubDesktop\app-*\resources\app\git\cmd\git.exe" -ErrorAction SilentlyContinue |
    Sort-Object FullName -Descending |
    Select-Object -First 1
  if ($desktopGit) { return $desktopGit.FullName }

  $known = @(
    "C:\Program Files\Git\cmd\git.exe",
    "$env:LOCALAPPDATA\Programs\Git\cmd\git.exe"
  )
  return $known | Where-Object { Test-Path -LiteralPath $_ } | Select-Object -First 1
}

$git = Find-Git
if (-not $git) { throw "Git executable was not found. Install Git or GitHub Desktop." }

$repoRoot = Split-Path -Parent $PSScriptRoot
& $git -C $repoRoot rev-parse --git-dir *> $null
if ($LASTEXITCODE -ne 0) { throw "Git repository was not found." }

$sha256 = [Security.Cryptography.SHA256]::Create()
$repoHash = [BitConverter]::ToString($sha256.ComputeHash([Text.Encoding]::UTF8.GetBytes($repoRoot))).Replace("-", "")
$sha256.Dispose()
$mutexName = "Local\CodexAutoPush_" + $repoHash.Substring(0, 20)
$createdNew = $false
$mutex = [Threading.Mutex]::new($true, $mutexName, [ref]$createdNew)
if (-not $createdNew) { Write-Output "AUTO_PUSH_READY already-running"; exit 0 }

$logPath = Join-Path $repoRoot ".git\codex-auto-push.log"
function Write-Log([string]$message) {
  $line = "{0} {1}" -f (Get-Date -Format "yyyy-MM-dd HH:mm:ss"), $message
  Add-Content -LiteralPath $logPath -Value $line -Encoding utf8
  Write-Output $line
}

function Invoke-Git([string[]]$Arguments, [switch]$AllowFailure) {
  $output = & $git -C $repoRoot @Arguments 2>&1
  if ($LASTEXITCODE -ne 0 -and -not $AllowFailure) {
    throw "git $($Arguments -join ' ') 실패: $($output -join ' ')"
  }
  return @($output)
}

function Has-OperationInProgress {
  $gitDir = [string](Invoke-Git @("rev-parse", "--git-dir"))
  if (-not [IO.Path]::IsPathRooted($gitDir)) { $gitDir = Join-Path $repoRoot $gitDir }
  return (Test-Path (Join-Path $gitDir "MERGE_HEAD")) -or
    (Test-Path (Join-Path $gitDir "rebase-merge")) -or
    (Test-Path (Join-Path $gitDir "rebase-apply")) -or
    (Test-Path (Join-Path $gitDir "CHERRY_PICK_HEAD"))
}

$remote = [string](Invoke-Git @("remote"))
if (-not $remote) { throw "No Git remote is configured." }
$branch = [string](Invoke-Git @("branch", "--show-current"))
if (-not $branch) { throw "Auto-push does not run in detached HEAD state." }
Invoke-Git @("ls-remote", "--exit-code", $remote, "HEAD") | Out-Null
Invoke-Git @("fetch", "--quiet", $remote) | Out-Null

$excludeFile = Join-Path $repoRoot ".vscode\auto-push.json"
$excludes = @()
if (Test-Path $excludeFile) {
  $config = Get-Content -LiteralPath $excludeFile -Raw -Encoding utf8 | ConvertFrom-Json
  $excludes = @($config.exclude)
}

Write-Log "READY repo=$repoRoot remote=$remote branch=$branch"
Write-Output "AUTO_PUSH_READY"
$lastFingerprint = ""
$stableSince = Get-Date

while ($true) {
    if (Has-OperationInProgress) {
      Write-Log "SKIP merge/rebase/cherry-pick in progress"
      Start-Sleep -Seconds $PollSeconds
      continue
    }

    $addArgs = @("add", "-A", "--", ".") + @($excludes | ForEach-Object { ":(exclude)$_" })
    Invoke-Git $addArgs | Out-Null
    foreach ($path in $excludes) {
      Invoke-Git @("reset", "--quiet", "HEAD", "--", $path) -AllowFailure | Out-Null
    }

    $staged = (Invoke-Git @("diff", "--cached", "--name-only")) -join "`n"
    $stagedDiff = (Invoke-Git @("diff", "--cached", "--binary")) -join "`n"
    $fingerprint = if ($staged) {
      $hasher = [Security.Cryptography.SHA256]::Create()
      $hash = [BitConverter]::ToString($hasher.ComputeHash([Text.Encoding]::UTF8.GetBytes($stagedDiff))).Replace("-", "")
      $hasher.Dispose()
      $hash
    } else { "" }

    if ($fingerprint -ne $lastFingerprint) {
      $lastFingerprint = $fingerprint
      $stableSince = Get-Date
    }

    $elapsedSeconds = ((Get-Date) - $stableSince).TotalSeconds
    if ($staged -and $elapsedSeconds -ge $StableSeconds) {
      Invoke-Git @("fetch", "--quiet", $remote) | Out-Null
      $behind = [int]((Invoke-Git @("rev-list", "--count", "HEAD..$remote/$branch") -AllowFailure) -join "")
      if ($behind -gt 0) {
        Write-Log "SKIP remote branch is ahead by $behind commit(s); pull/rebase is required"
      } else {
        $message = "auto-sync: " + (Get-Date -Format "yyyy-MM-dd HH:mm:ss")
        Invoke-Git @("commit", "-m", $message) | Out-Null
        Invoke-Git @("push", $remote, "HEAD:$branch") | Out-Null
        $fileList = $staged.Replace("`n", ", ")
        Write-Log "PUSHED $message ($fileList)"
        $lastFingerprint = ""
      }
      $stableSince = Get-Date
    } elseif (-not $staged) {
      $ahead = [int]((Invoke-Git @("rev-list", "--count", "$remote/$branch..HEAD") -AllowFailure) -join "")
      if ($ahead -gt 0) {
        Invoke-Git @("push", $remote, "HEAD:$branch") | Out-Null
        Write-Log "PUSHED $ahead existing local commit(s)"
      }
    }

    Start-Sleep -Seconds $PollSeconds
}
