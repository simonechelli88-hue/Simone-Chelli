import { pool } from "./db";
import { db } from "./db";
import { users, workPhases } from "@shared/schema";
import { PREDEFINED_PHASES } from "../client/src/lib/workPhases";

const EMPLOYEES = [
  { fullName: 'SIMONE CHELLI', accessCode: 'simone chelli', isAdmin: false },
  { fullName: 'DARIO MOTRONI', accessCode: 'dario motroni', isAdmin: false },
  { fullName: 'CLAUDIO VERDIGI', accessCode: 'claudio verdigi', isAdmin: false },
  { fullName: 'FABRIZIO GIACHETTI', accessCode: 'fabrizio giachetti', isAdmin: false },
  { fullName: 'MATTEO GENTILESCHI', accessCode: 'matteo gentileschi', isAdmin: false },
  { fullName: 'SOLE CARDOSI', accessCode: 'sole cardosi', isAdmin: false },
  { fullName: 'MAURIZIO CECCHINI', accessCode: 'maurizio cecchini', isAdmin: false },
  { fullName: 'ALEXANDRO VASILE', accessCode: 'alexandro vasile', isAdmin: false },
  { fullName: 'GIACOMO FEDELI', accessCode: 'giacomo fedeli', isAdmin: false },
  { fullName: "NICOLO' FAMBRINI", accessCode: "nicolo' fambrini", isAdmin: false },
  { fullName: 'ANTONIO CERSOSIMO', accessCode: 'antonio cersosimo', isAdmin: false },
  { fullName: 'SEMIR SEFOSKI', accessCode: 'semir sefoski', isAdmin: false },
  { fullName: 'LUCA PALMERINI', accessCode: 'luca palmerini', isAdmin: false },
  { fullName: 'STEFANO PICCHI', accessCode: 'stefano picchi', isAdmin: false },
  { fullName: "NICCOLO' BENEDETTI", accessCode: "niccolo' benedetti", isAdmin: false },
  { fullName: 'PRIMIANO SIMEONE', accessCode: 'primiano simeone', isAdmin: false },
  { fullName: 'PAOLO PARDINI', accessCode: 'paolo pardini', isAdmin: false },
  { fullName: 'ANDREA BIBOLOTTI', accessCode: 'andrea bibolotti', isAdmin: false },
  { fullName: 'OMAR ZARROUKI', accessCode: 'omar zarrouki', isAdmin: false },
  { fullName: 'ADMIN EUROELETTRICA', accessCode: 'admin', isAdmin: true },
];

async function createTablesIfNotExist() {
  console.log('🏗️  Creazione tabelle database...');
  
  // Create sessions table (required for Replit Auth)
  await pool.query(`
    CREATE TABLE IF NOT EXISTS sessions (
      sid VARCHAR PRIMARY KEY,
      sess JSONB NOT NULL,
      expire TIMESTAMP NOT NULL
    );
  `);

  await pool.query(`
    CREATE INDEX IF NOT EXISTS "IDX_session_expire" ON sessions (expire);
  `);

  // Create users table
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
      full_name VARCHAR NOT NULL,
      access_code VARCHAR UNIQUE NOT NULL,
      is_admin BOOLEAN DEFAULT false NOT NULL,
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    );
  `);

  // Create work_phases table
  await pool.query(`
    CREATE TABLE IF NOT EXISTS work_phases (
      id INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
      code VARCHAR(50) UNIQUE NOT NULL,
      description VARCHAR(500) NOT NULL,
      category VARCHAR(100) NOT NULL,
      hour_threshold INTEGER DEFAULT 100 NOT NULL,
      created_at TIMESTAMP DEFAULT NOW()
    );
  `);

  // Create timesheets table
  await pool.query(`
    CREATE TABLE IF NOT EXISTS timesheets (
      id INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
      user_id VARCHAR NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      date DATE NOT NULL,
      type VARCHAR(20) NOT NULL,
      work_phase_id INTEGER REFERENCES work_phases(id) ON DELETE SET NULL,
      hours INTEGER NOT NULL,
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    );
  `);

  await pool.query(`
    CREATE INDEX IF NOT EXISTS idx_timesheets_user_date ON timesheets (user_id, date);
  `);

  await pool.query(`
    CREATE INDEX IF NOT EXISTS idx_timesheets_date ON timesheets (date);
  `);

  console.log('✅ Tabelle create con successo!');
}

export async function seedDatabaseIfEmpty() {
  try {
    console.log('🔍 Controllo database...');

    // First, create tables if they don't exist
    await createTablesIfNotExist();

    // Check if database already has data
    const existingUsers = await db.select().from(users).limit(1);
    
    if (existingUsers.length > 0) {
      console.log('✅ Database già inizializzato');
      return;
    }

    console.log('🌱 Inizializzazione database...');

    console.log('👥 Creazione utenti...');
    for (const employee of EMPLOYEES) {
      await db.insert(users).values(employee).onConflictDoNothing();
    }
    console.log(`✅ ${EMPLOYEES.length} utenti creati`);

    console.log('📋 Creazione fasi di lavoro...');
    for (const phase of PREDEFINED_PHASES) {
      await db.insert(workPhases).values({
        code: phase.code,
        description: phase.description,
        category: phase.category,
        hourThreshold: 100,
      }).onConflictDoNothing();
    }
    console.log(`✅ ${PREDEFINED_PHASES.length} fasi di lavoro create`);

    const categories = Array.from(new Set(PREDEFINED_PHASES.map(p => p.category)));
    console.log("\n📊 Fasi per categoria:");
    for (const category of categories.sort()) {
      const count = PREDEFINED_PHASES.filter(p => p.category === category).length;
      console.log(`  - ${category}: ${count} fasi`);
    }

    console.log('\n🎉 Database inizializzato con successo!');
  } catch (error) {
    console.error('❌ Errore durante l\'inizializzazione:', error);
    throw error;
  }
}
