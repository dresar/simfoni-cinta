# 🎨 `src/components/ui/` — Design System & Shadcn UI Primitives

Direktori ini berisi pustaka komponen primitif antarmuka berbasis **Shadcn UI** yang dibangun di atas fondasi **Radix UI** dan distilasi dengan **Tailwind CSS**. Komponen di sini bertindak sebagai blok bangunan dasar (*atoms*) untuk seluruh halaman, form, modal, dan dasbor di Simfoni Cinta.

---

## 📋 Katalog Komponen UI Primitif

| Komponen | File | Deskripsi & Kegunaan |
|---|---|---|
| **Button** | `button.tsx` | Tombol interaktif presisi (`default`, `destructive`, `outline`, `secondary`, `ghost`, `link`). |
| **Card** | `card.tsx` | Kontainer kartu konten (`Card`, `CardHeader`, `CardTitle`, `CardDescription`, `CardContent`, `CardFooter`). |
| **Dialog & Modal** | `dialog.tsx`, `alert-dialog.tsx`, `drawer.tsx` | Dialog pop-up modal, dialog konfirmasi peringatan, dan drawer mobile geser bawah. |
| **Form Controls** | `input.tsx`, `textarea.tsx`, `select.tsx`, `checkbox.tsx`, `radio-group.tsx`, `switch.tsx`, `slider.tsx` | Elemen input data, textarea multiline, dropdown select, switch toggle, dan slider. |
| **OTP Input** | `input-otp.tsx` | Input kode verifikasi OTP 6-digit untuk otentikasi login tanpa password. |
| **Navigation** | `navigation-menu.tsx`, `menubar.tsx`, `breadcrumb.tsx`, `pagination.tsx` | Navigasi menu desktop, bilah menu tingkat atas, rekam jejak breadcrumb, dan kontrol paginasi data. |
| **Feedback & Status** | `alert.tsx`, `badge.tsx`, `progress.tsx`, `skeleton.tsx`, `sonner.tsx` | Kotak info peringatan, lencana status, progress bar, skeleton loading, dan toast notifikasi `sonner`. |
| **Overlay & Popover** | `popover.tsx`, `tooltip.tsx`, `hover-card.tsx`, `dropdown-menu.tsx`, `context-menu.tsx` | Floating popover, tooltip bantuan saat hover, preview kartu, dan menu klik kanan. |
| **Layout & Structure** | `accordion.tsx`, `collapsible.tsx`, `sheet.tsx`, `sidebar.tsx`, `tabs.tsx`, `table.tsx`, `separator.tsx`, `scroll-area.tsx`, `resizable.tsx` | Panel akordeon, panel buka-tutup, slide-over sheet samping, sistem sidebar dasbor, tab navigasi, tabel data, garis pemisah, dan area scroll kustom. |
| **Media & Display** | `avatar.tsx`, `aspect-ratio.tsx`, `carousel.tsx`, `chart.tsx` | Foto profil avatar pengguna, kontainer rasio aspek video/gambar, slider carousel, dan visualisasi grafik/chart. |
| **Form Wrapper** | `form.tsx`, `label.tsx` | Integrasi `react-hook-form` + validasi skema `zod` dengan label aksesibel. |

---

## 🛠️ Aturan & Praktik Penggunaan untuk AI

1. **Penggunaan `cn()`:**
   * Setiap modifikasi kelas styling kustom pada komponen UI WAJIB menggunakan helper utilitas:
     ```tsx
     import { cn } from "@/lib/utils";
     <Button className={cn("mt-4", isExtra && "shadow-lg")}>Simpan</Button>
     ```
2. **Kesesuaian Desain:**
   * Jangan mengutak-atik logic internal Radix UI di dalam file komponen ini tanpa alasan kuat. Gunakan prop-prop standar (`variant`, `size`, `asChild`).
   * Tombol aksi standar diutamakan memakai `size="sm"` atau `size="default"` sesuai panduan desain presisi.
3. **Penyatuan Notifikasi:**
   * Untuk menampilkan toast notifikasi aksi (sukses/gagal), selalu gunakan `toast` dari `sonner` (`import { toast } from "sonner"`).
