import Header from '@/components/Header';
import EmergencyActionCard from '@/components/home/EmergencyActionCard';
import QuickActions from '@/components/home/QuickActions';
import RecentActivity from '@/components/home/RecentActivity';
import { User } from "lucide-react";
import { useLocation } from "wouter";

export default function Home() {
  const [_, setLocation] = useLocation();

  const handleToggleProfile = () => {
    setLocation('/profile');
  };

  return (
    <>
      <Header 
        title="Swift Aid" 
        rightIcon={<User className="w-6 h-6" />}
        onRightIconClick={handleToggleProfile}
      />
      
      <main className="flex-1 p-4 pb-6 overflow-auto">
        <EmergencyActionCard />
        <QuickActions />
        <RecentActivity />
      </main>
    </>
  );
}
