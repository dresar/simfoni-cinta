import "dotenv/config";
import fs from "fs";

const apiKey = process.env.HOLVERAI_API_KEY;
const testTopic = {
  title: "Tata Cara Lengkap Pernikahan Adat Jawa Solo Basahan: Makna Filosofis, Rangkaian Prosesi, dan Glosarium Uborampe",
  slug: "tata-cara-lengkap-pernikahan-adat-jawa-solo-basahan",
  category: "Pernikahan Adat Jawa",
  folder: "adat-jawa"
};

const prompt = `Tulis sebuah artikel panduan ensiklopedis dan komprehensif untuk blog pernikahan Simfoni Cinta dalam Bahasa Indonesia.
WAJIB SANGAT PANJANG, LENGKAP, MENDALAM, DAN MENCAPAI MINIMAL 200 BARIS KODE MARKDOWN (sekitar 1.200 - 1.800 kata).

Topik: "${testTopic.title}"
Kategori: "${testTopic.category}"
Folder: "${testTopic.folder}"

PANDUAN STRUKTUR WAJIB (Hasilkan baris demi baris secara lengkap tanpa ada bagian yang dipotong atau diringkas):
1. Frontmatter YAML di baris paling atas (title, slug, category, folder, summary, readTime: 10, date, author: "Tim Riset Budaya & Editorial Simfoni Cinta", tags, keywords).
2. Judul Utama H1 (# ${testTopic.title}).
3. Callout Box AI Overview (> **Ringkasan Inti (AI Overview / Direct Answer):** ...) sepanjang 45-55 kata berisi definisi tegas dan inti prosesi.
4. ## Glosarium & Istilah Penting (Buat daftar minimal 8 istilah adat Jawa kuno seperti *dodol dawet, catur wedha, kreweng, tarub, bleketepe, sinduran, wijidadi, krobongan* beserta makna filosofisnya).
5. ## 1. Sejarah, Asal-Usul & Nilai Luhur Busana Solo Basahan (Jelaskan asal-usul Keraton Kasunangan Surakarta, dodot kemben alas-alasan, paes hijau gadung, dan filosofi keagungan alam semesta dalam 4 sub-bagian tebal).
6. ## 2. Rangkaian Prosesi Pra-Nikah: Pasang Tarub hingga Midodareni (Rincikan tahapan pasang bleketepe, siraman 7 mata air, sungkeman, dan malam widodari secara mendalam).
7. ## 3. Tata Urutan Upacara Panggih Sakral Jam Demi Jam (Jelaskan runtut: Balangan Gantal, Ngidak Endog/Wijidadi, Sinduran, Timbang/Pangkon, Tanom, Kacar-Kucur, Dulangan, dan Mapag Besan).
8. ## 4. Tabel Matriks Checklist Logistik, Perlengkapan & Uborampe (Buat tabel markdown besar dengan minimal 8-10 baris rincian uborampe, fungsi adat, dan PIC).
9. ## 5. Pantangan Adat (*Wewaler*) dan Solusi Adaptasi untuk Pasangan Modern (Analisis pantangan weton, pantangan arah rumah, dan cara berkompromi dengan sesepuh).
10. ## 6. Efisiensi Undangan Digital Adat Jawa Modern Bersama Simfoni Cinta (Jelaskan integrasi tema Jawa Solo, fitur sebar WhatsApp nama tamu otomatis, RSVP real-time, navigasi Google Maps presisi ke kediaman/gedung, dan amplop digital QRIS tanpa potongan mulai Rp15.000 sekali bayar di https://simfonicinta.my.id).
11. ## 7. Tanya Jawab Komprehensif (FAQ Adat Solo Basahan) (Minimal 5 pertanyaan kritis dan jawaban mendalam).

Format output WAJIB HANYA raw markdown murni dari '---' sampai baris penutup. DILARANG MEMBUNGKUS DENGAN BACKTICKS MARKDOWN.`;

async function test() {
  console.log("Menguji pembuatan artikel panjang minimal 200 baris via Gemini 3.7 Flash...");
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
          content: "Kamu adalah Guru Besar Antropologi Budaya Nusantara dan Pakar SEO Tingkat Tinggi. Tulis artikel yang SANGAT PANJANG, LENGKAP, BERNILAI ENSAIKLOPEDIS TINGGI, MINIMAL 200 BARIS MARKDOWN, tanpa memotong detail apa pun. Langsung output teks markdown murni."
        },
        { role: "user", content: prompt }
      ],
      temperature: 0.7
    })
  });

  const data = await res.json();
  let content = data.choices?.[0]?.message?.content?.trim() || "";
  content = content.replace(/^```markdown\s*/i, "").replace(/^```\s*/i, "").replace(/\s*```$/i, "").trim();

  fs.mkdirSync("content/blog/adat-jawa", { recursive: true });
  fs.writeFileSync("content/blog/adat-jawa/test-solo-basahan.md", content, "utf-8");

  const lines = content.split("\n").length;
  console.log(`✓ Selesai ditulis! Total Baris: ${lines} baris, Total Karakter: ${content.length}`);
}

test().catch(console.error);
