import { Emergency } from '@/types';

interface EmergencyInfoProps {
  emergency: Emergency;
}

export default function EmergencyInfo({ emergency }: EmergencyInfoProps) {
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-4 mb-5">
      <h2 className="text-lg font-bold mb-3">Emergency Details</h2>
      
      <div className="space-y-3">
        <div className="flex justify-between">
          <p className="text-sm text-mediumGray">Emergency Type</p>
          <p className="text-sm font-medium">{emergency.type}</p>
        </div>
        <div className="flex justify-between">
          <p className="text-sm text-mediumGray">Patient</p>
          <p className="text-sm font-medium">{`${emergency.patient.firstName} ${emergency.patient.lastName}`}</p>
        </div>
        {emergency.destinationHospital && (
          <div className="flex justify-between">
            <p className="text-sm text-mediumGray">Destination</p>
            <p className="text-sm font-medium">{emergency.destinationHospital.name}</p>
          </div>
        )}
        <div className="flex justify-between">
          <p className="text-sm text-mediumGray">Request Time</p>
          <p className="text-sm font-medium">{formatTime(emergency.createdAt)}</p>
        </div>
      </div>
    </div>
  );
}
