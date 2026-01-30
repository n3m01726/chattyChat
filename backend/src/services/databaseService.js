// services/databaseService.js
const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

/**
 * Service de gestion de la base de données SQLite
 */
class DatabaseService {
  constructor() {
    this.db = null;
  }

  /**
   * Initialise la connexion à la base de données
   */
  init(dbPath = './data/chat.db') {
    // Créer le dossier data s'il n'existe pas
    const dir = path.dirname(dbPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    // Connexion à la base de données
    this.db = new Database(dbPath, { verbose: console.log });
    
    // Optimisations SQLite
    this.db.pragma('journal_mode = WAL');
    this.db.pragma('foreign_keys = ON');
    
    console.log('📦 Base de données SQLite initialisée');
    
    // Créer les tables
    this.migrate();
  }

  /**
   * Crée ou met à jour le schéma de la base de données
   */
  migrate() {
    const tableExists = this.db.prepare(`
      SELECT name FROM sqlite_master 
      WHERE type='table' AND name='users'
    `).get();

    if (!tableExists) {
      this.createTables();
    } else {
      this.migrateExistingTables();
    }

    console.log('✅ Migrations effectuées');
  }

  /**
   * Crée les tables (première installation)
   */
  createTables() {
    // Table des utilisateurs (complète)
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        display_name TEXT,
        bio TEXT,
        pronouns TEXT,
        custom_color TEXT,
        avatar_url TEXT,
        banner_url TEXT,
        status TEXT DEFAULT 'online',
        status_text TEXT,
        timezone TEXT DEFAULT 'UTC',
        dark_mode INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        last_seen DATETIME DEFAULT CURRENT_TIMESTAMP,
        email TEXT,
        password_hash TEXT,
        email_verified INTEGER DEFAULT 0,
        last_login DATETIME,
        auth_provider TEXT DEFAULT 'local',
        provider_id TEXT,
        refresh_token TEXT,
        is_suspended INTEGER DEFAULT 0,
        suspended_at DATETIME
      )
    `);

    // Table des messages (étendue avec mentions)
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS messages (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        text TEXT NOT NULL,
        has_markdown INTEGER DEFAULT 0,
        attachment_type TEXT,
        attachment_url TEXT,
        attachment_expires_at DATETIME,
        gif_url TEXT,
        mentions TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    // Index pour améliorer les performances
    this.db.exec(`
      CREATE INDEX IF NOT EXISTS idx_messages_created_at 
      ON messages(created_at DESC)
    `);

    this.db.exec(`
      CREATE INDEX IF NOT EXISTS idx_messages_user_id 
      ON messages(user_id)
    `);
    
    this.db.exec(`
      CREATE INDEX IF NOT EXISTS idx_messages_expires 
      ON messages(attachment_expires_at)
    `);

    this.db.exec(`
      CREATE UNIQUE INDEX IF NOT EXISTS idx_users_email 
      ON users(email)
    `);
  }

  /**
   * Migre les tables existantes (ajoute les colonnes manquantes)
   */
  migrateExistingTables() {
    // Récupérer les colonnes existantes
    const userColumns = this.db.prepare("PRAGMA table_info(users)").all();
    const existingUserColumns = userColumns.map(col => col.name);

    const messageColumns = this.db.prepare("PRAGMA table_info(messages)").all();
    const existingMessageColumns = messageColumns.map(col => col.name);

    // Colonnes users
    const newUserColumns = [
      { name: 'display_name', type: 'TEXT', default: 'NULL' },
      { name: 'pronouns', type: 'TEXT', default: 'NULL' },
      { name: 'custom_color', type: 'TEXT', default: 'NULL' },
      { name: 'avatar_url', type: 'TEXT', default: 'NULL' },
      { name: 'banner_url', type: 'TEXT', default: 'NULL' },
      { name: 'status', type: 'TEXT', default: "'online'" },
      { name: 'status_text', type: 'TEXT', default: 'NULL' },
      { name: 'timezone', type: 'TEXT', default: "'UTC'" },
      { name: 'dark_mode', type: 'INTEGER', default: '0' },
      { name: 'email', type: 'TEXT', default: 'NULL' },
      { name: 'password_hash', type: 'TEXT', default: 'NULL' },
      { name: 'email_verified', type: 'INTEGER', default: '0' },
      { name: 'last_login', type: 'DATETIME', default: 'NULL' },
      { name: 'auth_provider', type: 'TEXT', default: "'local'" },
      { name: 'provider_id', type: 'TEXT', default: 'NULL' },
      { name: 'refresh_token', type: 'TEXT', default: 'NULL' },
      { name: 'is_suspended', type: 'INTEGER', default: '0' },
      { name: 'suspended_at', type: 'DATETIME', default: 'NULL' }
    ];

    for (const column of newUserColumns) {
      if (!existingUserColumns.includes(column.name)) {
        const sql = `ALTER TABLE users ADD COLUMN ${column.name} ${column.type} DEFAULT ${column.default}`;
        console.log(`  ➕ Ajout de la colonne users: ${column.name}`);
        this.db.exec(sql);
      }
    }

    // Créer table messages si n'existe pas
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS messages (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        text TEXT NOT NULL,
        has_markdown INTEGER DEFAULT 0,
        attachment_type TEXT,
        attachment_url TEXT,
        attachment_expires_at DATETIME,
        gif_url TEXT,
        mentions TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    // Colonnes messages
    const newMessageColumns = [
      { name: 'has_markdown', type: 'INTEGER', default: '0' },
      { name: 'attachment_type', type: 'TEXT', default: 'NULL' },
      { name: 'attachment_url', type: 'TEXT', default: 'NULL' },
      { name: 'attachment_expires_at', type: 'DATETIME', default: 'NULL' },
      { name: 'gif_url', type: 'TEXT', default: 'NULL' },
      { name: 'mentions', type: 'TEXT', default: 'NULL' }
    ];

    for (const column of newMessageColumns) {
      if (!existingMessageColumns.includes(column.name)) {
        const sql = `ALTER TABLE messages ADD COLUMN ${column.name} ${column.type} DEFAULT ${column.default}`;
        console.log(`  ➕ Ajout de la colonne messages: ${column.name}`);
        this.db.exec(sql);
      }
    }
    
    // Index
    this.db.exec(`
      CREATE INDEX IF NOT EXISTS idx_messages_created_at 
      ON messages(created_at DESC)
    `);

    this.db.exec(`
      CREATE INDEX IF NOT EXISTS idx_messages_user_id 
      ON messages(user_id)
    `);
    
    this.db.exec(`
      CREATE INDEX IF NOT EXISTS idx_messages_expires 
      ON messages(attachment_expires_at)
    `);

    this.db.exec(`
      CREATE UNIQUE INDEX IF NOT EXISTS idx_users_email 
      ON users(email)
    `);
  }

  /**
   * Récupère l'instance de la base de données
   */
  getDb() {
    return this.db;
  }
}

module.exports = new DatabaseService();