# scripts/graphify-semantic.ps1
#
# Run a graphify semantic pass on the whole project using OpenRouter (qwen-2.5-72b).
# All output goes to docs/graphify-out/ via GRAPHIFY_OUT env var.
# Requires OPENROUTER_API_KEY in .env.local (gitignored).
#
# Usage:
#   .\scripts\graphify-semantic.ps1                # whole project (default)
#   .\scripts\graphify-semantic.ps1 -Target ./docs # single sub-folder (faster)
#   .\scripts\graphify-semantic.ps1 -Force         # overwrite existing graph

[CmdletBinding()]
param(
    [string]$Target = ".",
    [switch]$Force
)

$ErrorActionPreference = "Stop"

# --- Verify OpenRouter API key ------------------------------------------------
if (-not $env:OPENROUTER_API_KEY) {
    # Try loading from .env.local
    $envFile = Join-Path (Get-Location) ".env.local"
    if (Test-Path -LiteralPath $envFile) {
        $line = Get-Content $envFile | Select-String "OPENROUTER_API_KEY"
        if ($line) {
            $env:OPENROUTER_API_KEY = ($line -split "=", 2)[1].Trim()
        }
    }
}
if (-not $env:OPENROUTER_API_KEY) {
    Write-Error "OPENROUTER_API_KEY not found. Add it to .env.local or set it as env var."
    exit 1
}

# --- Set environment ----------------------------------------------------------
# GRAPHIFY_OUT tells graphify where to write all output.
$env:GRAPHIFY_OUT = "docs/graphify-out"

# --- Run graphify extract -----------------------------------------------------
$backend = "openrouter"
$model = "qwen/qwen-2.5-72b-instruct"
$graphifyArgs = @("extract", $Target, "--backend", $backend, "--model", $model)
if ($Force) { $graphifyArgs += "--force" }

Write-Host "Running semantic pass on $Target via OpenRouter ($model)"
python -m graphify @graphifyArgs
$extractExit = $LASTEXITCODE

# --- Cleanup: remove any stray graphify-out/ dirs outside docs/ ---------------
Get-ChildItem -LiteralPath (Get-Location) -Recurse -Directory -Force -ErrorAction SilentlyContinue |
    Where-Object { $_.Name -eq "graphify-out" -and $_.FullName -ne (Join-Path (Get-Location) "docs\graphify-out") } |
    ForEach-Object {
        $strayGraph = Join-Path $_.FullName "graph.json"
        $mainGraph = Join-Path (Get-Location) "docs\graphify-out\graph.json"
        if ((Test-Path -LiteralPath $strayGraph) -and (Test-Path -LiteralPath $mainGraph)) {
            Write-Host "Merging stray $($_.FullName) into docs/graphify-out/ ..."
            $env:GRAPHIFY_OUT = "docs/graphify-out"
            python -m graphify merge-graphs $mainGraph $strayGraph --out $mainGraph 2>$null
        }
        Write-Host "Removing stray $($_.FullName) ..."
        Remove-Item -LiteralPath $_.FullName -Recurse -Force
    }

# --- Re-cluster and regenerate report if extraction succeeded -----------------
if ($extractExit -eq 0) {
    Write-Host "Re-clustering graph ..."
    $env:GRAPHIFY_OUT = "docs/graphify-out"
    python -m graphify cluster-only . --graph "docs/graphify-out/graph.json" --backend $backend 2>$null
}

# --- Wipe env vars ------------------------------------------------------------
Remove-Item Env:GRAPHIFY_OUT -ErrorAction SilentlyContinue
Remove-Item Env:OPENROUTER_API_KEY -ErrorAction SilentlyContinue

Write-Host "Done. All output lives in docs/graphify-out/."
