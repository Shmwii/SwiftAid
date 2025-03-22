import { useLocation } from 'wouter';
import { Home, Map, Clock, User, Ambulance } from 'lucide-react';

export default function BottomNavigation() {
  const [location, setLocation] = useLocation();
  
  const isActive = (path: string) => location === path;
  
  const navItems = [
    { icon: Home, label: 'Home', path: '/' },
    { icon: Ambulance, label: 'Emergency', path: '/emergency-request' },
    { icon: Map, label: 'Map', path: '/map' },
    { icon: Clock, label: 'History', path: '/history' },
    { icon: User, label: 'Profile', path: '/profile' },
  ];
  
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-2 py-2 shadow-lg max-w-md mx-auto">
      <div className="flex justify-around">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.path}
              onClick={() => setLocation(item.path)}
              className={`flex flex-col items-center px-2 py-1 rounded-lg transition-colors ${
                isActive(item.path) 
                  ? 'text-primary-600 bg-primary-50' 
                  : 'text-gray-500 hover:text-primary-500 hover:bg-gray-50'
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive(item.path) ? 'stroke-[2.5px]' : 'stroke-2'}`} />
              <span className="text-xs mt-1 font-medium">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
