import { 
  users, 
  organRequests, 
  organPledges, 
  organMatches, 
  medicalRecords,
  type User, 
  type InsertUser,
  type UpsertUser,
  type OrganRequest,
  type InsertOrganRequest,
  type OrganPledge,
  type InsertOrganPledge,
  type OrganMatch,
  type InsertOrganMatch,
  type MedicalRecord,
  type InsertMedicalRecord
} from "@shared/schema";
import { db } from "./db";
import { eq, and, or, desc, asc } from "drizzle-orm";

export interface IStorage {
  // User management
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, updates: Partial<InsertUser>): Promise<User | undefined>;
  getUsersByRole(role: string): Promise<User[]>;
  // Required for Replit Auth
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Organ requests
  createOrganRequest(request: InsertOrganRequest): Promise<OrganRequest>;
  getOrganRequestById(id: string): Promise<OrganRequest | undefined>;
  getOrganRequestsByPatient(patientId: string): Promise<OrganRequest[]>;
  getOrganRequestsByStatus(status: string): Promise<OrganRequest[]>;
  updateOrganRequestStatus(id: string, status: string, approvedBy?: string, notes?: string): Promise<OrganRequest | undefined>;
  getAllOrganRequests(): Promise<OrganRequest[]>;
  
  // Organ pledges
  createOrganPledge(pledge: InsertOrganPledge): Promise<OrganPledge>;
  getOrganPledgeById(id: string): Promise<OrganPledge | undefined>;
  getOrganPledgesByDonor(donorId: string): Promise<OrganPledge[]>;
  getAvailableOrganPledges(): Promise<OrganPledge[]>;
  updateOrganPledgeAvailability(id: string, isAvailable: boolean): Promise<OrganPledge | undefined>;
  
  // Organ matches
  createOrganMatch(match: InsertOrganMatch): Promise<OrganMatch>;
  getOrganMatchById(id: string): Promise<OrganMatch | undefined>;
  getOrganMatchesByDoctor(doctorId: string): Promise<OrganMatch[]>;
  getPotentialMatches(): Promise<OrganMatch[]>;
  updateOrganMatchStatus(id: string, status: string, approvedBy?: string): Promise<OrganMatch | undefined>;
  
  // Medical records
  createMedicalRecord(record: InsertMedicalRecord): Promise<MedicalRecord>;
  getMedicalRecordsByUser(userId: string): Promise<MedicalRecord[]>;
  
  // Statistics
  getSystemStats(): Promise<{
    totalUsers: number;
    activeDonors: number;
    pendingRequests: number;
    successfulMatches: number;
  }>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }


  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  // Required for Replit Auth - upserts user data from OIDC claims
  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  async updateUser(id: string, updates: Partial<InsertUser>): Promise<User | undefined> {
    const [user] = await db
      .update(users)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return user || undefined;
  }

  async getUsersByRole(role: string): Promise<User[]> {
    return await db.select().from(users).where(eq(users.role, role as any));
  }

  async createOrganRequest(request: InsertOrganRequest): Promise<OrganRequest> {
    const [organRequest] = await db
      .insert(organRequests)
      .values(request)
      .returning();
    return organRequest;
  }

  async getOrganRequestById(id: string): Promise<OrganRequest | undefined> {
    const [request] = await db.select().from(organRequests).where(eq(organRequests.id, id));
    return request || undefined;
  }

  async getOrganRequestsByPatient(patientId: string): Promise<OrganRequest[]> {
    return await db.select().from(organRequests)
      .where(eq(organRequests.patientId, patientId))
      .orderBy(desc(organRequests.createdAt));
  }

  async getOrganRequestsByStatus(status: string): Promise<OrganRequest[]> {
    return await db.select().from(organRequests)
      .where(eq(organRequests.status, status as any))
      .orderBy(desc(organRequests.createdAt));
  }

  async updateOrganRequestStatus(id: string, status: string, approvedBy?: string, notes?: string): Promise<OrganRequest | undefined> {
    const updates: any = { 
      status: status as any, 
      updatedAt: new Date() 
    };
    
    if (approvedBy) updates.approvedBy = approvedBy;
    if (notes) updates.doctorNotes = notes;

    const [request] = await db
      .update(organRequests)
      .set(updates)
      .where(eq(organRequests.id, id))
      .returning();
    return request || undefined;
  }

  async getAllOrganRequests(): Promise<OrganRequest[]> {
    return await db.select().from(organRequests)
      .orderBy(desc(organRequests.createdAt));
  }

  async createOrganPledge(pledge: InsertOrganPledge): Promise<OrganPledge> {
    const [organPledge] = await db
      .insert(organPledges)
      .values(pledge)
      .returning();
    return organPledge;
  }

  async getOrganPledgeById(id: string): Promise<OrganPledge | undefined> {
    const [pledge] = await db.select().from(organPledges).where(eq(organPledges.id, id));
    return pledge || undefined;
  }

  async getOrganPledgesByDonor(donorId: string): Promise<OrganPledge[]> {
    return await db.select().from(organPledges)
      .where(eq(organPledges.donorId, donorId))
      .orderBy(desc(organPledges.createdAt));
  }

  async getAvailableOrganPledges(): Promise<OrganPledge[]> {
    return await db.select().from(organPledges)
      .where(eq(organPledges.isAvailable, true))
      .orderBy(desc(organPledges.createdAt));
  }

  async updateOrganPledgeAvailability(id: string, isAvailable: boolean): Promise<OrganPledge | undefined> {
    const [pledge] = await db
      .update(organPledges)
      .set({ isAvailable, updatedAt: new Date() })
      .where(eq(organPledges.id, id))
      .returning();
    return pledge || undefined;
  }

  async createOrganMatch(match: InsertOrganMatch): Promise<OrganMatch> {
    const [organMatch] = await db
      .insert(organMatches)
      .values(match)
      .returning();
    return organMatch;
  }

  async getOrganMatchById(id: string): Promise<OrganMatch | undefined> {
    const [match] = await db.select().from(organMatches).where(eq(organMatches.id, id));
    return match || undefined;
  }

  async getOrganMatchesByDoctor(doctorId: string): Promise<OrganMatch[]> {
    return await db.select().from(organMatches)
      .where(eq(organMatches.doctorId, doctorId))
      .orderBy(desc(organMatches.createdAt));
  }

  async getPotentialMatches(): Promise<OrganMatch[]> {
    return await db.select().from(organMatches)
      .where(eq(organMatches.status, 'pending'))
      .orderBy(desc(organMatches.compatibilityScore));
  }

  async updateOrganMatchStatus(id: string, status: string, approvedBy?: string): Promise<OrganMatch | undefined> {
    const updates: any = { 
      status: status as any, 
      updatedAt: new Date() 
    };
    
    if (approvedBy) updates.approvedBy = approvedBy;

    const [match] = await db
      .update(organMatches)
      .set(updates)
      .where(eq(organMatches.id, id))
      .returning();
    return match || undefined;
  }

  async createMedicalRecord(record: InsertMedicalRecord): Promise<MedicalRecord> {
    const [medicalRecord] = await db
      .insert(medicalRecords)
      .values(record)
      .returning();
    return medicalRecord;
  }

  async getMedicalRecordsByUser(userId: string): Promise<MedicalRecord[]> {
    return await db.select().from(medicalRecords)
      .where(eq(medicalRecords.userId, userId))
      .orderBy(desc(medicalRecords.createdAt));
  }

  async getSystemStats(): Promise<{
    totalUsers: number;
    activeDonors: number;
    pendingRequests: number;
    successfulMatches: number;
  }> {
    const allUsers = await db.select().from(users);
    const activeDonors = await db.select().from(users).where(eq(users.role, 'donor'));
    const pendingRequestsResult = await db.select().from(organRequests).where(eq(organRequests.status, 'pending'));
    const successfulMatchesResult = await db.select().from(organMatches).where(eq(organMatches.status, 'completed'));

    return {
      totalUsers: allUsers.length,
      activeDonors: activeDonors.length,
      pendingRequests: pendingRequestsResult.length,
      successfulMatches: successfulMatchesResult.length,
    };
  }
}

export const storage = new DatabaseStorage();
