import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { vehicleFormSchema, gpsDataQuerySchema, type GpsDataQuery } from "@shared/schema";
import multer from "multer";
import { z } from "zod";
import { setupAuth } from "./auth";

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/json' || file.originalname.endsWith('.json')) {
      cb(null, true);
    } else {
      cb(new Error('Only JSON files are allowed'));
    }
  }
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup authentication routes
  setupAuth(app);

  // Vehicle CRUD routes
  app.get("/api/vehicles", async (req, res) => {
    try {
      const vehicles = await storage.getVehicles();
      res.json(vehicles);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch vehicles" });
    }
  });

  app.get("/api/vehicles/:id", async (req, res) => {
    try {
      const vehicle = await storage.getVehicle(req.params.id);
      if (!vehicle) {
        return res.status(404).json({ error: "Vehicle not found" });
      }
      res.json(vehicle);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch vehicle" });
    }
  });

  app.post("/api/vehicles", async (req, res) => {
    try {
      const validatedData = vehicleFormSchema.parse(req.body);
      
      // Check if plate already exists
      const existingByPlate = await storage.getVehicleByPlate(validatedData.plate);
      if (existingByPlate) {
        return res.status(400).json({ error: "Vehicle with this plate already exists" });
      }

      // Check if device ID already exists
      const existingByDeviceId = await storage.getVehicleByDeviceId(validatedData.deviceId);
      if (existingByDeviceId) {
        return res.status(400).json({ error: "Vehicle with this device ID already exists" });
      }

      const vehicle = await storage.createVehicle(validatedData);
      res.status(201).json(vehicle);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Validation failed", details: error.errors });
      }
      res.status(500).json({ error: "Failed to create vehicle" });
    }
  });

  app.put("/api/vehicles/:id", async (req, res) => {
    try {
      const validatedData = vehicleFormSchema.partial().parse(req.body);
      
      // Check for conflicts if plate or deviceId are being updated
      if (validatedData.plate) {
        const existingByPlate = await storage.getVehicleByPlate(validatedData.plate);
        if (existingByPlate && existingByPlate.id !== req.params.id) {
          return res.status(400).json({ error: "Vehicle with this plate already exists" });
        }
      }

      if (validatedData.deviceId) {
        const existingByDeviceId = await storage.getVehicleByDeviceId(validatedData.deviceId);
        if (existingByDeviceId && existingByDeviceId.id !== req.params.id) {
          return res.status(400).json({ error: "Vehicle with this device ID already exists" });
        }
      }

      const vehicle = await storage.updateVehicle(req.params.id, validatedData);
      if (!vehicle) {
        return res.status(404).json({ error: "Vehicle not found" });
      }
      res.json(vehicle);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Validation failed", details: error.errors });
      }
      res.status(500).json({ error: "Failed to update vehicle" });
    }
  });

  app.delete("/api/vehicles/:id", async (req, res) => {
    try {
      const deleted = await storage.deleteVehicle(req.params.id);
      if (!deleted) {
        return res.status(404).json({ error: "Vehicle not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete vehicle" });
    }
  });

  // GPS Data routes
  app.get("/api/gps-data", async (req, res) => {
    try {
      const query = gpsDataQuerySchema.parse(req.query);
      const gpsData = await storage.getGpsData(query);
      res.json(gpsData);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid query parameters", details: error.errors });
      }
      res.status(500).json({ error: "Failed to fetch GPS data" });
    }
  });

  app.get("/api/vehicles/:id/latest-position", async (req, res) => {
    try {
      const latestData = await storage.getLatestGpsData(req.params.id);
      if (!latestData) {
        return res.status(404).json({ error: "No GPS data found for this vehicle" });
      }
      res.json(latestData);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch latest position" });
    }
  });

  // JSON Upload route
  app.post("/api/upload-json", upload.single('file'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
      }

      const jsonData = JSON.parse(req.file.buffer.toString('utf8'));
      
      // Validate JSON structure - expecting array of GPS records
      if (!Array.isArray(jsonData)) {
        return res.status(400).json({ error: "JSON must be an array of GPS records" });
      }

      let processedCount = 0;
      let skippedCount = 0;
      const gpsDataToInsert = [];

      for (const record of jsonData) {
        try {
          // Map JSON record to our GPS data structure
          // Assuming JSON format: { deviceId, latitude, longitude, speed, timestamp, ... }
          if (!record.deviceId || !record.latitude || !record.longitude || !record.timestamp) {
            skippedCount++;
            continue;
          }

          // Find vehicle by device ID
          const vehicle = await storage.getVehicleByDeviceId(record.deviceId);
          if (!vehicle) {
            skippedCount++;
            continue;
          }

          const gpsData = {
            vehicleId: vehicle.id,
            deviceId: record.deviceId,
            latitude: parseFloat(record.latitude),
            longitude: parseFloat(record.longitude),
            speed: record.speed ? parseFloat(record.speed) : null,
            direction: record.direction ? parseFloat(record.direction) : null,
            altitude: record.altitude ? parseFloat(record.altitude) : null,
            satellites: record.satellites ? parseInt(record.satellites) : null,
            ignition: record.ignition !== undefined ? Boolean(record.ignition) : null,
            mainBattery: record.mainBattery ? parseFloat(record.mainBattery) : null,
            backupBattery: record.backupBattery ? parseFloat(record.backupBattery) : null,
            odometer: record.odometer ? parseFloat(record.odometer) : null,
            horimeter: record.horimeter ? parseFloat(record.horimeter) : null,
            timestamp: new Date(record.timestamp),
            rawData: record,
          };

          gpsDataToInsert.push(gpsData);
          processedCount++;
        } catch (recordError) {
          skippedCount++;
        }
      }

      // Bulk insert GPS data
      await storage.bulkCreateGpsData(gpsDataToInsert);

      // Create upload history record
      await storage.createUploadHistory({
        filename: req.file.originalname,
        recordsProcessed: processedCount,
        recordsSkipped: skippedCount,
        fileSize: req.file.size,
      });

      res.json({
        message: "File processed successfully",
        recordsProcessed: processedCount,
        recordsSkipped: skippedCount,
        totalRecords: jsonData.length
      });

    } catch (error) {
      if (error instanceof SyntaxError) {
        return res.status(400).json({ error: "Invalid JSON format" });
      }
      res.status(500).json({ error: "Failed to process file" });
    }
  });

  // Upload history route
  app.get("/api/upload-history", async (req, res) => {
    try {
      const history = await storage.getUploadHistory();
      res.json(history);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch upload history" });
    }
  });

  // Statistics routes
  app.get("/api/stats", async (req, res) => {
    try {
      const [vehicleCount, activeVehicleCount, routesTrackedToday] = await Promise.all([
        storage.getVehicleCount(),
        storage.getActiveVehicleCount(),
        storage.getRoutesTrackedToday(),
      ]);

      res.json({
        vehicleCount,
        activeVehicleCount,
        routesTrackedToday,
        lastUpdate: new Date().toISOString(),
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch statistics" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
