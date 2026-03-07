import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { zodResolver } from '@hookform/resolvers/zod';
import * as Clipboard from 'expo-clipboard';
import { ArrowLeftRight, ChevronLeft, Copy, Eye, EyeOff, KeyRound, Search, Wallet } from 'lucide-react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Pressable, Text, TextInput, View } from 'react-native';
import { z } from 'zod';

import { DetailRow } from '@/src/components/detail-row';
import { ListCard } from '@/src/components/list-card';
import { ScreenShell } from '@/src/components/screen-shell';
import { getUser, getUserUsage, listUserApiKeys, updateUserBalance } from '@/src/services/admin';
import type { BalanceOperation } from '@/src/types/admin';

const schema = z.object({
  amount: z.string().min(1, '请输入金额'),
  notes: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

export default function UserDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const userId = Number(id);
  const queryClient = useQueryClient();
  const [operation, setOperation] = useState<BalanceOperation>('add');
  const [keySearch, setKeySearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [visibleKeys, setVisibleKeys] = useState<Record<number, boolean>>({});
  const [copiedKeyId, setCopiedKeyId] = useState<number | null>(null);
  const { control, handleSubmit, reset, formState } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      amount: '10',
      notes: '',
    },
  });

  const userQuery = useQuery({
    queryKey: ['user', userId],
    queryFn: () => getUser(userId),
    enabled: Number.isFinite(userId),
  });

  const usageQuery = useQuery({
    queryKey: ['user-usage', userId],
    queryFn: () => getUserUsage(userId),
    enabled: Number.isFinite(userId),
  });

  const apiKeysQuery = useQuery({
    queryKey: ['user-api-keys', userId],
    queryFn: () => listUserApiKeys(userId),
    enabled: Number.isFinite(userId),
  });

  const balanceMutation = useMutation({
    mutationFn: (values: FormValues & { operation: BalanceOperation }) =>
      updateUserBalance(userId, {
        balance: Number(values.amount),
        operation: values.operation,
        notes: values.notes,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user', userId] });
      queryClient.invalidateQueries({ queryKey: ['users'] });
      reset({ amount: '10', notes: '' });
    },
  });

  const user = userQuery.data;
  const usage = usageQuery.data;
  const apiKeys = apiKeysQuery.data?.items ?? [];
  const filteredApiKeys = apiKeys.filter((item) => {
    const matchesStatus = statusFilter === 'all' ? true : item.status === statusFilter;
    const keyword = keySearch.trim().toLowerCase();
    const matchesSearch = !keyword
      ? true
      : [item.name, item.key, item.group?.name]
          .filter(Boolean)
          .join(' ')
          .toLowerCase()
          .includes(keyword);

    return matchesStatus && matchesSearch;
  });

  function maskKey(value: string) {
    if (!value || value.length < 16) {
      return value;
    }

    return `${value.slice(0, 8)}••••••${value.slice(-8)}`;
  }

  async function copyKey(keyId: number, value: string) {
    await Clipboard.setStringAsync(value);
    setCopiedKeyId(keyId);
    setTimeout(() => setCopiedKeyId((current) => (current === keyId ? null : current)), 1600);
  }

  return (
    <ScreenShell
      title={user?.username || user?.email || '用户详情'}
      subtitle="核心看余额和 token 用量，其他内容尽量保持轻量。"
      right={
        <Pressable className="h-11 w-11 items-center justify-center rounded-full bg-[#2d3134]" onPress={() => router.back()}>
          <ChevronLeft color="#f6f1e8" size={18} />
        </Pressable>
      }
    >
      <ListCard title="基本信息" meta={user?.email} badge={user?.status || 'loading'} icon={Wallet}>
        <DetailRow label="角色" value={user?.role || '--'} />
        <DetailRow label="余额" value={Number(user?.balance ?? 0).toFixed(2)} />
        <DetailRow label="并发" value={`${user?.concurrency ?? 0}`} />
        <DetailRow label="更新时间" value={user?.updated_at || '--'} />
      </ListCard>

      <ListCard title="月度用量" meta="真实数据来自 /users/:id/usage" icon={ArrowLeftRight}>
        <DetailRow label="Token" value={`${Number(usage?.tokens ?? usage?.total_tokens ?? 0)}`} />
        <DetailRow label="请求数" value={`${Number(usage?.requests ?? usage?.total_requests ?? 0)}`} />
        <DetailRow label="成本" value={`$${Number(usage?.cost ?? usage?.total_cost ?? 0).toFixed(4)}`} />
      </ListCard>

      <ListCard title="API 密钥" meta="直接聚合管理员 /users/:id/api-keys" icon={KeyRound}>
        <View className="gap-3">
          <View className="flex-row items-center rounded-[18px] bg-[#f1ece2] px-4 py-3">
            <Search color="#7d7468" size={16} />
            <TextInput
              value={keySearch}
              onChangeText={setKeySearch}
              placeholder="搜索 key 名称或分组"
              placeholderTextColor="#9b9081"
              className="ml-3 flex-1 text-sm text-[#16181a]"
            />
          </View>
          <View className="flex-row gap-2">
            {(['all', 'active', 'inactive'] as const).map((item) => (
              <Pressable
                key={item}
                className={statusFilter === item ? 'flex-1 rounded-[16px] bg-[#1d5f55] px-3 py-3' : 'flex-1 rounded-[16px] bg-[#e7dfcf] px-3 py-3'}
                onPress={() => setStatusFilter(item)}
              >
                <Text className={statusFilter === item ? 'text-center text-sm font-semibold text-white' : 'text-center text-sm font-semibold text-[#4e463e]'}>
                  {item === 'all' ? '全部' : item === 'active' ? '启用' : '停用'}
                </Text>
              </Pressable>
            ))}
          </View>
          {filteredApiKeys.map((item) => (
            <View key={item.id} className="rounded-[18px] bg-[#f1ece2] px-4 py-3">
              <View className="flex-row items-center justify-between gap-3">
                <Text className="flex-1 text-sm font-semibold text-[#16181a]">{item.name}</Text>
                <Text className="text-xs uppercase tracking-[1.2px] text-[#7d7468]">{item.status}</Text>
              </View>
              <View className="mt-2 flex-row items-center gap-2">
                <Text className="flex-1 text-xs text-[#7d7468]">{visibleKeys[item.id] ? item.key : maskKey(item.key)}</Text>
                <Pressable
                  className="rounded-full bg-[#e7dfcf] p-2"
                  onPress={() => setVisibleKeys((current) => ({ ...current, [item.id]: !current[item.id] }))}
                >
                  {visibleKeys[item.id] ? <EyeOff color="#4e463e" size={14} /> : <Eye color="#4e463e" size={14} />}
                </Pressable>
                <Pressable className="rounded-full bg-[#1b1d1f] p-2" onPress={() => copyKey(item.id, item.key)}>
                  <Copy color="#f6f1e8" size={14} />
                </Pressable>
              </View>
              <Text className="mt-2 text-xs text-[#7d7468]">
                {copiedKeyId === item.id ? '已复制到剪贴板' : `最近使用 ${item.last_used_at || '--'}`}
              </Text>
              <Text className="mt-2 text-xs text-[#7d7468]">
                已用 ${Number(item.quota_used ?? 0).toFixed(2)} / 配额 {item.quota ? `$${Number(item.quota).toFixed(2)}` : '无限制'}
              </Text>
              <Text className="mt-1 text-xs text-[#7d7468]">
                分组 {item.group?.name || '未绑定'} · 5h 用量 {Number(item.usage_5h ?? 0).toFixed(2)}
              </Text>
            </View>
          ))}
          {filteredApiKeys.length === 0 ? <Text className="text-sm text-[#7d7468]">当前筛选条件下没有 API 密钥。</Text> : null}
        </View>
      </ListCard>

      <ListCard title="余额调整" meta="默认执行增加余额，可继续扩成减余额和设定值。" icon={Wallet}>
        <View className="gap-3">
          <Controller
            control={control}
            name="amount"
            render={({ field: { onChange, value } }) => (
              <TextInput
                value={value}
                onChangeText={onChange}
                keyboardType="decimal-pad"
                placeholder="输入金额"
                placeholderTextColor="#9b9081"
                className="rounded-[18px] bg-[#f1ece2] px-4 py-4 text-base text-[#16181a]"
              />
            )}
          />
          <View className="flex-row gap-2">
            {(['add', 'subtract', 'set'] as BalanceOperation[]).map((item) => (
              <Pressable
                key={item}
                className={operation === item ? 'flex-1 rounded-[16px] bg-[#1d5f55] px-3 py-3' : 'flex-1 rounded-[16px] bg-[#e7dfcf] px-3 py-3'}
                onPress={() => setOperation(item)}
              >
                <Text className={operation === item ? 'text-center text-sm font-semibold text-white' : 'text-center text-sm font-semibold text-[#4e463e]'}>
                  {item === 'add' ? '增加' : item === 'subtract' ? '扣减' : '设为'}
                </Text>
              </Pressable>
            ))}
          </View>
          <Controller
            control={control}
            name="notes"
            render={({ field: { onChange, value } }) => (
              <TextInput
                value={value}
                onChangeText={onChange}
                placeholder="备注，可留空"
                placeholderTextColor="#9b9081"
                className="rounded-[18px] bg-[#f1ece2] px-4 py-4 text-base text-[#16181a]"
              />
            )}
          />
          {formState.errors.amount ? <Text className="text-sm text-[#c25d35]">{formState.errors.amount.message}</Text> : null}
          <Pressable
            className="rounded-[18px] bg-[#1d5f55] px-4 py-4"
            onPress={handleSubmit((values) => balanceMutation.mutate({ ...values, operation }))}
          >
            <Text className="text-center text-sm font-semibold tracking-[1.2px] text-white">
              {balanceMutation.isPending ? '提交中...' : operation === 'add' ? '增加余额' : operation === 'subtract' ? '扣减余额' : '设置余额'}
            </Text>
          </Pressable>
        </View>
      </ListCard>
    </ScreenShell>
  );
}
