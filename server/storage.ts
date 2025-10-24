import {
  users,
  workPhases,
  timesheets,
  type User,
  type InsertUser,
  type WorkPhase,
  type InsertWorkPhase,
  type Timesheet,
  type InsertTimesheet,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, sql, desc } from "drizzle-orm";

// Interface for storage operations
export interface IStorage {
  // User operations
  getUser(id: string): Promise<User | undefined>;
  getUserByAccessCode(accessCode: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  getAllUsers(): Promise<User[]>;

  // Work Phase operations
  getAllPhases(): Promise<WorkPhase[]>;
  getPhase(id: number): Promise<WorkPhase | undefined>;
  createPhase(phase: InsertWorkPhase): Promise<WorkPhase>;
  updatePhase(id: number, phase: Partial<InsertWorkPhase>): Promise<WorkPhase | undefined>;
  deletePhase(id: number): Promise<void>;

  // Timesheet operations
  getTimesheetsByUserAndMonth(userId: string, year: number, month: number): Promise<Timesheet[]>;
  getTimesheetByUserAndDate(userId: string, date: string): Promise<Timesheet | undefined>;
  createTimesheet(timesheet: InsertTimesheet): Promise<Timesheet>;
  updateTimesheet(id: number, timesheet: Partial<InsertTimesheet>): Promise<Timesheet | undefined>;
  deleteTimesheet(id: number): Promise<void>;

  // Admin/Stats operations
  getEmployeeHours(): Promise<any[]>;
  getAdminStats(): Promise<{
    totalEmployees: number;
    activeToday: number;
    totalHoursThisMonth: number;
    phasesCount: number;
  }>;
}

export class DatabaseStorage implements IStorage {
  // ========== User operations ==========
  
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByAccessCode(accessCode: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.accessCode, accessCode.toLowerCase()));
    return user;
  }

  async createUser(userData: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(userData).returning();
    return user;
  }

  async getAllUsers(): Promise<User[]> {
    return await db.select().from(users).where(eq(users.isAdmin, false));
  }

  // ========== Work Phase operations ==========
  
  async getAllPhases(): Promise<WorkPhase[]> {
    return await db.select().from(workPhases).orderBy(workPhases.code);
  }

  async getPhase(id: number): Promise<WorkPhase | undefined> {
    const [phase] = await db.select().from(workPhases).where(eq(workPhases.id, id));
    return phase;
  }

  async createPhase(phase: InsertWorkPhase): Promise<WorkPhase> {
    const [newPhase] = await db.insert(workPhases).values(phase).returning();
    return newPhase;
  }

  async updatePhase(id: number, phase: Partial<InsertWorkPhase>): Promise<WorkPhase | undefined> {
    const [updated] = await db
      .update(workPhases)
      .set(phase)
      .where(eq(workPhases.id, id))
      .returning();
    return updated;
  }

  async deletePhase(id: number): Promise<void> {
    await db.delete(workPhases).where(eq(workPhases.id, id));
  }

  // ========== Timesheet operations ==========
  
  async getTimesheetsByUserAndMonth(userId: string, year: number, month: number): Promise<Timesheet[]> {
    // Get timesheets for a specific month (month is 1-12)
    const startDate = `${year}-${month.toString().padStart(2, '0')}-01`;
    const endDate = `${year}-${month.toString().padStart(2, '0')}-31`;
    
    return await db
      .select()
      .from(timesheets)
      .where(
        and(
          eq(timesheets.userId, userId),
          sql`${timesheets.date} >= ${startDate}`,
          sql`${timesheets.date} <= ${endDate}`
        )
      )
      .orderBy(desc(timesheets.date));
  }

  async getTimesheetByUserAndDate(userId: string, date: string): Promise<Timesheet | undefined> {
    const [timesheet] = await db
      .select()
      .from(timesheets)
      .where(
        and(
          eq(timesheets.userId, userId),
          eq(timesheets.date, date)
        )
      );
    return timesheet;
  }

  async createTimesheet(timesheet: InsertTimesheet): Promise<Timesheet> {
    const [newTimesheet] = await db.insert(timesheets).values(timesheet).returning();
    return newTimesheet;
  }

  async updateTimesheet(id: number, data: Partial<InsertTimesheet>): Promise<Timesheet | undefined> {
    const [updated] = await db
      .update(timesheets)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(timesheets.id, id))
      .returning();
    return updated;
  }

  async deleteTimesheet(id: number): Promise<void> {
    await db.delete(timesheets).where(eq(timesheets.id, id));
  }

  // ========== Admin/Stats operations ==========
  
  async getEmployeeHours(): Promise<any[]> {
    // Get all users with their total hours and hours per phase
    const allUsers = await this.getAllUsers();
    const allPhases = await this.getAllPhases();
    
    const result = await Promise.all(allUsers.map(async (user) => {
      // Get all timesheets for this user where type is LAVORATO
      const userTimesheets = await db
        .select()
        .from(timesheets)
        .where(
          and(
            eq(timesheets.userId, user.id),
            eq(timesheets.type, "LAVORATO")
          )
        );
      
      // Group by phase and sum hours
      const phaseHours = new Map<number, number>();
      let totalHours = 0;
      
      for (const timesheet of userTimesheets) {
        totalHours += timesheet.hours;
        if (timesheet.workPhaseId) {
          const current = phaseHours.get(timesheet.workPhaseId) || 0;
          phaseHours.set(timesheet.workPhaseId, current + timesheet.hours);
        }
      }
      
      // Format phases data
      const phases = Array.from(phaseHours.entries()).map(([phaseId, hours]) => {
        const phase = allPhases.find(p => p.id === phaseId);
        return {
          phaseId,
          phase: phase!,
          hours,
        };
      });
      
      return {
        user,
        totalHours,
        phases,
      };
    }));
    
    return result;
  }

  async getAdminStats(): Promise<{
    totalEmployees: number;
    activeToday: number;
    totalHoursThisMonth: number;
    phasesCount: number;
  }> {
    const allUsers = await this.getAllUsers();
    const today = new Date().toISOString().split('T')[0];
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1;
    
    // Count active today
    const todayTimesheets = await db
      .select()
      .from(timesheets)
      .where(eq(timesheets.date, today));
    
    const activeToday = new Set(todayTimesheets.map(t => t.userId)).size;
    
    // Calculate total hours this month
    const startDate = `${currentYear}-${currentMonth.toString().padStart(2, '0')}-01`;
    const endDate = `${currentYear}-${currentMonth.toString().padStart(2, '0')}-31`;
    
    const monthTimesheets = await db
      .select()
      .from(timesheets)
      .where(
        and(
          sql`${timesheets.date} >= ${startDate}`,
          sql`${timesheets.date} <= ${endDate}`
        )
      );
    
    const totalHoursThisMonth = monthTimesheets.reduce((sum, t) => sum + t.hours, 0);
    
    // Count phases
    const allPhases = await this.getAllPhases();
    
    return {
      totalEmployees: allUsers.length,
      activeToday,
      totalHoursThisMonth,
      phasesCount: allPhases.length,
    };
  }
}

export const storage = new DatabaseStorage();
