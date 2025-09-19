import type { Express, Request } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { 
  insertOrganRequestSchema,
  insertOrganPledgeSchema,
  insertOrganMatchSchema,
  insertMedicalRecordSchema 
} from "@shared/schema";

// Extended request type for Replit Auth
interface AuthenticatedRequest extends Request {
  user: {
    claims: {
      sub: string;
      email?: string;
      first_name?: string;
      last_name?: string;
    };
  };
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup Replit Auth
  await setupAuth(app);

  // Auth route for getting current user - replaces /api/auth/me
  app.get('/api/auth/user', isAuthenticated, async (req: AuthenticatedRequest, res) => {
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

  // Organ request routes
  app.post("/api/organ-requests", isAuthenticated, async (req: AuthenticatedRequest, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user || user.role !== 'patient') {
        return res.status(403).json({ message: "Only patients can create organ requests" });
      }

      const requestData = insertOrganRequestSchema.parse({
        ...req.body,
        patientId: userId,
      });

      const organRequest = await storage.createOrganRequest(requestData);
      res.status(201).json(organRequest);
    } catch (error: any) {
      res.status(400).json({ message: error.message || "Failed to create organ request" });
    }
  });

  app.get("/api/organ-requests", isAuthenticated, async (req: AuthenticatedRequest, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      let requests;
      if (user.role === 'patient') {
        requests = await storage.getOrganRequestsByPatient(userId);
      } else if (user.role === 'doctor' || user.role === 'admin') {
        requests = await storage.getAllOrganRequests();
      } else {
        return res.status(403).json({ message: "Access denied" });
      }

      res.json(requests);
    } catch (error: any) {
      res.status(500).json({ message: error.message || "Failed to fetch organ requests" });
    }
  });

  app.patch("/api/organ-requests/:id/status", isAuthenticated, async (req: AuthenticatedRequest, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user || (user.role !== 'doctor' && user.role !== 'admin')) {
        return res.status(403).json({ message: "Only doctors and admins can update request status" });
      }

      const { id } = req.params;
      const { status, notes } = req.body;

      const updatedRequest = await storage.updateOrganRequestStatus(id, status, userId, notes);
      if (!updatedRequest) {
        return res.status(404).json({ message: "Organ request not found" });
      }

      res.json(updatedRequest);
    } catch (error: any) {
      res.status(400).json({ message: error.message || "Failed to update request status" });
    }
  });

  // Organ pledge routes
  app.post("/api/organ-pledges", isAuthenticated, async (req: AuthenticatedRequest, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user || user.role !== 'donor') {
        return res.status(403).json({ message: "Only donors can create organ pledges" });
      }

      const pledgeData = insertOrganPledgeSchema.parse({
        ...req.body,
        donorId: userId,
      });

      const organPledge = await storage.createOrganPledge(pledgeData);
      res.status(201).json(organPledge);
    } catch (error: any) {
      res.status(400).json({ message: error.message || "Failed to create organ pledge" });
    }
  });

  app.get("/api/organ-pledges", isAuthenticated, async (req: AuthenticatedRequest, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      let pledges;
      if (user.role === 'donor') {
        pledges = await storage.getOrganPledgesByDonor(userId);
      } else if (user.role === 'doctor' || user.role === 'admin') {
        pledges = await storage.getAvailableOrganPledges();
      } else {
        return res.status(403).json({ message: "Access denied" });
      }

      res.json(pledges);
    } catch (error: any) {
      res.status(500).json({ message: error.message || "Failed to fetch organ pledges" });
    }
  });

  // Organ match routes
  app.post("/api/organ-matches", isAuthenticated, async (req: AuthenticatedRequest, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user || (user.role !== 'doctor' && user.role !== 'admin')) {
        return res.status(403).json({ message: "Only doctors and admins can create matches" });
      }

      const matchData = insertOrganMatchSchema.parse({
        ...req.body,
        doctorId: userId,
      });

      const organMatch = await storage.createOrganMatch(matchData);
      res.status(201).json(organMatch);
    } catch (error: any) {
      res.status(400).json({ message: error.message || "Failed to create organ match" });
    }
  });

  app.get("/api/organ-matches", isAuthenticated, async (req: AuthenticatedRequest, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user || (user.role !== 'doctor' && user.role !== 'admin')) {
        return res.status(403).json({ message: "Only doctors and admins can view matches" });
      }

      const matches = await storage.getPotentialMatches();
      res.json(matches);
    } catch (error: any) {
      res.status(500).json({ message: error.message || "Failed to fetch organ matches" });
    }
  });

  // Medical record routes
  app.post("/api/medical-records", isAuthenticated, async (req: AuthenticatedRequest, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user || (user.role !== 'doctor' && user.role !== 'admin')) {
        return res.status(403).json({ message: "Only medical professionals can create records" });
      }

      const recordData = insertMedicalRecordSchema.parse({
        ...req.body,
        createdBy: userId,
      });

      const medicalRecord = await storage.createMedicalRecord(recordData);
      res.status(201).json(medicalRecord);
    } catch (error: any) {
      res.status(400).json({ message: error.message || "Failed to create medical record" });
    }
  });

  app.get("/api/medical-records/:userId", isAuthenticated, async (req: AuthenticatedRequest, res) => {
    try {
      const currentUserId = req.user.claims.sub;
      const currentUser = await storage.getUser(currentUserId);
      const { userId } = req.params;
      
      if (!currentUser) {
        return res.status(404).json({ message: "User not found" });
      }

      // Users can view their own records, medical professionals can view any
      if (currentUserId !== userId && currentUser.role !== 'doctor' && currentUser.role !== 'admin') {
        return res.status(403).json({ message: "Access denied" });
      }

      const records = await storage.getMedicalRecordsByUser(userId);
      res.json(records);
    } catch (error: any) {
      res.status(500).json({ message: error.message || "Failed to fetch medical records" });
    }
  });

  // Admin routes
  app.get("/api/admin/users/:role?", isAuthenticated, async (req: AuthenticatedRequest, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user || user.role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }

      const { role } = req.params;
      const users = role ? await storage.getUsersByRole(role) : await storage.getUsersByRole(''); // Get all users
      res.json(users);
    } catch (error: any) {
      res.status(500).json({ message: error.message || "Failed to fetch users" });
    }
  });

  app.patch("/api/admin/users/:id/status", isAuthenticated, async (req: AuthenticatedRequest, res) => {
    try {
      const currentUserId = req.user.claims.sub;
      const currentUser = await storage.getUser(currentUserId);
      
      if (!currentUser || currentUser.role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }

      const { id } = req.params;
      const { isActive } = req.body;

      const updatedUser = await storage.updateUser(id, { isActive });
      if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
      }

      res.json(updatedUser);
    } catch (error: any) {
      res.status(400).json({ message: error.message || "Failed to update user status" });
    }
  });

  app.get("/api/admin/stats", isAuthenticated, async (req: AuthenticatedRequest, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user || user.role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }

      const stats = await storage.getSystemStats();
      res.json(stats);
    } catch (error: any) {
      res.status(500).json({ message: error.message || "Failed to fetch system stats" });
    }
  });

  // Role assignment endpoint for new users
  app.patch("/api/auth/role", isAuthenticated, async (req: AuthenticatedRequest, res) => {
    try {
      const userId = req.user.claims.sub;
      const { role } = req.body;

      if (!['patient', 'donor', 'doctor', 'admin'].includes(role)) {
        return res.status(400).json({ message: "Invalid role" });
      }

      const updatedUser = await storage.updateUser(userId, { role });
      if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
      }

      res.json(updatedUser);
    } catch (error: any) {
      res.status(400).json({ message: error.message || "Failed to update user role" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}