import { useState, useEffect } from 'react';
import { Patient } from '@/types';

interface PatientInfoFormProps {
  patient: Patient | null;
  onPatientChange: (patient: Patient) => void;
}

export default function PatientInfoForm({ patient, onPatientChange }: PatientInfoFormProps) {
  const [useMyInfo, setUseMyInfo] = useState(true);
  const [formData, setFormData] = useState<Patient>({
    firstName: '',
    lastName: '',
    phoneNumber: '',
    notes: ''
  });

  // Load saved user info
  useEffect(() => {
    if (useMyInfo) {
      // In a real app, this would come from a user profile
      // For now, let's provide some default values
      setFormData({
        firstName: 'John',
        lastName: 'Doe',
        phoneNumber: '(555) 123-4567',
        notes: ''
      });
      onPatientChange({
        firstName: 'John',
        lastName: 'Doe',
        phoneNumber: '(555) 123-4567',
        notes: ''
      });
    }
  }, [useMyInfo]);

  useEffect(() => {
    if (patient) {
      setFormData(patient);
    }
  }, [patient]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    const updatedData = { ...formData, [name]: value };
    setFormData(updatedData);
    onPatientChange(updatedData);
  };

  const handleUseMyInfoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUseMyInfo(e.target.checked);
    if (e.target.checked) {
      // Load saved user info
      const savedInfo = {
        firstName: 'John',
        lastName: 'Doe',
        phoneNumber: '(555) 123-4567',
        notes: formData.notes // Preserve notes
      };
      setFormData(savedInfo);
      onPatientChange(savedInfo);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-4 mb-5">
      <h2 className="text-lg font-bold mb-3">Patient Information</h2>
      
      <div className="flex items-center mb-4">
        <input 
          type="checkbox" 
          id="use-my-info" 
          checked={useMyInfo} 
          onChange={handleUseMyInfoChange}
          className="mr-2 h-5 w-5"
        />
        <label htmlFor="use-my-info" className="text-sm">Use my information</label>
      </div>
      
      <div className="space-y-3">
        <div className="flex space-x-2">
          <div className="flex-1">
            <label className="text-xs text-mediumGray mb-1 block">First Name</label>
            <input 
              type="text" 
              name="firstName"
              value={formData.firstName} 
              onChange={handleChange}
              disabled={useMyInfo}
              className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:border-secondary"
            />
          </div>
          <div className="flex-1">
            <label className="text-xs text-mediumGray mb-1 block">Last Name</label>
            <input 
              type="text" 
              name="lastName"
              value={formData.lastName} 
              onChange={handleChange}
              disabled={useMyInfo}
              className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:border-secondary"
            />
          </div>
        </div>
        
        <div>
          <label className="text-xs text-mediumGray mb-1 block">Phone Number</label>
          <input 
            type="tel" 
            name="phoneNumber"
            value={formData.phoneNumber} 
            onChange={handleChange}
            disabled={useMyInfo}
            className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:border-secondary"
          />
        </div>
        
        <div>
          <label className="text-xs text-mediumGray mb-1 block">Additional Notes (optional)</label>
          <textarea 
            name="notes"
            value={formData.notes} 
            onChange={handleChange}
            placeholder="Add any important details about the emergency"
            className="w-full p-2 border border-gray-300 rounded h-20 focus:outline-none focus:border-secondary"
          />
        </div>
      </div>
    </div>
  );
}
