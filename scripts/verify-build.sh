#!/bin/bash

echo "Starting build verification..."
npm run build

if [ $? -eq 0 ]; then
    echo "✓ Build completed successfully!"
    exit 0
else
    echo "✗ Build failed. Check errors above."
    exit 1
fi
