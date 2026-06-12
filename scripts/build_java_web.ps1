param(
    [switch]$TaskOnly,
    [switch]$PriorityOnly
)

$ErrorActionPreference = "Stop"

$repoRoot = Split-Path -Parent $PSScriptRoot
$taskModulePath = Join-Path $repoRoot "modules\task_manager"
$priorityModulePath = Join-Path $repoRoot "modules\priority_calculator"

function Invoke-MavenPackage {
    param([string]$ModulePath)

    Push-Location $ModulePath
    try {
        mvn -DskipTests package
    }
    finally {
        Pop-Location
    }
}

if (-not (Get-Command mvn -ErrorAction SilentlyContinue)) {
    throw "Maven is not installed or is not available in PATH."
}

$buildTask = $true
$buildPriority = $true

if ($TaskOnly) {
    $buildPriority = $false
}

if ($PriorityOnly) {
    $buildTask = $false
}

if ($buildTask) {
    Invoke-MavenPackage -ModulePath $taskModulePath
}

if ($buildPriority) {
    Invoke-MavenPackage -ModulePath $priorityModulePath
}

Write-Host "Java web build finished. Check assets/generated for the bridge JS files." -ForegroundColor Green
