# Copy FG-Grid Power BI compatible files to Power BI Visual project
# Run this from the fg-grid directory

$sourceDir = Get-Location
$targetDir = Join-Path $sourceDir "..\PowerBi-visuals-Power-Matrix"

Write-Host "Copying FG-Grid Power BI compatible files..." -ForegroundColor Green

# Create target directories if they don't exist
$libsDir = Join-Path $targetDir "src\libs"
$styleDir = Join-Path $targetDir "style" 
$typesDir = Join-Path $targetDir "types"

if (!(Test-Path $libsDir)) { New-Item -ItemType Directory -Path $libsDir -Force }
if (!(Test-Path $styleDir)) { New-Item -ItemType Directory -Path $styleDir -Force }
if (!(Test-Path $typesDir)) { New-Item -ItemType Directory -Path $typesDir -Force }

# Copy JavaScript files
Write-Host "Copying JavaScript files..." -ForegroundColor Yellow
Copy-Item "$sourceDir\dist\fg-grid.powerbi.js" $libsDir -Force
Copy-Item "$sourceDir\dist\fg-grid.powerbi.min.js" $libsDir -Force

# Copy CSS file
Write-Host "Copying CSS file..." -ForegroundColor Yellow
Copy-Item "$sourceDir\styles\fg-grid.css" $styleDir -Force

# Copy TypeScript definitions
Write-Host "Copying TypeScript definitions..." -ForegroundColor Yellow
Copy-Item "$sourceDir\types\fg-grid.d.ts" $typesDir -Force

# Copy integration guide
Write-Host "Copying integration guide..." -ForegroundColor Yellow
Copy-Item "$sourceDir\POWER_BI_INTEGRATION_STEPS.md" $targetDir -Force

Write-Host "`nFiles copied successfully!" -ForegroundColor Green
Write-Host "`nNext steps:" -ForegroundColor Cyan
Write-Host "1. Review the POWER_BI_INTEGRATION_STEPS.md file in your Power BI project"
Write-Host "2. Update your visual.ts file with the provided code examples"
Write-Host "3. Add the script reference to your pbiviz.json or import it in TypeScript"
Write-Host "4. Build and test your Power BI visual"
Write-Host "`nPress any key to continue..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
