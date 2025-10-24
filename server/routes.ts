import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated, isAdmin } from "./replitAuth";
import { insertTimesheetSchema, updateTimesheetSchema, insertWorkPhaseSchema } from "@shared/schema";
import { fromError } from "zod-validation-error";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // ========================================
  // AUTH ROUTES
  // ========================================
  
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // ========================================
  // TIMESHEET ROUTES
  // ========================================
  
  // Get timesheets for a specific user and month
  app.get("/api/timesheets/:userId/:yearMonth", isAuthenticated, async (req: any, res) => {
    try {
      const { userId, yearMonth } = req.params;
      const currentUserId = req.user.claims.sub;
      
      // Users can only access their own timesheets unless they're admin
      const currentUser = await storage.getUser(currentUserId);
      if (userId !== currentUserId && !currentUser?.isAdmin) {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      const [year, month] = yearMonth.split('-').map(Number);
      const timesheets = await storage.getTimesheetsByUserAndMonth(userId, year, month);
      res.json(timesheets);
    } catch (error) {
      console.error("Error fetching timesheets:", error);
      res.status(500).json({ message: "Failed to fetch timesheets" });
    }
  });

  // Create timesheet
  app.post("/api/timesheets", isAuthenticated, async (req: any, res) => {
    try {
      const currentUserId = req.user.claims.sub;
      
      // Validate request body
      const validation = insertTimesheetSchema.safeParse(req.body);
      if (!validation.success) {
        const validationError = fromError(validation.error);
        return res.status(400).json({ message: validationError.toString() });
      }
      
      const data = validation.data;
      
      // Users can only create timesheets for themselves
      if (data.userId !== currentUserId) {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      // Check if timesheet already exists for this date
      const existing = await storage.getTimesheetByUserAndDate(data.userId, data.date);
      if (existing) {
        return res.status(409).json({ message: "Timesheet already exists for this date" });
      }
      
      const timesheet = await storage.createTimesheet(data);
      res.status(201).json(timesheet);
    } catch (error) {
      console.error("Error creating timesheet:", error);
      res.status(500).json({ message: "Failed to create timesheet" });
    }
  });

  // Update timesheet
  app.patch("/api/timesheets/:id", isAuthenticated, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      const currentUserId = req.user.claims.sub;
      
      // Validate request body
      const validation = updateTimesheetSchema.partial().safeParse(req.body);
      if (!validation.success) {
        const validationError = fromError(validation.error);
        return res.status(400).json({ message: validationError.toString() });
      }
      
      // Get existing timesheet to verify ownership
      const timesheets = await storage.getTimesheetsByUserAndMonth(
        currentUserId,
        new Date().getFullYear(),
        new Date().getMonth() + 1
      );
      const existing = timesheets.find(t => t.id === id);
      
      if (!existing) {
        return res.status(404).json({ message: "Timesheet not found" });
      }
      
      if (existing.userId !== currentUserId) {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      const updated = await storage.updateTimesheet(id, validation.data);
      res.json(updated);
    } catch (error) {
      console.error("Error updating timesheet:", error);
      res.status(500).json({ message: "Failed to update timesheet" });
    }
  });

  // Delete timesheet
  app.delete("/api/timesheets/:id", isAuthenticated, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      const currentUserId = req.user.claims.sub;
      
      // Get existing timesheet to verify ownership
      const timesheets = await storage.getTimesheetsByUserAndMonth(
        currentUserId,
        new Date().getFullYear(),
        new Date().getMonth() + 1
      );
      const existing = timesheets.find(t => t.id === id);
      
      if (!existing) {
        return res.status(404).json({ message: "Timesheet not found" });
      }
      
      if (existing.userId !== currentUserId) {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      await storage.deleteTimesheet(id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting timesheet:", error);
      res.status(500).json({ message: "Failed to delete timesheet" });
    }
  });

  // ========================================
  // WORK PHASE ROUTES
  // ========================================
  
  // Get all phases (public for all authenticated users)
  app.get("/api/phases", isAuthenticated, async (req, res) => {
    try {
      const phases = await storage.getAllPhases();
      res.json(phases);
    } catch (error) {
      console.error("Error fetching phases:", error);
      res.status(500).json({ message: "Failed to fetch phases" });
    }
  });

  // Create phase (admin only)
  app.post("/api/phases", isAuthenticated, isAdmin, async (req, res) => {
    try {
      // Validate request body
      const validation = insertWorkPhaseSchema.safeParse(req.body);
      if (!validation.success) {
        const validationError = fromError(validation.error);
        return res.status(400).json({ message: validationError.toString() });
      }
      
      const phase = await storage.createPhase(validation.data);
      res.status(201).json(phase);
    } catch (error: any) {
      console.error("Error creating phase:", error);
      if (error.code === '23505') { // Unique violation
        return res.status(409).json({ message: "Phase code already exists" });
      }
      res.status(500).json({ message: "Failed to create phase" });
    }
  });

  // Update phase (admin only)
  app.patch("/api/phases/:id", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      
      // Validate request body
      const validation = insertWorkPhaseSchema.partial().safeParse(req.body);
      if (!validation.success) {
        const validationError = fromError(validation.error);
        return res.status(400).json({ message: validationError.toString() });
      }
      
      const updated = await storage.updatePhase(id, validation.data);
      if (!updated) {
        return res.status(404).json({ message: "Phase not found" });
      }
      
      res.json(updated);
    } catch (error: any) {
      console.error("Error updating phase:", error);
      if (error.code === '23505') { // Unique violation
        return res.status(409).json({ message: "Phase code already exists" });
      }
      res.status(500).json({ message: "Failed to update phase" });
    }
  });

  // Delete phase (admin only)
  app.delete("/api/phases/:id", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deletePhase(id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting phase:", error);
      res.status(500).json({ message: "Failed to delete phase" });
    }
  });

  // ========================================
  // ADMIN ROUTES
  // ========================================
  
  // Get all users (admin only)
  app.get("/api/admin/users", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const users = await storage.getAllUsers();
      res.json(users);
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  // Get employee hours (admin only)
  app.get("/api/admin/employee-hours", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const data = await storage.getEmployeeHours();
      res.json(data);
    } catch (error) {
      console.error("Error fetching employee hours:", error);
      res.status(500).json({ message: "Failed to fetch employee hours" });
    }
  });

  // Get admin stats (admin only)
  app.get("/api/admin/stats", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const stats = await storage.getAdminStats();
      res.json(stats);
    } catch (error) {
      console.error("Error fetching stats:", error);
      res.status(500).json({ message: "Failed to fetch stats" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
