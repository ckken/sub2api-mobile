import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { KeyRound, Search, ShieldCheck, ShieldOff } from 'lucide-react-native';
import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';

import { ListCard } from '@/src/components/list-card';
import { ScreenShell } from '@/src/components/screen-shell';
import { listAccounts, setAccountSchedulable, testAccount } from '@/src/services/admin';

export default function AccountsScreen() {
  const [search, setSearch] = useState('');
  const keyword = useMemo(() => search.trim(), [search]);
  const queryClient = useQueryClient();

  const accountsQuery = useQuery({
    queryKey: ['accounts', keyword],
    queryFn: () => listAccounts(keyword),
  });

  const toggleMutation = useMutation({
    mutationFn: ({ accountId, schedulable }: { accountId: number; schedulable: boolean }) =>
      setAccountSchedulable(accountId, schedulable),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['accounts'] }),
  });

  const items = accountsQuery.data?.items ?? [];
  const errorMessage = accountsQuery.error instanceof Error ? accountsQuery.error.message : '';

  return (
    <ScreenShell title="API 密钥" subtitle="管理您的 API 密钥和访问令牌">
      <View className="flex-row items-center rounded-[24px] bg-[#fbf8f2] px-4 py-3">
        <Search color="#7d7468" size={18} />
        <TextInput
          value={search}
          onChangeText={setSearch}
          placeholder="搜索 key 名称"
          placeholderTextColor="#9b9081"
          className="ml-3 flex-1 text-base text-[#16181a]"
        />
      </View>

      {items.length === 0 ? (
        <ListCard title="暂无 Key" meta={errorMessage || '连上后这里会展示 key 列表。'} icon={KeyRound} />
      ) : (
        items.map((account) => (
          <Pressable key={account.id} onPress={() => router.push(`/accounts/${account.id}`)}>
            <ListCard
              title={account.name}
              meta={`${account.platform} · ${account.type} · 优先级 ${account.priority ?? 0}`}
              badge={account.status || 'unknown'}
              icon={KeyRound}
            >
              <View className="flex-row items-center justify-between">
                <View className="flex-row items-center gap-2">
                  {account.schedulable ? <ShieldCheck color="#7d7468" size={14} /> : <ShieldOff color="#7d7468" size={14} />}
                  <Text className="text-sm text-[#7d7468]">{account.schedulable ? '可调度' : '暂停调度'}</Text>
                </View>
                <View className="flex-row gap-2">
                  <Pressable
                    className="rounded-full bg-[#1b1d1f] px-4 py-2"
                    onPress={(event) => {
                      event.stopPropagation();
                      testAccount(account.id).catch(() => undefined);
                    }}
                  >
                    <Text className="text-xs font-semibold uppercase tracking-[1.2px] text-[#f6f1e8]">测试</Text>
                  </Pressable>
                  <Pressable
                    className="rounded-full bg-[#e7dfcf] px-4 py-2"
                    onPress={(event) => {
                      event.stopPropagation();
                      toggleMutation.mutate({
                        accountId: account.id,
                        schedulable: !account.schedulable,
                      });
                    }}
                  >
                    <Text className="text-xs font-semibold uppercase tracking-[1.2px] text-[#4e463e]">切换</Text>
                  </Pressable>
                </View>
              </View>
            </ListCard>
          </Pressable>
        ))
      )}
    </ScreenShell>
  );
}
