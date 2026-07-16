$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $PSScriptRoot
$vocabularyFile = Join-Path $root "data\vocabulary.js"
$outputFile = Join-Path $root "data\vocabulary-examples.js"
$endpoint = "https://en.dict.naver.com/api3/enko/search"

function Clean-Text([object]$Value) {
  if ($null -eq $Value) { return "" }
  $text = [string]$Value
  $text = [regex]::Replace($text, "<[^>]+>", "")
  $text = [System.Net.WebUtility]::HtmlDecode($text)
  return [regex]::Replace($text, "\s+", " ").Trim()
}

function Normalize-PartOfSpeech([object]$Value) {
  $part = (Clean-Text $Value).ToLowerInvariant()
  switch ($part) {
    "noun" { return "noun" }
    "verb" { return "verb" }
    "adjective" { return "adjective" }
    "adverb" { return "adverb" }
    default { return "" }
  }
}

function First-Value([object[]]$Values) {
  foreach ($value in $Values) {
    if ($null -ne $value -and [string]$value) { return $value }
  }
  return $null
}

function Test-CompleteSentence([string]$Value) {
  $text = Clean-Text $Value
  return $text -and ($text -split "\s+").Count -ge 4 -and $text -match '[.!?]["'']?$'
}

function Read-JsonResponse([string]$Url) {
  $response = Invoke-WebRequest -Uri $Url -UseBasicParsing -Headers @{
    Accept = "application/json"
    Referer = "https://en.dict.naver.com/"
    "User-Agent" = "Mozilla/5.0 (compatible; ValueTimeExampleCollector/1.0)"
  }
  $response.RawContentStream.Position = 0
  $reader = New-Object System.IO.StreamReader($response.RawContentStream, [Text.Encoding]::UTF8)
  try { return ($reader.ReadToEnd() | ConvertFrom-Json) } finally { $reader.Dispose() }
}

$rawVocabulary = Get-Content $vocabularyFile -Raw -Encoding UTF8
$arrayStart = $rawVocabulary.IndexOf("[")
$arrayEnd = $rawVocabulary.LastIndexOf("]")
if ($arrayStart -lt 0 -or $arrayEnd -le $arrayStart) { throw "Could not find the word array in vocabulary.js." }
$words = $rawVocabulary.Substring($arrayStart, $arrayEnd - $arrayStart + 1) | ConvertFrom-Json
$collected = [ordered]@{}
$completed = 0
$failures = 0

foreach ($wordItem in $words) {
  $term = (Clean-Text $wordItem.word).ToLowerInvariant()
  if (-not $term) { continue }
  try {
    $url = "$endpoint`?query=$([uri]::EscapeDataString($term))&m=pc&range=all"
    $payload = Read-JsonResponse $url
    $items = @($payload.searchResultMap.searchResultListMap.WORD.items)
    $exactItems = @($items | Where-Object { (Clean-Text (First-Value @($_.handleEntry, $_.expEntry))).ToLowerInvariant() -eq $term })
    if ($exactItems.Count -eq 0 -and $items.Count -gt 0) { $exactItems = @($items[0]) }
    $examples = [System.Collections.Generic.List[object]]::new()
    $meaningsByPart = [ordered]@{}
    $seen = @{}
    foreach ($entry in $exactItems) {
      foreach ($group in @($entry.meansCollector)) {
        $part = Normalize-PartOfSpeech (First-Value @($group.partOfSpeechCode, $group.partOfSpeech2, $group.partOfSpeech))
        if (-not $part) { continue }
        if (-not $meaningsByPart.Contains($part)) { $meaningsByPart[$part] = [System.Collections.Generic.List[string]]::new() }
        foreach ($meaning in @($group.means)) {
          $meaningText = Clean-Text $meaning.value
          if ($meaningText -and -not $meaningsByPart[$part].Contains($meaningText)) { $meaningsByPart[$part].Add($meaningText) }
          $english = Clean-Text $meaning.exampleOri
          $korean = Clean-Text $meaning.exampleTrans
          if (-not (Test-CompleteSentence $english) -or -not $korean) { continue }
          $key = "$part|$english"
          if ($seen.ContainsKey($key)) { continue }
          $seen[$key] = $true
          $examples.Add([ordered]@{
            partOfSpeech = $part
            meaning = Clean-Text $meaning.value
            exampleSentence = $english
            exampleTranslation = $korean
          })
        }
      }
    }
    foreach ($exampleItem in @($payload.searchResultMap.searchResultListMap.EXAMPLE.items | Select-Object -First 3)) {
      $english = Clean-Text $exampleItem.expExample1
      $korean = Clean-Text $exampleItem.expExample2
      if (-not (Test-CompleteSentence $english) -or -not $korean) { continue }
      $key = "unknown|$english"
      if ($seen.ContainsKey($key)) { continue }
      $seen[$key] = $true
      $examples.Add([ordered]@{
        partOfSpeech = "unknown"
        meaning = ""
        exampleSentence = $english
        exampleTranslation = $korean
      })
    }
    if ($examples.Count -gt 0) {
      $collected[$term] = [ordered]@{
        meanings = $meaningsByPart
        examples = $examples
        source = "NAVER English Dictionary"
        sourceUrl = "https://en.dict.naver.com/#/search?query=$([uri]::EscapeDataString($term))"
      }
    }
  } catch {
    $failures += 1
    Write-Warning "[failed] ${term}: $($_.Exception.Message)"
  }
  $completed += 1
  if (($completed % 50) -eq 0 -or $completed -eq $words.Count) {
    Write-Host "[progress] $completed/$($words.Count), collected=$($collected.Count), failures=$failures"
  }
  Start-Sleep -Milliseconds 80
}

$json = $collected | ConvertTo-Json -Depth 8
$generatedAt = [DateTime]::UtcNow.ToString("o")
$content = "// Generated by scripts/collect-naver-examples.ps1 at $generatedAt.`n// Source pages may be subject to their respective provider terms.`nexport const vocabularyExamples = $json;`n"
[IO.File]::WriteAllText($outputFile, $content, [Text.UTF8Encoding]::new($false))
Write-Host "[done] wrote $($collected.Count) words to $outputFile"
