import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import { z } from "zod";

// Helper function to calculate distance between two points using Haversine formula
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Radius of the earth in km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
    Math.sin(dLon/2) * Math.sin(dLon/2); 
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
  const distance = R * c; // Distance in km
  return Math.round(distance * 10) / 10; // Round to 1 decimal place
}

function deg2rad(deg: number): number {
  return deg * (Math.PI/180);
}

// WebSocket clients
type Client = {
  userId?: number;
  ws: WebSocket;
};

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);
  
  // Set up WebSocket server
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });
  const clients: Client[] = [];
  
  wss.on('connection', (ws) => {
    console.log('WebSocket client connected');
    
    // Add this client to our clients list
    const client: Client = { ws };
    clients.push(client);
    
    ws.on('message', async (message) => {
      console.log('Received message:', message.toString());
      
      try {
        const data = JSON.parse(message.toString());
        
        // Associate this websocket with a user if auth message is received
        if (data.type === 'AUTH' && data.userId) {
          client.userId = data.userId;
          console.log(`Client associated with user ${data.userId}`);
        }
        
        // Handle emergency updates
        if (data.type === 'NEW_EMERGENCY' && data.emergency) {
          broadcastToClientsExcept(clients, client, {
            type: 'EMERGENCY_ALERT',
            emergency: data.emergency
          });
        }
        
        if (data.type === 'STATUS_UPDATE' && data.emergency) {
          broadcastToAll(clients, {
            type: 'EMERGENCY_UPDATE',
            emergency: data.emergency
          });
        }
        
        if (data.type === 'CANCEL_EMERGENCY' && data.emergencyId) {
          broadcastToAll(clients, {
            type: 'EMERGENCY_CANCELLED',
            emergencyId: data.emergencyId
          });
        }
        
        // Handle ambulance location updates
        if (data.type === 'AMBULANCE_LOCATION' && data.ambulanceId && data.latitude && data.longitude) {
          const { ambulanceId, latitude, longitude, speed } = data;
          const ambulance = await storage.updateAmbulanceLocation(ambulanceId, latitude, longitude, speed);
          
          if (ambulance) {
            broadcastToAll(clients, {
              type: 'AMBULANCE_LOCATION_UPDATE',
              ambulance
            });
          }
        }
      } catch (error) {
        console.error('Error processing WebSocket message:', error);
      }
    });
    
    ws.on('close', () => {
      // Remove client when disconnected
      const index = clients.findIndex(c => c === client);
      if (index !== -1) {
        clients.splice(index, 1);
      }
      console.log('WebSocket client disconnected');
    });
  });
  
  // Helper to broadcast to all connected clients
  function broadcastToAll(clients: Client[], data: any) {
    const message = JSON.stringify(data);
    clients.forEach(client => {
      if (client.ws.readyState === WebSocket.OPEN) {
        client.ws.send(message);
      }
    });
  }
  
  // Helper to broadcast to all clients except the sender
  function broadcastToClientsExcept(clients: Client[], excludeClient: Client, data: any) {
    const message = JSON.stringify(data);
    clients.forEach(client => {
      if (client !== excludeClient && client.ws.readyState === WebSocket.OPEN) {
        client.ws.send(message);
      }
    });
  }
  
  // Helper to broadcast to a specific user
  function broadcastToUser(clients: Client[], userId: number, data: any) {
    const message = JSON.stringify(data);
    clients.forEach(client => {
      if (client.userId === userId && client.ws.readyState === WebSocket.OPEN) {
        client.ws.send(message);
      }
    });
  }
  
  // API Routes
  // For MVP, we'll use a simple approach without authentication
  
  // User API
  app.get('/api/user', async (req: Request, res: Response) => {
    // For MVP, return the default user
    const user = await storage.getUser(1);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Don't return the password
    const { password, ...safeUser } = user;
    res.json(safeUser);
  });
  
  // Activities API
  app.get('/api/activities', async (req: Request, res: Response) => {
    // For MVP, use the default user
    const userId = 1;
    const activities = await storage.listUserActivities(userId);
    
    // Format for frontend
    const formattedActivities = activities.map(activity => ({
      id: activity.id,
      type: activity.type,
      date: activity.date,
      status: activity.status
    }));
    
    res.json(formattedActivities);
  });
  
  // Emergencies API
  // Create a new emergency
  app.post('/api/emergencies', async (req: Request, res: Response) => {
    try {
      // Validate request body
      const schema = z.object({
        type: z.string(),
        location: z.object({
          latitude: z.number(),
          longitude: z.number(),
          address: z.string()
        }),
        patient: z.object({
          firstName: z.string(),
          lastName: z.string(),
          phoneNumber: z.string(),
          notes: z.string().optional()
        })
      });
      
      const validateResult = schema.safeParse(req.body);
      if (!validateResult.success) {
        return res.status(400).json({ message: 'Invalid request body', errors: validateResult.error.errors });
      }
      
      const { type, location, patient } = validateResult.data;
      
      // For MVP, use the default user
      const userId = 1;
      
      // Create location
      const locationRecord = await storage.createLocation({
        latitude: location.latitude.toString(),
        longitude: location.longitude.toString(),
        address: location.address
      });
      
      // Create emergency
      const emergency = await storage.createEmergency({
        type,
        userId,
        locationId: locationRecord.id,
        patientInfo: patient,
        locationInfo: locationRecord
      });
      
      // Find available ambulance
      const ambulance = await storage.getAvailableAmbulance();
      if (ambulance) {
        // Update ambulance status
        await storage.updateAmbulanceStatus(ambulance.id, 'Dispatched');
        
        // Assign ambulance to emergency
        await storage.assignAmbulanceToEmergency(emergency.id, ambulance.id);
        
        // Find nearest hospital
        const hospital = await storage.getNearestHospital(
          locationRecord.latitude,
          locationRecord.longitude
        );
        
        if (hospital) {
          await storage.assignHospitalToEmergency(emergency.id, hospital.id);
        }
        
        // Update emergency status
        await storage.updateEmergencyStatus(emergency.id, 'Dispatched');
      }
      
      // Get the complete emergency with all info
      const completeEmergency = await storage.getEmergency(emergency.id);
      
      // Create activity record
      await storage.createActivity({
        type: 'Emergency Request',
        status: 'Pending',
        userId,
        emergencyId: emergency.id
      });
      
      // Return the emergency with assigned resources
      res.status(201).json({
        id: completeEmergency?.id,
        type: completeEmergency?.type,
        status: completeEmergency?.status,
        createdAt: completeEmergency?.createdAt,
        patient: completeEmergency?.patientInfo,
        location: completeEmergency?.locationInfo,
        ambulance: completeEmergency?.ambulanceInfo,
        destinationHospital: completeEmergency?.hospitalInfo,
        eta: 8 // Hardcoded for MVP
      });
    } catch (error) {
      console.error('Error creating emergency:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });
  
  // Get emergency by ID
  app.get('/api/emergencies/:id', async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: 'Invalid emergency ID' });
      }
      
      const emergency = await storage.getEmergency(id);
      if (!emergency) {
        return res.status(404).json({ message: 'Emergency not found' });
      }
      
      res.json({
        id: emergency.id,
        type: emergency.type,
        status: emergency.status,
        createdAt: emergency.createdAt,
        patient: emergency.patientInfo,
        location: emergency.locationInfo,
        ambulance: emergency.ambulanceInfo,
        destinationHospital: emergency.hospitalInfo,
        eta: 8 // Hardcoded for MVP
      });
    } catch (error) {
      console.error('Error getting emergency:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });
  
  // Update emergency status
  app.patch('/api/emergencies/:id/status', async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: 'Invalid emergency ID' });
      }
      
      // Validate request body
      const schema = z.object({
        status: z.string()
      });
      
      const validateResult = schema.safeParse(req.body);
      if (!validateResult.success) {
        return res.status(400).json({ message: 'Invalid request body' });
      }
      
      const { status } = validateResult.data;
      
      const emergency = await storage.updateEmergencyStatus(id, status);
      if (!emergency) {
        return res.status(404).json({ message: 'Emergency not found' });
      }
      
      res.json({
        id: emergency.id,
        type: emergency.type,
        status: emergency.status,
        createdAt: emergency.createdAt,
        patient: emergency.patientInfo,
        location: emergency.locationInfo,
        ambulance: emergency.ambulanceInfo,
        destinationHospital: emergency.hospitalInfo,
        eta: 8 // Hardcoded for MVP
      });
    } catch (error) {
      console.error('Error updating emergency status:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });
  
  // Cancel emergency
  app.delete('/api/emergencies/:id', async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: 'Invalid emergency ID' });
      }
      
      const emergency = await storage.getEmergency(id);
      if (!emergency) {
        return res.status(404).json({ message: 'Emergency not found' });
      }
      
      // Update emergency status to cancelled
      await storage.updateEmergencyStatus(id, 'Cancelled');
      
      // If there's an ambulance assigned, set it back to available
      if (emergency.ambulanceId) {
        await storage.updateAmbulanceStatus(emergency.ambulanceId, 'Available');
      }
      
      // Create activity record
      await storage.createActivity({
        type: 'Emergency Cancelled',
        status: 'Cancelled',
        userId: emergency.userId,
        emergencyId: emergency.id
      });
      
      res.status(204).end();
    } catch (error) {
      console.error('Error cancelling emergency:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });
  
  // Get nearby hospitals
  app.get('/api/hospitals/nearby', async (req: Request, res: Response) => {
    try {
      const { latitude, longitude } = req.query;
      
      if (!latitude || !longitude) {
        return res.status(400).json({ message: 'Latitude and longitude are required' });
      }
      
      const hospitals = await storage.listHospitals();
      
      // Calculate distance for each hospital
      const hospitalsWithDistance = hospitals.map(hospital => {
        // Calculate distance using Haversine formula
        const distance = calculateDistance(
          parseFloat(latitude as string), 
          parseFloat(longitude as string),
          parseFloat(hospital.latitude),
          parseFloat(hospital.longitude)
        );
        
        return {
          ...hospital,
          distance: distance.toFixed(1) + ' km',
          distanceValue: distance // For sorting
        };
      });
      
      // Sort by distance
      const sortedHospitals = hospitalsWithDistance.sort((a, b) => 
        (a.distanceValue || 0) - (b.distanceValue || 0)
      );
      
      res.json(sortedHospitals);
    } catch (error) {
      console.error('Error fetching nearby hospitals:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  return httpServer;
}
