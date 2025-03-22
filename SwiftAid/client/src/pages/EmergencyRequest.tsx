import { useState } from 'react';
import { useLocation } from 'wouter';
import Header from '@/components/Header';
import LocationMap from '@/components/emergency/LocationMap';
import EmergencyTypeSelection from '@/components/emergency/EmergencyTypeSelection';
import PatientInfoForm from '@/components/emergency/PatientInfoForm';
import { EmergencyType, Patient } from '@/types';
import { useEmergency } from '@/contexts/EmergencyContext';
import { useToast } from '@/hooks/use-toast';

export default function EmergencyRequest() {
  const [_, setLocation] = useLocation();
  const { currentLocation, createEmergency } = useEmergency();
  const { toast } = useToast();
  
  const [selectedType, setSelectedType] = useState<EmergencyType | null>(null);
  const [patient, setPatient] = useState<Patient | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const handleGoBack = () => {
    setLocation('/');
  };
  
  const handleTypeSelect = (type: EmergencyType) => {
    setSelectedType(type);
  };
  
  const handlePatientChange = (patientData: Patient) => {
    setPatient(patientData);
  };
  
  const handleSubmit = async () => {
    // Validate form
    if (!selectedType) {
      toast({
        title: "Error",
        description: "Please select an emergency type",
        variant: "destructive",
      });
      return;
    }
    
    if (!currentLocation) {
      toast({
        title: "Error",
        description: "Unable to determine your location",
        variant: "destructive",
      });
      return;
    }
    
    if (!patient || !patient.firstName || !patient.lastName || !patient.phoneNumber) {
      toast({
        title: "Error",
        description: "Please fill out all patient information fields",
        variant: "destructive",
      });
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      // Submit emergency request
      await createEmergency({
        type: selectedType,
        location: currentLocation,
        patient: patient
      });
      
      // Navigate to status page
      setLocation('/emergency-status');
    } catch (error) {
      console.error('Error submitting emergency request:', error);
      toast({
        title: "Error",
        description: "Failed to submit emergency request. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <>
      <Header 
        title="Emergency Request" 
        color="primary"
        leftIcon={<span className="material-icons text-white">arrow_back</span>}
        onLeftIconClick={handleGoBack}
      />
      
      <main className="flex-1 p-4 overflow-auto">
        <LocationMap />
        
        <EmergencyTypeSelection 
          selectedType={selectedType}
          onTypeSelect={handleTypeSelect}
        />
        
        <PatientInfoForm 
          patient={patient}
          onPatientChange={handlePatientChange}
        />
        
        <button 
          className="w-full bg-primary text-white py-4 px-6 rounded-lg font-bold text-lg flex items-center justify-center shadow-lg mb-4 disabled:opacity-70"
          onClick={handleSubmit}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <span className="animate-spin mr-2">⟳</span>
              Processing...
            </>
          ) : (
            <>
              <span className="material-icons mr-2">send</span>
              Submit Emergency Request
            </>
          )}
        </button>
      </main>
    </>
  );
}
