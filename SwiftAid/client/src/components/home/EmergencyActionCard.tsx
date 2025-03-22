import { useLocation } from 'wouter';
import { Ambulance, Heart, AlertTriangle } from 'lucide-react';

export default function EmergencyActionCard() {
  const [_, setLocation] = useLocation();
  
  const handleEmergencyRequest = () => {
    setLocation('/emergency-request');
  };
  
  return (
    <div className="bg-gradient-to-r from-red-50 to-pink-50 rounded-xl shadow-md p-6 mb-6 border border-red-100">
      <div className="flex items-center mb-3">
        <Heart className="w-6 h-6 text-red-500 mr-2 stroke-[2.5px]" />
        <h2 className="text-xl font-bold text-gray-800">Emergency Assistance</h2>
      </div>
      <p className="mb-5 text-gray-600">Request immediate medical help with one tap</p>
      <button 
        className="w-full bg-gradient-to-r from-red-500 to-red-600 text-white py-4 px-6 rounded-lg font-bold text-lg flex items-center justify-center shadow-md hover:from-red-600 hover:to-red-700 transition-colors"
        onClick={handleEmergencyRequest}
      >
        <Ambulance className="w-6 h-6 mr-2" />
        Request Emergency Help
      </button>
      <div className="mt-4 text-xs text-gray-500 flex items-start">
        <AlertTriangle className="w-4 h-4 mr-1 flex-shrink-0" />
        <p>Only use in case of genuine medical emergencies. Help is typically dispatched within 3-5 minutes.</p>
      </div>
    </div>
  );
}
