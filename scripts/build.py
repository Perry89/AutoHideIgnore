"""Create local browser builds; configured artifacts must never be committed."""
import json
from pathlib import Path
import shutil
from zipfile import ZipFile, ZIP_DEFLATED

root = Path(__file__).resolve().parent.parent
config_path = root / "translation-config.local.json"
config = json.loads(config_path.read_text()) if config_path.exists() else {"apiKey": "", "endpoint": ""}
for browser, suffix in [("chrome", "zip"), ("firefox", "xpi")]:
    destination = root / "dist" / browser
    destination.mkdir(parents=True, exist_ok=True)
    for folder in ["src", "popup"]:
        shutil.copytree(root / folder, destination / folder, dirs_exist_ok=True)
    manifest_path = root / ("manifest.firefox.json" if browser == "firefox" else "manifest.chrome.json")
    if not manifest_path.exists():
        manifest_path = root / "manifest.json"
    manifest = json.loads(manifest_path.read_text())
    (destination / "manifest.json").write_text(json.dumps(manifest, indent=2) + "\n")
    (destination / "src/translation-config.js").write_text(
        "globalThis.BORNEO_TRANSLATION_CONFIG = " + json.dumps(config, indent=2) + ";\n"
    )
    archive_path = root / "dist" / f"la-rambla-cleaner-{browser}-{manifest['version']}.{suffix}"
    with ZipFile(archive_path, "w", ZIP_DEFLATED) as archive:
        for file in sorted(destination.rglob("*")):
            if file.is_file() and file.name != ".DS_Store":
                archive.write(file, file.relative_to(destination))
    print(f"Built {browser}: {archive_path.name}")
