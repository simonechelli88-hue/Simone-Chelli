// Simple authentication system using access codes (nome e cognome)
import type { Express, RequestHandler } from "express";
import session from "express-session";
import connectPg from "connect-pg-simple";
import { storage } from "./storage";

export function getSession() {
  const sessionTtl = 1 * 60 * 60 * 1000; // 1 hour
  const pgStore = connectPg(session);
  const sessionStore = new pgStore({
    conString: process.env.DATABASE_URL,
    createTableIfMissing: false,
    ttl: sessionTtl,
    tableName: "sessions",
  });
  return session({
    secret: process.env.SESSION_SECRET!,
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: true,
      maxAge: sessionTtl, // 1 hour
    },
  });
}

export async function setupAuth(app: Express) {
  app.set("trust proxy", 1);
  app.use(getSession());

  // Login endpoint
  app.post("/api/login", async (req, res) => {
    try {
      const { accessCode } = req.body;
      
      if (!accessCode || typeof accessCode !== 'string') {
        return res.status(400).json({ message: "Codice identificativo richiesto" });
      }

      // Convert to lowercase for case-insensitive comparison
      const normalizedCode = accessCode.trim().toLowerCase();
      
      // Find user by access code
      const user = await storage.getUserByAccessCode(normalizedCode);
      
      if (!user) {
        return res.status(401).json({ message: "Codice identificativo non valido" });
      }

      // Store user in session
      (req.session as any).userId = user.id;
      
      res.json({ user });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ message: "Errore durante il login" });
    }
  });

  // Logout endpoint
  app.post("/api/logout", (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ message: "Errore durante il logout" });
      }
      res.json({ message: "Logout effettuato" });
    });
  });

  // Get current user endpoint
  app.get("/api/auth/user", async (req, res) => {
    try {
      const userId = (req.session as any).userId;
      
      if (!userId) {
        return res.status(401).json({ message: "Non autenticato" });
      }

      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(401).json({ message: "Utente non trovato" });
      }

      res.json(user);
    } catch (error) {
      console.error("Get user error:", error);
      res.status(500).json({ message: "Errore durante il recupero utente" });
    }
  });
}

// Middleware to check if user is authenticated
export const isAuthenticated: RequestHandler = async (req, res, next) => {
  const userId = (req.session as any).userId;
  
  if (!userId) {
    return res.status(401).json({ message: "Non autenticato" });
  }

  try {
    const user = await storage.getUser(userId);
    if (!user) {
      return res.status(401).json({ message: "Non autenticato" });
    }
    
    // Attach user to request
    (req as any).currentUser = user;
    next();
  } catch (error) {
    res.status(500).json({ message: "Errore server" });
  }
};

// Middleware to check if user is admin
export const isAdmin: RequestHandler = async (req, res, next) => {
  const user = (req as any).currentUser;
  
  if (!user || !user.isAdmin) {
    return res.status(403).json({ message: "Accesso negato: richiesti privilegi amministrativi" });
  }
  
  next();
};
