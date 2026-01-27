#!/usr/bin/env python3
"""
Generate sw.js (service worker) based on actual assets in the project.
This ensures the cache list stays in sync with the actual files.

Usage:
    python3 scripts/generate_sw.py [--version X.Y.Z]
"""

import os
import argparse
from pathlib import Path

# Project root (parent of scripts folder)
PROJECT_ROOT = Path(__file__).parent.parent

# Voice ID for audio files
VOICE_ID = "kPzsL2i3teMYv0FxEYQ6"


def get_files_in_dir(directory: Path, extension: str) -> list[str]:
    """Get all files with given extension in directory, sorted."""
    if not directory.exists():
        return []
    files = [f.name for f in directory.iterdir() if f.suffix == extension]
    return sorted(files)


def generate_sw_content(version: str) -> str:
    """Generate the complete sw.js content."""

    # Paths
    flags_dir = PROJECT_ROOT / "assets" / "flags"
    images_dir = PROJECT_ROOT / "assets" / "images"
    audio_root = PROJECT_ROOT / "assets" / "audio"
    voice_dir = audio_root / VOICE_ID
    icons_dir = PROJECT_ROOT / "assets" / "icons"

    # Collect assets
    flag_files = get_files_in_dir(flags_dir, ".png")
    image_files = get_files_in_dir(images_dir, ".png")
    icon_files = get_files_in_dir(icons_dir, ".png")
    root_audio_files = get_files_in_dir(audio_root, ".mp3")
    voice_audio_files = get_files_in_dir(voice_dir, ".mp3")

    # Separate voice audio into categories
    score_files = sorted([f for f in voice_audio_files if f.startswith("score_")],
                         key=lambda x: int(x.replace("score_", "").replace(".mp3", "")))
    system_audio = [f for f in voice_audio_files if f in ["question.mp3", "congrats.mp3"]]
    country_audio = [f for f in voice_audio_files
                     if f not in score_files and f not in system_audio]

    # Build the file content
    lines = []
    lines.append(f"const CACHE_NAME = 'flag-game-{version}';")
    lines.append("")

    # Core assets
    lines.append("const CORE_ASSETS = [")
    lines.append("  './',")
    lines.append("  './index.html',")
    lines.append("  './styles.css',")
    lines.append("  './app.js',")
    lines.append("  './countries.js',")
    lines.append("  './manifest.json',")

    # Icons
    for icon in icon_files:
        lines.append(f"  './assets/icons/{icon}',")

    # Images
    for img in image_files:
        lines.append(f"  './assets/images/{img}',")

    # Root audio files
    for audio in root_audio_files:
        lines.append(f"  './assets/audio/{audio}',")

    # Voice system audio (question, congrats)
    for audio in sorted(system_audio):
        lines.append(f"  './assets/audio/{VOICE_ID}/{audio}',")

    # Score audio files
    for score in score_files:
        lines.append(f"  './assets/audio/{VOICE_ID}/{score}',")

    # Remove trailing comma from last item
    if lines[-1].endswith(","):
        lines[-1] = lines[-1][:-1]
    lines.append("];")
    lines.append("")

    # Flag assets
    lines.append("// All flag images")
    lines.append("const PACK_FLAGS = [")
    for i, flag in enumerate(flag_files):
        comma = "," if i < len(flag_files) - 1 else ""
        lines.append(f"  './assets/flags/{flag}'{comma}")
    lines.append("];")
    lines.append("")

    # Country audio
    lines.append("// All country name audio files")
    lines.append("const COUNTRY_AUDIO = [")
    for i, audio in enumerate(country_audio):
        comma = "," if i < len(country_audio) - 1 else ""
        lines.append(f"  './assets/audio/{VOICE_ID}/{audio}'{comma}")
    lines.append("];")
    lines.append("")

    # Service worker logic
    lines.append("""self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll([...CORE_ASSETS, ...PACK_FLAGS, ...COUNTRY_AUDIO]);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }
      return fetch(event.request).then((response) => {
        if (!response || response.status !== 200 || response.type !== 'basic') {
          return response;
        }
        const responseToCache = response.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseToCache);
        });
        return response;
      });
    })
  );
});""")

    return "\n".join(lines) + "\n"


def main():
    parser = argparse.ArgumentParser(description="Generate sw.js from actual assets")
    parser.add_argument("--version", default="2.1.0",
                        help="Cache version string (default: 2.1.0)")
    parser.add_argument("--dry-run", action="store_true",
                        help="Print output instead of writing file")
    args = parser.parse_args()

    content = generate_sw_content(args.version)

    if args.dry_run:
        print(content)
    else:
        output_path = PROJECT_ROOT / "sw.js"
        output_path.write_text(content)
        print(f"Generated {output_path}")

        # Print summary
        flags_count = content.count("./assets/flags/")
        audio_count = content.count(f"./assets/audio/{VOICE_ID}/")
        images_count = content.count("./assets/images/")
        print(f"  - {flags_count} flags")
        print(f"  - {audio_count} voice audio files")
        print(f"  - {images_count} images")


if __name__ == "__main__":
    main()
