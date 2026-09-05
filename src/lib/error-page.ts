export function renderErrorPage(): string {
	return `<!doctype html>
<html lang="id" class="dark">
  <head>
    <meta charset="utf-8" />
    <title>Simfoni Cinta — Memuat Halaman</title>
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <style>
      body {
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
        background-color: #0c0a09;
        color: #f5f5f4;
        display: flex;
        align-items: center;
        justify-content: center;
        min-height: 100vh;
        margin: 0;
        padding: 1.5rem;
        box-sizing: border-box;
      }
      .card {
        max-width: 28rem;
        width: 100%;
        text-align: center;
        background: #1c1917;
        border: 1px solid rgba(255, 255, 255, 0.08);
        border-radius: 1rem;
        padding: 2.5rem 2rem;
        box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.5);
      }
      .icon {
        width: 3rem;
        height: 3rem;
        margin: 0 auto 1.25rem;
        color: #10b981;
      }
      h1 {
        font-size: 1.25rem;
        font-weight: 600;
        margin: 0 0 0.5rem;
        color: #fafaf9;
      }
      p {
        color: #a8a29e;
        font-size: 0.875rem;
        line-height: 1.5;
        margin: 0 0 1.75rem;
      }
      .actions {
        display: flex;
        gap: 0.75rem;
        justify-content: center;
      }
      button, a {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        padding: 0.625rem 1.25rem;
        border-radius: 0.5rem;
        font-size: 0.875rem;
        font-weight: 500;
        cursor: pointer;
        text-decoration: none;
        transition: all 0.15s ease;
      }
      .primary {
        background: #059669;
        color: #ffffff;
        border: none;
      }
      .primary:hover {
        background: #047857;
      }
      .secondary {
        background: rgba(255, 255, 255, 0.05);
        color: #d6d3d1;
        border: 1px solid rgba(255, 255, 255, 0.1);
      }
      .secondary:hover {
        background: rgba(255, 255, 255, 0.1);
        color: #fafaf9;
      }
    </style>
  </head>
  <body>
    <div class="card">
      <svg class="icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
      </svg>
      <h1>Sedang Menghubungkan Layanan</h1>
      <p>Sistem sedang menyiapkan sesi Anda. Silakan segarkan halaman untuk melanjutkan.</p>
      <div class="actions">
        <button class="primary" onclick="location.reload()">Segarkan Halaman</button>
        <a class="secondary" href="/">Ke Beranda</a>
      </div>
    </div>
  </body>
</html>`;
}
