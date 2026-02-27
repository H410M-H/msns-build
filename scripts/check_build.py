#!/usr/bin/env python3
import subprocess
import sys

print("[v0] Checking build...")
try:
    print("[v0] Running typecheck...")
    result = subprocess.run(["npm", "run", "typecheck"], capture_output=True, text=True)
    print(result.stdout)
    if result.returncode != 0:
        print("[v0] TypeScript errors found:")
        print(result.stderr)
    else:
        print("[v0] TypeScript check passed!")
    
    print("\n[v0] Running Next.js build...")
    result = subprocess.run(["npm", "run", "build"], capture_output=True, text=True)
    print(result.stdout)
    if result.returncode != 0:
        print("[v0] Build failed:")
        print(result.stderr)
        sys.exit(1)
    else:
        print("[v0] Build successful!")
except Exception as e:
    print(f"[v0] Error: {e}")
    sys.exit(1)
