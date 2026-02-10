import { AlertTriangle, Battery, Car, CheckCircle, ChevronRight, Flame, Info, ShieldAlert, Siren, Thermometer, Truck, Wrench, X } from 'lucide-react-native';
import React, { useState } from 'react';
import { Dimensions, Linking, Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, SHADOWS, SPACING } from '../constants/theme';

const { width } = Dimensions.get('window');

const CarStuckScreen = ({ navigation }) => {
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedIssue, setSelectedIssue] = useState(null);
    const [vehicleType, setVehicleType] = useState('car'); // 'car' or 'bike'

    // Guides Data with Visual Types
    const guides = {
        flat_tire: {
            title: 'Flat Tire / Puncture',
            car: [
                { type: 'danger', title: 'SAFETY FIRST', text: 'Park on a level surface away from traffic. Turn on hazard lights.' },
                { type: 'action', title: 'PREPARE', text: 'Apply parking brake. Place wedges/bricks behind the tires to stop rolling.' },
                { type: 'action', title: 'LOOSEN', text: 'Use lug wrench to loosen nuts (counter-clockwise) by 1 turn. DO NOT remove them yet.' },
                { type: 'warning', title: 'LIFT', text: 'Place jack under lifting point. Lift until tire is off the ground.', why: 'Prevents car from falling during removal.' },
                { type: 'action', title: 'REMOVE', text: 'Fully remove nuts and the flat tire. Mount the spare tire.' },
                { type: 'action', title: 'TIGHTEN', text: 'Put nuts back on by hand. Tighten slightly with wrench.' },
                { type: 'success', title: 'FINISH', text: 'Lower car completely. Fully tighten nuts in "Star Pattern".' }
            ],
            bike: [
                { type: 'danger', title: 'SAFE SPOT', text: 'Park the bike on the main (center) stand on a flat surface.' },
                { type: 'action', title: 'INSPECT', text: 'Rotate wheel to find nail/glass. Do not pull out unless you have a repair kit.' },
                { type: 'action', title: 'TUBELESS FIX', text: 'Use puncture kit: Insert reamer to clean hole, then insert rubber strip.', why: 'Standard kit for most modern bikes.' },
                { type: 'action', title: 'INFLATE', text: 'Use portable pump or CO2 cartridge to refill air.' },
                { type: 'warning', title: 'TUBE TYPE', text: 'Wheel removal is complex. Call a mechanic if you have a tube tire.' }
            ]
        },
        battery: {
            title: 'Dead Battery (Jump Start)',
            car: [
                { type: 'action', title: 'SETUP', text: 'Park "Donor" car close. Turn both cars OFF.' },
                { type: 'action', title: 'RED TO DEAD', text: 'Connect RED clamp to Positive (+) of DEAD battery.' },
                { type: 'action', title: 'RED TO DONOR', text: 'Connect RED clamp to Positive (+) of GOOD battery.' },
                { type: 'action', title: 'BLACK TO DONOR', text: 'Connect BLACK clamp to Negative (-) of GOOD battery.' },
                { type: 'warning', title: 'BLACK TO METAL', text: 'Connect BLACK clamp to unpainted METAL on DEAD car.', why: 'Prevents sparks near battery.' },
                { type: 'success', title: 'START', text: 'Start Donor car. Wait 3 mins. Start Dead car.' },
                { type: 'action', title: 'REMOVE', text: 'Remove cables in REVERSE order (Blacks first).' }
            ],
            bike: [
                { type: 'warning', title: 'KILL SWITCH', text: 'Ensure red "Run/Stop" switch is in RUN position.' },
                { type: 'action', title: 'SIDE STAND', text: 'Ensure side stand is UP (safety sensor prevents starting).' },
                { type: 'action', title: 'KICK START', text: 'Use kick lever if electric start fails. Ensure bike is in Neutral.' },
                { type: 'danger', title: 'PUSH START', text: '2nd gear, hold clutch, push to speed, release clutch.', why: 'Risky. Use only if experienced.' }
            ]
        },
        overheating: {
            title: 'Engine Overheating',
            car: [
                { type: 'danger', title: 'STOP', text: 'Stop immediately! Continuing to drive will destroy the engine.' },
                { type: 'danger', title: 'DO NOT OPEN CAP', text: 'Never open radiator cap while hot! Steam causes severe burns.' },
                { type: 'action', title: 'OPEN HOOD', text: 'Release hood to let heat escape. Wait 20 mins.' },
                { type: 'action', title: 'CHECK COOLANT', text: 'Check overflow tank level. Top up with water if low.' },
                { type: 'warning', title: 'LEAKS', text: 'Check for green/orange liquid dripping under car. Call Towing if found.' }
            ],
            bike: [
                { type: 'danger', title: 'STOP RIDING', text: 'Stop and turn off ignition immediately.' },
                { type: 'action', title: 'SHADE', text: 'Move to shade. Heat radiates from engine block.' },
                { type: 'action', title: 'OIL CHECK', text: 'Check oil level window once upright.' },
                { type: 'info', title: 'COOL DOWN', text: 'Wait 15-20 mins before restarting.' }
            ]
        },
        start: {
            title: 'Vehicle Won\'t Start',
            car: [
                { type: 'action', title: 'GEAR CHECK', text: 'Ensure gear is in "Park" (P) or "Neutral" (N).' },
                { type: 'action', title: 'STEERING LOCK', text: 'Wiggle steering wheel left/right while turning key.' },
                { type: 'action', title: 'BRAKE PEDAL', text: 'Press brake pedal HARD (push-button start).' },
                { type: 'warning', title: 'BATTERY', text: 'Check headlights. If dim, battery is dead.' }
            ],
            bike: [
                { type: 'warning', title: 'KILL SWITCH', text: 'Check red switch on right handlebar.' },
                { type: 'action', title: 'CLUTCH', text: 'Pull clutch lever in entirely.' },
                { type: 'action', title: 'SIDE STAND', text: 'Put side stand UP and bike in Neutral.' },
                { type: 'info', title: 'FUEL VALVE', text: 'Ensure fuel petcock is ON (older bikes).' }
            ]
        },
        accident: {
            title: 'Accident / Collision',
            car: [
                { type: 'danger', title: 'SAFETY FIRST', text: 'Check for injuries. Do not move injured people unless in danger.' },
                { type: 'action', title: 'MOVE', text: 'If safe, move car to shoulder. Turn on hazards.' },
                { type: 'danger', title: 'CALL HELP', text: 'Call 100 (Police) / 102 (Ambulance).' },
                { type: 'action', title: 'DOCUMENT', text: 'Take photos of damage, plates, and scene.' },
                { type: 'info', title: 'EXCHANGE', text: 'Exchange details. Do not admit fault.' }
            ],
            bike: [
                { type: 'danger', title: 'GET OFF ROAD', text: 'Move to safety immediately.' },
                { type: 'danger', title: 'HELMET', text: 'Do NOT remove helmet if neck pain exists.' },
                { type: 'action', title: 'CHECK', text: 'Check for bleeding/fractures.' },
                { type: 'danger', title: 'CALL', text: 'Get help immediately.' }
            ]
        },
        unknown: {
            title: 'Unknown Issue / Noise',
            car: [
                { type: 'warning', title: 'DASHBOARD', text: 'Red/Orange lights? Oil & Battery are critical.' },
                { type: 'action', title: 'SMELL', text: 'Burning rubber = Belt. Sweet = Coolant.' },
                { type: 'danger', title: 'SOUND', text: 'Knocking sound = Stop Engine immediately.' },
                { type: 'action', title: 'ACTION', text: 'Do not risk it. Call a Mechanic.' }
            ],
            bike: [
                { type: 'action', title: 'VISUAL', text: 'Look for loose wires or leaks.' },
                { type: 'action', title: 'FUEL', text: 'Shake bike to check fuel level.' },
                { type: 'warning', title: 'HELP', text: 'Request a tow if unsure.' }
            ]
        }
    };

    const handleIssuePress = (issue) => {
        setSelectedIssue(issue);
        setModalVisible(true);
    };

    const emergencyServices = [
        { id: 'police', label: 'Police', number: '100', icon: Siren, color: '#FF3B30', bg: '#FFEDED' },
        { id: 'ambulance', label: 'Ambulance', number: '102', icon: ShieldAlert, color: '#007AFF', bg: '#EBF5FF' },
        { id: 'fire', label: 'Fire', number: '101', icon: Flame, color: '#FF9500', bg: '#FFF5E6' },
        { id: 'roadside', label: 'Roadside', number: 'Help', icon: Truck, color: COLORS.primary, bg: '#FFF0E0' },
    ];

    const quickIssues = [
        { id: 'start', label: 'Car Won\'t Start', icon: Car, color: '#FF9500' },
        { id: 'flat_tire', label: 'Flat Tire', icon: AlertTriangle, color: '#5856D6' },
        { id: 'overheating', label: 'Overheating', icon: Thermometer, color: '#FF3B30' },
        { id: 'battery', label: 'Dead Battery', icon: Battery, color: '#34C759' },
        { id: 'accident', label: 'Accident', icon: ShieldAlert, color: '#FF3B30' },
        { id: 'unknown', label: 'Unknown Issue', icon: Info, color: '#8E8E93' },
    ];

    const handleCall = (number) => {
        if (number === 'Help') {
            navigation.navigate('Towing');
        } else {
            Linking.openURL(`tel:${number}`);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContent}>

                {/* Header */}
                <View style={styles.header}>
                    <View style={styles.iconCircle}>
                        <ShieldAlert size={32} color={COLORS.error} />
                    </View>
                    <Text style={styles.headerTitle}>Emergency & Help</Text>
                    <Text style={styles.headerSubtitle}>We are here to assist you immediately.</Text>
                </View>

                {/* Emergency Services */}
                <Text style={styles.sectionTitle}>Emergency Services</Text>
                <View style={styles.emergencyGrid}>
                    {emergencyServices.map((service) => (
                        <TouchableOpacity
                            key={service.id}
                            style={[styles.emergencyCard, { backgroundColor: service.bg }]}
                            onPress={() => handleCall(service.number)}
                        >
                            <service.icon size={28} color={service.color} />
                            <Text style={styles.serviceLabel}>{service.label}</Text>
                            <Text style={[styles.serviceNumber, { color: service.color }]}>{service.number}</Text>
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Quick Issues */}
                <Text style={styles.sectionTitle}>What's the problem?</Text>
                <View style={styles.issuesGrid}>
                    {quickIssues.map((issue) => (
                        <TouchableOpacity
                            key={issue.id}
                            style={styles.issueCard}
                            onPress={() => handleIssuePress(issue)}
                        >
                            <View style={[styles.issueIcon, { backgroundColor: issue.color + '15' }]}>
                                <issue.icon size={24} color={issue.color} />
                            </View>
                            <Text style={styles.issueLabel}>{issue.label}</Text>
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Bottom Actions */}
                <View style={styles.actionSection}>
                    <TouchableOpacity
                        style={[styles.bigButton, { backgroundColor: COLORS.primary }]}
                        onPress={() => navigation.navigate('Mechanics')}
                    >
                        <Text style={styles.buttonText}>Find Nearby Mechanics</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.bigButton, { backgroundColor: '#5856D6', marginTop: 15 }]}
                        onPress={() => navigation.navigate('Towing')}
                    >
                        <Text style={styles.buttonText}>Request Towing</Text>
                    </TouchableOpacity>
                </View>

                {/* GUIDE MODAL */}
                <Modal
                    animationType="slide"
                    transparent={true}
                    visible={modalVisible}
                    onRequestClose={() => setModalVisible(false)}
                >
                    <View style={styles.modalContainer}>
                        <View style={styles.modalContent}>
                            <View style={styles.modalHeader}>
                                <Text style={styles.modalTitle}>
                                    {selectedIssue ? guides[selectedIssue.id]?.title : 'Guide'}
                                </Text>
                                <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.closeIcon}>
                                    <X size={24} color={COLORS.textLight} />
                                </TouchableOpacity>
                            </View>

                            {/* Vehicle Toggle */}
                            <View style={styles.toggleContainer}>
                                <TouchableOpacity
                                    style={[styles.toggleBtn, vehicleType === 'car' && styles.toggleBtnActive]}
                                    onPress={() => setVehicleType('car')}
                                >
                                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                                        <Car size={18} color={vehicleType === 'car' ? COLORS.white : COLORS.textLight} />
                                        <Text style={[styles.toggleText, vehicleType === 'car' && styles.toggleTextActive]}>Car</Text>
                                    </View>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[styles.toggleBtn, vehicleType === 'bike' && styles.toggleBtnActive]}
                                    onPress={() => setVehicleType('bike')}
                                >
                                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                                        <Text style={[styles.toggleText, vehicleType === 'bike' && styles.toggleTextActive]}>Bike</Text>
                                    </View>
                                </TouchableOpacity>
                            </View>

                            <ScrollView style={styles.stepsScroll}>
                                {selectedIssue && guides[selectedIssue.id] ? (
                                    guides[selectedIssue.id][vehicleType].map((step, index) => {
                                        // Determine styling based on step type
                                        let bg = '#F5F5F5';
                                        let iconColor = '#8E8E93';
                                        let Icon = Info;
                                        let borderColor = 'transparent';

                                        if (step.type === 'danger') {
                                            bg = '#FFF0F0';
                                            iconColor = '#FF3B30';
                                            Icon = AlertTriangle;
                                            borderColor = '#FFDCDC';
                                        } else if (step.type === 'warning') {
                                            bg = '#FFF9E6';
                                            iconColor = '#FF9500';
                                            Icon = ShieldAlert;
                                            borderColor = '#FFF0C2';
                                        } else if (step.type === 'success') {
                                            bg = '#E6F9EC';
                                            iconColor = '#34C759';
                                            Icon = CheckCircle; // Need to import CheckCircle
                                            borderColor = '#C2F0D1';
                                        } else if (step.type === 'action') {
                                            bg = '#F0F7FF';
                                            iconColor = '#007AFF';
                                            Icon = Wrench;
                                            borderColor = '#D6E9FF';
                                        }

                                        return (
                                            <View key={index} style={[styles.stepCard, { backgroundColor: bg, borderColor: borderColor }]}>
                                                <View style={styles.stepHeader}>
                                                    <View style={[styles.stepIconCtx, { backgroundColor: iconColor + '20' }]}>
                                                        <Icon size={18} color={iconColor} />
                                                    </View>
                                                    <Text style={[styles.stepTitle, { color: iconColor }]}>{step.title}</Text>
                                                </View>
                                                <Text style={styles.stepText}>{step.text}</Text>
                                                {step.why && (
                                                    <View style={styles.whyBox}>
                                                        <Info size={12} color={COLORS.textLight} />
                                                        <Text style={styles.whyText}>{step.why}</Text>
                                                    </View>
                                                )}
                                            </View>
                                        );
                                    })
                                ) : (
                                    <Text>No guide available.</Text>
                                )}
                            </ScrollView>

                            <View style={styles.modalFooter}>
                                <TouchableOpacity
                                    style={styles.findHelpBtn}
                                    onPress={() => {
                                        setModalVisible(false);
                                        navigation.navigate('Nearby', { filterIssue: selectedIssue });
                                    }}
                                >
                                    <Text style={styles.findHelpText}>Find Professional Help</Text>
                                    <ChevronRight size={20} color={COLORS.white} />
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </Modal>

            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    scrollContent: {
        padding: SPACING.lg,
        paddingBottom: 100, // Space for tab bar
    },
    header: {
        alignItems: 'center',
        marginBottom: SPACING.xl,
        marginTop: SPACING.md,
    },
    iconCircle: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: '#FFF0F0',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: SPACING.md,
        borderWidth: 1,
        borderColor: '#FFDCDC',
    },
    headerTitle: {
        fontSize: 28,
        fontWeight: '900',
        color: COLORS.text,
        marginBottom: 8,
    },
    headerSubtitle: {
        fontSize: 16,
        color: COLORS.textLight,
        textAlign: 'center',
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '800',
        color: COLORS.text,
        marginBottom: SPACING.md,
        marginLeft: 4,
    },
    emergencyGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        marginBottom: SPACING.xl,
        gap: 12,
    },
    emergencyCard: {
        width: '48%',
        padding: 16,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: 'rgba(0,0,0,0.03)',
        ...SHADOWS.small,
    },
    serviceLabel: {
        fontSize: 14,
        fontWeight: '700',
        color: COLORS.text,
        marginTop: 12,
        marginBottom: 4,
    },
    serviceNumber: {
        fontSize: 16,
        fontWeight: '900',
    },
    issuesGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        gap: 12,
        marginBottom: SPACING.xl,
    },
    issueCard: {
        width: '31%',
        aspectRatio: 1,
        backgroundColor: COLORS.surface,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 8,
        borderWidth: 1,
        borderColor: '#EEEEEE',
    },
    issueIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 8,
    },
    issueLabel: {
        fontSize: 12,
        fontWeight: '600',
        color: COLORS.text,
        textAlign: 'center',
    },
    actionSection: {
        marginTop: SPACING.md,
    },
    bigButton: {
        padding: 18,
        borderRadius: 16,
        alignItems: 'center',
        ...SHADOWS.medium,
    },
    buttonText: {
        color: COLORS.white,
        fontSize: 16,
        fontWeight: 'bold',
    },
    modalContainer: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: COLORS.white,
        borderTopLeftRadius: 30,
        borderTopRightRadius: 30,
        height: '75%',
        padding: SPACING.lg,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: SPACING.lg,
    },
    modalTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        color: COLORS.text,
    },
    closeIcon: {
        padding: 4,
    },
    toggleContainer: {
        flexDirection: 'row',
        backgroundColor: '#F0F0F0',
        borderRadius: 12,
        padding: 4,
        marginBottom: SPACING.lg,
    },
    toggleBtn: {
        flex: 1,
        paddingVertical: 10,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 10,
    },
    toggleBtnActive: {
        backgroundColor: COLORS.text,
        ...SHADOWS.small,
    },
    toggleText: {
        fontSize: 14,
        fontWeight: '600',
        color: COLORS.textLight,
    },
    toggleTextActive: {
        color: COLORS.white,
        fontWeight: 'bold',
    },
    stepsScroll: {
        flex: 1,
        marginBottom: SPACING.lg,
    },
    stepCard: {
        padding: 16,
        borderRadius: 16,
        marginBottom: 12,
        borderWidth: 1,
    },
    stepHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
        gap: 8,
    },
    stepIconCtx: {
        width: 28,
        height: 28,
        borderRadius: 14,
        alignItems: 'center',
        justifyContent: 'center',
    },
    stepTitle: {
        fontSize: 14,
        fontWeight: '800',
        letterSpacing: 0.5,
    },
    stepText: {
        fontSize: 16,
        color: COLORS.text,
        lineHeight: 22,
        fontWeight: '500',
    },
    whyBox: {
        marginTop: 8,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        backgroundColor: 'rgba(0,0,0,0.03)',
        padding: 8,
        borderRadius: 8,
    },
    whyText: {
        fontSize: 12,
        color: COLORS.textLight,
        fontStyle: 'italic',
        flex: 1,
    },
    modalFooter: {
        borderTopWidth: 1,
        borderTopColor: '#EEEEEE',
        paddingTop: SPACING.lg,
    },
    findHelpBtn: {
        backgroundColor: COLORS.primary,
        borderRadius: 16,
        paddingVertical: 16,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        ...SHADOWS.medium,
    },
    findHelpText: {
        color: COLORS.white,
        fontSize: 16,
        fontWeight: 'bold',
    },
});

export default CarStuckScreen;
