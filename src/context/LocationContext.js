/**
 * LocationContext.js
 * Manages access to the device's geolocation services using expo-location.
 * Uses watchPositionAsync so the user location updates continuously (like Uber).
 */
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

            // Get an initial fix immediately so the app doesn't wait for first watcher event
            const initialLocation = await Location.getCurrentPositionAsync({
                accuracy: Location.Accuracy.Balanced,
            });
            setLocation(initialLocation);
            setLoading(false);

            // Then keep watching for updates (like Uber)
            if (watcherRef.current) {
                watcherRef.current.remove();
            }
            watcherRef.current = await Location.watchPositionAsync(
                {
                    accuracy: Location.Accuracy.High,
                    distanceInterval: 10,   // metres before update is emitted
                    timeInterval: 5000,      // ms minimum between updates
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

    useEffect(() => {
        requestLocation();
        return () => {
            // Cleanup watcher on unmount
            if (watcherRef.current) watcherRef.current.remove();
        };
    }, []);

    return (
        <LocationContext.Provider value={{ location, errorMsg, loading, requestLocation }}>
            {children}
        </LocationContext.Provider>
    );
};

export const useLocation = () => useContext(LocationContext);
