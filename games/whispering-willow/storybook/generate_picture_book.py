from __future__ import annotations

from pathlib import Path
from typing import Iterable

from PIL import Image, ImageDraw, ImageFilter, ImageFont, ImageOps


ROOT = Path(__file__).resolve().parents[1]
BOOK_DIR = Path(__file__).resolve().parent
PREVIEW_DIR = BOOK_DIR / "previews"
OUTPUT_PDF = BOOK_DIR / "whispering-willow-picture-book.pdf"

PAGE_WIDTH = 1800
PAGE_HEIGHT = 2400
MARGIN = 120

BG = "#f4eddc"
INK = "#2b2219"
MUTED = "#6d5b47"
GOLD = "#c79f49"

FONT_DIR = Path("/System/Library/Fonts/Supplemental")
GEORGIA = FONT_DIR / "Georgia.ttf"
GEORGIA_BOLD = FONT_DIR / "Georgia Bold.ttf"
TIMES = FONT_DIR / "Times New Roman.ttf"
TIMES_ITALIC = FONT_DIR / "Times New Roman Italic.ttf"

TITLE_FONT = ImageFont.truetype(str(GEORGIA_BOLD), 94)
PAGE_TITLE_FONT = ImageFont.truetype(str(GEORGIA_BOLD), 68)
SECTION_FONT = ImageFont.truetype(str(GEORGIA_BOLD), 34)
BODY_FONT = ImageFont.truetype(str(TIMES), 42)
BODY_ITALIC_FONT = ImageFont.truetype(str(TIMES_ITALIC), 42)
SUBTITLE_FONT = ImageFont.truetype(str(GEORGIA), 42)


PAGES = [
    {
        "kind": "story",
        "section": "Welcome",
        "title": "A Forest Full of Whispering",
        "image": ROOT / "assets/locations/whispering-willow-card.png",
        "crop": (0.0, 0.34, 1.0, 1.0),
        "accent": "#456d4a",
        "text": (
            "Beyond Redwood Inn, the woods had started behaving like a dream that could not settle down. "
            "Birds forgot the ends of their songs. Mushrooms glowed before sunset. The river kept shining even "
            "when the sky turned gray. Fern felt the worry first, the way a druid always does: as a tug in the chest, "
            "like the forest was trying to ask a question without knowing the words.\n\n"
            "Jude noticed it too, though he called it by a different name. He said the woods sounded brave on the outside "
            "and frightened underneath. Frieren the cat puffed up whenever the wind passed the old willow, which meant "
            "something truly strange was waking. These are the first small tales told about that season: stories about "
            "lanterns, hidden doors, river-magic, and the surprising kindness that turns a scary path into the beginning "
            "of an adventure."
        ),
    },
    {
        "kind": "story",
        "section": "Adventure One",
        "title": "The Lantern at Redwood Inn",
        "image": ROOT / "../../assets/covers/whispering-willow-cover.png",
        "crop": (0.0, 0.0, 1.0, 1.0),
        "accent": "#7a5f35",
        "text": (
            "One rainy evening, Redwood Inn glowed like a pocket of sunshine in the middle of the wet, dark woods. "
            "Fern was drying herbs by the hearth. Jude was trying to look serious while Frieren stole crumbs from the table. "
            "Then the inn door opened, and a hooded traveler stepped in holding a lantern whose flame burned green instead of gold.\n\n"
            "The traveler did not ask for supper first. They set the lantern on the table and whispered, \"The willow is calling for helpers.\" "
            "At once the room went still. Fern heard the name in the rain tapping the window. Jude stood up before fear could get there first. "
            "\"Then nobody should leave that tree to worry alone,\" he said. Frieren hopped straight into Fern's satchel as if the cat had already agreed. "
            "That was how the journey began: not with a battle horn, but with three friends deciding that if the forest was frightened, they would go and listen."
        ),
    },
    {
        "kind": "story",
        "section": "Adventure Two",
        "title": "Mossjaw and the Moonlit Path",
        "image": ROOT / "assets/locations/redwood-inn-card.png",
        "crop": (0.0, 0.0, 0.8, 1.0),
        "accent": "#4d6b37",
        "text": (
            "The next night, the friends heard crashing in the fern brake and saw a creature large enough to make the ground hop under their boots. "
            "It was Mossjaw, the great forest boar, with tusks like curved shovels and moss tangled over his shoulders like an old green cloak. "
            "Jude reached for his weapon at once. Fern reached for her calm voice.\n\n"
            "Good thing she did. Mossjaw was not charging to fight. He was limping because thorn-bells and snare-wire had wrapped around one leg. "
            "Fern whispered to the roots until they loosened. Jude snapped the trap stake in half. Frieren padded right up and bumped the boar's knee as if to say, "
            "\"There now. Be less grumpy.\" Mossjaw snorted, shook the moonlight from his bristles, and turned toward a hidden trail that none of them had seen before. "
            "He looked back only once, making sure they followed. That was the first lesson of the woods: some creatures look fierce because pain is hanging on to them too tightly."
        ),
    },
    {
        "kind": "story",
        "section": "Adventure Three",
        "title": "The Door Beneath the Hill",
        "image": ROOT / "assets/locations/crooked-hill-door-card.png",
        "crop": (0.0, 0.0, 1.0, 1.0),
        "accent": "#7b6b3f",
        "text": (
            "Mossjaw's moonlit path ended at a round wooden door built into the roots of a hill. It looked exactly like the sort of place where brave stories say trouble lives. "
            "Jude braced himself. Fern put one hand on the latch. Frieren listened so hard his whiskers shook.\n\n"
            "When the door creaked open, they did not find an army. They found frightened goblins huddled around cracked lantern charms and half-burned maps. "
            "Someone had told them the woods would swallow them if they stepped outside, so they had started sneaking, snatching, and hiding anything that felt safe enough to keep. "
            "Fern shared bread. Jude fixed a broken stool instead of starting a fight. One small goblin, surprised by the kindness, pointed down a dripping tunnel and whispered that a cold, sad wind had been coming from the river. "
            "The children left knowing the goblins were not the heart of the problem. They were only another part of the forest that had been scared into bad choices."
        ),
    },
    {
        "kind": "story",
        "section": "Adventure Four",
        "title": "The Child at the Riverbank",
        "image": ROOT / "assets/locations/riverbank-card.png",
        "crop": (0.0, 0.28, 1.0, 1.0),
        "accent": "#3f6780",
        "text": (
            "At dawn they reached the river and found a child kneeling in the reeds with both hands over their ears. Every time the child cried, the water swelled and twisted. "
            "Every time the child gasped, the current leaped like a startled animal. Branches rattled. Stones hummed. The whole river seemed to be feeling the same fear.\n\n"
            "Fern did not bark questions. She sat beside the child and breathed slowly until the water copied her rhythm. Jude planted himself nearby, broad and steady, in case anything dangerous rose from the shallows. "
            "Frieren curled into the child's lap and purred loud enough to be heard over the stream. At last the child whispered, \"I didn't mean to make it worse. Something underneath keeps calling, and when I get afraid, the river answers the wrong way.\" "
            "That was when the friends understood the deepest truth so far: the magic in Whispering Willow was not evil. It was tangled, overwhelmed, and waiting for someone patient enough to help it calm down."
        ),
    },
    {
        "kind": "story",
        "section": "Adventure Five",
        "title": "What the Willow Said",
        "image": ROOT / "assets/locations/whispering-willow-card.png",
        "crop": (0.0, 0.36, 1.0, 1.0),
        "accent": "#2f5a43",
        "text": (
            "When the friends finally stood beneath the ancient willow, the leaves moved though no wind was blowing. Lights bobbed under the branches like tiny lantern spirits. "
            "Fern placed her hand against the bark. Jude rested beside her. Frieren's tail curled around all three of them, because even a brave cat likes to be close when old magic wakes.\n\n"
            "The willow did not speak in a voice exactly. It spoke in feelings, memories, and rustling promises. It showed them frightened goblins, lonely creatures, the child by the river, and hidden places where the forest had been hurt and left unheard. "
            "Then it gave them the kind of quest that matters most. Not: defeat the monster. Not: become the strongest. Instead it whispered, \"Find what is frightened. Untangle what is hidden. Leave room for mercy, and the woods will remember how to sing.\" "
            "So that is the real stage for Whispering Willow: a mystery where courage matters, but kindness matters even more."
        ),
    },
]


def crop_image(path: Path, size: tuple[int, int], crop: tuple[float, float, float, float]) -> Image.Image:
    image = Image.open(path).convert("RGB")
    width, height = image.size
    left = int(width * crop[0])
    top = int(height * crop[1])
    right = int(width * crop[2])
    bottom = int(height * crop[3])
    image = image.crop((left, top, right, bottom))
    return ImageOps.fit(image, size, method=Image.Resampling.LANCZOS, centering=(0.5, 0.5))


def rounded_mask(size: tuple[int, int], radius: int) -> Image.Image:
    mask = Image.new("L", size, 0)
    draw = ImageDraw.Draw(mask)
    draw.rounded_rectangle((0, 0, size[0], size[1]), radius=radius, fill=255)
    return mask


def add_card(base: Image.Image, box: tuple[int, int, int, int], fill: str = "#fbf7ef") -> None:
    left, top, right, bottom = box
    shadow = Image.new("RGBA", base.size, (0, 0, 0, 0))
    shadow_draw = ImageDraw.Draw(shadow)
    shadow_draw.rounded_rectangle((left + 10, top + 18, right + 10, bottom + 18), radius=36, fill=(0, 0, 0, 54))
    shadow = shadow.filter(ImageFilter.GaussianBlur(18))
    base.alpha_composite(shadow)

    card = Image.new("RGBA", base.size, (0, 0, 0, 0))
    card_draw = ImageDraw.Draw(card)
    card_draw.rounded_rectangle((left, top, right, bottom), radius=36, fill=fill, outline="#dbcdb3", width=4)
    base.alpha_composite(card)


def paste_rounded(base: Image.Image, image: Image.Image, box: tuple[int, int, int, int], radius: int = 34) -> None:
    left, top, right, bottom = box
    size = (right - left, bottom - top)
    image = image.resize(size, Image.Resampling.LANCZOS)
    mask = rounded_mask(size, radius)
    base.paste(image, (left, top), mask)


def wrap_text(draw: ImageDraw.ImageDraw, text: str, font: ImageFont.FreeTypeFont, max_width: int) -> list[str]:
    lines: list[str] = []
    for paragraph in text.split("\n"):
        words = paragraph.split()
        if not words:
            lines.append("")
            continue
        current = words[0]
        for word in words[1:]:
            trial = f"{current} {word}"
            if draw.textlength(trial, font=font) <= max_width:
                current = trial
            else:
                lines.append(current)
                current = word
        lines.append(current)
    return lines


def draw_wrapped_text(
    draw: ImageDraw.ImageDraw,
    text: str,
    font: ImageFont.FreeTypeFont,
    fill: str,
    box: tuple[int, int, int, int],
    spacing: int,
) -> int:
    left, top, right, _ = box
    lines = wrap_text(draw, text, font, right - left)
    y = top
    for line in lines:
        if line == "":
            y += font.size // 2
            continue
        draw.text((left, y), line, font=font, fill=fill)
        bbox = draw.textbbox((left, y), line, font=font)
        y = bbox[3] + spacing
    return y


def measure_wrapped_text(
    draw: ImageDraw.ImageDraw,
    text: str,
    font: ImageFont.FreeTypeFont,
    max_width: int,
    spacing: int,
) -> int:
    lines = wrap_text(draw, text, font, max_width)
    height = 0
    for line in lines:
        if line == "":
            height += font.size // 2
            continue
        bbox = draw.textbbox((0, 0), line, font=font)
        height += (bbox[3] - bbox[1]) + spacing
    return max(0, height - spacing)


def fit_title_font(draw: ImageDraw.ImageDraw, text: str, max_width: int) -> ImageFont.FreeTypeFont:
    for size in (68, 64, 60, 56):
        font = ImageFont.truetype(str(GEORGIA_BOLD), size)
        if draw.textlength(text, font=font) <= max_width:
            return font
    return ImageFont.truetype(str(GEORGIA_BOLD), 52)


def fit_body_font(
    draw: ImageDraw.ImageDraw,
    text: str,
    max_width: int,
    max_height: int,
) -> ImageFont.FreeTypeFont:
    for size in (42, 40, 38, 36, 34):
        font = ImageFont.truetype(str(TIMES), size)
        if measure_wrapped_text(draw, text, font, max_width, spacing=10) <= max_height:
            return font
    return ImageFont.truetype(str(TIMES), 32)


def render_cover() -> Image.Image:
    page = Image.new("RGBA", (PAGE_WIDTH, PAGE_HEIGHT), BG)
    cover = crop_image(ROOT / "../../assets/covers/whispering-willow-cover.png", (PAGE_WIDTH, PAGE_HEIGHT), (0.0, 0.0, 1.0, 1.0))
    page.paste(cover, (0, 0))

    overlay = Image.new("RGBA", page.size, (9, 18, 15, 0))
    overlay_draw = ImageDraw.Draw(overlay)
    overlay_draw.rectangle((0, 0, PAGE_WIDTH, PAGE_HEIGHT), fill=(17, 26, 20, 86))
    overlay_draw.rectangle((0, 0, PAGE_WIDTH, 640), fill=(8, 12, 10, 116))
    overlay_draw.rectangle((0, PAGE_HEIGHT - 900, PAGE_WIDTH, PAGE_HEIGHT), fill=(8, 12, 10, 150))
    page.alpha_composite(overlay)

    draw = ImageDraw.Draw(page)
    title = "Whispering Willow"
    subtitle = "A Picture Book of Gentle Adventures"
    note = "Five kid-friendly tales to make the mystery feel warm, brave, and ready to explore."

    draw.text((132, 1560), title, font=TITLE_FONT, fill="#fff7e7")
    draw.text((132, 1688), subtitle, font=SUBTITLE_FONT, fill="#f3e0a8")
    draw.line((132, 1768, 780, 1768), fill=GOLD, width=6)
    text_box = (132, 1810, PAGE_WIDTH - 132, PAGE_HEIGHT - 160)
    draw_wrapped_text(draw, note, BODY_ITALIC_FONT, "#fff7e7", text_box, spacing=10)

    draw.text((132, 120), "storybook edition", font=SECTION_FONT, fill="#f6df98")
    return page.convert("RGB")


def render_story_page(page_number: int, section: str, title: str, text: str, image: Path, crop: tuple[float, float, float, float], accent: str) -> Image.Image:
    page = Image.new("RGBA", (PAGE_WIDTH, PAGE_HEIGHT), BG)
    draw = ImageDraw.Draw(page)

    header_band = Image.new("RGBA", page.size, (0, 0, 0, 0))
    header_draw = ImageDraw.Draw(header_band)
    header_draw.rectangle((0, 0, PAGE_WIDTH, 190), fill=(239, 231, 211, 255))
    page.alpha_composite(header_band)

    draw.text((MARGIN, 76), "Whispering Willow Picture Book", font=SECTION_FONT, fill=accent)
    draw.text((PAGE_WIDTH - MARGIN - 120, 76), f"{page_number}", font=SECTION_FONT, fill=MUTED)

    image_box = (MARGIN, 240, PAGE_WIDTH - MARGIN, 1080)
    add_card(page, image_box)
    inset_box = (image_box[0] + 26, image_box[1] + 26, image_box[2] - 26, image_box[3] - 26)
    paste_rounded(page, crop_image(image, (inset_box[2] - inset_box[0], inset_box[3] - inset_box[1]), crop), inset_box)

    text_left = MARGIN + 10
    text_right = PAGE_WIDTH - MARGIN - 10
    section_y = 1152
    draw.text((text_left, section_y), section.upper(), font=SECTION_FONT, fill=accent)
    draw.line((text_left, section_y + 60, text_left + 260, section_y + 60), fill=GOLD, width=5)

    title_font = fit_title_font(draw, title, text_right - text_left)
    title_y = section_y + 102
    draw.text((text_left, title_y), title, font=title_font, fill=INK)

    title_bbox = draw.textbbox((text_left, title_y), title, font=title_font)
    body_top = title_bbox[3] + 40
    body_box = (text_left, body_top, text_right, PAGE_HEIGHT - 130)
    body_font = fit_body_font(draw, text, body_box[2] - body_box[0], body_box[3] - body_box[1])
    draw_wrapped_text(draw, text, body_font, INK, body_box, spacing=10)
    return page.convert("RGB")


def build_pages() -> Iterable[Image.Image]:
    yield render_cover()
    for index, page in enumerate(PAGES, start=1):
        yield render_story_page(
            page_number=index,
            section=page["section"],
            title=page["title"],
            text=page["text"],
            image=page["image"],
            crop=page["crop"],
            accent=page["accent"],
        )


def main() -> None:
    PREVIEW_DIR.mkdir(parents=True, exist_ok=True)
    pages = list(build_pages())

    for index, page in enumerate(pages, start=1):
        preview_path = PREVIEW_DIR / f"page-{index:02}.png"
        page.save(preview_path)

    first, *rest = pages
    first.save(OUTPUT_PDF, save_all=True, append_images=rest, resolution=150.0)
    print(f"Created {OUTPUT_PDF}")
    print(f"Preview pages saved in {PREVIEW_DIR}")


if __name__ == "__main__":
    main()
