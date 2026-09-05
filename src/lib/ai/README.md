# 🤖 `src/lib/ai/` — AI Visual Regression & Template Forensic Reconstructor

Direktori ini berisi modul kecerdasan buatan (*multimodal vision*) untuk membandingkan screenshot template undangan asli dengan versi hasil rekonstruksi kode secara pixel-by-pixel, memberikan skor akurasi (0-100), dan menghasilkan rekomendasi perbaikan CSS/HTML otomatis.

---

## 📋 Inventaris Modul

| File | Peran & Deskripsi Fungsional |
|---|---|
| `types.ts` | Kontrak tipe TypeScript untuk analisis visual diff: `DiffIssue`, `DiffSummary`, `DiffAnalysis`, `CodePatch`, `FixResult`, dan `IterationState`. |
| `visual-diff.ts` | Mesin inspeksi visual berbasis AI Vision: membaca dua buffer gambar (asli vs rekonstruksi), menyusun prompt perbandingan piksel ketat, memanggil model multimodal, dan memetakan isu ke dalam kategori `layout`, `color`, `typography`, `effects`, atau `content`. |

---

## 📐 Formula Penilaian & Kategori Masalah

Sistem memberikan skor kepatuhan desain dari 0 hingga 100 dengan formula penalti:

$$\text{Score} = \max(0, 100 - (\text{High} \times 5 + \text{Medium} \times 2 + \text{Low} \times 1))$$

### Tingkat Keparahan (Severity):
* **`high` (Penalti -5):** Kerusakan struktural, elemen hilang, warna kontras salah total, font hierarchy patah.
* **`medium` (Penalti -2):** Masalah jarak margin/padding, alignment melenceng, perbedaan bayangan/blur, perbedaan tebal font (*font weight*).
* **`low` (Penalti -1):** Pergeseran posisi mikro (< 3px), perbedaan halus opasitas (*subtle opacity*), pergeseran hue warna sangat tipis.

---

## 💡 Panduan untuk AI
* Modul ini digunakan pada pipeline rekonstruksi template otomatis (*forensic recloner*) untuk memastikan template hasil kloning atau kustomisasi memiliki kesamaan visual di atas ambang batas 90% sebelum dipublikasikan ke katalog.
