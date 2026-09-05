# Preset 001 Agent Rules & Architecture Standard

## 1. Bottom Navigation Dock Specification
- **Separated Item Layout:** All buttons in the navigation dock MUST remain individual, separated elements with explicit dimensions (`w-[66px] h-[68px]` for inactive, `w-[76px] h-[68px]` for active).
- **Prohibition:** DILARANG KERAS menggunakan `flex-1 min-w-0` yang menyebabkan seluruh item menu menyatu, berhimpitan, dan teks saling menabrak seperti bar sempit.
- **Active State:** The active item MUST render as a prominent rounded squircle card (`rounded-[20px]`) filled with the active theme color (`theme.menuActive` / `#BC9A53`) with dark contrasting icon and label.
- **Horizontal Scroll & Auto-Centering:** The dock container MUST use `overflow-x-auto no-scrollbar scroll-smooth px-3 gap-2`. Active items MUST automatically scroll into the center of the viewport via `scrollIntoView` or `container.scrollTo`.

## 2. Morph Slide & Image Transitions Standard
- **Prohibited Animation:** DILARANG KERAS menggunakan animasi fade-in zoom/scale yang membesar dari ukuran kecil ke besar (`scale(0.8)` -> `scale(1)` atau `scale-up`).
- **Mandatory Motion (PowerPoint Morph Style):** Seluruh transisi perpindahan slide dan komponen WAJIB bergerak secara lateral (horizontal slide) dari kanan atau kiri ke posisi layout frame di tengah:
  - Navigasi maju: Slide baru masuk dari kanan (`translate3d(70px, 0, 0)` -> `translate3d(0, 0, 0)`).
  - Navigasi mundur: Slide baru masuk dari kiri (`translate3d(-70px, 0, 0)` -> `translate3d(0, 0, 0)`).
- **Component & Image Entrance:**
  - Groom Photo / Venue Card / Left Element: WAJIB menggunakan `animate-image-from-left`.
  - Bride Photo / Maps Card / Right Element: WAJIB menggunakan `animate-image-from-right`.
  - Staggered Gallery: Grid foto bergantian masuk dari sisi kiri dan kanan secara harmonis.
- **Slide Remount Requirement:** Setiap div container slide wajib memiliki `key={activeSlide}` dan kelas animasi dinamis `${slideAnimClass}` agar React memicu ulang animasi saat slide berganti.

## 3. Floating Action Stack Specification
- **Uniform Dimensions:** Semua tombol aksi melayang (WhatsApp, QR Tamu, Pemutar Audio, Autoplay) WAJIB berukuran seragam 44px lingkaran penuh (`w-11 h-11 rounded-full`).
- **Layering & Hit-Area:** Pointer events harus presisi tanpa menghalangi interaksi konten utama undangan.

## 4. Template-Preset Contract
- Preset 001 adalah mesin rendering terisolasi. Seluruh data aset (`AssetSlots`), tema warna (`PresetThemeTokens`), data undangan (`InvitationData`), dan konfigurasi animasi (`AnimationSettings`) WAJIB diatur dan dikirim oleh Template yang ada di `src/components/ai-studio/templates/`.
- Presets dilarang melakukan hardcoding data teks atau URL media klien.

## 5. Strict Nokomen Standard
- DILARANG menyertakan komentar apapun di dalam kode sumber TypeScript, TSX, atau CSS.
