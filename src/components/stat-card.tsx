import type { LucideIcon } from 'lucide-react-native';
import { TrendingDown, TrendingUp } from 'lucide-react-native';
import { Text, View } from 'react-native';

type StatCardProps = {
  label: string;
  value: string;
  tone?: 'light' | 'dark';
  trend?: 'up' | 'down';
  icon?: LucideIcon;
};

export function StatCard({ label, value, tone = 'light', trend, icon: Icon }: StatCardProps) {
  const dark = tone === 'dark';
  const TrendIcon = trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : null;

  return (
    <View className={dark ? 'rounded-[24px] bg-[#1d5f55] p-4' : 'rounded-[24px] bg-[#fbf8f2] p-4'}>
      <View className="flex-row items-center justify-between gap-3">
        <Text className={dark ? 'text-xs uppercase tracking-[1.5px] text-[#d8efe7]' : 'text-xs uppercase tracking-[1.5px] text-[#7d7468]'}>
          {label}
        </Text>
        <View className="flex-row items-center gap-2">
          {TrendIcon ? <TrendIcon color={dark ? '#d8efe7' : '#7d7468'} size={14} /> : null}
          {Icon ? <Icon color={dark ? '#d8efe7' : '#7d7468'} size={14} /> : null}
        </View>
      </View>
      <Text className={dark ? 'mt-3 text-3xl font-bold text-white' : 'mt-3 text-3xl font-bold text-[#16181a]'}>
        {value}
      </Text>
    </View>
  );
}
