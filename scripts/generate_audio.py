import argparse
import json
import os
import re
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


def extract_pack_codes(countries_js_path):
    text = countries_js_path.read_text(encoding="utf-8")
    match = re.search(r"const packs = \{(.*?)\};", text, re.S)
    if not match:
        raise RuntimeError("Unable to find packs in countries.js")
    codes = set(re.findall(r'"([a-z]{2})"', match.group(1)))
    return sorted(codes)


def fetch_country_names():
    url = "https://flagcdn.com/en/codes.json"
    with request.urlopen(url) as response:
        return json.loads(response.read().decode("utf-8"))


def synthesize(text, out_path, api_key, voice_id, model_id, force=False):
    if out_path.exists() and not force:
        return False
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
    parser = argparse.ArgumentParser(description="Generate ElevenLabs audio files.")
    parser.add_argument(
        "--voice-id",
        required=True,
        help="ElevenLabs voice ID to use for generation.",
    )
    parser.add_argument(
        "--force",
        action="store_true",
        help="Regenerate files even if they already exist.",
    )
    return parser.parse_args()


def build_phrase_list():
    phrases = [
        ("question.mp3", "What country is this?"),
        ("correct.mp3", "That is correct, Savva!"),
        ("correct_alt1.mp3", "Good job, Savva!"),
        ("correct_alt2.mp3", "Well done, Savva!"),
        ("incorrect.mp3", "Not quite right..."),
        ("congrats.mp3", "Congratulations, Savva!"),
        ("try_again.mp3", "Good luck next time!"),
    ]
    for score in range(0, 11):
        phrases.append((f"score_{score}.mp3", f"Your score is {score}."))
    return phrases


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

    pack_codes = extract_pack_codes(root / "countries.js")
    country_names = fetch_country_names()

    audio_dir = root / "assets" / "audio" / voice_id
    audio_dir.mkdir(parents=True, exist_ok=True)

    created = 0
    for filename, phrase in build_phrase_list():
        if synthesize(
            phrase,
            audio_dir / filename,
            api_key,
            voice_id,
            model_id,
            force=args.force,
        ):
            created += 1

    for code in pack_codes:
        name = country_names.get(code)
        if not name:
            continue
        if synthesize(
            name,
            audio_dir / f"{code}.mp3",
            api_key,
            voice_id,
            model_id,
            force=args.force,
        ):
            created += 1

    print(f"Audio files created: {created}")


if __name__ == "__main__":
    main()
