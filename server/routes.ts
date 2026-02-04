import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // === API Routes ===

  // List configurations
  app.get(api.configurations.list.path, async (req, res) => {
    const configs = await storage.getConfigurations();
    res.json(configs);
  });

  // Create configuration
  app.post(api.configurations.create.path, async (req, res) => {
    try {
      const input = api.configurations.create.input.parse(req.body);
      const config = await storage.createConfiguration(input);
      res.status(201).json(config);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      throw err;
    }
  });

  // Delete configuration
  app.delete(api.configurations.delete.path, async (req, res) => {
    const id = Number(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid ID" });
    }
    await storage.deleteConfiguration(id);
    res.status(204).send();
  });

  return httpServer;
}
