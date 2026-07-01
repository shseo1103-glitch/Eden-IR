/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { useDashboardStats } from '../../services/queries/useStats';
import { useUiStore } from '../../store/useUiStore';
import { 
  BarChart, 
  Bar, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer, 
  ComposedChart,
  Cell
} from 'recharts';
import { 
  TrendingUp, 
  Calendar, 
  Award, 
  Building2, 
  CheckCircle2, 
  Activity, 
  Zap,
  HelpCircle
} from 'lucide-react';

interface DashboardPageProps {
  onSimulateWebSocket: () => void;
  lastWebSocketEvent: any;
}

export default function DashboardPage({ onSimulateWebSocket, lastWebSocketEvent }: DashboardPageProps) {
  const { isDarkMode } = useUiStore();
  const { data: stats, isLoading, error } = useDashboardStats();
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 space-y-4">
        <div className="w-12 h-12 rounded-full border-4 border-indigo-500 border-t-transparent animate-spin"></div>
        <p className="text-sm text-slate-500 dark:text-slate-400 font-medium animate-pulse">실시간 대시보드 KPI 및 DB 통계 산출 중...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 max-w-lg mx-auto text-center space-y-4">
        <p className="font-bold">데이터를 불러오는 도중 오류가 발생했습니다.</p>
        <p className="text-xs font-mono">{(error as Error).message}</p>
      </div>
    );
  }

  const kpis = [
    {
      id: 'revenue',
      title: '누적 매출 (Materialized View)',
      value: `₩${stats?.totalRevenue.toLocaleString()}`,
      change: '+18.4% 지난 분기 대비',
      icon: TrendingUp,
      color: 'from-blue-500 to-indigo-600 shadow-indigo-500/10 dark:shadow-indigo-500/20'
    },
    {
      id: 'events',
      title: '총 행사 수 (Events)',
      value: `${stats?.totalEvents}건`,
      change: 'IR / 성과공유회 / 설명회',
      icon: Calendar,
      color: 'from-purple-500 to-indigo-600 shadow-purple-500/10'
    },
    {
      id: 'evaluations',
      title: '심사평가 수 (Evaluations)',
      value: `${stats?.evaluationCount}건`,
      change: '실시간 점수 검증 활성화',
      icon: Award,
      color: 'from-emerald-500 to-teal-600 shadow-emerald-500/10'
    },
    {
      id: 'startups',
      title: '참여 스타트업 (Startups)',
      value: `${stats?.activeStartups}개사`,
      change: 'AI 가공 피드백 발송 완료',
      icon: Building2,
      color: 'from-amber-500 to-orange-600 shadow-amber-500/10'
    }
  ];

  // Colors for Top Judges chart cells
  const COLORS = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ec4899'];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-300">
      
      {/* Real-time Toast notification showing WebSocket sync when an event arrives */}
      {lastWebSocketEvent && (
        <div id="ws-sync-banner" className="flex items-center gap-3 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-800 dark:text-emerald-300 shadow-lg shadow-emerald-500/5 animate-bounce">
          <Zap className="w-5 h-5 text-emerald-500 animate-pulse flex-shrink-0" />
          <div className="text-xs">
            <span className="font-bold">[실시간 동기화 완료] </span>
            {lastWebSocketEvent.message}
            <span className="text-slate-400 font-mono ml-2">({new Date(lastWebSocketEvent.timestamp).toLocaleTimeString()})</span>
          </div>
        </div>
      )}

      {/* Title Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black tracking-tight">종합 대시보드</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">이든 IR 시스템 핵심 실시간 성과 지표 모니터링</p>
        </div>
        
        {/* Quick action triggers */}
        <div className="flex items-center gap-2">
          <button
            id="simulate-event-top-btn"
            onClick={onSimulateWebSocket}
            className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/20 dark:border-indigo-400/20 rounded-xl transition-all cursor-pointer"
          >
            <Activity className="w-3.5 h-3.5 animate-pulse" />
            <span>실시간 WebSocket 데이터 주입</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi) => {
          const Icon = kpi.icon;
          const isHovered = hoveredCard === kpi.id;
          return (
            <div
              id={`kpi-card-${kpi.id}`}
              key={kpi.id}
              onMouseEnter={() => setHoveredCard(kpi.id)}
              onMouseLeave={() => setHoveredCard(null)}
              className={`p-6 rounded-2xl border transition-all duration-300 flex flex-col justify-between ${
                isDarkMode 
                  ? 'bg-slate-900/40 border-slate-800/80 hover:border-slate-700/80 hover:bg-slate-900/60' 
                  : 'bg-white border-slate-200 hover:border-slate-300 hover:shadow-lg hover:shadow-slate-100'
              } ${isHovered ? 'scale-[1.02]' : ''}`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-500 dark:text-slate-400">{kpi.title}</span>
                <div className={`p-2.5 rounded-xl bg-gradient-to-tr ${kpi.color} text-white shadow-md`}>
                  <Icon className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-4">
                <p className="text-2xl font-black tracking-tight">{kpi.value}</p>
                <div className="flex items-center gap-1.5 mt-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                  <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">{kpi.change}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Monthly Revenue & Event Composed Chart */}
        <div className={`lg:col-span-2 p-6 rounded-2xl border ${isDarkMode ? 'bg-slate-900/30 border-slate-800' : 'bg-white border-slate-200'}`}>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-sm font-bold">월별 매출 및 행사 개최 추이 (monthly_revenue)</h3>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">완료(COMPLETED) 및 확정된 행사 통계 자동 산출 결과</p>
            </div>
            <span className="text-[10px] bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 px-2 py-0.5 rounded font-mono font-bold">MATERIALIZED VIEW</span>
          </div>

          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={stats?.monthlyRevenue} margin={{ top: 10, right: -5, left: -5, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.02}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? '#1e293b' : '#f1f5f9'} />
                <XAxis 
                  dataKey="month" 
                  stroke={isDarkMode ? '#64748b' : '#94a3b8'} 
                  fontSize={10} 
                  tickLine={false} 
                />
                <YAxis 
                  yAxisId="left"
                  stroke={isDarkMode ? '#64748b' : '#94a3b8'} 
                  fontSize={10} 
                  tickLine={false}
                  tickFormatter={(val) => `₩${(val / 10000).toLocaleString()}만`}
                />
                <YAxis 
                  yAxisId="right"
                  orientation="right"
                  stroke={isDarkMode ? '#8b5cf6' : '#a78bfa'} 
                  fontSize={10} 
                  tickLine={false}
                  tickFormatter={(val) => `${val}건`}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: isDarkMode ? '#0f172a' : '#ffffff', 
                    borderColor: isDarkMode ? '#334155' : '#e2e8f0',
                    borderRadius: '12px',
                    fontSize: '11px',
                    color: isDarkMode ? '#f8fafc' : '#0f172a'
                  }}
                  formatter={(value: any, name: any) => {
                    if (name === "매출액") return [`₩${value.toLocaleString()}`, name];
                    return [`${value}건`, name];
                  }}
                />
                <Legend iconSize={8} wrapperStyle={{ fontSize: '10px', paddingTop: '10px' }} />
                <Bar 
                  yAxisId="left"
                  name="매출액" 
                  dataKey="total_revenue" 
                  fill="url(#colorRevenue)" 
                  stroke="#3b82f6"
                  strokeWidth={1}
                  radius={[4, 4, 0, 0]} 
                />
                <Line 
                  yAxisId="right"
                  type="monotone" 
                  name="개최 행사 수" 
                  dataKey="total_events" 
                  stroke="#8b5cf6" 
                  strokeWidth={2.5}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Judge Payment cumulative list */}
        <div className={`p-6 rounded-2xl border ${isDarkMode ? 'bg-slate-900/30 border-slate-800' : 'bg-white border-slate-200'}`}>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-sm font-bold">심사위원 누적 정산 현황 Top 5</h3>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">누적 심사비 상위 심사위원 집계 결과 (judge_payment_stats)</p>
            </div>
            <span className="text-[10px] bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded font-mono font-bold">TOP 5</span>
          </div>

          <div className="h-80 w-full flex flex-col justify-between">
            <div className="h-44 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart 
                  layout="vertical" 
                  data={stats?.judgePayments} 
                  margin={{ top: 0, right: 10, left: 15, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke={isDarkMode ? '#1e293b' : '#f1f5f9'} />
                  <XAxis 
                    type="number" 
                    stroke={isDarkMode ? '#64748b' : '#94a3b8'} 
                    fontSize={9} 
                    tickFormatter={(val) => `${(val / 10000).toLocaleString()}만`}
                    tickLine={false}
                  />
                  <YAxis 
                    type="category" 
                    dataKey="name" 
                    stroke={isDarkMode ? '#64748b' : '#94a3b8'} 
                    fontSize={10} 
                    tickLine={false}
                    width={55}
                  />
                  <Tooltip
                    contentStyle={{ 
                      backgroundColor: isDarkMode ? '#0f172a' : '#ffffff', 
                      borderColor: isDarkMode ? '#334155' : '#e2e8f0',
                      borderRadius: '12px',
                      fontSize: '11px',
                    }}
                    formatter={(value: any) => [`₩${value.toLocaleString()}`, '누적 정산액']}
                  />
                  <Bar dataKey="payment" radius={[0, 4, 4, 0]}>
                    {stats?.judgePayments.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* List breakdown of top judges */}
            <div className="space-y-2 pt-4 border-t border-slate-200 dark:border-slate-800">
              {stats?.judgePayments.slice(0, 3).map((judge: any, idx: number) => (
                <div key={judge.name} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: COLORS[idx] }}></span>
                    <span className="font-bold">{judge.name}</span>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400">{judge.company}</span>
                  </div>
                  <span className="font-mono font-bold">₩{judge.payment.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>

      {/* Real-time event log screen */}
      <div className={`p-6 rounded-2xl border ${isDarkMode ? 'bg-slate-900/30 border-slate-800' : 'bg-white border-slate-200'}`}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></div>
            <h3 className="text-sm font-bold">실시간 STOMP WebSocket 이벤트 스트림</h3>
          </div>
          <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">CHANNEL: /topic/events/all</span>
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-4 leading-relaxed">
          심사위원이 평가 작성을 완료하거나, 신규 견적/계약 발생 시 백엔드 메시지 큐(RabbitMQ)로부터 실시간 STOMP 브로드캐스트가 수신됩니다. 수신된 이벤트는 리프레시 없이 위의 Recharts 통계 대시보드를 즉시 갱신합니다.
        </p>

        <div className="p-4 rounded-xl bg-slate-950 text-slate-300 font-mono text-xs space-y-2 border border-slate-800 max-h-40 overflow-y-auto">
          {lastWebSocketEvent ? (
            <div className="space-y-1 animate-in fade-in slide-in-from-top-2 duration-300">
              <p className="text-emerald-400">
                &gt; <span className="font-bold">[{lastWebSocketEvent.type}]</span> EVENT RECEIVED (STOMP Client)
              </p>
              <p className="text-slate-300 pl-4">{lastWebSocketEvent.message}</p>
              <p className="text-slate-500 pl-4 text-[10px]">Timestamp: {new Date(lastWebSocketEvent.timestamp).toISOString()}</p>
            </div>
          ) : (
            <p className="text-slate-500 italic text-center py-4">대기 중... (왼쪽 아래 "실시간 소켓 이벤트 시뮬레이션" 버튼을 클릭하여 즉시 발생시켜 보세요!)</p>
          )}
        </div>
      </div>
    </div>
  );
}
