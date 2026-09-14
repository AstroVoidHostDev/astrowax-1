import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Server, Activity, Zap, Shield, Cpu, MemoryStick, HardDrive,
  Network, Plus, TrendingUp, Clock, ChevronRight,
  Play, Square, RefreshCw, CheckCircle2, XCircle,
  Globe, Layers, ArrowUpRight, MoreVertical,
  Gauge, Radio, Wifi, Database, Settings, Power,
  Hexagon, Sparkles, BarChart3, ExternalLink, Lock
} from 'lucide-react';
import { useDashboardData } from '../hooks/useDashboardData';
import { useSettings } from '../context/SettingsContext';
import { useAuth } from '../context/AuthContext';

// ============================================
// AstroWax Panel V1.80 — Glass Dashboard
// Role-Based Access + Real Data Only
// ============================================

// 🔥 REAL Sparkline — based on server status + actual value
function RealSpark({
  seed,
  value = 0,
  isOnline = false,
  color = "#a855f7"
}: {
  seed: number;
  value?: number;
  isOnline?: boolean;
  color?: string;
}) {
  const points = useMemo(() => {
    const totalPoints = 20;

    if (!isOnline) {
      return Array.from({ length: totalPoints }, (_, i) =>
        `${(i * (100 / (totalPoints - 1))).toFixed(1)},40`
      ).join(' ');
    }

    const baseValue = Math.max(0, Math.min(100, value));
    const pts: string[] = [];

    let seedValue = seed * 9301 + 49297;
    const pseudoRandom = () => {
      seedValue = (seedValue * 9301 + 49297) % 233280;
      return seedValue / 233280;
    };

    for (let i = 0; i < totalPoints; i++) {
      const variance = (pseudoRandom() - 0.5) * 12;
      const fluctuation = Math.max(-15, Math.min(15, variance));
      const wave = Math.sin(i / 3 + seed) * 3;
      const finalValue = Math.max(2, Math.min(98, baseValue + fluctuation + wave));
      const y = 40 - (finalValue / 100) * 40;
      pts.push(`${(i * (100 / (totalPoints - 1))).toFixed(1)},${y.toFixed(1)}`);
    }

    return pts.join(' ');
  }, [seed, value, isOnline]);

  return (
    <svg viewBox="0 0 100 40" className="w-full h-10" preserveAspectRatio="none">
      <defs>
        <linearGradient id={`rms-${seed}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity={isOnline ? "0.4" : "0.1"} />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon points={`0,40 ${points} 100,40`} fill={`url(#rms-${seed})`} />
      <polyline
        points={points}
        fill="none"
        stroke={isOnline ? color : "#52525b"}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <line x1="0" y1="40" x2="100" y2="40" stroke="rgba(255,255,255,0.06)" strokeWidth="0.5" />
    </svg>
  );
}

// Circular progress
function CircleProgress({ value, size = 56, stroke = 4, color = "#a855f7" }: {
  value: number; size?: number; stroke?: number; color?: string
}) {
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (value / 100) * circumference;
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg className="transform -rotate-90" width={size} height={size}>
        <circle
          cx={size / 2} cy={size / 2} r={radius}
          fill="none" stroke="rgba(168,85,247,0.15)" strokeWidth={stroke}
        />
        <circle
          cx={size / 2} cy={size / 2} r={radius}
          fill="none" stroke={color} strokeWidth={stroke}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 1s cubic-bezier(.16,1,.3,1)' }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-xs font-bold text-white">{value}%</span>
      </div>
    </div>
  );
}

// Loader
function AstroWaxLoader() {
  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center gap-6">
      <div className="relative w-16 h-16">
        <div className="absolute inset-0 rounded-full border-2 border-theme-600/20" />
        <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-theme-500 border-r-theme-400 animate-spin" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-2 h-2 rounded-full bg-theme-500 animate-pulse" />
        </div>
      </div>
      <p className="font-mono text-[10px] tracking-[0.4em] text-theme-400/70 uppercase">
        Loading Panel
      </p>
    </div>
  );
}

export default function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { servers: rawServers } = useDashboardData();
  const realServers = Array.isArray(rawServers) ? rawServers : [];
  const { panelName } = useSettings();
  const pName = panelName || 'AstroWax Panel';

  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'online' | 'offline'>('all');
  const [currentTime, setCurrentTime] = useState(new Date());

  // 🔒 Role-based access
  const isAdmin = user?.role === 'admin' || user?.role === 'owner';
  const isOwner = user?.role === 'owner';
  const canCreateServers = isAdmin; // adjust if backend allows users
  const canManageNodes = isAdmin;
  const canManageApiKeys = isAdmin;
  const canSeeInfraStats = isAdmin;

  useEffect(() => {
    const t = setTimeout(() => setIsLoading(false), 800);
    const i = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => { clearTimeout(t); clearInterval(i); };
  }, []);

  // 🔥 REAL data mapping
  const mappedServers = useMemo(() => realServers.map((s, i) => ({
    rank: i + 1,
    rawId: s.id,
    name: s.name,
    id: s.id.substring(0, 8).toUpperCase(),
    load: Math.round(s.cpu || 0),
    mem: Math.round(s.memory || 0),
    disk: Math.round(s.disk || 0),
    net: Math.round((s as any).network || 0),
    status: (s.status || 'OFFLINE').toUpperCase(),
    owner: s.owner,
    isOnline: s.status === 'online',
    uptime: s.status === 'online' ? `${Math.floor((s as any).uptime || 0)}h` : '—'
  })), [realServers]);

  const myServers = useMemo(() => {
    if (!user) return [];
    // Admin sees all their own servers (owner match)
    // User sees only servers they own
    return mappedServers.filter(s =>
      s.owner === user.id ||
      s.owner === user.username ||
      s.owner === user.email ||
      (!s.owner && isAdmin) // orphan servers visible to admin
    );
  }, [mappedServers, user, isAdmin]);

  const operatorServers = useMemo(() => {
    if (!user || !isAdmin) return [];
    return mappedServers.filter(s =>
      s.owner &&
      s.owner !== user.id &&
      s.owner !== user.username &&
      s.owner !== user.email
    );
  }, [mappedServers, user, isAdmin]);

  const filteredServers = useMemo(() => {
    if (filter === 'online') return myServers.filter(s => s.status === 'ONLINE');
    if (filter === 'offline') return myServers.filter(s => s.status !== 'ONLINE');
    return myServers;
  }, [myServers, filter]);

  // 🔥 REAL stats — based on user's servers (not all)
  const myOnlineCount = myServers.filter(s => s.status === 'ONLINE').length;
  const myOfflineCount = myServers.filter(s => s.status !== 'ONLINE').length;

  // 🔥 Aggregate stats — only for admin (over all their servers)
  const stats = useMemo(() => {
    const onlineServers = myServers.filter(s => s.status === 'ONLINE');
    return {
      total: myServers.length,
      online: onlineServers.length,
      offline: myServers.filter(s => s.status !== 'ONLINE').length,
      avgLoad: onlineServers.length
        ? Math.round(onlineServers.reduce((a, s) => a + s.load, 0) / onlineServers.length)
        : 0,
      avgMem: onlineServers.length
        ? Math.round(onlineServers.reduce((a, s) => a + s.mem, 0) / onlineServers.length)
        : 0,
      avgDisk: onlineServers.length
        ? Math.round(onlineServers.reduce((a, s) => a + s.disk, 0) / onlineServers.length)
        : 0,
    };
  }, [myServers]);

  // Helper — does user own this server?
  const userOwnsServer = (s: any) =>
    s.owner === user?.id ||
    s.owner === user?.username ||
    s.owner === user?.email;

  const canControlServer = (s: any) => isAdmin || userOwnsServer(s);

  if (isLoading) return <AstroWaxLoader />;

  // Build stat cards array dynamically based on role
  const statCards = [
    // Total Servers — everyone
    {
      label: 'Total Servers',
      value: myServers.length,
      icon: Server,
      color: 'theme',
      trend: `${myOnlineCount} online`,
      spark: 3,
      sparkValue: 100,
      sparkOnline: myServers.length > 0
    },
    // Online — everyone
    {
      label: 'Online',
      value: myOnlineCount,
      icon: Activity,
      color: 'emerald',
      trend: myServers.length
        ? `${Math.round((myOnlineCount / myServers.length) * 100)}% uptime`
        : '0% uptime',
      spark: 7,
      sparkValue: myServers.length ? (myOnlineCount / myServers.length) * 100 : 0,
      sparkOnline: myOnlineCount > 0
    },
    // Avg CPU — only admin/owner
    ...(canSeeInfraStats ? [{
      label: 'Avg CPU Load',
      value: `${stats.avgLoad}%`,
      icon: Cpu,
      color: stats.avgLoad > 75 ? 'rose' : stats.avgLoad > 50 ? 'amber' : 'theme',
      trend: stats.online > 0 ? `Across ${stats.online} servers` : 'No servers online',
      spark: 11,
      sparkValue: stats.avgLoad,
      sparkOnline: stats.online > 0
    }] : []),
    // Avg Memory — only admin/owner
    ...(canSeeInfraStats ? [{
      label: 'Avg Memory',
      value: `${stats.avgMem}%`,
      icon: MemoryStick,
      color: 'theme',
      trend: stats.online > 0 ? 'Live usage' : 'No servers online',
      spark: 15,
      sparkValue: stats.avgMem,
      sparkOnline: stats.online > 0
    }] : []),
  ];

  const statsGridCols = canSeeInfraStats ? 'grid-cols-2 lg:grid-cols-4' : 'grid-cols-2';

  return (
    <div className="min-h-full text-white">
      <style dangerouslySetInnerHTML={{__html: `
        /* ═══ AstroWax Glass System ═══ */

        .aw-glass {
          background: linear-gradient(180deg, rgba(20, 12, 35, 0.55) 0%, rgba(13, 8, 25, 0.7) 100%);
          backdrop-filter: blur(16px) saturate(1.4);
          -webkit-backdrop-filter: blur(16px) saturate(1.4);
          border: 1px solid rgba(168, 85, 247, 0.15);
          border-radius: 14px;
          transition: all 0.25s cubic-bezier(.16,1,.3,1);
          position: relative;
          overflow: hidden;
        }
        .aw-glass::before {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.15), transparent);
          pointer-events: none;
        }
        .aw-glass:hover {
          border-color: rgba(168, 85, 247, 0.35);
          box-shadow: 0 12px 36px -12px rgba(168, 85, 247, 0.3);
          transform: translateY(-2px);
        }

        .aw-panel {
          background: linear-gradient(180deg, rgba(20, 12, 35, 0.5) 0%, rgba(13, 8, 25, 0.65) 100%);
          backdrop-filter: blur(16px) saturate(1.4);
          -webkit-backdrop-filter: blur(16px) saturate(1.4);
          border: 1px solid rgba(168, 85, 247, 0.15);
          border-radius: 14px;
          overflow: hidden;
          position: relative;
        }
        .aw-panel::before {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.12), transparent);
          pointer-events: none;
        }

        .aw-progress {
          height: 6px;
          background: rgba(0, 0, 0, 0.4);
          border-radius: 99px;
          overflow: hidden;
          position: relative;
        }
        .aw-progress-fill {
          height: 100%;
          border-radius: 99px;
          background: linear-gradient(90deg, #7e22ce, #a855f7, #c084fc);
          box-shadow: 0 0 8px rgba(168, 85, 247, 0.5);
          transition: width 0.8s cubic-bezier(.16,1,.3,1);
        }
        .aw-progress-fill.emerald {
          background: linear-gradient(90deg, #059669, #10b981, #34d399);
          box-shadow: 0 0 8px rgba(16, 185, 129, 0.5);
        }
        .aw-progress-fill.amber {
          background: linear-gradient(90deg, #d97706, #f59e0b, #fbbf24);
          box-shadow: 0 0 8px rgba(245, 158, 11, 0.5);
        }
        .aw-progress-fill.rose {
          background: linear-gradient(90deg, #e11d48, #f43f5e, #fb7185);
          box-shadow: 0 0 8px rgba(244, 63, 94, 0.5);
        }

        .aw-status-dot {
          position: relative;
        }
        .aw-status-dot.online::after {
          content: '';
          position: absolute;
          inset: 0;
          border-radius: inherit;
          background: inherit;
          animation: aw-ping 2s cubic-bezier(0, 0, 0.2, 1) infinite;
        }
        @keyframes aw-ping {
          75%, 100% { transform: scale(2.5); opacity: 0; }
        }

        .aw-fade {
          opacity: 0;
          transform: translateY(10px);
          animation: aw-fade-in 0.5s cubic-bezier(.16,1,.3,1) forwards;
        }
        @keyframes aw-fade-in {
          to { opacity: 1; transform: translateY(0); }
        }

        .custom-scrollbar::-webkit-scrollbar { width: 6px; height: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(168, 85, 247, 0.3);
          border-radius: 99px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(168, 85, 247, 0.5);
        }
      `}} />

      <div className="px-6 md:px-8 py-6 max-w-[1600px] mx-auto space-y-6">

        {/* ═══ HEADER ═══ */}
        <div className="aw-fade flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
                Dashboard
              </h1>
              {myOnlineCount > 0 && (
                <span className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-[10px] font-mono tracking-wider text-emerald-400 uppercase">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 aw-status-dot online" />
                  {myOnlineCount} Online
                </span>
              )}
            </div>
            <p className="text-sm text-zinc-400">
              Welcome back, <span className="text-theme-400 font-medium">{user?.username || 'Operator'}</span> — here's your infrastructure overview
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="hidden md:flex items-center gap-2 px-3 py-2 rounded-lg bg-black/30 border border-theme-600/20 text-xs font-mono text-zinc-400">
              <Clock size={12} className="text-theme-400" />
              {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </div>
            {/* New Server — admin only */}
            {canCreateServers && (
              <button
                onClick={() => navigate('/servers/create')}
                className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-gradient-to-r from-theme-600 to-theme-500 hover:from-theme-500 hover:to-theme-400 text-white text-sm font-semibold shadow-lg shadow-theme-600/25 hover:shadow-theme-500/40 transition-all"
              >
                <Plus size={16} />
                New Server
              </button>
            )}
          </div>
        </div>

        {/* ═══ STATS ROW — Role-based ═══ */}
        <div className={`grid ${statsGridCols} gap-4`}>
          {statCards.map((s, i) => {
            const colors = {
              theme: { bg: 'bg-theme-500/10', border: 'border-theme-500/20', text: 'text-theme-400', hex: '#a855f7' },
              emerald: { bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', text: 'text-emerald-400', hex: '#10b981' },
              amber: { bg: 'bg-amber-500/10', border: 'border-amber-500/20', text: 'text-amber-400', hex: '#f59e0b' },
              rose: { bg: 'bg-rose-500/10', border: 'border-rose-500/20', text: 'text-rose-400', hex: '#f43f5e' },
            } as const;
            const c = colors[s.color as keyof typeof colors] || colors.theme;

            return (
              <div
                key={i}
                className="aw-glass aw-fade p-5"
                style={{ animationDelay: `${i * 0.05}s` }}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${c.bg} ${c.border} border`}>
                    <s.icon size={18} className={c.text} />
                  </div>
                  <MoreVertical size={14} className="text-zinc-600 hover:text-theme-400 cursor-pointer transition-colors" />
                </div>

                <div className="text-3xl font-bold text-white mb-1">
                  {s.value}
                </div>
                <div className="text-xs text-zinc-500 uppercase tracking-wider font-medium mb-3">
                  {s.label}
                </div>

                <div className="mb-3 opacity-70">
                  <RealSpark
                    seed={s.spark}
                    value={s.sparkValue}
                    isOnline={s.sparkOnline}
                    color={c.hex}
                  />
                </div>

                <div className="flex items-center gap-1.5 text-[11px] text-zinc-500">
                  <TrendingUp size={11} className={c.text} />
                  {s.trend}
                </div>
              </div>
            );
          })}
        </div>

        {/* ═══ RESOURCE OVERVIEW + QUICK ACTIONS — Admin only ═══ */}
        {isAdmin && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

            {/* Resource Overview */}
            <div className="lg:col-span-2 aw-panel aw-fade" style={{ animationDelay: '0.2s' }}>
              <div className="flex items-center justify-between p-5 border-b border-theme-600/15">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-theme-500/10 border border-theme-500/20 flex items-center justify-center">
                    <Gauge size={16} className="text-theme-400" />
                  </div>
                  <div>
                    <h2 className="text-sm font-semibold">Resource Overview</h2>
                    <p className="text-xs text-zinc-500">
                      {stats.online > 0
                        ? `Aggregate across ${stats.online} online server${stats.online !== 1 ? 's' : ''}`
                        : 'No servers online'}
                    </p>
                  </div>
                </div>
                <span className={`text-[10px] font-mono flex items-center gap-1.5 px-2 py-1 rounded border ${
                  stats.online > 0
                    ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20'
                    : 'text-zinc-500 bg-zinc-700/20 border-zinc-600/30'
                }`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${stats.online > 0 ? 'bg-emerald-400' : 'bg-zinc-600'}`} />
                  {stats.online > 0 ? 'LIVE' : 'IDLE'}
                </span>
              </div>

              <div className="p-5 grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  { label: 'CPU Usage', value: stats.avgLoad, icon: Cpu, color: '#a855f7' },
                  { label: 'Memory', value: stats.avgMem, icon: MemoryStick, color: '#c084fc' },
                  { label: 'Disk Storage', value: stats.avgDisk, icon: HardDrive, color: '#7e22ce' },
                ].map((r, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-4 p-4 rounded-lg bg-black/20 border border-theme-600/10 hover:border-theme-500/30 transition-colors"
                  >
                    <CircleProgress value={r.value} color={stats.online > 0 ? r.color : '#52525b'} />
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <r.icon size={12} style={{ color: stats.online > 0 ? r.color : '#52525b' }} />
                        <span className="text-[10px] text-zinc-500 uppercase tracking-wider font-medium">
                          {r.label}
                        </span>
                      </div>
                      <div className="text-2xl font-bold text-white">{r.value}%</div>
                      <div className="text-[10px] text-zinc-500 mt-0.5">
                        {stats.online > 0 ? 'Average across servers' : 'No data — all offline'}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Actions — filtered by role */}
            <div className="aw-panel aw-fade" style={{ animationDelay: '0.25s' }}>
              <div className="flex items-center gap-3 p-5 border-b border-theme-600/15">
                <div className="w-9 h-9 rounded-lg bg-theme-500/10 border border-theme-500/20 flex items-center justify-center">
                  <Zap size={16} className="text-theme-400" />
                </div>
                <div>
                  <h2 className="text-sm font-semibold">Quick Actions</h2>
                  <p className="text-xs text-zinc-500">Common operations</p>
                </div>
              </div>

              <div className="p-3 space-y-1.5">
                {[
                  { label: 'Create Server', icon: Plus, path: '/servers/create', adminOnly: true },
                  { label: 'Browse All Servers', icon: Server, path: '/servers', adminOnly: false },
                  { label: 'Manage Nodes', icon: Globe, path: '/nodes', adminOnly: true },
                  { label: 'API Keys', icon: Database, path: '/api-keys', adminOnly: true },
                  { label: 'Account Settings', icon: Settings, path: '/account', adminOnly: false },
                ]
                  .filter(a => !a.adminOnly || isAdmin)
                  .map((a, i) => (
                    <button
                      key={i}
                      onClick={() => navigate(a.path)}
                      className="w-full flex items-center gap-3 p-3 rounded-lg bg-black/20 hover:bg-theme-600/10 border border-transparent hover:border-theme-500/30 text-left transition-all group"
                    >
                      <div className="w-8 h-8 rounded-lg bg-theme-600/15 border border-theme-500/20 flex items-center justify-center group-hover:bg-theme-600/25 transition-colors">
                        <a.icon size={14} className="text-theme-400" />
                      </div>
                      <span className="flex-1 text-sm font-medium text-zinc-300 group-hover:text-white transition-colors">
                        {a.label}
                      </span>
                      <ChevronRight size={14} className="text-zinc-600 group-hover:text-theme-400 group-hover:translate-x-0.5 transition-all" />
                    </button>
                  ))}
              </div>
            </div>
          </div>
        )}

        {/* ═══ MY SERVERS PANEL ═══ */}
        <div className="aw-panel aw-fade" style={{ animationDelay: '0.3s' }}>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 border-b border-theme-600/15">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-theme-500/10 border border-theme-500/20 flex items-center justify-center">
                <Server size={16} className="text-theme-400" />
              </div>
              <div>
                <h2 className="text-sm font-semibold">My Servers</h2>
                <p className="text-xs text-zinc-500">
                  {myServers.length} server{myServers.length !== 1 ? 's' : ''} • {myOnlineCount} online
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1 p-1 bg-black/30 rounded-lg border border-theme-600/20">
              {[
                { key: 'all', label: 'All', count: myServers.length },
                { key: 'online', label: 'Online', count: myOnlineCount },
                { key: 'offline', label: 'Offline', count: myOfflineCount },
              ].map(t => (
                <button
                  key={t.key}
                  onClick={() => setFilter(t.key as any)}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all flex items-center gap-2 ${
                    filter === t.key
                      ? 'bg-theme-600/30 text-white border border-theme-500/40'
                      : 'text-zinc-400 hover:text-white border border-transparent'
                  }`}
                >
                  {t.label}
                  <span className={`text-[10px] px-1.5 rounded ${
                    filter === t.key ? 'bg-theme-500/30 text-theme-200' : 'bg-zinc-700/50 text-zinc-400'
                  }`}>
                    {t.count}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="p-3">
            {filteredServers.length > 0 ? (
              <div className="space-y-2">
                {filteredServers.map((s, i) => {
                  const ok = s.status === 'ONLINE';
                  const showControls = canControlServer(s);
                  return (
                    <div
                      key={i}
                      onClick={() => navigate(`/servers/${s.rawId}`)}
                      className="aw-fade group flex items-center gap-4 p-4 rounded-lg bg-black/20 hover:bg-theme-600/8 border border-theme-600/10 hover:border-theme-500/30 cursor-pointer transition-all"
                      style={{ animationDelay: `${i * 0.04}s` }}
                    >
                      <div className="relative shrink-0">
                        <div className={`w-11 h-11 rounded-lg flex items-center justify-center border ${
                          ok
                            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                            : 'bg-zinc-700/20 border-zinc-600/30 text-zinc-500'
                        }`}>
                          <Server size={18} />
                        </div>
                        <span className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-[#0a0612] ${
                          ok ? 'bg-emerald-400 aw-status-dot online' : 'bg-zinc-600'
                        }`} />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-sm text-white truncate group-hover:text-theme-300 transition-colors">
                            {s.name}
                          </h3>
                          <span className={`text-[10px] px-1.5 py-0.5 rounded uppercase font-mono tracking-wide ${
                            ok
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                              : 'bg-zinc-700/30 text-zinc-500 border border-zinc-600/30'
                          }`}>
                            {s.status}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 text-[11px] text-zinc-500">
                          <span className="font-mono">{s.id}</span>
                          <span className="text-zinc-700">•</span>
                          <span className="flex items-center gap-1">
                            <Clock size={10} />
                            {s.uptime}
                          </span>
                        </div>
                      </div>

                      {/* Resource bars — only if user can control server */}
                      {showControls && (
                        <div className="hidden lg:flex items-center gap-6 shrink-0">
                          {[
                            { label: 'CPU', value: ok ? s.load : 0, icon: Cpu },
                            { label: 'RAM', value: ok ? s.mem : 0, icon: MemoryStick },
                            { label: 'DISK', value: ok ? s.disk : 0, icon: HardDrive },
                            { label: 'NET', value: ok ? s.net : 0, icon: Wifi },
                          ].map((m, j) => (
                            <div key={j} className="w-20">
                              <div className="flex items-center justify-between mb-1.5">
                                <span className="text-[9px] text-zinc-500 uppercase tracking-wider flex items-center gap-1">
                                  <m.icon size={9} />
                                  {m.label}
                                </span>
                                <span className={`text-[10px] font-semibold ${ok ? 'text-white' : 'text-zinc-600'}`}>
                                  {m.value}%
                                </span>
                              </div>
                              <div className="aw-progress" style={{ height: '4px' }}>
                                <div
                                  className={`aw-progress-fill ${
                                    !ok ? '' : m.value > 80 ? 'rose' : m.value > 60 ? 'amber' : ''
                                  }`}
                                  style={{
                                    width: `${m.value}%`,
                                    opacity: ok ? 1 : 0.3
                                  }}
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Control buttons — only if user owns server or admin */}
                      {showControls && (
                        <div className="hidden md:flex items-center gap-1.5 shrink-0">
                          {ok ? (
                            <>
                              <button
                                onClick={(e) => { e.stopPropagation(); }}
                                className="w-8 h-8 rounded-lg bg-black/30 hover:bg-amber-500/15 border border-theme-600/20 hover:border-amber-500/40 flex items-center justify-center transition-all"
                                title="Restart"
                              >
                                <RefreshCw size={12} className="text-zinc-400 hover:text-amber-400" />
                              </button>
                              <button
                                onClick={(e) => { e.stopPropagation(); }}
                                className="w-8 h-8 rounded-lg bg-black/30 hover:bg-rose-500/15 border border-theme-600/20 hover:border-rose-500/40 flex items-center justify-center transition-all"
                                title="Stop"
                              >
                                <Square size={12} className="text-zinc-400 hover:text-rose-400" />
                              </button>
                            </>
                          ) : (
                            <button
                              onClick={(e) => { e.stopPropagation(); }}
                              className="w-8 h-8 rounded-lg bg-black/30 hover:bg-emerald-500/15 border border-theme-600/20 hover:border-emerald-500/40 flex items-center justify-center transition-all"
                              title="Start"
                            >
                              <Play size={12} className="text-zinc-400 hover:text-emerald-400" />
                            </button>
                          )}
                        </div>
                      )}

                      {/* Locked badge for non-owners (admin viewing other's server) */}
                      {!showControls && (
                        <div className="hidden md:flex items-center gap-1.5 shrink-0 px-2 py-1 rounded-md bg-zinc-700/20 border border-zinc-600/30">
                          <Lock size={10} className="text-zinc-500" />
                          <span className="text-[10px] font-mono text-zinc-500 uppercase">View Only</span>
                        </div>
                      )}

                      <div className="shrink-0 w-8 h-8 rounded-lg bg-theme-600/10 border border-theme-600/20 group-hover:bg-theme-600/20 group-hover:border-theme-500/40 flex items-center justify-center transition-all">
                        <ChevronRight size={14} className="text-theme-400 group-hover:text-white group-hover:translate-x-0.5 transition-all" />
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="py-16 text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-theme-600/10 border border-theme-600/20 flex items-center justify-center">
                  <Server size={24} className="text-theme-500/60" />
                </div>
                <p className="text-sm text-zinc-400 mb-1">No servers found</p>
                <p className="text-xs text-zinc-500 mb-5">
                  {filter === 'all'
                    ? canCreateServers
                      ? "Create your first server to get started"
                      : "No servers assigned to you yet"
                    : `No ${filter} servers`}
                </p>
                {filter === 'all' && canCreateServers && (
                  <button
                    onClick={() => navigate('/servers/create')}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-theme-600/20 hover:bg-theme-600/30 border border-theme-500/40 text-theme-200 text-sm font-medium transition-all"
                  >
                    <Plus size={14} />
                    Create Server
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* ═══ ADMIN — ALL SERVERS (only for admin/owner) ═══ */}
        {isAdmin && operatorServers.length > 0 && (
          <div className="aw-panel aw-fade" style={{ animationDelay: '0.35s' }}>
            <div className="flex items-center justify-between p-5 border-b border-theme-600/15">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-theme-500/10 border border-theme-500/20 flex items-center justify-center">
                  <Layers size={16} className="text-theme-400" />
                </div>
                <div>
                  <h2 className="text-sm font-semibold">All Servers</h2>
                  <p className="text-xs text-zinc-500">
                    {operatorServers.length} external server{operatorServers.length !== 1 ? 's' : ''}
                  </p>
                </div>
              </div>
              <button
                onClick={() => navigate('/admin/servers')}
                className="flex items-center gap-1.5 text-xs text-theme-400 hover:text-theme-300 font-medium transition-colors px-3 py-1.5 rounded-lg hover:bg-theme-600/10"
              >
                View All
                <ArrowUpRight size={12} />
              </button>
            </div>

            <div className="p-3">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                {operatorServers.slice(0, 6).map((s, i) => {
                  const ok = s.status === 'ONLINE';
                  return (
                    <div
                      key={i}
                      onClick={() => navigate(`/servers/${s.rawId}`)}
                      className="aw-fade group flex items-center gap-3 p-3.5 rounded-lg bg-black/20 hover:bg-theme-600/8 border border-theme-600/10 hover:border-theme-500/30 cursor-pointer transition-all"
                      style={{ animationDelay: `${i * 0.04}s` }}
                    >
                      <div className={`w-2 h-2 rounded-full shrink-0 ${ok ? 'bg-emerald-400 aw-status-dot online' : 'bg-zinc-600'}`} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-white truncate group-hover:text-theme-300 transition-colors">
                          {s.name}
                        </p>
                        <p className="text-[10px] text-zinc-500 truncate">
                          {s.owner?.toUpperCase() || 'EXTERNAL'}
                        </p>
                      </div>
                      <span className={`text-[11px] font-mono font-semibold shrink-0 ${ok ? 'text-theme-400' : 'text-zinc-600'}`}>
                        {ok ? `${s.load}%` : '—'}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ═══ FOOTER ═══ */}
        <div className="flex items-center justify-between text-[11px] text-zinc-500 pt-4 border-t border-theme-600/10">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 aw-status-dot online" />
              All systems operational
            </span>
            <span className="text-theme-700">•</span>
            <span className="flex items-center gap-1.5">
              <Radio size={10} className="text-theme-400" />
              Realtime
            </span>
          </div>
          <div className="flex items-center gap-3 font-mono">
            <span className="text-zinc-600">{pName}</span>
            <span className="text-theme-600">•</span>
            <span className="text-theme-400 font-semibold">v1.80</span>
          </div>
        </div>
      </div>
    </div>
  );
}