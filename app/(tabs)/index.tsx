import { useQuery } from '@tanstack/react-query';
import { Activity, Coins, RefreshCw, Rows3, Zap } from 'lucide-react-native';
import { Pressable, Text, View } from 'react-native';

import { LineTrendChart } from '@/src/components/line-trend-chart';
import { ScreenShell } from '@/src/components/screen-shell';
import { StatCard } from '@/src/components/stat-card';
import { getAdminSettings, getDashboardStats, getDashboardTrend } from '@/src/services/admin';

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

export default function DashboardScreen() {
  const range = getDateRange();

  const statsQuery = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: getDashboardStats,
  });

  const trendQuery = useQuery({
    queryKey: ['dashboard-trend', range.start_date, range.end_date],
    queryFn: () => getDashboardTrend({ ...range, granularity: 'day' }),
  });

  const settingsQuery = useQuery({
    queryKey: ['admin-settings'],
    queryFn: getAdminSettings,
  });

  const stats = statsQuery.data;
  const errorMessage = statsQuery.error instanceof Error ? statsQuery.error.message : '';
  const siteName = settingsQuery.data?.site_name?.trim() || '管理控制台';
  const trendPoints = (trendQuery.data?.trend ?? []).map((item) => ({
    label: item.date.slice(5),
    value: item.total_tokens,
  }));

  return (
    <ScreenShell
      title={siteName}
      subtitle="把最常看的管理指标和关键动作先搬到手机里，方便随时巡检。"
      right={
        <Pressable
          className="h-11 w-11 items-center justify-center rounded-full bg-[#2d3134]"
          onPress={() => {
            statsQuery.refetch();
            trendQuery.refetch();
          }}
        >
          <RefreshCw color="#f6f1e8" size={18} />
        </Pressable>
      }
    >
      <View className="flex-row gap-4">
        <View className="flex-1">
          <StatCard label="今日 Token" value={stats ? `${Math.round((stats.today_tokens ?? 0) / 1000)}k` : '--'} tone="dark" trend="up" icon={Zap} />
        </View>
        <View className="flex-1">
          <StatCard label="今日成本" value={stats ? `$${Number(stats.today_cost ?? 0).toFixed(2)}` : '--'} icon={Coins} />
        </View>
      </View>

      <View className="flex-row gap-4">
        <View className="flex-1">
          <StatCard label="输出 Token" value={stats ? `${Math.round((stats.today_output_tokens ?? 0) / 1000)}k` : '--'} trend="up" icon={Rows3} />
        </View>
        <View className="flex-1">
          <StatCard label="吞吐 TPM" value={String(stats?.tpm ?? '--')} icon={Activity} />
        </View>
      </View>

      {trendPoints.length > 1 ? (
        <LineTrendChart
          title="近 7 天 Token 趋势"
          subtitle="聚焦 token 消耗，而不是大 banner"
          points={trendPoints}
          formatValue={(value) => `${Math.round(value / 1000)}k`}
        />
      ) : null}

      <View className="rounded-[24px] border border-[#e6dece] bg-[#fbf8f2] p-4">
        <Text className="text-sm leading-6 text-[#7d7468]">
          {stats
            ? `今日请求 ${stats.today_requests} · 活跃用户 ${stats.active_users} · 总账号 ${stats.total_accounts}`
            : errorMessage || '正在等待代理或后台连接。'}
        </Text>
      </View>
    </ScreenShell>
  );
}
