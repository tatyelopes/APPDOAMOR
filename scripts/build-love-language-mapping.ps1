param(
  [string]$OutputPath = (Join-Path $PSScriptRoot ("../Conte$([char]0x00FA)do/mapeamento-linguagens-do-amor.xlsx"))
)

$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.IO.Compression
Add-Type -AssemblyName System.IO.Compression.FileSystem

$languages = @(
  'Tempo de qualidade',
  'Palavras de afirmação',
  'Atos de serviço',
  'Toque físico',
  'Presentes'
)

$questions = @(
  [pscustomobject]@{ Number = 1; AText = 'Ter uma conversa sem pressa, só nós dois'; ALanguage = 'Tempo de qualidade'; BText = 'Ouvir algo sincero que meu amor admira em mim'; BLanguage = 'Palavras de afirmação' },
  [pscustomobject]@{ Number = 2; AText = 'Receber ajuda em uma tarefa cansativa'; ALanguage = 'Atos de serviço'; BText = 'Ganhar um abraço demorado ao fim do dia'; BLanguage = 'Toque físico' },
  [pscustomobject]@{ Number = 3; AText = 'Receber uma lembrancinha pensada em mim'; ALanguage = 'Presentes'; BText = 'Fazer um passeio juntos, sem celular'; BLanguage = 'Tempo de qualidade' },
  [pscustomobject]@{ Number = 4; AText = 'Receber uma mensagem dizendo por que sou especial'; ALanguage = 'Palavras de afirmação'; BText = 'Ter algo resolvido por mim num dia corrido'; BLanguage = 'Atos de serviço' },
  [pscustomobject]@{ Number = 5; AText = 'Andar de mãos dadas ou ficar bem pertinho'; ALanguage = 'Toque físico'; BText = 'Ganhar algo simples que lembre uma história nossa'; BLanguage = 'Presentes' }
)

$combinations = @()
for ($mask = 0; $mask -lt 32; $mask++) {
  $choices = @()
  $selectedLanguages = @()
  for ($questionIndex = 0; $questionIndex -lt $questions.Count; $questionIndex++) {
    $question = $questions[$questionIndex]
    $bit = 1 -shl (4 - $questionIndex)
    $choice = if (($mask -band $bit) -eq 0) { 'A' } else { 'B' }
    $choices += $choice
    $selectedLanguages += if ($choice -eq 'A') { $question.ALanguage } else { $question.BLanguage }
  }

  $scores = [ordered]@{}
  foreach ($language in $languages) { $scores[$language] = 0 }
  foreach ($language in $selectedLanguages) { $scores[$language]++ }
  $maximum = ($scores.Values | Measure-Object -Maximum).Maximum
  $tiedLanguages = @($languages | Where-Object { $scores[$_] -eq $maximum })
  $result = $selectedLanguages | Where-Object { $_ -in $tiedLanguages } | Select-Object -First 1

  $combinations += [pscustomobject]@{
    Id = 'COMB-{0:D3}' -f ($mask + 1)
    Combination = $choices -join ''
    Choices = $choices
    SelectedLanguages = $selectedLanguages
    Scores = $scores
    Maximum = [int]$maximum
    HasTie = $tiedLanguages.Count -gt 1
    TiedLanguages = $tiedLanguages
    Result = $result
  }
}

function Escape([object]$Value) {
  if ($null -eq $Value) { return '' }
  return [System.Security.SecurityElement]::Escape([string]$Value)
}

function Col([int]$Number) {
  $name = ''
  while ($Number -gt 0) {
    $Number--
    $name = [char](65 + ($Number % 26)) + $name
    $Number = [math]::Floor($Number / 26)
  }
  return $name
}

function Cell([int]$Row, [int]$Column, [object]$Value, [int]$Style = 0) {
  $reference = "$(Col $Column)$Row"
  if ($Value -is [int] -or $Value -is [double] -or $Value -is [decimal]) {
    $number = [Convert]::ToString($Value, [Globalization.CultureInfo]::InvariantCulture)
    return "<c r=`"$reference`" s=`"$Style`"><v>$number</v></c>"
  }
  return "<c r=`"$reference`" s=`"$Style`" t=`"inlineStr`"><is><t>$(Escape $Value)</t></is></c>"
}

function Sheet([array]$Rows, [int[]]$Widths, [string]$AutoFilter = '') {
  $columns = ''
  for ($index = 0; $index -lt $Widths.Count; $index++) {
    $number = $index + 1
    $columns += "<col min=`"$number`" max=`"$number`" width=`"$($Widths[$index])`" customWidth=`"1`"/>"
  }
  $xml = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">'
  $xml += '<sheetViews><sheetView workbookViewId="0"><pane ySplit="1" topLeftCell="A2" activePane="bottomLeft" state="frozen"/></sheetView></sheetViews>'
  $xml += "<cols>$columns</cols><sheetData>"
  for ($rowIndex = 0; $rowIndex -lt $Rows.Count; $rowIndex++) {
    $xml += "<row r=`"$($rowIndex + 1)`">"
    for ($columnIndex = 0; $columnIndex -lt $Rows[$rowIndex].Count; $columnIndex++) {
      $item = $Rows[$rowIndex][$columnIndex]
      if ($item -is [hashtable]) {
        $xml += Cell ($rowIndex + 1) ($columnIndex + 1) $item.v $item.s
      } else {
        $xml += Cell ($rowIndex + 1) ($columnIndex + 1) $item ($(if ($rowIndex -eq 0) { 1 } else { 0 }))
      }
    }
    $xml += '</row>'
  }
  $xml += '</sheetData>'
  if ($AutoFilter) { $xml += "<autoFilter ref=`"$AutoFilter`"/>" }
  $xml += '<pageMargins left="0.3" right="0.3" top="0.5" bottom="0.5" header="0.2" footer="0.2"/></worksheet>'
  return $xml
}

$summaryRows = ,@('Linguagem', 'Combinações como resultado', 'Percentual das 32 combinações')
foreach ($language in $languages) {
  $count = @($combinations | Where-Object Result -eq $language).Count
  $summaryRows += ,@($language, $count, @{ v = $count / 32; s = 3 })
}
$summaryRows += ,@('Total', 32, @{ v = 1; s = 3 })

$combinationRows = ,@(
  'ID', 'Combinação',
  'Q1', 'Linguagem Q1', 'Q2', 'Linguagem Q2', 'Q3', 'Linguagem Q3', 'Q4', 'Linguagem Q4', 'Q5', 'Linguagem Q5',
  'Tempo de qualidade', 'Palavras de afirmação', 'Atos de serviço', 'Toque físico', 'Presentes',
  'Maior pontuação', 'Empate', 'Linguagens empatadas', 'Resultado atual', 'Critério aplicado'
)
foreach ($combination in $combinations) {
  $row = @($combination.Id, $combination.Combination)
  for ($index = 0; $index -lt 5; $index++) {
    $row += $combination.Choices[$index]
    $row += $combination.SelectedLanguages[$index]
  }
  foreach ($language in $languages) { $row += [int]$combination.Scores[$language] }
  $row += $combination.Maximum
  $row += if ($combination.HasTie) { 'Sim' } else { 'Não' }
  $row += $combination.TiedLanguages -join ' | '
  $row += @{ v = $combination.Result; s = 4 }
  $row += if ($combination.HasTie) { 'Primeira linguagem empatada na ordem Q1 a Q5' } else { 'Maior pontuação' }
  $combinationRows += ,$row
}

$mapRows = ,@('Questão', 'Alternativa A', 'Linguagem A', 'Alternativa B', 'Linguagem B')
foreach ($question in $questions) {
  $mapRows += ,@($question.Number, $question.AText, $question.ALanguage, $question.BText, $question.BLanguage)
}

$criteriaRows = @(
  @('ITEM', 'REGRA / LEITURA'),
  @('Objetivo', 'Mapear as 32 combinações possíveis das cinco perguntas binárias usadas atualmente no site.'),
  @('Pontuação', 'Cada alternativa escolhida soma 1 ponto à linguagem associada.'),
  @('Resultado sem empate', 'A linguagem com a maior pontuação é apresentada como resultado.'),
  @('Desempate atual', 'Quando duas ou mais linguagens têm a maior pontuação, vence a primeira delas encontrada na ordem das respostas Q1 a Q5. Esta é a reprodução exata da lógica atual do site.'),
  @('Importante', 'O desempate por ordem pode favorecer as linguagens presentes nas primeiras perguntas. Recomenda-se decisão editorial explícita antes da validação com casais.'),
  @('Fonte', 'src/App.tsx — conjunto quiz e cálculo do resultado individual.'),
  @('Gerado em', (Get-Date -Format 'dd/MM/yyyy HH:mm'))
)

$styles = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><numFmts count="0"/><fonts count="3"><font><sz val="10"/><name val="Aptos"/></font><font><b/><color rgb="FFFFFFFF"/><sz val="10"/><name val="Aptos"/></font><font><b/><color rgb="FF3D1F3D"/><sz val="10"/><name val="Aptos"/></font></fonts><fills count="4"><fill><patternFill patternType="none"/></fill><fill><patternFill patternType="gray125"/></fill><fill><patternFill patternType="solid"><fgColor rgb="FF3D1F3D"/></patternFill></fill><fill><patternFill patternType="solid"><fgColor rgb="FFD4A94E"/></patternFill></fill></fills><borders count="2"><border/><border><bottom style="thin"><color rgb="FFD8C8B4"/></bottom></border></borders><cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs><cellXfs count="5"><xf numFmtId="0" fontId="0" fillId="0" borderId="1" xfId="0" applyAlignment="1"><alignment vertical="top" wrapText="1"/></xf><xf numFmtId="0" fontId="1" fillId="2" borderId="0" xfId="0" applyAlignment="1"><alignment vertical="center" wrapText="1"/></xf><xf numFmtId="0" fontId="0" fillId="0" borderId="1" xfId="0"/><xf numFmtId="10" fontId="0" fillId="0" borderId="1" xfId="0" applyNumberFormat="1"/><xf numFmtId="0" fontId="2" fillId="3" borderId="1" xfId="0" applyAlignment="1"><alignment vertical="top" wrapText="1"/></xf></cellXfs></styleSheet>'
$workbook = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheets><sheet name="Resumo" sheetId="1" r:id="rId1"/><sheet name="Combinações" sheetId="2" r:id="rId2"/><sheet name="Mapa das perguntas" sheetId="3" r:id="rId3"/><sheet name="Critérios" sheetId="4" r:id="rId4"/></sheets><calcPr calcId="191029" fullCalcOnLoad="1"/></workbook>'
$relationships = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/><Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet2.xml"/><Relationship Id="rId3" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet3.xml"/><Relationship Id="rId4" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet4.xml"/><Relationship Id="rId5" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/></Relationships>'
$rootRelationships = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/></Relationships>'
$types = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/><Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/><Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/><Override PartName="/xl/worksheets/sheet2.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/><Override PartName="/xl/worksheets/sheet3.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/><Override PartName="/xl/worksheets/sheet4.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/></Types>'

$parts = @{
  '[Content_Types].xml' = $types
  '_rels/.rels' = $rootRelationships
  'xl/workbook.xml' = $workbook
  'xl/_rels/workbook.xml.rels' = $relationships
  'xl/styles.xml' = $styles
  'xl/worksheets/sheet1.xml' = Sheet $summaryRows @(28, 25, 28) "A1:C$($summaryRows.Count)"
  'xl/worksheets/sheet2.xml' = Sheet $combinationRows @(12, 12, 6, 23, 6, 23, 6, 23, 6, 23, 6, 23, 18, 22, 18, 16, 14, 16, 10, 58, 24, 45) "A1:V$($combinationRows.Count)"
  'xl/worksheets/sheet3.xml' = Sheet $mapRows @(10, 48, 24, 48, 24) "A1:E$($mapRows.Count)"
  'xl/worksheets/sheet4.xml' = Sheet $criteriaRows @(24, 100) "A1:B$($criteriaRows.Count)"
}

$fullOutput = [System.IO.Path]::GetFullPath($OutputPath)
[System.IO.Directory]::CreateDirectory([System.IO.Path]::GetDirectoryName($fullOutput)) | Out-Null
$temporaryOutput = "$fullOutput.tmp"
if (Test-Path $temporaryOutput) { Remove-Item -LiteralPath $temporaryOutput }
$utf8 = [System.Text.UTF8Encoding]::new($false)
$stream = [System.IO.File]::Open($temporaryOutput, [System.IO.FileMode]::CreateNew)
$zip = [System.IO.Compression.ZipArchive]::new($stream, [System.IO.Compression.ZipArchiveMode]::Create)
try {
  foreach ($name in $parts.Keys) {
    $entry = $zip.CreateEntry($name, [System.IO.Compression.CompressionLevel]::Optimal)
    $writer = [System.IO.StreamWriter]::new($entry.Open(), $utf8)
    try { $writer.Write($parts[$name]) } finally { $writer.Dispose() }
  }
} finally {
  $zip.Dispose()
  $stream.Dispose()
}
Move-Item -LiteralPath $temporaryOutput -Destination $fullOutput -Force
Write-Output "Planilha criada: $fullOutput ($($combinations.Count) combinações)"
