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

let local9RouterKey = "sk-proj-SANITIZED_KEY_PROTECTED";
try {
  const dbPath = path.join(process.env.APPDATA || "", "9router", "db", "data.sqlite");
  if (fs.existsSync(dbPath)) {
    const { DatabaseSync } = await import("node:sqlite");
    const db = new DatabaseSync(dbPath);
    const row = db.prepare("SELECT key FROM apiKeys LIMIT 1").get();
    if (row && row.key) local9RouterKey = row.key;
  }
} catch (e) {}

async function callGeminiLongArticle(topic) {
  const folder = topic.folder || "umum";

  const prompt = `Tulis sebuah artikel blog panduan pernikahan ensiklopedis dalam Bahasa Indonesia untuk Simfoni Cinta.
WAJIB SANGAT PANJANG, LENGKAP, MENDALAM, DAN MENCAPAI MINIMAL 200 BARIS KODE MARKDOWN (1.200 - 1.800 kata).

Topik: "${topic.title}"
Kategori: "${topic.category}"
Folder Kategori: "${folder}"

Struktur Wajib Artikel (Minimal 200 Baris):
1. Frontmatter YAML lengkap (title, category, folder, summary, readTime, date, author, tags, keywords, aiOverview).
2. # Judul Utama H1 yang Menarik & Alami
3. AI Overview Box: Ringkasan esensial 45-55 kata dalam satu paragraf padat sebagai direct answer untuk AI Search.
4. ## 1. Glosarium & Istilah Penting Adat/Pernikahan (Jelaskan 5-7 istilah khas nusantara/modern beserta etimologi dan maknanya).
5. ## 2. Konsep Filosofis & Urutan Ritus Tradisional (Uraikan alur tahapan secara kronologis, sertakan diagram alur berbasis teks/kosmologis).
6. ## 3. Matriks Logistik & Rincian Anggaran Finansial (Sajikan TABEL LENGKAP 8-10 baris berisi komponen, estimasi harga IDR, penanggung jawab adat, dan catatan operasional).
7. ## 4. Panduan Praktis Calon Pengantin Modern (Tips eksekusi, pantangan adat/etika keluarga, dan solusi kompromi tradisi vs tren masa kini).
8. ## 5. Rekomendasi Efisiensi Undangan Digital Simfoni Cinta (Jelaskan peran platform https://simfonicinta.my.id mulai Rp15.000 sekali bayar dengan fitur RSVP real-time, navigasi Google Maps presisi, amplop QRIS tanpa potongan, dan sebar WhatsApp nama tamu otomatis).
9. ## 6. Tanya Jawab Komprehensif (FAQ) (Minimal 5 tanya-jawab mendalam dan spesifik).

ATURAN FORMAT PENULISAN BERSIH & BEBAS RUSAK SIMBOL:
- DILARANG KERAS menggunakan simbol asteris/bintang liar, dobel, atau bertumpuk seperti '****' atau '***' di seluruh artikel.
- Di dalam tabel markdown, GUNAKAN TEKS BERSIH TANPA ASTERIS (misal tulis 'Biaya Pengeluaran', DILARANG menulis '**Biaya Pengeluaran**').
- Pada penutup ajakan, jangan menumpuk tanda bintang ganda dengan miring. Tulis kalimat bersih.
- Jangan gunakan garis pemisah '---' liar di tengah body artikel; gunakan heading semantik '##' atau '###'.

Format output WAJIB HANYA raw markdown murni dari '---' pembuka hingga baris terakhir penutup tanpa bungkus backticks.`;

  if (apiKey) {
    for (const model of ["gemini-3.7-flash"]) {
      try {
        const res = await fetch("https://api.holver.web.id/v1/chat/completions", {
          method: "POST",
          signal: AbortSignal.timeout(60000),
          headers: {
            "Authorization": `Bearer ${apiKey}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            model: model,
            messages: [
              {
                role: "system",
                content: "Kamu adalah Guru Besar Antropologi Pernikahan dan Master SEO Indonesia. Tulis artikel SANGAT PANJANG, LENGKAP, MENCAPAI MINIMAL 200 BARIS MARKDOWN, kaya istilah glosarium dan tabel. Keluarkan HANYA teks markdown murni."
              },
              { role: "user", content: prompt }
            ],
            temperature: 0.7
          })
        });

        if (res.ok) {
          const data = await res.json();
          let content = data.choices?.[0]?.message?.content?.trim() || "";
          content = content.replace(/^```markdown\s*/i, "").replace(/^```\s*/i, "").replace(/\s*```$/i, "").trim();
          if (content.length > 500) return content;
        }
      } catch (err) {}
    }
  }

  if (local9RouterKey) {
    for (const combo of ["ag/gemini-3.7-flash-medium", "ag/gemini-3.6-flash-medium", "ag/gemini-3.7-flash-high", "ag/claude-sonnet-4-6"]) {
      try {
        const res = await fetch("http://localhost:20128/v1/chat/completions", {
          method: "POST",
          signal: AbortSignal.timeout(55000),
          headers: {
            "Authorization": `Bearer ${local9RouterKey}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            model: combo,
            messages: [
              {
                role: "system",
                content: "Kamu adalah Guru Besar Antropologi Pernikahan dan Master SEO Indonesia. Tulis artikel SANGAT PANJANG, LENGKAP, MENCAPAI MINIMAL 200 BARIS MARKDOWN, kaya istilah glosarium dan tabel. Keluarkan HANYA teks markdown murni."
              },
              { role: "user", content: prompt }
            ],
            temperature: 0.7,
            stream: false
          })
        });

        if (res.ok) {
          const raw = await res.text();
          const clean = raw.replace(/data:\s*\[DONE\]\s*$/, "").trim();
          const data = JSON.parse(clean);
          let content = data.choices?.[0]?.message?.content?.trim() || "";
          content = content.replace(/^```markdown\s*/i, "").replace(/^```\s*/i, "").replace(/\s*```$/i, "").trim();
          if (content.length > 500) return content;
        }
      } catch (err) {}
    }
  }

  const openAgenticKey = process.env.OPENAGENTIC_API_KEY || process.env.OPENAI_API_KEY;
  if (openAgenticKey) {
    try {
      const res = await fetch("https://openagentic.id/api/v1/chat/completions", {
        method: "POST",
        signal: AbortSignal.timeout(55000),
        headers: {
          "Authorization": `Bearer ${openAgenticKey}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: "deepseek-v4-flash-free",
          messages: [
            {
              role: "system",
              content: "Kamu adalah Guru Besar Antropologi Pernikahan dan Master SEO Indonesia. Tulis artikel SANGAT PANJANG, LENGKAP, MENCAPAI MINIMAL 200 BARIS MARKDOWN, kaya istilah glosarium dan tabel. Keluarkan HANYA teks markdown murni."
            },
            { role: "user", content: prompt }
          ],
          temperature: 0.7
        })
      });

      if (res.ok) {
        const raw = await res.text();
        const clean = raw.replace(/data:\s*\[DONE\]\s*$/, "").trim();
        const data = JSON.parse(clean);
        let content = data.choices?.[0]?.message?.content?.trim() || "";
        content = content.replace(/^```markdown\s*/i, "").replace(/^```\s*/i, "").replace(/\s*```$/i, "").trim();
        if (content.length > 500) return content;
      }
    } catch (err) {}
  }

  throw new Error("Seluruh provider AI (Holver AI, 9Router, & OpenAgentic) sedang sibuk. Menunggu putaran berikutnya...");
}

function parseMarkdownMetadata(mdContent, topic, idx) {
  let summary = `Panduan komprehensif seputar ${topic.title} untuk calon pengantin Indonesia. Lengkap dengan glosarium istilah, rincian biaya, dan solusi undangan digital Simfoni Cinta.`;
  const summaryMatch = mdContent.match(/summary:\s*"([^"]+)"/);
  if (summaryMatch) summary = summaryMatch[1];

  let readTime = 10;
  const readTimeMatch = mdContent.match(/readTime:\s*(\d+)/);
  if (readTimeMatch) readTime = parseInt(readTimeMatch[1], 10);

  const folder = topic.folder || "umum";
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
    author: "Tim Riset Budaya & Editorial Simfoni Cinta",
    tags: ["undangan digital", topic.category.toLowerCase(), folder, "pernikahan 2026", "simfoni cinta"],
    keywords: [topic.title, "undangan digital indonesia", "simfoni cinta", "tips pernikahan"]
  };
}

async function processSingleArticle(topic, idx, manifest) {
  const folder = topic.folder || "umum";
  const content = await callGeminiLongArticle(topic);
  const lineCount = content.split("\n").length;

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
  topic.lineCount = lineCount;
  return { lineCount, length: content.length };
}

async function run() {
  const BATCH_SIZE = 20;

  if (!fs.existsSync(queueFilePath)) {
    console.error(`Antrean belum dibuat! Jalankan scripts/generate-20-clusters-queue.mjs terlebih dahulu.`);
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

  const isCompleted = (t) => {
    const folder = t.folder || "umum";
    const filePath = path.join(contentBlogDir, folder, `${t.slug}.md`);
    return fs.existsSync(filePath) && fs.statSync(filePath).size > 1000;
  };

  const pendingTopics = queue.filter(t => !isCompleted(t));
  const completedCount = queue.filter(t => isCompleted(t)).length;
  console.log(`=== BATCH RUNNER 20 ARTIKEL PANJANG (>= 200 BARIS) VIA GEMINI 3.7 FLASH ===`);
  console.log(`Total Antrean: ${queue.length} | Sudah Selesai: ${completedCount} | Belum: ${pendingTopics.length}`);

  if (pendingTopics.length === 0) {
    console.log("Tidak ada topik pending saat ini.");
    process.exit(0);
  }

  const batch = pendingTopics.slice(0, BATCH_SIZE);
  console.log(`\nMemulai batch ${batch.length} artikel...`);

  const isQueueGenerating = queue.length < 3000;
  const CONCURRENCY = isQueueGenerating ? 1 : 2;
  console.log(`[Mode Concurrency]: ${CONCURRENCY} worker paralel (Queue size: ${queue.length}/3000)`);

  for (let i = 0; i < batch.length; i += CONCURRENCY) {
    const pair = batch.slice(i, i + CONCURRENCY);
    await Promise.all(pair.map(async (topic) => {
      const idx = queue.indexOf(topic);
      console.log(`[Batch Item ${idx + 1}] Generating [${topic.folder}]: "${topic.title}"...`);
      try {
        const result = await processSingleArticle(topic, idx, manifest);
        console.log(`✓ Selesai #${idx + 1}: "${topic.title}" (${result.lineCount} baris, ${result.length} karakter)`);
      } catch (err) {
        console.error(`✗ Gagal #${idx + 1}: "${topic.title}":`, err.message);
      }
    }));

    fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2), "utf-8");
    await new Promise(r => setTimeout(r, 1000));
  }

  console.log(`\n🎉 BATCH SELESAI: 20 artikel baru telah selesai dan disimpan ke content/blog/[kategori]/ serta public/blog/[kategori]/`);
}

run().catch(console.error);
