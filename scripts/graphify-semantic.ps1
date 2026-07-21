[CmdletBinding()]
param(
    [string]$Target = ".",
    [switch]$Force
)

$ErrorActionPreference = "Stop"
$root = (Resolve-Path -LiteralPath $Target).Path
$wrapper = "D:\Invoke-CorrenthGraphify.ps1"
$canonical = Join-Path $root "docs\graphify-out"
$generated = Join-Path $root "graphify-out"

if (-not $Force -and (Test-Path -LiteralPath (Join-Path $canonical "graph.json"))) {
    throw "Graphify output already exists. Use -Force to rebuild it."
}

powershell -ExecutionPolicy Bypass -File $wrapper -Path $root -Mode semantic
if ($LASTEXITCODE -ne 0) {
    if (Test-Path -LiteralPath $generated) {
        $quarantine = Join-Path $root (".graphify-quarantine\semantic-failed-" + (Get-Date -Format "yyyyMMdd-HHmmss"))
        New-Item -ItemType Directory -Path (Split-Path -Parent $quarantine) -Force | Out-Null
        Move-Item -LiteralPath $generated -Destination $quarantine
        Write-Warning "Partial Graphify output quarantined at $quarantine"
    }
    exit $LASTEXITCODE
}

if ($generated -ne $canonical) {
    if (Test-Path -LiteralPath $canonical) {
        Remove-Item -LiteralPath $canonical -Recurse -Force
    }
    Move-Item -LiteralPath $generated -Destination $canonical
}

Write-Host "Done. Canonical output: $canonical"
