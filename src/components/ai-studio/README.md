# 🤖 `src/components/ai-studio/` — AI-Powered Automated Invitation Studio

Direktori ini menaungi arsitektur **AI Template Studio & Engine** (`/admin/templates-ai`). Studio ini dirancang untuk merancang, menguji, dan menghasilkan template undangan pernikahan digital interaktif secara otomatis dengan pemisahan tegas antara **1 Master Preset** dan **Katalog Templates**.

---

## 🏗️ Pola Arsitektur Studio

```
[Admin Panel Sidebar: "Templates Powered by AI"]
        │ (Klik membuka tab baru target="_blank")
        ▼
[src/routes/admin.templates-ai.tsx] (Studio Route)
        ├── [Header Toolbar] (Device Switcher, Template Selector, Generate Action)
        ├── [AssetSlotInspector.tsx] (Panel Kiri: Pemetaan Slot Aset & Parameter Dinamis)
        └── [StudioSimulator.tsx] (Panel Tengah: Phone Frame Simulator & Desktop Canvas)
                    │
                    ▼ (Merender 1 Master Preset dengan Data dari Template)
        [src/components/ai-studio/presets/Preset001.tsx] (Satu-satunya Master Preset)
                    ▲
                    │ (Memasok Aset, Tema, & Data Mempelai)
        [src/components/ai-studio/templates/registry.ts]
        ├── [TemplateAdatBatak.tsx] (Adat Batak Ulos & Rumah Bolon)
        ├── [TemplateAcehJawa.tsx]  (Nusantara Heritage Aceh x Jawa)
        ├── [TemplateAdatAceh.tsx]  (Adat Aceh Pinto Aceh & Meuligoe)
        └── [TemplateNusantaraAcehJawa.tsx]
```

---

## 📋 Inventaris Modul

| Modul | File | Peran & Deskripsi Fungsional |
|---|---|---|
| **Types & Contracts** | `types.ts` | Definisi TypeScript type untuk `AssetSlots`, `InvitationData`, `PresetThemeTokens`, `AnimationSettings`, `ViewportDevice`, dan `TemplatePresetMeta`. |
| **Master Preset 001** | `presets/Preset001.tsx` | **Satu-satunya Master Preset Engine**. Menangani 11 slide carousel, animasi keluar-masuk, floating action stack, sliding bottom dock, QR code modal tamu, audio player vinyl, dan form RSVP. |
| **Floating Action Stack** | `components/FloatingActionStack.tsx` | Stack tombol melayang: WhatsApp (`#25D366`), QR Code Presensi Tamu, Autoplay (Play/Pause otomatis scroll/pindah halaman), dan Vinyl Music Player 360° (1 tombol musik). |
| **Guest QR Modal** | `components/GuestQrModal.tsx` | Modal pop-up QR Code digital untuk presensi kehadiran cepat tamu undangan saat tiba di lokasi resepsi. |
| **Sliding Bottom Dock** | `components/SlidingBottomDock.tsx` | Navigasi dock bawah dengan 5 tombol terlihat (lebar 20% proporsional), auto-center scrolling mengikuti slide aktif. |
| **Simulator Frame** | `StudioSimulator.tsx` | Simulator perangkat responsif (375px, 430px, Tablet 768px) dengan zoom scaler (70%-130%) dan tombol restart cover. |
| **Slot & Data Inspector**| `AssetSlotInspector.tsx` | Panel kontrol interaktif untuk memetakan slot aset, mengedit data mempelai/acara/rekening/WhatsApp, memilih palet warna, dan mengatur animasi. |
| **Templates Directory** | `templates/` | Folder khusus berisi seluruh variasi template kultural (`TemplateAdatBatak`, `TemplateAcehJawa`, `TemplateAdatAceh`, `TemplateNusantaraAcehJawa`, dan `registry.ts`). |

---

## 🛡️ Aturan Strict Zero Hardcode
* Tidak ada teks nama, tanggal, lokasi, ayat, nomor rekening, nomor WhatsApp, atau URL gambar yang di-hardcode di dalam JSX.
* Seluruh konten mengalir secara dinamis melalui props `data: InvitationData`, `assets: AssetSlots`, dan `theme: PresetThemeTokens` ke dalam `Preset001`.
