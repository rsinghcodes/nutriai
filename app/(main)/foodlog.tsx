import client from '@/api/client';
import { colors, fontSizes, spacing } from '@/theme';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SvgXml } from 'react-native-svg';

const emptyFoodSvg = `
<svg fill="#000000" height="800px" width="800px" version="1.1" id="Capa_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" 
	 viewBox="0 0 199.603 199.603" xml:space="preserve">
<path d="M187.251,173.172c-4.141,0-7.509-3.369-7.509-7.509V32.074c0-1.952,1.569-5.644,7.509-5.644
	c9.424,0,12.352,33.462,12.352,45.651c0,18.908-4.182,36.269-4.843,38.893v54.688C194.76,169.803,191.392,173.172,187.251,173.172z
	 M184.742,113.161v52.502c0,1.383,1.125,2.509,2.509,2.509s2.509-1.125,2.509-2.509v-52.502H184.742z M184.742,108.161h5.548
	c1.187-5.159,4.313-20.256,4.313-36.079c0-20.876-4.906-38.858-7.546-40.649c-1.542,0.033-2.218,0.461-2.314,0.771V108.161z
	 M16.632,173.172c-1.87,0-3.67-0.734-4.938-2.014c-1.165-1.177-1.799-2.711-1.783-4.318l0.806-81.785
	C4.583,82.688,0.142,76.768,0.001,69.852C-0.001,69.79,0,69.727,0.003,69.664L1.718,31.96c0.063-1.378,1.259-2.421,2.61-2.384
	c1.38,0.063,2.447,1.232,2.384,2.611l-1.596,35.09h4.361l0.802-35.26c0.031-1.381,1.208-2.48,2.556-2.443
	c1.381,0.032,2.474,1.176,2.442,2.556L14.48,67.278h4.306l-0.799-35.147c-0.031-1.38,1.062-2.524,2.442-2.556
	c1.358-0.042,2.525,1.062,2.556,2.443l0.802,35.26h4.361l-1.595-35.09c-0.063-1.379,1.004-2.548,2.384-2.611
	c1.367-0.052,2.549,1.005,2.61,2.384l1.714,37.703c0.003,0.063,0.004,0.126,0.002,0.188c-0.141,6.915-4.582,12.836-10.716,15.203
	l0.807,81.785c0.016,1.607-0.618,3.141-1.783,4.318C20.302,172.438,18.502,173.172,16.632,173.172z M15.706,86.156l-0.795,80.732
	c-0.003,0.337,0.181,0.595,0.336,0.751c0.67,0.677,2.099,0.676,2.771,0c0.155-0.157,0.339-0.415,0.336-0.751l-0.796-80.732H15.706z
	 M5.333,72.278c1.256,5.078,5.878,8.878,11.299,8.878c5.422,0,10.044-3.8,11.299-8.878h-6.587c0,0-0.003,0-0.005,0h-9.414
	c-0.001,0-0.001,0-0.002,0c0,0-0.001,0-0.002,0H5.333z M102.781,163.258c-36.692,0-66.544-29.852-66.544-66.544
	s29.852-66.544,66.544-66.544c36.693,0,66.545,29.852,66.545,66.544S139.475,163.258,102.781,163.258z M102.781,35.169
	c-33.936,0-61.544,27.609-61.544,61.544s27.608,61.544,61.544,61.544s61.545-27.609,61.545-61.544S136.717,35.169,102.781,35.169z
	 M102.781,145.155c-26.711,0-48.441-21.731-48.441-48.441s21.73-48.441,48.441-48.441s48.441,21.731,48.441,48.441
	S129.492,145.155,102.781,145.155z M102.781,53.272c-23.954,0-43.441,19.488-43.441,43.441s19.487,43.441,43.441,43.441
	s43.441-19.488,43.441-43.441S126.735,53.272,102.781,53.272z"/>
</svg>
`;

export default function FoodLog() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const res = await client.get('/food-logs');
        setLogs(res.data || []);
      } catch (e) {
        console.log('Error fetching food logs', e);
      } finally {
        setLoading(false);
      }
    };
    fetchLogs();
  }, []);

  if (loading) {
    return (
      <View style={styles.center}>
        <Text style={styles.text}>Loading your food logs...</Text>
      </View>
    );
  }

  const renderItem = ({ item }: any) => (
    <View style={styles.card}>
      <MaterialCommunityIcons
        name="food-apple"
        size={28}
        color={colors.primary}
      />
      <View style={{ flex: 1, marginLeft: spacing.md }}>
        <Text style={styles.foodName}>{item.food_name}</Text>
        <Text style={styles.foodMeta}>
          {item.quantity} {item.unit} • {item.calories} kcal
        </Text>
      </View>
      <Text style={styles.date}>
        {new Date(item.logged_at).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
        })}
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Food Log</Text>
      {!logs || logs.length === 0 ? (
        <View style={styles.emptyState}>
          <SvgXml xml={emptyFoodSvg} width={150} height={150} />
          <Text style={styles.quote}>
            “Every small meal logged is a step towards your big goal. Start now
            🍎”
          </Text>
        </View>
      ) : (
        <FlatList
          data={logs}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
          contentContainerStyle={{ paddingBottom: spacing.lg }}
        />
      )}
      <TouchableOpacity style={styles.addButton}>
        <MaterialCommunityIcons name="plus" size={28} color={colors.card} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  text: { fontSize: fontSizes.md, color: colors.muted },

  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: spacing.md,
  },
  title: {
    fontSize: fontSizes.xl,
    fontWeight: '700',
    marginBottom: spacing.md,
    color: colors.text,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    padding: spacing.md,
    marginVertical: spacing.sm,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 5,
  },
  foodName: {
    fontSize: fontSizes.md,
    fontWeight: '600',
    color: colors.text,
  },
  foodMeta: {
    fontSize: fontSizes.sm,
    color: colors.muted,
    marginTop: spacing.xs,
  },
  date: {
    fontSize: fontSizes.sm,
    color: colors.muted,
  },
  addButton: {
    position: 'absolute',
    right: spacing.lg,
    bottom: spacing.lg,
    backgroundColor: colors.primary,
    borderRadius: 50,
    width: 56,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
    backgroundColor: colors.background,
  },
  quote: {
    marginTop: spacing.md,
    fontSize: fontSizes.md,
    textAlign: 'center',
    color: colors.muted,
    fontStyle: 'italic',
  },
});
