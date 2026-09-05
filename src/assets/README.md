# 🎨 `src/assets/` — Static Image & Media Assets

Direktori ini berisi seluruh aset media statis yang digunakan langsung oleh komponen React dalam bundel frontend aplikasi, seperti logo platform, ilustrasi perangkat responsif, thumbnail template pernikahan, dan gambar artikel blog.

---

## 📋 Inventaris File Aset

| Nama File | Format | Ukuran | Kegunaan Utama | Lokasi Penggunaan |
|---|---|---|---|---|
| `logo.png` | PNG | ~400 KB | Logo resmi Simfoni Cinta / Aksara Cinta | Navbar, Footer, OpenGraph, PWA |
| `hero-devices.jpg` | JPG | ~54 KB | Mockup multi-device smartphone di section Hero | `src/components/landing/hero.tsx` |
| `devices-showcase.jpg` | JPG | ~165 KB | Ilustrasi showcase undangan di berbagai layar | `src/components/landing/sections-a.tsx` |
| `cta-banner.jpg` | JPG | ~99 KB | Background banner ajakan bertindak (CTA) | `src/components/landing/sections-b.tsx` |
| `admin-team.jpg` | JPG | ~36 KB | Foto tim dukungan operasional & avatar admin | Halaman tentang & profil admin |
| `blog-1.jpg` | JPG | ~82 KB | Thumbnail artikel: "Tips Memilih Undangan Digital" | `src/routes/berita.index.tsx` |
| `blog-2.jpg` | JPG | ~55 KB | Thumbnail artikel: "Panduan Rundown Acara Pernikahan" | `src/routes/berita.index.tsx` |
| `blog-3.jpg` | JPG | ~83 KB | Thumbnail artikel: "Etika Mengirim Undangan Online" | `src/routes/berita.index.tsx` |

### 🖼️ Thumbnail Template Undangan (`tpl-*.jpg`)

Katalog thumbnail preview untuk selector template di landing page dan dasbor:

| File Thumbnail | Tema Desain | Karakteristik Visual |
|---|---|---|
| `tpl-butterfly.jpg` | Butterfly Theme | Nuansa kupu-kupu anggun, warna pastel lembut |
| `tpl-floral.jpg` | Floral Botanical | Hiasan dedaunan hijau botani dan bunga mekar |
| `tpl-islamic.jpg` | Islamic Elegance | Ornamen kaligrafi, kubah masjid, aksen emas |
| `tpl-korean.jpg` | Korean Aesthetic | Minimalis hangat, tipografi modern khas Seoul |
| `tpl-luxury.jpg` | Royal Luxury | Dominasi warna gelap, foil gold mewah dan glamor |
| `tpl-matcha.jpg` | Matcha Earthy | Palet warna hijau sage / matcha yang menenangkan |
| `tpl-minimalist.jpg` | Clean Minimalist | Monokrom, fokus pada tipografi serif bersih |
| `tpl-modern.jpg` | Contemporary Modern | Layout asimetris dengan interaksi cards kontemporer |
| `tpl-rustic.jpg` | Rustic Wooden | Aksen kayu, bunga kering, dan palet cokelat hangat |
| `tpl-traditional.jpg` | Nusantara Heritage | Ornamen batik, songket, dan adat tradisional |

---

## 🛠️ Panduan & Kebijakan Aset untuk AI

1. **Importing dalam Komponen:**
   * Selalu import aset gambar menggunakan path alias Vite:
     ```tsx
     import heroDevices from "@/assets/hero-devices.jpg";
     import logoImg from "@/assets/logo.png";
     ```
2. **Aset Statis Eksternal vs Internal:**
   * Gambar statis di folder ini adalah aset bawaan antarmuka web.
   * File aset template undangan pihak ketiga (seperti audio MP3, background berukuran besar, atau file ZIP mentah) disimpan di CDN (GitHub Storage / Cloudflare R2) dan dikelola melalui service `src/server/upload.ts` atau `src/server/assetDetective.ts`.
3. **Format yang Disarankan:**
   * Untuk penambahan aset baru, prioritaskan format modern berbobot ringan seperti WebP atau SVG teroptimasi agar meminimalkan ukuran transfer bundel aplikasi.
