import { useQuery } from '@tanstack/react-query';
import Header from '@/components/Header';
import { EmergencyActivity } from '@/types';
import { 
  Clock, 
  MapPin, 
  AlertCircle, 
  CheckCircle, 
  XCircle, 
  Calendar, 
  AlertTriangle,
  Search,
  Filter,
  ChevronRight,
  HistoryIcon,
  Loader2
} from 'lucide-react';
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';

export default function History() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string | null>(null);
  
  const { data: activities, isLoading, error } = useQuery<EmergencyActivity[]>({
    queryKey: ['/api/activities'],
  });

  // Status badge styling and icons
  const getStatusDetails = (status: string) => {
    switch(status) {
      case 'Resolved':
      case 'Completed':
        return { 
          color: 'bg-emerald-50 text-emerald-700 border-emerald-200', 
          icon: <CheckCircle className="w-4 h-4 mr-1" />
        };
      case 'Cancelled':
        return { 
          color: 'bg-red-50 text-red-700 border-red-200',
          icon: <XCircle className="w-4 h-4 mr-1" /> 
        };
      case 'Pending':
        return { 
          color: 'bg-amber-50 text-amber-700 border-amber-200',
          icon: <Clock className="w-4 h-4 mr-1" /> 
        };
      default:
        return { 
          color: 'bg-blue-50 text-blue-700 border-blue-200',
          icon: <AlertCircle className="w-4 h-4 mr-1" />
        };
    }
  };

  // Group and filter activities
  const filteredActivities = activities?.filter(activity => {
    // Apply search term filter
    const matchesSearch = !searchTerm || 
      activity.type.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Apply status filter
    const matchesStatus = !filterStatus || activity.status === filterStatus;
    
    return matchesSearch && matchesStatus;
  });
  
  // Group by month
  const groupedActivities = filteredActivities?.reduce((groups: Record<string, EmergencyActivity[]>, activity) => {
    const date = new Date(activity.date);
    const month = `${date.toLocaleString('default', { month: 'long' })} ${date.getFullYear()}`;
    
    if (!groups[month]) {
      groups[month] = [];
    }
    
    groups[month].push(activity);
    return groups;
  }, {}) || {};

  // Handle status filter
  const handleStatusFilter = (status: string | null) => {
    setFilterStatus(status === filterStatus ? null : status);
  };

  return (
    <>
      <Header 
        title="Medical History" 
      />
      
      <main className="flex-1 overflow-auto bg-gray-50">
        {/* Search and filters */}
        <div className="p-4 bg-white border-b sticky top-0 z-10">
          <div className="relative mb-3">
            <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search medical history"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
          
          <div className="flex gap-2 overflow-x-auto pb-2 -mx-1 px-1">
            {['All', 'Completed', 'Pending', 'Cancelled'].map(status => (
              <button
                key={status}
                onClick={() => handleStatusFilter(status === 'All' ? null : status)}
                className={`flex items-center whitespace-nowrap px-3 py-1.5 rounded-full text-sm font-medium ${
                  (status === 'All' && !filterStatus) || filterStatus === status
                    ? 'bg-primary-100 text-primary-700'
                    : 'bg-gray-100 text-gray-600'
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>
        
        {/* Content */}
        <div className="p-4">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-10">
              <Loader2 className="w-10 h-10 text-primary-500 animate-spin mb-4" />
              <p className="text-gray-500">Loading activity history...</p>
            </div>
          ) : error ? (
            <div className="bg-red-50 p-6 rounded-xl border border-red-100 text-center my-6">
              <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-3" />
              <h3 className="text-red-700 font-bold mb-1">Unable to Load History</h3>
              <p className="text-red-600">There was an error loading your activity history. Please try again later.</p>
              <button className="mt-4 bg-white text-red-600 border border-red-200 rounded-lg px-4 py-2 font-medium hover:bg-red-50">
                Retry
              </button>
            </div>
          ) : filteredActivities?.length === 0 ? (
            <div className="bg-white p-8 rounded-xl shadow-sm text-center my-6 border border-gray-100">
              <HistoryIcon className="w-16 h-16 text-gray-300 mx-auto mb-3" />
              <h3 className="text-gray-700 font-bold mb-1">No Activities Found</h3>
              <p className="text-gray-500">
                {searchTerm || filterStatus 
                  ? "No activities match your current filters."
                  : "You don't have any activity history yet."}
              </p>
              {(searchTerm || filterStatus) && (
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setFilterStatus(null);
                  }}
                  className="mt-4 bg-primary-50 text-primary-600 border border-primary-200 rounded-lg px-4 py-2 font-medium hover:bg-primary-100"
                >
                  Clear Filters
                </button>
              )}
            </div>
          ) : (
            Object.entries(groupedActivities).map(([month, monthActivities]) => (
              <div key={month} className="mb-6">
                <div className="flex items-center mb-3">
                  <Calendar className="w-4 h-4 text-gray-500 mr-2" />
                  <h3 className="text-sm font-bold text-gray-500">{month}</h3>
                </div>
                
                <div className="space-y-3">
                  {monthActivities.map((activity) => {
                    const statusDetails = getStatusDetails(activity.status);
                    const activityDate = new Date(activity.date);
                    
                    return (
                      <div key={activity.id} className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <h4 className="font-medium text-gray-900">{activity.type}</h4>
                            <p className="text-xs text-gray-500 mt-1">
                              {activityDate.toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric',
                              })} at {activityDate.toLocaleTimeString('en-US', {
                                hour: '2-digit',
                                minute: '2-digit',
                                hour12: true
                              })}
                            </p>
                          </div>
                          <Badge className={`flex items-center ${statusDetails.color} border`}>
                            {statusDetails.icon}
                            {activity.status}
                          </Badge>
                        </div>
                        
                        {activity.type === 'Emergency Request' && (
                          <div className="text-sm text-gray-600 flex items-center">
                            <MapPin className="w-4 h-4 mr-1.5 text-gray-500" />
                            <span>123 Example Street, City</span>
                          </div>
                        )}
                        
                        <button className="w-full mt-3 text-primary-600 text-sm font-medium flex items-center justify-center py-2 border-t border-gray-100">
                          View Details <ChevronRight className="w-4 h-4 ml-1" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))
          )}
        </div>
      </main>
    </>
  );
}