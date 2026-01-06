import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import { Calculator, Home, Truck, User, Wrench } from 'lucide-react-native';
import React, { useEffect, useRef } from 'react';
import { Animated, Dimensions, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { COLORS, SHADOWS } from '../constants/theme';

import CostEstimatorScreen from '../screens/CostEstimatorScreen';
import HomeScreen from '../screens/HomeScreen';
import MechanicsScreen from '../screens/MechanicsScreen';
import ProfileScreen from '../screens/ProfileScreen';
import TowingScreen from '../screens/TowingScreen';

const { width } = Dimensions.get('window');
const Tab = createBottomTabNavigator();

const TAB_COLORS = {
    Home: '#007AFF',
    Mechanics: '#FF8C00',
    Towing: '#34C759',
    Cost: '#5856D6',
    Profile: '#FF2D55',
};

const CustomTabBar = ({ state, descriptors, navigation }) => {
    const containerWidth = width - 40;
    const tabWidth = containerWidth / state.routes.length;
    const translateX = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.spring(translateX, {
            toValue: state.index * tabWidth,
            useNativeDriver: true,
            bounciness: 5,
            speed: 12,
        }).start();
    }, [state.index, tabWidth]);

    return (
        <View style={styles.tabBarWrapper}>
            <BlurView intensity={80} tint="light" style={styles.tabBarContainer}>
                <Animated.View
                    style={[
                        styles.slidingIndicator,
                        {
                            width: tabWidth - 12,
                            transform: [{ translateX: Animated.add(translateX, new Animated.Value(6)) }],
                        },
                    ]}
                />
                {state.routes.map((route, index) => {
                    const { options } = descriptors[route.key];
                    const isFocused = state.index === index;

                    const onPress = () => {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                        const event = navigation.emit({
                            type: 'tabPress',
                            target: route.key,
                            canPreventDefault: true,
                        });

                        if (!isFocused && !event.defaultPrevented) {
                            navigation.navigate(route.name);
                        }
                    };

                    const Icon = options.tabBarIcon;
                    const label = options.title || route.name;
                    const activeColor = TAB_COLORS[route.name] || COLORS.primary;

                    return (
                        <TouchableOpacity
                            key={route.key}
                            onPress={onPress}
                            style={styles.tabItem}
                            activeOpacity={1}
                        >
                            <View style={styles.iconContainer}>
                                <Animated.View style={{ transform: [{ scale: isFocused ? 1.1 : 1 }] }}>
                                    <Icon
                                        color={isFocused ? activeColor : '#8E8E93'}
                                        size={22}
                                    />
                                </Animated.View>
                                <Text style={[
                                    styles.tabLabel,
                                    {
                                        color: isFocused ? activeColor : '#8E8E93',
                                        fontWeight: isFocused ? '800' : '600'
                                    }
                                ]}>
                                    {label}
                                </Text>
                            </View>
                        </TouchableOpacity>
                    );
                })}
            </BlurView>
        </View>
    );
};

const TabNavigator = () => {
    return (
        <Tab.Navigator
            tabBar={(props) => <CustomTabBar {...props} />}
            screenOptions={{
                headerShown: false,
            }}
        >
            <Tab.Screen
                name="Home"
                component={HomeScreen}
                options={{
                    tabBarIcon: (props) => <Home {...props} />,
                }}
            />
            <Tab.Screen
                name="Mechanics"
                component={MechanicsScreen}
                options={{
                    headerShown: true,
                    tabBarIcon: (props) => <Wrench {...props} />,
                }}
            />
            <Tab.Screen
                name="Towing"
                component={TowingScreen}
                options={{
                    headerShown: true,
                    tabBarIcon: (props) => <Truck {...props} />,
                }}
            />
            <Tab.Screen
                name="Cost"
                component={CostEstimatorScreen}
                options={{
                    headerShown: true,
                    title: 'Cost',
                    tabBarIcon: (props) => <Calculator {...props} />,
                }}
            />
            <Tab.Screen
                name="Profile"
                component={ProfileScreen}
                options={{
                    headerShown: false,
                    tabBarIcon: (props) => <User {...props} />,
                }}
            />
        </Tab.Navigator>
    );
};

const styles = StyleSheet.create({
    tabBarWrapper: {
        position: 'absolute',
        bottom: Platform.OS === 'ios' ? 35 : 20,
        left: 20,
        right: 20,
        borderRadius: 36,
        overflow: 'hidden',
        ...SHADOWS.large,
    },
    tabBarContainer: {
        flexDirection: 'row',
        height: 76,
        alignItems: 'center',
        paddingHorizontal: 0,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.4)',
    },
    tabItem: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 2,
        height: '100%',
    },
    slidingIndicator: {
        position: 'absolute',
        top: 6,
        height: 64,
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        borderRadius: 32,
        zIndex: 1,
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.1,
                shadowRadius: 10,
            },
            android: {
                elevation: 6,
            }
        }),
        borderWidth: 1,
        borderColor: 'rgba(0,0,0,0.05)',
    },
    iconContainer: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    tabLabel: {
        fontSize: 10,
        marginTop: 2,
    },
});

export default TabNavigator;
