import "dotenv/config";
import fs from "fs";

const apiKey = process.env.HOLVERAI_API_KEY;
const testTopic = {
  title: "Panduan Lengkap Prosesi Midodareni: Susunan Acara, Makna Filosofis, dan Checklist Persiapan",
  slug: "panduan-lengkap-prosesi-midodareni-susunan-acara-makna-filosofis-dan-checklist-persiapan",
  category: "Adat & Budaya Nusantara"
};

const prompt = `Tulis sebuah artikel blog SEO berkualitas tinggi, mendalam, dan komprehensif (600-900 kata) dalam Bahasa Indonesia tentang:
Judul: "${testTopic.title}"
Kategori: "${testTopic.category}"

Ketentuan Khusus Penulisan:
1. Gaya bahasa: Mengalir, berbobot, ramah, profesional, mudah dipindai (scannable), dan bebas dari klise AI kaku.
2. WAJIB sertakan:
   - Paragraf ringkasan 40-50 kata yang langsung menjawab inti topik (cocok untuk AI Overviews & Perplexity) di awal setelah judul.
   - Poin-poin kunci dan langkah praktis yang relevan khusus untuk topik "${testTopic.title}".
   - Tabel perbandingan atau rincian checklist/anggaran yang spesifik dengan konteks topik.
   - 3 Pertanyaan yang Sering Diajukan (FAQ) spesifik untuk topik ini beserta jawaban jelas.
   - Tautan natural ke fitur Simfoni Cinta (https://simfonicinta.my.id) seperti RSVP online, amplop digital QRIS, atau tema undangan Rp15.000.

Format output WAJIB HANYA berupa raw markdown lengkap dengan frontmatter YAML di bagian paling atas:
---
title: "${testTopic.title}"
slug: "${testTopic.slug}"
category: "${testTopic.category}"
summary: "Ringkasan inti 40-50 kata..."
readTime: 6
date: "2026-08-20"
author: "Tim Editorial Simfoni Cinta"
tags: ["undangan digital", "adat jawa", "midodareni", "pernikahan 2026", "simfoni cinta"]
keywords: ["midodareni", "adat jawa", "undangan digital"]
---`;

async function test() {
  console.log("Menguji pembuatan 1 artikel mendalam via Gemini 3.7 Flash...");
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
          content: "Kamu adalah Senior Wedding Journalist & SEO Specialist terkemuka di Indonesia. Tulis artikel bernas, kaya wawasan kultural dan praktis, tanpa basa-basi robotik. Keluarkan HANYA teks raw markdown lengkap tanpa bungkus ```markdown."
        },
        { role: "user", content: prompt }
      ],
      temperature: 0.7
    })
  });

  const data = await res.json();
  let content = data.choices?.[0]?.message?.content?.trim() || "";
  content = content.replace(/^```markdown\s*/i, "").replace(/^```\s*/i, "").replace(/\s*```$/i, "").trim();
  fs.writeFileSync("content/blog/sample-midodareni-test.md", content, "utf-8");
  console.log("✓ Selesai ditulis ke content/blog/sample-midodareni-test.md!");
}

test().catch(console.error);
