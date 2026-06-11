#!/usr/bin/env node
const localBase = process.env.WAREHOUSE_LOCAL_URL || 'http://127.0.0.1:8787';
const publicBase = process.env.WAREHOUSE_PUBLIC_URL || '';

async function checkUrl(label, url) {
  try {
    const res = await fetch(url, { redirect: 'manual' });
    const text = await res.text().catch(() => '');
    return {
      label,
      url,
      ok: res.ok,
      status: res.status,
      location: res.headers.get('location') || null,
      server: res.headers.get('server') || null,
      accessProtected: /cloudflareaccess|cdn-cgi\/access|CF-Authorization/i.test(text + ' ' + (res.headers.get('location') || ''))
    };
  } catch (error) {
    return { label, url, ok: false, status: 0, error: error.message };
  }
}

const checks = [];
checks.push(await checkUrl('local warehouse', `${localBase.replace(/\/+$/, '')}/health`));
if (publicBase) checks.push(await checkUrl('cloudflare warehouse', `${publicBase.replace(/\/+$/, '')}/health`));

console.log(JSON.stringify({
  ok: checks.every((item) => item.ok || item.accessProtected),
  checks,
  next: publicBase
    ? 'If the Cloudflare URL is Access-protected, open it in a browser and complete the Access login before testing from the dashboard.'
    : 'Set WAREHOUSE_PUBLIC_URL=https://<warehouse-hostname> to check the Cloudflare Tunnel/Access endpoint.'
}, null, 2));
