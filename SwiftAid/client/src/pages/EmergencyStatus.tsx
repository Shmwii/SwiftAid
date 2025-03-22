import { useEffect } from 'react';
import { useLocation } from 'wouter';
import Header from '@/components/Header';
import StatusIndicator from '@/components/status/StatusIndicator';
import AmbulanceTracking from '@/components/status/AmbulanceTracking';
import EmergencyInfo from '@/components/status/EmergencyInfo';
import CommunicationPanel from '@/components/status/CommunicationPanel';
import { useEmergency } from '@/contexts/EmergencyContext';
import { useToast } from '@/hooks/use-toast';

export default function EmergencyStatus() {
  const [_, setLocation] = useLocation();
  const { emergency, cancelEmergency } = useEmergency();
  const { toast } = useToast();
  
  useEffect(() => {
    // If no emergency is active, redirect to home
    if (!emergency) {
      setLocation('/');
      
      toast({
        title: "No active emergency",
        description: "You don't have an active emergency request",
        variant: "destructive",
      });
    }
  }, [emergency, setLocation]);
  
  const handleShowOptions = () => {
    // This would show a dropdown or dialog with options
    if (confirm("Do you want to cancel this emergency request?")) {
      handleCancelEmergency();
    }
  };
  
  const handleCancelEmergency = async () => {
    try {
      await cancelEmergency();
      setLocation('/');
      
      toast({
        title: "Emergency cancelled",
        description: "Your emergency request has been cancelled",
        variant: "default",
      });
    } catch (error) {
      console.error('Error canceling emergency:', error);
      
      toast({
        title: "Error",
        description: "Failed to cancel emergency request",
        variant: "destructive",
      });
    }
  };
  
  if (!emergency) {
    return null; // Will redirect in useEffect
  }
  
  return (
    <>
      <Header 
        title="Emergency Status" 
        color="primary"
        rightIcon={<span className="material-icons text-white">more_vert</span>}
        onRightIconClick={handleShowOptions}
      />
      
      <main className="flex-1 p-4 overflow-auto">
        <StatusIndicator emergency={emergency} />
        <AmbulanceTracking emergency={emergency} />
        <EmergencyInfo emergency={emergency} />
        <CommunicationPanel emergency={emergency} />
      </main>
    </>
  );
}
