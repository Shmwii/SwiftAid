import { useLocation } from 'wouter';
import { useToast } from '@/hooks/use-toast';
import { MapPin, Clock, Phone, BookOpen, ArrowRight } from 'lucide-react';

export default function QuickActions() {
  const [_, setLocation] = useLocation();
  const { toast } = useToast();
  
  const actions = [
    {
      icon: MapPin,
      label: 'Nearby Hospitals',
      color: 'text-cyan-500',
      bg: 'bg-cyan-50',
      border: 'border-cyan-200',
      action: () => setLocation('/map')
    },
    {
      icon: Clock,
      label: 'Medical History',
      color: 'text-violet-500',
      bg: 'bg-violet-50',
      border: 'border-violet-200',
      action: () => setLocation('/history')
    },
    {
      icon: Phone,
      label: 'Emergency Contacts',
      color: 'text-emerald-500',
      bg: 'bg-emerald-50',
      border: 'border-emerald-200',
      action: () => setLocation('/emergency-contacts')
    },
    {
      icon: BookOpen,
      label: 'First Aid Guide',
      color: 'text-amber-500',
      bg: 'bg-amber-50',
      border: 'border-amber-200',
      action: () => setLocation('/first-aid-guide')
    }
  ];
  
  return (
    <div className="mb-8">
      <div className="flex justify-between items-center mb-3">
        <h2 className="font-bold text-lg text-gray-800">Quick Actions</h2>
        <button className="text-sm text-primary-600 flex items-center">
          See all <ArrowRight className="w-4 h-4 ml-1" />
        </button>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        {actions.map((action, index) => {
          const Icon = action.icon;
          return (
            <div 
              key={index}
              onClick={action.action}
              className={`${action.bg} p-4 rounded-xl border ${action.border} flex flex-col cursor-pointer hover:shadow-md transition-all duration-200`}
            >
              <div className={`${action.color} mb-2`}>
                <Icon className="w-6 h-6 stroke-[2px]" />
              </div>
              <span className="text-sm font-medium text-gray-800">{action.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
