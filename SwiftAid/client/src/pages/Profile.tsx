import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import Header from '@/components/Header';
import { useToast } from '@/hooks/use-toast';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Users, 
  Stethoscope, 
  AlertTriangle, 
  Droplet, 
  Edit2, 
  Save, 
  X, 
  ChevronRight,
  Shield,
  LucideIcon,
  Loader2
} from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';

interface UserData {
  id: number;
  username: string;
  firstName: string | null;
  lastName: string | null;
  phoneNumber: string | null;
}

type ProfileSectionProps = {
  title: string;
  icon: LucideIcon;
  children: React.ReactNode;
};

const ProfileSection = ({ title, icon: Icon, children }: ProfileSectionProps) => (
  <div className="bg-white rounded-xl shadow-sm p-4 mb-4 border border-gray-100">
    <div className="flex items-center gap-2 mb-4">
      <Icon className="w-5 h-5 text-primary-500" />
      <h3 className="font-semibold text-gray-900">{title}</h3>
    </div>
    <div className="space-y-4">
      {children}
    </div>
  </div>
);

type ProfileFieldProps = {
  label: string;
  value: string;
  editMode: boolean;
  name: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  inputType?: 'text' | 'textarea' | 'select';
  options?: { value: string; label: string }[];
};

const ProfileField = ({ 
  label, 
  value, 
  editMode, 
  name, 
  onChange, 
  inputType = 'text',
  options = []
}: ProfileFieldProps) => (
  <div>
    <label className="text-xs font-medium text-gray-500 mb-1 block">{label}</label>
    {!editMode ? (
      <p className="p-3 bg-gray-50 rounded-lg text-gray-700">{value || 'Not provided'}</p>
    ) : inputType === 'textarea' ? (
      <textarea
        name={name}
        value={value}
        onChange={onChange}
        className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
        rows={3}
      />
    ) : inputType === 'select' ? (
      <select
        name={name}
        value={value}
        onChange={onChange as any}
        className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
      >
        {options.map(option => (
          <option key={option.value} value={option.value}>{option.label}</option>
        ))}
      </select>
    ) : (
      <input
        type="text"
        name={name}
        value={value}
        onChange={onChange}
        className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
      />
    )}
  </div>
);

export default function Profile() {
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [shareLocation, setShareLocation] = useState(true);
  const [medicalIDEnabled, setMedicalIDEnabled] = useState(true);
  
  const { data: user, isLoading } = useQuery<UserData>({
    queryKey: ['/api/user'],
  });
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phoneNumber: '',
    email: '',
    address: '',
    emergencyContact: '',
    medicalConditions: '',
    allergies: '',
    bloodType: '',
    medications: '',
    height: '',
    weight: '',
  });
  
  // Update form data when user data is loaded
  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        phoneNumber: user.phoneNumber || '',
        email: 'john.doe@example.com', // For demonstration
        address: '123 Main St, Anytown USA', // For demonstration
        emergencyContact: 'Jane Doe (555) 987-6543', // For demonstration
        medicalConditions: 'None', // For demonstration
        allergies: 'Penicillin', // For demonstration
        bloodType: 'O+', // For demonstration
        medications: 'Aspirin 81mg daily', // For demonstration
        height: '5\'10"', // For demonstration
        weight: '170 lbs', // For demonstration
      });
    }
  }, [user]);
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };
  
  const handleEdit = () => {
    setIsEditing(true);
  };
  
  const handleSave = () => {
    // In a real app, this would update the user profile via API
    setIsEditing(false);
    toast({
      title: "Profile Updated",
      description: "Your profile has been updated successfully",
    });
  };
  
  const handleCancel = () => {
    setIsEditing(false);
    
    // Reset form data to original values
    if (user) {
      setFormData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        phoneNumber: user.phoneNumber || '',
        email: 'john.doe@example.com',
        address: '123 Main St, Anytown USA',
        emergencyContact: 'Jane Doe (555) 987-6543',
        medicalConditions: 'None',
        allergies: 'Penicillin',
        bloodType: 'O+',
        medications: 'Aspirin 81mg daily',
        height: '5\'10"',
        weight: '170 lbs',
      });
    }
  };

  if (isLoading) {
    return (
      <>
        <Header title="My Profile" />
        <main className="flex-1 overflow-auto bg-gray-50 p-4">
          <div className="flex flex-col items-center justify-center py-12">
            <div className="animate-pulse">
              <div className="rounded-full bg-gray-200 h-24 w-24 mb-4"></div>
              <div className="h-6 bg-gray-200 rounded-lg w-40 mx-auto mb-2"></div>
              <div className="h-4 bg-gray-200 rounded-lg w-24 mx-auto"></div>
            </div>
            <Loader2 className="w-8 h-8 text-primary-500 animate-spin mt-8" />
            <p className="text-gray-500 mt-2">Loading profile...</p>
          </div>
        </main>
      </>
    );
  }

  const bloodTypeOptions = [
    { value: 'A+', label: 'A+' },
    { value: 'A-', label: 'A-' },
    { value: 'B+', label: 'B+' },
    { value: 'B-', label: 'B-' },
    { value: 'AB+', label: 'AB+' },
    { value: 'AB-', label: 'AB-' },
    { value: 'O+', label: 'O+' },
    { value: 'O-', label: 'O-' },
    { value: 'unknown', label: 'Unknown' },
  ];

  return (
    <>
      <Header 
        title="My Profile" 
        rightIcon={isEditing ? null : <Edit2 className="w-5 h-5 text-primary-600" />}
        onRightIconClick={isEditing ? undefined : handleEdit}
      />
      
      <main className="flex-1 overflow-auto bg-gray-50">
        <div className="bg-primary-600 text-white pt-4 pb-8 px-4">
          <div className="flex flex-col items-center">
            <div className="h-24 w-24 bg-white rounded-full flex items-center justify-center mb-3 border-2 border-white shadow-lg">
              <User className="w-12 h-12 text-primary-500" />
            </div>
            <h2 className="text-xl font-bold">{formData.firstName} {formData.lastName}</h2>
            <p className="text-primary-100 flex items-center mt-1">
              <Phone className="w-4 h-4 mr-1" /> 
              {formData.phoneNumber || 'No phone number'}
            </p>
          </div>
        </div>
        
        <div className="p-4 -mt-4">
          <div className="bg-white rounded-xl shadow-lg p-4 mb-4 border border-gray-100">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-primary-500" />
                <h3 className="font-semibold text-gray-900">Emergency Medical ID</h3>
              </div>
              <Switch 
                checked={medicalIDEnabled} 
                onCheckedChange={setMedicalIDEnabled} 
              />
            </div>
            <p className="text-sm text-gray-500 mb-3">
              Your emergency medical ID can be accessed from your lock screen in case of emergency
            </p>
            <button 
              className="w-full flex items-center justify-between p-3 bg-gray-50 rounded-lg text-primary-600 font-medium"
              onClick={() => {}}
            >
              <span>View Emergency Medical ID</span>
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm p-4 mb-4 border border-gray-100">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-primary-500" />
                <h3 className="font-semibold text-gray-900">Location Sharing</h3>
              </div>
              <Switch 
                checked={shareLocation} 
                onCheckedChange={setShareLocation} 
              />
            </div>
            <p className="text-sm text-gray-500">
              Allow Swift Aid to access your location for emergency services
            </p>
          </div>
          
          <ProfileSection title="Personal Information" icon={User}>
            <ProfileField 
              label="First Name"
              value={formData.firstName}
              editMode={isEditing}
              name="firstName"
              onChange={handleInputChange}
            />
            <ProfileField 
              label="Last Name"
              value={formData.lastName}
              editMode={isEditing}
              name="lastName"
              onChange={handleInputChange}
            />
            <ProfileField 
              label="Phone Number"
              value={formData.phoneNumber}
              editMode={isEditing}
              name="phoneNumber"
              onChange={handleInputChange}
            />
            <ProfileField 
              label="Email"
              value={formData.email}
              editMode={isEditing}
              name="email"
              onChange={handleInputChange}
            />
            <ProfileField 
              label="Home Address"
              value={formData.address}
              editMode={isEditing}
              name="address"
              onChange={handleInputChange}
            />
          </ProfileSection>
          
          <ProfileSection title="Emergency Contacts" icon={Users}>
            <ProfileField 
              label="Primary Emergency Contact"
              value={formData.emergencyContact}
              editMode={isEditing}
              name="emergencyContact"
              onChange={handleInputChange}
            />
            <button className="flex items-center justify-center w-full p-3 mt-2 border border-dashed border-gray-300 rounded-lg text-primary-600">
              + Add another emergency contact
            </button>
          </ProfileSection>
          
          <ProfileSection title="Medical Information" icon={Stethoscope}>
            <ProfileField 
              label="Medical Conditions"
              value={formData.medicalConditions}
              editMode={isEditing}
              name="medicalConditions"
              onChange={handleInputChange}
              inputType="textarea"
            />
            <ProfileField 
              label="Current Medications"
              value={formData.medications}
              editMode={isEditing}
              name="medications"
              onChange={handleInputChange}
              inputType="textarea"
            />
            <div className="grid grid-cols-2 gap-4">
              <ProfileField 
                label="Height"
                value={formData.height}
                editMode={isEditing}
                name="height"
                onChange={handleInputChange}
              />
              <ProfileField 
                label="Weight"
                value={formData.weight}
                editMode={isEditing}
                name="weight"
                onChange={handleInputChange}
              />
            </div>
          </ProfileSection>
          
          <ProfileSection title="Allergies & Blood Type" icon={AlertTriangle}>
            <ProfileField 
              label="Allergies"
              value={formData.allergies}
              editMode={isEditing}
              name="allergies"
              onChange={handleInputChange}
              inputType="textarea"
            />
            <ProfileField 
              label="Blood Type"
              value={formData.bloodType}
              editMode={isEditing}
              name="bloodType"
              onChange={handleInputChange}
              inputType="select"
              options={bloodTypeOptions}
            />
          </ProfileSection>
        </div>
        
        {isEditing && (
          <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t shadow-lg">
            <div className="flex gap-3">
              <button
                onClick={handleCancel}
                className="flex-1 py-3 flex items-center justify-center gap-2 border border-gray-300 text-gray-700 rounded-lg font-medium"
              >
                <X className="w-4 h-4" /> Cancel
              </button>
              <button
                onClick={handleSave}
                className="flex-1 py-3 flex items-center justify-center gap-2 bg-primary-600 text-white rounded-lg font-medium"
              >
                <Save className="w-4 h-4" /> Save Changes
              </button>
            </div>
          </div>
        )}
      </main>
    </>
  );
}