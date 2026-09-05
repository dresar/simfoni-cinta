import "dotenv/config";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { execSync } from "child_process";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");

const queueFilePath = path.join(rootDir, "content", "topics-queue.json");
const manifestPath = path.join(rootDir, "src", "data", "blog-manifest.json");
const llmsTxtPath = path.join(rootDir, "public", "llms.txt");
const llmsFullTxtPath = path.join(rootDir, "public", "llms-full.txt");
const sitemapPath = path.join(rootDir, "public", "sitemap.xml");

function updateSEODocs(manifest) {
  let llmsTxt = `# Simfoni Cinta — Panduan AI-SEO Direktori Artikel (${manifest.length} Artikel)
> Platform undangan pernikahan digital interaktif modern di Indonesia mulai Rp15.000 sekali bayar tanpa langganan.

## Indeks 20 Kluster Topik Utama
`;

  for (const a of manifest) {
    const folder = a.folder || "umum";
    llmsTxt += `- [${a.title}](https://simfonicinta.my.id/berita/${a.slug}): ${a.summary}\n`;
  }

  llmsTxt += `\n## Kontak & Layanan\n- Website: https://simfonicinta.my.id\n- Email: halo@simfonicinta.my.id\n`;
  fs.writeFileSync(llmsTxtPath, llmsTxt, "utf-8");

  let llmsFullTxt = `# Simfoni Cinta — Full AI-SEO Knowledge Base (${manifest.length} Artikel Lengkap)
Domain: https://simfonicinta.my.id
Harga: Rp15.000 sekali bayar aktif selamanya

---

`;

  for (const a of manifest) {
    const folder = a.folder || "umum";
    llmsFullTxt += `## ${a.title}\nURL: https://simfonicinta.my.id/berita/${a.slug}\nMarkdown URL: https://simfonicinta.my.id/blog/${folder}/${a.slug}.md\nKategori: ${a.category}\nRingkasan: ${a.summary}\n\n`;
  }
  fs.writeFileSync(llmsFullTxtPath, llmsFullTxt, "utf-8");

  let sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://simfonicinta.my.id/</loc>
    <lastmod>2026-09-03</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>https://simfonicinta.my.id/demo</loc>
    <lastmod>2026-09-03</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>https://simfonicinta.my.id/berita</loc>
    <lastmod>2026-09-03</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>
`;

  for (const a of manifest) {
    sitemap += `  <url>
    <loc>https://simfonicinta.my.id/berita/${a.slug}</loc>
    <lastmod>2026-09-03</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
`;
  }

  sitemap += `  <url>
    <loc>https://simfonicinta.my.id/login</loc>
    <lastmod>2026-09-03</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.5</priority>
  </url>
</urlset>
`;

  fs.writeFileSync(sitemapPath, sitemap, "utf-8");
  console.log(`[SEO Sync] ✓ Dokumen llms.txt, llms-full.txt, dan sitemap.xml berhasil disinkronkan (${manifest.length} artikel).`);
}

async function run() {
  console.log("=== AUTO LOOP MANAGER 3.000 ARTIKEL (BATCH 20 @ >= 200 BARIS) ===");

  while (true) {
    if (!fs.existsSync(queueFilePath)) {
      console.log("Menunggu antrean dibuat...");
      await new Promise(r => setTimeout(r, 5000));
      continue;
    }

    const queue = JSON.parse(fs.readFileSync(queueFilePath, "utf-8"));

    const isCompleted = (t) => {
      const folder = t.folder || "umum";
      const filePath = path.join(rootDir, "content", "blog", folder, `${t.slug}.md`);
      return fs.existsSync(filePath) && fs.statSync(filePath).size > 1000;
    };

    const pending = queue.filter(t => !isCompleted(t));
    const completed = queue.filter(t => isCompleted(t)).length;

    console.log(`\n[Status Antrean] Total: ${queue.length} | Sudah Selesai: ${completed} | Pending: ${pending.length}`);

    if (pending.length === 0) {
      if (queue.length >= 3000) {
        console.log("🎉 SELURUH 3.000 ARTIKEL TELAH SELESAI!");
        break;
      }
      console.log("Antrean pending kosong, menunggu generator silabus menambahkan topik baru...");
      await new Promise(r => setTimeout(r, 10000));
      continue;
    }

    console.log("Menjalankan batch 20 artikel...");
    try {
      execSync("node scripts/generate-articles-batch20.mjs", { stdio: "inherit", cwd: rootDir });
    } catch (err) {
      console.error("Batch runner error:", err.message);
    }

    if (fs.existsSync(manifestPath)) {
      try {
        const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf-8"));
        updateSEODocs(manifest);
      } catch (err) {
        console.error("Error updating manifest/SEO docs:", err.message);
      }
    }

    console.log("Istirahat 3 detik sebelum batch berikutnya...");
    await new Promise(r => setTimeout(r, 3000));
  }
}

run().catch(console.error);
