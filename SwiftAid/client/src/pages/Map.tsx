import Header from '@/components/Header';
import { useEffect, useRef, useState } from 'react';
import { ArrowLeft, ChevronRight, Building2, Shield, Pill, MapPin, Loader2 } from 'lucide-react';
import { useLocation } from 'wouter';

// We're assuming Leaflet is loaded from CDN in index.html
declare global {
  interface Window {
    L: any;
  }
}

interface Facility {
  id: number;
  name: string;
  distance: string;
  type: 'hospital' | 'ambulance' | 'pharmacy';
  latitude: number;
  longitude: number;
  address?: string;
  phone?: string;
  availability?: string;
}

export default function Map() {
  const [_, navigate] = useLocation();
  const mapRef = useRef<HTMLDivElement>(null);
  const leafletMapRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState<'all' | 'hospital' | 'ambulance' | 'pharmacy'>('all');
  const [userLocation, setUserLocation] = useState<{lat: number, lng: number} | null>(null);
  const [nearbyFacilities, setNearbyFacilities] = useState<Facility[]>([]);
  const [selectedFacility, setSelectedFacility] = useState<Facility | null>(null);

  // Check if Leaflet is loaded
  const [leafletLoaded, setLeafletLoaded] = useState(false);
  
  useEffect(() => {
    // Check if L is available on window
    if (typeof window.L !== 'undefined') {
      setLeafletLoaded(true);
    } else {
      // Poll for Leaflet until it's available
      const checkLeaflet = setInterval(() => {
        if (typeof window.L !== 'undefined') {
          setLeafletLoaded(true);
          clearInterval(checkLeaflet);
        }
      }, 100);
      
      // Don't poll forever
      setTimeout(() => {
        clearInterval(checkLeaflet);
        if (!leafletLoaded) {
          setError('Failed to load map library. Please refresh the page.');
          setIsLoading(false);
        }
      }, 5000);
      
      return () => clearInterval(checkLeaflet);
    }
  }, []);

  useEffect(() => {
    if (!mapRef.current || !leafletLoaded) return;

    try {
      // Initialize map with a nice tile style
      const map = window.L.map(mapRef.current, {
        zoomControl: false, // We'll add our own controls in custom positions
        attributionControl: false // Hide attribution initially
      }).setView([51.505, -0.09], 13);
      
      leafletMapRef.current = map;

      // Add a more modern tile layer
      window.L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
        subdomains: 'abcd',
        maxZoom: 19
      }).addTo(map);

      // Add zoom control to top right
      window.L.control.zoom({
        position: 'topright'
      }).addTo(map);

      // Get current location
      if (navigator.geolocation) {
        setIsLoading(true);
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            const { latitude, longitude } = position.coords;
            setUserLocation({ lat: latitude, lng: longitude });
            
            // Move map to current location
            map.setView([latitude, longitude], 15);
            
            // Add marker to current location
            const userIcon = window.L.divIcon({
              html: `<div class="user-location-marker"></div>`,
              className: 'user-location',
              iconSize: [24, 24],
              iconAnchor: [12, 12]
            });
            
            const userMarker = window.L.marker([latitude, longitude], {
              icon: userIcon
            }).addTo(map);
            userMarker.bindPopup("You are here").openPopup();
            markersRef.current.push(userMarker);
            
            // Add CSS for user marker
            const style = document.createElement('style');
            style.textContent = `
              .user-location-marker {
                width: 24px;
                height: 24px;
                background-color: #4164fb;
                border-radius: 50%;
                border: 3px solid white;
                box-shadow: 0 0 0 1px rgba(0,0,0,0.2), 0 2px 4px rgba(0,0,0,0.2);
              }
              .user-location {
                background: none !important;
              }
            `;
            document.head.appendChild(style);
            
            // Add nearby facilities - using await since it's now async
            await addNearbyFacilities(map, latitude, longitude);
            
            setIsLoading(false);
          },
          (err) => {
            console.error('Error getting location:', err);
            setError('Could not access your location. Please enable location services.');
            setIsLoading(false);
          }
        );
      } else {
        setError('Geolocation is not supported by your browser');
        setIsLoading(false);
      }

      // Cleanup
      return () => {
        if (leafletMapRef.current) {
          leafletMapRef.current.remove();
        }
      };
    } catch (err) {
      console.error('Error initializing map:', err);
      setError('Failed to initialize map. Please refresh the page.');
      setIsLoading(false);
    }
  }, [leafletLoaded]);

  // Filter facilities based on selected type
  const filteredFacilities = selectedType === 'all' 
    ? nearbyFacilities 
    : nearbyFacilities.filter(f => f.type === selectedType);

  const addNearbyFacilities = async (map: any, lat: number, lng: number) => {
    try {
      // Clear any existing markers first
      markersRef.current.forEach(marker => {
        if (marker) marker.remove();
      });
      markersRef.current = [];
      
      // Keep track of all facilities we're adding
      const facilities: Facility[] = [];
      
      // Fetch nearby hospitals from our API
      const hospitalResponse = await fetch(`/api/hospitals/nearby?latitude=${lat}&longitude=${lng}`);
      if (!hospitalResponse.ok) {
        throw new Error(`Error fetching hospitals: ${hospitalResponse.statusText}`);
      }
      
      const hospitals = await hospitalResponse.json();
      
      // Convert API hospital data to our facility format
      const hospitalFacilities = hospitals.map((hospital: any) => ({
        id: hospital.id,
        name: hospital.name,
        latitude: parseFloat(hospital.latitude),
        longitude: parseFloat(hospital.longitude),
        distance: hospital.distance || '0 km',
        type: 'hospital' as const,
        address: hospital.address,
        phone: '(555) 123-4567', // Default phone for now
        availability: 'Open now • 24/7' // Default availability for now
      }));
      
      facilities.push(...hospitalFacilities);
      
      // Add mock ambulance and pharmacy data for now
      // In a real app, we would fetch this from separate APIs
      const mockAmbulances = [
        { 
          id: 101,
          name: 'Ambulance Station 12', 
          latitude: lat + 0.002, 
          longitude: lng - 0.006, 
          distance: '0.5 miles',
          type: 'ambulance' as const,
          address: '789 Emergency Blvd, East Side',
          phone: '(555) 911-0123',
          availability: 'Available units: 2'
        }
      ];
      
      const mockPharmacies = [
        { 
          id: 201,
          name: 'Downtown Pharmacy', 
          latitude: lat - 0.004, 
          longitude: lng + 0.002, 
          distance: '0.4 miles',
          type: 'pharmacy' as const,
          address: '321 Pine St, Downtown',
          phone: '(555) 456-7890',
          availability: 'Open until 9 PM'
        },
        { 
          id: 202,
          name: 'MediAid Pharmacy', 
          latitude: lat + 0.006, 
          longitude: lng - 0.002, 
          distance: '0.9 miles',
          type: 'pharmacy' as const,
          address: '654 Maple Dr, South District',
          phone: '(555) 234-5678',
          availability: 'Open until 11 PM'
        }
      ];
      
      facilities.push(...mockAmbulances, ...mockPharmacies);
      
      // Add CSS for facility markers (only once)
      const style = document.createElement('style');
      style.textContent = `
        .facility-marker {
          width: 16px;
          height: 16px;
          border-radius: 50%;
          border: 2px solid white;
          box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        }
        .facility-icon {
          background: none !important;
        }
      `;
      document.head.appendChild(style);
      
      // Add all facilities to the map
      facilities.forEach(facility => {
        // Create custom marker icon based on facility type
        let markerColor;
        
        switch(facility.type) {
          case 'hospital':
            markerColor = '#3b82f6'; // blue
            break;
          case 'ambulance':
            markerColor = '#ef4444'; // red
            break;
          case 'pharmacy':
            markerColor = '#10b981'; // green
            break;
          default:
            markerColor = '#6b7280'; // gray
        }
        
        const markerIcon = window.L.divIcon({
          html: `<div class="facility-marker" style="background-color: ${markerColor};"></div>`,
          className: 'facility-icon',
          iconSize: [36, 36],
          iconAnchor: [18, 18]
        });
        
        const facilityMarker = window.L.marker([facility.latitude, facility.longitude], {
          icon: markerIcon
        }).addTo(map);
        
        facilityMarker.bindPopup(`
          <div class="p-2">
            <h3 class="font-bold">${facility.name}</h3>
            <p class="text-sm">${facility.address}</p>
            <p class="text-sm">${facility.distance}</p>
          </div>
        `);
        
        // Track all markers for easy cleanup
        markersRef.current.push(facilityMarker);
        
        // Add click handler
        facilityMarker.on('click', () => {
          setSelectedFacility(facility);
        });
      });
      
      // Update state with all facilities
      setNearbyFacilities(facilities);
      
    } catch (error) {
      console.error('Error fetching nearby facilities:', error);
      setError('Failed to load nearby facilities. Please try again later.');
      setIsLoading(false);
    }
  };

  // Toggle facility type filter
  const handleTypeFilter = (type: 'all' | 'hospital' | 'ambulance' | 'pharmacy') => {
    setSelectedType(type);
  };
  
  // Handle facility selection
  const handleSelectFacility = (facility: Facility) => {
    setSelectedFacility(facility);
    
    // Pan map to selected facility
    if (leafletMapRef.current && facility) {
      leafletMapRef.current.setView([facility.latitude, facility.longitude], 16);
      
      // Find and open the popup for this facility
      markersRef.current.forEach(marker => {
        const markerLatLng = marker.getLatLng();
        if (markerLatLng.lat === facility.latitude && markerLatLng.lng === facility.longitude) {
          marker.openPopup();
        }
      });
    }
  };
  
  // Back from facility details
  const handleBackFromDetails = () => {
    setSelectedFacility(null);
    
    // Return map to user location
    if (leafletMapRef.current && userLocation) {
      leafletMapRef.current.setView([userLocation.lat, userLocation.lng], 15);
    }
  };

  return (
    <>
      <Header 
        title={selectedFacility ? selectedFacility.name : "Emergency Facilities"} 
        leftIcon={selectedFacility ? <ArrowLeft className="w-6 h-6" /> : undefined}
        onLeftIconClick={selectedFacility ? handleBackFromDetails : undefined}
      />
      
      <main className="flex-1 overflow-hidden flex flex-col">
        <div className="relative h-[40vh] md:h-[50vh]">
          {isLoading && (
            <div className="absolute inset-0 z-20 flex items-center justify-center bg-white bg-opacity-80">
              <div className="flex flex-col items-center">
                <Loader2 className="w-10 h-10 text-primary-500 animate-spin mb-2" />
                <p className="text-gray-600">Loading map...</p>
              </div>
            </div>
          )}
          
          {error && (
            <div className="absolute inset-0 z-20 flex items-center justify-center bg-white bg-opacity-90">
              <div className="bg-white p-4 rounded-lg shadow-md text-center max-w-xs">
                <MapPin className="w-12 h-12 text-red-500 mx-auto mb-2" />
                <p className="text-red-600 font-medium mb-1">Location Error</p>
                <p className="text-gray-600 text-sm">{error}</p>
                <button 
                  className="mt-4 px-4 py-2 bg-primary-500 text-white rounded-lg font-medium"
                  onClick={() => window.location.reload()}
                >
                  Retry
                </button>
              </div>
            </div>
          )}
          
          <div ref={mapRef} className="absolute inset-0 z-0"></div>
        </div>
        
        {!selectedFacility ? (
          <div className="bg-white shadow-sm flex-1 overflow-y-auto">
            <div className="p-4 border-b">
              <div className="flex gap-2 overflow-x-auto pb-2 -mx-1 px-1">
                <button 
                  onClick={() => handleTypeFilter('all')}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-full whitespace-nowrap text-sm font-medium ${
                    selectedType === 'all' 
                      ? 'bg-primary-100 text-primary-700' 
                      : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  All
                </button>
                <button 
                  onClick={() => handleTypeFilter('hospital')}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-full whitespace-nowrap text-sm font-medium ${
                    selectedType === 'hospital' 
                      ? 'bg-blue-100 text-blue-700' 
                      : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  <Building2 className="w-4 h-4" />
                  Hospitals
                </button>
                <button 
                  onClick={() => handleTypeFilter('ambulance')}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-full whitespace-nowrap text-sm font-medium ${
                    selectedType === 'ambulance' 
                      ? 'bg-red-100 text-red-700' 
                      : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  <Shield className="w-4 h-4" />
                  Ambulances
                </button>
                <button 
                  onClick={() => handleTypeFilter('pharmacy')}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-full whitespace-nowrap text-sm font-medium ${
                    selectedType === 'pharmacy' 
                      ? 'bg-green-100 text-green-700' 
                      : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  <Pill className="w-4 h-4" />
                  Pharmacies
                </button>
              </div>
            </div>
            
            <div className="divide-y">
              {filteredFacilities.map((facility) => (
                <div 
                  key={facility.id} 
                  className="p-4 hover:bg-gray-50 cursor-pointer"
                  onClick={() => handleSelectFacility(facility)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex gap-3">
                      <div className={`mt-1 p-2 rounded-full ${
                        facility.type === 'hospital' ? 'bg-blue-100 text-blue-600' :
                        facility.type === 'ambulance' ? 'bg-red-100 text-red-600' :
                        'bg-green-100 text-green-600'
                      }`}>
                        {facility.type === 'hospital' && <Building2 className="w-5 h-5" />}
                        {facility.type === 'ambulance' && <Shield className="w-5 h-5" />}
                        {facility.type === 'pharmacy' && <Pill className="w-5 h-5" />}
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900">{facility.name}</h3>
                        <p className="text-sm text-gray-500">{facility.address}</p>
                        <div className="flex items-center mt-1">
                          <span className="text-xs text-gray-500">{facility.distance}</span>
                          <span className="mx-2 text-gray-300">•</span>
                          <span className="text-xs text-gray-500">{facility.availability}</span>
                        </div>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-400" />
                  </div>
                </div>
              ))}
              
              {filteredFacilities.length === 0 && (
                <div className="p-8 text-center">
                  <MapPin className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                  <p className="text-gray-500">No facilities found</p>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="bg-white shadow-sm flex-1 overflow-y-auto">
            <div className="p-4">
              <div className={`inline-flex items-center p-2 rounded-lg mb-4 ${
                selectedFacility.type === 'hospital' ? 'bg-blue-100 text-blue-600' : 
                selectedFacility.type === 'ambulance' ? 'bg-red-100 text-red-600' :
                'bg-green-100 text-green-600'
              }`}>
                {selectedFacility.type === 'hospital' && <Building2 className="w-5 h-5" />}
                {selectedFacility.type === 'ambulance' && <Shield className="w-5 h-5" />}
                {selectedFacility.type === 'pharmacy' && <Pill className="w-5 h-5" />}
              </div>
              
              <div className="mb-6">
                <h2 className="text-xl font-bold text-gray-900">{selectedFacility.name}</h2>
                <p className="text-gray-500">{selectedFacility.address}</p>
                <div className="flex items-center mt-1">
                  <span className="text-sm text-gray-500">{selectedFacility.distance}</span>
                  <span className="mx-2 text-gray-300">•</span>
                  <span className="text-sm text-gray-500">{selectedFacility.availability}</span>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-3 mb-6">
                <button className="bg-primary-600 text-white py-3 rounded-lg font-medium">
                  Call {selectedFacility.type === 'hospital' ? 'Hospital' : 
                        selectedFacility.type === 'ambulance' ? 'Dispatcher' : 'Pharmacy'}
                </button>
                <button className="bg-gray-100 text-gray-700 py-3 rounded-lg font-medium">
                  Get Directions
                </button>
              </div>
              
              <div className="mb-6">
                <h3 className="font-semibold mb-2 text-gray-900">Contact Information</h3>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-500">Phone</span>
                    <span className="font-medium text-gray-900">{selectedFacility.phone}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Status</span>
                    <span className="font-medium text-gray-900">{selectedFacility.availability}</span>
                  </div>
                </div>
              </div>
              
              {selectedFacility.type === 'hospital' && (
                <div>
                  <h3 className="font-semibold mb-2 text-gray-900">Services</h3>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <ul className="space-y-2">
                      <li className="flex items-center text-gray-700">
                        <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                        Emergency Room
                      </li>
                      <li className="flex items-center text-gray-700">
                        <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                        Trauma Center
                      </li>
                      <li className="flex items-center text-gray-700">
                        <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                        Intensive Care Unit
                      </li>
                      <li className="flex items-center text-gray-700">
                        <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                        Ambulance Services
                      </li>
                    </ul>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </>
  );
}