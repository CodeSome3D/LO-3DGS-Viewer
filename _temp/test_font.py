import subprocess, os, re

html = """<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
body { font-family: Arial, "Helvetica Neue", Helvetica, sans-serif; }
</style>
</head>
<body>
<h1>Test Document</h1>
<p>This is a test of standard fonts without any color emojis.</p>
</body>
</html>
"""

html_path = r"c:\Egor\3DGS\WEB 3DGS\LO-3DGS-Viewer\_temp\test_no_emoji.html"
pdf_path = r"c:\Egor\3DGS\WEB 3DGS\LO-3DGS-Viewer\_temp\test_no_emoji.pdf"

with open(html_path, "w", encoding="utf-8") as f:
    f.write(html)

edge = r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"
subprocess.run([edge, "--headless", "--disable-gpu", "--no-pdf-header-footer", f"--print-to-pdf={pdf_path}", html_path])

with open(pdf_path, "rb") as f:
    t = f.read().decode("latin1", errors="ignore")

subtypes = set(re.findall(r"/Subtype\s*/([A-Za-z0-9_]+)", t))
print("Subtypes without emojis:", subtypes)
