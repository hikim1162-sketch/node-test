param(
  [string]$SourceDirectory = (Join-Path $PSScriptRoot "..\imports\wordmaster"),
  [string]$OutputDirectory = (Join-Path $PSScriptRoot "..\src\features\csat-vocab\data")
)

$ErrorActionPreference = "Stop"

function Normalize-Text([object]$Value) {
  if ($null -eq $Value) { return "" }
  return ([string]$Value).Trim() -replace "\s+", " "
}

function Get-DayNumber([object]$Value) {
  $text = Normalize-Text $Value
  if ($text -match "(?i)day\s*0*(\d+)") { return [int]$Matches[1] }
  return 0
}

$hyperCorrections = @{
  "vaild" = "valid"
  "convinction" = "conviction"
  "comtemplate" = "contemplate"
  "refort" = "retort"
  "frain" = "frail"
}

function New-WordRecord {
  param(
    [string]$Series,
    [int]$Index,
    [int]$Day,
    [int]$DayIndex,
    [string]$WordRaw,
    [string]$MeaningRaw,
    [hashtable]$Corrections = @{}
  )

  $wordDisplay = if ($Corrections.ContainsKey($WordRaw.ToLowerInvariant())) {
    $Corrections[$WordRaw.ToLowerInvariant()]
  } else {
    $WordRaw
  }

  [ordered]@{
    id = "$Series-$Index"
    series = $Series
    index = $Index
    day = $Day
    day_index = $DayIndex
    word_raw = $WordRaw
    word_display = $wordDisplay
    meaning_raw = $MeaningRaw
    meaning_display = $MeaningRaw
    is_corrected = ($wordDisplay -ne $WordRaw)
  }
}

function Save-Json([string]$Name, $Records) {
  $path = Join-Path $OutputDirectory "$Name.json"
  $json = $Records.ToArray() | ConvertTo-Json -Depth 5 -Compress
  [System.IO.File]::WriteAllText($path, $json, [System.Text.UTF8Encoding]::new($false))
  Write-Host "$Name`: $($Records.Count) words -> $path"
}

New-Item -ItemType Directory -Path $OutputDirectory -Force | Out-Null

$excel = New-Object -ComObject Excel.Application
$excel.Visible = $false
$excel.DisplayAlerts = $false

try {
  $basic = [System.Collections.Generic.List[object]]::new()
  $basicPath = (Get-ChildItem -LiteralPath $SourceDirectory -Filter "*Basic.xlsx" | Select-Object -First 1).FullName
  $book = $excel.Workbooks.Open($basicPath, 0, $true)
  try {
    $sheet = $book.Worksheets.Item(1)
    $range = $sheet.UsedRange
    $values = $range.Value2
    $currentDay = 0
    $index = 0
    for ($row = 3; $row -le $range.Rows.Count; $row++) {
      $dayValue = Get-DayNumber $values[$row, 1]
      if ($dayValue -gt 0) { $currentDay = $dayValue }
      $word = Normalize-Text $values[$row, 3]
      $meaning = Normalize-Text $values[$row, 4]
      if (-not $word -or -not $meaning) { continue }
      $index++
      $dayIndex = [int](Normalize-Text $values[$row, 2])
      $basic.Add((New-WordRecord -Series "basic" -Index $index -Day $currentDay -DayIndex $dayIndex -WordRaw $word -MeaningRaw $meaning))
    }
    [System.Runtime.InteropServices.Marshal]::ReleaseComObject($range) | Out-Null
  } finally {
    $book.Close($false)
    [System.Runtime.InteropServices.Marshal]::ReleaseComObject($book) | Out-Null
  }

  $csat2000 = [System.Collections.Generic.List[object]]::new()
  $csatPath = (Get-ChildItem -LiteralPath $SourceDirectory -Filter "*2000.xlsx" | Select-Object -First 1).FullName
  $book = $excel.Workbooks.Open($csatPath, 0, $true)
  try {
    $sheet = $book.Worksheets.Item("Sheet1")
    $range = $sheet.UsedRange
    $values = $range.Value2
    for ($row = 2; $row -le $range.Rows.Count; $row++) {
      $word = Normalize-Text $values[$row, 4]
      $meaning = Normalize-Text $values[$row, 5]
      if (-not $word -or -not $meaning) { continue }
      $index = [int](Normalize-Text $values[$row, 2])
      $day = Get-DayNumber $values[$row, 3]
      $dayIndex = (($index - 1) % 40) + 1
      $csat2000.Add((New-WordRecord -Series "csat2000" -Index $index -Day $day -DayIndex $dayIndex -WordRaw $word -MeaningRaw $meaning))
    }
    [System.Runtime.InteropServices.Marshal]::ReleaseComObject($range) | Out-Null
  } finally {
    $book.Close($false)
    [System.Runtime.InteropServices.Marshal]::ReleaseComObject($book) | Out-Null
  }

  $hyper = [System.Collections.Generic.List[object]]::new()
  $hyperPath = Join-Path $SourceDirectory "Word Master Hyper 1000.xlsx"
  $book = $excel.Workbooks.Open($hyperPath, 0, $true)
  try {
    $sheet = $book.Worksheets.Item(1)
    $range = $sheet.UsedRange
    $values = $range.Value2
    $index = 0
    for ($column = 1; $column -le $range.Columns.Count; $column += 3) {
      $baseDay = Get-DayNumber $values[1, ($column + 1)]
      for ($row = 2; $row -le $range.Rows.Count; $row++) {
        $word = Normalize-Text $values[$row, ($column + 1)]
        $meaning = Normalize-Text $values[$row, ($column + 2)]
        if (-not $word -or -not $meaning -or $word -match "(?i)^day\s*\d+") { continue }
        $index++
        $position = [int](Normalize-Text $values[$row, $column])
        $day = $baseDay + [Math]::Floor(($row - 2) / 21)
        $hyper.Add((New-WordRecord -Series "hyper1000" -Index $index -Day $day -DayIndex $position -WordRaw $word -MeaningRaw $meaning -Corrections $hyperCorrections))
      }
    }
    [System.Runtime.InteropServices.Marshal]::ReleaseComObject($range) | Out-Null
  } finally {
    $book.Close($false)
    [System.Runtime.InteropServices.Marshal]::ReleaseComObject($book) | Out-Null
  }

  Save-Json "basic" $basic
  Save-Json "csat2000" $csat2000
  Save-Json "hyper1000" $hyper
} finally {
  $excel.Quit()
  [System.Runtime.InteropServices.Marshal]::ReleaseComObject($excel) | Out-Null
  [GC]::Collect()
  [GC]::WaitForPendingFinalizers()
}
