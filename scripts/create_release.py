import urllib.request
import urllib.parse
import json
import os
import zipfile

print("=== CREATING ZIP ARCHIVE OF DIST/WIN-UNPACKED ===")
win_dir = r"D:\Swork\KAINOapp\dist\win-unpacked"
zip_out = r"D:\Swork\KAINOapp\dist\KAINOapp-v1.0.3-Windows-x64.zip"

if os.path.exists(win_dir):
    with zipfile.ZipFile(zip_out, 'w', zipfile.ZIP_DEFLATED) as zipf:
        for root, dirs, files in os.walk(win_dir):
            for file in files:
                abs_p = os.path.join(root, file)
                rel_p = os.path.relpath(abs_p, win_dir)
                zipf.write(abs_p, rel_p)
    print(f"ZIP Archive created successfully! File size: {os.path.getsize(zip_out) / (1024*1024):.2f} MB")
else:
    print(f"ERROR: {win_dir} not found!")
