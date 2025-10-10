import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, real, integer, jsonb, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const vehicles = pgTable("vehicles", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  plate: text("plate").notNull().unique(),
  model: text("model").notNull(),
  deviceId: text("device_id").notNull().unique(),
  status: text("status").notNull().default("active"), // active, inactive, maintenance
  manufacturer: text("manufacturer"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const gpsData = pgTable("gps_data", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  vehicleId: varchar("vehicle_id").references(() => vehicles.id, { onDelete: "cascade" }),
  deviceId: text("device_id").notNull(),
  latitude: real("latitude").notNull(),
  longitude: real("longitude").notNull(),
  speed: real("speed"), // km/h
  direction: real("direction"), // degrees
  altitude: real("altitude"), // meters
  satellites: integer("satellites"),
  ignition: boolean("ignition"),
  mainBattery: real("main_battery"), // volts
  backupBattery: real("backup_battery"), // volts
  odometer: real("odometer"), // km
  horimeter: real("horimeter"), // hours
  timestamp: timestamp("timestamp").notNull(),
  rawData: jsonb("raw_data"), // store original JSON for reference
  createdAt: timestamp("created_at").defaultNow(),
});

export const uploadHistory = pgTable("upload_history", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  filename: text("filename").notNull(),
  recordsProcessed: integer("records_processed").notNull(),
  recordsSkipped: integer("records_skipped").default(0),
  fileSize: integer("file_size"), // bytes
  uploadedAt: timestamp("uploaded_at").defaultNow(),
});

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  name: text("name").notNull(),
  role: text("role").notNull().default("user"), // user, admin
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertVehicleSchema = createInsertSchema(vehicles).pick({
  plate: true,
  model: true,
  deviceId: true,
  status: true,
  manufacturer: true,
  notes: true,
});

export const insertGpsDataSchema = createInsertSchema(gpsData).pick({
  vehicleId: true,
  deviceId: true,
  latitude: true,
  longitude: true,
  speed: true,
  direction: true,
  altitude: true,
  satellites: true,
  ignition: true,
  mainBattery: true,
  backupBattery: true,
  odometer: true,
  horimeter: true,
  timestamp: true,
  rawData: true,
});

export const insertUploadHistorySchema = createInsertSchema(uploadHistory).pick({
  filename: true,
  recordsProcessed: true,
  recordsSkipped: true,
  fileSize: true,
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  name: true,
  role: true,
});

// Validation schemas for API
export const vehicleFormSchema = insertVehicleSchema.extend({
  plate: z.string().min(1, "Placa é obrigatória").max(10),
  model: z.string().min(1, "Modelo é obrigatório").max(50),
  deviceId: z.string().min(1, "Device ID é obrigatório").max(50),
  status: z.enum(["active", "inactive", "maintenance"]),
  manufacturer: z.string().optional(),
  notes: z.string().optional(),
});

export const gpsDataQuerySchema = z.object({
  vehicleId: z.string().optional(),
  deviceId: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  limit: z.coerce.number().optional().default(100),
});

// Validation schemas for forms
export const loginSchema = z.object({
  username: z.string().min(1, "Usuário é obrigatório"),
  password: z.string().min(1, "Senha é obrigatória"),
});

export const registerSchema = insertUserSchema.pick({
  username: true,
  password: true,
  name: true,
}).extend({
  username: z.string().min(3, "Usuário deve ter pelo menos 3 caracteres"),
  password: z.string().min(6, "Senha deve ter pelo menos 6 caracteres"),
  name: z.string().min(1, "Nome é obrigatório"),
});

export type InsertVehicle = z.infer<typeof insertVehicleSchema>;
export type Vehicle = typeof vehicles.$inferSelect;
export type InsertGpsData = z.infer<typeof insertGpsDataSchema>;
export type GpsData = typeof gpsData.$inferSelect;
export type InsertUploadHistory = z.infer<typeof insertUploadHistorySchema>;
export type UploadHistory = typeof uploadHistory.$inferSelect;
export type VehicleForm = z.infer<typeof vehicleFormSchema>;
export type GpsDataQuery = z.infer<typeof gpsDataQuerySchema>;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type LoginForm = z.infer<typeof loginSchema>;
export type RegisterForm = z.infer<typeof registerSchema>;
