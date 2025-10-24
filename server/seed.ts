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

export async function seedDatabaseIfEmpty() {
  try {
    console.log('🔍 Controllo database...');

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
  }
}
