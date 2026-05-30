from pathlib import Path
from PIL import Image, ImageDraw, ImageFilter, ImageFont
import math


ROOT = Path(__file__).resolve().parent
OUT = ROOT / "output"
SRC = ROOT / "source-screenshots"
PUBLIC = ROOT.parents[1] / "frontend" / "public"

W, H = 1920, 1080
NAVY = (2, 10, 32)
NAVY_2 = (5, 18, 54)
BLUE = (39, 120, 255)
CYAN = (43, 214, 255)
ORANGE = (255, 121, 36)
WHITE = (248, 250, 252)
MUTED = (190, 205, 230)
LINE = (31, 103, 210)


def font(size: int, bold: bool = False):
    thai = "/usr/share/fonts/opentype/tlwg/Loma-Bold.otf" if bold else "/usr/share/fonts/opentype/tlwg/Loma.otf"
    latin = "/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf" if bold else "/usr/share/fonts/truetype/liberation/LiberationSans-Regular.ttf"
    path = thai if Path(thai).exists() else latin
    return ImageFont.truetype(path, size=size)


def text_size(draw, text, fnt):
    box = draw.textbbox((0, 0), text, font=fnt)
    return box[2] - box[0], box[3] - box[1]


def rounded_rect(draw, box, radius, fill, outline=None, width=1):
    draw.rounded_rectangle(box, radius=radius, fill=fill, outline=outline, width=width)


def make_bg():
    img = Image.new("RGB", (W, H), NAVY)
    px = img.load()
    for y in range(H):
        for x in range(W):
            dx = x / W
            dy = y / H
            glow = max(0, 1 - math.hypot(dx - 0.78, dy - 0.42) * 1.65)
            left = max(0, 1 - math.hypot(dx - 0.12, dy - 0.22) * 2.6)
            r = int(NAVY[0] + 5 * dy + 8 * glow + 3 * left)
            g = int(NAVY[1] + 10 * dy + 36 * glow + 8 * left)
            b = int(NAVY[2] + 16 * dy + 92 * glow + 42 * left)
            px[x, y] = (min(r, 255), min(g, 255), min(b, 255))

    overlay = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    d = ImageDraw.Draw(overlay)
    for i in range(18):
        y = 80 + i * 42
        points = []
        for x in range(620, W + 80, 28):
            wave = math.sin((x / 105) + i * 0.45) * 24
            points.append((x, y + wave + i * 9))
        d.line(points, fill=(37, 151, 255, 28), width=2)
    for i in range(9):
        x = 610 + i * 24
        for j in range(8):
            d.ellipse((x + j * 34, 600 + i * 13, x + j * 34 + 4, 604 + i * 13), fill=(37, 151, 255, 35))
    img = Image.alpha_composite(img.convert("RGBA"), overlay)
    return img


def fit_image(path, size):
    im = Image.open(path).convert("RGBA")
    im.thumbnail(size, Image.LANCZOS)
    return im


def add_logo(img):
    logo_path = PUBLIC / "nex-logo-current-transparent.png"
    logo = Image.open(logo_path).convert("RGBA")
    logo.thumbnail((230, 130), Image.LANCZOS)
    img.alpha_composite(logo, (76, 60))


def add_product_visual(img):
    screen = fit_image(SRC / "screenshot-03.png", (1060, 640))
    card = Image.new("RGBA", (screen.width + 42, screen.height + 42), (0, 0, 0, 0))
    shadow = Image.new("RGBA", card.size, (0, 0, 0, 0))
    sd = ImageDraw.Draw(shadow)
    rounded_rect(sd, (18, 18, card.width - 18, card.height - 18), 34, (0, 0, 0, 210))
    shadow = shadow.filter(ImageFilter.GaussianBlur(24))
    card.alpha_composite(shadow, (0, 0))
    d = ImageDraw.Draw(card)
    rounded_rect(d, (16, 16, card.width - 22, card.height - 22), 34, (10, 24, 66, 255), (75, 163, 255, 95), 2)
    mask = Image.new("L", screen.size, 0)
    md = ImageDraw.Draw(mask)
    rounded_rect(md, (0, 0, screen.width, screen.height), 24, 255)
    card.paste(screen, (21, 21), mask)
    card = card.rotate(-3.2, resample=Image.BICUBIC, expand=True)
    img.alpha_composite(card, (760, 220))

    phone = fit_image(SRC / "screenshot-05.png", (360, 520))
    phone_card = Image.new("RGBA", (phone.width + 34, phone.height + 34), (0, 0, 0, 0))
    sh = Image.new("RGBA", phone_card.size, (0, 0, 0, 0))
    sd = ImageDraw.Draw(sh)
    rounded_rect(sd, (14, 14, phone_card.width - 14, phone_card.height - 14), 34, (0, 0, 0, 220))
    sh = sh.filter(ImageFilter.GaussianBlur(20))
    phone_card.alpha_composite(sh)
    pd = ImageDraw.Draw(phone_card)
    rounded_rect(pd, (12, 12, phone_card.width - 16, phone_card.height - 16), 28, (9, 20, 55, 255), (255, 121, 36, 140), 2)
    pmask = Image.new("L", phone.size, 0)
    pmd = ImageDraw.Draw(pmask)
    rounded_rect(pmd, (0, 0, phone.width, phone.height), 22, 255)
    phone_card.paste(phone, (17, 17), pmask)
    img.alpha_composite(phone_card, (1310, 570))


def icon(draw, x, y, kind, color):
    rounded_rect(draw, (x, y, x + 86, y + 86), 22, (color[0] // 7, color[1] // 7, color[2] // 7, 190), color, 3)
    cx, cy = x + 43, y + 43
    if kind == "page":
        draw.rounded_rectangle((cx - 22, cy - 26, cx + 18, cy + 26), radius=5, outline=color, width=5)
        draw.line((cx - 12, cy - 8, cx + 10, cy - 8), fill=color, width=4)
        draw.line((cx - 12, cy + 6, cx + 10, cy + 6), fill=color, width=4)
    elif kind == "lead":
        draw.ellipse((cx - 18, cy - 24, cx + 18, cy + 12), outline=color, width=5)
        draw.arc((cx - 28, cy - 2, cx + 28, cy + 34), 200, 340, fill=color, width=5)
    elif kind == "qr":
        for ix in range(3):
            for iy in range(3):
                if (ix, iy) in [(0, 0), (2, 0), (0, 2), (1, 1), (2, 2)]:
                    draw.rounded_rectangle((cx - 25 + ix * 18, cy - 25 + iy * 18, cx - 13 + ix * 18, cy - 13 + iy * 18), radius=2, fill=color)
    elif kind == "chart":
        draw.line((cx - 25, cy + 22, cx + 25, cy + 22), fill=color, width=5)
        for i, h in enumerate([22, 38, 52]):
            draw.rounded_rectangle((cx - 22 + i * 18, cy + 18 - h, cx - 12 + i * 18, cy + 22), radius=3, fill=color)


def draw_copy(img, lang):
    d = ImageDraw.Draw(img)
    if lang == "th":
        headline = "NEX Solution"
        subtitle = "เครื่องมือดิจิทัลครบในที่เดียว"
        desc = "สร้างหน้าเว็บ เก็บลีด ทำ QR, Catalog และนามบัตรดิจิทัลได้เอง ไม่ต้องรอช่าง"
        bullets = [
            ("page", "สร้าง Landing Page ได้ในไม่กี่นาที"),
            ("lead", "เก็บ Lead พร้อมดู Analytics"),
            ("qr", "QR, Form, Catalog, Digital Card"),
            ("chart", "แก้ไขเองได้ทุกเวลา"),
        ]
        cta = "เริ่มใช้ฟรี  •  nexsolution.cloud"
        pill = "สำหรับ SME ไทย"
    else:
        headline = "NEX Solution"
        subtitle = "All-in-one digital toolkit"
        desc = "Build landing pages, capture leads, create QR codes, catalogs and digital cards without waiting for a developer."
        bullets = [
            ("page", "Landing pages in minutes"),
            ("lead", "Lead forms with analytics"),
            ("qr", "QR, Catalog & Digital Cards"),
            ("chart", "Edit anytime, launch faster"),
        ]
        cta = "Start free  •  nexsolution.cloud"
        pill = "Built for modern SMEs"

    add_logo(img)
    rounded_rect(d, (82, 190, 82 + text_size(d, pill, font(30, True))[0] + 42, 246), 28, (16, 55, 120, 175), (57, 180, 255, 120), 2)
    d.text((103, 198), pill, font=font(30, True), fill=(207, 235, 255))

    d.text((80, 280), headline, font=font(96, True), fill=WHITE)
    hw, _ = text_size(d, headline, font(96, True))
    d.text((80 + min(hw + 22, 460), 280), "", font=font(96, True), fill=CYAN)
    d.text((82, 388), subtitle, font=font(56, True), fill=(88, 201, 255))
    d.multiline_text((84, 470), wrap(desc, 42), font=font(31), fill=MUTED, spacing=8)

    y = 565
    colors = [BLUE, ORANGE, (31, 214, 131), (132, 96, 255)]
    for idx, (kind, text) in enumerate(bullets):
        icon(d, 88, y, kind, colors[idx])
        d.text((202, y + 22), text, font=font(36, True), fill=WHITE)
        if idx < len(bullets) - 1:
            d.line((202, y + 88, 675, y + 88), fill=(35, 85, 145, 130), width=1)
        y += 98

    rounded_rect(d, (88, 965, 760, 1040), 26, (9, 32, 80, 210), (88, 165, 255, 160), 2)
    d.text((126, 984), cta, font=font(34, True), fill=WHITE)

    rounded_rect(d, (1450, 74, 1785, 132), 28, (255, 121, 36, 230), None, 0)
    d.text((1490, 87), "No-code marketing suite", font=font(27, True), fill=WHITE)

    # Small status card, echoing the sample's lower-right legend.
    rounded_rect(d, (1450, 910, 1845, 1015), 24, (4, 18, 48, 210), (56, 137, 255, 120), 2)
    d.ellipse((1486, 938, 1510, 962), fill=ORANGE)
    d.text((1526, 930), "Lead capture", font=font(28, True), fill=WHITE)
    d.text((1706, 930), "ready", font=font(28, True), fill=(255, 191, 80))
    d.ellipse((1486, 974, 1510, 998), fill=(31, 214, 131))
    d.text((1526, 966), "Analytics", font=font(28, True), fill=WHITE)
    d.text((1706, 966), "live", font=font(28, True), fill=(31, 214, 131))


def wrap(text, chars):
    words = text.split(" ")
    lines = []
    current = ""
    for word in words:
        trial = word if not current else current + " " + word
        if len(trial) <= chars:
            current = trial
        else:
            if current:
                lines.append(current)
            current = word
    if current:
        lines.append(current)
    return "\n".join(lines)


def make(lang, out_name):
    img = make_bg()
    add_product_visual(img)
    draw_copy(img, lang)
    OUT.mkdir(parents=True, exist_ok=True)
    path = OUT / out_name
    img.convert("RGB").save(path, quality=95, subsampling=0)
    return path


if __name__ == "__main__":
    for lang, name in [
        ("th", "nexsolution-ad-th-16x9.jpg"),
        ("en", "nexsolution-ad-en-16x9.jpg"),
    ]:
        print(make(lang, name))
