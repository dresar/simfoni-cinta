---
name: turnstile-spin
description: Set up and maintain Cloudflare Turnstile end-to-end bot protection with canonical siteverify validation, widget rendering, and token lifecycle management.
---

# Turnstile Spin Skill

Panduan integrasi Cloudflare Turnstile end-to-end untuk website Simfoni Cinta:

## Kredensial Widget & Hostname
- **Site Key**: `0x4AAAAAAEk8E0wrrh4LV7N-`
- **Secret Key**: `TURNSTILE_SECRET` (disimpan aman di `.env` dan Cloudflare Pages Secrets)
- **Mode**: `managed`
- **Allowed Hostnames**: `simfonicinta.my.id`, `www.simfonicinta.my.id`, `simfoni-cinta.pages.dev`, `localhost`, `127.0.0.1`

## Frontend Implementation Contract
- Script API: `https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit`
- Render options:
  - `sitekey`: `0x4AAAAAAEk8E0wrrh4LV7N-`
  - `action`: `"login"` (atau surface action yang sesuai)
  - `theme`: `"dark"`
  - `retry`: `"auto"`
- Token single-use: selalu panggil `window.turnstile.reset(widgetId)` setelah token dikonsumsi atau jika verifikasi gagal.

## Backend Canonical Siteverify Contract
- Endpoint: `https://challenges.cloudflare.com/turnstile/v0/siteverify`
- Validasi wajib:
  1. Token string panjang 1 - 2048 karakter.
  2. `POST` form URL-encoded dengan `secret` dan `response` (token).
  3. `AbortSignal.timeout(10000)`.
  4. Cek `outcome.success === true`.
  5. Cek `outcome.action === expectedAction`.
  6. Cek `outcome.hostname` terdaftar di allowlist hostname.
