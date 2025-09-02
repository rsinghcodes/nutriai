import { Dimensions, View } from 'react-native';
import { LineChart } from 'react-native-chart-kit';

const screenWidth = Dimensions.get('window').width;

const chartConfig = {
  backgroundGradientFrom: '#fff',
  backgroundGradientTo: '#fff',
  decimalPlaces: 0,
  color: (opacity = 1) => `rgba(0, 122, 255, ${opacity})`,
  labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
  propsForDots: {
    r: '4',
    strokeWidth: '2',
    stroke: '#007AFF',
  },
};

export default function WorkoutSummaryChart({ summary }) {
  // If no data, prepare flat line dataset
  const daily = summary?.daily?.length
    ? summary.daily
    : Array.from({ length: summary?.days || 7 }, (_, i) => ({
        date: `Day ${i + 1}`,
        calories: 0,
      }));

  const labels = daily.map((d) =>
    typeof d.date === 'string'
      ? d.date
      : new Date(d.date).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
        })
  );

  const data = {
    labels,
    datasets: [
      {
        data: daily.map((d) => d.calories),
        color: (opacity = 1) => `rgba(0, 122, 255, ${opacity})`, // line color
        strokeWidth: 2,
      },
    ],
  };

  return (
    <View>
      <LineChart
        data={data}
        width={screenWidth - 32}
        height={220}
        chartConfig={chartConfig}
        bezier
        style={{
          marginVertical: 8,
          borderRadius: 16,
        }}
      />
    </View>
  );
}
