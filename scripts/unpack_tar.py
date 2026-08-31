import urllib.request
import zlib

url = "https://storage.googleapis.com/eas-workflows-production/logs/7418e17a-cda6-4709-9e70-0769f1ee0461/956b8ff6-70ed-4a63-b7b6-6b3f0f9e2017/2026-08-31T17%3A48%3A27Z-5b1a3b3e-5ca8-4f74-a3c2-6f4fe1817ad2.txt?X-Goog-Algorithm=GOOG4-RSA-SHA256&X-Goog-Credential=www-production%40exponentjs.iam.gserviceaccount.com%2F20260831%2Fauto%2Fstorage%2Fgoog4_request&X-Goog-Date=20260831T175049Z&X-Goog-Expires=900&X-Goog-SignedHeaders=host&X-Goog-Signature=5d658e38e22101be7639c624802338dbce6422d297ca687ef55296b9b91f413ef06877a07074c76a234fa4030798cd37a1cd0be8425278701b29cfe43893cf93d874c5945ea34f2c301bbc7477d4d8fb5cf8e9ac30001b4e4e09f6ed3b8fbe14246bf9614b180abb9760e587452dfb477575a13b9e5e2ab6999d0fb7e1e000d56e44b8fb85d924c06e32e03fc87c4e61d220e1f73bee176e6d273fc4cf1c747c93f080e4352f04398dad2043ca2e48e47426a07f3330ec051f93a780ae2485b3f7e90ce4ff2ed41b4bc9fa96ac06e4e2a427d752b3d395e5e6bd3cf990428a0c233ae257b75a7b918362712d02049a9865fe899de64eb8146253d2ecbcb9c977"

raw = urllib.request.urlopen(url).read()

# Try zlib decompress with raw wbits
for wbits in [-15, 15, 31, 47]:
    try:
        decompressed = zlib.decompress(raw, wbits)
        print(f"Success with wbits={wbits}! Decompressed length: {len(decompressed)}")
        text = decompressed.decode('utf-8', errors='ignore')
        for line in text.splitlines()[-20:]:
            print(line[:150])
        break
    except Exception as e:
        print(f"Failed wbits={wbits}: {e}")
