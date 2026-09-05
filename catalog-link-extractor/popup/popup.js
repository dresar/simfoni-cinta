'use strict';

let extractedItems = [];

const $ = id => document.getElementById(id);
const btnScan = $('btnScan');
const resultBox = $('resultBox');
const countBadge = $('countBadge');
const btnCopyUrls = $('btnCopyUrls');
const btnDownloadJson = $('btnDownloadJson');
const btnDownloadTxt = $('btnDownloadTxt');
const itemsList = $('itemsList');
const statusMsg = $('statusMsg');

function showStatus(text, isError = false) {
  statusMsg.textContent = text;
  statusMsg.style.display = 'block';
  statusMsg.style.background = isError ? 'rgba(239, 68, 68, 0.15)' : 'rgba(16, 185, 129, 0.15)';
  statusMsg.style.borderColor = isError ? 'rgba(239, 68, 68, 0.3)' : 'rgba(16, 185, 129, 0.3)';
  statusMsg.style.color = isError ? '#f87171' : '#34d399';
  setTimeout(() => {
    statusMsg.style.display = 'none';
  }, 3500);
}

function inPageExtractorScript() {
  const items = [];
  const origin = window.location.origin;

  // 1. Scan card links with /preview/
  const previewLinks = Array.from(document.querySelectorAll('a[href*="/preview/"]'));
  previewLinks.forEach(link => {
    let href = link.getAttribute('href') || '';
    if (href.startsWith('/')) href = origin + href;

    const slug = href.split('/preview/')[1]?.split('?')[0]?.replace(/\/$/, '') || '';
    if (!slug || items.some(x => x.slug === slug)) return;

    // Search closest card container
    const card = link.closest('article, figure, .card, [class*="col-"], div') || link.parentElement;
    let name = '';
    let thumbUrl = '';

    if (card) {
      const heading = card.querySelector('h2, h3, h4, h5, h6, [class*="title"], [class*="name"]');
      if (heading) name = heading.textContent.trim();

      const img = card.querySelector('img[src]');
      if (img) {
        let src = img.getAttribute('src') || '';
        if (src.startsWith('/')) src = origin + src;
        thumbUrl = src;
      }
    }

    if (!name) {
      name = slug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
    }

    if (!thumbUrl) {
      thumbUrl = `https://satumomen.com/themes/${slug}/${slug}.webp`;
    }

    items.push({
      id: `tpl-${slug}`,
      name,
      slug,
      previewUrl: href,
      thumbUrl,
      source: window.location.href
    });
  });

  // 2. Scan Schema JSON-LD if present
  document.querySelectorAll('script[type="application/ld+json"]').forEach(sc => {
    try {
      const data = JSON.parse(sc.textContent);
      if (data?.itemListElement && Array.isArray(data.itemListElement)) {
        data.itemListElement.forEach(it => {
          if (it?.offers?.url && it.offers.url.includes('/preview/')) {
            const pUrl = it.offers.url;
            const slug = pUrl.split('/preview/')[1]?.split('?')[0]?.replace(/\/$/, '') || '';
            if (slug && !items.some(x => x.slug === slug)) {
              items.push({
                id: `tpl-${slug}`,
                name: it.name || slug,
                slug,
                previewUrl: pUrl,
                thumbUrl: it.image || `https://satumomen.com/themes/${slug}/${slug}.webp`,
                source: window.location.href
              });
            }
          }
        });
      }
    } catch (e) {}
  });

  return items;
}

btnScan.addEventListener('click', async () => {
  btnScan.disabled = true;
  btnScan.textContent = 'Memindai Halaman...';

  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab?.id) {
      showStatus('Tidak menemukan tab aktif.', true);
      btnScan.disabled = false;
      btnScan.textContent = 'Pindai Halaman Ini';
      return;
    }

    const results = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: inPageExtractorScript
    });

    extractedItems = results?.[0]?.result || [];

    if (extractedItems.length === 0) {
      showStatus('Tidak ditemukan link /preview/ di halaman ini.', true);
    } else {
      renderResults(extractedItems);
      showStatus(`Ditemukan ${extractedItems.length} template undangan!`);
    }
  } catch (err) {
    showStatus('Error: ' + err.message, true);
  } finally {
    btnScan.disabled = false;
    btnScan.innerHTML = `
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="11" cy="11" r="8"/>
        <line x1="21" y1="21" x2="16.65" y2="16.65"/>
      </svg>
      <span>Pindai Ulang Halaman</span>
    `;
  }
});

function renderResults(items) {
  resultBox.style.display = 'block';
  countBadge.textContent = `${items.length} Template`;
  itemsList.innerHTML = '';

  items.forEach(it => {
    const row = document.createElement('div');
    row.className = 'item-row';
    row.innerHTML = `
      <img src="${it.thumbUrl}" class="item-thumb" onerror="this.src='https://satumomen.com/images/logo.png'">
      <div class="item-details">
        <div class="item-name">${it.name}</div>
        <div class="item-url">${it.previewUrl}</div>
      </div>
    `;
    itemsList.appendChild(row);
  });
}

btnCopyUrls.addEventListener('click', async () => {
  if (extractedItems.length === 0) return;
  const urls = extractedItems.map(it => it.previewUrl).join('\n');
  try {
    await navigator.clipboard.writeText(urls);
    showStatus(`✅ ${extractedItems.length} link URL disalin ke clipboard!`);
  } catch (e) {
    showStatus('Gagal menyalin: ' + e.message, true);
  }
});

btnDownloadJson.addEventListener('click', () => {
  if (extractedItems.length === 0) return;
  const jsonStr = JSON.stringify(extractedItems, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `templates-database-${Date.now()}.json`;
  a.click();
  URL.revokeObjectURL(url);
  showStatus(`📥 Database JSON (${extractedItems.length} item) berhasil diunduh!`);
});

btnDownloadTxt.addEventListener('click', () => {
  if (extractedItems.length === 0) return;
  const urls = extractedItems.map(it => it.previewUrl).join('\n');
  const blob = new Blob([urls], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `preview-urls-${Date.now()}.txt`;
  a.click();
  URL.revokeObjectURL(url);
  showStatus(`📥 File TXT (${extractedItems.length} URL) berhasil diunduh!`);
});

// Auto-scan on popup open
window.addEventListener('DOMContentLoaded', () => {
  btnScan.click();
});
