# 🛠️ `src/components/admin/` — Admin Panel & Asset Detective Components

Direktori ini berisi komponen antarmuka yang dikhususkan untuk panel manajemen administrator, khususnya suite **Asset Detective** untuk mengelola, menganalisis, dan menyinkronkan seluruh aset template undangan pernikahan digital ke CDN.

---

## 🔍 Asset Detective Suite (`src/components/admin/assetDetective/`)

Asset Detective adalah sistem inspeksi aset template berkecepatan tinggi yang memetakan file template dari penyimpanan lokal/ZIP, mengkategorikannya ke dalam struktur folder virtual, dan memfasilitasi sinkronisasi ke CDN (GitHub Storage / Cloudflare R2).

### 📋 Daftar Komponen

| File Komponen | Peran & Deskripsi Fungsional |
|---|---|
| `index.ts` | Barrel export yang mengekspor seluruh komponen Asset Detective |
| `TemplateFolderCard.tsx` | Komponen kartu folder yang menampilkan nama folder, jumlah file, ukuran total (KB/MB), badge sinkronisasi CDN, dan tombol aksi cepat |
| `TemplateFolderGrid.tsx` | Grid layout responsif yang merender daftar kategori folder aset (`Cover & Background`, `Ornaments`, `Typography`, `Audio`, dll) |
| `TemplateAssetExplorer.tsx` | Tree explorer mendalam untuk melihat daftar file individual di dalam template beserta pratinjau thumbnail dan tautan CDN |
| `SelectiveCdnUploader.tsx` | Dialog/modal untuk mengunggah file yang dipilih secara batch ke CDN dengan progress bar dan status upload per file |
| `CustomFolderManager.tsx` | Antarmuka untuk membuat, mengubah nama, dan mengelola folder kategori aset khusus per template |
| `TemplateMusicManager.tsx` | Pengelola audio latar belakang khusus per template (pilih lagu default, atur autoplay, dan pratinjau pemutar lagu) |

---

## 🔄 Alur Kerja Asset Detective

```
1. Admin membuka halaman /admin/deteksi-aset
   │
   ▼
2. Server menjalankan `inspectTemplateAssets(slug)` (dari src/server/assetDetective.ts)
   │
   ▼
3. Komponen `TemplateFolderGrid` menerima data `AssetFolder[]`
   │
   ▼
4. Setiap kartu `TemplateFolderCard` menghitung rasio sinkronisasi CDN (isSynced)
   │
   ▼
5. Admin dapat mengklik "Sinkronkan ke CDN" -> Membuka `SelectiveCdnUploader`
   │
   ▼
6. Mengunggah aset ke GitHub Storage API -> URL publik CDN tersimpan ke database Neon
```

---

## 💡 Panduan untuk AI
* Komponen di direktori ini hanya boleh digunakan pada route `/admin/*`.
* Pastikan penanganan state upload selalu memperhitungkan indikator loading dan error toast (`sonner`) jika koneksi ke CDN mengalami rate limiting.
