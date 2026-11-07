@echo off
rem Kierros 3: koko A-puolen renderi v3 (final3_chain.sh). Kaynnistetty Clauden pyynnosta 31.10.2026.
cd /d F:\code\heldenleben-video
set "B=%ProgramFiles%\Git\bin\bash.exe"
if not exist "%B%" set "B=bash"
echo Renderi v3 kaynnissa, loki: runs\muste-1230\final3_chain.log
"%B%" runs/muste-1230/final3_chain.sh
echo Valmis.
pause
