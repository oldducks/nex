#!/usr/bin/env python3
"""
Script to make logo background transparent
Removes white/light background from logo image
"""

import sys
import os

try:
    from PIL import Image
except ImportError:
    print("PIL/Pillow not found. Installing...")
    print("Please run: pip install Pillow")
    sys.exit(1)

def make_transparent(input_path, output_path, threshold=240):
    """
    Make logo background transparent by removing white/light colors
    """
    try:
        # Open image
        img = Image.open(input_path)
        
        # Convert to RGBA if not already
        if img.mode != 'RGBA':
            img = img.convert('RGBA')
        
        # Get image data
        data = img.getdata()
        
        # Create new image data with transparency
        new_data = []
        for item in data:
            # If pixel is white/light (all channels > threshold), make it transparent
            if item[0] > threshold and item[1] > threshold and item[2] > threshold:
                new_data.append((255, 255, 255, 0))  # Transparent
            else:
                new_data.append(item)  # Keep original
        
        # Update image data
        img.putdata(new_data)
        
        # Save as PNG with transparency
        img.save(output_path, 'PNG')
        print(f"✓ Logo made transparent successfully!")
        print(f"  Input:  {input_path}")
        print(f"  Output: {output_path}")
        return True
        
    except Exception as e:
        print(f"Error: {e}")
        return False

if __name__ == "__main__":
    script_dir = os.path.dirname(os.path.abspath(__file__))
    input_path = os.path.join(script_dir, 'frontend/public/nex-logo-current.png')
    output_path = os.path.join(script_dir, 'frontend/public/nex-logo-current-transparent.png')
    
    if not os.path.exists(input_path):
        print(f"Error: Logo file not found at {input_path}")
        sys.exit(1)
    
    make_transparent(input_path, output_path)
