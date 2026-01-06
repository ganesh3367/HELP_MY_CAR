import { MapPin } from 'lucide-react-native';
import { SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';
import Button from '../components/Button';
import SOSButton from '../components/SOSButton';
import { COLORS, SPACING } from '../constants/theme';
import { useLocation } from '../context/LocationContext';

const HomeScreen = ({ navigation }) => {
    const { location, loading } = useLocation();

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.scroll}>
                <View style={styles.header}>
                    <Text style={styles.greeting}>Hello, Ganesh!</Text>
                    <Text style={styles.subGreeting}>Need assistance?</Text>
                </View>

                <View style={styles.locationCard}>
                    <MapPin size={20} color={COLORS.primary} />
                    <Text style={styles.locationText}>
                        {loading ? 'Detecting your location...' : 'Pune, Maharashtra'}
                    </Text>
                </View>

                <View style={styles.buttonContainer}>
                    <Button
                        title="Find Mechanic"
                        onPress={() => navigation.navigate('Mechanics')}
                        style={styles.bigButton}
                        textStyle={styles.bigButtonText}
                    />
                    <Button
                        title="Call Towing"
                        variant="secondary"
                        onPress={() => navigation.navigate('Towing')}
                        style={styles.bigButton}
                        textStyle={styles.bigButtonText}
                    />
                </View>
            </ScrollView>
            <SOSButton onPress={() => console.log('SOS Pressed')} />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    scroll: {
        padding: SPACING.lg,
    },
    header: {
        marginVertical: SPACING.xl,
    },
    greeting: {
        fontSize: 28,
        fontWeight: 'bold',
        color: COLORS.text,
    },
    subGreeting: {
        fontSize: 16,
        color: COLORS.textLight,
    },
    locationCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.surface,
        padding: SPACING.md,
        borderRadius: 12,
        marginBottom: SPACING.xl,
    },
    locationText: {
        marginLeft: 8,
        fontSize: 14,
        color: COLORS.text,
    },
    buttonContainer: {
        gap: SPACING.md,
    },
    bigButton: {
        height: 120,
        justifyContent: 'center',
    },
    bigButtonText: {
        fontSize: 20,
    },
});

export default HomeScreen;
