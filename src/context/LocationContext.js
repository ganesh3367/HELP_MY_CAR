/**
 * LocationContext.js
 * Manages access to the device's geolocation services using expo-location.
 */
import * as Location from 'expo-location';
import { createContext, useContext, useEffect, useState } from 'react';

const LocationContext = createContext();

export const LocationProvider = ({ children }) => {
    const [location, setLocation] = useState(null);
    const [errorMsg, setErrorMsg] = useState(null);
    const [loading, setLoading] = useState(true);

    const requestLocation = async () => {
        try {
            setLoading(true);
            let { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                setErrorMsg('Permission to access location was denied');
                setLoading(false);
                return;
            }

            let currentLocation = await Location.getCurrentPositionAsync({});
            setLocation(currentLocation);
        } catch (error) {
            setErrorMsg('Error fetching location');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        requestLocation();
    }, []);

    return (
        <LocationContext.Provider value={{ location, errorMsg, loading, requestLocation }}>
            {children}
        </LocationContext.Provider>
    );
};

export const useLocation = () => useContext(LocationContext);
