# 🏬 `src/store/` — Client-Side Global State Management

Direktori ini mengelola state global aplikasi di sisi klien (browser) menggunakan pola **React Context API** yang terintegrasi dengan persistensi penyimpanan lokal (`localStorage`).

---

## 📋 Inventaris Modul

| File | Peran & Deskripsi Fungsional |
|---|---|
| `appStore.tsx` | Master store aplikasi: menyediakan `StoreProvider` dan hook kustom `useStore()` untuk mengelola sesi login pengguna, hak akses role (`admin`/`user`), paket harga langganan (`PricingPackage`), serta status loading hidrasi klien. |

---

## 🔑 State & Tipe Data Utama

### 1. `Session`
Menyimpan informasi identitas dan otorisasi pengguna yang sedang aktif:
```ts
export type Session = {
  name: string;
  email: string;
  role: "admin" | "user";
  tier: "Free" | "Gold" | "Platinum" | "Owner";
  avatar?: string;
} | null;
```

### 2. `PricingPackage` & `DEFAULT_PACKAGES`
Menyimpan konfigurasi tier paket undangan:
* **Silver (Rp15.000):** 10 Foto galeri, 50 kuota sebar WA, musik platform, hitung mundur, masa aktif 1 tahun.
* **Gold (Rp35.000):** 25 Foto galeri, 100 kuota sebar WA, video YouTube prewedding, love story timeline, kustom musik MP3, masa aktif 3 tahun.
* **Platinum (Rp75.000):** Foto tanpa batas, kuota WA tanpa batas, live streaming IG/YouTube, domain kustom, masa aktif selamanya.

---

## 🛠️ Hook API: `useStore()`

Komponen klien dapat mengakses state dan fungsi mutasi melalui hook:

```tsx
import { useStore } from "@/store/appStore";

export function UserGreeting() {
  const { session, signIn, signOut, isLoaded } = useStore();

  if (!isLoaded) return <Skeleton className="h-8 w-24" />;

  if (!session) {
    return <Link to="/login">Masuk</Link>;
  }

  return (
    <div>
      <span>Halo, {session.name} ({session.tier})</span>
      <button onClick={signOut}>Keluar</button>
    </div>
  );
}
```

### Nilai yang Disediakan oleh `useStore()`:
* `session: Session` — Sesi pengguna aktif (atau `null` jika tamu).
* `packages: PricingPackage[]` — Daftar paket harga terkini.
* `isLoaded: boolean` — Status hidrasi (apakah data di `localStorage` sudah selesai dibaca).
* `signIn(session)` — Masuk dan menyimpan data sesi ke `aksc_session` di `localStorage`.
* `signOut()` — Menghapus sesi aktif dari state dan `localStorage`.
* `setSession(session)` — Memperbarui parsial data sesi pengguna.
* `updatePackage(id, updated)` — Memperbarui spesifikasi paket harga lokal.
* `resetPackages()` — Mengembalikan paket harga ke nilai default `DEFAULT_PACKAGES`.

---

## 💡 Panduan untuk AI
* `StoreProvider` sudah dibungkus otomatis di level root pada `src/routes/__root.tsx`.
* Komponen yang memanggil `useStore()` harus memastikan `isLoaded === true` sebelum merender komponen yang bergantung pada sesi untuk menghindari ketidakcocokan hidrasi (*hydration mismatch*) antara SSR dan klien.
