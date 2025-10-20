import pandas as pd
import requests
import os

# === Config ===
CSV_PATH = "items_rows.csv"  # file CSV gốc
OUTPUT_CSV = "items_rows_1.csv"  # file CSV sau khi cập nhật
OUTPUT_DIR = "../data/media"  # thư mục gốc để lưu file

# Tạo thư mục lưu ảnh và video
os.makedirs(f"{OUTPUT_DIR}/image", exist_ok=True)
os.makedirs(f"{OUTPUT_DIR}/video", exist_ok=True)

# Đọc dữ liệu
df = pd.read_csv(CSV_PATH)

# Biến đếm để đặt tên file
image_count = 1
video_count = 1

# Duyệt từng dòng trong CSV
for i, row in df.iterrows():
    media_url = row["media_url"]
    media_type = row["media_type"]
    file_ext = os.path.splitext(media_url)[-1].split("?")[0] or ".jpg"

    # Bỏ qua dòng không có URL
    if pd.isna(media_url) or not media_url.startswith("http"):
        continue

    try:
        # Tải file
        print(f"🔹 Downloading {media_url} ...")
        response = requests.get(media_url, timeout=15)
        response.raise_for_status()

        # Đặt tên file
        if media_type == "image":
            filename = f"image{image_count}{file_ext}"
            filepath = f"{OUTPUT_DIR}/image/{filename}"
            rel_path = f"/assets/data/media/image/{filename}"
            image_count += 1
        elif media_type == "video":
            filename = f"video{video_count}{file_ext}"
            filepath = f"{OUTPUT_DIR}/video/{filename}"
            rel_path = f"/assets/data/media/video/{filename}"
            video_count += 1
        else:
            # Trường hợp media_type khác (nếu có)
            continue

        # Lưu file
        with open(filepath, "wb") as f:
            f.write(response.content)

        # Cập nhật cột trong dataframe
        df.at[i, "media_url"] = rel_path

    except Exception as e:
        print(f"⚠️ Lỗi tải {media_url}: {e}")

# Lưu CSV mới
df.to_csv(OUTPUT_CSV, index=False, encoding="utf-8-sig")
print(f"\n✅ Hoàn tất! File mới: {OUTPUT_CSV}")
