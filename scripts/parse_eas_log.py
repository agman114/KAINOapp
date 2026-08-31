import urllib.request
import sys

sys.stdout.reconfigure(encoding='utf-8')

url = "https://storage.googleapis.com/eas-workflows-production/logs/7418e17a-cda6-4709-9e70-0769f1ee0461/956b8ff6-70ed-4a63-b7b6-6b3f0f9e2017/2026-08-31T17%3A48%3A27Z-5b1a3b3e-5ca8-4f74-a3c2-6f4fe1817ad2.txt?X-Goog-Algorithm=GOOG4-RSA-SHA256&X-Goog-Credential=www-production%40exponentjs.iam.gserviceaccount.com%2F20260831%2Fauto%2Fstorage%2Fgoog4_request&X-Goog-Date=20260831T175150Z&X-Goog-Expires=900&X-Goog-SignedHeaders=host&X-Goog-Signature=408067ff5d19a18f2dc7ac57370292d0f5fba8b0e9acb4b6032f8c97c21e8a1b14f56c8925958bac654795e1e003c8161a3422f7db177af066556926bf7537ece64c4e1dd980caef73e2616cc3ed858990c7f8f4c0f8689bfefc6e7957323d12d7f793f101d6727e7e312bd6d384a9f3ef0196141ec67c1d40434cd7ffd20855d974d9f6e1b8d234c3adcfc9a7da44d3ea9a1e33425e37012ceed2452cee6722dea357f2ef13c2bbab2b7c60eefc8d9d95dfb8d7992f9ecddfb70cd1201bd5540dc6edf7b6d3cd4ea707aa511981f2615eb0e21226761c22aca756e18b1f5766908e223b828322b360df2b174e2422a8e507a228221de7bbd88d3ce243d7befe"

req = urllib.request.urlopen(url)
content = req.read().decode('utf-8', errors='ignore')

print("TOTAL CHARS:", len(content))
lines = content.splitlines()

for i, line in enumerate(lines):
    if any(k in line for k in ['FAILURE:', '* What went wrong:', '* Where:', 'error', 'Error', 'FAILED']):
        print(f"[{i}] {line}")
