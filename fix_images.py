import os
import sys
from pathlib import Path
from PIL import Image

# Register HEIF opener so Pillow can read iPhone HEIC files
try:
    import pillow_heif

    pillow_heif.register_heif_opener()
except ImportError:
    print("Error: 'pillow-heif' is required to process HEIC images.")
    print("Run: pip install pillow-heif")
    sys.exit(1)

SUPPORTED_TARGETS = {
    ".png": "PNG",
    ".jpg": "JPEG",
    ".jpeg": "JPEG",
}


def sanitize_and_convert(img_path: Path):
    ext = img_path.suffix.lower()

    try:
        with Image.open(img_path) as img:
            real_format = img.format  # e.g., 'HEIF', 'WEBP', 'PNG', 'JPEG'

            # Case 1: File is already a real PNG or JPEG matching its extension
            if ext in SUPPORTED_TARGETS and real_format == SUPPORTED_TARGETS[ext]:
                print(f"  [OK] {img_path.name} is a valid {real_format}")
                return

            # Case 2: File has a .png/.jpg extension, but the internal format is wrong (e.g. HEIC disguised as .png)
            target_format = SUPPORTED_TARGETS.get(ext, "PNG")
            target_path = (
                img_path
                if ext in SUPPORTED_TARGETS
                else img_path.with_suffix(".png")
            )

            print(
                f"  [!] {img_path.name}: Real format is {real_format} -> converting to genuine {target_format}..."
            )

            # Handle color modes
            if target_format == "PNG":
                # PNG supports RGBA (transparency)
                if img.mode not in ("RGB", "RGBA"):
                    converted_img = img.convert("RGBA")
                else:
                    converted_img = img.copy()
                converted_img.save(target_path, "PNG")

            elif target_format == "JPEG":
                # JPEG does not support transparency; composite over white
                if img.mode in ("RGBA", "LA", "P"):
                    bg = Image.new("RGB", img.size, (255, 255, 255))
                    alpha = img.split()[-1] if "A" in img.mode else None
                    bg.paste(img, mask=alpha)
                    converted_img = bg
                else:
                    converted_img = img.convert("RGB")
                converted_img.save(target_path, "JPEG", quality=95)

            # If the original had a different extension (e.g. .heic), remove the old file
            if target_path != img_path:
                img_path.unlink()
                print(f"      Renamed & replaced with: {target_path.name}")

            print(f"  [FIXED] Successfully converted {target_path.name}")

    except Exception as e:
        print(f"  [FAILED] Could not process {img_path.name}: {e}")


def scan_directory(directory: str):
    dir_path = Path(directory)
    if not dir_path.exists():
        print(f"Directory not found: {dir_path}")
        return

    # Find all files in the directory
    all_files = [f for f in dir_path.rglob("*") if f.is_file()]

    # Filter out common non-image files
    image_files = [
        f
        for f in all_files
        if f.suffix.lower()
           in [
               ".png",
               ".jpg",
               ".jpeg",
               ".heic",
               ".webp",
               ".bmp",
               ".tiff",
               ".avif",
           ]
    ]

    print(
        f"Scanning {len(image_files)} image(s) in '{dir_path.resolve()}'...\n"
    )

    for img_path in sorted(image_files):
        sanitize_and_convert(img_path)

    print("\nAll done!")


if __name__ == "__main__":
    # You can pass a path as an argument, or it defaults to common folders
    if len(sys.argv) > 1:
        target_dir = sys.argv[1]
    elif Path("src/assets").exists():
        target_dir = "src/assets"
    elif Path("assets/images").exists():
        target_dir = "assets/images"
    else:
        target_dir = "."

    scan_directory(target_dir)
