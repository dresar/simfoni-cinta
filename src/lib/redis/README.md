# ⚡ `src/lib/redis/` — Upstash Serverless Redis Caching & Invalidation

Direktori ini menyediakan lapisan cache berkecepatan tinggi menggunakan **Upstash Redis** berbasis REST HTTP API (`@upstash/redis`). Pendekatan ini 100% kompatibel dengan serverless runtime, Cloudflare Workers, dan edge environment tanpa memerlukan koneksi TCP soket persisten yang rentan putus.

---

## 📋 Inventaris Modul

| File | Peran & Deskripsi Fungsional |
|---|---|
| `client.ts` | Inisialisasi klien Upstash Redis via `UPSTASH_REDIS_REST_URL` dan `UPSTASH_REDIS_REST_TOKEN`. Menyediakan helper inti `cached<T>()` dan `invalidate()`. Dirancang dengan **Zero-Downtime Fallback**: jika Redis offline atau token belum disetel di `.env`, sistem otomatis mengeksekusi fungsi fetcher database langsung tanpa memicu error. |

---

## 🛠️ API & Helper Utama

### 1. `cached<T>(key: string, ttlSeconds: number, fetcher: () => Promise<T>): Promise<T>`
Membungkus eksekusi query data:
1. Memeriksa keberadaan cache di Redis berdasarkan `key`.
2. Jika ada (*Cache Hit*), data langsung dikembalikan seketika.
3. Jika tidak ada (*Cache Miss*), fungsi `fetcher()` dijalankan, hasilnya disimpan ke Redis dengan masa kedaluwarsa `ttlSeconds`, lalu dikembalikan ke pemanggil.

```tsx
import { cached } from "@/lib/redis/client";
import { db } from "@/lib/db/client";
import { templates } from "@/lib/db/schema";

// Cache daftar tema selama 1 jam (3600 detik)
export async function getCachedTemplates() {
  return await cached("api:templates:all", 3600, async () => {
    return await db.select().from(templates);
  });
}
```

### 2. `invalidate(...keys: string[])`
Menghapus satu atau beberapa key cache dari Redis secara paralel saat terjadi mutasi data (Create, Update, Delete) agar pengguna selalu mendapatkan data terbaru.

```tsx
import { invalidate } from "@/lib/redis/client";

export async function onTemplateUpdated(templateId: string) {
  // Hapus cache daftar dan cache spesifik template
  await invalidate("api:templates:all", `api:templates:${templateId}`);
}
```

---

## 🏷️ Konvensi Kunci Cache (Cache Key Prefixes)

Untuk menjaga keteraturan namespace, gunakan standar prefix berikut:
* `api:admin_settings` : Konfigurasi master platform & navigasi (TTL: 3600s)
* `api:templates:*` : Katalog dan detail template undangan (TTL: 1800s)
* `api:users:*` : Data profil dan entitlement user (TTL: 300s)
* `api:invitations:*` : Website undangan publik (TTL: 600s)
* `api:guestbook:*` : Event buku tamu digital dan kategori (TTL: 300s)
* `api:content:*` : Pustaka doa, quotes, dan ayat suci (TTL: 86400s)

---

## 💡 Panduan untuk AI
* Jangan pernah melempar unhandled error saat operasi Redis gagal; helper `cached` dan `invalidate` sudah dilengkapi blok `try/catch` mandiri.
* Selalu panggil `invalidate()` di dalam fungsi mutasi server (`add*`, `edit*`, `remove*`) setelah transaksi database berhasil dieksekusi.
