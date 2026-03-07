import type { PropsWithChildren, ReactNode } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ScrollView, Text, View } from 'react-native';

type ScreenShellProps = PropsWithChildren<{
  title: string;
  subtitle: string;
  right?: ReactNode;
}>;

export function ScreenShell({ title, subtitle, right, children }: ScreenShellProps) {
  return (
    <SafeAreaView className="flex-1 bg-[#f4efe4]">
      <ScrollView className="flex-1" contentContainerClassName="px-5 pb-24">
        <View className="mt-4 rounded-[24px] border border-[#e6dece] bg-[#fbf8f2] px-4 py-4">
          <View className="flex-row items-start justify-between gap-4">
            <View className="flex-1">
              <Text className="text-[24px] font-bold tracking-tight text-[#16181a]">{title}</Text>
              <Text className="mt-1 text-sm leading-6 text-[#7d7468]">{subtitle}</Text>
            </View>
            {right}
          </View>
        </View>
        <View className="mt-4 gap-4">{children}</View>
      </ScrollView>
    </SafeAreaView>
  );
}
