#!/usr/bin/env pwsh
# PowerShell script to build and deploy FG-Grid to Power BI visual

param(
    [string]$PowerBIPath = "../PowerBI-visual-power-matrix"
)

Write-Host "Building FG-Grid for Power BI..." -ForegroundColor Green

# Build the Power BI compatible version
npm run build:powerbi

if ($LASTEXITCODE -ne 0) {
    Write-Host "Build failed!" -ForegroundColor Red
    exit 1
}

Write-Host "Build completed successfully!" -ForegroundColor Green

# Check if Power BI visual directory exists
if (-not (Test-Path $PowerBIPath)) {
    Write-Host "Power BI visual directory not found: $PowerBIPath" -ForegroundColor Yellow
    Write-Host "Please ensure the PowerBi-visuals-Power-Matrix repository is cloned adjacent to this directory" -ForegroundColor Yellow
    exit 1
}

Write-Host "Copying files to Power BI visual repository..." -ForegroundColor Green

# Create directories if they don't exist
$libDir = Join-Path $PowerBIPath "lib"
$styleDir = Join-Path $PowerBIPath "style" 
$typesDir = Join-Path $PowerBIPath "types"

if (-not (Test-Path $libDir)) { New-Item -ItemType Directory -Path $libDir -Force }
if (-not (Test-Path $styleDir)) { New-Item -ItemType Directory -Path $styleDir -Force }
if (-not (Test-Path $typesDir)) { New-Item -ItemType Directory -Path $typesDir -Force }

# Copy files
Copy-Item "dist/fg-grid.powerbi.js" "$libDir/fg-grid.powerbi.js" -Force
Copy-Item "dist/fg-grid.powerbi.min.js" "$libDir/fg-grid.powerbi.min.js" -Force
Copy-Item "dist/fg-grid.css" "$styleDir/fg-grid.css" -Force
Copy-Item "dist/fg-grid.d.ts" "$typesDir/fg-grid.d.ts" -Force

Write-Host "Files copied successfully!" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "1. Update your pbiviz.json to include 'lib/fg-grid.powerbi.min.js' in externalJS" -ForegroundColor White
Write-Host "2. Import the CSS in your visual.less file: @import (less) '../lib/fg-grid.css';" -ForegroundColor White
Write-Host "3. Update tsconfig.json to include 'fg-grid' in types array" -ForegroundColor White
Write-Host "4. Use the integration example in examples/powerbi-matrix-integration.ts" -ForegroundColor White
Write-Host "5. Run 'pbiviz package' in your Power BI visual directory" -ForegroundColor White
