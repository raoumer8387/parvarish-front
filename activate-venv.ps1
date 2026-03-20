param(
    [string]$VenvPath = ""
)

$basePath = Get-Location

if ([string]::IsNullOrWhiteSpace($VenvPath)) {
    if (Test-Path (Join-Path $basePath ".venv\Scripts\Activate.ps1")) {
        $VenvPath = ".venv"
    }
    elseif (Test-Path (Join-Path $basePath "venv\Scripts\Activate.ps1")) {
        $VenvPath = "venv"
    }
    else {
        Write-Error "No virtual environment found. Expected '.venv' or 'venv' in: $basePath"
        Write-Host "Create one with: py -m venv .venv" -ForegroundColor Yellow
        return
    }
}

$activateScript = Join-Path $basePath (Join-Path $VenvPath "Scripts\Activate.ps1")

if (Test-Path $activateScript) {
    . $activateScript
    Write-Host "Activated virtual environment: $VenvPath" -ForegroundColor Green
}
else {
    Write-Error "Activation script not found at: $activateScript"
    Write-Host "If your env exists, verify path and run: . .\activate-venv.ps1 -VenvPath 'venv'" -ForegroundColor Yellow
}
