import { sql } from 'drizzle-orm';
import {
  index,
  jsonb,
  pgTable,
  timestamp,
  varchar,
  integer,
  date,
  boolean,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// ========================================
// REPLIT AUTH TABLES (MANDATORY)
// ========================================

// Session storage table for Replit Auth
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table for Replit Auth
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  isAdmin: boolean("is_admin").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;

// ========================================
// APPLICATION TABLES
// ========================================

// Work phases table (fasi di lavoro)
export const workPhases = pgTable("work_phases", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  code: varchar("code", { length: 50 }).notNull().unique(),
  description: varchar("description", { length: 500 }).notNull(),
  category: varchar("category", { length: 100 }).notNull(), // e.g., "BOR01", "BOR02", "EXTRA"
  hourThreshold: integer("hour_threshold").default(100).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const workPhasesRelations = relations(workPhases, ({ many }) => ({
  timesheets: many(timesheets),
}));

export type WorkPhase = typeof workPhases.$inferSelect;
export const insertWorkPhaseSchema = createInsertSchema(workPhases).omit({
  id: true,
  createdAt: true,
});
export type InsertWorkPhase = z.infer<typeof insertWorkPhaseSchema>;

// Timesheets table (rapportini giornalieri)
export const timesheets = pgTable("timesheets", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  date: date("date").notNull(),
  type: varchar("type", { length: 20 }).notNull(), // "LAVORATO", "MALATTIA", "FERIE"
  workPhaseId: integer("work_phase_id").references(() => workPhases.id, { onDelete: "set null" }),
  hours: integer("hours").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  index("idx_timesheets_user_date").on(table.userId, table.date),
  index("idx_timesheets_date").on(table.date),
]);

export const timesheetsRelations = relations(timesheets, ({ one }) => ({
  user: one(users, {
    fields: [timesheets.userId],
    references: [users.id],
  }),
  workPhase: one(workPhases, {
    fields: [timesheets.workPhaseId],
    references: [workPhases.id],
  }),
}));

export type Timesheet = typeof timesheets.$inferSelect;
export const insertTimesheetSchema = createInsertSchema(timesheets).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/), // YYYY-MM-DD format
  type: z.enum(["LAVORATO", "MALATTIA", "FERIE"]),
  hours: z.number().min(1).max(24),
  workPhaseId: z.number().nullable().optional(),
});
export type InsertTimesheet = z.infer<typeof insertTimesheetSchema>;

export const updateTimesheetSchema = insertTimesheetSchema.partial().extend({
  id: z.number(),
});
export type UpdateTimesheet = z.infer<typeof updateTimesheetSchema>;
