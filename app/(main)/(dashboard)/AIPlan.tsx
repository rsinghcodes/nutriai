import { colors, fontSizes, spacing } from '@/theme';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

export default function AIPlan() {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <MaterialCommunityIcons
            name="arrow-left"
            size={24}
            color={colors.text}
          />
        </TouchableOpacity>
        <Text style={styles.title}>AI Plans</Text>
        <View style={styles.headerSpacer} />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: spacing.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  title: {
    fontSize: fontSizes.xl,
    fontWeight: '700',
    color: colors.text,
  },
  backButton: {
    marginRight: spacing.sm,
  },
  headerSpacer: {
    width: 40,
  },
});
