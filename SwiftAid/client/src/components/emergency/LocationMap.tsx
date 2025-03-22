import { useEffect, useRef, useState } from 'react';
import { Location } from '@/types';
import { useEmergency } from '@/contexts/EmergencyContext';
import { MapPin, Navigation, Loader2, AlertTriangle } from 'lucide-react';

// We're assuming Leaflet is loaded from CDN in index.html
declare global {
  interface Window {
    L: any;
  }
}

export default function LocationMap() {
  const mapRef = useRef<HTMLDivElement>(null);
  const leafletMapRef = useRef<any>(null);
  const markerRef = useRef<any>(null);
  const { currentLocation, setCurrentLocation } = useEmergency();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [leafletLoaded, setLeafletLoaded] = useState(false);

  // Check if Leaflet is loaded
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
      // Initialize map
      const map = window.L.map(mapRef.current, {
        zoomControl: false,
        attributionControl: false
      }).setView([51.505, -0.09], 13);
      
      leafletMapRef.current = map;

      // Add a modern looking tile layer
      window.L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
        subdomains: 'abcd',
        maxZoom: 19
      }).addTo(map);
      
      // Add zoom control to bottom right
      window.L.control.zoom({
        position: 'bottomright'
      }).addTo(map);

      // Create a custom marker icon
      const userIcon = window.L.divIcon({
        html: `<div class="user-marker-pulse"></div>`,
        className: 'user-marker',
        iconSize: [20, 20],
        iconAnchor: [10, 10]
      });
      
      // Add CSS for the pulsing marker
      const style = document.createElement('style');
      style.textContent = `
        .user-marker { background: none !important; }
        .user-marker-pulse {
          width: 20px;
          height: 20px;
          background-color: rgba(65, 100, 251, 0.6);
          border-radius: 50%;
          border: 2px solid white;
          box-shadow: 0 0 0 rgba(65, 100, 251, 0.4);
          animation: pulse 2s infinite;
        }
        @keyframes pulse {
          0% { box-shadow: 0 0 0 0 rgba(65, 100, 251, 0.4); }
          70% { box-shadow: 0 0 0 10px rgba(65, 100, 251, 0); }
          100% { box-shadow: 0 0 0 0 rgba(65, 100, 251, 0); }
        }
      `;
      document.head.appendChild(style);

      // Create a marker but don't add it to the map yet
      markerRef.current = window.L.marker([51.505, -0.09], {
        icon: userIcon,
        draggable: true // Make the marker draggable so users can pin their exact location
      });
      
      // Handle marker drag events to update location
      markerRef.current.on('dragend', function(e: any) {
        const latlng = e.target.getLatLng();
        updateLocationFromCoordinates(latlng.lat, latlng.lng);
      });

      // Get current location
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const { latitude, longitude } = position.coords;
            
            // Move map to current location
            map.setView([latitude, longitude], 16);
            
            // Add marker to current location
            markerRef.current.setLatLng([latitude, longitude]).addTo(map);
            
            // Update location context
            updateLocationFromCoordinates(latitude, longitude);
          },
          (err) => {
            console.error('Error getting location:', err);
            // Still show the map, but with default location
            markerRef.current.addTo(map);
            setError('Could not access your location. Please enable location services or drag the marker to your location.');
            setIsLoading(false);
          }
        );
      } else {
        markerRef.current.addTo(map);
        setError('Geolocation is not supported by your browser. Please drag the marker to your location.');
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
  
  // Function to update location based on coordinates
  const updateLocationFromCoordinates = (latitude: number, longitude: number) => {
    // Reverse geocode to get address
    fetch(`https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`)
      .then(response => response.json())
      .then(data => {
        const address = data.display_name;
        setCurrentLocation({
          latitude,
          longitude,
          address
        });
        setIsLoading(false);
      })
      .catch(err => {
        console.error('Error getting address:', err);
        setCurrentLocation({
          latitude,
          longitude,
          address: 'Unknown location'
        });
        setIsLoading(false);
      });
  };

  const handleMyLocationClick = () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      return;
    }
    
    setIsLoading(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        
        if (leafletMapRef.current && markerRef.current) {
          leafletMapRef.current.setView([latitude, longitude], 16);
          markerRef.current.setLatLng([latitude, longitude]);
          
          // Update location context
          updateLocationFromCoordinates(latitude, longitude);
        }
      },
      (err) => {
        console.error('Error getting location:', err);
        setError('Could not access your location. Please enable location services.');
        setIsLoading(false);
      }
    );
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-2 mb-5 border border-gray-100">
      <div className="rounded-lg h-56 flex items-center justify-center relative overflow-hidden">
        {isLoading && (
          <div className="absolute inset-0 z-20 flex items-center justify-center bg-white bg-opacity-80">
            <div className="flex flex-col items-center">
              <Loader2 className="w-10 h-10 text-primary-500 animate-spin mb-2" />
              <p className="text-gray-600 text-sm font-medium">Loading map...</p>
            </div>
          </div>
        )}
        
        {error && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-gray-50 bg-opacity-90 p-4">
            <div className="bg-white p-4 rounded-lg shadow-md text-center max-w-xs">
              <AlertTriangle className="w-10 h-10 text-amber-500 mx-auto mb-2" />
              <p className="text-gray-800 font-medium mb-2">Location Error</p>
              <p className="text-gray-600 text-sm mb-3">{error}</p>
              <button 
                className="px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium"
                onClick={handleMyLocationClick}
              >
                Try Again
              </button>
            </div>
          </div>
        )}
        
        <div ref={mapRef} className="absolute inset-0 z-0 rounded-lg"></div>
        
        <div className="absolute bottom-3 right-3 z-10">
          <button 
            className="bg-white rounded-full p-3 shadow-md hover:bg-gray-50"
            onClick={handleMyLocationClick}
            aria-label="Find my location"
          >
            <Navigation className="w-5 h-5 text-primary-600" />
          </button>
        </div>
      </div>
      
      <div className="p-3">
        {currentLocation ? (
          <>
            <div className="flex items-start gap-2 mb-2">
              <MapPin className="w-5 h-5 text-primary-500 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-gray-800">{currentLocation.address}</p>
                <p className="text-xs text-gray-500 mt-1">
                  GPS: {currentLocation.latitude.toFixed(5)}°, {currentLocation.longitude.toFixed(5)}°
                </p>
              </div>
            </div>
            <p className="text-xs text-gray-600 italic pl-7">
              Drag the pin on map to adjust your exact location if needed
            </p>
          </>
        ) : (
          <div className="flex items-center justify-center py-2">
            <p className="text-gray-500 text-sm">Locating your position...</p>
          </div>
        )}
      </div>
    </div>
  );
}
