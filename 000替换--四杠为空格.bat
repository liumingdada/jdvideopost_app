@echo off
setlocal enabledelayedexpansion

for %%f in (*) do (
    set "filename=%%f"
    set "newname=!filename:----= !"
    ren "%%f" "!newname!"
)

echo Done.
pause