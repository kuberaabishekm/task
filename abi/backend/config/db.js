const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
const seedHotels = require('./seedData');

require('dotenv').config();

// PostgreSQL Pool configuration
const poolConfig = process.env.DATABASE_URL
  ? {
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
    }
  : {
      user: process.env.PGUSER || 'postgres',
      host: process.env.PGHOST || 'localhost',
      database: process.env.PGDATABASE || 'hotel_management',
      password: process.env.PGPASSWORD || 'postgres',
      port: parseInt(process.env.PGPORT || '5432', 10),
      connectionTimeoutMillis: 3000
    };

let activeDriver = 'pg';
let realPool = null;
let fallbackDb = null;
let fallbackPg = null;
let fallbackPool = null;

const DATA_DIR = path.join(__dirname, '..', 'data');
const BACKUP_FILE = path.join(DATA_DIR, 'hotels_db.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const CREATE_TABLE_SQL = `
CREATE TABLE IF NOT EXISTS hotels (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  image VARCHAR(500) NOT NULL,
  latitude DECIMAL NOT NULL,
  longitude DECIMAL NOT NULL,
  price DECIMAL NOT NULL,
  rating DECIMAL DEFAULT 4.5,
  category VARCHAR(100) DEFAULT 'Luxury Hotels',
  location VARCHAR(255) DEFAULT 'New York, USA',
  amenities TEXT DEFAULT 'Free Wi-Fi, Swimming Pool, Parking, Restaurant, Air Conditioning',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
`;

/**
 * Initialize embedded PostgreSQL (pg-mem) when local PostgreSQL service is not reachable
 */
async function initFallbackDb() {
  const { newDb } = require('pg-mem');
  const db = newDb();

  // Register common functions if required
  db.public.registerFunction({
    name: 'now',
    returns: 'timestamp',
    implementation: () => new Date()
  });

  db.public.none(CREATE_TABLE_SQL);

  fallbackDb = db;
  fallbackPg = db.adapters.createPg();
  fallbackPool = new fallbackPg.Pool();

  // Load from persistent file if exists, else seed
  let initialData = [];
  if (fs.existsSync(BACKUP_FILE)) {
    try {
      const content = fs.readFileSync(BACKUP_FILE, 'utf8');
      initialData = JSON.parse(content);
    } catch (err) {
      console.warn('[DB Fallback] Could not parse existing backup file, reseeding.', err.message);
      initialData = [];
    }
  }

  if (initialData.length === 0) {
    initialData = seedHotels;
  }

  for (const h of initialData) {
    await fallbackPool.query(`
      INSERT INTO hotels (title, description, image, latitude, longitude, price, rating, category, location, amenities, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW(), NOW())
    `, [
      h.title,
      h.description,
      h.image,
      h.latitude,
      h.longitude,
      h.price,
      h.rating || 4.5,
      h.category || 'Luxury Hotels',
      h.location || 'Unknown',
      h.amenities || 'Free Wi-Fi'
    ]);
  }

  saveFallbackState();
}

function saveFallbackState() {
  if (!fallbackDb) return;
  try {
    const rows = fallbackDb.public.many(`SELECT * FROM hotels ORDER BY id ASC`);
    fs.writeFileSync(BACKUP_FILE, JSON.stringify(rows, null, 2), 'utf8');
  } catch (err) {
    console.error('[DB Fallback] Failed to save database backup to file:', err.message);
  }
}

/**
 * Seed real PostgreSQL database if table is empty
 */
async function seedRealDb(client) {
  const check = await client.query('SELECT COUNT(*) AS count FROM hotels');
  if (parseInt(check.rows[0].count, 10) === 0) {
    console.log('[PostgreSQL] Table "hotels" is empty. Seeding initial data...');
    for (const h of seedHotels) {
      await client.query(`
        INSERT INTO hotels (title, description, image, latitude, longitude, price, rating, category, location, amenities, created_at, updated_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW(), NOW())
      `, [
        h.title,
        h.description,
        h.image,
        h.latitude,
        h.longitude,
        h.price,
        h.rating || 4.5,
        h.category || 'Luxury Hotels',
        h.location || 'Unknown',
        h.amenities || 'Free Wi-Fi'
      ]);
    }
    console.log(`[PostgreSQL] Seeded ${seedHotels.length} hotels successfully.`);
  }
}

/**
 * Initialize Database Connection
 */
async function initDb() {
  try {
    realPool = new Pool(poolConfig);
    const client = await realPool.connect();
    console.log('[PostgreSQL] Successfully connected to PostgreSQL database!');

    await client.query(CREATE_TABLE_SQL);
    console.log('[PostgreSQL] "hotels" table verified/created.');

    await seedRealDb(client);
    client.release();
    activeDriver = 'pg';
  } catch (err) {
    console.warn(`[Database] PostgreSQL connection failed (${err.message}).`);
    console.log('[Database] Activating integrated native SQL engine (pg-mem) with persistent JSON sync.');
    await initFallbackDb();
    activeDriver = 'fallback';
  }
}

/**
 * Native SQL query executor
 * @param {string} text - SQL Query with $1, $2 placeholders
 * @param {Array} params - Query parameters
 * @returns {Promise<{ rows: Array, rowCount: number }>}
 */
async function query(text, params = []) {
  if (activeDriver === 'pg' && realPool) {
    return await realPool.query(text, params);
  }

  // Fallback engine
  if (!fallbackPool) {
    await initFallbackDb();
  }

  const res = await fallbackPool.query(text, params);
  const upper = text.trim().toUpperCase();
  if (upper.startsWith('INSERT') || upper.startsWith('UPDATE') || upper.startsWith('DELETE')) {
    saveFallbackState();
  }
  return res;
}

module.exports = {
  initDb,
  query,
  getDriver: () => activeDriver
};
