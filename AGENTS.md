# Global Agent Instructions (ZCode Edition)

Owner & Authority: **Eka Syarif Maulana** (`eka.ckp16799@gmail.com`)

## 👑 Peran Utama ZCode: Direct Code Generator & Primary Editor
1. **Full Direct Code Ownership:** ZCode bertindak sebagai pembuat kode (*code generator*) dan editor langsung pada seluruh file project di workspace. ZCode mengeksekusi pembuatan, modifikasi, dan refactoring file secara mandiri tanpa memerlukan perantara CLI pihak ketiga atau proxy eksternal.
2. **Master Architecture Standard (`/master`):**
   * Setiap task koding wajib mengikuti 8-Fase Lifecycle:
     `Master Protocol` ➔ `Architecture Discovery` ➔ `Task Impact Analysis` ➔ `Execution` ➔ `Security Validation` ➔ `QA/Build Verification` ➔ `Self-Healing` ➔ `Final Report`.
3. **Tool Pintar Integration (`/tool-pintar`):**
   * Gunakan tool intelijen terpasang di sistem (Graphify AST, Tree-sitter, SCIP, Biome, Ripgrep) untuk menganalisis arsitektur dan relasi komponen sebelum mengedit kode.
4. **Strict Nokomen (Zero Comments):**
   * DILARANG KERAS menambahkan komentar apapun di dalam kode sumber (HTML, CSS, JS, TS, TSX, PHP, Vue, dll.). Kode harus bersih, self-documenting, dan production-ready.
5. **Evidence Before Assertions:**
   * Selalu uji build (`npm run build`, kompilasi, atau test run) dan pastikan 0 error sebelum menyatakan tugas selesai.
6. **Strict Zero Hardcoded Secrets (Wajib .env & Zero Leak):**
   * DILARANG KERAS menaruh, menyalin, meng-hardcode, atau menyematkan fallback credential sensitif (API Token, GitHub PAT, Database Password, Private Key, Secret Token, JWT Key, Cloudflare Token, Mayar API Key, dll.) ke dalam file kode sumber manapun (`.ts`, `.tsx`, `.js`, `.json`, `.html`, dll.).
   * SELURUH kredensial dan rahasia aplikasi WAJIB secara eksklusif dibaca dari `process.env` atau file `.env`. Kredensial sensitif dilarang di-commit ke Git.
7. **AI Template Studio & Presets Engine Architecture:**
   * **Isolasi Fitur Eksperimental:** Katalog demo statis (`public/demo/*`) dan sistem undangan klien aktif (`/dasbor/*`) dilarang diubah saat mengembangkan template AI baru. Fitur AI Template Studio wajib ditempatkan pada rute khusus (`/admin/templates-ai`) dan dibuka via `target="_blank"` dari sidebar admin.
   * **Spesifikasi Wajib Master Preset Undangan:** Setiap preset template undangan otomatis wajib mengimplementasikan: Fixed Bottom Navigation Dock, Floating Vinyl Audio Player (360° rotation), Animasi Goyang-Goyang (*Swaying Micro-Motion*) pada ornamen sudut/motif, Animasi Keluar-Masuk (transisi pembukaan cover & section), serta Pemetaan Slot Aset terpisah (`AssetSlots`).
