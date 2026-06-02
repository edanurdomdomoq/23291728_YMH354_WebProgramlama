import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import pg from 'pg';

const { Pool } = pg;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbPath = path.join(__dirname, '../../data/db.json');

let pool;
let ensuredDatabasePromise;

const initialData = {
  users: [
    {
      id: 'seed-admin',
      name: 'Klinik Admin',
      email: 'admin@mindcare.test',
      passwordHash: '$2a$10$fyz9uzJxLwhLZ5zJ3WnFHu9vngcL/z4ffWzTiN1BIMM0LN.lcAIG.',
      role: 'doctor',
      createdAt: '2026-05-30T00:00:00.000Z'
    }
  ],
  tasks: [],
  aiPlans: [],
  appointments: [],
  sessions: [],
  reviews: [],
  guestUsers: [],
  messages: [],
  services: [
    {
      id: 'online-terapi',
      title: 'Online Terapi',
      summary: 'Zamandan ve mekandan bağımsız, güvenli görüşme altyapısı ile psikolojik destek.',
      icon: 'Monitor',
      published: true
    },
    {
      id: 'ergen-terapisi',
      title: 'Ergen Terapisi',
      summary: 'Kimlik, aile, okul ve duygu düzenleme süreçlerinde ergenlere destek.',
      icon: 'Users',
      published: true
    },
    {
      id: 'cift-terapisi',
      title: 'Evlilik ve Çift Terapisi',
      summary: 'İletişim, güven ve çatışmaları yapıcı şekilde ele alan profesyonel süreç.',
      icon: 'Heart',
      published: true
    },
    {
      id: 'cinsel-terapi',
      title: 'Cinsel Terapi',
      summary: 'Cinsel yaşam, yakınlık ve ilişki dinamiklerini güvenli bir uzmanlık alanında ele alan destek süreci.',
      icon: 'Heart',
      published: true
    }
  ],
  posts: [
    {
      id: 'ergen-terapisi-rehberi',
      title: 'Fırtınalı Denizde Pusula Olmak: Ergen Terapisinin Rehberliği',
      date: '28 Mar 2026',
      excerpt: 'Ergenlik, hem fiziksel hem de ruhsal sınırların zorlandığı, çocukluktan yetişkinliğe uzanan fırtınalı bir köprüdür.',
      image: '/social-media/instagram/gorsel2.png',
      published: true
    },
    {
      id: 'zamanin-bilgeligine-dokunmak',
      title: 'Zamanın Bilgeliğine Dokunmak',
      date: '17 Mar 2026',
      excerpt: 'Yaş almanın getirdiği değişimleri anlamak, ilişki kurmak ve yaşam kalitesini desteklemek üzerine notlar.',
      image: '/social-media/instagram/gorsel1.png',
      published: true
    }
  ]
};

function usesPostgres() {
  return Boolean(process.env.DATABASE_URL);
}

function getPool() {
  if (!pool) {
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.DATABASE_SSL === 'true' ? { rejectUnauthorized: false } : false
    });
  }
  return pool;
}

async function ensureJsonDatabase() {
  await fs.mkdir(path.dirname(dbPath), { recursive: true });
  try {
    await fs.access(dbPath);
    const current = JSON.parse(await fs.readFile(dbPath, 'utf-8'));
    const merged = { ...initialData, ...current };
    merged.services = [
      ...(current.services || []),
      ...initialData.services.filter((seed) => !(current.services || []).some((item) => item.id === seed.id))
    ];
    merged.posts = [
      ...(current.posts || []),
      ...initialData.posts.filter((seed) => !(current.posts || []).some((item) => item.id === seed.id))
    ];
    merged.users = [
      ...(current.users || []),
      ...initialData.users.filter((seed) => !(current.users || []).some((item) => item.email === seed.email))
    ];
    await fs.writeFile(dbPath, JSON.stringify(merged, null, 2));
  } catch {
    await fs.writeFile(dbPath, JSON.stringify(initialData, null, 2));
  }
}

async function ensurePostgresDatabase() {
  const sql = `
    CREATE TABLE IF NOT EXISTS doktorlar (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'doctor',
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      data JSONB NOT NULL DEFAULT '{}'::jsonb
    );
    CREATE TABLE IF NOT EXISTS basvurular (
      id TEXT PRIMARY KEY,
      code_name TEXT,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      phone TEXT NOT NULL,
      service TEXT NOT NULL,
      message TEXT,
      preferred_date DATE,
      preferred_time TEXT,
      status TEXT NOT NULL DEFAULT 'pending',
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      data JSONB NOT NULL DEFAULT '{}'::jsonb
    );
    CREATE TABLE IF NOT EXISTS seanslar (
      id TEXT PRIMARY KEY,
      appointment_id TEXT,
      code_name TEXT,
      anonymous_notes TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      data JSONB NOT NULL DEFAULT '{}'::jsonb
    );
    CREATE TABLE IF NOT EXISTS yorumlar (
      id TEXT PRIMARY KEY,
      appointment_id TEXT,
      text TEXT NOT NULL,
      stars INTEGER,
      published BOOLEAN NOT NULL DEFAULT TRUE,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      data JSONB NOT NULL DEFAULT '{}'::jsonb
    );
    CREATE TABLE IF NOT EXISTS misafirler (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      provider TEXT DEFAULT 'guest',
      role TEXT DEFAULT 'guest',
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      data JSONB NOT NULL DEFAULT '{}'::jsonb
    );
    CREATE TABLE IF NOT EXISTS mesajlar (
      id TEXT PRIMARY KEY,
      guest_id TEXT,
      guest_name TEXT,
      guest_email TEXT,
      subject TEXT NOT NULL,
      body TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'unread',
      reply TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      read_at TIMESTAMPTZ,
      replied_at TIMESTAMPTZ,
      data JSONB NOT NULL DEFAULT '{}'::jsonb
    );
    CREATE TABLE IF NOT EXISTS hizmetler (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      summary TEXT,
      icon TEXT,
      published BOOLEAN NOT NULL DEFAULT TRUE,
      data JSONB NOT NULL DEFAULT '{}'::jsonb
    );
    CREATE TABLE IF NOT EXISTS blog_yazilari (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      date TEXT,
      excerpt TEXT,
      image TEXT,
      published BOOLEAN NOT NULL DEFAULT TRUE,
      created_at TIMESTAMPTZ,
      updated_at TIMESTAMPTZ,
      data JSONB NOT NULL DEFAULT '{}'::jsonb
    );
  `;
  await getPool().query(sql);

  const { rows } = await getPool().query('SELECT COUNT(*)::int AS count FROM doktorlar');
  if (rows[0].count === 0) {
    await writePostgresDb(initialData);
  } else {
    const current = await readPostgresDb();
    const beforeCounts = {
      services: current.services?.length || 0,
      posts: current.posts?.length || 0,
      users: current.users?.length || 0
    };
    current.services = [
      ...(current.services || []),
      ...initialData.services.filter((seed) => !(current.services || []).some((item) => item.id === seed.id))
    ];
    current.posts = [
      ...(current.posts || []),
      ...initialData.posts.filter((seed) => !(current.posts || []).some((item) => item.id === seed.id))
    ];
    current.users = [
      ...(current.users || []),
      ...initialData.users.filter((seed) => !(current.users || []).some((item) => item.email === seed.email))
    ];
    const changed =
      (current.services?.length || 0) !== beforeCounts.services ||
      (current.posts?.length || 0) !== beforeCounts.posts ||
      (current.users?.length || 0) !== beforeCounts.users;
    if (changed) {
      await writePostgresDb(current);
    }
  }
}

function normalizeDate(value) {
  if (!value) return null;
  if (typeof value === 'string') return value.slice(0, 10);
  const date = new Date(value);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

function normalizeDateTime(value) {
  if (!value) return null;
  return new Date(value).toISOString();
}

function rowData(row) {
  return row.data || {};
}

async function readPostgresDb() {
  const db = {};
  const client = getPool();

  db.users = (await client.query('SELECT * FROM doktorlar ORDER BY created_at')).rows.map((row) => ({
    ...rowData(row),
    id: row.id,
    name: row.name,
    email: row.email,
    passwordHash: row.password_hash,
    role: row.role,
    createdAt: normalizeDateTime(row.created_at)
  }));

  db.appointments = (await client.query('SELECT * FROM basvurular ORDER BY created_at')).rows.map((row) => ({
    ...rowData(row),
    id: row.id,
    codeName: row.code_name,
    name: row.name,
    email: row.email,
    phone: row.phone,
    service: row.service,
    message: row.message || '',
    preferredDate: normalizeDate(row.preferred_date),
    preferredTime: row.preferred_time,
    status: row.status,
    createdAt: normalizeDateTime(row.created_at)
  }));

  db.sessions = (await client.query('SELECT * FROM seanslar ORDER BY created_at')).rows.map((row) => ({
    ...rowData(row),
    id: row.id,
    appointmentId: row.appointment_id,
    codeName: row.code_name,
    anonymousNotes: row.anonymous_notes || '',
    createdAt: normalizeDateTime(row.created_at)
  }));

  db.reviews = (await client.query('SELECT * FROM yorumlar ORDER BY created_at')).rows.map((row) => ({
    ...rowData(row),
    id: row.id,
    appointmentId: row.appointment_id,
    text: row.text,
    published: row.published,
    createdAt: normalizeDateTime(row.created_at)
  }));

  db.guestUsers = (await client.query('SELECT * FROM misafirler ORDER BY created_at')).rows.map((row) => ({
    ...rowData(row),
    id: row.id,
    name: row.name,
    email: row.email,
    provider: row.provider,
    role: row.role,
    createdAt: normalizeDateTime(row.created_at)
  }));

  db.messages = (await client.query('SELECT * FROM mesajlar ORDER BY created_at')).rows.map((row) => ({
    ...rowData(row),
    id: row.id,
    guestId: row.guest_id,
    guestName: row.guest_name,
    guestEmail: row.guest_email,
    subject: row.subject,
    body: row.body,
    status: row.status,
    reply: row.reply,
    createdAt: normalizeDateTime(row.created_at),
    readAt: normalizeDateTime(row.read_at),
    repliedAt: normalizeDateTime(row.replied_at)
  }));

  db.services = (await client.query('SELECT * FROM hizmetler ORDER BY title')).rows.map((row) => ({
    ...rowData(row),
    id: row.id,
    title: row.title,
    summary: row.summary,
    icon: row.icon,
    published: row.published
  }));

  db.posts = (await client.query('SELECT * FROM blog_yazilari ORDER BY COALESCE(created_at, NOW())')).rows.map((row) => ({
    ...rowData(row),
    id: row.id,
    title: row.title,
    date: row.date,
    excerpt: row.excerpt,
    image: row.image,
    published: row.published,
    createdAt: normalizeDateTime(row.created_at),
    updatedAt: normalizeDateTime(row.updated_at)
  }));

  db.tasks = [];
  db.aiPlans = [];

  return db;
}

async function replaceTable(client, table, rows, insertSql, mapper) {
  await client.query(`DELETE FROM ${table}`);
  for (const row of rows || []) {
    await client.query(insertSql, mapper(row));
  }
}

async function writePostgresDb(data) {
  const client = await getPool().connect();
  try {
    await client.query('BEGIN');
    await replaceTable(client, 'doktorlar', data.users, `
      INSERT INTO doktorlar (id, name, email, password_hash, role, created_at, data)
      VALUES ($1,$2,$3,$4,$5,$6,$7::jsonb)
      ON CONFLICT (id) DO UPDATE SET name=EXCLUDED.name, email=EXCLUDED.email, password_hash=EXCLUDED.password_hash, role=EXCLUDED.role, data=EXCLUDED.data
    `, (item) => [item.id, item.name, item.email, item.passwordHash, item.role || 'doctor', item.createdAt || new Date().toISOString(), JSON.stringify(item)]);

    await replaceTable(client, 'basvurular', data.appointments, `
      INSERT INTO basvurular (id, code_name, name, email, phone, service, message, preferred_date, preferred_time, status, created_at, data)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12::jsonb)
    `, (item) => [item.id, item.codeName, item.name, item.email, item.phone, item.service, item.message || '', item.preferredDate || null, item.preferredTime || null, item.status || 'pending', item.createdAt || new Date().toISOString(), JSON.stringify(item)]);

    await replaceTable(client, 'seanslar', data.sessions, `
      INSERT INTO seanslar (id, appointment_id, code_name, anonymous_notes, created_at, data)
      VALUES ($1,$2,$3,$4,$5,$6::jsonb)
    `, (item) => [item.id, item.appointmentId, item.codeName, item.anonymousNotes || '', item.createdAt || new Date().toISOString(), JSON.stringify(item)]);

    await replaceTable(client, 'yorumlar', data.reviews, `
      INSERT INTO yorumlar (id, appointment_id, text, stars, published, created_at, data)
      VALUES ($1,$2,$3,$4,$5,$6,$7::jsonb)
    `, (item) => [item.id, item.appointmentId || null, item.text, item.ai?.stars || null, item.published ?? true, item.createdAt || new Date().toISOString(), JSON.stringify(item)]);

    await replaceTable(client, 'misafirler', data.guestUsers, `
      INSERT INTO misafirler (id, name, email, provider, role, created_at, data)
      VALUES ($1,$2,$3,$4,$5,$6,$7::jsonb)
    `, (item) => [item.id, item.name, item.email, item.provider || 'guest', item.role || 'guest', item.createdAt || new Date().toISOString(), JSON.stringify(item)]);

    await replaceTable(client, 'mesajlar', data.messages, `
      INSERT INTO mesajlar (id, guest_id, guest_name, guest_email, subject, body, status, reply, created_at, read_at, replied_at, data)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12::jsonb)
    `, (item) => [item.id, item.guestId, item.guestName, item.guestEmail, item.subject, item.body, item.status || 'unread', item.reply || null, item.createdAt || new Date().toISOString(), item.readAt || null, item.repliedAt || null, JSON.stringify(item)]);

    await replaceTable(client, 'hizmetler', data.services, `
      INSERT INTO hizmetler (id, title, summary, icon, published, data)
      VALUES ($1,$2,$3,$4,$5,$6::jsonb)
    `, (item) => [item.id, item.title, item.summary || '', item.icon || 'Heart', item.published ?? true, JSON.stringify(item)]);

    await replaceTable(client, 'blog_yazilari', data.posts, `
      INSERT INTO blog_yazilari (id, title, date, excerpt, image, published, created_at, updated_at, data)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9::jsonb)
    `, (item) => [item.id, item.title, item.date || '', item.excerpt || '', item.image || '', item.published ?? true, item.createdAt || null, item.updatedAt || null, JSON.stringify(item)]);

    await client.query('COMMIT');
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

export async function ensureDatabase() {
  if (!ensuredDatabasePromise) {
    ensuredDatabasePromise = usesPostgres() ? ensurePostgresDatabase() : ensureJsonDatabase();
  }
  return ensuredDatabasePromise;
}

export async function readDb() {
  await ensureDatabase();
  if (usesPostgres()) return readPostgresDb();
  const raw = await fs.readFile(dbPath, 'utf-8');
  return JSON.parse(raw);
}

export async function writeDb(data) {
  if (usesPostgres()) {
    await writePostgresDb(data);
    return;
  }
  await fs.writeFile(dbPath, JSON.stringify(data, null, 2));
}
