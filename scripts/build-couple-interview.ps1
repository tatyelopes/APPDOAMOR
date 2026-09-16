param(
  [string]$SourcePath = (Join-Path $PSScriptRoot '..\Conteúdo\pesquisa-entrevista-rapida-casais.csv'),
  [string]$OutputPath = (Join-Path $PSScriptRoot '..\Conteúdo\pesquisa-entrevista-rapida-casais.xlsx')
)

$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.IO.Compression
$utf8 = [Text.UTF8Encoding]::new($false)
$dq = [char]34
$questions = @(Get-Content -Raw -Encoding UTF8 -LiteralPath $SourcePath | ConvertFrom-Csv -Delimiter ';')
$headers = @('ID','Seção','Ordem','Pergunta','Tipo no Forms','Obrigatória','Opções / escala','Limite / instrução','Lógica de navegação','Texto de apoio','Objetivo de pesquisa','Tag de análise','Status')
$lastQuestionRow = $questions.Count + 1

$overviewRows = @(
  @('PESQUISA RÁPIDA COM CASAIS — PROPOSTA V2','','',''),
  @('Projeto','App do Amor / Conectadois','',''),
  @('Versão','2.0 — proposta para aprovação','',''),
  @('Atualizado em',(Get-Date -Format 'dd/MM/yyyy'),'',''),
  @('Objetivo','Entender hábitos de conexão, barreiras, formatos desejados e limites para orientar o conteúdo e a experiência do produto.','',''),
  @('Aplicação','Individual. Cada integrante responde separadamente; respostas individuais não são mostradas à pessoa parceira.','',''),
  @('Tempo esperado','8–10 minutos','',''),
  @('Público','Pessoas com 18 anos ou mais, em relacionamento há pelo menos 6 meses.','',''),
  @('Privacidade','Usar somente código. Não coletar nome, e-mail ou telefone. Contatos de recrutamento ficam em base separada.','',''),
  @('Natureza','Pesquisa de produto. Não é terapia, diagnóstico ou avaliação do relacionamento.','',''),
  @('','','',''),
  @('COMPOSIÇÃO','VALOR','LEITURA',''),
  @('Total de perguntas',@{v=0;s=5;f=('COUNTA(''Roteiro Forms''!A2:A' + $lastQuestionRow + ')')},'inclui consentimento e triagem',''),
  @('Escolha única',@{v=0;s=5;f=('COUNTIF(''Roteiro Forms''!E2:E' + $lastQuestionRow + ',' + $dq + 'Escolha única' + $dq + ')')},'resposta rápida',''),
  @('Caixas de seleção',@{v=0;s=5;f=('COUNTIF(''Roteiro Forms''!E2:E' + $lastQuestionRow + ',' + $dq + 'Caixas de seleção' + $dq + ')')},'permite múltiplas respostas',''),
  @('Respostas abertas',@{v=0;s=5;f=('COUNTIF(''Roteiro Forms''!E2:E' + $lastQuestionRow + ',' + $dq + 'Resposta curta' + $dq + ')+COUNTIF(''Roteiro Forms''!E2:E' + $lastQuestionRow + ',' + $dq + 'Resposta longa' + $dq + ')')},'curtas e focadas',''),
  @('Perguntas obrigatórias',@{v=0;s=5;f=('COUNTIF(''Roteiro Forms''!F2:F' + $lastQuestionRow + ',' + $dq + 'Sim' + $dq + ')')},'somente duas são opcionais',''),
  @('Itens aguardando aprovação',@{v=0;s=5;f=('COUNTIF(''Roteiro Forms''!M2:M' + $lastQuestionRow + ',' + $dq + 'Proposta para aprovação' + $dq + ')')},'revisar antes de montar o Forms',''),
  @('% obrigatório',@{v=0;s=4;f='B17/B13'},'equilíbrio entre completude e fluidez',''),
  @('','','',''),
  @('FLUXO','SEÇÕES','TEMPO',''),
  @('1','Antes de começar','menos de 1 min','consentimento e elegibilidade'),
  @('2','Sobre vocês','1 min','segmentação mínima sem dados identificáveis'),
  @('3','Conexão no dia a dia','2 min','episódio real, motivadores e barreira'),
  @('4','Experiências atuais','1 min','uso anterior e abandono com ramificação'),
  @('5','Experiência ideal','2 min','formato, duração, ocasião, modo e profundidade'),
  @('6','Conteúdo e cuidado','1 min','temas e consentimento bilateral'),
  @('7','Teste rápido de conceito','2 min','preferência, valor e intenção'),
  @('8','Fechamento','1 min','pergunta sugerida e risco de abandono'),
  @('','','',''),
  @('CRITÉRIOS DE APROVAÇÃO','','',''),
  @('Conteúdo','Perguntas claras, inclusivas, neutras e úteis para decisões de produto.','',''),
  @('Experiência','Preenchimento completo em até 10 minutos no celular.','',''),
  @('Segurança','Saída para não consentimento ou menoridade, temas sensíveis com opt-in e opção de pular itens não essenciais.','',''),
  @('Dados','Código em vez de nome e nenhuma coleta automática de e-mail.','','')
)

$formRows = ,$headers
foreach($q in $questions) {
  $formRows += ,@($q.ID,$q.'Seção',[int]$q.Ordem,$q.Pergunta,$q.'Tipo no Forms',$q.'Obrigatória',$q.'Opções / escala',$q.'Limite / instrução',$q.'Lógica de navegação',$q.'Texto de apoio',$q.'Objetivo de pesquisa',$q.'Tag de análise',$q.Status)
}

$optionRows = ,@('Pergunta ID','Ordem da opção','Opção','Destino / regra','Valor para análise')
foreach($q in $questions) {
  if(-not $q.'Opções / escala') { continue }
  $index = 0
  foreach($option in ($q.'Opções / escala' -split '\|')) {
    $index++
    $destination = ''
    if($q.ID -eq 'Q01' -and $option -eq 'Não quero participar') { $destination = 'Encerrar formulário' }
    elseif($q.ID -eq 'Q02' -and $option -eq 'Não') { $destination = 'Encerrar formulário' }
    elseif($q.ID -eq 'Q10' -and $option -eq 'Nunca usamos') { $destination = 'Ir para Q12' }
    $optionRows += ,@($q.ID,$index,$option,$destination,($q.ID + '-' + $index))
  }
}

$analysisRows = @(
  @('TAG','QUESTÕES','O QUE SINTETIZAR','DECISÃO APOIADA'),
  @('perfil','Q03–Q05','Tempo de relação e contextos de vida, sempre de forma agregada','Segmentos e diversidade da amostra'),
  @('episódio e hábito','Q06–Q07','Ocasiões reais e frequência recente','Momentos de entrada e promessas realistas'),
  @('motivador e barreira','Q08–Q09','Gatilhos de conexão e principal obstáculo','Tom, convites e contexto das atividades'),
  @('alternativas','Q10–Q11','O que funciona, cansa ou gera abandono','Diferenciação e prevenção de rejeição'),
  @('formato, duração e modo','Q12–Q16','Mecânicas, tempo, ocasião, telas e progressão','Configuração do primeiro piloto'),
  @('tema e segurança','Q17–Q18','Temas desejados e necessidade de consentimento bilateral','Prioridade editorial e regras de opt-in'),
  @('conceito, resultado e intenção','Q19–Q22','Conceito preferido, desfecho e motivo da nota','Escolha da proposta e hipótese de recorrência'),
  @('conteúdo e risco','Q23–Q24','Perguntas na voz do público e limites críticos','Banco editorial e critérios de exclusão'),
  @('','','',''),
  @('REGRAS DE LEITURA','','',''),
  @('1','Não somar notas como prova de validação. Cruzar Q21 com Q22 e comportamentos relatados.','',''),
  @('2','Não interpretar respostas individuais como avaliação da qualidade do relacionamento.','',''),
  @('3','Anonimizar exemplos e remover detalhes identificáveis de participantes ou terceiros.','',''),
  @('4','Comparar segmentos somente com volume suficiente para evitar reidentificação.','',''),
  @('5','Registrar contradições e casos extremos, não apenas a resposta mais frequente.','','')
)

$checklistRows = @(
  @('ID','CONFIGURAÇÃO PARA O FORMS','CRITÉRIO DE ACEITE','STATUS'),
  @('F01','Escolher a plataforma e criar 8 seções na ordem do roteiro','Uma seção por bloco e indicador de progresso ativo','Após aprovação'),
  @('F02','Inserir abertura, natureza da pesquisa, privacidade e tempo','Finalidade, duração e voluntariedade aparecem antes de Q01','Após aprovação'),
  @('F03','Configurar Q01 e Q02 com encerramento para respostas inelegíveis','Rotas de saída testadas sem perguntas posteriores','Após aprovação'),
  @('F04','Configurar Q10 para pular Q11 quando a resposta for Nunca usamos','A pessoa segue diretamente para Q12','Após aprovação'),
  @('F05','Reproduzir obrigatoriedade, opções, apoios e limites da planilha','Formulário equivale à versão aprovada','Após aprovação'),
  @('F06','Desativar coleta automática de e-mail e usar somente Q03','Exportação não contém identificadores diretos','Após aprovação'),
  @('F07','Desativar compartilhamento de respostas e edição pública','Respostas restritas à equipe autorizada','Após aprovação'),
  @('F08','Revisar celular, contraste, foco e linguagem inclusiva','Fluxo funciona sem zoom ou corte de opções','Após aprovação'),
  @('F09','Testar não consentimento, menoridade e percurso elegível','Ramificações e obrigatoriedades funcionam','Após aprovação'),
  @('F10','Pilotar com duas pessoas de casais diferentes','Tempo mediano de até 10 minutos e ajustes registrados','Após aprovação')
)

$responseHeaders = @('Código','Data/hora') + @($questions | ForEach-Object {$_.ID})
$responseGuide = @('Preencher sem nome','dd/mm/aaaa hh:mm') + @($questions | ForEach-Object {if($_.Pergunta.Length -gt 42){$_.Pergunta.Substring(0,42)+'…'}else{$_.Pergunta}})
$responseRows = @()
$responseRows += ,$responseHeaders
$responseRows += ,$responseGuide

function Escape([object]$Value) {
  if($null -eq $Value){return ''}
  return [Security.SecurityElement]::Escape([string]$Value)
}
function Col([int]$Number) {
  $name=''
  while($Number -gt 0){$Number--; $name=[char](65+($Number%26))+$name; $Number=[math]::Floor($Number/26)}
  return $name
}
function Cell([int]$Row,[int]$Column,[object]$Value,[int]$Style=0,[string]$Formula='') {
  $ref=(Col $Column)+$Row
  if($Formula){return ('<c r=''{0}'' s=''{1}''><f>{2}</f><v>0</v></c>' -f $ref,$Style,(Escape $Formula))}
  if($Value -is [int] -or $Value -is [double] -or $Value -is [decimal]){return ('<c r=''{0}'' s=''{1}''><v>{2}</v></c>' -f $ref,$Style,$Value)}
  return ('<c r=''{0}'' s=''{1}'' t=''inlineStr''><is><t>{2}</t></is></c>' -f $ref,$Style,(Escape $Value))
}
function Sheet([array]$Rows,[int[]]$Widths,[int]$FreezeRow=1,[string]$AutoFilter='',[int]$HeaderRow=1) {
  $cols=''
  for($i=0;$i-lt $Widths.Count;$i++){$n=$i+1; $cols+=('<col min=''{0}'' max=''{0}'' width=''{1}'' customWidth=''1''/>' -f $n,$Widths[$i])}
  $xml='<?xml version=''1.0'' encoding=''UTF-8'' standalone=''yes''?><worksheet xmlns=''http://schemas.openxmlformats.org/spreadsheetml/2006/main''>'
  $xml+=('<sheetViews><sheetView workbookViewId=''0''><pane ySplit=''{0}'' topLeftCell=''A{1}'' activePane=''bottomLeft'' state=''frozen''/></sheetView></sheetViews><cols>{2}</cols><sheetData>' -f $FreezeRow,($FreezeRow+1),$cols)
  for($r=0;$r-lt $Rows.Count;$r++){
    $rowNumber=$r+1; $xml+=('<row r=''{0}''>' -f $rowNumber)
    for($c=0;$c-lt $Rows[$r].Count;$c++){
      $item=$Rows[$r][$c]
      if($item -is [hashtable]){$xml+=Cell $rowNumber ($c+1) $item.v $item.s $item.f}
      else{
        $style=0
        if($rowNumber -eq $HeaderRow){$style=1}
        elseif($HeaderRow -gt 1 -and $r -eq 0){$style=2}
        elseif($HeaderRow -gt 1 -and $Rows[$r][0] -and -not $Rows[$r][1]){$style=3}
        $xml+=Cell $rowNumber ($c+1) $item $style
      }
    }
    $xml+='</row>'
  }
  $xml+='</sheetData>'
  if($AutoFilter){$xml+=('<autoFilter ref=''{0}''/>' -f $AutoFilter)}
  $xml+='<pageMargins left=''0.3'' right=''0.3'' top=''0.5'' bottom=''0.5'' header=''0.2'' footer=''0.2''/></worksheet>'
  return $xml
}

$sheets = @(
  @{Name='Visão Geral'; Xml=(Sheet $overviewRows @(28,74,38,52) 12 '' 12)},
  @{Name='Roteiro Forms'; Xml=(Sheet $formRows @(10,24,8,62,20,13,55,32,38,44,38,18,24) 1 ('A1:M' + $formRows.Count) 1)},
  @{Name='Opções'; Xml=(Sheet $optionRows @(14,16,60,28,20) 1 ('A1:E' + $optionRows.Count) 1)},
  @{Name='Mapa de análise'; Xml=(Sheet $analysisRows @(25,25,68,52) 1 'A1:D9' 1)},
  @{Name='Checklist Forms'; Xml=(Sheet $checklistRows @(10,65,62,20) 1 ('A1:D' + $checklistRows.Count) 1)},
  @{Name='Respostas piloto'; Xml=(Sheet $responseRows (@(16,20) + @(24) * $questions.Count) 2 '' 1)}
)

$sheetsXml=''; $relsXml=''; $typesXml=''; $parts=@{}
for($i=0;$i-lt $sheets.Count;$i++){
  $id=$i+1; $name=Escape $sheets[$i].Name
  $sheetsXml+=('<sheet name=''{0}'' sheetId=''{1}'' r:id=''rId{1}''/>' -f $name,$id)
  $relsXml+=('<Relationship Id=''rId{0}'' Type=''http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet'' Target=''worksheets/sheet{0}.xml''/>' -f $id)
  $typesXml+=('<Override PartName=''/xl/worksheets/sheet{0}.xml'' ContentType=''application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml''/>' -f $id)
  $parts[('xl/worksheets/sheet{0}.xml' -f $id)]=$sheets[$i].Xml
}
$styleId=$sheets.Count+1
$workbook=('<?xml version=''1.0'' encoding=''UTF-8'' standalone=''yes''?><workbook xmlns=''http://schemas.openxmlformats.org/spreadsheetml/2006/main'' xmlns:r=''http://schemas.openxmlformats.org/officeDocument/2006/relationships''><sheets>{0}</sheets><calcPr calcId=''191029'' fullCalcOnLoad=''1''/></workbook>' -f $sheetsXml)
$rels=('<?xml version=''1.0'' encoding=''UTF-8'' standalone=''yes''?><Relationships xmlns=''http://schemas.openxmlformats.org/package/2006/relationships''>{0}<Relationship Id=''rId{1}'' Type=''http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles'' Target=''styles.xml''/></Relationships>' -f $relsXml,$styleId)
$types=('<?xml version=''1.0'' encoding=''UTF-8'' standalone=''yes''?><Types xmlns=''http://schemas.openxmlformats.org/package/2006/content-types''><Default Extension=''rels'' ContentType=''application/vnd.openxmlformats-package.relationships+xml''/><Default Extension=''xml'' ContentType=''application/xml''/><Override PartName=''/xl/workbook.xml'' ContentType=''application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml''/><Override PartName=''/xl/styles.xml'' ContentType=''application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml''/>{0}</Types>' -f $typesXml)
$styles='<?xml version=''1.0'' encoding=''UTF-8'' standalone=''yes''?><styleSheet xmlns=''http://schemas.openxmlformats.org/spreadsheetml/2006/main''><fonts count=''3''><font><sz val=''10''/><name val=''Aptos''/></font><font><b/><color rgb=''FFFFFFFF''/><sz val=''10''/><name val=''Aptos''/></font><font><b/><color rgb=''FF3D1F3D''/><sz val=''16''/><name val=''Aptos Display''/></font></fonts><fills count=''5''><fill><patternFill patternType=''none''/></fill><fill><patternFill patternType=''gray125''/></fill><fill><patternFill patternType=''solid''><fgColor rgb=''FF3D1F3D''/></patternFill></fill><fill><patternFill patternType=''solid''><fgColor rgb=''FFF3E9D7''/></patternFill></fill><fill><patternFill patternType=''solid''><fgColor rgb=''FFFFF4CC''/></patternFill></fill></fills><borders count=''2''><border/><border><bottom style=''thin''><color rgb=''FFD8C8B4''/></bottom></border></borders><cellStyleXfs count=''1''><xf numFmtId=''0'' fontId=''0'' fillId=''0'' borderId=''0''/></cellStyleXfs><cellXfs count=''6''><xf numFmtId=''0'' fontId=''0'' fillId=''0'' borderId=''1'' xfId=''0'' applyAlignment=''1''><alignment vertical=''top'' wrapText=''1''/></xf><xf numFmtId=''0'' fontId=''1'' fillId=''2'' borderId=''0'' xfId=''0'' applyAlignment=''1''><alignment vertical=''center'' wrapText=''1''/></xf><xf numFmtId=''0'' fontId=''2'' fillId=''3'' borderId=''0'' xfId=''0'' applyAlignment=''1''><alignment vertical=''center'' wrapText=''1''/></xf><xf numFmtId=''0'' fontId=''1'' fillId=''2'' borderId=''0'' xfId=''0'' applyAlignment=''1''><alignment vertical=''center'' wrapText=''1''/></xf><xf numFmtId=''10'' fontId=''0'' fillId=''0'' borderId=''1'' xfId=''0'' applyNumberFormat=''1'' applyAlignment=''1''><alignment vertical=''top''/></xf><xf numFmtId=''0'' fontId=''0'' fillId=''4'' borderId=''1'' xfId=''0'' applyAlignment=''1''><alignment vertical=''top'' wrapText=''1''/></xf></cellXfs></styleSheet>'

$parts['[Content_Types].xml']=$types
$parts['_rels/.rels']='<?xml version=''1.0'' encoding=''UTF-8'' standalone=''yes''?><Relationships xmlns=''http://schemas.openxmlformats.org/package/2006/relationships''><Relationship Id=''rId1'' Type=''http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument'' Target=''xl/workbook.xml''/></Relationships>'
$parts['xl/workbook.xml']=$workbook
$parts['xl/_rels/workbook.xml.rels']=$rels
$parts['xl/styles.xml']=$styles

$full=[IO.Path]::GetFullPath($OutputPath)
[IO.Directory]::CreateDirectory([IO.Path]::GetDirectoryName($full)) | Out-Null
$temp=$full+'.tmp'
if(Test-Path $temp){Remove-Item -LiteralPath $temp}
$stream=[IO.File]::Open($temp,[IO.FileMode]::CreateNew)
$zip=[IO.Compression.ZipArchive]::new($stream,[IO.Compression.ZipArchiveMode]::Create)
try{
  foreach($name in $parts.Keys){
    $entry=$zip.CreateEntry($name,[IO.Compression.CompressionLevel]::Optimal)
    $writer=[IO.StreamWriter]::new($entry.Open(),$utf8)
    try{$writer.Write($parts[$name])}finally{$writer.Dispose()}
  }
}finally{$zip.Dispose();$stream.Dispose()}
Move-Item -LiteralPath $temp -Destination $full -Force
Write-Output ('Pesquisa criada: {0} ({1} perguntas, {2} opções)' -f $full,$questions.Count,($optionRows.Count-1))
