# Spec Sheet — Haashiya Homepage (Mobile)

Dokumen ini adalah spesifikasi teknis untuk AI code generator. Rujuk gambar `draft_v1.png` sebagai sumber visual utama; dokumen ini melengkapi dengan nilai presisi yang tidak bisa ditebak dari piksel.

## 0. Global settings

```
Direction: RTL (right-to-left) — seluruh halaman, termasuk navbar dan alignment teks
Viewport target: 375px width (mobile-first), scale 2x untuk asset (750px)
Base font size: 16px
Grid spacing unit: 8px (semua spacing kelipatan 8)
```

## 1. Color tokens

```css
--color-primary-500: #2471ea;   /* tombol, elemen interaktif utama */
--color-primary-600: #1359c8;   /* brand color dasar (referensi awal) */
--color-primary-700: #2471ea;   /* hero gradient bawah, footer bg */
--color-primary-hero-start: #0f459b #2471ea; /* hero gradient atas */
--color-ink: #061b3c;           /* teks gelap/heading */
--color-stone: #9f9893;         /* teks sekunder, meta info */
--color-surface: #ffffff;       /* card, navbar bg */
--color-surface-tint: #f0f6ff;  /* background section bergantian */
--color-white-text: #ffffff;    /* teks di atas background biru */
```


## 2. Typography

```css
--font-primary: 'Work Sans', sans-serif;      /* semua teks Latin/Indonesia */
--font-arabic: 'IBM Plex Sans Arabic', sans-serif; /* semua teks Arab */

--text-h1: 56px / 700 / line-height 1.3;   /* judul hero */
--text-h2: 37px / 700 / line-height 1.3;   /* judul section: "خدمات التعلم", dst */
--text-h3: 27px / 600 / line-height 1.4;   /* judul card, judul item list */
--text-body: 16px / 400 / line-height 1.6; /* deskripsi, sublabel */
--text-meta: 16px / 400 / line-height 1.4; /* "المرجع الرئيس • مادة البلاغة" */
--text-button: 27px / 600 / line-height 1; /* teks tombol */
```

Font Arab dipakai untuk SEMUA teks konten (judul, deskripsi, label tombol) karena bahasa halaman ini Arab. Font Latin (Work Sans) dipakai untuk elemen non-Arab yang muncul (contoh: label "PDF", "DOCX", nama file berbahasa Indonesia seperti "BAHASA INDONESIA AKADEMIK", tanggal "15 Desember 2026", username developer di footer).

## 3. Layout structure (top to bottom)

```
[Navbar]              height: 90px, sticky top
[Hero]                height: 360px
[Section: Layanan]    padding: 50px 20px
[Section: Bahan Ajar] padding: 50px 20px
[Section: Glossary]   padding: 50px 20px
[Section: Kalender]   padding: 50px 20px
[Footer]              padding: 50px 20px
```

## 4. Component specs

### 4.1 Navbar
```
Height: 90px
Background: var(--color-surface)
Padding: 0 20px
Layout: flex, justify-content: space-between, align-items: center
Kiri (karena RTL, ini sisi visual kanan): Wordmark, Kanan (visual kiri): tombol "تسجيل الدخول" (Login)
  - Background: var(--color-ink) atau near-black
  - Text color: white
  - Border-radius: 20px (pill)
  - Padding: 8px 18px
  - Font: var(--font-arabic), 27px, 600
Logo teks "حاشية": navbar_logo.png
```

### 4.2 Hero
```
Background: hero_bg.png
Padding: 40px 20px 32px

Struktur vertikal:
  1. H1 (2 baris): "بوابتنا لتعلم اللغة العربية"
     - color: white, text-h1, text-align: right (RTL)
  2. Subheading: "الانخراط في أجواء التعلم في أي وقت ومكان"
     - color: rgba(255,255,255,0.85), text-body, margin-top: 8px
  3. Button "ادرس الآن ←" (Mulai Belajar)
     - margin-top: 20px
     - Background: white
     - Text color: var(--color-primary-600)
     - Border-radius: 24px (pill)
     - Padding: 10px 24px
     - Font: text-button
     - Icon panah di kiri teks (arah RTL, panah mengarah ke kiri "←")
```

### 4.3 Section title (pola berulang untuk semua section)
```
Font: text-h2
Color: var(--color-ink)
Text-align: center
Margin-bottom: 16px
Contoh isi: "خدمات التعلم", "المواد التعليمية", "معجم المصطلحات", "التقويم الأكاديمي"
```

### 4.4 Card grid — Layanan (Services)
```
Layout: CSS Grid, grid-template-columns: 1fr 1fr, gap: 12px
Jumlah card: 4 (Galeri Arsip, Perpustakaan Digital, AI Learning Tools, Bahan Ajar)

Per card:
  Border-radius: 12px
  Overflow: hidden
  Background: white
  Border: 0.5px solid rgba(52,48,45,0.1)

  Bagian atas card (foto):
    Height: ~90px
    Background-image: foto placeholder (gedung/ruang kelas), object-fit: cover
    Overlay gradient: linear-gradient(to bottom, transparent, var(--color-primary-600) 90%) opacity 0.7
      — ini untuk efek foto "diwarnai biru" seperti di referensi

  Bagian bawah card (konten):
    Padding: 14px
    Judul: text-h3, color var(--color-ink), text-align: right
    Link "انظر التفاصيل ←": text-meta, color var(--color-stone), margin-top: 6px, dengan ikon panah kiri
```

### 4.5 List item — Bahan Ajar / Kalender (bentuk jajaran genjang/parallelogram miring)
```
PERHATIAN KHUSUS: bentuk item di referensi BUKAN persegi biasa — sisi kiri item
dipotong miring (skew), menciptakan efek parallelogram/panah halus.

Teknik CSS yang disarankan:
  clip-path: polygon(20px 0, 100% 0, 100% 100%, 0 100%);
  atau gunakan pseudo-element ::before dengan transform: skewX()

Per item:
  Background: white
  Padding: 14px 20px
  Margin-bottom: 8px
  Layout: flex, justify-content: space-between, align-items: center

  Kiri (visual kanan karena RTL): badge tipe file
    - Ukuran: 44px x 44px
    - Background: var(--color-primary-500)
    - Border-radius: 8px
    - Text: "PDF" / "DOCX", color white, font Work Sans, 11px, 700, text-align center

  Kanan (visual kiri): teks
    - Judul: text-h3, color var(--color-ink)
    - Meta: text-meta, color var(--color-stone), format "[kategori] • [mata kuliah]"
      contoh: "المرجع الرئيس • مادة البلاغة"

Untuk section Kalender, badge PDF/DOCX diganti dengan strip warna vertikal solid
(var(--color-primary-500)) di sisi kanan/kiri item, lebar ~6-8px, tanpa teks.
```

### 4.6 Glossary search box
```
Container:
  Background: var(--color-primary-600) atau gradient serupa hero
  Border-radius: 16px
  Padding: 20px
  Min-height: ~160px (ruang untuk hasil pencarian di bawah search bar)

Search bar (di dalam container):
  Background: white
  Border-radius: 24px (pill)
  Padding: 10px 16px
  Layout: flex, align-items: center, justify-content: space-between
  Placeholder text: "بحث" (Cari), text-align: right, color var(--color-stone)
  Tombol "+" di kiri search bar:
    - Ukuran: 32px x 32px
    - Background: var(--color-ink) atau near-black
    - Border-radius: 8px
    - Icon "+" warna putih, center

Area hasil di bawah search bar: kosong/placeholder pada kondisi awal (empty state),
sediakan garis vertikal tipis di tengah sebagai divider dekoratif (opsional,
sesuai referensi visual)
```

### 4.7 Footer
```
Background: footer_bg.png
Padding: 40px 20px
Text-align: center
Color teks: rgba(255,255,255,0.75)

Struktur:
  1. Logo mark + wordmark "حاشية": footer_logo.png
  2. Deskripsi singkat 2 baris, text-body, color rgba(255,255,255,0.85)
     "موقع إلكتروني غير ربحي يهدف إلى تلبية احتياجات التعلم
      لطلاب برنامج الأدب العربي في LIPIA (الدفعة التاسعة عشرة)"
  3. Divider tipis (opsional)
  4. Credit line, text-meta, font Work Sans (karena berisi username Latin):
     "من تطوير @iqlbaihaqi_"
     "من تصميم @anggareksa__"
```

## 5. Interaksi & state (untuk developer, bukan sekadar visual statis)

```
- Tombol "تسجيل الدخول" → trigger modal/halaman login
- Tombol "ادرس الآن" → scroll ke section Layanan atau navigasi ke halaman utama fitur
- Card Layanan (4 card) → masing-masing link ke halaman fitur terkait:
    Galeri Arsip → /galeri-arsip
    Perpustakaan Digital → /perpustakaan
    AI Learning Tools → /ai-tools (redirect eksternal ke NotebookLM, lihat catatan produk)
    Bahan Ajar → /bahan-ajar
- Item list Bahan Ajar → klik membuka PDF viewer (flipbook) sesuai fitur Perpustakaan Digital
- Search box Glossary → live search/filter terhadap database istilah, hasil muncul di area bawah search bar
- Item Kalender → klik membuka detail agenda (opsional, bisa juga murni display-only)
```

## 6. Catatan khusus untuk AI generator

```
1. RTL WAJIB diterapkan di level HTML: <html dir="rtl" lang="ar">
   Semua flex/grid direction otomatis terbalik — jangan hardcode margin-left/right,
   gunakan margin-inline-start/end atau logical properties.

2. Font Arab (IBM Plex Sans Arabic) HARUS di-load dengan subset Arabic,
   bukan cuma Latin — pastikan font-display: swap untuk performa.

3. Bentuk parallelogram/skew pada list item (poin 4.5) adalah elemen SIGNATURE
   dari desain ini — jangan disederhanakan jadi kotak biasa tanpa konfirmasi,
   karena ini pembeda visual utama dari template web generik.

4. Konten di gambar referensi (nama dosen, judul modul, tanggal) adalah CONTOH,
   bukan data final — struktur data harus dinamis, generate dari database
   bukan hardcoded.

5. Insufficient data to verify: apakah "AI Learning Tools" di card layanan
   redirect eksternal ke NotebookLM atau custom flashcard/quiz internal —
   ini keputusan produk yang sudah dibahas terpisah, developer perlu
   konfirmasi ulang sebelum implementasi.
```
