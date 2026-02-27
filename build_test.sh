#!/bin/bash
cd /vercel/share/v0-project
npm run build 2>&1 | tee build_output.txt
