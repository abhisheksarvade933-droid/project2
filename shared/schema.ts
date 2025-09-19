import { sql, relations } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, integer, boolean, pgEnum, index, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const userRoleEnum = pgEnum('user_role', ['patient', 'donor', 'doctor', 'admin']);
export const bloodTypeEnum = pgEnum('blood_type', ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']);
export const organTypeEnum = pgEnum('organ_type', ['heart', 'kidney', 'liver', 'lung', 'pancreas', 'cornea']);
export const requestStatusEnum = pgEnum('request_status', ['pending', 'approved', 'rejected', 'matched', 'completed']);
export const donationTypeEnum = pgEnum('donation_type', ['living', 'posthumous']);
export const priorityEnum = pgEnum('priority_level', ['low', 'medium', 'high', 'critical']);

// Session storage table for Replit Auth - REQUIRED
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  role: userRoleEnum("role").default('patient'), // Default role for new users
  phoneNumber: text("phone_number"),
  dateOfBirth: timestamp("date_of_birth"),
  bloodType: bloodTypeEnum("blood_type"),
  medicalCondition: text("medical_condition"),
  weight: integer("weight"),
  height: integer("height"),
  address: text("address"),
  city: text("city"),
  state: text("state"),
  zipCode: text("zip_code"),
  emergencyContact: text("emergency_contact"),
  emergencyPhone: text("emergency_phone"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const organRequests = pgTable("organ_requests", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  patientId: varchar("patient_id").notNull().references(() => users.id),
  organType: organTypeEnum("organ_type").notNull(),
  priority: priorityEnum("priority").notNull(),
  status: requestStatusEnum("status").default('pending'),
  medicalReason: text("medical_reason").notNull(),
  doctorNotes: text("doctor_notes"),
  approvedBy: varchar("approved_by").references(() => users.id),
  rejectionReason: text("rejection_reason"),
  estimatedWaitTime: integer("estimated_wait_time"), // in days
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`),
  updatedAt: timestamp("updated_at").default(sql`CURRENT_TIMESTAMP`),
});

export const organPledges = pgTable("organ_pledges", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  donorId: varchar("donor_id").notNull().references(() => users.id),
  organType: organTypeEnum("organ_type").notNull(),
  donationType: donationTypeEnum("donation_type").notNull(),
  isAvailable: boolean("is_available").default(true),
  medicalNotes: text("medical_notes"),
  approvedBy: varchar("approved_by").references(() => users.id),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`),
  updatedAt: timestamp("updated_at").default(sql`CURRENT_TIMESTAMP`),
});

export const organMatches = pgTable("organ_matches", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  requestId: varchar("request_id").notNull().references(() => organRequests.id),
  pledgeId: varchar("pledge_id").notNull().references(() => organPledges.id),
  compatibilityScore: integer("compatibility_score"), // 0-100
  doctorId: varchar("doctor_id").references(() => users.id),
  status: requestStatusEnum("status").default('pending'),
  recommendedBy: varchar("recommended_by").references(() => users.id),
  approvedBy: varchar("approved_by").references(() => users.id),
  notes: text("notes"),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`),
  updatedAt: timestamp("updated_at").default(sql`CURRENT_TIMESTAMP`),
});

export const medicalRecords = pgTable("medical_records", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  recordType: text("record_type").notNull(), // 'evaluation', 'test_result', 'checkup'
  description: text("description").notNull(),
  results: text("results"),
  doctorId: varchar("doctor_id").references(() => users.id),
  attachments: text("attachments").array(),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  organRequests: many(organRequests),
  organPledges: many(organPledges),
  doctorMatches: many(organMatches, { relationName: "doctorMatches" }),
  recommendedMatches: many(organMatches, { relationName: "recommendedMatches" }),
  approvedMatches: many(organMatches, { relationName: "approvedMatches" }),
  medicalRecords: many(medicalRecords),
}));

export const organRequestsRelations = relations(organRequests, ({ one, many }) => ({
  patient: one(users, {
    fields: [organRequests.patientId],
    references: [users.id],
  }),
  approvedBy: one(users, {
    fields: [organRequests.approvedBy],
    references: [users.id],
  }),
  matches: many(organMatches),
}));

export const organPledgesRelations = relations(organPledges, ({ one, many }) => ({
  donor: one(users, {
    fields: [organPledges.donorId],
    references: [users.id],
  }),
  approvedBy: one(users, {
    fields: [organPledges.approvedBy],
    references: [users.id],
  }),
  matches: many(organMatches),
}));

export const organMatchesRelations = relations(organMatches, ({ one }) => ({
  request: one(organRequests, {
    fields: [organMatches.requestId],
    references: [organRequests.id],
  }),
  pledge: one(organPledges, {
    fields: [organMatches.pledgeId],
    references: [organPledges.id],
  }),
  doctor: one(users, {
    fields: [organMatches.doctorId],
    references: [users.id],
  }),
  recommendedBy: one(users, {
    fields: [organMatches.recommendedBy],
    references: [users.id],
  }),
  approvedBy: one(users, {
    fields: [organMatches.approvedBy],
    references: [users.id],
  }),
}));

export const medicalRecordsRelations = relations(medicalRecords, ({ one }) => ({
  user: one(users, {
    fields: [medicalRecords.userId],
    references: [users.id],
  }),
  doctor: one(users, {
    fields: [medicalRecords.doctorId],
    references: [users.id],
  }),
}));

// Insert schemas for Replit Auth
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Upsert schema specifically for Replit Auth
export const upsertUserSchema = createInsertSchema(users).omit({
  createdAt: true,
  updatedAt: true,
}).partial().extend({
  id: z.string(),
});

export const insertOrganRequestSchema = createInsertSchema(organRequests).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  approvedBy: true,
});

export const insertOrganPledgeSchema = createInsertSchema(organPledges).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  approvedBy: true,
});

export const insertOrganMatchSchema = createInsertSchema(organMatches).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertMedicalRecordSchema = createInsertSchema(medicalRecords).omit({
  id: true,
  createdAt: true,
});

// Login schema
export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type UpsertUser = z.infer<typeof upsertUserSchema>; // Required for Replit Auth
export type User = typeof users.$inferSelect;
export type InsertOrganRequest = z.infer<typeof insertOrganRequestSchema>;
export type OrganRequest = typeof organRequests.$inferSelect;
export type InsertOrganPledge = z.infer<typeof insertOrganPledgeSchema>;
export type OrganPledge = typeof organPledges.$inferSelect;
export type InsertOrganMatch = z.infer<typeof insertOrganMatchSchema>;
export type OrganMatch = typeof organMatches.$inferSelect;
export type InsertMedicalRecord = z.infer<typeof insertMedicalRecordSchema>;
export type MedicalRecord = typeof medicalRecords.$inferSelect;
export type LoginCredentials = z.infer<typeof loginSchema>;

// Enums for frontend
export const USER_ROLES = ['patient', 'donor', 'doctor', 'admin'] as const;
export const BLOOD_TYPES = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'] as const;
export const ORGAN_TYPES = ['heart', 'kidney', 'liver', 'lung', 'pancreas', 'cornea'] as const;
export const REQUEST_STATUSES = ['pending', 'approved', 'rejected', 'matched', 'completed'] as const;
export const DONATION_TYPES = ['living', 'posthumous'] as const;
export const PRIORITY_LEVELS = ['low', 'medium', 'high', 'critical'] as const;
