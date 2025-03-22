import { users, type User, type InsertUser } from "@shared/schema";
import { type Location, type InsertLocation } from "@shared/schema";
import { type Ambulance, type InsertAmbulance } from "@shared/schema";
import { type Hospital, type InsertHospital } from "@shared/schema";
import { type Emergency, type InsertEmergency } from "@shared/schema";
import { type Activity, type InsertActivity } from "@shared/schema";

// Storage interface with all required methods
export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Location methods
  getLocation(id: number): Promise<Location | undefined>;
  createLocation(location: InsertLocation): Promise<Location>;
  
  // Ambulance methods
  getAmbulance(id: number): Promise<Ambulance | undefined>;
  listAmbulances(): Promise<Ambulance[]>;
  getAvailableAmbulance(): Promise<Ambulance | undefined>;
  updateAmbulanceStatus(id: number, status: string): Promise<Ambulance | undefined>;
  updateAmbulanceLocation(id: number, latitude: string, longitude: string, speed?: number): Promise<Ambulance | undefined>;
  
  // Hospital methods
  getHospital(id: number): Promise<Hospital | undefined>;
  listHospitals(): Promise<Hospital[]>;
  getNearestHospital(latitude: string, longitude: string): Promise<Hospital | undefined>;
  
  // Emergency methods
  getEmergency(id: number): Promise<Emergency | undefined>;
  createEmergency(emergency: InsertEmergency): Promise<Emergency>;
  updateEmergencyStatus(id: number, status: string): Promise<Emergency | undefined>;
  assignAmbulanceToEmergency(emergencyId: number, ambulanceId: number): Promise<Emergency | undefined>;
  assignHospitalToEmergency(emergencyId: number, hospitalId: number): Promise<Emergency | undefined>;
  listUserEmergencies(userId: number): Promise<Emergency[]>;
  
  // Activity methods
  createActivity(activity: InsertActivity): Promise<Activity>;
  listUserActivities(userId: number): Promise<Activity[]>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private locations: Map<number, Location>;
  private ambulances: Map<number, Ambulance>;
  private hospitals: Map<number, Hospital>;
  private emergencies: Map<number, Emergency>;
  private activities: Map<number, Activity>;
  
  private userIdCounter: number;
  private locationIdCounter: number;
  private ambulanceIdCounter: number;
  private hospitalIdCounter: number;
  private emergencyIdCounter: number;
  private activityIdCounter: number;

  constructor() {
    this.users = new Map();
    this.locations = new Map();
    this.ambulances = new Map();
    this.hospitals = new Map();
    this.emergencies = new Map();
    this.activities = new Map();
    
    this.userIdCounter = 1;
    this.locationIdCounter = 1;
    this.ambulanceIdCounter = 1;
    this.hospitalIdCounter = 1;
    this.emergencyIdCounter = 1;
    this.activityIdCounter = 1;
    
    // Seed some test data
    this.seedData();
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userIdCounter++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }
  
  // Location methods
  async getLocation(id: number): Promise<Location | undefined> {
    return this.locations.get(id);
  }
  
  async createLocation(insertLocation: InsertLocation): Promise<Location> {
    const id = this.locationIdCounter++;
    const location: Location = { ...insertLocation, id };
    this.locations.set(id, location);
    return location;
  }
  
  // Ambulance methods
  async getAmbulance(id: number): Promise<Ambulance | undefined> {
    return this.ambulances.get(id);
  }
  
  async listAmbulances(): Promise<Ambulance[]> {
    return Array.from(this.ambulances.values());
  }
  
  async getAvailableAmbulance(): Promise<Ambulance | undefined> {
    return Array.from(this.ambulances.values()).find(
      (ambulance) => ambulance.status === 'Available'
    );
  }
  
  async updateAmbulanceStatus(id: number, status: string): Promise<Ambulance | undefined> {
    const ambulance = this.ambulances.get(id);
    if (!ambulance) return undefined;
    
    const updatedAmbulance: Ambulance = { ...ambulance, status };
    this.ambulances.set(id, updatedAmbulance);
    return updatedAmbulance;
  }
  
  async updateAmbulanceLocation(id: number, latitude: string, longitude: string, speed?: number): Promise<Ambulance | undefined> {
    const ambulance = this.ambulances.get(id);
    if (!ambulance) return undefined;
    
    const updatedAmbulance: Ambulance = { 
      ...ambulance, 
      latitude, 
      longitude,
      speed: speed || ambulance.speed
    };
    this.ambulances.set(id, updatedAmbulance);
    return updatedAmbulance;
  }
  
  // Hospital methods
  async getHospital(id: number): Promise<Hospital | undefined> {
    return this.hospitals.get(id);
  }
  
  async listHospitals(): Promise<Hospital[]> {
    return Array.from(this.hospitals.values());
  }
  
  async getNearestHospital(latitude: string, longitude: string): Promise<Hospital | undefined> {
    const hospitals = Array.from(this.hospitals.values());
    if (hospitals.length === 0) {
      return undefined;
    }
    
    // Calculate distance for each hospital and find the closest one
    let nearestHospital = hospitals[0];
    let smallestDistance = Number.MAX_VALUE;
    
    hospitals.forEach(hospital => {
      // Simple distance calculation (Euclidean)
      const latDiff = parseFloat(hospital.latitude) - parseFloat(latitude);
      const lonDiff = parseFloat(hospital.longitude) - parseFloat(longitude);
      const distance = Math.sqrt(latDiff * latDiff + lonDiff * lonDiff);
      
      if (distance < smallestDistance) {
        smallestDistance = distance;
        nearestHospital = hospital;
      }
    });
    
    return nearestHospital;
  }
  
  // Emergency methods
  async getEmergency(id: number): Promise<Emergency | undefined> {
    return this.emergencies.get(id);
  }
  
  async createEmergency(insertEmergency: InsertEmergency): Promise<Emergency> {
    const id = this.emergencyIdCounter++;
    const emergency: Emergency = { 
      ...insertEmergency, 
      id,
      status: 'Pending',
      createdAt: new Date().toISOString()
    };
    this.emergencies.set(id, emergency);
    return emergency;
  }
  
  async updateEmergencyStatus(id: number, status: string): Promise<Emergency | undefined> {
    const emergency = this.emergencies.get(id);
    if (!emergency) return undefined;
    
    const updatedEmergency: Emergency = { ...emergency, status };
    this.emergencies.set(id, updatedEmergency);
    return updatedEmergency;
  }
  
  async assignAmbulanceToEmergency(emergencyId: number, ambulanceId: number): Promise<Emergency | undefined> {
    const emergency = this.emergencies.get(emergencyId);
    const ambulance = this.ambulances.get(ambulanceId);
    if (!emergency || !ambulance) return undefined;
    
    const updatedEmergency: Emergency = { 
      ...emergency, 
      ambulanceId,
      ambulanceInfo: ambulance
    };
    this.emergencies.set(emergencyId, updatedEmergency);
    return updatedEmergency;
  }
  
  async assignHospitalToEmergency(emergencyId: number, hospitalId: number): Promise<Emergency | undefined> {
    const emergency = this.emergencies.get(emergencyId);
    const hospital = this.hospitals.get(hospitalId);
    if (!emergency || !hospital) return undefined;
    
    const updatedEmergency: Emergency = { 
      ...emergency, 
      hospitalId,
      hospitalInfo: hospital
    };
    this.emergencies.set(emergencyId, updatedEmergency);
    return updatedEmergency;
  }
  
  async listUserEmergencies(userId: number): Promise<Emergency[]> {
    return Array.from(this.emergencies.values()).filter(
      (emergency) => emergency.userId === userId
    );
  }
  
  // Activity methods
  async createActivity(insertActivity: InsertActivity): Promise<Activity> {
    const id = this.activityIdCounter++;
    const activity: Activity = { 
      ...insertActivity, 
      id,
      date: new Date().toISOString()
    };
    this.activities.set(id, activity);
    return activity;
  }
  
  async listUserActivities(userId: number): Promise<Activity[]> {
    return Array.from(this.activities.values())
      .filter(activity => activity.userId === userId)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }
  
  // Helper method to seed initial data
  private seedData() {
    // Create a default user
    const user: User = {
      id: this.userIdCounter++,
      username: 'john.doe',
      password: 'password123',
      firstName: 'John',
      lastName: 'Doe',
      phoneNumber: '(555) 123-4567'
    };
    this.users.set(user.id, user);
    
    // Create some sample hospitals
    const hospital1: Hospital = {
      id: this.hospitalIdCounter++,
      name: 'Memorial Hospital',
      latitude: '34.0522',
      longitude: '118.2437',
      address: '123 Hospital St, Los Angeles, CA'
    };
    this.hospitals.set(hospital1.id, hospital1);
    
    const hospital2: Hospital = {
      id: this.hospitalIdCounter++,
      name: 'Community Medical Center',
      latitude: '34.0548',
      longitude: '118.2456',
      address: '456 Medical Ave, Los Angeles, CA'
    };
    this.hospitals.set(hospital2.id, hospital2);
    
    // Create some sample ambulances
    const ambulance1: Ambulance = {
      id: this.ambulanceIdCounter++,
      name: 'Ambulance #247',
      status: 'Available',
      latitude: '34.0500',
      longitude: '118.2400',
      speed: 0
    };
    this.ambulances.set(ambulance1.id, ambulance1);
    
    const ambulance2: Ambulance = {
      id: this.ambulanceIdCounter++,
      name: 'Ambulance #156',
      status: 'Available',
      latitude: '34.0550',
      longitude: '118.2500',
      speed: 0
    };
    this.ambulances.set(ambulance2.id, ambulance2);
    
    // Create some sample activities
    const activity1: Activity = {
      id: this.activityIdCounter++,
      type: 'Emergency Request',
      date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(), // 5 days ago
      status: 'Resolved',
      userId: user.id,
      emergencyId: null
    };
    this.activities.set(activity1.id, activity1);
    
    const activity2: Activity = {
      id: this.activityIdCounter++,
      type: 'Medical Record Updated',
      date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10).toISOString(), // 10 days ago
      status: 'Info',
      userId: user.id,
      emergencyId: null
    };
    this.activities.set(activity2.id, activity2);
  }
}

export const storage = new MemStorage();
