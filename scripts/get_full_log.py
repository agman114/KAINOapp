import urllib.request
import gzip
import json
import sys

sys.stdout.reconfigure(encoding='utf-8')

url = "https://storage.googleapis.com/eas-workflows-production/logs/7418e17a-cda6-4709-9e70-0769f1ee0461/cdf53691-fe6d-40ac-964b-8454c944a71b/2026-08-31T16%3A49%3A35Z-60c9272c-60de-454a-ba08-c8127d54fd1f.txt?X-Goog-Algorithm=GOOG4-RSA-SHA256&X-Goog-Credential=www-production%40exponentjs.iam.gserviceaccount.com%2F20260831%2Fauto%2Fstorage%2Fgoog4_request&X-Goog-Date=20260831T165150Z&X-Goog-Expires=900&X-Goog-SignedHeaders=host&X-Goog-Signature=1b020ebc4bd705a6e445e21728b8add6ed75305a332f4262431403d84e39dfbedafe557a619a0f39fef4cdd09000de8ee892a5c45e9719f70819d6efabca3981e434d9d3bc20e60715943315cf5241e8db7a2afaece47a3a76cc4813c319f1fdfb6093db07ca4659d7f059756f091fb33aa49d8fb1e5fc34d989f1b0d6bdbc9f22efebc0d6a03ef15ac122535da5b51bee1b8ff40225bd1a3e28c382089248d05550f45f5f31ce1fdb869b758472b0e85304c3622b5d16ec1d0b48c3b3ea3c55f61f4e16bbcfe6a598d918fab2ec5fcdaa2ad4e814109000f33b627a9f1019ee480415c9d4f48bbe30d12493c6d7040b9a5d7ecce66a4333820115e82cdb44c3"

req = urllib.request.urlopen(url)
raw = req.read()

try:
    content = gzip.decompress(raw).decode('utf-8', errors='ignore')
except Exception:
    content = raw.decode('utf-8', errors='ignore')

lines = content.splitlines()
print(f"Total decompressed log lines: {len(lines)}")

for line in lines[-40:]:
    try:
        data = json.loads(line)
        msg = data.get('msg', line)
        print(msg)
    except Exception:
        print(line[:200])
