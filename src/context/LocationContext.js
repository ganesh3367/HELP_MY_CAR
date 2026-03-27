
import * as Location from 'expo-location';
import { createContext, useContext, useEffect, useRef, useState } from 'react';

const LocationContext = createContext();

export const LocationProvider = ({ children }) => {
    const [location, setLocation] = useState(null);
    const [errorMsg, setErrorMsg] = useState(null);
    const [loading, setLoading] = useState(true);
    const watcherRef = useRef(null);

    const requestLocation = async () => {
        try {
            setLoading(true);
            const { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                setErrorMsg('Permission to access location was denied');
                setLoading(false);
                return;
            }

            
            const initialLocation = await Location.getCurrentPositionAsync({
                accuracy: Location.Accuracy.Balanced,
            });
            setLocation(initialLocation);
            setLoading(false);

            
            if (watcherRef.current) {
                watcherRef.current.remove();
            }
            watcherRef.current = await Location.watchPositionAsync(
                {
                    accuracy: Location.Accuracy.High,
                    distanceInterval: 10,   
                    timeInterval: 5000,      
                },
                (newLocation) => {
                    setLocation(newLocation);
                }
            );
        } catch (error) {
            setErrorMsg('Error fetching location');
            console.error(error);
            setLoading(false);
        }
    };

    const setManualLocation = (lat, lng) => {
        const manualLoc = {
            coords: {
                latitude: lat,
                longitude: lng,
                accuracy: 0,
                altitude: 0,
                heading: 0,
                speed: 0,
            },
            timestamp: Date.now(),
            isManual: true,
        };
        setLocation(manualLoc);

        
        if (watcherRef.current) {
            watcherRef.current.remove();
            watcherRef.current = null;
        }
    };

    useEffect(() => {
        requestLocation();
        return () => {
            
            if (watcherRef.current) watcherRef.current.remove();
        };
    }, []);

    return (
        <LocationContext.Provider value={{ location, errorMsg, loading, requestLocation, setManualLocation }}>
            {children}
        </LocationContext.Provider>
    );
};

export const useLocation = () => useContext(LocationContext);
