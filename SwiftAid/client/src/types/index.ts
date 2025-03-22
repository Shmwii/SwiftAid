export interface Location {
  latitude: number;
  longitude: number;
  address: string;
}

export interface Patient {
  firstName: string;
  lastName: string;
  phoneNumber: string;
  notes?: string;
}

export type EmergencyType = 'Cardiac' | 'Injury' | 'Respiratory' | 'Other';

export interface Emergency {
  id: number;
  type: EmergencyType;
  location: Location;
  patient: Patient;
  status: 'Pending' | 'Dispatched' | 'EnRoute' | 'Arrived' | 'Completed' | 'Cancelled';
  createdAt: string;
  ambulance?: Ambulance;
  destinationHospital?: Hospital;
  eta?: number; // estimated time of arrival in minutes
}

export interface Ambulance {
  id: number;
  name: string;
  location: Location;
  status: 'Available' | 'Dispatched' | 'EnRoute' | 'OnScene';
  distance?: number; // distance in miles
  speed?: number; // speed in mph
}

export interface Hospital {
  id: number;
  name: string;
  location: Location;
}

export interface EmergencyActivity {
  id: number;
  type: string;
  date: string;
  status: string;
}
