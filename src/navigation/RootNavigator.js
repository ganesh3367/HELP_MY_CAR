/**
 * Root Navigation Controller
 * Handles authentication state to switch between Auth and App stacks.
 */
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ActivityIndicator, View } from 'react-native';
import { COLORS } from '../constants/theme';
import { useAuth } from '../context/AuthContext';

import LoginScreen from '../screens/LoginScreen';
import OrderTrackingScreen from '../screens/OrderTrackingScreen';
import ProfileScreen from '../screens/ProfileScreen';
import ServiceHistoryScreen from '../screens/ServiceHistoryScreen';
import SignupScreen from '../screens/SignupScreen';
import SplashScreen from '../screens/SplashScreen';
import TabNavigator from './TabNavigator';

const Stack = createNativeStackNavigator();

const RootNavigator = () => {
    const auth = useAuth();
    const user = auth?.user;
    const loading = auth?.loading;

    if (loading) {
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
                    <Stack.Screen name="Profile" component={ProfileScreen} />
                    <Stack.Screen
                        name="OrderTracking"
                        component={OrderTrackingScreen}
                        options={{ title: 'Track Service', headerShown: true }}
                    />
                </>
            ) : (
                <>
                    <Stack.Screen name="Splash" component={SplashScreen} />
                    <Stack.Screen name="Login" component={LoginScreen} />
                    <Stack.Screen name="Signup" component={SignupScreen} />
                </>
            )}
        </Stack.Navigator>
    );
};

export default RootNavigator;
