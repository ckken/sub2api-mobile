import { Text, View } from 'react-native';

type DetailRowProps = {
  label: string;
  value: string;
};

export function DetailRow({ label, value }: DetailRowProps) {
  return (
    <View className="flex-row items-start justify-between gap-4 border-b border-[#eee6d7] py-3 last:border-b-0">
      <Text className="text-sm text-[#7d7468]">{label}</Text>
      <Text className="max-w-[62%] text-right text-sm font-medium text-[#16181a]">{value}</Text>
    </View>
  );
}
