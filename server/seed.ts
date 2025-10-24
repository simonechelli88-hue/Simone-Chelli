// Script to seed the database with predefined work phases
import { db } from "./db";
import { workPhases } from "@shared/schema";
import { PREDEFINED_PHASES } from "../client/src/lib/workPhases";

async function seed() {
  console.log("🌱 Seeding database with predefined work phases...");
  
  try {
    // Insert all predefined phases
    for (const phase of PREDEFINED_PHASES) {
      await db.insert(workPhases).values({
        code: phase.code,
        description: phase.description,
        category: phase.category,
        hourThreshold: 100, // Default threshold
      }).onConflictDoNothing();
    }
    
    console.log(`✅ Successfully seeded ${PREDEFINED_PHASES.length} work phases`);
    
    // Display summary by category
    const categories = Array.from(new Set(PREDEFINED_PHASES.map(p => p.category)));
    console.log("\n📊 Phases by category:");
    for (const category of categories.sort()) {
      const count = PREDEFINED_PHASES.filter(p => p.category === category).length;
      console.log(`  - ${category}: ${count} phases`);
    }
    
    console.log("\n✨ Database seeding complete!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding database:", error);
    process.exit(1);
  }
}

seed();
