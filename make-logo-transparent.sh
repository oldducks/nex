#!/bin/bash
# Script to make logo background transparent using ImageMagick
# This script should be run on a system with ImageMagick installed

INPUT="frontend/public/nex-logo-current.png"
OUTPUT="frontend/public/nex-logo-current-transparent.png"

if [ ! -f "$INPUT" ]; then
    echo "Error: Logo file not found at $INPUT"
    exit 1
fi

# Check if ImageMagick is available
if ! command -v convert &> /dev/null; then
    echo "ImageMagick not found. Please install it first:"
    echo "  Ubuntu/Debian: sudo apt-get install imagemagick"
    echo "  macOS: brew install imagemagick"
    echo ""
    echo "Or use an online tool like:"
    echo "  https://www.remove.bg/"
    echo "  https://photopea.com/"
    exit 1
fi

echo "Making logo background transparent..."

# Method 1: Remove white background (threshold-based)
convert "$INPUT" -fuzz 10% -transparent white "$OUTPUT" 2>/dev/null

# If that didn't work, try method 2: Remove light colors
if [ ! -f "$OUTPUT" ] || [ ! -s "$OUTPUT" ]; then
    echo "Trying alternative method..."
    convert "$INPUT" \
        -alpha on \
        -fuzz 15% \
        -transparent "#FFFFFF" \
        "$OUTPUT" 2>/dev/null
fi

# Verify output
if [ -f "$OUTPUT" ] && [ -s "$OUTPUT" ]; then
    echo "✓ Success! Logo with transparent background created:"
    echo "  $OUTPUT"
    file "$OUTPUT"
else
    echo "✗ Failed to create transparent logo"
    echo "Please use an online tool or install ImageMagick properly"
    exit 1
fi
