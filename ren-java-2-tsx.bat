@echo off
setlocal enabledelayedexpansion

REM Change to the root directory where you want to start renaming
cd /d "%~dp0"

REM Recursively find all .java files and rename them to .tsx
for /r %%f in (*.java) do (
    set "filename=%%~nf"
    set "folder=%%~dpf"
    ren "%%f" "!filename!.tsx"
)

echo All .java files have been renamed to .tsx.
pause
