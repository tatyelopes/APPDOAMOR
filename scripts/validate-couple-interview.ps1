param(
  [string]$SourcePath = (Join-Path $PSScriptRoot '..\Conteúdo\pesquisa-entrevista-rapida-casais.csv'),
  [string]$WorkbookPath = (Join-Path $PSScriptRoot '..\Conteúdo\pesquisa-entrevista-rapida-casais.xlsx')
)

$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.IO.Compression.FileSystem
$questions=@(Get-Content -Raw -Encoding UTF8 -LiteralPath $SourcePath | ConvertFrom-Csv -Delimiter ';')

if($questions.Count -ne 24){throw ('Esperadas 24 perguntas, encontradas {0}' -f $questions.Count)}
if(@($questions.ID | Select-Object -Unique).Count -ne 24){throw 'IDs de perguntas duplicados'}
if(@($questions | Where-Object Obrigatória -eq 'Sim').Count -ne 22){throw 'Quantidade de perguntas obrigatórias divergente'}
if(@($questions | Where-Object 'Tipo no Forms' -eq 'Escolha única').Count -ne 13){throw 'Quantidade de escolhas únicas divergente'}
if(@($questions | Where-Object 'Tipo no Forms' -eq 'Caixas de seleção').Count -ne 5){throw 'Quantidade de caixas de seleção divergente'}
if(@($questions | Where-Object {$_.'Tipo no Forms' -in @('Resposta curta','Resposta longa')}).Count -ne 6){throw 'Quantidade de respostas abertas divergente'}
for($i=0;$i-lt $questions.Count;$i++){
  if($questions[$i].ID -ne ('Q{0:d2}' -f ($i+1))){throw ('Sequência de IDs divergente na posição {0}' -f ($i+1))}
  if([int]$questions[$i].Ordem -ne ($i+1)){throw ('Ordem divergente em {0}' -f $questions[$i].ID)}
}

function Read-Part($zip,[string]$path){
  $entry=$zip.GetEntry($path)
  if(-not $entry){throw ('Parte ausente: {0}' -f $path)}
  $reader=[IO.StreamReader]::new($entry.Open())
  try{return [xml]$reader.ReadToEnd()}finally{$reader.Dispose()}
}
function CellText($cell){
  if($null -ne $cell.is){return [string]$cell.is.t}
  return [string]$cell.v
}

$zip=[IO.Compression.ZipFile]::OpenRead([IO.Path]::GetFullPath($WorkbookPath))
try{
  $workbook=Read-Part $zip 'xl/workbook.xml'
  $sheetNames=@($workbook.workbook.sheets.sheet | ForEach-Object {$_.name})
  $expectedSheets=@('Visão Geral','Roteiro Forms','Opções','Mapa de análise','Checklist Forms','Respostas piloto')
  if(($sheetNames -join '|') -ne ($expectedSheets -join '|')){throw ('Abas divergentes: {0}' -f ($sheetNames -join ', '))}

  $overview=Read-Part $zip 'xl/worksheets/sheet1.xml'
  $route=Read-Part $zip 'xl/worksheets/sheet2.xml'
  $options=Read-Part $zip 'xl/worksheets/sheet3.xml'
  $response=Read-Part $zip 'xl/worksheets/sheet6.xml'

  $routeRows=@($route.worksheet.sheetData.row)
  if($routeRows.Count -ne 25){throw 'Quantidade de linhas do roteiro divergente'}
  $expectedHeaders='ID|Seção|Ordem|Pergunta|Tipo no Forms|Obrigatória|Opções / escala|Limite / instrução|Lógica de navegação|Texto de apoio|Objetivo de pesquisa|Tag de análise|Status'
  if((@($routeRows[0].c | ForEach-Object {CellText $_}) -join '|') -ne $expectedHeaders){throw 'Cabeçalhos do roteiro divergentes'}
  if($route.worksheet.autoFilter.ref -ne 'A1:M25'){throw 'Filtro do roteiro divergente'}
  for($i=0;$i-lt $questions.Count;$i++){
       if((CellText $routeRows[$i+1].c[0]) -ne $questions[$i].ID){throw ('ID divergente na linha {0}' -f ($i+2))}
       if([int](CellText $routeRows[$i+1].c[2]) -ne ($i+1)){throw ('Ordem divergente na linha {0}' -f ($i+2))}
  }
  $expectedOptions=0
  foreach($q in $questions){
    if($q.'Opções / escala'){$expectedOptions+=@($q.'Opções / escala' -split '\|').Count}
  }
  if(@($options.worksheet.sheetData.row).Count -ne ($expectedOptions+1)){throw 'Quantidade de opções divergente'}
  if($options.worksheet.autoFilter.ref -ne ('A1:E' + ($expectedOptions+1))){throw 'Filtro de opções divergente'}

  $formulaNodes=@($overview.SelectNodes('//*[local-name()=''f'']'))
  if($formulaNodes.Count -ne 7){throw ('Quantidade de fórmulas divergente: {0}' -f $formulaNodes.Count)}
  $responseRows=@($response.worksheet.sheetData.row)
  if($responseRows.Count -ne 2){throw 'Modelo de respostas deve ter duas linhas de cabeçalho'}
  if(@($responseRows[0].c).Count -ne 26){throw 'Modelo de respostas deve conter Código, Data/hora e Q01–Q24'}
  Write-Output ('Pesquisa validada: 6 abas, 24 perguntas, 22 obrigatórias, {0} opções, 13 cabeçalhos e 7 fórmulas.' -f $expectedOptions)
}finally{$zip.Dispose()}
