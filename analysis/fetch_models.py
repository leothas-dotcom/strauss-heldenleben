"""Mallipainot manifestin analysis/models.json mukaan kansioon models/.

  python -I analysis/fetch_models.py           lataa puuttuvat ja tarkistaa kaikki
  python -I analysis/fetch_models.py --check   vain tarkistus, ei latauksia
  python -I analysis/fetch_models.py --pin     kirjaa puuttuvat tarkistussummat manifestiin
                                               (ensimmäinen lataus virallisesta lähteestä)
Palauttaa virhekoodin 1, jos jokin tiedosto puuttuu tai tarkistussumma ei täsmää.
"""
import argparse
import hashlib
import importlib.util
import json
import shutil
import sys
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
MANIFEST = ROOT / "analysis" / "models.json"
MODELS = ROOT / "models"


def sha256(path):
    h = hashlib.sha256()
    with open(path, "rb") as f:
        for block in iter(lambda: f.read(1 << 20), b""):
            h.update(block)
    return h.hexdigest()


def download(url, dest):
    dest.parent.mkdir(parents=True, exist_ok=True)
    part = dest.with_name(dest.name + ".part")
    req = urllib.request.Request(url, headers={"User-Agent": "heldenleben-video/fetch_models"})
    with urllib.request.urlopen(req, timeout=60) as r, open(part, "wb") as f:
        total = int(r.headers.get("Content-Length") or 0)
        done = 0
        for block in iter(lambda: r.read(1 << 20), b""):
            f.write(block)
            done += len(block)
            if total:
                print(f"\r  {dest.name}: {done / 1e6:.0f}/{total / 1e6:.0f} Mt", end="", flush=True)
    print()
    part.replace(dest)


def fetch_hf(entry, filename, dest):
    from huggingface_hub import hf_hub_download

    local = hf_hub_download(entry["repo"], filename, revision=entry["revision"], local_dir=dest.parent)
    if Path(local).resolve() != dest.resolve():
        shutil.copyfile(local, dest)


def fetch_package(entry, dest):
    spec = importlib.util.find_spec(entry["module"])
    if spec is None or not spec.submodule_search_locations:
        raise RuntimeError(f"paketti {entry['module']} puuttuu (aja setup.ps1)")
    dest.parent.mkdir(parents=True, exist_ok=True)
    shutil.copyfile(Path(spec.submodule_search_locations[0]) / entry["file"], dest)


def files_of(entry):
    """(tiedoston nimi lähteessä, paikallinen polku, odotettu sha256) jokaiselle tiedostolle."""
    if entry["type"] == "hf":
        return [(name, MODELS / entry["path"] / name, expected) for name, expected in entry["files"].items()]
    return [(None, MODELS / entry["path"], entry["sha256"])]


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--check", action="store_true", help="vain tarkistus")
    ap.add_argument("--pin", action="store_true", help="kirjaa puuttuvat tarkistussummat")
    a = ap.parse_args()

    manifest = json.loads(MANIFEST.read_text(encoding="utf-8"))
    errors, pinned = 0, 0
    for entry in manifest["models"]:
        for name, path, expected in files_of(entry):
            label = f"{entry['name']}" + (f"/{name}" if name else "")
            if not path.exists():
                if a.check:
                    print(f"PUUTTUU   {label}")
                    errors += 1
                    continue
                print(f"ladataan  {label}")
                if entry["type"] == "url":
                    download(entry["url"], path)
                elif entry["type"] == "hf":
                    fetch_hf(entry, name, path)
                elif entry["type"] == "package":
                    fetch_package(entry, path)
            actual = sha256(path)
            if expected is None:
                if a.pin:
                    if entry["type"] == "hf":
                        entry["files"][name] = actual
                    else:
                        entry["sha256"] = actual
                    pinned += 1
                    print(f"KIRJATTU  {label}  {actual}")
                else:
                    print(f"EI SUMMAA {label} (aja --pin ensimmäisen latauksen jälkeen)")
                    errors += 1
            elif actual != expected:
                print(f"VIRHE     {label}: SHA-256 ei täsmää\n          odotettu {expected}\n          saatu    {actual}")
                errors += 1
            else:
                print(f"OK        {label}")

    if pinned:
        MANIFEST.write_text(json.dumps(manifest, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
        print(f"{pinned} tarkistussummaa kirjattu manifestiin.")
    sys.exit(1 if errors else 0)


if __name__ == "__main__":
    main()
