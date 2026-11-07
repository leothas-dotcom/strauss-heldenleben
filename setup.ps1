<#
.SYNOPSIS
  Asentaa ja tarkistaa Heldenleben-videoprojektin ympäristön.

.EXAMPLE
  .\setup.ps1                 # asentaa puuttuvat + tarkistaa
  .\setup.ps1 -CheckOnly      # pelkkä tarkistus, ei asennuksia
  .\setup.ps1 -WithAudacity   # asentaa myös Audacityn (äänitteen merkintään)

  Näytönohjainanalyysi (PyTorch CUDA, ~3 Gt) asennetaan aina; mallipainot ladataan
  ensimmäisellä analyysiajolla.
#>
param(
    [switch]$CheckOnly,
    [switch]$WithAudacity
)

$ErrorActionPreference = 'Continue'
$Root          = $PSScriptRoot
$PythonVersion = '3.12'
$Venv          = Join-Path $Root '.venv'
$VenvPython    = Join-Path $Venv 'Scripts\python.exe'
$MinFreeGB     = 50

# Tila: OK | PUUTTUU (kaataa tarkistuksen) | VAROITUS | VALINNAINEN
$results = New-Object System.Collections.Generic.List[object]

function Report($name, $status, $detail) {
    $results.Add([pscustomobject]@{ Tarkistus = $name; Tila = $status; Tiedot = $detail })
}

function Step($text) { Write-Host "`n== $text" -ForegroundColor Cyan }

function Update-SessionPath {
    $env:Path = [Environment]::GetEnvironmentVariable('Path', 'Machine') + ';' +
                [Environment]::GetEnvironmentVariable('Path', 'User')
}

function Install-WingetPackage($id) {
    if ($CheckOnly) { return }
    if (-not (Get-Command winget -ErrorAction SilentlyContinue)) {
        Write-Warning "winget puuttuu, asenna $id käsin."
        return
    }
    Write-Host "Asennetaan $id ..."
    winget install --id $id --exact --silent --accept-package-agreements --accept-source-agreements
    if ($LASTEXITCODE -ne 0) { Write-Warning "winget palautti koodin $LASTEXITCODE ($id)" }
    Update-SessionPath
}

# Palauttaa oikean Python-tulkin polun py-käynnistimen kautta (ohittaa WindowsApps-pikakuvakkeen).
function Get-PythonExe {
    if (-not (Get-Command py -ErrorAction SilentlyContinue)) { return $null }
    $exe = & py "-$PythonVersion" -c "import sys; print(sys.executable)" 2>$null
    if ($LASTEXITCODE -eq 0 -and $exe) { return $exe.Trim() }
    return $null
}

function Get-AudacityExe {
    foreach ($base in $env:ProgramFiles, ${env:ProgramFiles(x86)}) {
        if (-not $base) { continue }
        $p = Join-Path $base 'Audacity\Audacity.exe'
        if (Test-Path $p) { return $p }
    }
    return $null
}

# --- 1. ffmpeg ---------------------------------------------------------------
Step 'ffmpeg'
if (-not (Get-Command ffmpeg -ErrorAction SilentlyContinue)) { Install-WingetPackage 'Gyan.FFmpeg' }
if (Get-Command ffmpeg -ErrorAction SilentlyContinue) {
    $v = (& ffmpeg -version | Select-Object -First 1)
    Report 'ffmpeg' 'OK' $v
    $hasX264 = (& ffmpeg -hide_banner -encoders 2>$null | Select-String -SimpleMatch 'libx264' -Quiet)
    if ($hasX264) { Report 'ffmpeg libx264 (H.264)' 'OK' 'enkooderi löytyy' }
    else          { Report 'ffmpeg libx264 (H.264)' 'PUUTTUU' 'asenna ffmpeg-build jossa libx264 (Gyan.FFmpeg)' }
} else {
    Report 'ffmpeg' 'PUUTTUU' 'winget install Gyan.FFmpeg'
}

# --- 2. Python ---------------------------------------------------------------
Step "Python $PythonVersion"
$py = Get-PythonExe
if (-not $py) { Install-WingetPackage "Python.Python.$PythonVersion"; $py = Get-PythonExe }
if ($py) { Report "Python $PythonVersion" 'OK' $py }
else     { Report "Python $PythonVersion" 'PUUTTUU' "winget install Python.Python.$PythonVersion" }

# --- 3. Node.js --------------------------------------------------------------
Step 'Node.js'
if (-not (Get-Command node -ErrorAction SilentlyContinue)) { Install-WingetPackage 'OpenJS.NodeJS.LTS' }
if (Get-Command node -ErrorAction SilentlyContinue) {
    $nv = (& node --version).Trim()
    $major = [int]($nv.TrimStart('v').Split('.')[0])
    Report 'Node.js 18+' $(if ($major -ge 18) { 'OK' } else { 'PUUTTUU' }) $nv
} else {
    Report 'Node.js 18+' 'PUUTTUU' 'winget install OpenJS.NodeJS.LTS'
}

# --- 4. Python-ympäristö: pyproject.toml + uv.lock ------------------------------
# Riippuvuudet asennetaan vain lukituksesta (uv sync --locked); käsin asennettuja paketteja ei ole.
Step 'Python-ympäristö (uv, lukitus)'
if (-not (Get-Command uv -ErrorAction SilentlyContinue)) { Install-WingetPackage 'astral-sh.uv' }
Push-Location $Root
try {
    if (Get-Command uv -ErrorAction SilentlyContinue) {
        & uv lock --check *> $null
        if ($LASTEXITCODE -eq 0) { Report 'Lukitus (uv.lock)' 'OK' 'vastaa pyproject.tomlia' }
        else                     { Report 'Lukitus (uv.lock)' 'PUUTTUU' 'uv.lock ei vastaa pyproject.tomlia: aja uv lock' }
        if (-not $CheckOnly) {
            Write-Host 'uv sync --locked (ensimmäisellä kerralla PyTorch CUDA ~3 Gt) ...'
            & uv sync --locked --python $PythonVersion
        }
        & uv sync --locked --check *> $null
        if ($LASTEXITCODE -eq 0) { Report 'Python-ympäristö (.venv)' 'OK' 'täsmälleen lukituksen mukainen' }
        else                     { Report 'Python-ympäristö (.venv)' 'PUUTTUU' 'poikkeaa lukituksesta: aja .\setup.ps1' }
    } else {
        Report 'uv' 'PUUTTUU' 'winget install astral-sh.uv'
    }
} finally {
    Pop-Location
}
if (Test-Path $VenvPython) {
    $libs = & $VenvPython -c "import librosa, numpy, scipy, soundfile, matplotlib; print('librosa ' + librosa.__version__ + ', numpy ' + numpy.__version__ + ', scipy ' + scipy.__version__ + ', matplotlib ' + matplotlib.__version__)" 2>$null
    if ($LASTEXITCODE -eq 0) { Report 'Analyysikirjastot' 'OK' $libs }
    else                     { Report 'Analyysikirjastot' 'PUUTTUU' 'aja .\setup.ps1' }

    $gpu = & $VenvPython -c "import torch; ok = torch.cuda.is_available(); print(('torch ' + torch.__version__ + ', ' + torch.cuda.get_device_name(0) + ', ' + str(round(torch.cuda.get_device_properties(0).total_memory / 2**30, 1)) + ' Gt') if ok else 'CUDA ei käytettävissä')" 2>$null
    if ($LASTEXITCODE -eq 0 -and $gpu -notmatch 'ei käytettävissä') { Report 'PyTorch + CUDA' 'OK' $gpu }
    else { Report 'PyTorch + CUDA' 'PUUTTUU' $(if ($gpu) { $gpu } else { 'aja .\setup.ps1' }) }

    # panns_inference yrittää ladata tiedostoja jo importissa, joten se tarkistetaan vain löytymällä.
    $models = & $VenvPython -c "import importlib.util as u; m = ['panns_inference', 'transformers', 'beat_this', 'demucs', 'torchcrepe']; miss = [x for x in m if u.find_spec(x) is None]; print('puuttuu: ' + ', '.join(miss) if miss else 'PANNs, CLAP, beat_this, Demucs, CREPE')" 2>$null
    if ($LASTEXITCODE -eq 0 -and $models -notmatch 'puuttuu') { Report 'GPU-analyysin kirjastot' 'OK' $models }
    else { Report 'GPU-analyysin kirjastot' 'PUUTTUU' $(if ($models) { $models } else { 'aja .\setup.ps1' }) }

    # Mallipainot manifestin (analysis/models.json) mukaan, SHA-256 tarkistettuna.
    $fetch = Join-Path $Root 'analysis\fetch_models.py'
    if (-not $CheckOnly) { & $VenvPython -I $fetch }
    $out = & $VenvPython -I $fetch --check 2>&1
    if ($LASTEXITCODE -eq 0) { Report 'Mallipainot (models/)' 'OK' "$(@($out | Where-Object { $_ -like 'OK*' }).Count) tiedostoa, tarkistussummat täsmäävät" }
    else { Report 'Mallipainot (models/)' 'PUUTTUU' (($out | Where-Object { $_ -notlike 'OK*' }) -join '; ') }
} else {
    Report 'Analyysikirjastot' 'PUUTTUU' '.venv puuttuu, aja .\setup.ps1'
}

# --- 5. Node-paketit + WebGL -------------------------------------------------
Step 'Node-paketit (three, puppeteer) ja WebGL'
Push-Location $Root
try {
    # npm ci asentaa täsmälleen package-lock.jsonin mukaan.
    if (-not $CheckOnly -and (Get-Command npm -ErrorAction SilentlyContinue)) {
        npm ci --no-fund --no-audit
    }
    if (Get-Command node -ErrorAction SilentlyContinue) {
        $missing = @()
        $found = @()
        # Luetaan package.json suoraan: osa paketeista (three, vite) ei salli require('x/package.json').
        foreach ($pkg in 'three', 'puppeteer') {
            $pj = Join-Path $Root "node_modules\$pkg\package.json"
            if (Test-Path $pj) { $found += "$pkg " + (Get-Content $pj -Raw | ConvertFrom-Json).version }
            else               { $missing += $pkg }
        }
        if ($missing.Count -eq 0) { Report 'Node-paketit' 'OK' ($found -join ', ') }
        else                      { Report 'Node-paketit' 'PUUTTUU' ("puuttuu: " + ($missing -join ', ') + ' (aja .\setup.ps1)') }

        $audit = (npm audit --json 2>$null | Out-String | ConvertFrom-Json).metadata.vulnerabilities
        if ($audit) {
            $serious = $audit.high + $audit.critical
            $summary = "kriittisiä $($audit.critical), korkeita $($audit.high), kohtalaisia $($audit.moderate), matalia $($audit.low)"
            if ($serious -gt 0)         { Report 'npm audit' 'VAROITUS' "$summary (npm audit)" }
            elseif ($audit.total -gt 0) { Report 'npm audit' 'VAROITUS' $summary }
            else                        { Report 'npm audit' 'OK' 'ei tunnettuja haavoittuvuuksia' }
        }

        if ($missing -notcontains 'puppeteer') {
            $gpu = & node (Join-Path $Root 'render\check-webgl.mjs') 2>$null
            if ($LASTEXITCODE -ne 0 -or -not $gpu) {
                Report 'WebGL2 headless-selaimessa' 'PUUTTUU' 'npm run check-webgl näyttää virheen'
            } elseif ($gpu -match 'SwiftShader') {
                Report 'WebGL2 headless-selaimessa' 'VAROITUS' "$gpu (ohjelmistorenderöinti, hidas)"
            } else {
                Report 'WebGL2 headless-selaimessa' 'OK' $gpu
            }
        }
    } else {
        Report 'Node-paketit' 'PUUTTUU' 'Node puuttuu'
    }
} finally {
    Pop-Location
}

# --- 6. Audacity (merkinnät) --------------------------------------------------
Step 'Audacity'
if ($WithAudacity -and -not (Get-AudacityExe)) { Install-WingetPackage 'Audacity.Audacity' }
$aud = Get-AudacityExe
if ($aud) { Report 'Audacity (merkinnät)' 'OK' $aud }
else      { Report 'Audacity (merkinnät)' 'VALINNAINEN' '.\setup.ps1 -WithAudacity (tai muu ohjelma, joka vie label-tiedoston)' }

# --- 7. Kansiot, äänite, merkinnät, levytila ------------------------------------
Step 'Kansiot, äänite, merkinnät ja levytila'
foreach ($d in 'audio', 'annotations', 'build', 'output') {
    $p = Join-Path $Root $d
    if (-not (Test-Path $p)) { New-Item -ItemType Directory $p | Out-Null }
}

$audioDir = Join-Path $Root 'audio'
$audio = Get-ChildItem $audioDir -File -Recurse -ErrorAction SilentlyContinue |
         Where-Object { $_.Extension -in '.wav', '.flac', '.mp3', '.m4a', '.aiff', '.aif' }
if ($audio) { Report 'Äänite audio/-kansiossa' 'OK' (($audio | ForEach-Object { $_.FullName.Substring($audioDir.Length + 1) }) -join ', ') }
else        { Report 'Äänite audio/-kansiossa' 'PUUTTUU' 'kopioi äänite kansioon audio/ (WAV tai FLAC)' }

$cues = Join-Path $Root 'annotations\cues.json'
if ((Test-Path $cues) -and (Test-Path $VenvPython)) {
    $out = & $VenvPython -I (Join-Path $Root 'analysis\check_package.py') --cues-only 2>&1
    if ($LASTEXITCODE -eq 0) { Report 'Merkinnät (cues.json)' 'OK' 'rakenne kelpaa (check_package.py)' }
    else { Report 'Merkinnät (cues.json)' 'PUUTTUU' (($out | Where-Object { $_ -like 'VIRHE*' }) -join '; ') }
} else {
    Report 'Merkinnät (cues.json)' 'VALINNAINEN' 'luo analyysin jälkeen: python -I analysis\make_cues.py build\<ajo>'
}

$drive = Get-PSDrive -Name ((Resolve-Path $Root).Drive.Name)
$freeGB = [math]::Round($drive.Free / 1GB)
if ($freeGB -ge $MinFreeGB) { Report 'Vapaa levytila' 'OK' "$freeGB Gt" }
else                        { Report 'Vapaa levytila' 'VAROITUS' "$freeGB Gt (suositus $MinFreeGB+ Gt välitiedostoille)" }

# --- Yhteenveto ---------------------------------------------------------------
Step 'Yhteenveto'
$results | Format-Table -AutoSize -Wrap | Out-String | Write-Host

$failed = @($results | Where-Object { $_.Tila -eq 'PUUTTUU' })
if ($failed.Count -eq 0) {
    Write-Host 'Kaikki pakolliset kunnossa.' -ForegroundColor Green
    exit 0
} else {
    Write-Host "$($failed.Count) pakollista tarkistusta ei mennyt läpi." -ForegroundColor Yellow
    if ($CheckOnly) { Write-Host 'Aja .\setup.ps1 (ilman -CheckOnly) asentaaksesi puuttuvat.' }
    exit 1
}
