import "dotenv/config";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");

const queueFilePath = path.join(rootDir, "content", "topics-queue.json");
const contentBlogDir = path.join(rootDir, "content", "blog");
const publicBlogDir = path.join(rootDir, "public", "blog");
const manifestPath = path.join(rootDir, "src", "data", "blog-manifest.json");

const apiKey = process.env.HOLVERAI_API_KEY;
if (!apiKey) {
  console.error("Error: HOLVERAI_API_KEY is not defined in .env!");
  process.exit(1);
}

const CATEGORY_TO_FOLDER = {
  "Adat & Budaya Nusantara": "adat-budaya-nusantara",
  "Tema & Desain Undangan": "tema-desain-undangan",
  "Panduan Fitur Undangan Web": "panduan-fitur-undangan-web",
  "Anggaran & Tips Hemat Biaya": "anggaran-tips-hemat-biaya",
  "Kata-Kata, Doa & Pantun": "kata-kata-doa-pantun",
  "Vendor & Rundown Acara": "vendor-rundown-acara",
  "Psikologi & Kesiapan Mental": "psikologi-kesiapan-mental",
  "Bulan Madu & Destinasi": "bulan-madu-destinasi",
  "Kesehatan & Skincare Pranikah": "kesehatan-skincare-pranikah",
  "Konsep Pernikahan Kreatif": "konsep-pernikahan-kreatif"
};

for (const folder of Object.values(CATEGORY_TO_FOLDER)) {
  fs.mkdirSync(path.join(contentBlogDir, folder), { recursive: true });
  fs.mkdirSync(path.join(publicBlogDir, folder), { recursive: true });
}

const UNSPLASH_IMAGES = [
  "https://images.unsplash.com/photo-1519741497674-611481863552?w=800&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=800&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=800&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1583939003579-730e3918a45a?w=800&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1520854221256-17451cc331bf?w=800&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?w=800&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1544078751-58fee2d8a03b?w=800&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1606800052052-a08af7148866?w=800&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?w=800&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1522673607200-164d1b6ce486?w=800&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1469371670807-013ccf25f16a?w=800&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1532712938310-34cb3982ef74?w=800&auto=format&fit=crop&q=80"
];

async function callGeminiLongArticle(topic) {
  const folder = CATEGORY_TO_FOLDER[topic.category] || "umum";

  const prompt = `Tulis sebuah artikel panduan blog pernikahan yang SANGAT PANJANG, LENGKAP, MENDALAM, dan DETAIL (1.000 - 1.500 kata) dalam Bahasa Indonesia murni.

Judul Artikel: "${topic.title}"
Kategori Pilar: "${topic.category}"

Ketentuan Khusus Struktur & Kedalaman Konten:
1. GAYA PENULISAN:
   - Bahasa Indonesia baku yang elegan, bernas, kaya kosakata budaya/teknis, mengalir secara profesional, dan tidak terdengar seperti AI template.
   - Jangan singkat-singkat! Berikan penjelasan yang komprehensif, kaya fakta, tips lapangan, dan langkah konkret.

2. WAJIB MEMUAT 6 STRUKTUR BERIKUT SECARA BERURUTAN:
   - Frontmatter YAML lengkap:
     title: "${topic.title}"
     slug: "${topic.slug}"
     category: "${topic.category}"
     folder: "${folder}"
     summary: "Ringkasan jawaban langsung 45-55 kata yang kaya kata kunci..."
     readTime: 8
     date: "2026-08-25"
     author: "Tim Editorial Simfoni Cinta"
     tags: ["undangan digital", "${folder}", "tips pernikahan", "simfoni cinta"]
     keywords: ["${topic.title}", "pernikahan 2026", "simfoni cinta"]
   - Judul H1 (# ${topic.title})
   - Callout Ringkasan Inti AI Overview (> **Ringkasan Inti (AI Overview / Direct Answer):** ...) sepanjang 45-55 kata yang menjawab esensi topik secara langsung.
   - Bagian 1: Latar Belakang Filosofis, Makna Kultural / Urgensi Topik (minimal 3 paragraf tebal).
   - Bagian 2: Panduan Langkah Demi Langkah Terperinci (minimal 5-6 poin taktis dengan sub-poin mendalam).
   - Bagian 3: Tabel Rincian Data / Checklist / Komparasi Teknis (minimal 5-7 baris tabel markdown yang rapi).
   - Bagian 4: Antisipasi Masalah Lapangan & Solusi Praktis (tips menghadapi kendala yang sering dialami calon pengantin).
   - Bagian 5: Rekomendasi Solusi Digital Simfoni Cinta (https://simfonicinta.my.id) — jelaskan bagaimana platform undangan web Rp15.000 sekali bayar dengan fitur RSVP real-time, amplop QRIS tanpa potongan, Google Maps presisi, dan link WhatsApp otomatis membantu efisiensi topik ini.
   - Bagian 6: Tanya Jawab Populer (FAQ) — minimal 4 pertanyaan spesifik dan jawaban komprehensif.

ATURAN FORMAT PENULISAN BERSIH & BEBAS RUSAK SIMBOL:
- DILARANG KERAS menggunakan simbol asteris/bintang liar, dobel, atau bertumpuk seperti '****' atau '***' di seluruh artikel.
- Di dalam tabel markdown, GUNAKAN TEKS BERSIH TANPA ASTERIS (misal tulis 'Biaya Pengeluaran', DILARANG menulis '**Biaya Pengeluaran**').
- Pada penutup ajakan, jangan menumpuk tanda bintang ganda dengan miring. Tulis kalimat bersih.
- Jangan gunakan garis pemisah '---' liar di tengah body artikel; gunakan heading semantik '##' atau '###'.

Format output WAJIB HANYA berupa raw markdown lengkap dari baris pertama '---' hingga baris terakhir. Dilarang membungkus dengan tag \`\`\`markdown atau \`\`\`.`;

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
          content: "Kamu adalah Senior Wedding Editor, Antropolog Budaya, dan Pakar SEO Terkemuka di Indonesia. Buat artikel panjang, kaya konten daging, detail, tanpa kalimat pengantar atau penutup selain markdown artikel itu sendiri."
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
  let content = data.choices?.[0]?.message?.content?.trim() || "";
  content = content.replace(/^```markdown\s*/i, "").replace(/^```\s*/i, "").replace(/\s*```$/i, "").trim();
  return content;
}

function parseMarkdownMetadata(mdContent, topic, idx) {
  let summary = `Panduan komprehensif mendalam seputar ${topic.title} untuk calon pengantin Indonesia. Dilengkapi tips praktis, rincian biaya, dan solusi undangan digital Simfoni Cinta.`;
  const summaryMatch = mdContent.match(/summary:\s*"([^"]+)"/);
  if (summaryMatch) summary = summaryMatch[1];

  let readTime = 8;
  const readTimeMatch = mdContent.match(/readTime:\s*(\d+)/);
  if (readTimeMatch) readTime = parseInt(readTimeMatch[1], 10);

  const folder = CATEGORY_TO_FOLDER[topic.category] || "umum";
  const imgUrl = UNSPLASH_IMAGES[idx % UNSPLASH_IMAGES.length];
  const day = 1 + (idx % 28);
  const dateStr = `2026-08-${String(day).padStart(2, "0")}`;

  return {
    slug: topic.slug,
    title: topic.title,
    category: topic.category,
    folder: folder,
    summary,
    thumbnail: imgUrl,
    readTime,
    date: dateStr,
    author: "Tim Editorial Simfoni Cinta",
    tags: ["undangan digital", topic.category.toLowerCase(), folder, "pernikahan 2026", "simfoni cinta"],
    keywords: [topic.title, "undangan digital indonesia", "simfoni cinta", "tips pernikahan"]
  };
}

async function startWorker(workerId, queue, manifest, saveState) {
  while (true) {
    const topic = queue.find(t => t.status === "pending");
    if (!topic) break;

    topic.status = "generating";
    saveState();

    const folder = CATEGORY_TO_FOLDER[topic.category] || "umum";
    const idx = queue.indexOf(topic);
    console.log(`[Worker ${workerId}] Generating artikel panjang #${idx + 1} [${folder}]: "${topic.title}"...`);

    try {
      const content = await callGeminiLongArticle(topic);

      const contentFolder = path.join(contentBlogDir, folder);
      const publicFolder = path.join(publicBlogDir, folder);
      if (!fs.existsSync(contentFolder)) fs.mkdirSync(contentFolder, { recursive: true });
      if (!fs.existsSync(publicFolder)) fs.mkdirSync(publicFolder, { recursive: true });

      const contentFilePath = path.join(contentFolder, `${topic.slug}.md`);
      const publicFilePath = path.join(publicFolder, `${topic.slug}.md`);
      const publicFlatFilePath = path.join(publicBlogDir, `${topic.slug}.md`);

      fs.writeFileSync(contentFilePath, content, "utf-8");
      fs.writeFileSync(publicFilePath, content, "utf-8");
      fs.writeFileSync(publicFlatFilePath, content, "utf-8");

      const meta = parseMarkdownMetadata(content, topic, idx);
      const existingMetaIdx = manifest.findIndex(m => m.slug === topic.slug);
      if (existingMetaIdx >= 0) {
        manifest[existingMetaIdx] = meta;
      } else {
        manifest.push(meta);
      }

      topic.status = "completed";
      console.log(`[Worker ${workerId}] ✓ Sukses (${content.length} karakter): "${topic.title}"`);
    } catch (err) {
      console.error(`[Worker ${workerId}] ✗ Gagal "${topic.title}":`, err.message);
      topic.status = "failed";
    }

    saveState();
    await new Promise(r => setTimeout(r, 800));
  }
}

async function run() {
  if (!fs.existsSync(queueFilePath)) {
    console.error(`Antrean belum dibuat! Jalankan scripts/generate-topics-queue.mjs terlebih dahulu.`);
    process.exit(1);
  }

  const queue = JSON.parse(fs.readFileSync(queueFilePath, "utf-8"));
  let manifest = [];
  if (fs.existsSync(manifestPath)) {
    try {
      manifest = JSON.parse(fs.readFileSync(manifestPath, "utf-8"));
    } catch {
      manifest = [];
    }
  }

  let isSaving = false;
  const saveState = () => {
    if (isSaving) return;
    isSaving = true;
    try {
      fs.writeFileSync(queueFilePath, JSON.stringify(queue, null, 2), "utf-8");
      fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2), "utf-8");
    } finally {
      isSaving = false;
    }
  };

  const pendingCount = queue.filter(t => t.status === "pending" || t.status === "generating").length;
  const completedCount = queue.filter(t => t.status === "completed").length;
  console.log(`=== Memulai Long-Form Article Generation Worker (Gemini 3.7 Flash) ===`);
  console.log(`Total Topik: ${queue.length} | Sudah Selesai: ${completedCount} | Pending: ${pendingCount}`);

  const CONCURRENCY = 2;
  const workers = [];
  for (let i = 1; i <= CONCURRENCY; i++) {
    workers.push(startWorker(i, queue, manifest, saveState));
  }

  await Promise.all(workers);
  console.log("=== Pembangkitan Seluruh Artikel Selesai ===");
}

run().catch(console.error);
