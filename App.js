/**
 * Main Entry Point for the HELP_MY_CAR Application
 * This file sets up the main providers (Auth, App, Location) and the Navigation structure.
 */
import { NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import OfflineFallback from './src/components/OfflineFallback';
import { AppProvider } from './src/context/AppContext';
import { AuthProvider } from './src/context/AuthContext';
import { LocationProvider } from './src/context/LocationContext';
import RootNavigator from './src/navigation/RootNavigator';

/**
 * Root component of the application.
 * Wraps the app in necessary context providers and navigation container.
 * @returns {JSX.Element} The rendered application
 */
export default function App() {
    return (
        <AuthProvider>
            <AppProvider>
                <LocationProvider>
                    <NavigationContainer>
                        <RootNavigator />
                        <OfflineFallback />
                        <StatusBar style="auto" />
                    </NavigationContainer>
                </LocationProvider>
            </AppProvider>
        </AuthProvider>
    );
}
