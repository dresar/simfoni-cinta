# 🧱 `src/components/` — UI Component Architecture

Direktori ini menaungi seluruh komponen antarmuka pengguna (UI) React dalam sistem Simfoni Cinta. Arsitektur komponen dirancang modular, memisahkan fungsionalitas publik (landing page), dasbor admin, utilitas primitif UI, dan modul interaktif undangan pernikahan.

---

## 📁 Struktur Subdirektori & Komponen

```
src/components/
├── admin/                 # Komponen khusus panel kontrol admin & aset
│   ├── assetDetective/    # Tool Asset Detective (inspeksi template, CDN uploader)
│   └── README.md          # Dokumentasi teknis komponen admin
├── landing/               # Komponen modular halaman muka & promosi (/)
│   └── README.md          # Dokumentasi teknis komponen landing page
├── ui/                    # 35+ Komponen primitif Shadcn UI (Radix UI wrappers)
│   └── README.md          # Dokumentasi teknis komponen UI
├── wedding/               # Komponen interaktif halaman undangan pernikahan
│   └── README.md          # Dokumentasi teknis komponen wedding
├── banks.tsx              # Metadata bank, e-wallet, warna badge, & utilitas amplop
├── kit.tsx                # Master UI Kit presisi (Cards, Buttons, ImageUploader, Header)
├── pwa-install-prompt.tsx # Banner & trigger instalasi Progressive Web App (PWA)
└── README.md              # File ini (indeks arsitektur komponen)
```

---

## 🌟 Komponen Tingkat Root (`src/components/*`)

### 1. `src/components/kit.tsx` (Master UI Kit Presisi)
* **Peran:** Kumpulan komponen UI siap pakai yang mengimplementasikan standar desain presisi (`rounded-[10px]`, compact spacing `p-2.5 sm:p-3`, border tipis, dan non-pill).
* **Komponen yang Diekspor:**
  * `Card`, `CardHeader`, `CardTitle`, `CardDescription`, `CardContent`, `CardFooter`: Kartu konten elegan dengan subtle hover effect.
  * `Button`: Tombol interaktif presisi dengan varian `primary`, `secondary`, `outline`, `ghost`, `danger`, dan ukuran `sm`, `default`, `lg`.
  * `Badge`: Indikator status / tag ringkas.
  * `Input`, `Textarea`: Elemen form input terstandar dengan focus ring lembut.
  * `ImageUploader`: Komponen upload gambar terintegrasi otomatis ke `uploadImageFn` (menyimpan ke CDN / storage GitHub).
  * `PageHeader`: Header halaman standar dasbor dengan tombol navigasi kembali, judul, dan aksi kanan.
  * `PageContainer`: Wrapper layout halaman responsif dengan padding optimal.
  * `EmptyState`: Placeholder informatif saat data kosong.
  * `StatCard`: Kartu metrik / statistik ringkas dengan tren dan ikon.

### 2. `src/components/banks.tsx` (Katalog Bank & E-Wallet)
* **Peran:** Registry daftar bank nasional dan dompet digital untuk pembayaran dan fitur Hadiah / Amplop Digital.
* **Exports Penting:**
  * `BANK_LIST: BankOption[]`: Array bank yang didukung (BCA, Mandiri, BRI, BNI, BSI, CIMB Niaga, Permata, Jago, Dana, GoPay, OVO, ShopeePay, LinkAja, QRIS).
  * `getBankInfo(bankId: string)`: Mengembalikan warna brand, badge CSS, dan nama lengkap bank.

### 3. `src/components/pwa-install-prompt.tsx` (PWA Installer)
* **Peran:** Menangani event browser `beforeinstallprompt` untuk memberikan banner instalasi aplikasi web ke layar utama perangkat mobile (Android/iOS).
* **Perilaku:** Otomatis mendeteksi status instalasi mandiri (*standalone mode*) dan mengingat status penutupan banner di `localStorage`.

---

## 🎨 Standar & Konvensi Desain Komponen untuk AI

1. **Prinsip Tombol & Kartu Presisi:**
   * Sudut melengkung halus: Gunakan `rounded-[8px]` hingga `rounded-[10px]`. Hindari bentuk kapsul / full-pill (`rounded-full`) pada tombol aksi standar kecuali untuk floating action button lingkaran.
   * Kepadatan Kompak: Tinggi tombol ideal adalah `h-9` (36px) atau `h-8` (32px) untuk antarmuka dasbor yang rapi dan efisien ruang.
2. **Strict Nokomen:**
   * Dilarang keras menyisipkan komentar di dalam markup JSX maupun fungsi TypeScript komponen.
3. **Impor yang Konsisten:**
   * Utilitas styling classname selalu menggunakan `cn()` dari `@/lib/utils`.
   * Ikon grafis menggunakan `@phosphor-icons/react` atau `lucide-react`.
