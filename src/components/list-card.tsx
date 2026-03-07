import type { LucideIcon } from 'lucide-react-native';
import type { ReactNode } from 'react';
import { Text, View } from 'react-native';

type ListCardProps = {
  title: string;
  meta?: string;
  badge?: string;
  children?: ReactNode;
  icon?: LucideIcon;
};

export function ListCard({ title, meta, badge, children, icon: Icon }: ListCardProps) {
  return (
    <View className="rounded-[24px] bg-[#fbf8f2] p-4">
      <View className="flex-row items-start justify-between gap-3">
        <View className="flex-1">
          <View className="flex-row items-center gap-2">
            {Icon ? <Icon color="#7d7468" size={16} /> : null}
            <Text className="text-lg font-semibold text-[#16181a]">{title}</Text>
          </View>
          {meta ? <Text className="mt-1 text-sm text-[#7d7468]">{meta}</Text> : null}
        </View>
        {badge ? (
          <View className="rounded-full bg-[#e7dfcf] px-3 py-1">
            <Text className="text-xs font-semibold uppercase tracking-[1.2px] text-[#5d564d]">{badge}</Text>
          </View>
        ) : null}
      </View>
      {children ? <View className="mt-4">{children}</View> : null}
    </View>
  );
}
