import { db } from "./db";
import {
  configurations,
  type Configuration,
  type InsertConfiguration,
} from "@shared/schema";
import { eq } from "drizzle-orm";

export interface IStorage {
  getConfigurations(): Promise<Configuration[]>;
  createConfiguration(config: InsertConfiguration): Promise<Configuration>;
  deleteConfiguration(id: number): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  async getConfigurations(): Promise<Configuration[]> {
    return await db.select().from(configurations).orderBy(configurations.createdAt);
  }

  async createConfiguration(insertConfig: InsertConfiguration): Promise<Configuration> {
    const [config] = await db
      .insert(configurations)
      .values(insertConfig)
      .returning();
    return config;
  }

  async deleteConfiguration(id: number): Promise<void> {
    await db.delete(configurations).where(eq(configurations.id, id));
  }
}

export const storage = new DatabaseStorage();
