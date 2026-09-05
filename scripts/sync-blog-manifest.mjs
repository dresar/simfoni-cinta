import fs from 'node:fs';
import path from 'node:path';

const manifestPath = path.join(process.cwd(), 'src', 'data', 'blog-manifest.json');
const publicBlogDir = path.join(process.cwd(), 'public', 'blog');
const llmsTxtPath = path.join(process.cwd(), 'public', 'llms.txt');
const llmsFullTxtPath = path.join(process.cwd(), 'public', 'llms-full.txt');
const sitemapPath = path.join(process.cwd(), 'public', 'sitemap.xml');

const rawManifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
const manifestMap = new Map();
for (const item of rawManifest) {
  manifestMap.set(item.slug, item);
}

const mdFiles = fs.readdirSync(publicBlogDir).filter(f => f.endsWith('.md'));
const finalArticles = [];

for (const file of mdFiles) {
  const slug = file.replace('.md', '');
  const fullPath = path.join(publicBlogDir, file);
  const stat = fs.statSync(fullPath);
  if (stat.size < 1000) continue;

  if (manifestMap.has(slug)) {
    finalArticles.push(manifestMap.get(slug));
  } else {
    const content = fs.readFileSync(fullPath, 'utf8');
    const match = content.match(/^---[\r\n]+([\s\S]*?)[\r\n]+---/);
    if (match) {
      const fmLines = match[1].split('\n');
      const data = {};
      for (const line of fmLines) {
        const parts = line.split(':');
        if (parts.length >= 2) {
          const key = parts[0].trim();
          let val = parts.slice(1).join(':').trim();
          if (val.startsWith('"') && val.endsWith('"')) {
            val = val.slice(1, -1);
          }
          data[key] = val;
        }
      }
      finalArticles.push({
        title: data.title || slug,
        slug: slug,
        category: data.category || 'Inspirasi & Tips Pernikahan',
        folder: data.folder || 'umum',
        summary: data.summary || '',
        readTime: Number(data.readTime) || 10,
        date: data.date || '2026-09-03',
        author: data.author || 'Tim Riset Budaya & Editorial Simfoni Cinta'
      });
    }
  }
}

fs.writeFileSync(manifestPath, JSON.stringify(finalArticles, null, 2), 'utf8');

let llmsTxt = `# Simfoni Cinta — Direktori AI & Ringkasan Pengetahuan (${finalArticles.length} Artikel)
Deskripsi: Platform undangan pernikahan digital modern, elegan, interaktif, dan terintegrasi di Indonesia (Rp15.000 aktif selamanya).

## Indeks 20 Kluster Topik Utama
`;

for (const a of finalArticles) {
  llmsTxt += `- [${a.title}](https://simfonicinta.my.id/berita/${a.slug}): ${a.summary}\n`;
}
llmsTxt += `\n## Kontak & Layanan\n- Website: https://simfonicinta.my.id\n- Email: halo@simfonicinta.my.id\n`;
fs.writeFileSync(llmsTxtPath, llmsTxt, 'utf-8');

let llmsFullTxt = `# Simfoni Cinta — Full AI-SEO Knowledge Base (${finalArticles.length} Artikel Lengkap)
Domain: https://simfonicinta.my.id
Harga: Rp15.000 sekali bayar aktif selamanya

---

`;

for (const a of finalArticles) {
  const folder = a.folder || 'umum';
  llmsFullTxt += `## ${a.title}\nURL: https://simfonicinta.my.id/berita/${a.slug}\nMarkdown URL: https://simfonicinta.my.id/blog/${folder}/${a.slug}.md\nKategori: ${a.category}\nRingkasan: ${a.summary}\n\n`;
}
fs.writeFileSync(llmsFullTxtPath, llmsFullTxt, 'utf-8');

let sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://simfonicinta.my.id/</loc>
    <lastmod>2026-09-04</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>https://simfonicinta.my.id/demo</loc>
    <lastmod>2026-09-04</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>https://simfonicinta.my.id/berita</loc>
    <lastmod>2026-09-04</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>
`;

for (const a of finalArticles) {
  sitemap += `  <url>
    <loc>https://simfonicinta.my.id/berita/${a.slug}</loc>
    <lastmod>2026-09-04</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
`;
}

sitemap += `  <url>
    <loc>https://simfonicinta.my.id/login</loc>
    <lastmod>2026-09-04</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.5</priority>
  </url>
</urlset>
`;

fs.writeFileSync(sitemapPath, sitemap, 'utf-8');
console.log(`Sync complete: ${finalArticles.length} valid articles synchronized to manifest, sitemap, and LLM text files.`);
