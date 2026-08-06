const express = require('express');
const path = require('path');
const { parseM3u } = require('./parseM3u');

const ROOT = path.join(__dirname, '..');
const FILE_ALL = path.join(ROOT, 'canais-https.m3u');
const WORKING_FILES = [
  'funcionando-https-m3u8.m3u',
  'funcionando-https-mpd.m3u',
  'funcionando-https-mp3.m3u',
  'funcionando-https-aac.m3u',
  'funcionando-https-m3u.m3u',
  'funcionando-https-png.m3u',
  'funcionando-https-outros.m3u',
].map((f) => path.join(ROOT, f));

let allChannels = null;
let workingChannels = null;

function getAll() {
  if (!allChannels) allChannels = parseM3u(FILE_ALL);
  return allChannels;
}

function getWorking() {
  if (!workingChannels) {
    const map = new Map();
    for (const f of WORKING_FILES) {
      for (const ch of parseM3u(f)) {
        if (!map.has(ch.url)) map.set(ch.url, ch);
      }
    }
    workingChannels = [...map.values()];
  }
  return workingChannels;
}

function extOf(url) {
  let s = url.split('?')[0].split('#')[0];
  const m = /\.([a-z0-9]{2,5})$/i.exec(s);
  return m ? m[1].toLowerCase() : 'outros';
}

function toM3u(channels) {
  const lines = ['#EXTM3U'];
  for (const ch of channels) {
    const attrs = [];
    if (ch.tvgId) attrs.push(`tvg-id="${ch.tvgId}"`);
    if (ch.tvgLogo) attrs.push(`tvg-logo="${ch.tvgLogo}"`);
    if (ch.groupTitle) attrs.push(`group-title="${ch.groupTitle}"`);
    lines.push(`#EXTINF:-1${attrs.length ? ' ' + attrs.join(' ') : ''},${ch.name}`);
    lines.push(ch.url);
  }
  return lines.join('\n');
}

function paginate(list, req) {
  const page = Math.max(1, parseInt(req.query.page, 10) || 1);
  const limit = Math.min(200, Math.max(1, parseInt(req.query.limit, 10) || 50));
  const start = (page - 1) * limit;
  return {
    total: list.length,
    page,
    limit,
    data: list.slice(start, start + limit),
  };
}

const router = express.Router();

router.get('/playlist', (req, res) => {
  res.set('Content-Type', 'application/vnd.apple.mpegurl');
  res.sendFile(FILE_ALL);
});

router.get('/', (req, res) => {
  res.json(paginate(getAll(), req));
});

router.get('/funcionando/playlist', (req, res) => {
  const ext = req.query.ext ? req.query.ext.toLowerCase() : null;
  let list = getWorking();
  if (ext) list = list.filter((c) => extOf(c.url) === ext);
  res.set('Content-Type', 'application/vnd.apple.mpegurl');
  res.send(toM3u(list));
});

router.get('/funcionando', (req, res) => {
  const ext = req.query.ext ? req.query.ext.toLowerCase() : null;
  let list = getWorking();
  if (ext) list = list.filter((c) => extOf(c.url) === ext);
  res.json(paginate(list, req));
});

module.exports = router;
