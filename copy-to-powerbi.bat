@echo off
REM Copy FG-Grid Power BI compatible files to Power BI Visual project
REM Run this from the fg-grid directory

set "SOURCE_DIR=%cd%"
set "TARGET_DIR=..\PowerBI-visual-power-matrix"

echo Copying FG-Grid Power BI compatible files...

REM Create target directories if they don't exist
if not exist "%TARGET_DIR%\src\libs" mkdir "%TARGET_DIR%\src\libs"
if not exist "%TARGET_DIR%\style" mkdir "%TARGET_DIR%\style"
if not exist "%TARGET_DIR%\types" mkdir "%TARGET_DIR%\types"
if not exist "%TARGET_DIR%\examples" mkdir "%TARGET_DIR%\examples"

REM Copy JavaScript files
echo Copying JavaScript files...
copy "%SOURCE_DIR%\dist\fg-grid.powerbi.js" "%TARGET_DIR%\src\libs\"
copy "%SOURCE_DIR%\dist\fg-grid.powerbi.min.js" "%TARGET_DIR%\src\libs\"

REM Copy CSS file
echo Copying CSS file...
copy "%SOURCE_DIR%\styles\fg-grid.css" "%TARGET_DIR%\style\"

REM Copy TypeScript definitions
echo Copying TypeScript definitions...
copy "%SOURCE_DIR%\types\fg-grid.d.ts" "%TARGET_DIR%\types\"

REM Copy integration guide
echo Copying integration guides...
copy "%SOURCE_DIR%\POWER_BI_INTEGRATION_STEPS.md" "%TARGET_DIR%\"
copy "%SOURCE_DIR%\GROUPING_BAR_GUIDE.md" "%TARGET_DIR%\"
copy "%SOURCE_DIR%\examples\powerbi-matrix-with-grouping.ts" "%TARGET_DIR%\examples\"

echo.
echo Files copied successfully!
echo.
echo Next steps:
echo 1. Review the POWER_BI_INTEGRATION_STEPS.md file in your Power BI project
echo 2. Update your visual.ts file with the provided code examples
echo 3. Add the script reference to your pbiviz.json or import it in TypeScript
echo 4. Build and test your Power BI visual
echo.
pause
