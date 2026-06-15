from PIL import Image, ImageDraw, ImageFont, ImageFilter
from pathlib import Path
import math

ROOT = Path('/home/ubuntu/work/ConText-app')
SOCIAL = ROOT / 'public' / 'social'
ICONS = ROOT / 'public' / 'icons'
SOCIAL.mkdir(parents=True, exist_ok=True)

W, H = 1200, 630
bg = Image.new('RGB', (W, H), '#05070d')
d = ImageDraw.Draw(bg)

# Subtle cinematic gradients
for y in range(H):
    t = y / H
    r = int(5 + 3 * (1 - t))
    g = int(7 + 18 * (1 - abs(t - 0.58)))
    b = int(13 + 12 * t)
    d.line([(0, y), (W, y)], fill=(r, g, b))

# Radial teal glow
for radius, alpha in [(520, 22), (390, 28), (260, 34)]:
    glow = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    gd = ImageDraw.Draw(glow)
    gd.ellipse((60-radius//2, 330-radius//2, 60+radius//2, 330+radius//2), fill=(18, 220, 190, alpha))
    glow = glow.filter(ImageFilter.GaussianBlur(70))
    bg = Image.alpha_composite(bg.convert('RGBA'), glow).convert('RGB')

# Card panel
panel = Image.new('RGBA', (W, H), (0,0,0,0))
pd = ImageDraw.Draw(panel)
pd.rounded_rectangle((74, 74, W-74, H-74), radius=34, fill=(12, 12, 25, 218), outline=(39, 223, 194, 52), width=2)
pd.rounded_rectangle((98, 98, W-98, H-98), radius=26, outline=(211, 178, 75, 45), width=1)
bg = Image.alpha_composite(bg.convert('RGBA'), panel)

# Fonts
def font(paths, size):
    for p in paths:
        if Path(p).exists():
            return ImageFont.truetype(p, size)
    return ImageFont.load_default()

serif = font(['/usr/share/fonts/truetype/liberation/LiberationSerif-Regular.ttf'], 86)
serif_italic = font(['/usr/share/fonts/truetype/liberation/LiberationSerif-Italic.ttf'], 86)
mono = font(['/usr/share/fonts/truetype/liberation/LiberationMono-Regular.ttf'], 28)
mono_small = font(['/usr/share/fonts/truetype/liberation/LiberationMono-Regular.ttf'], 24)
sans_bold = font(['/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf'], 30)
sans = font(['/usr/share/fonts/truetype/liberation/LiberationSans-Regular.ttf'], 44)

# Logo
logo_path = ICONS / 'context-logo-user-transparent.png'
logo = Image.open(logo_path).convert('RGBA')
logo.thumbnail((148, 148), Image.LANCZOS)
shadow = Image.new('RGBA', (logo.width+36, logo.height+36), (0,0,0,0))
sd = ImageDraw.Draw(shadow)
sd.rounded_rectangle((8,8,logo.width+28,logo.height+28), radius=28, fill=(0,0,0,120))
shadow = shadow.filter(ImageFilter.GaussianBlur(10))
bg.alpha_composite(shadow, (102, 140))
bg.alpha_composite(logo, (120, 158))

d = ImageDraw.Draw(bg)
# Brand line
x0 = 300
d.text((x0, 142), '•  T O N E   I N T E L L I G E N C E', font=mono_small, fill=(211,178,75))
d.text((x0, 184), 'Con', font=serif, fill=(248,248,244))
con_w = d.textlength('Con', font=serif)
d.text((x0 + con_w, 184), 'Text', font=serif_italic, fill=(211,178,75))

# Main claim
claim_y = 318
d.text((300, claim_y), 'Scrivi naturale.', font=sans, fill=(246, 246, 242))
d.text((300, claim_y + 58), 'Invia meglio.', font=sans, fill=(211, 178, 75))

# Description
body = 'Trasforma messaggi, email e risposte delicate\nnel tono giusto. In italiano, in pochi secondi.'
d.multiline_text((300, 458), body, font=mono_small, fill=(224, 224, 230), spacing=12)

# CTA pill
pill = Image.new('RGBA', (W, H), (0,0,0,0))
pilld = ImageDraw.Draw(pill)
pilld.rounded_rectangle((300, 525, 840, 580), radius=18, fill=(211,178,75,255))
pilld.text((328, 539), '3 trasformazioni gratis ogni giorno', font=sans_bold, fill=(8,8,14))
bg = Image.alpha_composite(bg, pill)

out = SOCIAL / 'context-share-20260615.png'
bg.convert('RGB').save(out, 'PNG', optimize=True)

# Keep legacy filename updated too, but use cache-busted file in meta tags.
bg.convert('RGB').resize((1920, 1080), Image.LANCZOS).save(SOCIAL / 'tiktok-cover-1920x1080.png', 'PNG', optimize=True)
print(out)
print('size', Image.open(out).size)
