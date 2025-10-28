// Script to seed predefined employees
import { db } from "./db";
import { users } from "@shared/schema";

const EMPLOYEES = [
  { fullName: "SIMONE CHELLI", accessCode: "simone chelli" },
  { fullName: "DARIO MOTRONI", accessCode: "dario motroni" },
  { fullName: "CLAUDIO VERDIGI", accessCode: "claudio verdigi" },
  { fullName: "FABRIZIO GIACHETTI", accessCode: "fabrizio giachetti" },
  { fullName: "MATTEO GENTILESCHI", accessCode: "matteo gentileschi" },
  { fullName: "SOLE CARDOSI", accessCode: "sole cardosi" },
  { fullName: "MAURIZIO CECCHINI", accessCode: "maurizio cecchini" },
  { fullName: "ALEXANDRO VASILE", accessCode: "alexandro vasile" },
];

async function seedEmployees() {
  console.log("🌱 Caricamento dipendenti predefiniti...");
  
  try {
    for (const employee of EMPLOYEES) {
      await db.insert(users).values({
        fullName: employee.fullName,
        accessCode: employee.accessCode.toLowerCase(), // Store lowercase for case-insensitive comparison
        isAdmin: false,
      }).onConflictDoNothing();
      console.log(`✅ Caricato: ${employee.fullName}`);
    }
    
    console.log(`\n✨ ${EMPLOYEES.length} dipendenti caricati con successo!`);
    console.log("\nPer accedere, i dipendenti devono inserire il proprio nome e cognome come codice identificativo.");
    console.log("Esempio: 'SIMONE CHELLI' o 'simone chelli' (case-insensitive)");
    
    process.exit(0);
  } catch (error) {
    console.error("❌ Errore durante il caricamento:", error);
    process.exit(1);
  }
}

seedEmployees();
