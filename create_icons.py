from PIL import Image, ImageDraw, ImageFont
import os

def create_icon(name, color=(0, 0, 0)):
    # Create a 32x32 image with gray background
    img = Image.new('RGB', (32, 32), '#C0C0C0')
    draw = ImageDraw.Draw(img)
    
    # Draw a simple shape based on the icon type
    if name == 'faucet':
        # Simple faucet shape
        draw.rectangle([8, 8, 24, 12], fill=color)
        draw.rectangle([14, 12, 18, 24], fill=color)
    elif name == 'shower':
        # Simple shower head
        draw.rectangle([8, 4, 24, 8], fill=color)
        for x in range(10, 23, 4):
            draw.rectangle([x, 12, x+2, 20], fill=color)
    elif name == 'filter':
        # Simple filter shape
        draw.polygon([(8, 8), (24, 8), (20, 24), (12, 24)], fill=color)
    elif name == 'help':
        # Question mark
        draw.ellipse([4, 4, 28, 28], outline=color, width=2)
        draw.text((13, 8), "?", fill=color, font=None, size=16)
    elif name == 'shutdown':
        # Power symbol
        draw.ellipse([8, 8, 24, 24], outline=color, width=2)
        draw.rectangle([14, 6, 18, 16], fill=color)

    # Save the icon
    img.save(f'img/{name}.png')

# Create directory if it doesn't exist
os.makedirs('img', exist_ok=True)

# Create all missing icons
icons = ['faucet', 'shower', 'filter', 'help', 'shutdown']
for icon in icons:
    create_icon(icon) 