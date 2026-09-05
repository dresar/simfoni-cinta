import "dotenv/config";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");

const queueFilePath = path.join(rootDir, "content", "topics-queue.json");
const apiKey = process.env.HOLVERAI_API_KEY;
if (!apiKey) {
  console.error("Error: HOLVERAI_API_KEY is not defined in .env!");
  process.exit(1);
}

export const CLUSTERS_20 = [
  { id: "adat-jawa", name: "Pernikahan Adat Jawa", prompt: "Prosesi adat Jawa Solo, Jogja, Paes Ageng, Basahan, Siraman, Midodareni, Tarub, Bleketepe, Panggih, Balangan Gantal, Sinduran, Krobongan, Kacar-kucur, Dulangan, Dodol Dawet." },
  { id: "adat-sunda", name: "Pernikahan Adat Sunda", prompt: "Adat Sunda: Ngeuyeuk Seureuh, Sawer Panganten, Huap Lingkung, Meuleum Harupat, Nincak Endog, Banting Endog, Siger Sunda, Panyambung, Pabetot Bakakak." },
  { id: "adat-sumatera", name: "Pernikahan Adat Sumatera", prompt: "Adat Batak (Sinamot, Ulos, Marhusip, Martumpol, Unjuk), Minang (Marosok, Batimbang Tando, Malam Bainai, Manjapuik Marapulai, Suntiang), Palembang (Aisan Gede), Aceh (Peusijuek), Melayu (Tepung Tawar), Lampung (Siger)." },
  { id: "adat-sulawesi-kalimantan", name: "Pernikahan Adat Sulawesi & Kalimantan", prompt: "Adat Bugis Makassar (Mappettuada, Mappacci, Sompa, Uang Panai, Baju Bodo), Banjar (Bapapantunan, Baayun), Dayak (Petak Malai), Toraja (Rambu Tuka), Minahasa (Toki Pintu)." },
  { id: "adat-bali-nusatenggara-timur", name: "Pernikahan Adat Bali, NTT, NTB, Maluku & Papua", prompt: "Adat Bali Pawiwahan (Mepamit, Madengen-dengen, Mewidhi Widhana, Payas Agung), Sasak Lombok (Merarik), Sumba (Belis), Maluku (Baku Dapa), Papua (Mas Kawin)." },
  { id: "adat-tionghoa-peranakan", name: "Tradisi Tionghoa & Peranakan", prompt: "Prosesi Sangjit (Seserahan), Upacara Minum Teh (Tea Pai), Simbol Kebajikan Shuang Xi (Double Happiness), Busana Cheongsam & Qipao, Angpao Merah." },
  { id: "akad-nikah-kua-agama", name: "Akad Nikah, KUA & Upacara Agama", prompt: "Syarat rukun nikah Islam, berkas Simkah Kemenag 2026, surat numpang nikah, mahar, wali nikah, saksi, pemberkatan Kristen Protestan, sakramen perkawinan Katolik." },
  { id: "desain-tema-minimalis-modern", name: "Desain Tema Minimalis & Modern", prompt: "Desain minimalis modern, Korean aesthetic pastel, clean typography, monokrom hitam putih, grid layout estetik, whitespace, tipografi sans-serif elegan." },
  { id: "desain-tema-mewah-floral", name: "Desain Tema Mewah & Floral", prompt: "Luxury Royal Gold, Emerald Green kebangsawanan, Champagne Velvet, Burgundy Wine, Rose Gold, watercolor floral, motif ukiran emas prada." },
  { id: "desain-tema-rustic-outdoor", name: "Desain Tema Rustic, Botanical & Outdoor", prompt: "Earthy tone terracotta, sage green botanical, dried flower pampas, wooden texture, pesta kebun garden party, pernikahan pantai sunset Bali, boho chic." },
  { id: "fitur-teknis-undangan-web", name: "Fitur Teknis Undangan Digital Web", prompt: "Fitur teknis RSVP online, navigasi Google Maps presisi GPS, sistem QR Code check-in resepsi, countdown timer, PWA offline, kontrol musik latar autoplay." },
  { id: "distribusi-whatsapp-tamu", name: "Distribusi Undangan & WhatsApp Blast", prompt: "Generator link nama tamu otomatis di URL, pesan WhatsApp blast tanpa blokir, etika mengundang tamu via chat, manajemen buku kontak dan kuota tamu per sesi." },
  { id: "amplop-digital-fintech", name: "Amplop Digital & Integrasi QRIS", prompt: "Penerimaan kado amplop digital via QRIS instan, rekening multi-bank BCA Mandiri BRI BNI, dompet digital Dana OVO GoPay, tanpa potongan admin, rekapitulasi kado otomatis." },
  { id: "anggaran-biaya-hemat", name: "Manajemen Anggaran & Tips Hemat", prompt: "Rincian alokasi biaya pernikahan Rp20-100 juta, perbandingan biaya cetak vs digital hemat 85%, cashflow DP vendor, dana darurat 15%, menabung bersama pasangan." },
  { id: "manajemen-katering-gedung", name: "Manajemen Vendor Katering & Gedung", prompt: "Rumus porsi katering tamu, uji rasa (food tasting), survei gedung ballroom vs kafe coffee shop, kapasitas parkir, AC, genset cadangan, denda lembur overtime." },
  { id: "vendor-mua-busana-dekorasi", name: "Vendor MUA, Busana & Dekorasi", prompt: "Tips memilih MUA pengantin tahan lama, uji coba test makeup, sewa vs jahit gaun kebaya pengantin, dekorasi pelaminan bunga lokal, pencahayaan panggung." },
  { id: "dokumentasi-foto-video-wo", name: "Dokumentasi Foto, Video & WO", prompt: "Portofolio fotografer & videografer wedding, teaser sinematik prewedding, perbedaan Wedding Planner vs Wedding Organizer, peran panitia keluarga, emergency kit." },
  { id: "teks-doa-susunan-acara", name: "Susunan Acara & Teks Doa Pernikahan", prompt: "Teks doa Ar-Rum 21, An-Nur 32, doa Barakallahu Laka, ayat Alkitab 1 Korintus 13, rundown akad nikah dan resepsi jam per jam, khutbah nikah menyentuh hati." },
  { id: "pantun-puisi-kata-mutiara", name: "Pantun, Puisi & Kata Mutiara", prompt: "Kumpulan pantun Melayu dan Betawi jenaka & santun, puisi romantis Sapardi Djoko Damono, Chairil Anwar, kata-kata mutiara kesetiaan Habibie Ainun & Kahlil Gibran." },
  { id: "persiapan-mental-kesehatan-honeymoon", name: "Mental, Kesehatan Pranikah & Bulan Madu", prompt: "Pemeriksaan kesehatan pranikah (Premarital Check-up) di Puskesmas, perawatan kulit wajah glowing, manajemen stres wedding jitters, paket bulan madu romantis domestik." }
];

let queue = [];
if (fs.existsSync(queueFilePath)) {
  try {
    queue = JSON.parse(fs.readFileSync(queueFilePath, "utf-8"));
  } catch {
    queue = [];
  }
}

const existingSlugs = new Set(queue.map(t => t.slug));

function slugify(text) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

async function callGemini(prompt) {
  const res = await fetch("https://api.holver.web.id/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: "gemini-3.7-flash",
      messages: [
        {
          role: "system",
          content: "Kamu adalah Direktur Riset & SEO Spesialis Pernikahan Indonesia untuk Simfoni Cinta. Keluarkan HANYA raw JSON array tanpa format backticks."
        },
        { role: "user", content: prompt }
      ],
      temperature: 0.7
    })
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`API HTTP ${res.status}: ${errText}`);
  }

  const data = await res.json();
  const rawContent = data.choices?.[0]?.message?.content?.trim() || "";
  const cleaned = rawContent.replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/\s*```$/i, "").trim();
  return JSON.parse(cleaned);
}

async function run() {
  console.log("=== Memulai Pengumpulan Silabus 3.000 Topik (20 Kategori @ 150 Topik) ===");
  const TARGET_PER_CLUSTER = 150;
  const BATCH_SIZE = 50;

  for (const cluster of CLUSTERS_20) {
    let currentInCluster = queue.filter(t => t.folder === cluster.id).length;
    console.log(`\nKluster [${cluster.id}]: "${cluster.name}" — Saat ini: ${currentInCluster}/${TARGET_PER_CLUSTER}`);

    while (currentInCluster < TARGET_PER_CLUSTER) {
      const needed = Math.min(BATCH_SIZE, TARGET_PER_CLUSTER - currentInCluster);
      const existingTitles = queue
        .filter(t => t.folder === cluster.id)
        .slice(-20)
        .map(t => t.title)
        .join("; ");

      const prompt = `Buatkan tepat ${needed} judul artikel blog SEO unik, spesifik, dan sangat mendalam untuk kategori "${cluster.name}" (Folder: "${cluster.id}").
Panduan topik: ${cluster.prompt}.
Judul harus komprehensif, sarat istilah lokal/teknis/finansial, memikat, dan bebas dari duplikasi dengan judul yang sudah ada: [${existingTitles}].

Format output WAJIB HANYA JSON array berisi ${needed} objek:
[
  {
    "title": "Judul Artikel Lengkap, Spesifik, dan Sarat Istilah Kunci",
    "category": "${cluster.name}",
    "folder": "${cluster.id}"
  }
]`;

      console.log(`Mengambil ${needed} judul untuk [${cluster.id}]...`);
      try {
        const topics = await callGemini(prompt);
        if (Array.isArray(topics)) {
          let added = 0;
          for (const item of topics) {
            if (!item.title) continue;
            let slug = slugify(item.title);
            if (!slug) continue;
            if (existingSlugs.has(slug)) {
              slug = `${slug}-${Math.floor(1000 + Math.random() * 9000)}`;
            }
            existingSlugs.add(slug);
            queue.push({
              title: item.title.trim(),
              slug: slug,
              category: cluster.name,
              folder: cluster.id,
              status: "pending"
            });
            added++;
          }
          currentInCluster += added;
          fs.writeFileSync(queueFilePath, JSON.stringify(queue, null, 2), "utf-8");
          console.log(`✓ [${cluster.id}] Ditambahkan ${added} judul. Total antrean global: ${queue.length} judul.`);
        }
      } catch (err) {
        console.error(`Error saat generate batch:`, err.message);
        await new Promise(r => setTimeout(r, 4000));
      }

      await new Promise(r => setTimeout(r, 1200));
    }
  }

  console.log(`\n🎉 SELESAI! Seluruh 3.000 topik (20 kategori x 150) telah tersimpan di ${queueFilePath}`);
}

run().catch(console.error);
