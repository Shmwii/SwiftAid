import { useQuery } from '@tanstack/react-query';
import { EmergencyActivity } from '@/types';
import { HistoryIcon, ArrowRight, AlertCircle, CheckCircle, Clock, XCircle, Info } from 'lucide-react';
import { useLocation } from 'wouter';

export default function RecentActivity() {
  const [_, setLocation] = useLocation();
  const { data: activities, isLoading, error } = useQuery<EmergencyActivity[]>({
    queryKey: ['/api/activities'],
  });

  // Status icon mapping
  const getStatusIcon = (status: string) => {
    switch(status) {
      case 'Resolved':
      case 'Completed':
        return <CheckCircle className="w-5 h-5 text-emerald-500" />;
      case 'Cancelled':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'Pending':
        return <Clock className="w-5 h-5 text-amber-500" />;
      default:
        return <Info className="w-5 h-5 text-blue-500" />;
    }
  };

  // View all activities
  const handleViewAll = () => {
    setLocation('/history');
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-4 mb-4 border border-gray-100">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold text-gray-800">Recent Activity</h2>
        </div>
        <div className="space-y-4 animate-pulse">
          {[1, 2].map(i => (
            <div key={i} className="flex gap-3">
              <div className="w-10 h-10 rounded-full bg-gray-200"></div>
              <div className="flex-1">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
              <div className="w-16 h-6 bg-gray-200 rounded-full"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error || !activities || activities.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-4 mb-4 border border-gray-100">
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-lg font-bold text-gray-800">Recent Activity</h2>
        </div>
        <div className="text-center py-6">
          <HistoryIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 text-sm">No recent activity found</p>
        </div>
      </div>
    );
  }

  // Status to badge color mapping
  const statusColorMap: Record<string, string> = {
    Resolved: 'bg-emerald-50 text-emerald-600 border-emerald-200',
    Completed: 'bg-emerald-50 text-emerald-600 border-emerald-200',
    Cancelled: 'bg-red-50 text-red-600 border-red-200',
    Pending: 'bg-amber-50 text-amber-600 border-amber-200',
    Info: 'bg-blue-50 text-blue-600 border-blue-200',
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-4 mb-4 border border-gray-100">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-bold text-gray-800">Recent Activity</h2>
        <button 
          onClick={handleViewAll} 
          className="text-sm text-primary-600 flex items-center"
        >
          View all <ArrowRight className="w-4 h-4 ml-1" />
        </button>
      </div>
      <div className="space-y-4">
        {activities.map((activity) => (
          <div key={activity.id} className="flex items-start gap-3">
            {getStatusIcon(activity.status)}
            <div className="flex-1 min-w-0">
              <p className="font-medium text-gray-800 truncate">{activity.type}</p>
              <p className="text-xs text-gray-500">{activity.date}</p>
            </div>
            <span className={`text-xs ${statusColorMap[activity.status] || 'bg-gray-50 text-gray-600 border-gray-200'} 
              px-2.5 py-1 rounded-full border whitespace-nowrap`}>
              {activity.status}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
