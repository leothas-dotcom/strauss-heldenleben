<#
.SYNOPSIS
  Lataa referenssiäänitteen analyysiä varten (ei julkaisuun) ja tekee siitä 48 kHz:n mono-FLACin.

.DESCRIPTION
  Julkaisu 2.0, docs/julkaisu2.md luku 1.3: referenssi linjataan Kraussin aikaan (analysis/linjaus.py)
  ja sen soitinhavainnot siirretään linjauksen kautta. Referenssin ajat eivät päädy videoon, oppaaseen
  eivätkä teemakarttaan. Tiedostot menevät kansioon audio\ref\ (gitignoressa):
    ref_<Tunniste>.<ext>        yt-dlp:n paras äänivirta sellaisenaan
    ref_<Tunniste>.info.json    yt-dlp:n metatiedot
    ref_<Tunniste>.meta.json    yt-dlp --print-json -tuloste
    ref_<Tunniste>.flac         48 kHz mono FLAC analyysiin (linjaus.py, prepare.py)
  Loki: build\ref_lataus_<Tunniste>.log

  yt-dlp asennetaan vain setup.ps1:n kautta (.\setup.ps1 -WithYtDlp); tämä skripti ei asenna mitään.
  ffmpeg: PATHista tai $env:FFMPEG.

.EXAMPLE
  .\analysis\ref_lataus.ps1 -Url https://www.youtube.com/watch?v=Us1jfC7bMpA -Tunniste Us1jfC7bMpA
#>
param(
    [Parameter(Mandatory)] [string]$Url,
    [Parameter(Mandatory)] [string]$Tunniste,
    [string]$Out
)

$ErrorActionPreference = 'Continue'
$root = Split-Path -Parent $PSScriptRoot
Set-Location $root
if (-not $Out) { $Out = Join-Path $root 'audio\ref' }
New-Item -ItemType Directory -Force -Path $Out | Out-Null
New-Item -ItemType Directory -Force -Path (Join-Path $root 'build') | Out-Null
$log = Join-Path $root "build\ref_lataus_$Tunniste.log"
Start-Transcript -Path $log -Force | Out-Null

try {
    Write-Host "== 1/3 yt-dlp =="
    # Uusi winget-asennus ei näy vanhassa shellissä (CLAUDE.md): päivitä PATH rekisteristä.
    $env:Path = [Environment]::GetEnvironmentVariable('Path', 'Machine') + ';' + [Environment]::GetEnvironmentVariable('Path', 'User')
    if (-not (Get-Command yt-dlp -ErrorAction SilentlyContinue)) {
        Write-Host "VIRHE: yt-dlp puuttuu. Asenna setup.ps1:n kautta: .\setup.ps1 -WithYtDlp"
        exit 1
    }
    & yt-dlp --version

    Write-Host "== 2/3 lataus =="
    $meta = Join-Path $Out "ref_$Tunniste.meta.json"
    & yt-dlp -f bestaudio --no-playlist --write-info-json --print-json `
        -o "$Out\ref_%(id)s.%(ext)s" $Url | Out-File -FilePath $meta -Encoding utf8
    if ($LASTEXITCODE -ne 0) { Write-Host "VIRHE: yt-dlp palautti koodin $LASTEXITCODE"; exit 1 }
    # yt-dlp nimeää tiedoston videon id:llä; jos tunniste on muu, nimetään uudelleen.
    try {
        $m = Get-Content $meta -Raw | ConvertFrom-Json
        if ($m.id -and $m.id -ne $Tunniste) {
            Get-ChildItem $Out -Filter "ref_$($m.id).*" | ForEach-Object {
                Move-Item $_.FullName (Join-Path $Out ($_.Name -replace [regex]::Escape("ref_$($m.id)"), "ref_$Tunniste")) -Force
            }
        }
        Write-Host ("TITLE: {0}`nUPLOADER: {1}`nDURATION: {2} s`nABR: {3} kbit/s`nACODEC: {4}" -f $m.title, $m.uploader, $m.duration, $m.abr, $m.acodec)
    } catch { Write-Host "metadata: $_" }
    Get-ChildItem $Out -Filter "ref_$Tunniste.*" | Format-Table Name, Length, LastWriteTime

    Write-Host "== 3/3 FLAC 48 kHz mono analyysiä varten =="
    $src = Get-ChildItem $Out -Filter "ref_$Tunniste.*" |
           Where-Object { $_.Extension -in '.webm', '.m4a', '.opus', '.mp4', '.ogg' } | Select-Object -First 1
    if (-not $src) { Write-Host "VIRHE: ladattua äänitiedostoa ei löydy"; exit 1 }
    $ff = if ($env:FFMPEG) { $env:FFMPEG } else { 'ffmpeg' }
    $flac = Join-Path $Out "ref_$Tunniste.flac"
    & $ff -y -hide_banner -loglevel error -i $src.FullName -ac 1 -ar 48000 -c:a flac $flac
    if ($LASTEXITCODE -ne 0) { Write-Host "VIRHE: ffmpeg palautti koodin $LASTEXITCODE"; exit 1 }
    & $ff -hide_banner -i $flac 2>&1 | Select-String 'Duration|Stream'
    Write-Host "== VALMIS: $flac =="
} finally {
    Stop-Transcript | Out-Null
}
