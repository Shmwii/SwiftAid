import { Route, Switch } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import EmergencyRequest from "@/pages/EmergencyRequest";
import EmergencyStatus from "@/pages/EmergencyStatus";
import Map from "@/pages/Map";
import History from "@/pages/History";
import Profile from "@/pages/Profile";
import EmergencyContacts from "@/pages/EmergencyContacts";
import FirstAidGuide from "@/pages/FirstAidGuide";
import { EmergencyProvider } from "./contexts/EmergencyContext";
import { useEffect } from "react";
import BottomNavigation from "@/components/BottomNavigation";

// WebSocket setup
const setupWebSocket = () => {
  // Close any existing connections
  if (window.wsConnection) {
    window.wsConnection.close();
  }

  // Create a new connection
  const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
  const wsUrl = `${protocol}//${window.location.host}/ws`;
  const socket = new WebSocket(wsUrl);

  socket.onopen = () => {
    console.log("WebSocket connected");
    // Set up user auth
    const authMessage = JSON.stringify({
      type: "AUTH",
      userId: 1, // Use the default user for now
    });
    socket.send(authMessage);
  };

  socket.onclose = () => {
    console.log("WebSocket disconnected");
    // Try to reconnect after a short delay
    setTimeout(() => {
      setupWebSocket();
    }, 3000);
  };

  socket.onerror = (error) => {
    console.error("WebSocket error:", error);
  };

  // Store the connection globally for reuse
  window.wsConnection = socket;
  return socket;
};

// Add WebSocket to Window interface
declare global {
  interface Window {
    wsConnection: WebSocket;
    L: any; // For Leaflet maps
  }
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/emergency-request" component={EmergencyRequest} />
      <Route path="/emergency-status" component={EmergencyStatus} />
      <Route path="/map" component={Map} />
      <Route path="/history" component={History} />
      <Route path="/profile" component={Profile} />
      <Route path="/emergency-contacts" component={EmergencyContacts} />
      <Route path="/first-aid-guide" component={FirstAidGuide} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  // Setup WebSocket connection
  useEffect(() => {
    setupWebSocket();

    // Cleanup on unmount
    return () => {
      if (window.wsConnection) {
        window.wsConnection.close();
      }
    };
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <EmergencyProvider>
        <div className="flex flex-col min-h-screen max-w-md mx-auto bg-white relative shadow-lg">
          <main className="flex-1 pb-16">
            <Router />
          </main>
          <BottomNavigation />
          <Toaster />
        </div>
      </EmergencyProvider>
    </QueryClientProvider>
  );
}

export default App;
