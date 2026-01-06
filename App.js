import { NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { AppProvider } from './src/context/AppContext';
import { LocationProvider } from './src/context/LocationContext';
import RootNavigator from './src/navigation/RootNavigator';

export default function App() {
    return (
        <AppProvider>
            <LocationProvider>
                <NavigationContainer>
                    <RootNavigator />
                    <StatusBar style="auto" />
                </NavigationContainer>
            </LocationProvider>
        </AppProvider>
    );
}
