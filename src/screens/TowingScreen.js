import { FlatList, SafeAreaView, StyleSheet, Text, View } from 'react-native';
import ServiceCard from '../components/ServiceCard';
import { COLORS, SPACING } from '../constants/theme';
import { useAppContext } from '../context/AppContext';

const TowingScreen = () => {
    const { towingServices } = useAppContext();

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Towing Services</Text>
            </View>
            <FlatList
                data={towingServices}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                    <ServiceCard
                        title={item.type}
                        distance={item.availability}
                        cost={item.costPerKm}
                        phone={item.phone}
                        type="towing"
                    />
                )}
                contentContainerStyle={styles.list}
                showsVerticalScrollIndicator={false}
            />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    header: {
        paddingHorizontal: SPACING.lg,
        paddingVertical: SPACING.md,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: COLORS.text,
    },
    list: {
        paddingHorizontal: SPACING.lg,
        paddingBottom: SPACING.xl,
    },
});

export default TowingScreen;
