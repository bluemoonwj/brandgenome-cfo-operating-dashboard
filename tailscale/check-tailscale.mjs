#!/usr/bin/env node
const localBase = process.env.WAREHOUSE_LOCAL_URL || 'http://127.0.0.1:8787';
const publicBase = process.env.TAILSCALE_WAREHOUSE_URL || process.env.WAREHOUSE_PUBLIC_URL || '';
const token = process.env.WAREHOUSE_TOKEN || '';

function headers() {
  return token ? { 'X-Warehouse-Token': token } : {};
}

async function checkUrl(label, url, expectPublic) {
  try {
    const res = await fetch(url, { headers: headers(), redirect: 'manual' });
    const text = await res.text().catch(() => '');
    return {
      label,
      url,
      ok: res.ok,
      status: res.status,
      tokenSupplied: Boolean(token),
      tls: url.startsWith('https://'),
      tailscaleHost: /\.ts\.net(?::|\/|$)/i.test(url),
      authRequired: res.status === 401,
      hint: res.status === 401
        ? 'Set WAREHOUSE_TOKEN to the same value as warehouse/config.local.json authToken.'
        : expectPublic && !url.startsWith('https://')
          ? 'Use the Tailscale Funnel HTTPS URL, not a local HTTP URL.'
          : undefined,
      bodyPreview: res.ok ? undefined : text.slice(0, 160)
    };
  } catch (error) {
    return { label, url, ok: false, status: 0, tokenSupplied: Boolean(token), error: error.message };
  }
}

const checks = [];
checks.push(await checkUrl('local warehouse', `${localBase.replace(/\/+$/, '')}/health`, false));
if (publicBase) checks.push(await checkUrl('tailscale funnel warehouse', `${publicBase.replace(/\/+$/, '')}/health`, true));

console.log(JSON.stringify({
  ok: checks.every((item) => item.ok),
  checks,
  next: publicBase
    ? 'Put the Tailscale HTTPS URL and warehouse token into the dashboard Raw Data controls.'
    : 'Set TAILSCALE_WAREHOUSE_URL=https://<machine>.<tailnet>.ts.net and WAREHOUSE_TOKEN=<token> to check the public Funnel endpoint.'
}, null, 2));
