import { useEffect, useRef } from 'react';
import { Emergency, Ambulance, Location } from '@/types';

// We're assuming Leaflet is loaded from CDN in index.html
declare global {
  interface Window {
    L: any;
  }
}

interface AmbulanceTrackingProps {
  emergency: Emergency;
}

export default function AmbulanceTracking({ emergency }: AmbulanceTrackingProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const leafletMapRef = useRef<any>(null);
  const userMarkerRef = useRef<any>(null);
  const ambulanceMarkerRef = useRef<any>(null);
  
  useEffect(() => {
    if (!mapRef.current || !emergency.location) return;
    
    // Initialize map
    const map = window.L.map(mapRef.current);
    leafletMapRef.current = map;
    
    // Add OSM tile layer
    window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);
    
    // Add user location marker
    const userLocation = [emergency.location.latitude, emergency.location.longitude];
    userMarkerRef.current = window.L.marker(userLocation, {
      icon: window.L.divIcon({
        html: `<span class="material-icons text-primary text-4xl">location_on</span>`,
        className: 'custom-div-icon',
        iconSize: [30, 42],
        iconAnchor: [15, 42]
      })
    }).addTo(map);
    
    // If ambulance exists, add ambulance marker
    if (emergency.ambulance && emergency.ambulance.location) {
      const ambulanceLocation = [
        emergency.ambulance.location.latitude,
        emergency.ambulance.location.longitude
      ];
      
      ambulanceMarkerRef.current = window.L.marker(ambulanceLocation, {
        icon: window.L.divIcon({
          html: `<div class="bg-white rounded-full p-1 shadow-md"><span class="material-icons text-primary">airport_shuttle</span></div>`,
          className: 'custom-div-icon',
          iconSize: [30, 30],
          iconAnchor: [15, 15]
        })
      }).addTo(map);
      
      // Create bounds to fit both markers
      const bounds = window.L.latLngBounds([userLocation, ambulanceLocation]);
      map.fitBounds(bounds, { padding: [50, 50] });
    } else {
      // If no ambulance, just center on user location
      map.setView(userLocation, 15);
    }
    
    // Cleanup
    return () => {
      if (leafletMapRef.current) {
        leafletMapRef.current.remove();
      }
    };
  }, [emergency]);
  
  // Update ambulance position when it changes
  useEffect(() => {
    if (!leafletMapRef.current || !ambulanceMarkerRef.current || !emergency.ambulance?.location) return;
    
    const ambulanceLocation = [
      emergency.ambulance.location.latitude,
      emergency.ambulance.location.longitude
    ];
    
    ambulanceMarkerRef.current.setLatLng(ambulanceLocation);
    
    // Update bounds to keep both markers visible
    if (userMarkerRef.current) {
      const userLocation = userMarkerRef.current.getLatLng();
      const bounds = window.L.latLngBounds([userLocation, ambulanceLocation]);
      leafletMapRef.current.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [emergency.ambulance?.location]);

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'Dispatched': return 'Dispatched';
      case 'EnRoute': return 'En Route';
      case 'OnScene': return 'On Scene';
      default: return status;
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-2 mb-5">
      <div className="bg-lightGray rounded h-56 flex items-center justify-center relative">
        <div ref={mapRef} className="absolute inset-0 z-0 rounded"></div>
      </div>
      {emergency.ambulance && (
        <div className="p-3">
          <div className="flex justify-between items-center mb-3">
            <div className="flex items-center">
              <span className="material-icons text-primary mr-2">airport_shuttle</span>
              <p className="text-sm font-medium">Ambulance #{emergency.ambulance.id}</p>
            </div>
            <span className="text-xs bg-green-100 text-success px-2 py-1 rounded-full">
              {getStatusLabel(emergency.ambulance.status)}
            </span>
          </div>
          
          <div className="border-t pt-3">
            {emergency.ambulance.distance !== undefined && (
              <div className="flex justify-between items-center mb-2">
                <p className="text-xs text-mediumGray">Distance</p>
                <p className="text-sm font-medium">{emergency.ambulance.distance.toFixed(1)} miles away</p>
              </div>
            )}
            {emergency.ambulance.speed !== undefined && (
              <div className="flex justify-between items-center">
                <p className="text-xs text-mediumGray">Current Speed</p>
                <p className="text-sm font-medium">{emergency.ambulance.speed} mph</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
