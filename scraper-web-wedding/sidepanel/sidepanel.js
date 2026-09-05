'use strict';

let activeTab = null;
let isBatchRunning = false;
let shouldStopBatch = false;

const $ = id => document.getElementById(id);
const targetTitleEl = $('targetTitle');
const targetUrlEl = $('targetUrl');
const btnStart = $('btnStart');
const btnStartBatch = $('btnStartBatch');
const btnStopBatch = $('btnStopBatch');
const tabSingle = $('tabSingle');
const tabBatch = $('tabBatch');
const singleTargetSection = $('singleTargetSection');
const batchSection = $('batchSection');
const batchButtonsWrap = $('batchButtonsWrap');
const batchUrlInput = $('batchUrlInput');
const batchUrlCount = $('batchUrlCount');
const batchBadgeCount = $('batchBadgeCount');
const btnPasteClipboard = $('btnPasteClipboard');
const btnClearBatch = $('btnClearBatch');
const progressCard = $('progressCard');
const progressPhase = $('progressPhase');
const progressPercent = $('progressPercent');
const progressBarFill = $('progressBarFill');
const batchQueueStatus = $('batchQueueStatus');
const queueStatusText = $('queueStatusText');
const logTerminal = $('logTerminal');
const successCard = $('successCard');
const successTitle = $('successTitle');
const successMessage = $('successMessage');
const statFilesEl = $('statFiles');
const statSizeEl = $('statSize');
const statMemCleanEl = $('statMemClean');

const opts = () => ({
  exitFullscreen: $('optExitFullscreen')?.checked ?? true,
  cover: $('optCover')?.checked ?? true,
  scroll: $('optScroll')?.checked ?? true,
  music: $('optMusic')?.checked ?? true,
  fonts: $('optFonts')?.checked ?? true,
  rewrite: $('optRewrite')?.checked ?? true,
  memoryPurge: $('optMemoryPurge')?.checked ?? true
});

function switchTab(mode) {
  if (mode === 'batch') {
    tabSingle.classList.remove('active');
    tabBatch.classList.add('active');
    singleTargetSection.style.display = 'none';
    batchSection.style.display = 'block';
    btnStart.style.display = 'none';
    batchButtonsWrap.style.display = 'flex';
  } else {
    tabBatch.classList.remove('active');
    tabSingle.classList.add('active');
    batchSection.style.display = 'none';
    singleTargetSection.style.display = 'block';
    batchButtonsWrap.style.display = 'none';
    btnStart.style.display = 'flex';
  }
}

tabSingle.addEventListener('click', () => switchTab('single'));
tabBatch.addEventListener('click', () => switchTab('batch'));

function getBatchUrls() {
  const text = batchUrlInput.value || '';
  const lines = text.split('\n');
  const urls = [];
  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
      try {
        new URL(trimmed);
        urls.push(trimmed);
      } catch {}
    }
  }
  return Array.from(new Set(urls));
}

function updateBatchCount() {
  const urls = getBatchUrls();
  batchUrlCount.textContent = `${urls.length} Link`;
  if (urls.length > 0) {
    batchBadgeCount.textContent = String(urls.length);
    batchBadgeCount.style.display = 'inline-block';
  } else {
    batchBadgeCount.style.display = 'none';
  }
}

batchUrlInput.addEventListener('input', updateBatchCount);

btnPasteClipboard.addEventListener('click', async () => {
  try {
    const text = await navigator.clipboard.readText();
    if (text) {
      batchUrlInput.value = (batchUrlInput.value ? batchUrlInput.value.trim() + '\n' : '') + text.trim();
      updateBatchCount();
      log('Berhasil menempel link dari clipboard.', 'info');
    }
  } catch (e) {
    log('Gagal membaca clipboard: ' + e.message, 'warn');
  }
});

btnClearBatch.addEventListener('click', () => {
  batchUrlInput.value = '';
  updateBatchCount();
});

async function initTab() {
  try {
    let [tab] = await chrome.tabs.query({ active: true, lastFocusedWindow: true });
    if (!tab) {
      const currentTabs = await chrome.tabs.query({ active: true, currentWindow: true });
      tab = currentTabs[0];
    }
    if (!tab) {
      const allActive = await chrome.tabs.query({ active: true });
      tab = allActive[0];
    }
    if (!tab) {
      const allTabs = await chrome.tabs.query({});
      tab = allTabs.find(t => t.url && !t.url.startsWith('chrome://') && !t.url.startsWith('chrome-extension://')) || allTabs[0];
    }
    if (tab) {
      activeTab = tab;
      targetTitleEl.textContent = tab.title || 'Halaman Web';
      targetUrlEl.textContent = tab.url || '-';
    }
  } catch (e) {
    targetTitleEl.textContent = 'Error: ' + e.message;
  }
}

initTab();
setInterval(initTab, 1500);
chrome.tabs.onActivated.addListener(initTab);
chrome.tabs.onUpdated.addListener(initTab);
if (chrome.windows?.onFocusChanged) {
  chrome.windows.onFocusChanged.addListener(initTab);
}
window.addEventListener('focus', initTab);
document.addEventListener('visibilitychange', () => {
  if (!document.hidden) initTab();
});

function log(msg, type = 'info') {
  const el = document.createElement('div');
  el.className = `log-entry ${type}`;
  const t = new Date().toLocaleTimeString('id-ID', { hour12: false });
  el.textContent = `[${t}] ${msg}`;
  logTerminal.appendChild(el);
  logTerminal.scrollTop = logTerminal.scrollHeight;
}

function progress(pct, phase) {
  progressPercent.textContent = `${pct}%`;
  progressBarFill.style.width = `${pct}%`;
  if (phase) progressPhase.textContent = phase;
}

function bgFetch(url, referer) {
  return new Promise((resolve, reject) => {
    chrome.runtime.sendMessage({ action: 'FETCH_ASSET', url, referer }, res => {
      if (chrome.runtime.lastError) return reject(new Error(chrome.runtime.lastError.message));
      if (res?.success) return resolve(res);
      reject(new Error(res?.error || 'Fetch failed'));
    });
  });
}

function downloadZip(dataUrl, filename) {
  return new Promise((resolve, reject) => {
    chrome.downloads.download({
      url: dataUrl,
      filename: filename || 'wedding-clone.zip',
      saveAs: false,
      conflictAction: 'uniquify'
    }, downloadId => {
      if (chrome.runtime.lastError) {
        reject(new Error(chrome.runtime.lastError.message));
      } else {
        resolve(downloadId);
      }
    });
  });
}

function categorize(url) {
  const lower = url.toLowerCase().split('?')[0];
  if (lower.match(/\.mp3$/) || url.includes('/musics/')) return 'assets/music';
  if (lower.match(/\.(woff2?|ttf|otf|eot)$/)) return 'assets/fonts';
  if (lower.match(/\.css$/) || url.includes('fonts.googleapis.com/css')) return 'assets/css';
  if (lower.match(/\.js$/)) return 'assets/js';
  return 'assets/images';
}

function getFilename(url) {
  try {
    const u = new URL(url);
    const parts = u.pathname.split('/').filter(Boolean);
    const file = parts[parts.length - 1].split('?')[0];
    const themeSubfolders = ['blue-butterfly', 'bonvoyage', 'mentari', 'green-leaf', 'melayu-pastel', 'daisy-gray'];
    const subIdx = parts.findIndex(p => themeSubfolders.some(t => p.includes(t)));
    if (subIdx >= 0 && parts.length > subIdx + 1) {
      return `${parts[subIdx]}/${file}`.replace(/[^a-zA-Z0-9._/-]/g, '_');
    }
    return file.replace(/[^a-zA-Z0-9._-]/g, '_');
  } catch (e) {
    return 'asset_' + Math.random().toString(36).slice(2, 8);
  }
}

function getSlugFromUrl(pageUrl, title) {
  try {
    const u = new URL(pageUrl);
    const segments = u.pathname.split('/').filter(Boolean);
    const last = segments[segments.length - 1] || '';
    if (last && last !== 'preview' && last !== 'theme' && last !== 'themes') {
      return last.toLowerCase().replace(/[^a-z0-9_-]/g, '_').slice(0, 35);
    }
  } catch {}
  return (title || 'wedding_template').toLowerCase().replace(/[^a-z0-9_-]/g, '_').slice(0, 30);
}

function fixHtml(html, urlMap, pageOrigin) {
  for (const [remote, local] of urlMap) {
    html = html.split(remote).join(local);
    const noQ = remote.split('?')[0];
    if (noQ !== remote) html = html.split(noQ).join(local);
    if (remote.startsWith(pageOrigin)) {
      const rootRel = remote.slice(pageOrigin.length);
      if (rootRel) html = html.split(rootRel).join(local);
    }
    const encoded = remote.replace(/&/g, '&amp;');
    if (html.includes(encoded)) html = html.split(encoded).join(local);
  }

  // RESTORE PRISTINE COVER STATE
  html = html.replace(/class="canvas\s*"/g, 'class="canvas not-open "');
  html = html.replace(/<div class="canvas"([^>]*)>/g, '<div class="canvas not-open "$1>');
  if (!html.includes('canvas not-open')) {
    html = html.replace(/class="([^"]*\bcanvas\b[^"]*)"/g, (match, classes) => {
      if (!classes.includes('not-open')) return `class="${classes} not-open"`;
      return match;
    });
  }

  html = html.replace(/class="([^"]*btn-open-invitation[^"]*)\bd-none\b([^"]*)"/g, 'class="$1$2"');
  html = html.replace(/class="([^"]*)\bd-none\b([^"]*btn-open-invitation[^"]*)"/g, 'class="$1$2"');

  html = html.replace(/<li class="satumomen_slide satumomen_cover"[^>]*>/gi, '<li class="satumomen_slide satumomen_cover">');
  html = html.replace(/<li class="satumomen_slide"[^>]*style="[^"]*"[^>]*>/gi, '<li class="satumomen_slide">');

  html = html.replace(/<div id="panZoom"[^>]*style="[^"]*"[^>]*>/gi,
    '<div id="panZoom" class="position-fixed h-100 w-100" style="top: 0; right:0; bottom:0; left:0; transform-origin: 50% 50%;">'
  );
  html = html.replace(/<div id="satuMomen"[^>]*style="[^"]*"[^>]*>/gi,
    '<div id="satuMomen" data-guest="Nama Tamu" data-group="VIP">'
  );

  html = html.replace(/type="[a-f0-9]+-text\/javascript"/g, 'type="text/javascript"');
  html = html.replace(/type='[a-f0-9]+-text\/javascript'/g, "type='text/javascript'");
  html = html.replace(/if \(!window\.__cfRLUnblockHandlers\) return false;\s*/g, '');
  html = html.replace(/data-cf-[a-z0-9_-]+(=["'][^"']*["'])?/gi, '');

  html = html.replace(/<script\b[^>]*>([\s\S]*?)<\/script>/gi, (match) => {
    if (/cdn-cgi|challenge-platform|cloudflareinsights|google-analytics|gtag|rocket-loader/i.test(match)) {
      return '';
    }
    return match;
  });

  html = html.replace(/\/themes\/([a-z0-9_-]+)\/(bg|bm|tl|tr|bl|br)\.webp(\?[^"'\s&]*)?/gi,
    'assets/images/$1/$2.webp');
  html = html.replace(/https?:\/\/satumomen\.com\/themes\/([a-z0-9_-]+)\/(bg|bm|tl|tr|bl|br)\.webp(\?[^"'\s&]*)?/gi,
    'assets/images/$1/$2.webp');
  html = html.replace(/url\(&quot;(?:https?:\/\/[^\/]+)?\/themes\/([a-z0-9_-]+)\/(bg|bm|tl|tr|bl|br)\.webp[^&]*&quot;\)/gi,
    'url(&quot;assets/images/$1/$2.webp&quot;)');
  html = html.replace(/background-image:\s*url\(["']?(?:https?:\/\/[^\/]+)?\/themes\/([a-z0-9_-]+)\/(bg|bm|tl|tr|bl|br)\.webp[^"')]*["']?\)/gi,
    'background-image: url("assets/images/$1/$2.webp")');

  html = html.replace(/\/themes\/theme-app\.js(\?[^"'\s]*)?/g, 'assets/js/theme-app.js');
  html = html.replace(/\/themes\/themesv2\.js(\?[^"'\s]*)?/g, 'assets/js/themesv2.js');
  html = html.replace(/https?:\/\/assets\.satumomen\.com\/build\/assets\/theme-app[^"'\s<>]*/g, 'assets/js/theme-app.js');
  html = html.replace(/https?:\/\/assets\.satumomen\.com\/build\/assets\/themesv2[^"'\s<>]*/g, 'assets/js/themesv2.js');

  html = html.replace(/(?:https?:\/\/[^\/]+)?\/images\/no-image\.jpg(\?[^"'\s<>]*)?/gi, 'assets/images/no-image.jpg');
  html = html.replace(/(?:https?:\/\/[^\/]+)?\/images\/btn_app_store\.png(\?[^"'\s<>]*)?/gi, 'assets/images/btn_app_store.png');
  html = html.replace(/(?:https?:\/\/[^\/]+)?\/images\/btn_play_store\.png(\?[^"'\s<>]*)?/gi, 'assets/images/btn_play_store.png');
  html = html.replace(/&quot;(?:https?:\/\/[^\/]+)?\/images\/no-image\.jpg[^&]*&quot;/gi, '&quot;assets/images/no-image.jpg&quot;');
  html = html.replace(/&quot;(?:https?:\/\/[^\/]+)?\/images\/btn_([^&]+)\.png[^&]*&quot;/gi, '&quot;assets/images/btn_$1.png&quot;');
  html = html.replace(/https?:\/\/assets\.satumomen\.com\/images\/galleries\/(820007-gallery-[^"'\s<>)]+)/g, 'assets/images/$1');
  html = html.replace(/https?:\/\/assets\.satumomen\.com\/assets\/whatsapp-image[^"'\s<>)]*/g, 'assets/images/whatsapp-image-2025-10-08-at-160058-1759910539.jpg');
  html = html.replace(/assets\/images\/whatsapp-map\.jpg/g, 'assets/images/whatsapp-image-2025-10-08-at-160058-1759910539.jpg');

  html = html.replace(/@import\s+url\(['"]?\/fonts\/[^\/]+\/([^'"\)]+)['"]?\);?/gi, "@import url('assets/css/$1');");
  html = html.replace(/\/fonts\/[^"'<>\s]+\/([^"'<>\s\/]+\.css)/g, 'assets/css/$1');
  html = html.replace(/\/fonts\/[^"'<>\s]+\/([^"'<>\s\/]+\.(woff2?|ttf|otf|eot))/gi, 'assets/fonts/$1');

  html = html.replace(/\/plugins\/animate\.css@[^"'<>\s\/]+\/animate\.min\.css/g, 'assets/css/animate.min.css');

  html = html.replace(/https?:\/\/ui-avatars\.com\/api\/[^"'<>\s)]+/g, 'assets/images/no-image.jpg');
  html = html.replace(/assets\/images\/asset_[a-z0-9]+\?[^"'<>\s]*/g, 'assets/images/no-image.jpg');

  html = html.replace(/<link[^>]+preconnect[^>]+fonts\.(googleapis|gstatic)\.com[^>]*>/gi, '');
  html = html.replace(/@import\s+url\(['"]?https?:\/\/fonts\.googleapis\.com[^'")]+['"]?\);?/g, '');
  html = html.replace(/<link rel="preload"[^>]*href="https?:\/\/assets\.satumomen\.com\/build\/assets\/bootstrap[^"]*"[^>]*>/gi,
    '<link rel="preload" as="style" href="assets/css/bootstrap-vCaDZZbr.css">');
  html = html.replace(/<link rel="preload"[^>]*href="https?:\/\/assets\.satumomen\.com\/build\/assets\/themesv2[^"]*"[^>]*>/gi,
    '<link rel="preload" as="style" href="assets/css/themesv2-DZZF_N8v.css">');

  html = html.replace(/<script\s+type=["']application\/ld\+json["']>[\s\S]*?<\/script>/gi, '');
  html = html.replace(/<meta\s+name=["']description["'][^>]*>/gi, '<meta name="description" content="Undangan Pernikahan Digital">');
  html = html.replace(/<meta\s+property=["']og:description["'][^>]*>/gi, '<meta property="og:description" content="Undangan Pernikahan Digital">');
  html = html.replace(/<meta\s+property=["']og:url["'][^>]*>/gi, '');
  html = html.replace(/<meta\s+name=["'](author|copyright|generator)["'][^>]*>/gi, '');

  html = html.replace(/href=["'](?:\/chat|https?:\/\/[^\/]*\/chat)[^"']*["']/gi, 'href="#"');
  html = html.replace(/title=["']Pesan Tema Ini["']/gi, 'title="WhatsApp"');

  html = html.replace(/<!--\s*illegal\s*-->[\s\S]*?<!--\s*end\s+illegal\s*-->/gi, '');
  html = html.replace(/<div\s+id=["']illegal["'][^>]*>[\s\S]*?<\/div>/gi, '');
  html = html.replace(/<div\s+id=["']waterMark["'][^>]*>[\s\S]*?<\/div>/gi, '');
  html = html.replace(/<div\s+class=["']watermark-placeholder[^"']*["'][^>]*>[\s\S]*?<\/div>/gi, '');
  html = html.replace(/<!--\s*Ads for free version\s*-->[\s\S]*?<!--\s*end Ads for free version\s*-->/gi, '');
  html = html.replace(/<audio([^>]*)autoplay([^>]*)>/gi, '<audio$1$2>');
  html = html.replace(/<script[^>]*>\s*var notSupport = document\.getElementById\('notSupport'\);[\s\S]*?checkBrowser\(\)\s*<\/script>/gi, '');
  html = html.replace(/https?:\/\/[a-zA-Z0-9.-]*assets\//gi, 'assets/');
  html = html.replace(/<main\s+id=["']app["']>/gi, '<main id="main-app">');
  html = html.replace(
    /(?:<\/div>\s*){4,12}<\/li>\s*<\/ul>\s*<\/div>\s*<\/div>\s*(<div\s+id=["']smMenu["'])/gi,
    '</div></div></div></div></li></ul></div></div>\n$1'
  );
  html = html.replace(/assetsassets\//g, 'assets/');
  html = html.replace(/assets\/assets\//g, 'assets/');

  return html;
}

async function inPageDiscover(options) {
  const logs = [];
  const addLog = (msg, t = 'info') => logs.push({ msg, t });

  addLog('Fase 1: Menyimpan DOM cover awal (Pristine State)...');
  const pristineHtml = document.documentElement.outerHTML;

  if (options.scroll) {
    addLog('Fase 2: Menstimulasi tombol buka undangan untuk lazy-load...');
    const allEls = [...document.querySelectorAll('button, a, [role="button"], .btn')];
    const openBtn = allEls.find(el => /buka|open|mulai/i.test(el.textContent?.trim()));
    if (openBtn) { try { openBtn.click(); } catch (e) {} }
    await new Promise(r => setTimeout(r, 2000));

    if (options.exitFullscreen || document.fullscreenElement) {
      try {
        if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
        window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', code: 'Escape', keyCode: 27, which: 27, bubbles: true }));
        window.dispatchEvent(new KeyboardEvent('keyup', { key: 'Escape', code: 'Escape', keyCode: 27, which: 27, bubbles: true }));
      } catch (e) {}
    }

    addLog('Fase 3: Auto-scroll untuk memicu lazy-loaded gallery...');
    await new Promise(resolve => {
      let scrolled = 0;
      const t = setInterval(() => {
        window.scrollBy(0, 350);
        scrolled += 350;
        if (scrolled >= document.body.scrollHeight || scrolled > 15000) { clearInterval(t); window.scrollTo(0, 0); resolve(); }
      }, 50);
    });

    for (const mi of document.querySelectorAll('.satumomen_menu_item, [data-slide-index]')) {
      try { mi.click(); await new Promise(r => setTimeout(r, 100)); } catch (e) {}
    }
  }

  addLog('Fase 4: Mengumpulkan semua URL aset (cover bg, ornamen, galeri, musik, fonts)...');
  const seen = new Set();
  const urls = [];

  function add(raw) {
    if (!raw || typeof raw !== 'string') return;
    let u = raw.trim().split('#')[0];
    if (!u || u.startsWith('data:') || u.startsWith('blob:') || u.startsWith('javascript:')) return;
    if (u.startsWith('//')) u = location.protocol + u;
    if (u.startsWith('/') && !u.startsWith('//')) u = location.origin + u;
    if (!u.startsWith('http')) { try { u = new URL(u, location.href).href; } catch (e) { return; } }
    if (/cdn-cgi|cloudflareinsights|google-analytics|gtag|schema\.org|apple\.com|play\.google|goo\.gl|maps\.app|facebook\.com|whatsapp\.com/i.test(u)) return;
    if (seen.has(u)) return;
    seen.add(u);
    urls.push(u);
  }

  document.querySelectorAll('img, picture source').forEach(el => {
    const srcAttr = el.getAttribute('src');
    if (srcAttr) { try { add(new URL(srcAttr, location.href).href); } catch(e){} }
    if (el.src && el.src.startsWith('http')) add(el.src);
    if (el.srcset) el.srcset.split(',').forEach(s => {
      const p = s.trim().split(' ')[0];
      if (p) { try { add(new URL(p, location.href).href); } catch(e){} }
    });
    if (el.dataset?.src) { try { add(new URL(el.dataset.src, location.href).href); } catch(e){} }
  });

  document.querySelectorAll('[style]').forEach(el => {
    const style = el.getAttribute('style') || '';
    const matches = [...style.matchAll(/url\(['"]?([^'"\)]+)['"]?\)/gi)];
    matches.forEach(m => { try { add(new URL(m[1], location.href).href); } catch(e){} });
  });

  document.querySelectorAll('.container-mobile, .satumomen_slide, .cover, [class*="frame"]').forEach(el => {
    try {
      const bg = window.getComputedStyle(el).backgroundImage;
      if (bg && bg !== 'none') {
        const m = bg.match(/url\(['"]?([^'"\)]+)['"]?\)/);
        if (m) add(new URL(m[1], location.href).href);
      }
    } catch(e) {}
  });

  document.querySelectorAll('link[href]').forEach(el => {
    const h = el.getAttribute('href');
    if (h && !h.startsWith('#')) { try { add(new URL(h, location.href).href); } catch(e){} }
  });
  document.querySelectorAll('script[src]').forEach(el => {
    const s = el.getAttribute('src');
    if (s) { try { add(new URL(s, location.href).href); } catch(e){} }
  });
  document.querySelectorAll('audio, audio source').forEach(el => {
    const s = el.getAttribute('src') || el.src;
    if (s) { try { add(new URL(s, location.href).href); } catch(e){} }
  });

  const combinedHtml = pristineHtml + '\n' + document.documentElement.outerHTML;

  const absUrls = combinedHtml.match(/https?:\/\/[^\s"'<>)&]+\.(webp|jpg|jpeg|png|gif|svg|ico|woff2?|ttf|otf|eot|mp3|css|js)/gi) || [];
  absUrls.forEach(u => add(u));

  const rootPaths = [...combinedHtml.matchAll(/["'\(](\/(themes|images|fonts|plugins|build)[^\s"'<>)&]+\.(webp|jpg|jpeg|png|gif|svg|ico|woff2?|ttf|otf|eot|mp3|css|js)(\?[^\s"'<>)&]*)?)/gi)];
  rootPaths.forEach(m => { try { add(new URL(m[1], location.href).href); } catch(e){} });

  const quotedUrls = [...combinedHtml.matchAll(/url\(&quot;([^&]+)&quot;\)/gi)].map(m => m[1]);
  quotedUrls.forEach(u => { try { add(new URL(u, location.href).href); } catch(e){} });

  document.querySelectorAll('style').forEach(el => {
    [...el.textContent.matchAll(/url\(['"]?(https?:\/\/[^'"\)\s]+)['"]?\)/gi)].forEach(m => add(m[1]));
    [...el.textContent.matchAll(/@import\s+['"]?(https?:\/\/[^'"\s]+)['"]?/gi)].forEach(m => add(m[1]));
  });

  for (const sheet of document.styleSheets) {
    try {
      for (const rule of (sheet.cssRules || [])) {
        if (rule.cssText) {
          [...rule.cssText.matchAll(/url\(['"]?(https?:\/\/[^'"\)\s]+)['"]?\)/gi)].forEach(m => add(m[1]));
        }
      }
    } catch(e) {}
  }

  addLog(`Ditemukan ${urls.length} aset unik untuk diunduh.`);

  return {
    title: document.title || 'wedding-invitation',
    origin: location.origin,
    pageUrl: location.href,
    html: pristineHtml,
    assetUrls: urls,
    logs
  };
}

async function scrapeSingleTab(tabId, pageUrl, options) {
  progress(15, 'Menjalankan forensic scanner di halaman...');
  const [injection] = await chrome.scripting.executeScript({
    target: { tabId },
    func: inPageDiscover,
    args: [options]
  });

  if (!injection?.result) throw new Error('Gagal menjalankan in-page scanner.');

  const { title, origin, pageUrl: actualUrl, html: rawHtml, assetUrls, logs: inLogs } = injection.result;
  inLogs.forEach(l => log(l.msg, l.t));
  log(`${assetUrls.length} aset ditemukan. Mulai unduh via Background SW...`, 'info');

  const zip = new JSZip();
  const urlMap = new Map();
  let downloaded = 0, totalBytes = 0;

  progress(25, 'Mengunduh aset...');

  for (let i = 0; i < assetUrls.length; i++) {
    const url = assetUrls[i];
    const folder = categorize(url);
    const fn = getFilename(url);
    const zipPath = `${folder}/${fn}`;

    try {
      const res = await bgFetch(url, actualUrl || pageUrl);
      if (!res?.base64) {
        continue;
      }

      if (folder === 'assets/css') {
        try {
          const cssText = atob(res.base64);
          const innerUrls = [...cssText.matchAll(/url\(['"]?(https?:\/\/[^'"\)\s]+)['"]?\)/gi)].map(m => m[1]);
          let newCss = cssText;

          for (const cu of Array.from(new Set(innerUrls))) {
            const cuFolder = categorize(cu);
            const cuFn = getFilename(cu);
            const cuPath = `${cuFolder}/${cuFn}`;
            try {
              const cuRes = await bgFetch(cu, url);
              if (cuRes?.base64) {
                zip.file(cuPath, cuRes.base64, { base64: true });
                urlMap.set(cu, cuPath);
                downloaded++;
                totalBytes += cuRes.byteLength || 0;
                const depth = zipPath.split('/').length - 1;
                const rel = '../'.repeat(depth - 1) + cuPath.split('/').slice(1).join('/');
                newCss = newCss.split(cu).join(rel);
              }
            } catch (e) {}
          }

          newCss = newCss.replace(/\/fonts\/[^"')\s]+\/([^"')\s\/]+\.(woff2?|ttf|otf|eot))/gi, '../fonts/$1');
          zip.file(zipPath, btoa(unescape(encodeURIComponent(newCss))), { base64: true });
        } catch (e) {
          zip.file(zipPath, res.base64, { base64: true });
        }
      } else if (folder === 'assets/js') {
        try {
          let jsText = atob(res.base64);
          jsText = jsText.replace(
            /var\s+resizeWorkspace\s*=\s*function\s*resizeWorkspace\s*\(\)\s*\{[\s\S]*?zoom\.style\.transform[^;]+;\s*\};/gi,
            `var resizeWorkspace = function resizeWorkspace() {
  var workspace = document.getElementById("workspace-container");
  var canvas = document.querySelector(".canvas");
  var zoom = document.getElementById("panZoom");
  var satuMomen = document.getElementById("satuMomen");
  var windowWidth = Number(window.screen.width > 430 ? 414 : window.screen.width);
  var windowHeight = Number(window.innerHeight > 932 ? 736 : window.innerHeight);
  var hightRes = windowHeight / windowWidth * 9;
  var clientHeight = Number(window.innerHeight) / 736;
  var clientWidth = Number(window.screen.width) / 414;
  var scale = clientHeight < clientWidth ? clientHeight : clientWidth;
  var newHeight = 414 / 9 * (hightRes < 16 || window.screen.width > 430 ? 16 : hightRes);
  if (canvas) canvas.style.height = "".concat(newHeight, "px");
  if (satuMomen) satuMomen.style.height = "".concat(newHeight, "px");
  if (zoom) zoom.style.transform = "scale(".concat(scale, ") translate(0px,0px)");
};`
          );
          jsText = jsText.replace(/productionTip:\s*!0/g, 'productionTip:false');
          jsText = jsText.replace(/console\.log\("Autoplay prevented:",\s*error\);/g, '');
          jsText = jsText.replace(/tag\.src = "https:\/\/www\.youtube\.com\/iframe_api";/g, '');

          zip.file(zipPath, btoa(unescape(encodeURIComponent(jsText))), { base64: true });
        } catch (e) {
          zip.file(zipPath, res.base64, { base64: true });
        }
      } else {
        zip.file(zipPath, res.base64, { base64: true });
      }

      urlMap.set(url, zipPath);
      downloaded++;
      totalBytes += res.byteLength || 0;
    } catch (err) {
      log(`Gagal: ${fn} — ${err.message}`, 'warn');
    }

    const pct = Math.floor(25 + ((i + 1) / assetUrls.length) * 55);
    if (i % 4 === 0) progress(pct, `Mengunduh ${i + 1}/${assetUrls.length}: ${fn.split('/').pop()}`);
  }

  progress(82, 'Menyusun & membersihkan index.html...');
  log('Menerapkan pemulihan Cover & URL rewrite...', 'info');

  let finalHtml = fixHtml(rawHtml, urlMap, origin);

  if (!finalHtml.includes('assets/css/animate.min.css')) {
    finalHtml = finalHtml.replace(
      '</head>',
      '<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/animate.css@4.1.1/animate.min.css">\n</head>'
    );
  }

  ['BrittanySignature.css', 'fonts.css', 'Heatwood.css'].forEach(fc => {
    if (urlMap.has('https://satumomen.com/fonts/' + fc.split('.')[0].toLowerCase() + '/' + fc) ||
        [...urlMap.values()].includes(`assets/css/${fc}`)) {
      if (!finalHtml.includes(`assets/css/${fc}`)) {
        finalHtml = finalHtml.replace('</head>', `<link rel="stylesheet" href="assets/css/${fc}">\n</head>`);
      }
    }
  });

  zip.file('index.html', finalHtml);
  zip.file('README.md', [
    `# ${title}`,
    `> Scraped by Scraper Web Wedding v1.3.0 Batch Edition`,
    `> Source: ${pageUrl}`,
    '',
    '## Struktur:',
    '- assets/music/ — Audio latar',
    '- assets/images/ — Gambar & ornamen tema',
    '- assets/fonts/ — Font custom (woff2, ttf)',
    '- assets/css/ — Stylesheet lengkap',
    '- assets/js/ — Script interaksi tema',
    '',
    '## Cara jalankan:',
    '```bash',
    'npx serve .',
    '```',
  ].join('\n'));

  progress(92, 'Mengompresi ZIP...');
  const zipBlob = await zip.generateAsync({ type: 'blob', compression: 'DEFLATE', compressionOptions: { level: 6 } });

  progress(97, 'Menyimpan ke Downloads...');
  const slug = getSlugFromUrl(actualUrl || pageUrl, title);
  const filename = `${slug}.zip`;

  const reader = new FileReader();
  const dataUrlPromise = new Promise((resolve) => {
    reader.onloadend = () => resolve(reader.result);
    reader.readAsDataURL(zipBlob);
  });

  const zipDataUrl = await dataUrlPromise;
  await downloadZip(zipDataUrl, filename);

  if (options.memoryPurge) {
    chrome.runtime.sendMessage({ action: 'PURGE_MEMORY' });
  }

  log(`✅ [${filename}] berhasil diunduh (${downloaded + 2} berkas, ${(totalBytes / 1024 / 1024).toFixed(2)} MB)!`, 'success');
  return { slug, filename, downloaded: downloaded + 2, totalBytes };
}

btnStart.addEventListener('click', async () => {
  await initTab();
  if (!activeTab?.id) {
    alert('Tidak dapat mendeteksi tab aktif. Pastikan Anda sedang membuka tab website undangan.');
    return;
  }

  btnStart.disabled = true;
  progressCard.style.display = 'block';
  successCard.style.display = 'none';
  batchQueueStatus.style.display = 'none';
  logTerminal.innerHTML = '';
  progress(5, 'Menghubungkan ke tab...');
  log('Scraper Web Wedding v1.3.0 dimulai...', 'info');

  try {
    const res = await scrapeSingleTab(activeTab.id, activeTab.url, opts());
    progress(100, '✅ Kloning Selesai 100%');
    successTitle.textContent = 'Unduhan Selesai 100%!';
    successMessage.textContent = `File [${res.filename}] telah tersimpan di folder Download Anda.`;
    statFilesEl.textContent = String(res.downloaded);
    statSizeEl.textContent = (res.totalBytes / 1024 / 1024).toFixed(2) + ' MB';
    statMemCleanEl.textContent = 'Purged';
    successCard.style.display = 'block';
  } catch (err) {
    log(`❌ Error: ${err.message}`, 'error');
    progress(0, 'Terjadi Kesalahan');
  } finally {
    btnStart.disabled = false;
  }
});

function waitForTabLoad(tabId, timeoutMs = 25000) {
  return new Promise((resolve) => {
    let resolved = false;
    const timer = setTimeout(() => {
      if (!resolved) {
        resolved = true;
        chrome.tabs.onUpdated.removeListener(listener);
        resolve();
      }
    }, timeoutMs);

    function listener(tId, changeInfo) {
      if (tId === tabId && changeInfo.status === 'complete') {
        if (!resolved) {
          resolved = true;
          clearTimeout(timer);
          chrome.tabs.onUpdated.removeListener(listener);
          setTimeout(resolve, 2500);
        }
      }
    }

    chrome.tabs.onUpdated.addListener(listener);
  });
}

btnStartBatch.addEventListener('click', async () => {
  const urls = getBatchUrls();
  if (urls.length === 0) {
    log('Daftar URL kosong! Tempel minimal 1 link template undangan.', 'warn');
    return;
  }

  await initTab();
  if (!activeTab?.id) {
    log('Tab aktif tidak ditemukan.', 'error');
    return;
  }

  isBatchRunning = true;
  shouldStopBatch = false;
  btnStartBatch.style.display = 'none';
  btnStopBatch.style.display = 'inline-flex';
  progressCard.style.display = 'block';
  successCard.style.display = 'none';
  batchQueueStatus.style.display = 'flex';
  logTerminal.innerHTML = '';

  const total = urls.length;
  let successCount = 0;
  let totalAllBytes = 0;

  log(`🚀 Memulai BATCH RUNNER untuk ${total} template undangan...`, 'info');

  for (let i = 0; i < total; i++) {
    if (shouldStopBatch) {
      log('⚠️ Batch dihentikan oleh pengguna.', 'warn');
      break;
    }

    const currentUrl = urls[i];
    queueStatusText.textContent = `Antrean: Template [${i + 1}/${total}] (${currentUrl.split('/').pop()})`;
    progress(Math.round((i / total) * 100), `[${i + 1}/${total}] Membuka halaman...`);
    log(`[${i + 1}/${total}] Membuka: ${currentUrl}`, 'info');

    try {
      await chrome.tabs.update(activeTab.id, { url: currentUrl });
      await waitForTabLoad(activeTab.id);

      const res = await scrapeSingleTab(activeTab.id, currentUrl, opts());
      successCount++;
      totalAllBytes += res.totalBytes || 0;

      if (i < total - 1) {
        log(`⏳ Jeda 2.5 detik sebelum memproses template berikutnya...`, 'info');
        await new Promise(r => setTimeout(r, 2500));
      }
    } catch (err) {
      log(`❌ Gagal memproses [${currentUrl}]: ${err.message}`, 'error');
    }
  }

  isBatchRunning = false;
  btnStartBatch.style.display = 'inline-flex';
  btnStopBatch.style.display = 'none';
  progress(100, `✅ Batch Selesai! (${successCount}/${total} Berhasil)`);

  successTitle.textContent = `Batch Download Selesai! (${successCount}/${total})`;
  successMessage.textContent = `${successCount} file ZIP template berhasil diunduh dengan COVER UTUH ke folder Download Anda.`;
  statFilesEl.textContent = String(successCount) + ' ZIP';
  statSizeEl.textContent = (totalAllBytes / 1024 / 1024).toFixed(2) + ' MB';
  statMemCleanEl.textContent = 'Purged';
  successCard.style.display = 'block';
  log(`🎉 Selesai! ${successCount} dari ${total} template berhasil diunduh lengkap!`, 'success');
});

btnStopBatch.addEventListener('click', () => {
  shouldStopBatch = true;
  log('Mengirim sinyal berhenti ke batch queue...', 'warn');
  btnStopBatch.disabled = true;
});
