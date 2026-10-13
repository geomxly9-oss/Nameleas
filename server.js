// Nameleas Events — zero-dependency Node.js server.
// Serves the website from ./public and stores bookings in ./data/bookings.json.
//
//   ADMIN_PASSWORD=secret PORT=3000 node server.js

const http = require('http');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const PORT = Number(process.env.PORT) || 3000;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'changeme';
const PUBLIC_DIR = path.join(__dirname, 'public');
const DATA_FILE = path.join(__dirname, 'data', 'bookings.json');

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.ico': 'image/x-icon',
};

const EVENT_TYPES = ['Wedding', 'Corporate', 'Birthday / Party', 'Concert / Festival', 'Other'];
const PACKAGES = ['Basic', 'Standard', 'Premium', 'Not sure yet'];
const LOCATIONS = ['City Centre', 'North', 'South', 'East', 'West'];
const STATUSES =['pending', 'confirmed', 'completed', 'cancelled'];

function loadBookings() {
  try {
    return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
  } catch {
    return [];
  }
}

function saveBookings(list) {
  fs.mkdirSync(path.dirname(DATA_FILE), { recursive: true });
  fs.writeFileSync(DATA_FILE, JSON.stringify(list, null, 2));
}

function send(res, status, body) {
  res.writeHead(status, { 'Content-Type': MIME['.json'] });
  res.end(JSON.stringify(body));
}

function readJson(req) {
  return new Promise((resolve, reject) => {
    let raw = '';
    req.on('data', (chunk) => {
      raw += chunk;
      if (raw.length > 20_000) reject(new Error('Request too large'));
    });
    req.on('end', () => {
      try {
        resolve(JSON.parse(raw || '{}'));
      } catch {
        reject(new Error('Invalid JSON'));
      }
    });
  });
}

function isAdmin(req) {
  const given = Buffer.from(String(req.headers['x-admin-password'] || ''));
  const expected = Buffer.from(ADMIN_PASSWORD);
  return given.length === expected.length && crypto.timingSafeEqual(given, expected);
}

function validateBooking(input) {
  const str = (v, max = 200) => String(v ?? '').trim().slice(0, max);
  const b = {
    name: str(input.name),
    phone: str(input.phone, 40),
    email: str(input.email),
    eventType: str(input.eventType),
    package: str(input.package),
    date: str(input.date, 10),
    guests: Number(input.guests),
    location: str(input.location),
    venue: str(input.venue),
    notes: str(input.notes, 2000),
  };
  if (b.location === 'Other') b.location = str(input.otherLocation);
  else if (!LOCATIONS.includes(b.location)) b.location = '';
  if (!b.name || !b.phone) return { error: 'Name and phone are required.' };
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(b.email)) return { error: 'Please enter a valid email.' };
  if (!EVENT_TYPES.includes(b.eventType)) return { error: 'Please choose an event type.' };
  if (!PACKAGES.includes(b.package)) return { error: 'Please choose a package.' };
  if (!/^\d{4}-\d{2}-\d{2}$/.test(b.date) || b.date < new Date().toISOString().slice(0, 10)) {
    return { error: 'Please choose a future event date.' };
  }
  if (!b.location) return { error: 'Please choose a location.' };
  if (!Number.isInteger(b.guests) || b.guests < 1 || b.guests > 10000) {
    return { error: 'Guests must be between 1 and 10,000.' };
  }
  return { booking: b };
}

async function handleApi(req, res, url) {
  if (url.pathname === '/api/bookings' && req.method === 'POST') {
    const { booking, error } = validateBooking(await readJson(req));
    if (error) return send(res, 400, { error });
    const list = loadBookings();
    const record = {
      id: 'NE-' + crypto.randomBytes(3).toString('hex').toUpperCase(),
      ...booking,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };
    list.push(record);
    saveBookings(list);
    console.log(`New booking ${record.id}: ${record.eventType} on ${record.date} for ${record.name}`);
    return send(res, 201, { booking: { id: record.id } });
  }

  if (url.pathname === '/api/bookings' && req.method === 'GET') {
    if (!isAdmin(req)) return send(res, 401, { error: 'Wrong password' });
    return send(res, 200, { bookings: loadBookings() });
  }

  const match = url.pathname.match(/^\/api\/bookings\/([\w-]+)$/);
  if (match && req.method === 'PATCH') {
    if (!isAdmin(req)) return send(res, 401, { error: 'Wrong password' });
    const { status } = await readJson(req);
    if (!STATUSES.includes(status)) return send(res, 400, { error: 'Invalid status' });
    const list = loadBookings();
    const item = list.find((b) => b.id === match[1]);
    if (!item) return send(res, 404, { error: 'Booking not found' });
    item.status = status;
    saveBookings(list);
    return send(res, 200, { booking: item });
  }

  send(res, 404, { error: 'Not found' });
}

function serveStatic(res, url) {
  const rel = url.pathname === '/' ? '/index.html' : decodeURIComponent(url.pathname);
  const file = path.normalize(path.join(PUBLIC_DIR, rel));
  if (!file.startsWith(PUBLIC_DIR + path.sep)) {
    res.writeHead(403);
    return res.end('Forbidden');
  }
  fs.readFile(file, (err, content) => {
    if (err) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      return res.end('Not found');
    }
    res.writeHead(200, { 'Content-Type': MIME[path.extname(file)] || 'application/octet-stream' });
    res.end(content);
  });
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  try {
    if (url.pathname.startsWith('/api/')) return await handleApi(req, res, url);
    serveStatic(res, url);
  } catch (err) {
    send(res, 400, { error: err.message });
  }
});

if (require.main === module) {
  if (!process.env.ADMIN_PASSWORD) {
    console.warn('Warning: ADMIN_PASSWORD not set — using default "changeme".');
  }
  server.listen(PORT, () => console.log(`Nameleas Events running at http://localhost:${PORT}`));
}

module.exports = { server, validateBooking };
