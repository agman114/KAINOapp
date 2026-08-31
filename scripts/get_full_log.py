import urllib.request
import gzip
import json
import sys

sys.stdout.reconfigure(encoding='utf-8')

url = "https://storage.googleapis.com/eas-workflows-production/logs/7418e17a-cda6-4709-9e70-0769f1ee0461/774ff3b5-f17d-4830-be19-92a6b680a07f/2026-08-31T17%3A19%3A25Z-ea00e547-32e1-49cf-aa6f-95a466b710f6.txt?X-Goog-Algorithm=GOOG4-RSA-SHA256&X-Goog-Credential=www-production%40exponentjs.iam.gserviceaccount.com%2F20260831%2Fauto%2Fstorage%2Fgoog4_request&X-Goog-Date=20260831T172302Z&X-Goog-Expires=900&X-Goog-SignedHeaders=host&X-Goog-Signature=524fbe3c64ccf1d51592a49cae0034780a7962f7cdd1a6272d9153d93ef961415bca04d6b82e321778e1a3a3edf3e9a8625ecb70fce961f217bb9986af0adc3f168ee73cf79dd6bcda64e4c079e86f1a75dfe94d8737dad07ae7044c294e68862fe8441544978362556ec030e3e2daf29d0963415d8986111494c894e1f42b49271eced123cebab096a6e98d34f334172ac75a19c8adcbc5449f277ec2a9668c198267c36b3c54086ff58aa04d9371ff4873d3deb41dc17a4b744d3e828ef782ed3b52c67962b889eabd202b353064c0585b5d56468657f86c98a16f1e72545aa486cb06335509b0691a357794bf75a2fbafd16e26c8c24fc92eb210add619e8"

raw = urllib.request.urlopen(url).read()

try:
    text = gzip.decompress(raw).decode('utf-8', errors='ignore')
except Exception:
    text = raw.decode('utf-8', errors='ignore')

lines = text.splitlines()

for i in range(max(0, len(lines)-40), len(lines)):
    line = lines[i]
    if not line.strip(): continue
    try:
        obj = json.loads(line)
        print(f"[{i}] {obj.get('msg', line)}")
    except Exception:
        print(f"[{i}] {line[:120]}")
