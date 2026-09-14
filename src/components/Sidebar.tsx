import { Link, useLocation } from "react-router-dom";
import { 
  Server, LayoutDashboard, Plus, LogOut, X, Settings, Key, 
  User, Activity, Box, Hexagon, ChevronLeft, 
  Cpu, Globe, Shield
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useSettings } from "../context/SettingsContext";
import { useDashboardData } from "../hooks/useDashboardData";
import { motion } from "framer-motion";
import { useMemo } from "react";

// ============================================
// AstroWax Panel V1.80 — Glass Sidebar
// Real Data Only (Option A)
// ============================================

export function Sidebar({ 
  onClose, 
  isCollapsed, 
  toggleCollapse 
}: { 
  onClose?: () => void; 
  isCollapsed?: boolean; 
  toggleCollapse?: () => void;
}) {
  const location = useLocation();
  const { user, logout } = useAuth();
  const { panelName, panelLogo } = useSettings();
  const { servers: rawServers } = useDashboardData();
  
  // 🔥 REAL data from useDashboardData hook
  const realServers = Array.isArray(rawServers) ? rawServers : [];
  const stats = useMemo(() => ({
    total: realServers.length,
    online: realServers.filter(s => s.status === 'online').length,
    offline: realServers.filter(s => s.status !== 'online').length,
  }), [realServers]);
  
  // Build links with real badge counts
  const links = [
    { 
      name: "Dashboard", 
      path: "/", 
      icon: <LayoutDashboard size={18} /> 
    },
    { 
      name: "Nodes", 
      path: "/nodes", 
      icon: <Globe size={18} /> 
    },
    { 
      name: "Servers", 
      path: "/servers", 
      icon: <Server size={18} />,
      badge: stats.total  // 🔥 REAL count
    },
  ];
  
  if (user?.role === "admin" || user?.role === "owner") {
    links.push({ name: "Create Server", path: "/servers/create", icon: <Plus size={18} /> });
    links.push({ name: "All Servers", path: "/admin/servers", icon: <Box size={18} /> });
    links.push({ name: "API Keys", path: "/api-keys", icon: <Key size={18} /> });
    links.push({ name: "Settings", path: "/admin/settings", icon: <Settings size={18} /> });
  }
  links.push({ name: "Account", path: "/account", icon: <User size={18} /> });

  return (
    <div 
      className={`h-full flex flex-col relative transition-all duration-300 z-20 overflow-hidden ${
        isCollapsed ? 'w-[72px]' : 'w-64'
      }`}
      style={{
        background: 'linear-gradient(180deg, rgba(15, 8, 28, 0.72) 0%, rgba(10, 6, 18, 0.85) 100%)',
        backdropFilter: 'blur(20px) saturate(1.4)',
        WebkitBackdropFilter: 'blur(20px) saturate(1.4)',
        borderRight: '1px solid rgba(168, 85, 247, 0.18)',
      }}
    >
      
      {/* ═══ GLASS DEPTH LAYERS ═══ */}
      
      {/* Subtle grid overlay */}
      <div 
        className="absolute inset-0 opacity-[0.04] pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(rgba(168,85,247,0.5) 1px, transparent 1px),
            linear-gradient(90deg, rgba(168,85,247,0.5) 1px, transparent 1px)
          `,
          backgroundSize: '24px 24px'
        }}
      />
      
      {/* Purple aura blobs (glass glow) */}
      <div className="absolute -top-24 -left-24 w-64 h-64 rounded-full bg-theme-600/20 blur-[100px] pointer-events-none" />
      <div className="absolute -bottom-24 -right-24 w-64 h-64 rounded-full bg-theme-700/15 blur-[100px] pointer-events-none" />
      
      {/* Top highlight line (glass reflection) */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none" />

      {/* ═══ HEADER ═══ */}
      <div className="relative h-16 flex items-center justify-between px-4 border-b border-theme-600/20 shrink-0">
        {!isCollapsed && (
          <Link to="/" className="flex items-center gap-3 group min-w-0">
            <div className="relative shrink-0">
              {panelLogo ? (
                <img 
                  src={panelLogo} 
                  alt="Logo" 
                  className="w-9 h-9 rounded-lg object-cover border border-theme-500/30 shadow-lg shadow-theme-600/30" 
                />
              ) : (
                <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-theme-500 to-theme-700 flex items-center justify-center shadow-lg shadow-theme-600/40 border border-theme-400/30">
                  <Hexagon className="w-4 h-4 text-white" />
                </div>
              )}
              {/* Glow */}
              <div className="absolute inset-0 bg-theme-500/40 blur-lg -z-10 rounded-lg" />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="font-display font-bold text-white text-sm leading-tight truncate">
                {panelName || 'AstroWax'}
              </span>
              <span className="font-mono text-[9px] tracking-wider text-theme-400/80 uppercase flex items-center gap-1">
                <span className="w-1 h-1 rounded-full bg-emerald-400" />
                v1.80
              </span>
            </div>
          </Link>
        )}
        
        {isCollapsed && (
          <Link to="/" className="mx-auto relative">
            {panelLogo ? (
              <img 
                src={panelLogo} 
                alt="Logo" 
                className="w-9 h-9 rounded-lg object-cover border border-theme-500/30 shadow-lg shadow-theme-600/30" 
              />
            ) : (
              <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-theme-500 to-theme-700 flex items-center justify-center shadow-lg shadow-theme-600/40 border border-theme-400/30">
                <Hexagon className="w-4 h-4 text-white" />
              </div>
            )}
            <div className="absolute inset-0 bg-theme-500/40 blur-lg -z-10 rounded-lg" />
          </Link>
        )}

        {onClose && (
          <button 
            onClick={onClose} 
            className="md:hidden p-1.5 text-zinc-400 hover:text-white bg-theme-600/10 hover:bg-theme-600/20 rounded-lg transition-colors shrink-0 backdrop-blur-sm"
          >
            <X size={16} />
          </button>
        )}
      </div>

      {/* ═══ NAVIGATION ═══ */}
      <nav className="relative flex-1 px-3 py-5 space-y-1 overflow-y-auto custom-scrollbar">
        {!isCollapsed && (
          <p className="px-3 mb-2 font-mono text-[10px] text-theme-500/60 tracking-widest uppercase">
            Navigation
          </p>
        )}
        
        {links.map((link) => {
          const isActive = location.pathname === link.path || 
                          (link.path !== '/' && location.pathname.startsWith(link.path));
          return (
            <Link 
              key={link.path} 
              to={link.path} 
              onClick={onClose}
              title={isCollapsed ? link.name : undefined}
              className={`relative flex items-center ${isCollapsed ? 'justify-center' : 'px-3'} py-2.5 rounded-lg transition-all group overflow-hidden ${
                isActive 
                  ? 'bg-theme-600/20 text-white backdrop-blur-sm border border-theme-500/30 shadow-[0_0_20px_rgba(168,85,247,0.15)]' 
                  : 'text-zinc-400 hover:text-white hover:bg-white/[0.04] border border-transparent hover:border-theme-600/20'
              }`}
            >
              {/* Active indicator */}
              {isActive && (
                <motion.div 
                  layoutId="aw-sidebar-active"
                  className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-6 bg-gradient-to-b from-theme-400 to-theme-600 rounded-r shadow-[0_0_10px_rgba(168,85,247,0.8)]"
                  initial={false}
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
              
              {/* Icon */}
              <div className={`transition-colors ${
                isActive ? 'text-theme-400 drop-shadow-[0_0_8px_rgba(168,85,247,0.6)]' : 'text-zinc-500 group-hover:text-theme-300'
              }`}>
                {link.icon}
              </div>
              
              {/* Label */}
              {!isCollapsed && (
                <span className={`ml-3 font-medium text-sm tracking-tight transition-colors flex-1 ${
                  isActive ? 'text-white' : 'text-zinc-400 group-hover:text-white'
                }`}>
                  {link.name}
                </span>
              )}

              {/* 🔥 REAL Badge */}
              {!isCollapsed && link.badge !== undefined && link.badge > 0 && (
                <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-md transition-colors ${
                  isActive 
                    ? 'bg-theme-500/30 text-theme-200 border border-theme-400/40' 
                    : 'bg-theme-600/15 text-theme-400/80 border border-theme-500/25'
                }`}>
                  {link.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* ═══ REAL SERVER STATS (Glass widget) ═══ */}
      {!isCollapsed && stats.total > 0 && (
        <div className="relative mx-3 mb-3 p-3 rounded-xl overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.08) 0%, rgba(126, 34, 206, 0.04) 100%)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            border: '1px solid rgba(168, 85, 247, 0.2)',
          }}
        >
          {/* Top highlight */}
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
          
          <div className="flex items-center justify-between mb-2">
            <span className="font-mono text-[9px] tracking-[0.2em] text-theme-400 uppercase flex items-center gap-1.5">
              <Activity size={10} />
              Servers
            </span>
            <span className="font-mono text-[10px] font-bold text-white">
              <span className="text-emerald-400">{stats.online}</span>
              <span className="text-zinc-500">/{stats.total}</span>
            </span>
          </div>
          
          {/* Real progress bar */}
          <div className="h-1 rounded-full bg-black/40 overflow-hidden">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${stats.total ? (stats.online / stats.total) * 100 : 0}%` }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full shadow-[0_0_8px_rgba(16,185,129,0.5)]"
            />
          </div>
        </div>
      )}

      {/* ═══ COLLAPSE TOGGLE ═══ */}
      <button 
        onClick={toggleCollapse}
        className="hidden md:flex items-center justify-center w-full py-3 border-t border-theme-600/10 text-zinc-500 hover:text-theme-300 hover:bg-theme-600/5 transition-colors backdrop-blur-sm"
        title={isCollapsed ? "Expand" : "Collapse"}
      >
        <ChevronLeft 
          size={16} 
          className={`transition-transform ${isCollapsed ? 'rotate-180' : ''}`} 
        />
        {!isCollapsed && <span className="ml-2 font-mono text-[10px] tracking-widest uppercase">Collapse</span>}
      </button>

      {/* ═══ USER PROFILE ═══ */}
      <div 
        className="relative p-3 border-t border-theme-600/20 shrink-0"
        style={{
          background: 'linear-gradient(180deg, rgba(0,0,0,0.2) 0%, rgba(0,0,0,0.4) 100%)',
        }}
      >
        {isCollapsed ? (
          <button 
            onClick={logout} 
            title="Logout"
            className="flex items-center justify-center w-full p-2.5 rounded-lg text-zinc-400 hover:text-red-300 hover:bg-red-500/10 transition-all"
          >
            <LogOut size={18} />
          </button>
        ) : (
          <div className="space-y-2">
            {/* User card — glass */}
            <div 
              className="flex items-center gap-3 p-2.5 rounded-lg group cursor-pointer transition-all overflow-hidden relative"
              style={{
                background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.06) 0%, rgba(126, 34, 206, 0.03) 100%)',
                backdropFilter: 'blur(8px)',
                WebkitBackdropFilter: 'blur(8px)',
                border: '1px solid rgba(168, 85, 247, 0.15)',
              }}
            >
              <div className="relative shrink-0">
                <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-theme-500 to-theme-700 flex items-center justify-center text-white font-bold text-sm shadow-md shadow-theme-600/30 border border-theme-400/30">
                  {user?.username?.[0]?.toUpperCase() || 'U'}
                </div>
                <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-400 border-2 border-[#0a0612] rounded-full" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-white truncate">
                  {user?.username || 'User'}
                </p>
                <p className="text-[10px] text-theme-400/80 uppercase tracking-wider font-mono">
                  {user?.role || 'User'}
                </p>
              </div>
            </div>
            
            {/* Logout button */}
            <button 
              onClick={logout}
              className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-zinc-400 hover:text-red-300 hover:bg-red-500/10 border border-transparent hover:border-red-500/20 transition-all text-xs font-medium"
            >
              <LogOut size={14} />
              Logout
            </button>
          </div>
        )}
      </div>

      {/* ═══ POWERED BY JTG PANEL ═══ */}
      <div className="relative shrink-0 border-t border-theme-600/20">
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-theme-400/30 to-transparent pointer-events-none" />
        <div className="flex items-center justify-center px-3 py-2.5">
          {isCollapsed ? (
            <div 
              className="w-7 h-7 rounded-md bg-gradient-to-br from-theme-500/30 to-theme-700/20 border border-theme-500/30 flex items-center justify-center shadow-[0_0_12px_rgba(168,85,247,0.2)]"
              title="Powered by JTG Panel"
            >
              <span className="font-display text-[10px] font-black text-theme-200 tracking-tighter">JTG</span>
            </div>
          ) : (
            <div 
              className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg w-full justify-center"
              style={{
                background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.08) 0%, rgba(126, 34, 206, 0.04) 100%)',
                backdropFilter: 'blur(8px)',
                WebkitBackdropFilter: 'blur(8px)',
                border: '1px solid rgba(168, 85, 247, 0.15)',
              }}
            >
              <span className="font-mono text-[9px] tracking-[0.15em] text-zinc-500 uppercase">
                Powered by
              </span>
              <span className="font-display text-[11px] font-black text-theme-300 tracking-wide drop-shadow-[0_0_6px_rgba(168,85,247,0.5)]">
                JTG Panel
              </span>
              <span className="w-1 h-1 rounded-full bg-theme-400 animate-pulse shadow-[0_0_6px_rgba(168,85,247,0.8)]" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}