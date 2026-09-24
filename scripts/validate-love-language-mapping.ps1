param(
  [string]$WorkbookPath = (Join-Path $PSScriptRoot ("../Conte$([char]0x00FA)do/mapeamento-linguagens-do-amor.xlsx"))
)

$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.IO.Compression.FileSystem

function Read-Part($Zip, [string]$Path) {
  $entry = $Zip.GetEntry($Path)
  if (-not $entry) { throw "Parte ausente: $Path" }
  $reader = [IO.StreamReader]::new($entry.Open())
  try { return [xml]$reader.ReadToEnd() } finally { $reader.Dispose() }
}

function Cell-Value($Cell) {
  if ([string]$Cell.t -eq 'inlineStr') { return [string]$Cell.is.t }
  return [string]$Cell.v
}

$languages = @(
  'Tempo de qualidade',
  'Palavras de afirmação',
  'Atos de serviço',
  'Toque físico',
  'Presentes'
)

$zip = [IO.Compression.ZipFile]::OpenRead([IO.Path]::GetFullPath($WorkbookPath))
try {
  $workbook = Read-Part $zip 'xl/workbook.xml'
  $sheetNames = @($workbook.workbook.sheets.sheet | ForEach-Object { [string]$_.name })
  $expectedSheets = @('Resumo', 'Combinações', 'Mapa das perguntas', 'Critérios')
  if (($sheetNames -join '|') -ne ($expectedSheets -join '|')) {
    throw "Abas divergentes: $($sheetNames -join ', ')"
  }

  $summary = Read-Part $zip 'xl/worksheets/sheet1.xml'
  $combinations = Read-Part $zip 'xl/worksheets/sheet2.xml'
  $map = Read-Part $zip 'xl/worksheets/sheet3.xml'
  $criteria = Read-Part $zip 'xl/worksheets/sheet4.xml'

  $combinationRows = @($combinations.worksheet.sheetData.row)
  if ($combinationRows.Count -ne 33) {
    throw "A aba Combinações deve ter 1 cabeçalho e 32 combinações; encontrado: $($combinationRows.Count) linhas"
  }
  $expectedHeader = 'ID|Combinação|Q1|Linguagem Q1|Q2|Linguagem Q2|Q3|Linguagem Q3|Q4|Linguagem Q4|Q5|Linguagem Q5|Tempo de qualidade|Palavras de afirmação|Atos de serviço|Toque físico|Presentes|Maior pontuação|Empate|Linguagens empatadas|Resultado atual|Critério aplicado'
  $actualHeader = @($combinationRows[0].c | ForEach-Object { Cell-Value $_ }) -join '|'
  if ($actualHeader -ne $expectedHeader) { throw 'Cabeçalhos da aba Combinações divergentes' }

  $mapRows = @($map.worksheet.sheetData.row)
  if ($mapRows.Count -ne 6) { throw 'A aba Mapa das perguntas deve conter cinco perguntas' }
  $questionMap = @{}
  foreach ($row in $mapRows | Select-Object -Skip 1) {
    $cells = @($row.c | ForEach-Object { Cell-Value $_ })
    $questionMap[[int]$cells[0]] = @{ A = $cells[2]; B = $cells[4] }
  }

  $ids = @{}
  $codes = @{}
  foreach ($row in $combinationRows | Select-Object -Skip 1) {
    $cells = @($row.c | ForEach-Object { Cell-Value $_ })
    if ($cells.Count -ne 22) { throw "Linha $($row.r) deve conter 22 colunas" }
    $id = $cells[0]
    $code = $cells[1]
    if ($id -notmatch '^COMB-\d{3}$' -or $ids.ContainsKey($id)) { throw "ID inválido ou duplicado: $id" }
    if ($code -notmatch '^[AB]{5}$' -or $codes.ContainsKey($code)) { throw "Combinação inválida ou duplicada: $code" }
    $ids[$id] = $true
    $codes[$code] = $true

    $selected = @()
    for ($index = 0; $index -lt 5; $index++) {
      $choice = $cells[2 + ($index * 2)]
      $language = $cells[3 + ($index * 2)]
      if ($choice -ne [string]$code[$index]) { throw "Alternativa divergente em $id Q$($index + 1)" }
      if ($questionMap[$index + 1][$choice] -ne $language) { throw "Linguagem divergente em $id Q$($index + 1)" }
      $selected += $language
    }

    $scores = @{}
    for ($languageIndex = 0; $languageIndex -lt $languages.Count; $languageIndex++) {
      $scores[$languages[$languageIndex]] = [int]$cells[12 + $languageIndex]
    }
    if (($scores.Values | Measure-Object -Sum).Sum -ne 5) { throw "Pontuação não soma cinco em $id" }
    foreach ($language in $languages) {
      if ($scores[$language] -ne @($selected | Where-Object { $_ -eq $language }).Count) {
        throw "Pontuação divergente para $language em $id"
      }
    }

    $maximum = ($scores.Values | Measure-Object -Maximum).Maximum
    if ([int]$cells[17] -ne $maximum) { throw "Maior pontuação divergente em $id" }
    $tied = @($languages | Where-Object { $scores[$_] -eq $maximum })
    $expectedTie = if ($tied.Count -gt 1) { 'Sim' } else { 'Não' }
    if ($cells[18] -ne $expectedTie -or $cells[19] -ne ($tied -join ' | ')) { throw "Empate divergente em $id" }
    $expectedResult = $selected | Where-Object { $_ -in $tied } | Select-Object -First 1
    if ($cells[20] -ne $expectedResult) { throw "Resultado divergente em $id" }
  }

  if ($ids.Count -ne 32 -or $codes.Count -ne 32) { throw 'As 32 combinações não são únicas' }
  if (@($summary.worksheet.sheetData.row).Count -ne 7) { throw 'Resumo deve conter cinco linguagens e total' }
  if (@($criteria.worksheet.sheetData.row).Count -lt 7) { throw 'Critérios insuficientes' }
  if ($combinations.worksheet.autoFilter.ref -ne 'A1:V33') { throw 'Filtro da aba Combinações divergente' }

  Write-Output 'Mapeamento validado: 4 abas, 22 cabeçalhos, 5 perguntas, 32 combinações únicas, pontuações, empates e resultados equivalentes à lógica atual do site.'
} finally {
  $zip.Dispose()
}
