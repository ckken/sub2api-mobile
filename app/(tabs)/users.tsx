import { useQuery } from '@tanstack/react-query';
import { Activity, Search, UserRound } from 'lucide-react-native';
import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';

import { ListCard } from '@/src/components/list-card';
import { ScreenShell } from '@/src/components/screen-shell';
import { listUsers } from '@/src/services/admin';

export default function UsersScreen() {
  const [search, setSearch] = useState('');
  const keyword = useMemo(() => search.trim(), [search]);

  const usersQuery = useQuery({
    queryKey: ['users', keyword],
    queryFn: () => listUsers(keyword),
  });

  const items = usersQuery.data?.items ?? [];
  const errorMessage = usersQuery.error instanceof Error ? usersQuery.error.message : '';

  return (
    <ScreenShell title="用户管理" subtitle="搜索用户、查看详情，并在详情页里做余额调整。">
      <View className="flex-row items-center rounded-[24px] bg-[#fbf8f2] px-4 py-3">
        <Search color="#7d7468" size={18} />
        <TextInput
          value={search}
          onChangeText={setSearch}
          placeholder="搜索邮箱或用户名"
          placeholderTextColor="#9b9081"
          className="ml-3 flex-1 text-base text-[#16181a]"
        />
      </View>

      {items.length === 0 ? (
        <ListCard title="暂无数据" meta={errorMessage || '配置好后台连接后，这里会展示管理员用户列表。'} icon={UserRound} />
      ) : (
        items.map((user) => (
          <Pressable key={user.id} onPress={() => router.push(`/users/${user.id}`)}>
            <ListCard
              title={user.username || user.email}
              meta={`${user.email} · 余额 ${Number(user.balance ?? 0).toFixed(2)} · 并发 ${user.concurrency ?? 0}`}
              badge={user.status || 'active'}
              icon={UserRound}
            >
              <View className="flex-row items-center gap-2">
                <Activity color="#7d7468" size={14} />
                <Text className="text-sm text-[#7d7468]">当前并发 {user.current_concurrency ?? 0}</Text>
              </View>
            </ListCard>
          </Pressable>
        ))
      )}
    </ScreenShell>
  );
}
