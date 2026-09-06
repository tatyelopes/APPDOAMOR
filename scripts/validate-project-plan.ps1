param([string]$WorkbookPath = (Join-Path $PSScriptRoot '../Plano de trabalho/acompanhamento-app-do-amor.xlsx'))
$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.IO.Compression.FileSystem
$source = [IO.File]::ReadAllText((Join-Path $PSScriptRoot 'build-project-plan.ps1'))
$match = [regex]::Match($source, "(?s)@'\r?\n(.*?)\r?\n'@")
if(-not $match.Success){throw 'Fonte CSV ausente'}
$csv = $match.Groups[1].Value
foreach($line in $csv -split '\r?\n'){if(($line -split ';').Count -ne 13){throw "CSV deve ter 13 campos: $line"}}
$tasks = @($csv | ConvertFrom-Csv -Delimiter ';')
$ids = @{}; $deps = @{}
foreach($task in $tasks){
  $id = [int]$task.ID
  if($id -le 0 -or $ids.ContainsKey($id)){throw "ID inválido ou duplicado: $id"}
  if($task.Status -notin @('Concluído','Em andamento','Não iniciado','Cancelado')){throw "Status inválido: $id"}
  $ids[$id] = $task
}
foreach($task in $tasks){
  $list = @()
  foreach($part in ($task.Dependência -split ',')){
    if(-not $part){continue}
    if($part -match '^(\d+)-(\d+)$'){
      if([int]$Matches[1] -gt [int]$Matches[2]){throw 'Intervalo invertido'}
      $list += [int]$Matches[1]..[int]$Matches[2]
    }elseif($part -match '^\d+$'){$list += [int]$part}else{throw "Dependência inválida: $part"}
  }
  foreach($dep in $list){if(-not $ids.ContainsKey($dep)){throw "Dependência inexistente: $dep"}}
  $deps[[int]$task.ID] = $list
}
$visiting = @{}; $visited = @{}
function Visit([int]$id){
  if($visiting[$id]){throw "Ciclo de dependências em $id"}
  if($visited[$id]){return}
  $visiting[$id]=$true
  foreach($dep in $deps[$id]){Visit $dep}
  $visiting[$id]=$false; $visited[$id]=$true
}
foreach($id in $ids.Keys){Visit $id}
function Read-Part($zip,[string]$path){
  $entry=$zip.GetEntry($path); if(-not $entry){throw "Parte ausente: $path"}
  $reader=[IO.StreamReader]::new($entry.Open())
  try{[xml]$reader.ReadToEnd()}finally{$reader.Dispose()}
}
$zip=[IO.Compression.ZipFile]::OpenRead([IO.Path]::GetFullPath($WorkbookPath))
try{
  $plan=Read-Part $zip 'xl/worksheets/sheet2.xml'
  $dash=Read-Part $zip 'xl/worksheets/sheet1.xml'
  $rows=@($plan.worksheet.sheetData.row)
  $last=$tasks.Count+1
  if($rows.Count -ne $last){throw 'Quantidade de linhas divergente'}
  $expected='ID|Fase|Área|Tarefa|Entregável|Prioridade|Dependência|Responsável|Status|Estimativa (h)|Início planejado|Fim planejado|% concluído|Observações'
  if((@($rows[0].c|ForEach-Object{$_.is.t}) -join '|') -ne $expected){throw 'Cabeçalhos divergentes'}
  for($i=0;$i -lt $tasks.Count;$i++){
    $row=$rows[$i+1]; $task=$tasks[$i]
    if(@($row.c).Count -ne 14 -or [int]$row.c[0].v -ne [int]$task.ID){throw 'Estrutura de tarefa divergente'}
    foreach($pair in @(@(1,'Fase'),@(2,'Área'),@(3,'Tarefa'),@(4,'Entregável'),@(5,'Prioridade'),@(6,'Dependência'),@(8,'Status'),@(10,'Início planejado'),@(11,'Fim planejado'),@(13,'Observações'))){
      if([string]$row.c[$pair[0]].is.t -ne [string]$task.($pair[1])){throw "Campo divergente no item $($task.ID): $($pair[1])"}
    }
    if([int]$row.c[9].v -ne [int]$task.'Estimativa (h)'){throw 'Estimativa divergente'}
    $pct=switch($task.Status){'Concluído'{1};'Em andamento'{0.5};default{0}}
    if([double]::Parse($row.c[12].v,[cultureinfo]::InvariantCulture) -ne $pct){throw 'Percentual divergente'}
  }
  if($plan.worksheet.autoFilter.ref -ne "A1:N$last"){throw 'Filtro divergente'}
  $formulaNodes=@($dash.SelectNodes("//*[local-name()='f']"))
  if($formulaNodes.Count -ne 32){throw 'Quantidade de fórmulas divergente'}
  $formulaTexts=@($formulaNodes|ForEach-Object{$_.InnerText})
  foreach($formula in $formulaTexts){
    if($formula -notmatch '^(COUNTA|COUNTIF|COUNTIFS|AVERAGE|SUM)\('){throw "Função inesperada: $formula"}
    $ranges=[regex]::Matches($formula,'![A-Z]+2:[A-Z]+(\d+)')
    if($ranges.Count -eq 0){throw 'Fórmula sem intervalo'}
    foreach($range in $ranges){if([int]$range.Groups[1].Value -ne $last){throw "Intervalo divergente: $formula"}}
  }
  if($formulaTexts -notcontains "COUNTA('Plano Mestre'!A2:A$last)" -or $formulaTexts -notcontains "AVERAGE('Plano Mestre'!M2:M$last)" -or $formulaTexts -notcontains "SUM('Plano Mestre'!J2:J$last)"){throw 'Fórmulas principais divergentes'}
  Write-Output "Plano validado: $($tasks.Count) tarefas únicas, dependências existentes sem ciclos, 14 cabeçalhos, conteúdo e percentuais equivalentes à fonte, 32 fórmulas até a linha $last."
}finally{$zip.Dispose()}
