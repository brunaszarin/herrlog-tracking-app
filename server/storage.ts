import { 
  type Vehicle, 
  type InsertVehicle,
  type GpsData,
  type InsertGpsData,
  type UploadHistory,
  type InsertUploadHistory,
  type GpsDataQuery,
  type User,
  type InsertUser
} from "@shared/schema";
import { randomUUID } from "crypto";
import session from "express-session";
import createMemoryStore from "memorystore";

export interface IStorage {
  // Vehicle operations
  getVehicles(): Promise<Vehicle[]>;
  getVehicle(id: string): Promise<Vehicle | undefined>;
  getVehicleByPlate(plate: string): Promise<Vehicle | undefined>;
  getVehicleByDeviceId(deviceId: string): Promise<Vehicle | undefined>;
  createVehicle(vehicle: InsertVehicle): Promise<Vehicle>;
  updateVehicle(id: string, vehicle: Partial<InsertVehicle>): Promise<Vehicle | undefined>;
  deleteVehicle(id: string): Promise<boolean>;

  // GPS Data operations
  getGpsData(query: GpsDataQuery): Promise<GpsData[]>;
  getLatestGpsData(vehicleId: string): Promise<GpsData | undefined>;
  createGpsData(gpsData: InsertGpsData): Promise<GpsData>;
  bulkCreateGpsData(gpsDataList: InsertGpsData[]): Promise<GpsData[]>;

  // Upload History operations
  getUploadHistory(): Promise<UploadHistory[]>;
  createUploadHistory(uploadHistory: InsertUploadHistory): Promise<UploadHistory>;

  // User operations
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Statistics
  getVehicleCount(): Promise<number>;
  getActiveVehicleCount(): Promise<number>;
  getRoutesTrackedToday(): Promise<number>;

  // Session store
  sessionStore: session.Store;
}

const MemoryStore = createMemoryStore(session);

export class MemStorage implements IStorage {
  private vehicles: Map<string, Vehicle>;
  private gpsData: Map<string, GpsData>;
  private uploadHistory: Map<string, UploadHistory>;
  private users: Map<string, User>;
  public sessionStore: session.Store;

  constructor() {
    this.vehicles = new Map();
    this.gpsData = new Map();
    this.uploadHistory = new Map();
    this.users = new Map();
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000, // 24 hours
    });
    this.seedData();
  }

  private seedData() {
    // Sample vehicles
    const sampleVehicles = [
      {
        plate: "JBD2F63",
        model: "ST310",
        deviceId: "511353816",
        status: "active" as const,
        manufacturer: "Suntech",
        notes: "Principal veículo da frota"
      },
      {
        plate: "IPO0E20",
        model: "ST8310U",
        deviceId: "1970034780",
        status: "active" as const,
        manufacturer: "Suntech",
        notes: ""
      },
      {
        plate: "ISX0J70",
        model: "ST310UC2",
        deviceId: "807328476",
        status: "active" as const,
        manufacturer: "Suntech",
        notes: ""
      },
      {
        plate: "ISB0642",
        model: "ST8310UM",
        deviceId: "180091986",
        status: "inactive" as const,
        manufacturer: "Suntech",
        notes: "Em manutenção preventiva"
      },
      {
        plate: "IZT1A90",
        model: "ST310UC2",
        deviceId: "807435864",
        status: "active" as const,
        manufacturer: "Suntech",
        notes: ""
      }
    ];

    sampleVehicles.forEach(vehicleData => {
      const vehicle: Vehicle = {
        ...vehicleData,
        id: randomUUID(),
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      this.vehicles.set(vehicle.id, vehicle);
    });

    // GPS data
    const gpsRecords = [
      // JBD2F63 route data
      { plate: "JBD2F63", deviceId: "511353816", lat: -29.943495, lng: -51.204738, speed: 89, direction: 349.81, time: "2025-09-26T15:58:22", ignition: true, mainBattery: 28.63, odometer: 427339266 },
      { plate: "JBD2F63", deviceId: "511353816", lat: -29.931302, lng: -51.21284, speed: 95, direction: 321.24, time: "2025-09-26T15:59:22", ignition: true, mainBattery: 28.60, odometer: 427340855 },
      { plate: "JBD2F63", deviceId: "511353816", lat: -29.924318, lng: -51.226985, speed: 95, direction: 295.15, time: "2025-09-26T16:00:22", ignition: true, mainBattery: 28.63, odometer: 427342462 },
      { plate: "JBD2F63", deviceId: "511353816", lat: -29.913233, lng: -51.236955, speed: 95, direction: 330.48, time: "2025-09-26T16:01:22", ignition: true, mainBattery: 28.63, odometer: 427344050 },
      { plate: "JBD2F63", deviceId: "511353816", lat: -29.901885, lng: -51.244727, speed: 94, direction: 4.53, time: "2025-09-26T16:02:22", ignition: true, mainBattery: 28.63, odometer: 427345621 },
      { plate: "JBD2F63", deviceId: "511353816", lat: -29.889005, lng: -51.240348, speed: 89, direction: 27.16, time: "2025-09-26T16:03:22", ignition: true, mainBattery: 28.63, odometer: 427347138 },
      { plate: "JBD2F63", deviceId: "511353816", lat: -29.883772, lng: -51.229518, speed: 77, direction: 108.92, time: "2025-09-26T16:04:22", ignition: true, mainBattery: 28.67, odometer: 427348508 },
      { plate: "JBD2F63", deviceId: "511353816", lat: -29.888553, lng: -51.2163, speed: 83, direction: 108.63, time: "2025-09-26T16:05:22", ignition: true, mainBattery: 28.63, odometer: 427349890 },
      { plate: "JBD2F63", deviceId: "511353816", lat: -29.891317, lng: -51.20238, speed: 84, direction: 101.76, time: "2025-09-26T16:06:22", ignition: true, mainBattery: 28.63, odometer: 427351268 },

      // IPO0E20 route data
      { plate: "IPO0E20", deviceId: "1970034780", lat: -30.097372, lng: -51.342875, speed: 86, direction: 4.51, time: "2025-09-26T15:58:44", ignition: true, mainBattery: 28.47, odometer: 35940268 },
      { plate: "IPO0E20", deviceId: "1970034780", lat: -30.084052, lng: -51.341743, speed: 87, direction: 4.83, time: "2025-09-26T15:59:44", ignition: true, mainBattery: 28.43, odometer: 35941752 },
      { plate: "IPO0E20", deviceId: "1970034780", lat: -30.071545, lng: -51.34068, speed: 89, direction: 3.95, time: "2025-09-26T16:00:44", ignition: true, mainBattery: 28.43, odometer: 35943146 },
      { plate: "IPO0E20", deviceId: "1970034780", lat: -30.058378, lng: -51.337827, speed: 82, direction: 22.79, time: "2025-09-26T16:01:44", ignition: true, mainBattery: 28.47, odometer: 35944676 },
      { plate: "IPO0E20", deviceId: "1970034780", lat: -30.045988, lng: -51.331847, speed: 89, direction: 23.06, time: "2025-09-26T16:02:44", ignition: true, mainBattery: 28.47, odometer: 35946170 },
      { plate: "IPO0E20", deviceId: "1970034780", lat: -30.034077, lng: -51.326108, speed: 83, direction: 23.67, time: "2025-09-26T16:03:44", ignition: true, mainBattery: 28.47, odometer: 35947606 },
      { plate: "IPO0E20", deviceId: "1970034780", lat: -30.02233, lng: -51.320503, speed: 88, direction: 21.94, time: "2025-09-26T16:04:44", ignition: true, mainBattery: 28.47, odometer: 35948995 },
      { plate: "IPO0E20", deviceId: "1970034780", lat: -30.009652, lng: -51.314453, speed: 91, direction: 22.53, time: "2025-09-26T16:05:44", ignition: true, mainBattery: 28.47, odometer: 35950520 },
      { plate: "IPO0E20", deviceId: "1970034780", lat: -30.004178, lng: -51.31073, speed: 57, direction: 53.69, time: "2025-09-26T16:06:18", ignition: true, mainBattery: 28.47, odometer: 35951244 },
      { plate: "IPO0E20", deviceId: "1970034780", lat: -30.003857, lng: -51.30973, speed: 40, direction: 91.71, time: "2025-09-26T16:06:26", ignition: true, mainBattery: 28.47, odometer: 35951356 },

      // ISX0J70 route data
      { plate: "ISX0J70", deviceId: "807328476", lat: -30.074187, lng: -51.01583, speed: 74, direction: 14.94, time: "2025-09-26T15:58:35", ignition: true, mainBattery: 28.46, odometer: 200172165 },
      { plate: "ISX0J70", deviceId: "807328476", lat: -30.065182, lng: -51.016413, speed: 40, direction: 15.43, time: "2025-09-26T15:59:35", ignition: true, mainBattery: 28.43, odometer: 200173214 },
      { plate: "ISX0J70", deviceId: "807328476", lat: -30.056612, lng: -51.011218, speed: 70, direction: 42.36, time: "2025-09-26T16:00:35", ignition: true, mainBattery: 28.39, odometer: 200174314 },
      { plate: "ISX0J70", deviceId: "807328476", lat: -30.047532, lng: -51.002817, speed: 83, direction: 40.01, time: "2025-09-26T16:01:35", ignition: true, mainBattery: 28.46, odometer: 200175611 },
      { plate: "ISX0J70", deviceId: "807328476", lat: -30.039725, lng: -50.995747, speed: 73, direction: 16.72, time: "2025-09-26T16:02:35", ignition: true, mainBattery: 28.39, odometer: 200176720 },
      { plate: "ISX0J70", deviceId: "807328476", lat: -30.027977, lng: -50.993557, speed: 80, direction: 6.21, time: "2025-09-26T16:03:35", ignition: true, mainBattery: 28.50, odometer: 200178047 },
      { plate: "ISX0J70", deviceId: "807328476", lat: -30.015005, lng: -50.993328, speed: 83, direction: 359.74, time: "2025-09-26T16:04:35", ignition: true, mainBattery: 28.46, odometer: 200179491 },
      { plate: "ISX0J70", deviceId: "807328476", lat: -30.003792, lng: -50.993127, speed: 76, direction: 0.34, time: "2025-09-26T16:05:35", ignition: true, mainBattery: 28.46, odometer: 200180738 },
      { plate: "ISX0J70", deviceId: "807328476", lat: -29.992052, lng: -50.992883, speed: 82, direction: 0.38, time: "2025-09-26T16:06:35", ignition: true, mainBattery: 28.39, odometer: 200182045 },

      // ISB0642 single position (stationary)
      { plate: "ISB0642", deviceId: "180091986", lat: -29.84282, lng: -51.157971, speed: 0, direction: 0.0, time: "2025-09-26T16:01:08", ignition: false, mainBattery: 25.43, odometer: 68587157 },

      // IZT1A90 route data
      { plate: "IZT1A90", deviceId: "807435864", lat: -24.177133, lng: -50.964462, speed: 70, direction: 323.89, time: "2025-09-26T15:52:01", ignition: true, mainBattery: 28.70, odometer: 192747329 },
      { plate: "IZT1A90", deviceId: "807435864", lat: -24.169327, lng: -50.967192, speed: 39, direction: 350.46, time: "2025-09-26T15:53:01", ignition: true, mainBattery: 28.67, odometer: 192748283 },
      { plate: "IZT1A90", deviceId: "807435864", lat: -24.161532, lng: -50.970668, speed: 64, direction: 312.81, time: "2025-09-26T15:54:01", ignition: true, mainBattery: 28.67, odometer: 192749227 },
      { plate: "IZT1A90", deviceId: "807435864", lat: -24.15918, lng: -50.972625, speed: 43, direction: 11.61, time: "2025-09-26T15:54:24", ignition: true, mainBattery: 28.70, odometer: 192749567 },
      { plate: "IZT1A90", deviceId: "807435864", lat: -24.156585, lng: -50.974402, speed: 37, direction: 324.11, time: "2025-09-26T15:55:01", ignition: true, mainBattery: 28.67, odometer: 192749963 },
      { plate: "IZT1A90", deviceId: "807435864", lat: -24.151572, lng: -50.976, speed: 45, direction: 310.17, time: "2025-09-26T15:56:01", ignition: true, mainBattery: 28.70, odometer: 192750561 },
      { plate: "IZT1A90", deviceId: "807435864", lat: -24.145258, lng: -50.983655, speed: 70, direction: 314.5, time: "2025-09-26T15:57:01", ignition: true, mainBattery: 28.73, odometer: 192751610 },
      { plate: "IZT1A90", deviceId: "807435864", lat: -24.143393, lng: -50.992383, speed: 47, direction: 289.53, time: "2025-09-26T15:58:01", ignition: true, mainBattery: 28.67, odometer: 192752604 },
      { plate: "IZT1A90", deviceId: "807435864", lat: -24.143583, lng: -51.00145, speed: 48, direction: 296.91, time: "2025-09-26T15:59:01", ignition: true, mainBattery: 28.67, odometer: 192753591 },
      { plate: "IZT1A90", deviceId: "807435864", lat: -24.140517, lng: -51.005117, speed: 31, direction: 322.53, time: "2025-09-26T16:00:01", ignition: true, mainBattery: 28.70, odometer: 192754105 },
      { plate: "IZT1A90", deviceId: "807435864", lat: -24.138725, lng: -51.005832, speed: 35, direction: 26.53, time: "2025-09-26T16:00:25", ignition: true, mainBattery: 28.70, odometer: 192754323 },
      { plate: "IZT1A90", deviceId: "807435864", lat: -24.136825, lng: -51.00316, speed: 36, direction: 352.32, time: "2025-09-26T16:01:01", ignition: true, mainBattery: 28.63, odometer: 192754691 },
      { plate: "IZT1A90", deviceId: "807435864", lat: -24.132273, lng: -51.01012, speed: 63, direction: 310.6, time: "2025-09-26T16:02:01", ignition: true, mainBattery: 28.70, odometer: 192755601 },
      { plate: "IZT1A90", deviceId: "807435864", lat: -24.125443, lng: -51.018502, speed: 68, direction: 333.23, time: "2025-09-26T16:03:01", ignition: true, mainBattery: 28.73, odometer: 192756758 },
      { plate: "IZT1A90", deviceId: "807435864", lat: -24.124292, lng: -51.018605, speed: 65, direction: 12.86, time: "2025-09-26T16:03:07", ignition: true, mainBattery: 28.70, odometer: 192756872 },
      { plate: "IZT1A90", deviceId: "807435864", lat: -24.118905, lng: -51.019278, speed: 36, direction: 325.99, time: "2025-09-26T16:04:01", ignition: true, mainBattery: 28.67, odometer: 192757535 },
      { plate: "IZT1A90", deviceId: "807435864", lat: -24.116088, lng: -51.026182, speed: 55, direction: 291.49, time: "2025-09-26T16:05:01", ignition: true, mainBattery: 28.70, odometer: 192758351 },
      { plate: "IZT1A90", deviceId: "807435864", lat: -24.113562, lng: -51.035357, speed: 66, direction: 275.54, time: "2025-09-26T16:06:01", ignition: true, mainBattery: 28.73, odometer: 192759355 },
    ];

    // GPS data for all vehicles
    gpsRecords.forEach((record) => {
      const vehicle = Array.from(this.vehicles.values()).find(v => v.plate === record.plate);
      if (vehicle) {
        const gpsData: GpsData = {
          id: randomUUID(),
          vehicleId: vehicle.id,
          deviceId: record.deviceId,
          latitude: record.lat,
          longitude: record.lng,
          speed: record.speed,
          direction: record.direction,
          altitude: null,
          satellites: null,
          ignition: record.ignition,
          mainBattery: record.mainBattery,
          backupBattery: 4.0,
          odometer: record.odometer,
          horimeter: null,
          timestamp: new Date(record.time),
          rawData: null,
          createdAt: new Date(),
        };
        this.gpsData.set(gpsData.id, gpsData);
      }
    });
  }

  // Vehicle operations
  async getVehicles(): Promise<Vehicle[]> {
    return Array.from(this.vehicles.values()).sort((a, b) => 
      (b.updatedAt?.getTime() || 0) - (a.updatedAt?.getTime() || 0)
    );
  }

  async getVehicle(id: string): Promise<Vehicle | undefined> {
    return this.vehicles.get(id);
  }

  async getVehicleByPlate(plate: string): Promise<Vehicle | undefined> {
    return Array.from(this.vehicles.values()).find(v => v.plate === plate);
  }

  async getVehicleByDeviceId(deviceId: string): Promise<Vehicle | undefined> {
    return Array.from(this.vehicles.values()).find(v => v.deviceId === deviceId);
  }

  async createVehicle(insertVehicle: InsertVehicle): Promise<Vehicle> {
    const id = randomUUID();
    const vehicle: Vehicle = {
      plate: insertVehicle.plate,
      model: insertVehicle.model,
      deviceId: insertVehicle.deviceId,
      status: insertVehicle.status || 'active',
      manufacturer: insertVehicle.manufacturer || null,
      notes: insertVehicle.notes || null,
      id,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.vehicles.set(id, vehicle);
    return vehicle;
  }

  async updateVehicle(id: string, updateData: Partial<InsertVehicle>): Promise<Vehicle | undefined> {
    const vehicle = this.vehicles.get(id);
    if (!vehicle) return undefined;

    const updatedVehicle: Vehicle = {
      ...vehicle,
      ...updateData,
      updatedAt: new Date(),
    };
    this.vehicles.set(id, updatedVehicle);
    return updatedVehicle;
  }

  async deleteVehicle(id: string): Promise<boolean> {
    return this.vehicles.delete(id);
  }

  // GPS Data operations
  async getGpsData(query: GpsDataQuery): Promise<GpsData[]> {
    let data = Array.from(this.gpsData.values());

    if (query.vehicleId) {
      data = data.filter(gps => gps.vehicleId === query.vehicleId);
    }

    if (query.deviceId) {
      data = data.filter(gps => gps.deviceId === query.deviceId);
    }

    if (query.startDate) {
      const startDate = new Date(query.startDate);
      data = data.filter(gps => gps.timestamp >= startDate);
    }

    if (query.endDate) {
      const endDate = new Date(query.endDate);
      data = data.filter(gps => gps.timestamp <= endDate);
    }

    data.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
    
    return data.slice(0, query.limit);
  }

  async getLatestGpsData(vehicleId: string): Promise<GpsData | undefined> {
    const data = Array.from(this.gpsData.values())
      .filter(gps => gps.vehicleId === vehicleId)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
    
    return data[0];
  }

  async createGpsData(insertGpsData: InsertGpsData): Promise<GpsData> {
    const id = randomUUID();
    const gpsData: GpsData = {
      id,
      vehicleId: insertGpsData.vehicleId || null,
      deviceId: insertGpsData.deviceId,
      latitude: insertGpsData.latitude,
      longitude: insertGpsData.longitude,
      speed: insertGpsData.speed || null,
      direction: insertGpsData.direction || null,
      altitude: insertGpsData.altitude || null,
      satellites: insertGpsData.satellites || null,
      ignition: insertGpsData.ignition || null,
      mainBattery: insertGpsData.mainBattery || null,
      backupBattery: insertGpsData.backupBattery || null,
      odometer: insertGpsData.odometer || null,
      horimeter: insertGpsData.horimeter || null,
      timestamp: insertGpsData.timestamp,
      rawData: insertGpsData.rawData || null,
      createdAt: new Date(),
    };
    this.gpsData.set(id, gpsData);
    return gpsData;
  }

  async bulkCreateGpsData(gpsDataList: InsertGpsData[]): Promise<GpsData[]> {
    const results: GpsData[] = [];
    for (const insertGpsData of gpsDataList) {
      const result = await this.createGpsData(insertGpsData);
      results.push(result);
    }
    return results;
  }

  // Upload History operations
  async getUploadHistory(): Promise<UploadHistory[]> {
    return Array.from(this.uploadHistory.values()).sort((a, b) =>
      (b.uploadedAt?.getTime() || 0) - (a.uploadedAt?.getTime() || 0)
    );
  }

  async createUploadHistory(insertUploadHistory: InsertUploadHistory): Promise<UploadHistory> {
    const id = randomUUID();
    const uploadHistory: UploadHistory = {
      id,
      filename: insertUploadHistory.filename,
      recordsProcessed: insertUploadHistory.recordsProcessed,
      recordsSkipped: insertUploadHistory.recordsSkipped || null,
      fileSize: insertUploadHistory.fileSize || null,
      uploadedAt: new Date(),
    };
    this.uploadHistory.set(id, uploadHistory);
    return uploadHistory;
  }

  // User operations
  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(u => u.username === username);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = {
      id,
      username: insertUser.username,
      password: insertUser.password,
      name: insertUser.name,
      role: insertUser.role || "user",
      createdAt: new Date(),
    };
    this.users.set(id, user);
    return user;
  }

  // Statistics
  async getVehicleCount(): Promise<number> {
    return this.vehicles.size;
  }

  async getActiveVehicleCount(): Promise<number> {
    return Array.from(this.vehicles.values()).filter(v => v.status === 'active').length;
  }

  async getRoutesTrackedToday(): Promise<number> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const todayRoutes = Array.from(this.gpsData.values()).filter(gps =>
      gps.timestamp >= today && gps.timestamp < tomorrow
    );

    // Count unique vehicle routes for today
    const uniqueVehicles = new Set(todayRoutes.map(gps => gps.vehicleId));
    return uniqueVehicles.size;
  }
}

export const storage = new MemStorage();
