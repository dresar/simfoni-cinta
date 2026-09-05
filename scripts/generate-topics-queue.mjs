import "dotenv/config";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");

const queueFilePath = path.join(rootDir, "content", "topics-queue.json");
const contentDir = path.join(rootDir, "content");
if (!fs.existsSync(contentDir)) fs.mkdirSync(contentDir, { recursive: true });

const apiKey = process.env.HOLVERAI_API_KEY;
if (!apiKey) {
  console.error("Error: HOLVERAI_API_KEY is not defined in .env!");
  process.exit(1);
}

const CLUSTERS = [
  { name: "Adat & Budaya Nusantara", promptGuidance: "Prosesi adat, filosofi pakaian, tata cara pernikahan adat (Jawa, Sunda, Batak, Minang, Bugis, Bali, Palembang, Betawi, Aceh, Banjar, Toraja, Dayak, Maluku, Papua, Sasak, Tionghoa)." },
  { name: "Tema & Desain Undangan", promptGuidance: "Warna, tipografi, konsep desain visual (Minimalis, Luxury Gold, Rustic, Ethereal Garden, Monokrom, Boho Chic, Vintage Newspaper, Watercolor, Teracotta, Sage Green)." },
  { name: "Panduan Fitur Undangan Web", promptGuidance: "Fitur teknis undangan digital (WhatsApp blast, QR Check-in resepsi, amplop digital QRIS tanpa potongan, RSVP online real-time, Google Maps presisi, countdown timer, musik latar, buku tamu digital)." },
  { name: "Anggaran & Tips Hemat Biaya", promptGuidance: "Manajemen keuangan, alokasi budget Rp15-100 juta, perbandingan biaya cetak vs digital, negosiasi katering dan gedung, menabung bareng pasangan, dana darurat pernikahan." },
  { name: "Kata-Kata, Doa & Pantun", promptGuidance: "Teks undangan santun, doa Islami (Ar-Rum 21, An-Nur 32, Barakallahu), ayat Alkitab pernikahan Kristen/Katolik, pantun pembuka/penutup Melayu & Betawi, sastra romantis Indonesia." },
  { name: "Vendor & Rundown Acara", promptGuidance: "Manajemen vendor MUA, katering food tasting, fotografer/videografer, susunan acara akad dan resepsi jam per jam, peran bridesmaid, emergency kit hari-H." },
  { name: "Psikologi & Kesiapan Mental", promptGuidance: "Kesiapan mental menikah, komunikasi dengan calon mertua, mengatasi wedding jitters, resolusi konflik pranikah, kesepakatan peran rumah tangga pasutri baru." },
  { name: "Bulan Madu & Destinasi", promptGuidance: "Panduan honeymoon romantis di Indonesia (Labuan Bajo, Sumba, Danau Toba, Bali, Raja Ampat, Yogyakarta), tips packing, itinerary bulan madu hemat." },
  { name: "Kesehatan & Skincare Pranikah", promptGuidance: "Perawatan kulit calon pengantin, tips glowing sebelum hari-H, kebugaran fisik, premarital checkup di puskesmas/klinik, manajemen stres dan pola tidur." },
  { name: "Konsep Pernikahan Kreatif", promptGuidance: "Ide pernikahan unik era 2026: Intimate wedding 50 tamu, eco-friendly wedding ramah lingkungan, nikah di coffee shop, morning wedding casual, resepsi bertema hobi." }
];

let queue = [];
if (fs.existsSync(queueFilePath)) {
  try {
    queue = JSON.parse(fs.readFileSync(queueFilePath, "utf-8"));
    console.log(`Loaded existing queue: ${queue.length} topics.`);
  } catch (err) {
    console.error("Failed to parse existing queue, starting fresh.");
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
          content: "Kamu adalah Chief SEO Strategist & Pakar Pernikahan Indonesia untuk platform Simfoni Cinta. Balas HANYA dengan raw JSON valid tanpa markdown backticks (```json atau ```), tanpa penjelasan pembuka atau penutup."
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
  console.log("=== Memulai Pembangkitan Silabus 3.000 Judul Topik via Gemini 3.7 Flash ===");
  const TARGET_PER_CLUSTER = 300;
  const BATCH_SIZE = 50;

  for (const cluster of CLUSTERS) {
    let currentInCluster = queue.filter(t => t.category === cluster.name).length;
    console.log(`\nKluster: [${cluster.name}] - Saat ini: ${currentInCluster}/${TARGET_PER_CLUSTER}`);

    while (currentInCluster < TARGET_PER_CLUSTER) {
      const needed = Math.min(BATCH_SIZE, TARGET_PER_CLUSTER - currentInCluster);
      const existingTitlesInCluster = queue
        .filter(t => t.category === cluster.name)
        .slice(-25)
        .map(t => t.title)
        .join("; ");

      const prompt = `Buatkan tepat ${needed} judul artikel blog SEO unik dan spesifik untuk kategori "${cluster.name}".
Panduan tema: ${cluster.promptGuidance}.
Judul harus sangat menarik, bernilai praktis tinggi bagi calon pengantin modern di Indonesia, dan tidak boleh duplikat atau mirip dengan judul yang sudah ada: [${existingTitlesInCluster}].

Format output WAJIB HANYA JSON array berisi ${needed} objek:
[
  {
    "title": "Judul Artikel Lengkap dan Menarik",
    "category": "${cluster.name}"
  }
]`;

      console.log(`Mengambil ${needed} judul untuk [${cluster.name}]...`);
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
              status: "pending"
            });
            added++;
          }
          currentInCluster += added;
          fs.writeFileSync(queueFilePath, JSON.stringify(queue, null, 2), "utf-8");
          console.log(`✓ Berhasil menambahkan ${added} judul. Total antrean sekarang: ${queue.length} judul.`);
        } else {
          console.warn("Format respons bukan array, mencoba kembali...");
        }
      } catch (err) {
        console.error(`Error saat generate batch:`, err.message);
        console.log("Menunggu 5 detik sebelum retry...");
        await new Promise(r => setTimeout(r, 5000));
      }

      await new Promise(r => setTimeout(r, 1000));
    }
  }

  console.log(`\n🎉 SELESAI! Total silabus terkumpul: ${queue.length} topik di ${queueFilePath}`);
}

run().catch(console.error);
