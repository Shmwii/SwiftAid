import { pgTable, text, serial, integer, boolean, jsonb, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User schema
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  firstName: text("first_name"),
  lastName: text("last_name"),
  phoneNumber: text("phone_number"),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  firstName: true,
  lastName: true,
  phoneNumber: true,
});

// Location schema
export const locations = pgTable("locations", {
  id: serial("id").primaryKey(),
  latitude: text("latitude").notNull(),
  longitude: text("longitude").notNull(),
  address: text("address").notNull(),
});

export const insertLocationSchema = createInsertSchema(locations).pick({
  latitude: true,
  longitude: true,
  address: true,
});

// Ambulance schema
export const ambulances = pgTable("ambulances", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  status: text("status").notNull().default("Available"), // Available, Dispatched, EnRoute, OnScene
  latitude: text("latitude"),
  longitude: text("longitude"),
  speed: integer("speed"),
});

export const insertAmbulanceSchema = createInsertSchema(ambulances).pick({
  name: true,
  status: true,
  latitude: true,
  longitude: true,
  speed: true,
});

// Hospital schema
export const hospitals = pgTable("hospitals", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  latitude: text("latitude").notNull(),
  longitude: text("longitude").notNull(),
  address: text("address").notNull(),
});

export const insertHospitalSchema = createInsertSchema(hospitals).pick({
  name: true,
  latitude: true,
  longitude: true,
  address: true,
});

// Emergency schema
export const emergencies = pgTable("emergencies", {
  id: serial("id").primaryKey(),
  type: text("type").notNull(), // Cardiac, Injury, Respiratory, Other
  status: text("status").notNull().default("Pending"), // Pending, Dispatched, EnRoute, Arrived, Completed, Cancelled
  createdAt: timestamp("created_at").notNull().defaultNow(),
  
  // Relations (in a real DB these would be foreign keys)
  userId: integer("user_id").notNull(),
  locationId: integer("location_id").notNull(),
  ambulanceId: integer("ambulance_id"),
  hospitalId: integer("hospital_id"),
  
  // For simplicity in MVP, store these directly
  patientInfo: jsonb("patient_info").notNull(),
  locationInfo: jsonb("location_info").notNull(),
  ambulanceInfo: jsonb("ambulance_info"),
  hospitalInfo: jsonb("hospital_info"),
  
  eta: integer("eta"), // Estimated time of arrival in minutes
});

export const insertEmergencySchema = createInsertSchema(emergencies).pick({
  type: true,
  userId: true,
  locationId: true,
  patientInfo: true,
  locationInfo: true,
});

// Activity schema for recent activities
export const activities = pgTable("activities", {
  id: serial("id").primaryKey(),
  type: text("type").notNull(),
  date: timestamp("date").notNull().defaultNow(),
  status: text("status").notNull(),
  userId: integer("user_id"),
  emergencyId: integer("emergency_id"),
});

export const insertActivitySchema = createInsertSchema(activities).pick({
  type: true,
  status: true,
  userId: true,
  emergencyId: true,
});

// Type exports
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertLocation = z.infer<typeof insertLocationSchema>;
export type Location = typeof locations.$inferSelect;

export type InsertAmbulance = z.infer<typeof insertAmbulanceSchema>;
export type Ambulance = typeof ambulances.$inferSelect;

export type InsertHospital = z.infer<typeof insertHospitalSchema>;
export type Hospital = typeof hospitals.$inferSelect;

export type InsertEmergency = z.infer<typeof insertEmergencySchema>;
export type Emergency = typeof emergencies.$inferSelect;

export type InsertActivity = z.infer<typeof insertActivitySchema>;
export type Activity = typeof activities.$inferSelect;
