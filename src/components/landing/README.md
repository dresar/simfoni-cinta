# 🌸 `src/components/landing/` — Marketing & Landing Page Components

Direktori ini berisi seluruh komponen presentasional dan interaktif modular yang menyusun halaman beranda publik (`/`), etalase katalog tema, komparasi fitur, paket harga, dan optimasi SEO / AI search engine.

---

## 📋 Inventaris Komponen

| File Komponen | Peran Fungsional & Penjelasan Teknis |
|---|---|
| `navbar.tsx` | Sticky glassmorphic navigation header, logo link, menu navigasi anchor (`#tema`, `#harga`, `#fitur`, `#faq`), tombol login/dasbor, dan drawer menu responsif mobile. |
| `hero.tsx` | Section pembuka dengan 2 kolom: headline romantis, typing-cycle text animasi, CTA utama (Buat Undangan Gratis / Coba Demo), serta mockup smartphone interaktif. |
| `sections-a.tsx` | Showcase katalog tema undangan terpopuler (filter kategori: Tradisional, Modern, Religius, Luxury), bento grid fitur unggulan, dan integrasi WhatsApp blast. |
| `sections-b.tsx` | Kartu paket harga (Silver, Gold, Platinum), kalkulator hemat biaya, testimonial review carousel, FAQ interaktif, CTA penutup, dan footer multi-kolom. |
| `ai-seo-sections.tsx` | Blok konten terstruktur khusus AI Answer Engine (Perplexity/ChatGPT/Gemini/Google SGE): ringkasan definisi platform, tabel perbandingan undangan digital vs cetak, arsitektur entitas, dan FAQ teknis. |
| `section-heading.tsx` | Komponen tipografi heading standar yang konsisten (badge kategori kecil, judul font serif elegan, dan subjudul deskriptif). |
| `reveal.tsx` | Wrapper animasi scroll-reveal halus berbasis `IntersectionObserver` dengan dukungan prop `delay` dan durasi transisi yang ringan. |
| `floating-wa.tsx` | Floating action button (FAB) WhatsApp di pojok kanan bawah untuk chat langsung dengan customer service / helpdesk. |
| `mobile-bottom-nav.tsx` | Navigasi bawah mengambang (*bottom tab bar*) khusus tampilan layar smartphone untuk akses cepat menu utama. |
| `LivePurchaseNotification.tsx` | Widget notifikasi social proof mengambang yang menampilkan pembelian paket secara berkala untuk meningkatkan konversi. |
| `icons.tsx` | Kumpulan icon SVG kustom dan wrapper ikon Phosphor untuk landing page (Sparkle, Leaf, Check, Wallet, Send, Music, dll). |
| `data.ts` | Static dataset fallback untuk katalog tema awal, testimonial pembeli, rincian fitur paket harga, dan daftar pertanyaan umum (FAQ). |

---

## 🎯 Struktur Hirarki Halaman Beranda (`src/routes/index.tsx`)

Komponen-komponen di atas dirangkai pada `src/routes/index.tsx` dengan urutan sebagai berikut:

```
<Navbar />
  ├── <Hero />
  ├── <AiSeoOverview />            (AI Search Snippet Extraction Block)
  ├── <SectionsA.ShowcaseThemes />  (Katalog Tema & Preview)
  ├── <SectionsA.FeaturesBento />   (Grid Fitur Unggulan)
  ├── <AiSeoComparison />          (Komparasi Digital vs Cetak)
  ├── <SectionsB.PricingSection />  (Paket Harga Silver/Gold/Platinum)
  ├── <SectionsB.Testimonials />    (Review Pengantin Bahagia)
  ├── <SectionsB.FaqSection />      (Accordion Pertanyaan Umum)
  ├── <AiSeoEntityArchitecture />   (Data Entitas & Spesifikasi Platform)
  └── <SectionsB.Footer />
<MobileBottomNav />
<FloatingWa />
<LivePurchaseNotification />
```

---

## 💡 Konvensi Styling & Performa untuk AI
* **Glassmorphism:** Gunakan utilitas CSS `backdrop-blur-md bg-background/80 border border-border/50` untuk efek modern premium.
* **Performa Scroll:** Komponen animasi `Reveal` menggunakan threshold native tanpa library animasi berat untuk memastikan skor Core Web Vitals (LCP & CLS) tetap optimal di perangkat mobile.
