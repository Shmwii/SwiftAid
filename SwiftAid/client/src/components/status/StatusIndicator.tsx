import { Emergency } from '@/types';

interface StatusIndicatorProps {
  emergency: Emergency;
}

export default function StatusIndicator({ emergency }: StatusIndicatorProps) {
  const getStatusMessage = () => {
    switch (emergency.status) {
      case 'Pending':
        return 'Processing Your Request';
      case 'Dispatched':
      case 'EnRoute':
        return 'Help Is On The Way';
      case 'Arrived':
        return 'Ambulance Has Arrived';
      case 'Completed':
        return 'Emergency Completed';
      case 'Cancelled':
        return 'Emergency Cancelled';
      default:
        return 'Processing Your Request';
    }
  };
  
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffMinutes < 1) {
      return 'Just now';
    } else if (diffMinutes === 1) {
      return '1 min ago';
    } else if (diffMinutes < 60) {
      return `${diffMinutes} mins ago`;
    } else {
      const hours = Math.floor(diffMinutes / 60);
      return `${hours} ${hours === 1 ? 'hour' : 'hours'} ago`;
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-5 text-center">
      <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4 status-pulse">
        <span className="material-icons text-primary text-4xl">emergency</span>
      </div>
      <h2 className="text-xl font-bold mb-1">{getStatusMessage()}</h2>
      <p className="text-mediumGray mb-4">
        {emergency.status === 'Dispatched' || emergency.status === 'EnRoute' 
          ? `Ambulance dispatched: ${formatTime(emergency.createdAt)}`
          : `Emergency requested: ${formatTime(emergency.createdAt)}`
        }
      </p>
      {emergency.eta !== undefined && (
        <div className="bg-lightGray rounded-lg p-3 inline-block">
          <p className="text-sm font-medium">
            Estimated arrival time: <span className="font-bold">{emergency.eta} minutes</span>
          </p>
        </div>
      )}
    </div>
  );
}
