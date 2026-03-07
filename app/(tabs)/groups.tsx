import { useQuery } from '@tanstack/react-query';
import { FolderKanban, Layers3, Search } from 'lucide-react-native';
import { useMemo, useState } from 'react';
import { Text, TextInput, View } from 'react-native';

import { ListCard } from '@/src/components/list-card';
import { ScreenShell } from '@/src/components/screen-shell';
import { listGroups } from '@/src/services/admin';

export default function GroupsScreen() {
  const [search, setSearch] = useState('');
  const keyword = useMemo(() => search.trim(), [search]);

  const groupsQuery = useQuery({
    queryKey: ['groups', keyword],
    queryFn: () => listGroups(keyword),
  });

  const items = groupsQuery.data?.items ?? [];
  const errorMessage = groupsQuery.error instanceof Error ? groupsQuery.error.message : '';

  return (
    <ScreenShell title="分组管理" subtitle="分组决定调度、价格倍率和账号归属，是后台的核心配置之一。">
      <View className="flex-row items-center rounded-[24px] bg-[#fbf8f2] px-4 py-3">
        <Search color="#7d7468" size={18} />
        <TextInput
          value={search}
          onChangeText={setSearch}
          placeholder="搜索分组名称"
          placeholderTextColor="#9b9081"
          className="ml-3 flex-1 text-base text-[#16181a]"
        />
      </View>

      {items.length === 0 ? (
        <ListCard title="暂无分组" meta={errorMessage || '连上 Sub2API 后，这里会展示分组列表。'} icon={FolderKanban} />
      ) : (
        items.map((group) => (
          <ListCard
            key={group.id}
            title={group.name}
            meta={`${group.platform} · 倍率 ${group.rate_multiplier ?? 1} · ${group.subscription_type || 'standard'}`}
            badge={group.status || 'active'}
            icon={FolderKanban}
          >
            <View className="flex-row items-center gap-2">
              <Layers3 color="#7d7468" size={14} />
              <Text className="text-sm text-[#7d7468]">
                账号数 {group.account_count ?? 0} · {group.is_exclusive ? '独占分组' : '共享分组'}
              </Text>
            </View>
          </ListCard>
        ))
      )}
    </ScreenShell>
  );
}
