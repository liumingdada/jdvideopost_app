@echo off
setlocal enabledelayedexpansion

for %%f in (*.mp4) do (
    set "filename=%%f"
    ren "!filename!" "!filename:.mp4=.mp5!"
)