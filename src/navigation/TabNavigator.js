import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Calculator, Home, Truck, User, Wrench } from 'lucide-react-native';
import { COLORS } from '../constants/theme';

import CostEstimatorScreen from '../screens/CostEstimatorScreen';
import HomeScreen from '../screens/HomeScreen';
import MechanicsScreen from '../screens/MechanicsScreen';
import ProfileScreen from '../screens/ProfileScreen';
import TowingScreen from '../screens/TowingScreen';

const Tab = createBottomTabNavigator();

const TabNavigator = () => {
    return (
        <Tab.Navigator
            screenOptions={{
                tabBarActiveTintColor: COLORS.primary,
                tabBarInactiveTintColor: COLORS.textLight,
                tabBarStyle: {
                    borderTopWidth: 1,
                    borderTopColor: '#F0F0F0',
                    height: 60,
                    paddingBottom: 10,
                    paddingTop: 5,
                },
                headerStyle: {
                    backgroundColor: COLORS.white,
                    elevation: 0,
                    shadowOpacity: 0,
                    borderBottomWidth: 1,
                    borderBottomColor: '#F0F0F0',
                },
                headerTitleStyle: {
                    fontWeight: 'bold',
                    color: COLORS.text,
                },
            }}
        >
            <Tab.Screen
                name="Home"
                component={HomeScreen}
                options={{
                    headerShown: false,
                    tabBarIcon: ({ color, size }) => <Home size={size} color={color} />,
                }}
            />
            <Tab.Screen
                name="Mechanics"
                component={MechanicsScreen}
                options={{
                    tabBarIcon: ({ color, size }) => <Wrench size={size} color={color} />,
                }}
            />
            <Tab.Screen
                name="Towing"
                component={TowingScreen}
                options={{
                    tabBarIcon: ({ color, size }) => <Truck size={size} color={color} />,
                }}
            />
            <Tab.Screen
                name="Estimator"
                component={CostEstimatorScreen}
                options={{
                    title: 'Cost',
                    tabBarIcon: ({ color, size }) => <Calculator size={size} color={color} />,
                }}
            />
            <Tab.Screen
                name="Profile"
                component={ProfileScreen}
                options={{
                    tabBarIcon: ({ color, size }) => <User size={size} color={color} />,
                }}
            />
        </Tab.Navigator>
    );
};

export default TabNavigator;
