@echo off
setlocal enabledelayedexpansion

for %%f in (*.mp5) do (
    set "filename=%%f"
    ren "!filename!" "!filename:.mp5=.mp4!"
)