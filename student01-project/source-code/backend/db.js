const mysql = require('mysql2/promise')
const bcrypt = require('bcryptjs')

let pool

async function initDB() {
  // Create database if it doesn't exist
  const temp = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || ''
  })
  await temp.execute(`CREATE DATABASE IF NOT EXISTS \`${process.env.DB_NAME || 'dhl_incidents'}\``)
  await temp.end()

  pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'dhl_incidents',
    waitForConnections: true,
    connectionLimit: 10
  })

  await pool.execute(`
    CREATE TABLE IF NOT EXISTS users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      email VARCHAR(255) UNIQUE NOT NULL,
      password VARCHAR(255) NOT NULL,
      role VARCHAR(50) NOT NULL DEFAULT 'agent',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `)

  await pool.execute(`
    CREATE TABLE IF NOT EXISTS incidents (
      id BIGINT PRIMARY KEY,
      raw_content TEXT,
      customer_name VARCHAR(255),
      title VARCHAR(500),
      summary TEXT,
      category VARCHAR(100),
      priority VARCHAR(50),
      is_duplicate TINYINT(1) DEFAULT 0,
      duplicate_reason TEXT,
      status VARCHAR(50) DEFAULT 'Open',
      tags VARCHAR(500) DEFAULT '',
      source VARCHAR(100),
      created_by VARCHAR(255),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (created_by) REFERENCES users(email) ON DELETE SET NULL ON UPDATE CASCADE
    )
  `)

  await pool.execute(`
    CREATE TABLE IF NOT EXISTS incident_history (
      id INT AUTO_INCREMENT PRIMARY KEY,
      incident_id BIGINT NOT NULL,
      old_status VARCHAR(50),
      new_status VARCHAR(50),
      changed_by VARCHAR(255),
      changed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      note TEXT
    )
  `)

  await pool.execute(`
    CREATE TABLE IF NOT EXISTS meta (
      \`key\` VARCHAR(50) PRIMARY KEY,
      value VARCHAR(255)
    )
  `)

  // Add tags column if it doesn't exist yet (migration for existing databases)
  try {
    await pool.execute("ALTER TABLE incidents ADD COLUMN tags VARCHAR(500) DEFAULT ''")
  } catch (e) { /* column already exists */ }

  const [metaRows] = await pool.execute("SELECT value FROM meta WHERE `key` = 'nextId'")
  if (metaRows.length === 0) {
    await pool.execute("INSERT INTO meta (`key`, value) VALUES ('nextId', '100001')")
  }

  const [userCount] = await pool.execute('SELECT COUNT(*) AS count FROM users')
  if (userCount[0].count === 0) {
    await pool.execute('INSERT INTO users (email, password, role) VALUES (?, ?, ?)', [
      'admin@dhl.com', await bcrypt.hash('admin123', 10), 'admin'
    ])
    await pool.execute('INSERT INTO users (email, password, role) VALUES (?, ?, ?)', [
      'agent@dhl.com', await bcrypt.hash('agent123', 10), 'agent'
    ])
    await pool.execute('INSERT INTO users (email, password, role) VALUES (?, ?, ?)', [
      'system', await bcrypt.hash('system', 10), 'system'
    ])
    console.log('Default users created: admin@dhl.com, agent@dhl.com, system')
  }

  const [incCount] = await pool.execute('SELECT COUNT(*) AS count FROM incidents')
  if (incCount[0].count === 0) {
    let nextId = await getNextId()
    await pool.execute(
      'INSERT INTO incidents (id, raw_content, title, summary, category, priority, is_duplicate, duplicate_reason, status, source) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [nextId, "Customer complained about late delivery for package DHL-1234.",
       "Late Delivery DHL-1234 Customer Report",
       "Incident reported: Customer complained about late delivery for package DHL-1234. This incident has been logged and requires follow-up.",
       "Late Delivery", "High", 0, "", "Open", "Manual"]
    )
    nextId = await getNextId()
    await pool.execute(
      'INSERT INTO incidents (id, raw_content, title, summary, category, priority, is_duplicate, duplicate_reason, status, source) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [nextId, "The package DHL-5678 arrived crushed and wet.",
       "Damaged Parcel DHL-5678 Reported",
       "Incident reported: The package DHL-5678 arrived crushed and wet. This incident has been logged and requires follow-up.",
       "Damaged Parcel", "Medium", 0, "", "In Progress", "Manual"]
    )
    nextId = await getNextId()
    await pool.execute(
      'INSERT INTO incidents (id, raw_content, title, summary, category, priority, is_duplicate, duplicate_reason, status, source) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [nextId, "Tracking portal is down and shows error 500.",
       "System Error Reported By Customer",
       "Incident reported: Tracking portal is down and shows error 500. This incident has been logged and requires follow-up.",
       "System Error", "Low", 0, "", "Resolved", "Manual"]
    )
    console.log('Sample incidents created')
  }

  console.log('MySQL connected and tables ready')
}

async function getNextId() {
  const [rows] = await pool.execute("SELECT value FROM meta WHERE `key` = 'nextId'")
  const id = parseInt(rows[0].value)
  await pool.execute("UPDATE meta SET value = ? WHERE `key` = 'nextId'", [String(id + 1)])
  return id
}

function getPool() {
  return pool
}

module.exports = { initDB, getNextId, getPool }
