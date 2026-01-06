import { FlatList, SafeAreaView, StyleSheet, Text, View } from 'react-native';
import ServiceCard from '../components/ServiceCard';
import { COLORS, SPACING } from '../constants/theme';
import { useAppContext } from '../context/AppContext';

const MechanicsScreen = () => {
    const { mechanics } = useAppContext();

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Nearby Mechanics</Text>
            </View>
            <FlatList
                data={mechanics}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                    <ServiceCard
                        title={item.name}
                        distance={item.distance}
                        rating={item.rating}
                        cost={item.estimatedCost}
                        phone={item.phone}
                        lat={item.lat}
                        lng={item.lng}
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

export default MechanicsScreen;
