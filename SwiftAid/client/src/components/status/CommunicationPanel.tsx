import { Emergency } from '@/types';

interface CommunicationPanelProps {
  emergency: Emergency;
}

export default function CommunicationPanel({ emergency }: CommunicationPanelProps) {
  const handleCallAmbulance = () => {
    // In a real app, this would use a real API to call the ambulance
    console.log('Calling ambulance');
  };

  const handleMessageAmbulance = () => {
    // In a real app, this would open a messaging interface
    console.log('Opening message interface');
  };

  const handleCall911 = () => {
    // In a real app, this would trigger a phone call
    window.location.href = 'tel:911';
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-4 mb-4">
      <h2 className="text-lg font-bold mb-3">Communication</h2>
      
      <div className="grid grid-cols-2 gap-3 mb-4">
        <button 
          className="border border-secondary bg-blue-50 rounded-lg p-3 flex flex-col items-center"
          onClick={handleCallAmbulance}
        >
          <span className="material-icons text-secondary mb-1">call</span>
          <span className="text-sm">Call Ambulance</span>
        </button>
        <button 
          className="border border-secondary bg-blue-50 rounded-lg p-3 flex flex-col items-center"
          onClick={handleMessageAmbulance}
        >
          <span className="material-icons text-secondary mb-1">chat</span>
          <span className="text-sm">Message</span>
        </button>
      </div>
      
      <div className="p-3 bg-red-50 rounded-lg border border-primary text-center">
        <span className="material-icons text-primary mb-1">priority_high</span>
        <p className="text-sm">For life-threatening situations, call national emergency services directly</p>
        <button 
          className="mt-2 bg-primary text-white py-2 px-4 rounded-lg font-bold text-sm"
          onClick={handleCall911}
        >
          Call 911
        </button>
      </div>
    </div>
  );
}
