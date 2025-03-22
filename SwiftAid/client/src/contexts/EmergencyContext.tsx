import { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { Emergency, EmergencyType, Location, Patient } from "@/types";
import { useWebSocket, WebSocketMessage } from "@/hooks/useWebSocket";

interface EmergencyContextType {
  emergency: Emergency | null;
  createEmergency: (emergency: Omit<Emergency, "id" | "status" | "createdAt">) => Promise<Emergency>;
  updateEmergencyStatus: (status: string) => Promise<Emergency | undefined>;
  cancelEmergency: () => Promise<void>;
  currentLocation: Location | null;
  setCurrentLocation: (location: Location) => void;
  isConnected: boolean;
}

const EmergencyContext = createContext<EmergencyContextType | undefined>(undefined);

export function EmergencyProvider({ children }: { children: ReactNode }) {
  const [emergency, setEmergency] = useState<Emergency | null>(null);
  const [currentLocation, setCurrentLocation] = useState<Location | null>(null);
  
  // Setup WebSocket with message handler
  const { sendMessage, lastMessage, isConnected } = useWebSocket({
    onMessage: (data) => {
      if (data.type === "EMERGENCY_UPDATE" && emergency && data.emergency.id === emergency.id) {
        setEmergency(data.emergency);
      } else if (data.type === "AMBULANCE_LOCATION_UPDATE" && emergency && emergency.ambulance) {
        // Update ambulance location
        if (emergency.ambulance.id === data.ambulance.id) {
          setEmergency({
            ...emergency,
            ambulance: {
              ...emergency.ambulance,
              location: {
                latitude: parseFloat(data.ambulance.latitude),
                longitude: parseFloat(data.ambulance.longitude),
                address: emergency.ambulance.location.address
              },
              speed: data.ambulance.speed
            }
          });
        }
      }
    }
  });

  // Create a new emergency
  const createEmergency = async (emergencyData: Omit<Emergency, "id" | "status" | "createdAt">): Promise<Emergency> => {
    try {
      const response = await fetch("/api/emergencies", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(emergencyData),
      });

      if (!response.ok) {
        throw new Error("Failed to create emergency");
      }

      const newEmergency = await response.json();
      setEmergency(newEmergency);

      // Notify via WebSocket
      sendMessage({
        type: "NEW_EMERGENCY",
        emergency: newEmergency
      });

      return newEmergency;
    } catch (error) {
      console.error("Error creating emergency:", error);
      throw error;
    }
  };

  // Update emergency status
  const updateEmergencyStatus = async (status: string): Promise<Emergency | undefined> => {
    if (!emergency) return;

    try {
      const response = await fetch(`/api/emergencies/${emergency.id}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status }),
      });

      if (!response.ok) {
        throw new Error("Failed to update emergency status");
      }

      const updatedEmergency = await response.json();
      setEmergency(updatedEmergency);

      // Notify via WebSocket
      sendMessage({
        type: "STATUS_UPDATE",
        emergency: updatedEmergency
      });

      return updatedEmergency;
    } catch (error) {
      console.error("Error updating emergency status:", error);
      throw error;
    }
  };

  // Cancel an emergency
  const cancelEmergency = async (): Promise<void> => {
    if (!emergency) return;

    try {
      const response = await fetch(`/api/emergencies/${emergency.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to cancel emergency");
      }

      // Notify via WebSocket
      sendMessage({
        type: "CANCEL_EMERGENCY",
        emergencyId: emergency.id
      });

      setEmergency(null);
    } catch (error) {
      console.error("Error canceling emergency:", error);
      throw error;
    }
  };

  return (
    <EmergencyContext.Provider
      value={{
        emergency,
        createEmergency,
        updateEmergencyStatus,
        cancelEmergency,
        currentLocation,
        setCurrentLocation,
        isConnected,
      }}
    >
      {children}
    </EmergencyContext.Provider>
  );
}

export function useEmergency() {
  const context = useContext(EmergencyContext);
  if (context === undefined) {
    throw new Error("useEmergency must be used within an EmergencyProvider");
  }
  return context;
}
