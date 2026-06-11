#!/usr/bin/env node
import { createReadStream, existsSync } from 'node:fs';
import { readdir, readFile, stat } from 'node:fs/promises';
import { createServer } from 'node:http';
import { basename, dirname, extname, join, relative, resolve, sep } from 'node:path';
import { createInterface } from 'node:readline';
import { fileURLToPath } from 'node:url';

const VERSION = '0.1.0';
const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const DEFAULT_CONFIG = {
  host: '127.0.0.1',
  port: 8787,
  rawRoot: join(ROOT, 'raw_exports'),
  metadataPath: join(ROOT, 'mock_data_snapshot.json'),
  authToken: '',
  maxLimit: 2000,
  defaultLimit: 500,
  allowOrigins: [
    'http://localhost:3000',
    'http://localhost:4173',
    'http://127.0.0.1:3000',
    'http://127.0.0.1:4173',
    'https://brandgenome-cfo-operating-dashboard.vercel.app',
    'null'
  ]
};

const DATE_COLUMN_BY_DATASET = {
  real_cafe24_orders: 'order_date',
  real_cafe24_order_items: 'ordered_date',
  cafe24_products: 'updated_date',
  google_ads_campaign_daily: 'date',
  google_ads_ad_group_daily: 'date',
  google_ads_ad_daily: 'date',
  google_ads_search_terms: 'date',
  meta_ads_insights_daily: 'date',
  naver_gfa_manual_daily: 'date',
  naver_search_ad_stats: 'date',
  tiktok_business_daily: 'date',
  fx_rates: 'date'
};

function parseArgs(argv) {
  const args = { check: false };
  for (let i = 2; i < argv.length; i += 1) {
    const key = argv[i];
    const next = argv[i + 1];
    if (key === '--check') args.check = true;
    if (key === '--host' && next) args.host = next, i += 1;
    if (key === '--port' && next) args.port = Number(next), i += 1;
    if (key === '--raw-root' && next) args.rawRoot = resolve(next), i += 1;
    if (key === '--metadata' && next) args.metadataPath = resolve(next), i += 1;
    if (key === '--config' && next) args.configPath = resolve(next), i += 1;
  }
  return args;
}

async function loadConfig(args) {
  const localPath = args.configPath || join(ROOT, 'warehouse', 'config.local.json');
  let local = {};
  if (existsSync(localPath)) {
    local = JSON.parse(await readFile(localPath, 'utf8'));
  }
  const config = { ...DEFAULT_CONFIG, ...local, ...args };
  config.rawRoot = resolve(config.rawRoot);
  config.metadataPath = resolve(config.metadataPath);
  config.port = Number(config.port || DEFAULT_CONFIG.port);
  config.maxLimit = Number(config.maxLimit || DEFAULT_CONFIG.maxLimit);
  config.defaultLimit = Number(config.defaultLimit || DEFAULT_CONFIG.defaultLimit);
  return config;
}

async function walk(dir) {
  const out = [];
  if (!existsSync(dir)) return out;
  const entries = await readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) out.push(...await walk(full));
    if (entry.isFile()) out.push(full);
  }
  return out;
}

async function readSnapshotMetadata(metadataPath) {
  if (!existsSync(metadataPath)) return {};
  const raw = JSON.parse(await readFile(metadataPath, 'utf8'));
  return raw.raw_exports || {};
}

async function firstLine(file) {
  const stream = createReadStream(file, { encoding: 'utf8' });
  const rl = createInterface({ input: stream, crlfDelay: Infinity });
  for await (const line of rl) {
    rl.close();
    stream.destroy();
    return line;
  }
  return '';
}

async function countCsvRows(file) {
  let rows = -1;
  const stream = createReadStream(file, { encoding: 'utf8' });
  const rl = createInterface({ input: stream, crlfDelay: Infinity });
  for await (const _line of rl) rows += 1;
  return Math.max(0, rows);
}

function parseCsvLine(line) {
  const out = [];
  let value = '';
  let quoted = false;
  for (let i = 0; i < line.length; i += 1) {
    const ch = line[i];
    if (ch === '"') {
      if (quoted && line[i + 1] === '"') {
        value += '"';
        i += 1;
      } else {
        quoted = !quoted;
      }
    } else if (ch === ',' && !quoted) {
      out.push(value);
      value = '';
    } else {
      value += ch;
    }
  }
  out.push(value);
  return out;
}

function csvEscape(value) {
  const text = String(value == null ? '' : value);
  return /[",\n\r]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

function inferDateColumn(datasetId, columns) {
  if (DATE_COLUMN_BY_DATASET[datasetId]) return DATE_COLUMN_BY_DATASET[datasetId];
  return ['date', 'order_date', 'ordered_date', 'payment_date', 'created_date', 'updated_date', 'created_time', 'create_time']
    .find((column) => columns.includes(column)) || null;
}

function sourceIdFromPath(rawRoot, file) {
  const rel = relative(rawRoot, file).split(sep).join('/');
  return rel.includes('/') ? rel.split('/')[0] : 'root';
}

function labelFromId(id) {
  return id.split('_').map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join(' ');
}

async function buildCatalog(config) {
  const metadata = await readSnapshotMetadata(config.metadataPath);
  const csvFiles = (await walk(config.rawRoot)).filter((file) => extname(file).toLowerCase() === '.csv').sort();
  const datasets = [];
  for (const file of csvFiles) {
    const id = basename(file, '.csv');
    if (!/^[a-zA-Z0-9_-]+$/.test(id)) continue;
    const header = parseCsvLine(await firstLine(file));
    const meta = metadata[id] || {};
    const info = await stat(file);
    const rows = Number.isFinite(Number(meta.rows)) ? Number(meta.rows) : await countCsvRows(file);
    const sourceId = sourceIdFromPath(config.rawRoot, file);
    const relCsv = relative(config.rawRoot, file).split(sep).join('/');
    const jsonlFile = join(dirname(file), `${id}.jsonl`);
    datasets.push({
      id,
      source_id: sourceId,
      source_en: meta.source_en || meta.source || labelFromId(sourceId),
      source_ko: meta.source_ko || meta.source_en || meta.source || labelFromId(sourceId),
      label_en: meta.label_en || meta.panel || labelFromId(id),
      label_ko: meta.label_ko || meta.label_en || meta.panel || labelFromId(id),
      rows,
      coverage_start: meta.coverage_start || null,
      coverage_end: meta.coverage_end || null,
      caveat: meta.caveat || '',
      columns: Array.isArray(meta.columns) && meta.columns.length ? meta.columns : header,
      date_column: inferDateColumn(id, header),
      csv_path: file,
      csv_relative_path: relCsv,
      jsonl_path: existsSync(jsonlFile) ? jsonlFile : null,
      jsonl_relative_path: existsSync(jsonlFile) ? relative(config.rawRoot, jsonlFile).split(sep).join('/') : null,
      bytes: info.size
    });
  }
  const byId = new Map(datasets.map((dataset) => [dataset.id, dataset]));
  return { generated_at: new Date().toISOString(), raw_root: config.rawRoot, datasets, byId };
}

function toRecord(headers, cells, requestedColumns) {
  const row = {};
  const allowed = requestedColumns || headers;
  for (const column of allowed) {
    const idx = headers.indexOf(column);
    row[column] = idx >= 0 ? cells[idx] ?? '' : '';
  }
  return row;
}

function isInDateRange(value, from, to) {
  if (!value) return !from && !to;
  const date = String(value).slice(0, 10);
  if (from && date < from) return false;
  if (to && date > to) return false;
  return true;
}

function selectedColumns(dataset, params) {
  const raw = params.get('columns') || '';
  if (!raw.trim()) return dataset.columns;
  const requested = raw.split(',').map((item) => item.trim()).filter(Boolean);
  const allowed = new Set(dataset.columns);
  const columns = requested.filter((column) => allowed.has(column));
  return columns.length ? columns : dataset.columns;
}

async function queryDataset(dataset, params, config) {
  const limit = Math.min(Math.max(Number(params.get('limit') || config.defaultLimit), 1), config.maxLimit);
  const offset = Math.max(Number(params.get('offset') || 0), 0);
  const from = params.get('from') || '';
  const to = params.get('to') || '';
  const search = (params.get('search') || '').toLowerCase();
  const columns = selectedColumns(dataset, params);
  const dateColumn = params.get('date_column') || dataset.date_column;
  const dateIndex = dateColumn ? dataset.columns.indexOf(dateColumn) : -1;
  const rows = [];
  let matched = 0;
  let scanned = 0;
  const stream = createReadStream(dataset.csv_path, { encoding: 'utf8' });
  const rl = createInterface({ input: stream, crlfDelay: Infinity });
  let headerSeen = false;
  for await (const line of rl) {
    if (!headerSeen) {
      headerSeen = true;
      continue;
    }
    scanned += 1;
    if (!line) continue;
    const cells = parseCsvLine(line);
    if (dateIndex >= 0 && !isInDateRange(cells[dateIndex], from, to)) continue;
    if (search && !line.toLowerCase().includes(search)) continue;
    if (matched >= offset && rows.length < limit) rows.push(toRecord(dataset.columns, cells, columns));
    matched += 1;
  }
  const nextOffset = offset + rows.length < matched ? offset + rows.length : null;
  const prevOffset = offset > 0 ? Math.max(0, offset - limit) : null;
  return {
    dataset: dataset.id,
    source: dataset.source_en,
    label: dataset.label_en,
    columns,
    rows,
    total: matched,
    offset,
    limit,
    next_offset: nextOffset,
    prev_offset: prevOffset,
    scanned_rows: scanned,
    filters: { from: from || null, to: to || null, search: search || null, date_column: dateColumn || null }
  };
}

async function streamExport(res, dataset, params) {
  const format = params.get('format') === 'jsonl' ? 'jsonl' : 'csv';
  const columns = selectedColumns(dataset, params);
  const from = params.get('from') || '';
  const to = params.get('to') || '';
  const search = (params.get('search') || '').toLowerCase();
  const dateColumn = params.get('date_column') || dataset.date_column;
  const dateIndex = dateColumn ? dataset.columns.indexOf(dateColumn) : -1;
  res.writeHead(200, {
    'Content-Type': format === 'jsonl' ? 'application/x-ndjson; charset=utf-8' : 'text/csv; charset=utf-8',
    'Content-Disposition': `attachment; filename="${dataset.id}.${format}"`
  });
  if (format === 'csv') res.write(`${columns.map(csvEscape).join(',')}\n`);
  const stream = createReadStream(dataset.csv_path, { encoding: 'utf8' });
  const rl = createInterface({ input: stream, crlfDelay: Infinity });
  let headerSeen = false;
  for await (const line of rl) {
    if (!headerSeen) {
      headerSeen = true;
      continue;
    }
    if (!line) continue;
    const cells = parseCsvLine(line);
    if (dateIndex >= 0 && !isInDateRange(cells[dateIndex], from, to)) continue;
    if (search && !line.toLowerCase().includes(search)) continue;
    const row = toRecord(dataset.columns, cells, columns);
    if (format === 'jsonl') {
      res.write(`${JSON.stringify(row)}\n`);
    } else {
      res.write(`${columns.map((column) => csvEscape(row[column])).join(',')}\n`);
    }
  }
  res.end();
}

function publicDataset(dataset) {
  const { csv_path, jsonl_path, ...safe } = dataset;
  return safe;
}

function groupDatasets(datasets) {
  const groups = new Map();
  for (const dataset of datasets) {
    const key = dataset.source_id;
    if (!groups.has(key)) {
      groups.set(key, {
        source_id: key,
        source_en: dataset.source_en,
        source_ko: dataset.source_ko,
        panels: []
      });
    }
    groups.get(key).panels.push({
      id: dataset.id,
      label_en: dataset.label_en,
      label_ko: dataset.label_ko,
      rows: dataset.rows,
      coverage_start: dataset.coverage_start,
      coverage_end: dataset.coverage_end,
      columns: dataset.columns,
      date_column: dataset.date_column
    });
  }
  return Array.from(groups.values());
}

function corsHeaders(req, config) {
  const origin = req.headers.origin || '*';
  const allowed = config.allowOrigins.includes('*') || config.allowOrigins.includes(origin) || (origin === 'null' && config.allowOrigins.includes('null'));
  return {
    'Access-Control-Allow-Origin': allowed ? origin : config.allowOrigins[0] || '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, X-Warehouse-Token',
    'Access-Control-Max-Age': '86400',
    'Vary': 'Origin'
  };
}

function sendJson(req, res, config, status, body) {
  res.writeHead(status, {
    ...corsHeaders(req, config),
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store'
  });
  res.end(JSON.stringify(body));
}

function unauthorized(req, res, config) {
  sendJson(req, res, config, 401, { error: 'unauthorized', message: 'Missing or invalid X-Warehouse-Token.' });
}

function authorize(req, url, config) {
  if (!config.authToken) return true;
  const supplied = req.headers['x-warehouse-token'] || url.searchParams.get('token') || '';
  return supplied === config.authToken;
}

async function handle(req, res, config, catalog) {
  if (req.method === 'OPTIONS') {
    res.writeHead(204, corsHeaders(req, config));
    res.end();
    return;
  }
  const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  if (!authorize(req, url, config)) return unauthorized(req, res, config);

  if (url.pathname === '/health') {
    return sendJson(req, res, config, 200, {
      ok: true,
      version: VERSION,
      generated_at: catalog.generated_at,
      dataset_count: catalog.datasets.length,
      raw_root: catalog.raw_root
    });
  }

  if (url.pathname === '/api/raw/sources') {
    return sendJson(req, res, config, 200, {
      generated_at: catalog.generated_at,
      groups: groupDatasets(catalog.datasets),
      datasets: catalog.datasets.map(publicDataset)
    });
  }

  if (url.pathname === '/api/raw/query') {
    const dataset = catalog.byId.get(url.searchParams.get('dataset') || '');
    if (!dataset) return sendJson(req, res, config, 404, { error: 'dataset_not_found' });
    return sendJson(req, res, config, 200, await queryDataset(dataset, url.searchParams, config));
  }

  if (url.pathname === '/api/raw/export') {
    const dataset = catalog.byId.get(url.searchParams.get('dataset') || '');
    if (!dataset) return sendJson(req, res, config, 404, { error: 'dataset_not_found' });
    const headers = corsHeaders(req, config);
    Object.entries(headers).forEach(([key, value]) => res.setHeader(key, value));
    return streamExport(res, dataset, url.searchParams);
  }

  return sendJson(req, res, config, 404, { error: 'not_found' });
}

async function main() {
  const args = parseArgs(process.argv);
  const config = await loadConfig(args);
  const catalog = await buildCatalog(config);

  if (args.check) {
    const rows = catalog.datasets.reduce((sum, item) => sum + Number(item.rows || 0), 0);
    console.log(JSON.stringify({
      ok: true,
      version: VERSION,
      raw_root: catalog.raw_root,
      dataset_count: catalog.datasets.length,
      declared_rows: rows,
      largest_dataset: catalog.datasets.slice().sort((a, b) => b.rows - a.rows)[0]?.id || null
    }, null, 2));
    return;
  }

  const server = createServer((req, res) => {
    handle(req, res, config, catalog).catch((error) => {
      sendJson(req, res, config, 500, { error: 'server_error', message: error.message });
    });
  });
  server.listen(config.port, config.host, () => {
    console.log(`Warehouse API ${VERSION} listening on http://${config.host}:${config.port}`);
    console.log(`Raw root: ${catalog.raw_root}`);
    console.log(`Datasets: ${catalog.datasets.length}`);
  });
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
