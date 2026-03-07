import { Text, View } from 'react-native';
import Svg, { Defs, LinearGradient, Path, Stop } from 'react-native-svg';

type Point = {
  label: string;
  value: number;
};

type LineTrendChartProps = {
  points: Point[];
  color?: string;
  title: string;
  subtitle: string;
  formatValue?: (value: number) => string;
};

export function LineTrendChart({
  points,
  color = '#1d5f55',
  title,
  subtitle,
  formatValue = (value) => `${value}`,
}: LineTrendChartProps) {
  const width = 320;
  const height = 160;
  const maxValue = Math.max(...points.map((point) => point.value), 1);
  const minValue = Math.min(...points.map((point) => point.value), 0);
  const range = Math.max(maxValue - minValue, 1);

  const line = points
    .map((point, index) => {
      const x = (index / Math.max(points.length - 1, 1)) * width;
      const y = height - ((point.value - minValue) / range) * (height - 18) - 12;

      return `${index === 0 ? 'M' : 'L'} ${x} ${y}`;
    })
    .join(' ');

  const area = `${line} L ${width} ${height} L 0 ${height} Z`;
  const latest = points[points.length - 1]?.value ?? 0;

  return (
    <View className="rounded-[28px] bg-[#fbf8f2] p-5">
      <Text className="text-xs uppercase tracking-[1.6px] text-[#7d7468]">{title}</Text>
      <Text className="mt-2 text-3xl font-bold text-[#16181a]">{formatValue(latest)}</Text>
      <Text className="mt-1 text-sm text-[#7d7468]">{subtitle}</Text>

      <View className="mt-5 overflow-hidden rounded-[20px] bg-[#f4efe4] p-3">
        <Svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`}>
          <Defs>
            <LinearGradient id="trendFill" x1="0" x2="0" y1="0" y2="1">
              <Stop offset="0%" stopColor={color} stopOpacity="0.28" />
              <Stop offset="100%" stopColor={color} stopOpacity="0.02" />
            </LinearGradient>
          </Defs>
          <Path d={area} fill="url(#trendFill)" />
          <Path d={line} fill="none" stroke={color} strokeWidth="3" strokeLinejoin="round" strokeLinecap="round" />
        </Svg>

        <View className="mt-3 flex-row justify-between">
          {points.map((point) => (
            <Text key={point.label} className="text-xs text-[#7d7468]">
              {point.label}
            </Text>
          ))}
        </View>
      </View>
    </View>
  );
}
