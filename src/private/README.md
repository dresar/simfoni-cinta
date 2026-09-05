# 🔒 `src/private/` — Codebase Intelligence & Graphify Knowledge Graph

Direktori ini berisi artefak internal arsitektur kode, data analisis sintaksis (AST), dan indeks relasi komponen yang dihasilkan oleh sistem intelijen **Graphify**. Direktori ini digunakan oleh rute `/admin/arsitektur` untuk merender peta visual arsitektur sistem kepada developer dan administrator.

---

## 📋 Struktur & Inventaris

```
src/private/
└── graphify/
    ├── stats.json               # Ringkasan metrik: God Nodes, Komunitas Modul, Total Node & Edge
    ├── graph.json               # Struktur data graf lengkap (nodes, edges, cluster)
    ├── manifest.json            # Manifest file yang terindeks dalam knowledge graph
    ├── GRAPH_REPORT.md          # Laporan teks analisis arsitektur & dependensi
    ├── graph.html               # Visualisasi graf interaktif 2D/3D berbasis WebGL/Canvas
    ├── CALLFLOW.html            # Visualisasi pohon pemanggilan fungsi (call flow)
    ├── GRAPH_TREE.html          # Visualisasi hirarki folder & keterkaitan berkas
    └── cache/                   # Cache AST (Abstract Syntax Tree) berdasar sha256 file
```

---

## 🧠 Konsep Utama Graphify

1. **God Nodes:**
   * Simbol/modul yang memiliki derajat keterhubungan (*degree*) tertinggi (paling banyak diimpor atau menjadi tumpuan modul lain). Contoh utama: skema database `src/lib/db/schema.ts`, utilitas `src/lib/utils.ts`, dan store `src/store/appStore.tsx`.
2. **Community Detection:**
   * Pengelompokan file ke dalam kluster modul logis (misal: kluster `landing`, kluster `admin`, kluster `guestbook`, kluster `database`).
3. **Penyajian di Panel Admin:**
   * Server function `src/functions/graphify.ts` membaca `stats.json` untuk disajikan pada halaman `/admin/arsitektur` sehingga developer dapat memantau kesehatan struktur arsitektur tanpa perlu membuka terminal CLI.

---

## 💡 Panduan untuk AI
* File di direktori ini dihasilkan secara otomatis oleh pipeline analisis kode Graphify.
* Dilarang mengedit file JSON atau HTML di dalam folder ini secara manual karena dapat merusak integritas graf arsitektur.
