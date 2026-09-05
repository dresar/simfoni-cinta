# 🪝 `src/hooks/` — Custom React Hooks

Direktori ini berisi custom React hooks yang dapat digunakan kembali (*reusable*) di seluruh komponen aplikasi untuk menangani logika stateful, event listener browser, dan responsivitas antarmuka.

---

## 📋 Inventaris Hook

### 1. `use-mobile.tsx` (`useIsMobile`)
* **Fungsi:** Mendeteksi apakah lebar viewport layar pengguna saat ini berada dalam rentang perangkat mobile (lebar layar `< 768px`).
* **Implementasi Teknis:**
  * Menggunakan API browser native `window.matchMedia("(max-width: 767px)")`.
  * Menempelkan event listener `"change"` untuk reaktif secara otomatis saat orientasi perangkat diputar (portrait ➔ landscape) atau ukuran jendela browser diubah.
  * Mengembalikan boolean: `true` jika mobile, `false` jika tablet/desktop.
* **Contoh Penggunaan:**
  ```tsx
  import { useIsMobile } from "@/hooks/use-mobile";

  export function ResponsiveNavigation() {
    const isMobile = useIsMobile();

    if (isMobile) {
      return <MobileDrawerNav />;
    }
    return <DesktopHeaderNav />;
  }
  ```

---

## 💡 Konvensi Pembuatan Hook Baru untuk AI
* Setiap custom hook wajib dinamai dengan awalan `use` (misal: `useClipboard.ts`, `useAudioPlayer.ts`).
* Pastikan hook aman dieksekusi di lingkungan SSR TanStack Start (selalu lakukan pengecekan `typeof window !== "undefined"` atau jalankan logic browser di dalam `useEffect`).
