import argparse
import json
import os
from pathlib import Path
from urllib import request


def load_env(env_path):
    env = {}
    if not env_path.exists():
        return env
    for line in env_path.read_text(encoding="utf-8").splitlines():
        line = line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        key, value = line.split("=", 1)
        env[key.strip()] = value.strip().strip('"').strip("'")
    return env


def fetch_country_names():
    url = "https://flagcdn.com/en/codes.json"
    with request.urlopen(url) as response:
        return json.loads(response.read().decode("utf-8"))


def synthesize(text, out_path, api_key, voice_id, model_id):
    payload = {
        "text": text,
        "model_id": model_id,
        "voice_settings": {"stability": 0.35, "similarity_boost": 0.8},
    }
    url = f"https://api.elevenlabs.io/v1/text-to-speech/{voice_id}"
    data = json.dumps(payload).encode("utf-8")
    req = request.Request(url, data=data, method="POST")
    req.add_header("Accept", "audio/mpeg")
    req.add_header("Content-Type", "application/json")
    req.add_header("xi-api-key", api_key)
    with request.urlopen(req) as response:
        out_path.write_bytes(response.read())
    return True


def parse_args():
    parser = argparse.ArgumentParser(description="Generate ElevenLabs audio for missing countries.")
    parser.add_argument(
        "--voice-id",
        required=True,
        help="ElevenLabs voice ID to use for generation.",
    )
    parser.add_argument(
        "--output-dir",
        required=True,
        help="Output directory for generated audio files.",
    )
    parser.add_argument(
        "--codes",
        required=True,
        help="Comma-separated list of country codes to generate.",
    )
    return parser.parse_args()


def main():
    root = Path(__file__).resolve().parents[1]
    args = parse_args()
    env = load_env(root / ".env")
    api_key = env.get("ELEVEN_LABS_API") or os.getenv("ELEVEN_LABS_API")
    if not api_key:
        raise SystemExit("Missing ELEVEN_LABS_API in .env or environment.")

    voice_id = args.voice_id
    model_id = env.get("ELEVEN_LABS_MODEL_ID") or os.getenv(
        "ELEVEN_LABS_MODEL_ID", "eleven_multilingual_v2"
    )

    codes = [c.strip() for c in args.codes.split(",")]
    country_names = fetch_country_names()

    audio_dir = Path(args.output_dir)
    audio_dir.mkdir(parents=True, exist_ok=True)

    created = 0
    total = len(codes)
    for i, code in enumerate(codes, 1):
        name = country_names.get(code)
        if not name:
            print(f"[{i}/{total}] Skipping {code}: name not found")
            continue
        out_path = audio_dir / f"{code}.mp3"
        print(f"[{i}/{total}] Generating {code} ({name})...")
        try:
            synthesize(name, out_path, api_key, voice_id, model_id)
            created += 1
        except Exception as e:
            print(f"  Error: {e}")

    print(f"\nAudio files created: {created}/{total}")


if __name__ == "__main__":
    main()
