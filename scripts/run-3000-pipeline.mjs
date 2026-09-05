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

export function updateSEODocumentation(manifest) {
  let llmsTxt = `# Simfoni Cinta — Direktori Artikel AI SEO (Total: ${manifest.length} Artikel)

> Platform undangan digital pernikahan interaktif di Indonesia mulai Rp15.000 sekali bayar tanpa biaya langganan.

## Indeks Panduan & Artikel Pernikahan

`;

  for (const a of manifest) {
    llmsTxt += `- [${a.title}](https://simfonicinta.my.id/berita/${a.slug}): ${a.summary}\n`;
  }

  llmsTxt += `\n## Informasi Layanan\n- Website: https://simfonicinta.my.id\n- Email: halo@simfonicinta.my.id\n`;
  fs.writeFileSync(llmsTxtPath, llmsTxt, "utf-8");

  let llmsFullTxt = `# Simfoni Cinta — Full AI-SEO Knowledge Base (${manifest.length} Artikel)
Domain: https://simfonicinta.my.id

---

`;

  for (const a of manifest) {
    llmsFullTxt += `## ${a.title}\nURL: https://simfonicinta.my.id/berita/${a.slug}\nMarkdown URL: https://simfonicinta.my.id/blog/${a.slug}.md\nKategori: ${a.category}\nRingkasan: ${a.summary}\n\n`;
  }
  fs.writeFileSync(llmsFullTxtPath, llmsFullTxt, "utf-8");

  let sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://simfonicinta.my.id/</loc>
    <lastmod>2026-09-02</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>https://simfonicinta.my.id/demo</loc>
    <lastmod>2026-09-02</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>https://simfonicinta.my.id/berita</loc>
    <lastmod>2026-09-02</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>
`;

  for (const a of manifest) {
    sitemap += `  <url>
    <loc>https://simfonicinta.my.id/berita/${a.slug}</loc>
    <lastmod>2026-09-02</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
`;
  }

  sitemap += `  <url>
    <loc>https://simfonicinta.my.id/login</loc>
    <lastmod>2026-09-02</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.5</priority>
  </url>
</urlset>
`;

  fs.writeFileSync(sitemapPath, sitemap, "utf-8");
  console.log(`[SEO Sync] ✓ llms.txt, llms-full.txt, dan sitemap.xml berhasil diperbarui (${manifest.length} artikel).`);
}

async function main() {
  console.log("=== Master Orchestrator Pipeline 3.000 Artikel AI Simfoni Cinta ===");

  if (fs.existsSync(manifestPath)) {
    const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf-8"));
    updateSEODocumentation(manifest);
  }
}

main().catch(console.error);
