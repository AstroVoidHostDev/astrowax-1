import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Search,
  Download,
  RefreshCw,
  Box,
  AlertCircle,
  Trash2,
  CheckCircle2,
  Layers,
  Sparkles,
  Server,
  FolderDown,
  RotateCw,
  Hexagon
} from "lucide-react";
import { LoadingOverlay } from "./LoadingOverlay";
import ModrinthVersionModal from "./ModrinthVersionModal";
import {
  ModrinthHit,
  InstalledItem,
  formatFileSize,
  normalizeMinecraftVersion
} from "../utils/modrinthHelper";

// ============================================
// AstroWax Panel V1.80 — Mod Manager
// Glass + Purple Theme
// ============================================

interface ModManagerProps {
  serverId: string;
  server?: any;
}

export default function ModManager({ serverId, server }: ModManagerProps) {
  const [currentServer, setCurrentServer] = useState<any>(server || null);
  const [activeTab, setActiveTab] = useState<"search" | "installed">("search");

  const [mods, setMods] = useState<ModrinthHit[]>([]);
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState("");
  const [isInstallingId, setIsInstallingId] = useState<string | null>(null);

  const [installedMods, setInstalledMods] = useState<InstalledItem[]>([]);
  const [loadingInstalled, setLoadingInstalled] = useState(false);
  const [deletingMod, setDeletingMod] = useState<string | null>(null);

  const [statusMsg, setStatusMsg] = useState<{ text: string; type: "success" | "error" } | null>(null);

  const [modalProject, setModalProject] = useState<ModrinthHit | null>(null);

  useEffect(() => {
    if (!currentServer) {
      axios.get(`/api/servers/${serverId}`)
        .then(res => setCurrentServer(res.data))
        .catch(console.error);
    }
  }, [serverId, currentServer]);

  const serverType = (currentServer?.type || "FABRIC").toUpperCase();
  const serverVersion = currentServer?.version || "1.20.1";
  const normalizedGameVer = normalizeMinecraftVersion(serverVersion);

  const isProxy = ["VELOCITY", "BUNGEECORD", "WATERFALL"].includes(serverType);
  const isCompatibleSoftware = ["FABRIC", "FORGE", "NEOFORGE", "QUILT"].includes(serverType);

  const fetchInstalledMods = async () => {
    if (isProxy || !isCompatibleSoftware) return;
    try {
      setLoadingInstalled(true);
      const res = await axios.get(`/api/servers/${serverId}/mods/installed`);
      if (res.data && Array.isArray(res.data.mods)) {
        setInstalledMods(res.data.mods);
      }
    } catch (err) {
      console.error("Failed to load installed mods", err);
    } finally {
      setLoadingInstalled(false);
    }
  };

  useEffect(() => {
    fetchInstalledMods();
  }, [serverId, isProxy, isCompatibleSoftware]);

  const searchMods = async (searchQuery: string = "sodium") => {
    if (isProxy || !isCompatibleSoftware) return;
    try {
      setLoading(true);
      const q = searchQuery.trim() || "sodium";

      const externalAxios = axios.create();
      delete externalAxios.defaults.headers.common["Authorization"];

      const res = await externalAxios.get("https://api.modrinth.com/v2/search", {
        params: {
          query: q,
          facets: JSON.stringify([["project_type:mod"]]),
          limit: 20,
        },
      });

      if (res.data && Array.isArray(res.data.hits)) {
        setMods(res.data.hits);
      } else {
        setMods([]);
      }
    } catch (err) {
      console.error("Error searching mods:", err);
      setMods([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    searchMods("sodium");
  }, [isProxy, isCompatibleSoftware]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    searchMods(query);
  };

  const handleAutoInstall = async (mod: ModrinthHit) => {
    setStatusMsg(null);
    try {
      setIsInstallingId(mod.project_id);

      const res = await axios.post(`/api/servers/${serverId}/mods/install`, {
        pluginId: mod.project_id,
        pluginName: mod.title,
      });

      setStatusMsg({
        text: res.data.message || `Successfully installed ${mod.title} into mods folder!`,
        type: "success",
      });

      await fetchInstalledMods();
    } catch (err: any) {
      setStatusMsg({
        text: err.response?.data?.error || `Failed to auto-install ${mod.title}.`,
        type: "error",
      });
    } finally {
      setIsInstallingId(null);
    }
  };

  const handleDeleteMod = async (filename: string) => {
    if (!window.confirm(`Are you sure you want to uninstall and remove "${filename}" from your server?`)) {
      return;
    }

    try {
      setDeletingMod(filename);
      const res = await axios.delete(`/api/servers/${serverId}/mods/${encodeURIComponent(filename)}`);
      setStatusMsg({
        text: res.data.message || `Uninstalled ${filename}. Restart server to apply.`,
        type: "success",
      });
      await fetchInstalledMods();
    } catch (err: any) {
      setStatusMsg({
        text: err.response?.data?.error || `Failed to delete ${filename}.`,
        type: "error",
      });
    } finally {
      setDeletingMod(null);
    }
  };

  if (isProxy) {
    return (
      <div className="flex-1 overflow-y-auto p-4 md:p-8 text-foreground">
        <div className="max-w-4xl mx-auto space-y-6">
          <div 
            className="p-6 rounded-2xl"
            style={{
              background: 'linear-gradient(135deg, rgba(245,158,11,.12), rgba(245,158,11,.04))',
              border: '1px solid rgba(245,158,11,.4)',
              backdropFilter: 'blur(16px)',
            }}
          >
            <div className="flex items-start gap-3">
              <AlertCircle className="w-6 h-6 shrink-0 mt-0.5" style={{ color: '#fbbf24' }} />
              <div>
                <h3 className="text-lg font-bold" style={{ color: '#fcd34d' }}>
                  Mod Manager Disabled for Proxy Servers
                </h3>
                <p className="text-sm mt-1 leading-relaxed" style={{ color: 'rgba(252,211,77,.85)' }}>
                  You are currently running <strong>{serverType}</strong>. Proxy networks do not support Minecraft Forge or Fabric mods.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!isCompatibleSoftware) {
    return (
      <div className="flex-1 overflow-y-auto p-4 md:p-8 text-foreground">
        <div className="max-w-4xl mx-auto space-y-6">
          <div 
            className="p-6 rounded-2xl"
            style={{
              background: 'linear-gradient(135deg, rgba(168,85,247,.12), rgba(168,85,247,.04))',
              border: '1px solid rgba(168,85,247,.4)',
              backdropFilter: 'blur(16px)',
            }}
          >
            <div className="flex items-start gap-3">
              <AlertCircle className="w-6 h-6 shrink-0 mt-0.5" style={{ color: '#c084fc' }} />
              <div>
                <h3 className="text-lg font-bold" style={{ color: '#e9d5ff' }}>
                  Mod Manager is for Fabric & Forge Servers
                </h3>
                <p className="text-sm mt-1 leading-relaxed" style={{ color: 'rgba(233,213,255,.85)' }}>
                  Your server is running <strong>{serverType}</strong>. To use mods, switch to a modded runtime like <strong>Fabric</strong>, <strong>Forge</strong>, or <strong>NeoForge</strong>.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const installedFileNames = installedMods.map((m) => m.filename);

  return (
    <div className="flex-1 overflow-y-auto custom-scrollbar p-4 md:p-8 text-foreground">
      <style dangerouslySetInnerHTML={{__html: `
        .aw-mm-glass {
          background: linear-gradient(135deg, rgba(20,12,35,.55) 0%, rgba(13,8,25,.7) 100%);
          backdrop-filter: blur(16px) saturate(1.4);
          -webkit-backdrop-filter: blur(16px) saturate(1.4);
          border: 1px solid rgba(168,85,247,.2);
          border-radius: 16px;
          position: relative;
          overflow: hidden;
        }
        .aw-mm-glass::before {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(168,85,247,.5), rgba(255,255,255,.2), rgba(168,85,247,.5), transparent);
          pointer-events: none;
        }
        .aw-mm-row {
          transition: all .25s cubic-bezier(.16,1,.3,1);
          position: relative;
        }
        .aw-mm-row:hover {
          background: rgba(168,85,247,.06);
        }
        .aw-mm-btn {
          transition: all .25s cubic-bezier(.16,1,.3,1);
        }
        .aw-mm-btn:hover:not(:disabled) {
          transform: translateY(-1px);
        }
        .aw-mm-btn:active:not(:disabled) {
          transform: translateY(0) scale(.97);
        }
        @keyframes awMmIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .aw-mm-in { animation: awMmIn .4s cubic-bezier(.16,1,.3,1) both; }
      `}} />

      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header + Tabs */}
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
          <div>
            <h2 className="text-2xl md:text-3xl font-black text-white tracking-tight flex items-center gap-2.5">
              <Box className="w-7 h-7" style={{ color: '#c084fc', filter: 'drop-shadow(0 0 8px rgba(168,85,247,.6))' }} />
              <span>Mod Manager</span>
              <span 
                className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[9px] font-mono uppercase tracking-widest"
                style={{
                  background: 'rgba(168,85,247,.1)',
                  border: '1px solid rgba(168,85,247,.3)',
                  color: '#c084fc',
                }}
              >
                <Hexagon size={9} />
                ASTROWAX
              </span>
            </h2>
            <p className="text-xs text-zinc-500 mt-1">
              Search and install Fabric & Forge mods from <strong className="text-purple-300">Modrinth</strong> with auto-version detection.
            </p>
          </div>

          <div 
            className="flex items-center p-1 rounded-xl"
            style={{
              background: 'rgba(0,0,0,.4)',
              border: '1px solid rgba(168,85,247,.25)',
            }}
          >
            <button
              onClick={() => setActiveTab("search")}
              className="px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 aw-mm-btn"
              style={
                activeTab === "search"
                  ? {
                      background: 'linear-gradient(135deg, #a855f7, #7e22ce)',
                      color: '#fff',
                      boxShadow: '0 4px 16px -4px rgba(168,85,247,.6)',
                    }
                  : { color: '#a1a1aa' }
              }
            >
              <Search className="w-3.5 h-3.5" />
              Discover & Install
            </button>
            <button
              onClick={() => {
                setActiveTab("installed");
                fetchInstalledMods();
              }}
              className="px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 aw-mm-btn"
              style={
                activeTab === "installed"
                  ? {
                      background: 'linear-gradient(135deg, #a855f7, #7e22ce)',
                      color: '#fff',
                      boxShadow: '0 4px 16px -4px rgba(168,85,247,.6)',
                    }
                  : { color: '#a1a1aa' }
              }
            >
              <FolderDown className="w-3.5 h-3.5" />
              Installed ({installedMods.length})
            </button>
          </div>
        </div>

        {/* Server Context Banner */}
        <div 
          className="p-3.5 rounded-xl flex flex-wrap items-center justify-between gap-3 text-xs"
          style={{
            background: 'linear-gradient(135deg, rgba(20,12,35,.6), rgba(13,8,25,.7))',
            border: '1px solid rgba(168,85,247,.2)',
            backdropFilter: 'blur(12px)',
          }}
        >
          <div className="flex items-center gap-2.5 flex-wrap">
            <span 
              className="px-2 py-1 rounded font-mono font-medium flex items-center gap-1.5"
              style={{
                background: 'rgba(0,0,0,.4)',
                color: '#c084fc',
                border: '1px solid rgba(168,85,247,.3)',
              }}
            >
              <Server className="w-3.5 h-3.5" />
              {serverType}
            </span>
            <span className="text-zinc-500">Target Game Version:</span>
            <span 
              className="px-2 py-1 rounded font-mono font-bold"
              style={{
                background: 'rgba(168,85,247,.15)',
                border: '1px solid rgba(168,85,247,.35)',
                color: '#c084fc',
              }}
            >
              {normalizedGameVer}
            </span>
            <span className="text-zinc-700">•</span>
            <span className="text-zinc-500">Target Loader:</span>
            <span className="text-purple-300 font-medium capitalize">{serverType.toLowerCase()}</span>
          </div>

          <div className="flex items-center gap-1.5 text-[11px] font-semibold" style={{ color: '#c084fc' }}>
            <Sparkles className="w-3.5 h-3.5" />
            <span>Smart Auto-Detection Active</span>
          </div>
        </div>

        {/* Toast */}
        {statusMsg && (
          <div
            className="p-3.5 rounded-xl border text-sm flex items-center justify-between aw-mm-in"
            style={
              statusMsg.type === "success"
                ? {
                    background: 'linear-gradient(135deg, rgba(16,185,129,.15), rgba(16,185,129,.04))',
                    border: '1px solid rgba(16,185,129,.4)',
                    color: '#6ee7b7',
                  }
                : {
                    background: 'linear-gradient(135deg, rgba(244,63,94,.15), rgba(244,63,94,.04))',
                    border: '1px solid rgba(244,63,94,.4)',
                    color: '#fda4af',
                  }
            }
          >
            <div className="flex items-center gap-2">
              {statusMsg.type === "success" ? (
                <CheckCircle2 className="w-4 h-4 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 shrink-0" />
              )}
              <span>{statusMsg.text}</span>
            </div>
            <button
              onClick={() => setStatusMsg(null)}
              className="text-xs opacity-70 hover:opacity-100 ml-4 font-medium"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* SEARCH TAB */}
        {activeTab === "search" && (
          <div className="space-y-4">
            <div className="aw-mm-glass p-4 md:p-5 space-y-3">
              <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-purple-400/60" />
                  <input
                    type="text"
                    placeholder="Search mods on Modrinth (e.g. sodium, jei, iris, lithium, fabric api)..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    className="w-full rounded-xl py-2.5 pl-10 pr-4 text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none transition-all"
                    style={{
                      background: 'rgba(0,0,0,.4)',
                      border: '1px solid rgba(168,85,247,.2)',
                    }}
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor = 'rgba(168,85,247,.6)';
                      e.currentTarget.style.boxShadow = '0 0 0 3px rgba(168,85,247,.1), 0 0 20px -4px rgba(168,85,247,.4)';
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor = 'rgba(168,85,247,.2)';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  />
                </div>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl text-white text-sm font-semibold aw-mm-btn shrink-0 flex items-center justify-center gap-2"
                  style={{
                    background: 'linear-gradient(135deg, #a855f7, #7e22ce)',
                    boxShadow: '0 4px 16px -4px rgba(168,85,247,.5)',
                  }}
                >
                  <Search className="w-4 h-4" />
                  Search Modrinth
                </button>
              </form>

              <div className="flex items-center gap-1.5 flex-wrap pt-1 text-xs">
                <span className="text-zinc-500 font-medium mr-1">Popular:</span>
                {["sodium","jei","iris","lithium","fabric-api","appleskin","ferritecore","cloth-config"].map((name) => (
                  <button
                    key={name}
                    type="button"
                    onClick={() => {
                      setQuery(name);
                      searchMods(name);
                    }}
                    className="px-2.5 py-1 rounded-lg text-[11px] transition-all"
                    style={{
                      background: 'rgba(0,0,0,.3)',
                      border: '1px solid rgba(168,85,247,.2)',
                      color: '#a1a1aa',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = 'rgba(168,85,247,.5)';
                      e.currentTarget.style.color = '#c084fc';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = 'rgba(168,85,247,.2)';
                      e.currentTarget.style.color = '#a1a1aa';
                    }}
                  >
                    {name}
                  </button>
                ))}
              </div>
            </div>

            <div className="aw-mm-glass overflow-hidden">
              {loading ? (
                <div className="p-12 text-center flex flex-col items-center aw-mm-in">
                  <RefreshCw className="w-7 h-7 animate-spin mb-3" style={{ color: '#a855f7' }} />
                  <span className="font-medium text-zinc-400">Searching Modrinth catalog...</span>
                </div>
              ) : mods.length === 0 ? (
                <div className="p-12 text-center flex flex-col items-center aw-mm-in">
                  <AlertCircle className="w-8 h-8 mb-3 text-purple-400/40" />
                  <p className="font-semibold text-zinc-300">No mods found</p>
                  <p className="text-xs text-zinc-500 mt-1">
                    Try another keyword like "sodium" or "jei".
                  </p>
                </div>
              ) : (
                <div>
                  {mods.map((mod, idx) => {
                    const isInstallingThis = isInstallingId === mod.project_id;

                    return (
                      <div
                        key={mod.project_id}
                        className="aw-mm-row p-4 md:p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 aw-mm-in"
                        style={{
                          animationDelay: `${idx * 0.03}s`,
                          borderBottom: idx < mods.length - 1 ? '1px solid rgba(168,85,247,.1)' : 'none',
                        }}
                      >
                        <div className="flex items-start gap-4 flex-1 min-w-0">
                          <div 
                            className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 overflow-hidden"
                            style={{
                              background: 'rgba(0,0,0,.4)',
                              border: '1px solid rgba(168,85,247,.25)',
                            }}
                          >
                            {mod.icon_url ? (
                              <img src={mod.icon_url} alt={mod.title} className="w-full h-full object-cover" />
                            ) : (
                              <Box className="w-6 h-6" style={{ color: '#c084fc' }} />
                            )}
                          </div>

                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h4 className="font-bold text-zinc-100 text-sm md:text-base truncate">
                                {mod.title}
                              </h4>
                              <span 
                                className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider"
                                style={{
                                  background: 'rgba(168,85,247,.15)',
                                  color: '#c084fc',
                                  border: '1px solid rgba(168,85,247,.3)',
                                }}
                              >
                                Modrinth
                              </span>
                              {mod.author && (
                                <span className="text-xs text-zinc-500">
                                  by <span className="text-purple-300 font-medium">{mod.author}</span>
                                </span>
                              )}
                            </div>

                            <p className="text-xs text-zinc-400 line-clamp-2 mt-1 leading-relaxed">
                              {mod.description}
                            </p>

                            <div className="flex items-center gap-4 mt-2.5 text-[11px] text-zinc-500 flex-wrap">
                              <span className="flex items-center gap-1 font-mono">
                                <Download className="w-3.5 h-3.5" />
                                {mod.downloads.toLocaleString()}
                              </span>
                              <div className="flex items-center gap-1">
                                {mod.categories?.slice(0, 4).map((cat) => (
                                  <span
                                    key={cat}
                                    className="px-1.5 py-0.5 rounded text-[10px] capitalize"
                                    style={{
                                      background: 'rgba(0,0,0,.35)',
                                      color: '#a1a1aa',
                                      border: '1px solid rgba(168,85,247,.15)',
                                    }}
                                  >
                                    {cat}
                                  </span>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 w-full md:w-auto shrink-0 pt-2 md:pt-0">
                          <button
                            onClick={() => setModalProject(mod)}
                            className="flex-1 md:flex-initial px-3.5 py-2 rounded-xl text-xs font-semibold aw-mm-btn flex items-center justify-center gap-1.5"
                            style={{
                              background: 'rgba(0,0,0,.4)',
                              border: '1px solid rgba(168,85,247,.25)',
                              color: '#e9d5ff',
                            }}
                            title="View all versions and select specific files"
                          >
                            <Layers className="w-3.5 h-3.5" />
                            <span>Versions & Files</span>
                          </button>

                          <button
                            onClick={() => handleAutoInstall(mod)}
                            disabled={isInstallingThis}
                            className="flex-1 md:flex-initial px-4 py-2 rounded-xl text-xs font-semibold aw-mm-btn flex items-center justify-center gap-1.5 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                            style={{
                              background: 'linear-gradient(135deg, #a855f7, #7e22ce)',
                              boxShadow: '0 4px 16px -4px rgba(168,85,247,.5)',
                            }}
                          >
                            {isInstallingThis ? (
                              <>
                                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                                <span>Installing...</span>
                              </>
                            ) : (
                              <>
                                <Sparkles className="w-3.5 h-3.5" />
                                <span>Auto-Install</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* INSTALLED TAB */}
        {activeTab === "installed" && (
          <div className="aw-mm-glass p-4 md:p-6 aw-mm-in">
            <div 
              className="flex items-center justify-between pb-4"
              style={{ borderBottom: '1px solid rgba(168,85,247,.15)' }}
            >
              <div>
                <h3 className="text-base font-bold text-zinc-100 flex items-center gap-2">
                  <FolderDown className="w-5 h-5" style={{ color: '#c084fc' }} />
                  <span>Installed Mods in <code className="text-purple-300">mods/</code></span>
                </h3>
                <p className="text-xs text-zinc-500 mt-0.5">
                  Managing <strong className="text-purple-300">{installedMods.length}</strong> mod jar files.
                </p>
              </div>

              <button
                onClick={fetchInstalledMods}
                disabled={loadingInstalled}
                className="px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 aw-mm-btn"
                style={{
                  background: 'rgba(0,0,0,.4)',
                  border: '1px solid rgba(168,85,247,.25)',
                  color: '#c084fc',
                }}
              >
                <RotateCw className={`w-3.5 h-3.5 ${loadingInstalled ? "animate-spin" : ""}`} />
                Refresh
              </button>
            </div>

            <div className="mt-2">
              {loadingInstalled ? (
                <div className="p-8 text-center flex flex-col items-center">
                  <RefreshCw className="w-6 h-6 animate-spin mb-2" style={{ color: '#a855f7' }} />
                  <span className="text-zinc-400">Scanning mods directory...</span>
                </div>
              ) : installedMods.length === 0 ? (
                <div className="p-8 text-center flex flex-col items-center">
                  <Box className="w-8 h-8 mb-2 text-purple-400/40" />
                  <p className="font-semibold text-zinc-300">No mods installed yet</p>
                  <p className="text-xs text-zinc-500 mt-1">
                    Use the "Discover & Install" tab to search and install mods.
                  </p>
                  <button
                    onClick={() => setActiveTab("search")}
                    className="mt-4 px-4 py-2 rounded-xl text-xs font-semibold text-white aw-mm-btn"
                    style={{
                      background: 'linear-gradient(135deg, #a855f7, #7e22ce)',
                      boxShadow: '0 4px 16px -4px rgba(168,85,247,.5)',
                    }}
                  >
                    Browse Modrinth Mods
                  </button>
                </div>
              ) : (
                installedMods.map((mod, idx) => (
                  <div
                    key={mod.filename}
                    className="py-3.5 flex items-center justify-between gap-4 aw-mm-row rounded-lg px-2"
                    style={{
                      borderBottom: idx < installedMods.length - 1 ? '1px solid rgba(168,85,247,.1)' : 'none',
                    }}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div 
                        className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
                        style={{
                          background: 'rgba(168,85,247,.1)',
                          border: '1px solid rgba(168,85,247,.3)',
                          color: '#c084fc',
                        }}
                      >
                        <Box className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-mono text-xs md:text-sm font-semibold text-zinc-200 truncate">
                          {mod.filename}
                        </p>
                        <div className="flex items-center gap-3 text-[11px] text-zinc-500 mt-0.5">
                          <span>{formatFileSize(mod.size)}</span>
                          {mod.modified > 0 && (
                            <span>Installed: {new Date(mod.modified).toLocaleDateString()}</span>
                          )}
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => handleDeleteMod(mod.filename)}
                      disabled={deletingMod === mod.filename}
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 shrink-0 disabled:opacity-50 aw-mm-btn"
                      style={{
                        background: 'rgba(244,63,94,.12)',
                        border: '1px solid rgba(244,63,94,.35)',
                        color: '#fda4af',
                      }}
                    >
                      {deletingMod === mod.filename ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          <span>Removing...</span>
                        </>
                      ) : (
                        <>
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Uninstall</span>
                        </>
                      )}
                    </button>
                  </div>
                ))
              )}
            </div>

            {installedMods.length > 0 && (
              <div 
                className="mt-4 pt-3 text-xs flex items-center gap-2"
                style={{
                  borderTop: '1px solid rgba(168,85,247,.15)',
                  color: 'rgba(251,191,36,.9)',
                }}
              >
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>Remember to restart your server from the Console to load any newly installed or removed mods.</span>
              </div>
            )}
          </div>
        )}

        {/* Version Modal */}
        {modalProject && (
          <ModrinthVersionModal
            isOpen={Boolean(modalProject)}
            onClose={() => setModalProject(null)}
            serverId={serverId}
            projectId={modalProject.project_id}
            projectTitle={modalProject.title}
            projectIcon={modalProject.icon_url}
            serverType={serverType}
            serverVersion={serverVersion}
            itemType="mod"
            installedFiles={installedFileNames}
            onInstallSuccess={async (filename, version) => {
              setStatusMsg({
                text: `Successfully installed ${filename} (Version: ${version}) into mods folder!`,
                type: "success",
              });
              await fetchInstalledMods();
            }}
          />
        )}
      </div>

      {isInstallingId !== null && <LoadingOverlay message="Auto-detecting version and installing mod jar..." />}
    </div>
  );
}