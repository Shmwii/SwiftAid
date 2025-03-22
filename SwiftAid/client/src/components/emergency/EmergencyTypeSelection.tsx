import { useState } from 'react';
import { EmergencyType } from '@/types';

interface EmergencyTypeSelectionProps {
  selectedType: EmergencyType | null;
  onTypeSelect: (type: EmergencyType) => void;
}

export default function EmergencyTypeSelection({ selectedType, onTypeSelect }: EmergencyTypeSelectionProps) {
  const emergencyTypes: { type: EmergencyType; icon: string }[] = [
    { type: 'Cardiac', icon: 'favorite_border' },
    { type: 'Injury', icon: 'healing' },
    { type: 'Respiratory', icon: 'coronavirus' },
    { type: 'Other', icon: 'more_horiz' }
  ];

  return (
    <div className="bg-white rounded-lg shadow-md p-4 mb-5">
      <h2 className="text-lg font-bold mb-3">Emergency Type</h2>
      <div className="grid grid-cols-2 gap-3">
        {emergencyTypes.map(({ type, icon }) => (
          <button
            key={type}
            onClick={() => onTypeSelect(type)}
            className={`border rounded-lg p-3 flex flex-col items-center active:bg-red-100 ${
              selectedType === type 
                ? 'border-primary bg-red-50' 
                : 'border-gray-300'
            }`}
          >
            <span className={`material-icons mb-1 ${
              selectedType === type ? 'text-primary' : 'text-darkGray'
            }`}>
              {icon}
            </span>
            <span className="text-sm">{type}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
