import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ChevronLeft, ShieldCheck, TestTubeDiagonal } from 'lucide-react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Pressable, Text, View } from 'react-native';

import { DetailRow } from '@/src/components/detail-row';
import { LineTrendChart } from '@/src/components/line-trend-chart';
import { ListCard } from '@/src/components/list-card';
import { ScreenShell } from '@/src/components/screen-shell';
import { getAccount, getAccountTodayStats, getDashboardTrend, refreshAccount, setAccountSchedulable, testAccount } from '@/src/services/admin';

function getDateRange() {
  const end = new Date();
  const start = new Date();
  start.setDate(end.getDate() - 6);

  const toDate = (value: Date) => value.toISOString().slice(0, 10);

  return {
    start_date: toDate(start),
    end_date: toDate(end),
  };
}

export default function AccountDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const accountId = Number(id);
  const queryClient = useQueryClient();
  const range = getDateRange();

  const accountQuery = useQuery({
    queryKey: ['account', accountId],
    queryFn: () => getAccount(accountId),
    enabled: Number.isFinite(accountId),
  });

  const todayStatsQuery = useQuery({
    queryKey: ['account-today-stats', accountId],
    queryFn: () => getAccountTodayStats(accountId),
    enabled: Number.isFinite(accountId),
  });

  const trendQuery = useQuery({
    queryKey: ['account-trend', accountId, range.start_date, range.end_date],
    queryFn: () => getDashboardTrend({ ...range, granularity: 'day', account_id: accountId }),
    enabled: Number.isFinite(accountId),
  });

  const refreshMutation = useMutation({
    mutationFn: () => refreshAccount(accountId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['account', accountId] }),
  });

  const schedulableMutation = useMutation({
    mutationFn: (schedulable: boolean) => setAccountSchedulable(accountId, schedulable),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['account', accountId] });
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
    },
  });

  const account = accountQuery.data;
  const todayStats = todayStatsQuery.data;
  const trendPoints = (trendQuery.data?.trend ?? []).map((item) => ({
    label: item.date.slice(5),
    value: item.total_tokens,
  }));

  return (
    <ScreenShell
      title={account?.name || '账号详情'}
      subtitle="聚焦账号 token 用量、状态和几个最常用操作。"
      right={
        <Pressable className="h-11 w-11 items-center justify-center rounded-full bg-[#2d3134]" onPress={() => router.back()}>
          <ChevronLeft color="#f6f1e8" size={18} />
        </Pressable>
      }
    >
      <ListCard title="基本信息" meta={`${account?.platform || '--'} · ${account?.type || '--'}`} badge={account?.status || 'loading'}>
        <DetailRow label="可调度" value={account?.schedulable ? '是' : '否'} />
        <DetailRow label="优先级" value={`${account?.priority ?? 0}`} />
        <DetailRow label="并发" value={`${account?.concurrency ?? 0}`} />
        <DetailRow label="当前并发" value={`${account?.current_concurrency ?? 0}`} />
        <DetailRow label="最后使用" value={account?.last_used_at || '--'} />
      </ListCard>

      <ListCard title="今日统计" meta="真实数据来自 /accounts/:id/today-stats" icon={ShieldCheck}>
        <DetailRow label="Token" value={`${todayStats?.tokens ?? 0}`} />
        <DetailRow label="请求数" value={`${todayStats?.requests ?? 0}`} />
        <DetailRow label="成本" value={`$${Number(todayStats?.cost ?? 0).toFixed(4)}`} />
      </ListCard>

      {trendPoints.length > 1 ? (
        <LineTrendChart
          title="近 7 天 Token"
          subtitle="按账号过滤后的真实 token 趋势"
          points={trendPoints}
          color="#c96d43"
          formatValue={(value) => `${Math.round(value / 1000)}k`}
        />
      ) : null}

      <ListCard title="快捷动作" meta="直接对单账号做测试、刷新和调度控制。" icon={TestTubeDiagonal}>
        <View className="flex-row gap-3">
          <Pressable className="flex-1 rounded-[18px] bg-[#1b1d1f] px-4 py-4" onPress={() => testAccount(accountId).catch(() => undefined)}>
            <Text className="text-center text-sm font-semibold text-[#f6f1e8]">测试账号</Text>
          </Pressable>
          <Pressable className="flex-1 rounded-[18px] bg-[#e7dfcf] px-4 py-4" onPress={() => refreshMutation.mutate()}>
            <Text className="text-center text-sm font-semibold text-[#4e463e]">{refreshMutation.isPending ? '刷新中...' : '刷新凭据'}</Text>
          </Pressable>
        </View>
        <Pressable
          className="mt-3 rounded-[18px] bg-[#1d5f55] px-4 py-4"
          onPress={() => schedulableMutation.mutate(!account?.schedulable)}
        >
          <Text className="text-center text-sm font-semibold text-white">
            {schedulableMutation.isPending ? '提交中...' : account?.schedulable ? '暂停调度' : '恢复调度'}
          </Text>
        </Pressable>
      </ListCard>
    </ScreenShell>
  );
}
