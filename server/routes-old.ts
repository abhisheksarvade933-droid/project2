import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { 
  insertOrganRequestSchema,
  insertOrganPledgeSchema,
  insertOrganMatchSchema,
  insertMedicalRecordSchema 
} from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup Replit Auth
  await setupAuth(app);

  // Auth route for getting current user - replaces /api/auth/me
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

  // Organ request routes now use isAuthenticated instead of requireAuth
  app.post("/api/organ-requests", isAuthenticated, async (req: any, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      
      // Check if user already exists
      const existingUser = await storage.getUserByEmail(userData.email);
      if (existingUser) {
        return res.status(400).json({ message: "User with this email already exists" });
      }

      // Hash password
      const hashedPassword = await hashPassword(userData.password);
      
      // Create user
      const user = await storage.createUser({
        ...userData,
        password: hashedPassword,
      });

      // Generate token
      const token = generateToken(user);

      res.status(201).json({
        message: "User registered successfully",
        token,
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
          firstName: user.firstName,
          lastName: user.lastName,
        },
      });
    } catch (error: any) {
      res.status(400).json({ message: error.message || "Registration failed" });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password } = loginSchema.parse(req.body);
      
      // Find user
      const user = await storage.getUserByEmail(email);
      if (!user || !user.isActive) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      // Verify password
      const isValidPassword = await comparePassword(password, user.password);
      if (!isValidPassword) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      // Generate token
      const token = generateToken(user);

      res.json({
        message: "Login successful",
        token,
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
          firstName: user.firstName,
          lastName: user.lastName,
        },
      });
    } catch (error: any) {
      res.status(400).json({ message: error.message || "Login failed" });
    }
  });

  app.get("/api/auth/me", requireAuth, async (req: AuthRequest, res) => {
    try {
      const user = await storage.getUser(req.user!.id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      res.json({
        id: user.id,
        email: user.email,
        role: user.role,
        firstName: user.firstName,
        lastName: user.lastName,
        phoneNumber: user.phoneNumber,
        dateOfBirth: user.dateOfBirth,
        bloodType: user.bloodType,
        medicalCondition: user.medicalCondition,
        weight: user.weight,
        height: user.height,
        address: user.address,
        city: user.city,
        state: user.state,
        zipCode: user.zipCode,
      });
    } catch (error: any) {
      res.status(500).json({ message: error.message || "Failed to get user profile" });
    }
  });

  // Organ request routes
  app.post("/api/organ-requests", requireAuth, requireRole("patient"), async (req: AuthRequest, res) => {
    try {
      const requestData = insertOrganRequestSchema.parse({
        ...req.body,
        patientId: req.user!.id,
      });
      
      const request = await storage.createOrganRequest(requestData);
      res.status(201).json(request);
    } catch (error: any) {
      res.status(400).json({ message: error.message || "Failed to create organ request" });
    }
  });

  app.get("/api/organ-requests", requireAuth, async (req: AuthRequest, res) => {
    try {
      let requests;
      
      if (req.user!.role === "patient") {
        requests = await storage.getOrganRequestsByPatient(req.user!.id);
      } else if (req.user!.role === "doctor" || req.user!.role === "admin") {
        requests = await storage.getAllOrganRequests();
      } else {
        return res.status(403).json({ message: "Not authorized to view requests" });
      }

      res.json(requests);
    } catch (error: any) {
      res.status(500).json({ message: error.message || "Failed to get organ requests" });
    }
  });

  app.patch("/api/organ-requests/:id/status", requireAuth, requireRole("doctor", "admin"), async (req: AuthRequest, res) => {
    try {
      const { id } = req.params;
      const { status, notes } = req.body;
      
      const request = await storage.updateOrganRequestStatus(id, status, req.user!.id, notes);
      if (!request) {
        return res.status(404).json({ message: "Request not found" });
      }

      res.json(request);
    } catch (error: any) {
      res.status(400).json({ message: error.message || "Failed to update request status" });
    }
  });

  // Organ pledge routes
  app.post("/api/organ-pledges", requireAuth, requireRole("donor"), async (req: AuthRequest, res) => {
    try {
      const pledgeData = insertOrganPledgeSchema.parse({
        ...req.body,
        donorId: req.user!.id,
      });
      
      const pledge = await storage.createOrganPledge(pledgeData);
      res.status(201).json(pledge);
    } catch (error: any) {
      res.status(400).json({ message: error.message || "Failed to create organ pledge" });
    }
  });

  app.get("/api/organ-pledges", requireAuth, async (req: AuthRequest, res) => {
    try {
      let pledges;
      
      if (req.user!.role === "donor") {
        pledges = await storage.getOrganPledgesByDonor(req.user!.id);
      } else if (req.user!.role === "doctor" || req.user!.role === "admin") {
        pledges = await storage.getAvailableOrganPledges();
      } else {
        return res.status(403).json({ message: "Not authorized to view pledges" });
      }

      res.json(pledges);
    } catch (error: any) {
      res.status(500).json({ message: error.message || "Failed to get organ pledges" });
    }
  });

  // Organ match routes
  app.post("/api/organ-matches", requireAuth, requireRole("doctor"), async (req: AuthRequest, res) => {
    try {
      const matchData = insertOrganMatchSchema.parse({
        ...req.body,
        doctorId: req.user!.id,
      });
      
      const match = await storage.createOrganMatch(matchData);
      res.status(201).json(match);
    } catch (error: any) {
      res.status(400).json({ message: error.message || "Failed to create organ match" });
    }
  });

  app.get("/api/organ-matches", requireAuth, requireRole("doctor", "admin"), async (req: AuthRequest, res) => {
    try {
      const matches = await storage.getPotentialMatches();
      res.json(matches);
    } catch (error: any) {
      res.status(500).json({ message: error.message || "Failed to get organ matches" });
    }
  });

  app.patch("/api/organ-matches/:id/status", requireAuth, requireRole("admin"), async (req: AuthRequest, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;
      
      const match = await storage.updateOrganMatchStatus(id, status, req.user!.id);
      if (!match) {
        return res.status(404).json({ message: "Match not found" });
      }

      res.json(match);
    } catch (error: any) {
      res.status(400).json({ message: error.message || "Failed to update match status" });
    }
  });

  // Medical records routes
  app.post("/api/medical-records", requireAuth, requireRole("doctor"), async (req: AuthRequest, res) => {
    try {
      const recordData = insertMedicalRecordSchema.parse({
        ...req.body,
        doctorId: req.user!.id,
      });
      
      const record = await storage.createMedicalRecord(recordData);
      res.status(201).json(record);
    } catch (error: any) {
      res.status(400).json({ message: error.message || "Failed to create medical record" });
    }
  });

  app.get("/api/medical-records/:userId", requireAuth, async (req: AuthRequest, res) => {
    try {
      const { userId } = req.params;
      
      // Only allow users to view their own records or doctors/admins to view any
      if (req.user!.id !== userId && !["doctor", "admin"].includes(req.user!.role)) {
        return res.status(403).json({ message: "Not authorized to view these records" });
      }

      const records = await storage.getMedicalRecordsByUser(userId);
      res.json(records);
    } catch (error: any) {
      res.status(500).json({ message: error.message || "Failed to get medical records" });
    }
  });

  // Admin routes
  app.get("/api/admin/stats", requireAuth, requireRole("admin"), async (req: AuthRequest, res) => {
    try {
      const stats = await storage.getSystemStats();
      res.json(stats);
    } catch (error: any) {
      res.status(500).json({ message: error.message || "Failed to get system stats" });
    }
  });

  app.get("/api/admin/users", requireAuth, requireRole("admin"), async (req: AuthRequest, res) => {
    try {
      const { role } = req.query;
      let users;
      
      if (role && typeof role === 'string') {
        users = await storage.getUsersByRole(role);
      } else {
        // Get all users by getting each role separately
        const patients = await storage.getUsersByRole('patient');
        const donors = await storage.getUsersByRole('donor');
        const doctors = await storage.getUsersByRole('doctor');
        const admins = await storage.getUsersByRole('admin');
        users = [...patients, ...donors, ...doctors, ...admins];
      }

      // Remove sensitive information
      const sanitizedUsers = users.map(user => ({
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
        createdAt: user.createdAt,
      }));

      res.json(sanitizedUsers);
    } catch (error: any) {
      res.status(500).json({ message: error.message || "Failed to get users" });
    }
  });

  app.patch("/api/admin/users/:id/status", requireAuth, requireRole("admin"), async (req: AuthRequest, res) => {
    try {
      const { id } = req.params;
      const { isActive } = req.body;
      
      const user = await storage.updateUser(id, { isActive });
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      res.json({ message: "User status updated successfully" });
    } catch (error: any) {
      res.status(400).json({ message: error.message || "Failed to update user status" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
