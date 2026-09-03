param(
  [Parameter(Mandatory=$true)][string]$InputPath,
  [Parameter(Mandatory=$true)][string]$OutputPath
)

$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.IO.Compression
$utf8 = [System.Text.UTF8Encoding]::new($false)

function EscapeXml([string]$value) {
  return [System.Security.SecurityElement]::Escape($value)
}

function PlainText([string]$text) {
  $text = $text -replace '\*\*(.*?)\*\*', '$1'
  $text = $text -replace '\*(.*?)\*', '$1'
  $text = $text -replace '`([^`]*)`', '$1'
  $text = [regex]::Replace($text, '\[([^\]]+)\]\(([^\)]+)\)', '$1 ($2)')
  return $text.Trim()
}

function Run([string]$text, [bool]$bold=$false, [bool]$italic=$false, [int]$size=0, [string]$color='') {
  $properties = ''
  if ($bold) { $properties += '<w:b/>' }
  if ($italic) { $properties += '<w:i/>' }
  if ($size -gt 0) { $properties += "<w:sz w:val=`"$size`"/><w:szCs w:val=`"$size`"/>" }
  if ($color) { $properties += "<w:color w:val=`"$color`"/>" }
  return "<w:r><w:rPr>$properties</w:rPr><w:t xml:space=`"preserve`">$(EscapeXml (PlainText $text))</w:t></w:r>"
}

function Paragraph([string]$text, [string]$style='', [string]$prefix='', [bool]$italic=$false, [string]$shade='') {
  $pPr = ''
  if ($style) { $pPr += "<w:pStyle w:val=`"$style`"/>" }
  if ($shade) { $pPr += "<w:shd w:val=`"clear`" w:color=`"auto`" w:fill=`"$shade`"/><w:ind w:left=`"360`"/><w:spacing w:before=`"100`" w:after=`"100`"/>" }
  $content = ''
  if ($prefix) { $content += Run $prefix $true $false }
  $content += Run $text $false $italic
  return "<w:p><w:pPr>$pPr</w:pPr>$content</w:p>"
}

function TableXml([array]$rows) {
  $xml = '<w:tbl><w:tblPr><w:tblW w:w="0" w:type="auto"/><w:tblBorders><w:top w:val="single" w:sz="4" w:color="D9CDBF"/><w:left w:val="single" w:sz="4" w:color="D9CDBF"/><w:bottom w:val="single" w:sz="4" w:color="D9CDBF"/><w:right w:val="single" w:sz="4" w:color="D9CDBF"/><w:insideH w:val="single" w:sz="4" w:color="D9CDBF"/><w:insideV w:val="single" w:sz="4" w:color="D9CDBF"/></w:tblBorders></w:tblPr>'
  for ($r=0; $r -lt $rows.Count; $r++) {
    $xml += '<w:tr>'
    foreach ($cell in $rows[$r]) {
      $fill = if ($r -eq 0) { '<w:shd w:val="clear" w:color="auto" w:fill="3D1F3D"/>' } else { '' }
      $run = Run $cell ($r -eq 0) $false 0 $(if ($r -eq 0) { 'FFFFFF' } else { '' })
      $xml += "<w:tc><w:tcPr><w:tcW w:w=`"0`" w:type=`"auto`"/>$fill</w:tcPr><w:p>$run</w:p></w:tc>"
    }
    $xml += '</w:tr>'
  }
  return $xml + '</w:tbl><w:p/>'
}

$lines = Get-Content -LiteralPath $InputPath -Encoding UTF8
$body = ''
$inCode = $false
$codeLines = [System.Collections.Generic.List[string]]::new()
$i = 0
while ($i -lt $lines.Count) {
  $line = $lines[$i]
  if ($line -match '^```') {
    if ($inCode) {
      $body += Paragraph ($codeLines -join "`n") '' '' $false 'F2EEE9'
      $codeLines.Clear(); $inCode = $false
    } else { $inCode = $true }
    $i++; continue
  }
  if ($inCode) { $codeLines.Add($line); $i++; continue }
  if ($line -match '^\|.*\|\s*$' -and $i + 1 -lt $lines.Count -and $lines[$i + 1] -match '^\|?\s*:?-{3,}') {
    $tableRows = [System.Collections.Generic.List[object]]::new()
    $tableRows.Add(@($line.Trim('|').Split('|') | ForEach-Object { PlainText $_ }))
    $i += 2
    while ($i -lt $lines.Count -and $lines[$i] -match '^\|.*\|\s*$') {
      $tableRows.Add(@($lines[$i].Trim('|').Split('|') | ForEach-Object { PlainText $_ }))
      $i++
    }
    $body += TableXml $tableRows
    continue
  }
  if ([string]::IsNullOrWhiteSpace($line)) { $body += '<w:p/>'; $i++; continue }
  if ($line -match '^(#{1,6})\s+(.+)$') {
    $level = [Math]::Min($matches[1].Length, 3)
    $body += Paragraph $matches[2] "Heading$level"
  } elseif ($line -match '^>\s?(.*)$') {
    $body += Paragraph $matches[1] 'Quote' '' $true 'F7EFE6'
  } elseif ($line -match '^[-*]\s+(.+)$') {
    $body += Paragraph $matches[1] 'ListParagraph' '•  '
  } elseif ($line -match '^(\d+)\.\s+(.+)$') {
    $body += Paragraph $matches[2] 'ListParagraph' "$($matches[1]).  "
  } else {
    $body += Paragraph $line
  }
  $i++
}

$document = @"
<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:body>$body<w:sectPr><w:pgSz w:w="11906" w:h="16838"/><w:pgMar w:top="1134" w:right="1134" w:bottom="1134" w:left="1134" w:header="708" w:footer="708"/><w:cols w:space="708"/><w:docGrid w:linePitch="360"/></w:sectPr></w:body></w:document>
"@

$styles = @'
<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:styles xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
<w:docDefaults><w:rPrDefault><w:rPr><w:rFonts w:ascii="Aptos" w:hAnsi="Aptos"/><w:sz w:val="22"/><w:color w:val="332733"/></w:rPr></w:rPrDefault><w:pPrDefault><w:pPr><w:spacing w:after="120" w:line="276" w:lineRule="auto"/></w:pPr></w:pPrDefault></w:docDefaults>
<w:style w:type="paragraph" w:default="1" w:styleId="Normal"><w:name w:val="Normal"/></w:style>
<w:style w:type="paragraph" w:styleId="Heading1"><w:name w:val="heading 1"/><w:basedOn w:val="Normal"/><w:next w:val="Normal"/><w:pPr><w:keepNext/><w:spacing w:before="300" w:after="140"/><w:outlineLvl w:val="0"/></w:pPr><w:rPr><w:rFonts w:ascii="Georgia" w:hAnsi="Georgia"/><w:b/><w:color w:val="6F2941"/><w:sz w:val="34"/></w:rPr></w:style>
<w:style w:type="paragraph" w:styleId="Heading2"><w:name w:val="heading 2"/><w:basedOn w:val="Normal"/><w:next w:val="Normal"/><w:pPr><w:keepNext/><w:spacing w:before="260" w:after="120"/><w:outlineLvl w:val="1"/></w:pPr><w:rPr><w:rFonts w:ascii="Georgia" w:hAnsi="Georgia"/><w:b/><w:color w:val="6F2941"/><w:sz w:val="28"/></w:rPr></w:style>
<w:style w:type="paragraph" w:styleId="Heading3"><w:name w:val="heading 3"/><w:basedOn w:val="Normal"/><w:next w:val="Normal"/><w:pPr><w:keepNext/><w:spacing w:before="220" w:after="100"/><w:outlineLvl w:val="2"/></w:pPr><w:rPr><w:b/><w:color w:val="8B596A"/><w:sz w:val="24"/></w:rPr></w:style>
<w:style w:type="paragraph" w:styleId="ListParagraph"><w:name w:val="List Paragraph"/><w:basedOn w:val="Normal"/><w:pPr><w:ind w:left="420" w:hanging="220"/></w:pPr></w:style>
<w:style w:type="paragraph" w:styleId="Quote"><w:name w:val="Quote"/><w:basedOn w:val="Normal"/><w:pPr><w:ind w:left="420" w:right="260"/><w:spacing w:before="160" w:after="160"/></w:pPr><w:rPr><w:i/><w:color w:val="6F2941"/></w:rPr></w:style>
</w:styles>
'@

$contentTypes = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/><Override PartName="/word/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml"/></Types>'
$rootRels = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/></Relationships>'
$docRels = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/></Relationships>'

$parts = @{
  '[Content_Types].xml' = $contentTypes
  '_rels/.rels' = $rootRels
  'word/document.xml' = $document
  'word/styles.xml' = $styles
  'word/_rels/document.xml.rels' = $docRels
}

$fullOutput = [IO.Path]::GetFullPath($OutputPath)
[IO.Directory]::CreateDirectory([IO.Path]::GetDirectoryName($fullOutput)) | Out-Null
$temp = "$fullOutput.tmp"
if (Test-Path $temp) { Remove-Item -LiteralPath $temp }
$stream = [IO.File]::Open($temp, [IO.FileMode]::CreateNew)
$zip = [IO.Compression.ZipArchive]::new($stream, [IO.Compression.ZipArchiveMode]::Create)
try {
  foreach ($name in $parts.Keys) {
    $entry = $zip.CreateEntry($name, [IO.Compression.CompressionLevel]::Optimal)
    $writer = [IO.StreamWriter]::new($entry.Open(), $utf8)
    try { $writer.Write($parts[$name]) } finally { $writer.Dispose() }
  }
} finally { $zip.Dispose(); $stream.Dispose() }
Move-Item -LiteralPath $temp -Destination $fullOutput -Force
Write-Output "Documento criado: $fullOutput"
