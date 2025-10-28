import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { users, workPhases } from '../shared/schema.js';

const sql = neon(process.env.DATABASE_URL);
const db = drizzle(sql);

async function seedDatabase() {
  console.log('🌱 Inizializzazione database...');

  try {
    // Seed Users (Dipendenti)
    const employees = [
      { fullName: 'SIMONE CHELLI', accessCode: 'simone chelli', isAdmin: false },
      { fullName: 'DARIO MOTRONI', accessCode: 'dario motroni', isAdmin: false },
      { fullName: 'CLAUDIO VERDIGI', accessCode: 'claudio verdigi', isAdmin: false },
      { fullName: 'FABRIZIO GIACHETTI', accessCode: 'fabrizio giachetti', isAdmin: false },
      { fullName: 'MATTEO GENTILESCHI', accessCode: 'matteo gentileschi', isAdmin: false },
      { fullName: 'SOLE CARDOSI', accessCode: 'sole cardosi', isAdmin: false },
      { fullName: 'MAURIZIO CECCHINI', accessCode: 'maurizio cecchini', isAdmin: false },
      { fullName: 'ALEXANDRO VASILE', accessCode: 'alexandro vasile', isAdmin: false },
      { fullName: 'GIACOMO FEDELI', accessCode: 'giacomo fedeli', isAdmin: false },
      { fullName: 'NICOLO\' FAMBRINI', accessCode: 'nicolo\' fambrini', isAdmin: false },
      { fullName: 'ANTONIO CERSOSIMO', accessCode: 'antonio cersosimo', isAdmin: false },
      { fullName: 'SEMIR SEFOSKI', accessCode: 'semir sefoski', isAdmin: false },
      { fullName: 'LUCA PALMERINI', accessCode: 'luca palmerini', isAdmin: false },
      { fullName: 'STEFANO PICCHI', accessCode: 'stefano picchi', isAdmin: false },
      { fullName: 'NICCOLO\' BENEDETTI', accessCode: 'niccolo\' benedetti', isAdmin: false },
      { fullName: 'PRIMIANO SIMEONE', accessCode: 'primiano simeone', isAdmin: false },
      { fullName: 'PAOLO PARDINI', accessCode: 'paolo pardini', isAdmin: false },
      { fullName: 'ANDREA BIBOLOTTI', accessCode: 'andrea bibolotti', isAdmin: false },
      { fullName: 'OMAR ZARROUKI', accessCode: 'omar zarrouki', isAdmin: false },
      { fullName: 'ADMIN EUROELETTRICA', accessCode: 'admin', isAdmin: true },
    ];

    console.log('👥 Creazione utenti...');
    for (const employee of employees) {
      await db.insert(users).values(employee).onConflictDoNothing();
    }
    console.log(`✅ ${employees.length} utenti creati`);

    // Seed Work Phases
    const phases = [
      { code: 'BOR0101', description: 'FORATURA PASSAGGI CAVI SU SOLETTA', category: 'BOR01', hourThreshold: 100 },
      { code: 'BOR0102', description: 'FORATURA PASSAGGI CAVI SU TRAMEZZATURE', category: 'BOR01', hourThreshold: 100 },
      // ... (aggiungi tutte le altre 77 fasi qui)
      // Per brevità non le elenco tutte, ma in produzione dovresti avere tutte le 79+ fasi
    ];

    console.log('📋 Creazione fasi di lavoro...');
    for (const phase of phases) {
      await db.insert(workPhases).values(phase).onConflictDoNothing();
    }
    console.log(`✅ ${phases.length} fasi di lavoro create`);

    console.log('🎉 Database inizializzato con successo!');
  } catch (error) {
    console.error('❌ Errore durante l\'inizializzazione:', error);
    process.exit(1);
  }
}

seedDatabase();
