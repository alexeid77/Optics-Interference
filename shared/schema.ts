import { pgTable, text, serial, integer, timestamp, doublePrecision } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// === TABLE DEFINITIONS ===
export const configurations = pgTable("configurations", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  wavelength: doublePrecision("wavelength").notNull(), // in nanometers
  separation: doublePrecision("separation").notNull(), // in millimeters
  distance: doublePrecision("distance").notNull(),    // in meters
  createdAt: timestamp("created_at").defaultNow(),
});

// === BASE SCHEMAS ===
export const insertConfigurationSchema = createInsertSchema(configurations).omit({ id: true, createdAt: true });

// === EXPLICIT API CONTRACT TYPES ===
export type Configuration = typeof configurations.$inferSelect;
export type InsertConfiguration = z.infer<typeof insertConfigurationSchema>;

export type CreateConfigurationRequest = InsertConfiguration;
export type ConfigurationResponse = Configuration;
export type ConfigurationsListResponse = Configuration[];
