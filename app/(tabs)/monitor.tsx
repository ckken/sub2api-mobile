import { useQuery } from '@tanstack/react-query';
import { AlertTriangle, Gauge, Layers3, Wrench } from 'lucide-react-native';
import { Text, View } from 'react-native';

import { LineTrendChart } from '@/src/components/line-trend-chart';
import { ListCard } from '@/src/components/list-card';
import { ScreenShell } from '@/src/components/screen-shell';
import { StatCard } from '@/src/components/stat-card';
import { getDashboardModels, getDashboardStats, getDashboardTrend, listAccounts } from '@/src/services/admin';

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

export default function MonitorScreen() {
  const range = getDateRange();

  const statsQuery = useQuery({
    queryKey: ['monitor-stats'],
    queryFn: getDashboardStats,
  });

  const trendQuery = useQuery({
    queryKey: ['monitor-trend', range.start_date, range.end_date],
    queryFn: () => getDashboardTrend({ ...range, granularity: 'day' }),
  });

  const modelsQuery = useQuery({
    queryKey: ['monitor-models', range.start_date, range.end_date],
    queryFn: () => getDashboardModels(range),
  });

  const accountsQuery = useQuery({
    queryKey: ['monitor-accounts'],
    queryFn: () => listAccounts(''),
  });

  const stats = statsQuery.data;
  const trendPoints = (trendQuery.data?.trend ?? []).map((item) => ({
    label: item.date.slice(5),
    value: item.total_tokens,
  }));
  const topModels = (modelsQuery.data?.models ?? []).slice(0, 3);
  const incidentAccounts = (accountsQuery.data?.items ?? []).filter((item) => item.status === 'error' || item.error_message).slice(0, 5);

  return (
    <ScreenShell title="运维监控" subtitle="运维监控与排障">
      <View className="flex-row gap-4">
        <View className="flex-1">
          <StatCard label="异常账号" value={String(stats?.error_accounts ?? incidentAccounts.length ?? '--')} tone="dark" trend="down" icon={AlertTriangle} />
        </View>
        <View className="flex-1">
          <StatCard label="实时 TPM" value={String(stats?.tpm ?? '--')} icon={Gauge} />
        </View>
      </View>

      {trendPoints.length > 1 ? (
        <LineTrendChart
          title="Token 监控"
          subtitle="最近 7 天总 token 吞吐"
          points={trendPoints}
          color="#a34d2d"
          formatValue={(value) => `${Math.round(value / 1000)}k`}
        />
      ) : null}

      <ListCard title="热点模型" meta="按请求与 token 用量排序" icon={Layers3}>
        <View className="gap-3">
          {topModels.map((item) => (
            <View key={item.model} className="flex-row items-center justify-between border-b border-[#eee6d7] pb-3 last:border-b-0 last:pb-0">
              <View className="flex-1 pr-4">
                <Text className="text-sm font-semibold text-[#16181a]">{item.model}</Text>
                <Text className="mt-1 text-xs text-[#7d7468]">请求 {item.requests} · Token {Math.round(item.total_tokens / 1000)}k</Text>
              </View>
              <Text className="text-sm font-semibold text-[#4e463e]">${Number(item.cost).toFixed(2)}</Text>
            </View>
          ))}
          {topModels.length === 0 ? <Text className="text-sm text-[#7d7468]">暂无模型统计</Text> : null}
        </View>
      </ListCard>

      <ListCard title="排障列表" meta="优先关注状态异常或带错误信息的上游账号" icon={Wrench}>
        <View className="gap-3">
          {incidentAccounts.map((item) => (
            <View key={item.id} className="rounded-[18px] bg-[#f1ece2] px-4 py-3">
              <Text className="text-sm font-semibold text-[#16181a]">{item.name}</Text>
              <Text className="mt-1 text-xs text-[#7d7468]">{item.platform} · {item.status || 'unknown'} · {item.schedulable ? '可调度' : '暂停调度'}</Text>
              <Text className="mt-2 text-xs text-[#a34d2d]">{item.error_message || '状态异常，建议从运维视角继续排查这个上游账号'}</Text>
            </View>
          ))}
          {incidentAccounts.length === 0 ? <Text className="text-sm text-[#7d7468]">当前没有检测到异常账号。</Text> : null}
        </View>
      </ListCard>
    </ScreenShell>
  );
}
