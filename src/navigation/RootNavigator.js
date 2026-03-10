import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ActivityIndicator, View } from 'react-native';
import { COLORS } from '../constants/theme';
import { useAuth } from '../context/AuthContext';

import CarDiagnosticScreen from '../screens/CarDiagnosticScreen';
import EditGarageProfileScreen from '../screens/EditGarageProfileScreen';
import FeedbackScreen from '../screens/FeedbackScreen';
import GarageOrderTrackingScreen from '../screens/GarageOrderTrackingScreen';
import LocationPickerScreen from '../screens/LocationPickerScreen';
import LoginScreen from '../screens/LoginScreen';
import MechanicProfileScreen from '../screens/MechanicProfileScreen';
import OrderTrackingScreen from '../screens/OrderTrackingScreen';
import PrivacySafetyScreen from '../screens/PrivacySafetyScreen';
import ProfileScreen from '../screens/ProfileScreen';
import RegisterGarageScreen from '../screens/RegisterGarageScreen';
import RoleSelectionScreen from '../screens/RoleSelectionScreen';
import ServiceHistoryScreen from '../screens/ServiceHistoryScreen';
import SettingsScreen from '../screens/SettingsScreen';
import SignupScreen from '../screens/SignupScreen';
import SplashScreen from '../screens/SplashScreen';
import TabNavigator from './TabNavigator';

const Stack = createNativeStackNavigator();

/**
 * The main navigator component.
 * @returns {JSX.Element} Navigation stack based on auth state.
 */
const RootNavigator = () => {
    const { isInitializing, user } = useAuth();

    if (isInitializing) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.white }}>
                <ActivityIndicator size="large" color={COLORS.primary} />
            </View>
        );
    }

    return (
        <Stack.Navigator
            screenOptions={{
                headerShown: false,
                animation: 'slide_from_right',
                animationDuration: 350,
                gestureEnabled: true,
                gestureDirection: 'horizontal',
            }}
        >
            {user ? (
                // Authenticated Flow
                user.role === 'garage' && !user.hasGarageProfile ? (
                    // Forced Onboarding for Garage Owners
                    <>
                        <Stack.Screen
                            name="RegisterGarage"
                            component={RegisterGarageScreen}
                            options={{ gestureEnabled: false }}
                        />
                        <Stack.Screen name="LocationPicker" component={LocationPickerScreen} />
                        <Stack.Screen name="Login" component={LoginScreen} />
                    </>
                ) : (
                    // Full App for Users or Completed Garage Owners
                    <>
                        <Stack.Screen name="Main" component={TabNavigator} />
                        <Stack.Screen
                            name="ServiceHistory"
                            component={ServiceHistoryScreen}
                            options={{
                                headerShown: true,
                                title: 'Service History',
                                headerTintColor: COLORS.primary,
                                headerTitleStyle: { fontWeight: 'bold' }
                            }}
                        />
                        <Stack.Screen name="Settings" component={SettingsScreen} />
                        <Stack.Screen name="PrivacySafety" component={PrivacySafetyScreen} />
                        <Stack.Screen name="Feedback" component={FeedbackScreen} />
                        <Stack.Screen name="EditGarageProfile" component={EditGarageProfileScreen} />
                        <Stack.Screen name="GarageOrderTracking" component={GarageOrderTrackingScreen} />
                        <Stack.Screen name="Profile" component={ProfileScreen} />
                        <Stack.Screen
                            name="OrderTracking"
                            component={OrderTrackingScreen}
                            options={{ headerShown: false }}
                        />
                        <Stack.Screen name="LocationPicker" component={LocationPickerScreen} />
                        <Stack.Screen name="MechanicProfile" component={MechanicProfileScreen} options={{ headerShown: false }} />
                        <Stack.Screen
                            name="CarDiagnostic"
                            component={CarDiagnosticScreen}
                            options={{ headerShown: true, title: '🔍 Car Diagnostic', headerTintColor: COLORS.primary, headerTitleStyle: { fontWeight: 'bold' } }}
                        />
                    </>
                )
            ) : (
                // Unauthenticated Flow
                <>
                    <Stack.Screen name="Splash" component={SplashScreen} />
                    <Stack.Screen name="RoleSelection" component={RoleSelectionScreen} />
                    <Stack.Screen name="Login" component={LoginScreen} />
                    <Stack.Screen name="Signup" component={SignupScreen} />
                </>
            )}
        </Stack.Navigator>
    );
};

export default RootNavigator;
