import { zodResolver } from '@hookform/resolvers/zod';
import { Globe, KeyRound } from 'lucide-react-native';
import { Controller, useForm } from 'react-hook-form';
import { Pressable, Text, TextInput, View } from 'react-native';
import { z } from 'zod';

import { ListCard } from '@/src/components/list-card';
import { ScreenShell } from '@/src/components/screen-shell';
import { adminConfigState, saveAdminConfig } from '@/src/store/admin-config';

const { useSnapshot } = require('valtio/react');

const schema = z.object({
  baseUrl: z.string().min(1, '请输入 Host'),
  adminApiKey: z.string().min(1, '请输入 Admin Token'),
});

type FormValues = z.infer<typeof schema>;

export default function LoginScreen() {
  const config = useSnapshot(adminConfigState);
  const { control, handleSubmit, formState } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      baseUrl: config.baseUrl,
      adminApiKey: config.adminApiKey,
    },
  });

  return (
    <ScreenShell title="登录" subtitle="输入 host 和 adminToken 后开始管理。">
      <ListCard title="Host" meta="当前站点或管理代理地址" icon={Globe}>
        <Controller
          control={control}
          name="baseUrl"
          render={({ field: { onChange, value } }) => (
            <TextInput
              value={value}
              onChangeText={onChange}
              placeholder="http://localhost:8787"
              placeholderTextColor="#9b9081"
              autoCapitalize="none"
              className="rounded-[18px] bg-[#f1ece2] px-4 py-4 text-base text-[#16181a]"
            />
          )}
        />
      </ListCard>

      <ListCard title="Admin Token" meta="管理员 token" icon={KeyRound}>
        <Controller
          control={control}
          name="adminApiKey"
          render={({ field: { onChange, value } }) => (
            <TextInput
              value={value}
              onChangeText={onChange}
              placeholder="admin-xxxxxxxx"
              placeholderTextColor="#9b9081"
              autoCapitalize="none"
              className="rounded-[18px] bg-[#f1ece2] px-4 py-4 text-base text-[#16181a]"
            />
          )}
        />
      </ListCard>

      {(formState.errors.baseUrl || formState.errors.adminApiKey) ? (
        <View className="rounded-[20px] bg-[#fbf1eb] px-4 py-3">
          <Text className="text-sm text-[#c25d35]">{formState.errors.baseUrl?.message || formState.errors.adminApiKey?.message}</Text>
        </View>
      ) : null}

      <Pressable
        className="rounded-[20px] bg-[#1d5f55] px-4 py-4"
        onPress={handleSubmit(async (values) => {
          await saveAdminConfig(values);
        })}
      >
        <Text className="text-center text-sm font-semibold tracking-[1.2px] text-white">
          {config.saving ? '登录中...' : '进入管理台'}
        </Text>
      </Pressable>
    </ScreenShell>
  );
}
