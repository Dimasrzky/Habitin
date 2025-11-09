import { Ionicons } from '@expo/vector-icons'
import { StyleSheet, Text, View } from 'react-native'

export default function HealthScreen() {
    return (
        <View style={styles.container}>
            <Ionicons name="medkit-outline" size={64} color="#ABE7B2" />
            <Text style={styles.title}>Check Health</Text>
            <Text style={styles.subtitle}>Coming Soon</Text>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
    },
    title: {
        fontSize: 24,
        fontWeight: '700',
        color: '#000000',
        marginTop: 16,
    },
    subtitle: {
        fontSize: 14,
        color: '#6B7280',
        marginTop: 8,
    },
})