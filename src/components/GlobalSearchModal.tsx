import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Search,
  Server,
  LayoutDashboard,
  Plus,
  Settings,
  Key,
  User,
  Activity,
  X,
  ChevronRight,
  Terminal,
  ArrowRight,
  CornerDownLeft,
  Hexagon,
  Sparkles,
  Command,
  Rocket,
  FolderDown,
  ShieldCheck
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

// ============================================
// AstroWax Panel V1.80 — Global Search Modal
// Glass + Purple Theme
// ============================================

interface SearchServer {
  id: string;
  name: string;
  software?: string;
  port?: number;
  status?: string;
  ipAlias?: string;
}

interface QuickLink {
  id: string;
  title: string;
  subtitle: string;
  category: "Navigation" | "Server" | "Action";
  icon: React.ReactNode;
  path: string;
}

const STATIC_NAV_LINKS: QuickLink[] = [
  {
    id: "nav-overview",
    title: "Overview",
    subtitle: "Dashboard metrics & system status",
    category: "Navigation",
    icon: <LayoutDashboard className="w-4 h-4" style={{ color: '#c084fc' }} />,
    path: "/"
  },
  {
    id: "nav-servers",
    title: "All Servers",
    subtitle: "View & manage active instances",
    category: "Navigation",
    icon: <Server className="w-4 h-4" style={{ color: '#c084fc' }} />,
    path: "/servers"
  },
  {
    id: "nav-create",
    title: "Deploy Server",
    subtitle: "Create new Minecraft or game server",
    category: "Action",
    icon: <Plus className="w-4 h-4" style={{ color: '#c084fc' }} />,
    path: "/servers/create"
  },
  {
    id: "nav-fleet",
    title: "Fleet Management",
    subtitle: "Admin controls & node overview",
    category: "Navigation",
    icon: <Activity className="w-4 h-4" style={{ color: '#c084fc' }} />,
    path: "/admin/servers"
  },
  {
    id: "nav-settings",
    title: "Account",
    subtitle: "Customization, users, & themes",
    category: "Navigation",
    icon: <User className="w-4 h-4" style={{ color: '#c084fc' }} />,
    path: "/account"
  },
  {
    id: "nav-apikeys",
    title: "API Keys",
    subtitle: "Manage external API access tokens",
    category: "Navigation",
    icon: <Key className="w-4 h-4" style={{ color: '#c084fc' }} />,
    path: "/api-keys"
  }
];

export default function GlobalSearchModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [servers, setServers] = useState<SearchServer[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      } else if (e.key === "Escape" && isOpen) {
        setIsOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  const fetchServers = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await axios.get("/api/servers");
      if (Array.isArray(res.data)) {
        setServers(res.data);
      }
    } catch (e) {
      console.error("Failed to fetch search servers", e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      fetchServers();
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery("");
      setSelectedIndex(0);
    }
  }, [isOpen, fetchServers]);

  const cleanQuery = query.trim().toLowerCase();

  const filteredServers: QuickLink[] = servers
    .filter((s) => {
      if (!cleanQuery) return true;
      return (
        s.name.toLowerCase().includes(cleanQuery) ||
        s.id.toLowerCase().includes(cleanQuery) ||
        (s.software && s.software.toLowerCase().includes(cleanQuery)) ||
        (s.ipAlias && s.ipAlias.toLowerCase().includes(cleanQuery)) ||
        (s.port && s.port.toString().includes(cleanQuery))
      );
    })
    .map((s) => ({
      id: `server-${s.id}`,
      title: s.name,
      subtitle: `Software: ${s.software || "Paper"} • Port: ${s.port || 25565}`,
      category: "Server" as const,
      icon: <Server className="w-4 h-4" style={{ color: '#c084fc' }} />,
      path: `/servers/${s.id}`
    }));

  const filteredNavLinks = STATIC_NAV_LINKS.filter((item) => {
    if (!cleanQuery) return true;
    return (
      item.title.toLowerCase().includes(cleanQuery) ||
      item.subtitle.toLowerCase().includes(cleanQuery)
    );
  });

  const allResults = [...filteredNavLinks, ...filteredServers];

  useEffect(() => {
    const handleNavigationKeys = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % Math.max(1, allResults.length));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 + allResults.length) % Math.max(1, allResults.length));
      } else if (e.key === "Enter" && allResults[selectedIndex]) {
        e.preventDefault();
        handleSelect(allResults[selectedIndex]);
      }
    };

    window.addEventListener("keydown", handleNavigationKeys);
    return () => window.removeEventListener("keydown", handleNavigationKeys);
  }, [isOpen, allResults, selectedIndex]);

  const handleSelect = (item: QuickLink) => {
    setIsOpen(false);
    navigate(item.path);
  };

  return (
    <>
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes awSearchBgIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes awSearchIn {
          from { opacity: 0; transform: translateY(-12px) scale(.96); filter: blur(6px); }
          to { opacity: 1; transform: translateY(0) scale(1); filter: blur(0); }
        }
        @keyframes awSearchRowIn {
          from { opacity: 0; transform: translateY(4px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .aw-search-bg { animation: awSearchBgIn .18s ease both; }
        .aw-search-modal { animation: awSearchIn .3s cubic-bezier(.16,1,.3,1) both; }
        .aw-search-row { animation: awSearchRowIn .25s cubic-bezier(.16,1,.3,1) both; }

        .aw-search-glass {
          background: linear-gradient(135deg, rgba(20,12,35,.95) 0%, rgba(13,8,25,.98) 100%);
          backdrop-filter: blur(24px) saturate(1.4);
          -webkit-backdrop-filter: blur(24px) saturate(1.4);
          border: 1px solid rgba(168,85,247,.3);
          border-radius: 20px;
          position: relative;
          overflow: hidden;
          box-shadow:
            0 30px 80px -20px rgba(0,0,0,.9),
            0 0 0 1px rgba(168,85,247,.15),
            0 0 40px -12px rgba(168,85,247,.4),
            inset 0 1px 0 rgba(255,255,255,.06);
        }
        .aw-search-glass::before {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(168,85,247,.7), rgba(255,255,255,.3), rgba(168,85,247,.7), transparent);
          pointer-events: none;
          z-index: 2;
        }

        .aw-search-scroll::-webkit-scrollbar { width: 6px; }
        .aw-search-scroll::-webkit-scrollbar-track { background: rgba(0,0,0,.3); }
        .aw-search-scroll::-webkit-scrollbar-thumb {
          background: linear-gradient(180deg, #a855f7, #7e22ce);
          border-radius: 3px;
          box-shadow: 0 0 8px rgba(168,85,247,.5);
        }
        .aw-search-scroll::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(180deg, #c084fc, #a855f7);
        }

        .aw-search-btn { transition: all .25s cubic-bezier(.16,1,.3,1); }
        .aw-search-btn:hover { transform: translateY(-1px); }
        .aw-search-btn:active { transform: translateY(0) scale(.97); }

        .aw-search-input::placeholder { color: rgba(161,161,170,.6); }
        .aw-search-input:focus { outline: none; }

        .aw-kbd {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-width: 20px;
          height: 20px;
          padding: 0 5px;
          border-radius: 4px;
          background: rgba(0,0,0,.5);
          border: 1px solid rgba(168,85,247,.25);
          color: #a1a1aa;
          font-family: 'JetBrains Mono', ui-monospace, monospace;
          font-size: 10px;
          font-weight: 600;
          box-shadow: inset 0 -1px 0 rgba(0,0,0,.4);
        }
      `}} />

      {/* Search Icon Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="p-2 rounded-lg transition-all aw-search-btn"
        title="Search (Ctrl+K)"
        style={{
          color: '#a1a1aa',
          background: 'transparent',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.color = '#c084fc';
          e.currentTarget.style.background = 'rgba(168,85,247,.1)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.color = '#a1a1aa';
          e.currentTarget.style.background = 'transparent';
        }}
      >
        <Search size={20} />
      </button>

      {/* Full Modal Command Palette */}
      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4 aw-search-bg"
          style={{
            background: 'rgba(0,0,0,.72)',
            backdropFilter: 'blur(14px)',
            WebkitBackdropFilter: 'blur(14px)',
          }}
        >
          <div className="fixed inset-0" onClick={() => setIsOpen(false)} />

          <div className="relative w-full max-w-2xl aw-search-glass aw-search-modal flex flex-col max-h-[80vh] z-10">

            {/* Input Bar */}
            <div
              className="relative flex items-center px-4 py-3.5"
              style={{
                borderBottom: '1px solid rgba(168,85,247,.18)',
                background: 'rgba(0,0,0,.3)',
              }}
            >
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mr-3"
                style={{
                  background: 'rgba(168,85,247,.12)',
                  border: '1px solid rgba(168,85,247,.3)',
                  boxShadow: '0 0 16px -4px rgba(168,85,247,.5)',
                }}
              >
                <Search className="w-4 h-4" style={{ color: '#c084fc' }} />
              </div>

              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setSelectedIndex(0);
                }}
                placeholder="Search servers, settings, navigation..."
                className="aw-search-input w-full bg-transparent text-sm sm:text-base text-zinc-100 font-medium"
              />

              {query && (
                <button
                  onClick={() => setQuery("")}
                  className="p-1.5 rounded-md aw-search-btn text-zinc-500 hover:text-white"
                  onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(168,85,247,.1)')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                >
                  <X size={15} />
                </button>
              )}

              <span className="aw-kbd mr-2" style={{ color: '#c084fc', borderColor: 'rgba(168,85,247,.4)' }}>
                <Command size={9} />
                <span className="ml-0.5">K</span>
              </span>

              <button
                onClick={() => setIsOpen(false)}
                className="aw-kbd aw-search-btn"
                style={{ cursor: 'pointer' }}
              >
                ESC
              </button>
            </div>

            {/* Results List */}
            <div className="overflow-y-auto p-2 space-y-1 aw-search-scroll max-h-[420px]">
              {isLoading ? (
                <div className="p-8 text-center flex flex-col items-center gap-2">
                  <div className="w-6 h-6 rounded-full border-2 border-transparent animate-spin" style={{ borderTopColor: '#a855f7', borderRightColor: '#c084fc' }} />
                  <span className="text-xs" style={{ color: '#a1a1aa' }}>Searching servers and system...</span>
                </div>
              ) : allResults.length === 0 ? (
                <div className="p-8 text-center">
                  <div
                    className="w-12 h-12 mx-auto mb-3 rounded-xl flex items-center justify-center"
                    style={{ background: 'rgba(168,85,247,.08)', border: '1px solid rgba(168,85,247,.2)' }}
                  >
                    <Search className="w-6 h-6 text-purple-400/50" />
                  </div>
                  <p className="text-sm font-semibold text-zinc-300">No matching results found</p>
                  <p className="text-xs text-zinc-500 mt-1">
                    Try searching for server name, "deploy", or "settings"
                  </p>
                </div>
              ) : (
                allResults.map((item, idx) => {
                  const isSelected = idx === selectedIndex;
                  return (
                    <div
                      key={item.id}
                      onClick={() => handleSelect(item)}
                      onMouseEnter={() => setSelectedIndex(idx)}
                      className="aw-search-row flex items-center justify-between p-3 rounded-xl cursor-pointer"
                      style={{
                        animationDelay: `${idx * 0.02}s`,
                        background: isSelected
                          ? 'linear-gradient(135deg, rgba(168,85,247,.18), rgba(168,85,247,.08))'
                          : 'transparent',
                        border: isSelected
                          ? '1px solid rgba(168,85,247,.5)'
                          : '1px solid transparent',
                        boxShadow: isSelected
                          ? '0 0 24px -8px rgba(168,85,247,.5), inset 0 1px 0 rgba(255,255,255,.05)'
                          : 'none',
                        transition: 'all .2s cubic-bezier(.16,1,.3,1)',
                      }}
                      onMouseOver={(e) => {
                        if (!isSelected) {
                          e.currentTarget.style.background = 'rgba(168,85,247,.06)';
                          e.currentTarget.style.borderColor = 'rgba(168,85,247,.2)';
                        }
                      }}
                      onMouseOut={(e) => {
                        if (!isSelected) {
                          e.currentTarget.style.background = 'transparent';
                          e.currentTarget.style.borderColor = 'transparent';
                        }
                      }}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
                          style={{
                            background: isSelected
                              ? 'rgba(168,85,247,.2)'
                              : 'rgba(0,0,0,.4)',
                            border: isSelected
                              ? '1px solid rgba(168,85,247,.5)'
                              : '1px solid rgba(168,85,247,.15)',
                            boxShadow: isSelected ? '0 0 16px -4px rgba(168,85,247,.6)' : 'none',
                            transition: 'all .2s ease',
                          }}
                        >
                          {item.icon}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-semibold text-xs sm:text-sm text-zinc-100 truncate">
                              {item.title}
                            </span>
                            <span
                              className="text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-widest"
                              style={
                                item.category === "Server"
                                  ? {
                                      background: 'rgba(168,85,247,.15)',
                                      color: '#c084fc',
                                      border: '1px solid rgba(168,85,247,.35)',
                                    }
                                  : item.category === "Action"
                                  ? {
                                      background: 'rgba(168,85,247,.15)',
                                      color: '#c084fc',
                                      border: '1px solid rgba(168,85,247,.35)',
                                    }
                                  : {
                                      background: 'rgba(0,0,0,.4)',
                                      color: '#a1a1aa',
                                      border: '1px solid rgba(168,85,247,.15)',
                                    }
                              }
                            >
                              {item.category}
                            </span>
                          </div>
                          <p className="text-xs truncate mt-0.5" style={{ color: 'rgba(161,161,170,.8)' }}>
                            {item.subtitle}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0 ml-2">
                        {isSelected && (
                          <span
                            className="hidden sm:flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-md"
                            style={{
                              background: 'rgba(168,85,247,.2)',
                              border: '1px solid rgba(168,85,247,.4)',
                              color: '#c084fc',
                            }}
                          >
                            Open <CornerDownLeft size={10} />
                          </span>
                        )}
                        <ChevronRight
                          className="w-4 h-4 transition-all"
                          style={{
                            color: isSelected ? '#c084fc' : 'rgba(161,161,170,.4)',
                            transform: isSelected ? 'translateX(2px)' : 'translateX(0)',
                          }}
                        />
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Footer */}
            <div
              className="px-4 py-3 flex items-center justify-between text-[10px]"
              style={{
                background: 'rgba(0,0,0,.35)',
                borderTop: '1px solid rgba(168,85,247,.15)',
                color: '#a1a1aa',
              }}
            >
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1">
                  <span className="aw-kbd">↑</span>
                  <span className="aw-kbd">↓</span>
                  <span className="ml-1">navigate</span>
                </span>
                <span className="flex items-center gap-1">
                  <span className="aw-kbd">↵</span>
                  <span className="ml-1">select</span>
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Hexagon size={9} style={{ color: 'rgba(168,85,247,.5)' }} />
                <span
                  className="font-mono uppercase tracking-widest text-[8px]"
                  style={{ color: 'rgba(168,85,247,.5)' }}
                >
                  ASTROWAX
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}