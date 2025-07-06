@echo off
setlocal enabledelayedexpansion

for %%f in (*) do (
    set "filename=%%f"
    set "newname=!filename!"
    for /f "delims= " %%a in ("!newname!") do (
        set "newname=%%a----"
        set "rest=%%b"
        if "!rest!"=="" goto :continue
        set "newname=!newname! !rest!"
    )
    :continue
    ren "%%f" "!newname!"
)

echo Done.
pause