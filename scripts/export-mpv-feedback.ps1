param(
  [string]$ApiBaseUrl = 'http://127.0.0.1:8787',
  [string]$OutputDirectory = (Join-Path $PSScriptRoot '../server/exports'),
  [string]$Token = $env:MPV_EXPORT_TOKEN
)

$ErrorActionPreference = 'Stop'

if ([string]::IsNullOrWhiteSpace($Token) -or $Token.Length -lt 32) {
  throw 'Defina MPV_EXPORT_TOKEN com pelo menos 32 caracteres antes de exportar.'
}

$resolvedOutputDirectory = [IO.Path]::GetFullPath($OutputDirectory)
New-Item -ItemType Directory -Path $resolvedOutputDirectory -Force | Out-Null
$timestamp = Get-Date -Format 'yyyyMMdd-HHmmss'
$outputPath = Join-Path $resolvedOutputDirectory "feedback-mpv-$timestamp.csv"

Invoke-WebRequest `
  -Uri "$($ApiBaseUrl.TrimEnd('/'))/api/mpv/feedback/export" `
  -Headers @{ Authorization = "Bearer $Token" } `
  -OutFile $outputPath `
  -UseBasicParsing

Write-Output "Feedback exportado para: $outputPath"
