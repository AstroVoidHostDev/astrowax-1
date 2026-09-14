import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  X,
  Download,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  FileCode,
  Tag,
  Calendar,
  Layers,
  Filter,
  Check,
  Hexagon
} from "lucide-react";
import {
  ModrinthFileVersion,
  formatFileSize,
  isVersionCompatible,
  normalizeMinecraftVersion
} from "../utils/modrinthHelper";

// ============================================
// AstroWax Panel V1.80 — Modrinth Version Modal
// Glass + Purple Theme
// ============================================

interface ModrinthVersionModalProps {
  isOpen: boolean;
  onClose: () => void;
  serverId: string;
  projectId: string;
  projectTitle: string;
  projectIcon: string | null;
  serverType: string;
  serverVersion: string;
  itemType: "plugin" | "mod";
  installedFiles: string[];
  onInstallSuccess: (filename: string, version: string) => void;
}

export default function ModrinthVersionModal({
  isOpen,
  onClose,
  serverId,
  projectId,
  projectTitle,
  projectIcon,
  serverType,
  serverVersion,
  itemType,
  installedFiles,
  onInstallSuccess,
}: ModrinthVersionModalProps) {
  const [versions, setVersions] = useState<ModrinthFileVersion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterCompatibleOnly, setFilterCompatibleOnly] = useState(false);
  const [channelFilter, setChannelFilter] = useState<"all" | "release" | "beta">("all");
  const [searchVersionQuery, setSearchVersionQuery] = useState("");
  const [installingFileUrl, setInstallingFileUrl] = useState<string | null>(null);
  const [installError, setInstallError] = useState<string | null>(null);
  const [successFile, setSuccessFile] = useState<string | null>(null);

  const normalizedGameVer = normalizeMinecraftVersion(serverVersion);

  useEffect(() => {
    if (!isOpen || !projectId) return;

    let isMounted = true;
    setLoading(true);
    setError(null);
    setInstallError(null);
    setSuccessFile(null);

    const fetchVersions = async () => {
      try {
        const res = await axios.get(`/api/servers/${serverId}/modrinth/versions/${projectId}`);
        if (isMounted) {
          const data = res.data;
          if (Array.isArray(data)) {
            setVersions(data);
            const hasCompatible = data.some((v) => isVersionCompatible(v, serverType, serverVersion));
            if (hasCompatible) {
              setFilterCompatibleOnly(true);
            }
          }
        }
      } catch (err: any) {
        try {
          const directRes = await axios.get(`https://api.modrinth.com/v2/project/${projectId}/version`, {
            headers: { "User-Agent": "AstroWax-Panel/1.0" }
          });
          if (isMounted && Array.isArray(directRes.data)) {
            setVersions(directRes.data);
            const hasCompatible = directRes.data.some((v) => isVersionCompatible(v, serverType, serverVersion));
            if (hasCompatible) {
              setFilterCompatibleOnly(true);
            }
          }
        } catch (fallbackErr: any) {
          if (isMounted) {
            setError(err.response?.data?.error || "Failed to load project versions from Modrinth.");
          }
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchVersions();

    return () => {
      isMounted = false;
    };
  }, [isOpen, projectId, serverId, serverType, serverVersion]);

  if (!isOpen) return null;

  const handleInstallFile = async (version: ModrinthFileVersion, file: ModrinthFileVersion["files"][0]) => {
    try {
      setInstallError(null);
      setInstallingFileUrl(file.url);
      setSuccessFile(null);

      const endpoint = itemType === "plugin" 
        ? `/api/servers/${serverId}/plugins/install`
        : `/api/servers/${serverId}/mods/install`;

      const res = await axios.post(endpoint, {
        pluginId: projectId,
        pluginName: projectTitle,
        versionId: version.id,
        fileUrl: file.url,
        fileName: file.filename
      });

      const installedName = res.data.filename || file.filename;
      setSuccessFile(installedName);
      onInstallSuccess(installedName, version.version_number || version.name);
    } catch (err: any) {
      setInstallError(err.response?.data?.error || "Failed to install file into server.");
    } finally {
      setInstallingFileUrl(null);
    }
  };

  const filteredVersions = versions.filter((v) => {
    if (channelFilter !== "all" && v.version_type !== channelFilter) return false;
    if (filterCompatibleOnly && !isVersionCompatible(v, serverType, serverVersion)) return false;
    if (searchVersionQuery.trim()) {
      const q = searchVersionQuery.toLowerCase().trim();
      const matchNum = v.version_number?.toLowerCase().includes(q);
      const matchName = v.name?.toLowerCase().includes(q);
      const matchGame = v.game_versions?.some((gv) => gv.toLowerCase().includes(q));
      if (!matchNum && !matchName && !matchGame) return false;
    }
    return true;
  });

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{
        background: 'rgba(0,0,0,.8)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        animation: 'awModalBgIn .2s ease both',
      }}
    >
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes awModalBgIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes awModalIn {
          from { opacity: 0; transform: translateY(16px) scale(.96); filter: blur(6px); }
          to { opacity: 1; transform: translateY(0) scale(1); filter: blur(0); }
        }
        @keyframes awRowIn {
          from { opacity: 0; transform: translateY(6px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .aw-modal-in { animation: awModalIn .35s cubic-bezier(.16,1,.3,1) both; }
        .aw-modal-row { animation: awRowIn .35s cubic-bezier(.16,1,.3,1) both; }
        
        .aw-modal-glass {
          background: linear-gradient(135deg, rgba(20,12,35,.92) 0%, rgba(13,8,25,.96) 100%);
          backdrop-filter: blur(24px) saturate(1.4);
          -webkit-backdrop-filter: blur(24px) saturate(1.4);
          border: 1px solid rgba(168,85,247,.3);
          border-radius: 20px;
          position: relative;
          overflow: hidden;
          box-shadow: 
            0 30px 80px -20px rgba(0,0,0,.8),
            0 0 0 1px rgba(168,85,247,.15),
            inset 0 1px 0 rgba(255,255,255,.06);
        }
        .aw-modal-glass::before {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(168,85,247,.7), rgba(255,255,255,.3), rgba(168,85,247,.7), transparent);
          pointer-events: none;
          z-index: 2;
        }
        
        .aw-modal-scroll::-webkit-scrollbar { width: 8px; }
        .aw-modal-scroll::-webkit-scrollbar-track { background: rgba(0,0,0,.3); }
        .aw-modal-scroll::-webkit-scrollbar-thumb {
          background: linear-gradient(180deg, #a855f7, #7e22ce);
          border-radius: 4px;
          box-shadow: 0 0 8px rgba(168,85,247,.5);
        }
        .aw-modal-scroll::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(180deg, #c084fc, #a855f7);
        }
        
        .aw-modal-btn {
          transition: all .25s cubic-bezier(.16,1,.3,1);
        }
        .aw-modal-btn:hover:not(:disabled) {
          transform: translateY(-1px);
        }
        .aw-modal-btn:active:not(:disabled) {
          transform: translateY(0) scale(.97);
        }
      `}} />

      <div 
        className="relative w-full max-w-4xl max-h-[90vh] flex flex-col aw-modal-glass aw-modal-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div 
          className="flex items-center justify-between p-4 md:p-6"
          style={{
            borderBottom: '1px solid rgba(168,85,247,.18)',
            background: 'rgba(0,0,0,.3)',
          }}
        >
          <div className="flex items-center gap-3 min-w-0">
            <div 
              className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 overflow-hidden"
              style={{
                background: 'rgba(0,0,0,.4)',
                border: '1px solid rgba(168,85,247,.3)',
              }}
            >
              {projectIcon ? (
                <img src={projectIcon} alt={projectTitle} className="w-full h-full object-cover" />
              ) : (
                <FileCode className="w-6 h-6" style={{ color: '#c084fc' }} />
              )}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-lg md:text-xl font-bold text-zinc-100 truncate">{projectTitle}</h3>
                <span 
                  className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider flex items-center gap-1"
                  style={{
                    background: 'rgba(168,85,247,.15)',
                    color: '#c084fc',
                    border: '1px solid rgba(168,85,247,.35)',
                  }}
                >
                  <Hexagon size={9} />
                  Modrinth
                </span>
              </div>
              <p className="text-xs text-zinc-500 mt-0.5 flex items-center gap-2 flex-wrap">
                <span>Server: <strong className="text-purple-300 font-semibold">{serverType}</strong></span>
                <span className="text-zinc-700">•</span>
                <span>MC Version: <strong className="text-purple-300 font-semibold">{normalizedGameVer}</strong></span>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-lg aw-modal-btn text-zinc-500 hover:text-white transition-colors"
            style={{
              background: 'rgba(168,85,247,.08)',
              border: '1px solid rgba(168,85,247,.2)',
            }}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Alerts */}
        {successFile && (
          <div 
            className="mx-6 mt-4 p-3 rounded-xl text-sm flex items-center gap-2 aw-modal-row"
            style={{
              background: 'linear-gradient(135deg, rgba(16,185,129,.15), rgba(16,185,129,.04))',
              border: '1px solid rgba(16,185,129,.4)',
              color: '#6ee7b7',
            }}
          >
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>Installed <strong>{successFile}</strong> cleanly into the server!</span>
          </div>
        )}

        {installError && (
          <div 
            className="mx-6 mt-4 p-3 rounded-xl text-sm flex items-center justify-between aw-modal-row"
            style={{
              background: 'linear-gradient(135deg, rgba(244,63,94,.15), rgba(244,63,94,.04))',
              border: '1px solid rgba(244,63,94,.4)',
              color: '#fda4af',
            }}
          >
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{installError}</span>
            </div>
            <button onClick={() => setInstallError(null)} className="text-xs opacity-75 hover:opacity-100">
              Dismiss
            </button>
          </div>
        )}

        {/* Filters */}
        <div 
          className="p-4 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 text-xs"
          style={{
            borderBottom: '1px solid rgba(168,85,247,.12)',
            background: 'rgba(0,0,0,.2)',
          }}
        >
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => setFilterCompatibleOnly(!filterCompatibleOnly)}
              className="px-3 py-1.5 rounded-lg font-medium flex items-center gap-1.5 aw-modal-btn"
              style={
                filterCompatibleOnly
                  ? {
                      background: 'rgba(168,85,247,.2)',
                      border: '1px solid rgba(168,85,247,.5)',
                      color: '#c084fc',
                      boxShadow: '0 0 16px -4px rgba(168,85,247,.5)',
                    }
                  : {
                      background: 'rgba(0,0,0,.4)',
                      border: '1px solid rgba(168,85,247,.2)',
                      color: '#a1a1aa',
                    }
              }
            >
              <Check className={`w-3.5 h-3.5 ${filterCompatibleOnly ? "text-purple-400" : "opacity-30"}`} />
              Only Compatible with {serverType} {normalizedGameVer}
            </button>

            <div 
              className="flex items-center rounded-lg p-0.5"
              style={{
                border: '1px solid rgba(168,85,247,.25)',
                background: 'rgba(0,0,0,.4)',
              }}
            >
              {(["all", "release", "beta"] as const).map((type) => (
                <button
                  key={type}
                  onClick={() => setChannelFilter(type)}
                  className="px-2.5 py-1 rounded-md capitalize font-medium aw-modal-btn"
                  style={
                    channelFilter === type
                      ? {
                          background: 'linear-gradient(135deg, #a855f7, #7e22ce)',
                          color: '#fff',
                          fontWeight: 600,
                        }
                      : { color: '#a1a1aa' }
                  }
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          <div className="relative">
            <input
              type="text"
              placeholder="Filter versions or MC version (e.g. 1.21)..."
              value={searchVersionQuery}
              onChange={(e) => setSearchVersionQuery(e.target.value)}
              className="w-full md:w-64 rounded-lg px-3 py-1.5 text-xs text-zinc-200 placeholder-zinc-600 focus:outline-none transition-all"
              style={{
                background: 'rgba(0,0,0,.4)',
                border: '1px solid rgba(168,85,247,.2)',
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = 'rgba(168,85,247,.6)';
                e.currentTarget.style.boxShadow = '0 0 0 3px rgba(168,85,247,.1)';
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = 'rgba(168,85,247,.2)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            />
          </div>
        </div>

        {/* Version List */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 aw-modal-scroll">
          {loading ? (
            <div className="p-12 text-center flex flex-col items-center aw-modal-row">
              <RefreshCw className="w-8 h-8 animate-spin mb-3" style={{ color: '#a855f7' }} />
              <span className="text-zinc-400">Loading versions from Modrinth...</span>
            </div>
          ) : error ? (
            <div className="p-8 text-center flex flex-col items-center aw-modal-row">
              <AlertCircle className="w-8 h-8 mb-3" style={{ color: '#f87171' }} />
              <span style={{ color: '#fda4af' }}>{error}</span>
            </div>
          ) : filteredVersions.length === 0 ? (
            <div className="p-12 text-center flex flex-col items-center aw-modal-row">
              <AlertCircle className="w-8 h-8 mb-3 text-purple-400/40" />
              <p className="font-semibold text-zinc-300">No matching versions found</p>
              <p className="text-xs text-zinc-500 mt-1">
                {filterCompatibleOnly 
                  ? `Try unchecking "Only Compatible with ${serverType} ${normalizedGameVer}".`
                  : "Try clearing your version search filter."}
              </p>
              {filterCompatibleOnly && (
                <button
                  onClick={() => setFilterCompatibleOnly(false)}
                  className="mt-3 px-3 py-1.5 rounded-lg text-xs font-medium aw-modal-btn"
                  style={{
                    background: 'rgba(168,85,247,.15)',
                    border: '1px solid rgba(168,85,247,.4)',
                    color: '#c084fc',
                  }}
                >
                  Show All Versions
                </button>
              )}
            </div>
          ) : (
            filteredVersions.map((ver, idx) => {
              const isCompatible = isVersionCompatible(ver, serverType, serverVersion);

              return (
                <div
                  key={ver.id}
                  className="rounded-xl p-4 aw-modal-row"
                  style={{
                    animationDelay: `${idx * 0.04}s`,
                    background: isCompatible
                      ? 'linear-gradient(135deg, rgba(168,85,247,.08), rgba(168,85,247,.02))'
                      : 'rgba(0,0,0,.25)',
                    border: isCompatible
                      ? '1px solid rgba(168,85,247,.4)'
                      : '1px solid rgba(168,85,247,.12)',
                    boxShadow: isCompatible
                      ? '0 0 24px -8px rgba(168,85,247,.3)'
                      : 'none',
                  }}
                >
                  <div 
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3"
                    style={{ borderBottom: '1px solid rgba(168,85,247,.12)' }}
                  >
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-zinc-100 text-sm">
                          {ver.name || ver.version_number}
                        </span>
                        <span className="text-xs text-purple-400/70 font-mono">
                          v{ver.version_number}
                        </span>
                        <span
                          className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider"
                          style={
                            ver.version_type === "release"
                              ? {
                                  background: 'rgba(16,185,129,.15)',
                                  color: '#34d399',
                                  border: '1px solid rgba(16,185,129,.35)',
                                }
                              : ver.version_type === "beta"
                              ? {
                                  background: 'rgba(245,158,11,.15)',
                                  color: '#fbbf24',
                                  border: '1px solid rgba(245,158,11,.35)',
                                }
                              : {
                                  background: 'rgba(244,63,94,.15)',
                                  color: '#fda4af',
                                  border: '1px solid rgba(244,63,94,.35)',
                                }
                          }
                        >
                          {ver.version_type}
                        </span>

                        {isCompatible && (
                          <span 
                            className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider flex items-center gap-1"
                            style={{
                              background: 'rgba(168,85,247,.2)',
                              color: '#c084fc',
                              border: '1px solid rgba(168,85,247,.5)',
                            }}
                          >
                            <Check className="w-3 h-3" />
                            Compatible
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-4 text-[11px] text-zinc-500 mt-2 flex-wrap">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {new Date(ver.date_published).toLocaleDateString()}
                        </span>
                        <span className="flex items-center gap-1">
                          <Download className="w-3 h-3" />
                          {ver.downloads.toLocaleString()} downloads
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-col sm:items-end gap-1 text-[11px]">
                      <div className="flex items-center gap-1 flex-wrap">
                        <span className="text-zinc-600">MC:</span>
                        {ver.game_versions?.slice(0, 4).map((gv) => (
                          <span
                            key={gv}
                            className="px-1.5 py-0.5 rounded font-mono text-[10px]"
                            style={
                              gv === normalizedGameVer
                                ? {
                                    background: 'rgba(168,85,247,.25)',
                                    color: '#c084fc',
                                    fontWeight: 700,
                                    border: '1px solid rgba(168,85,247,.5)',
                                  }
                                : {
                                    background: 'rgba(0,0,0,.35)',
                                    color: '#a1a1aa',
                                    border: '1px solid rgba(168,85,247,.12)',
                                  }
                            }
                          >
                            {gv}
                          </span>
                        ))}
                        {(ver.game_versions?.length || 0) > 4 && (
                          <span className="text-zinc-600 text-[10px]">
                            +{ver.game_versions.length - 4} more
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-1 flex-wrap mt-0.5">
                        <span className="text-zinc-600">Loaders:</span>
                        {ver.loaders?.map((ldr) => (
                          <span
                            key={ldr}
                            className="px-1.5 py-0.5 rounded font-mono text-[10px] capitalize"
                            style={{
                              background: 'rgba(0,0,0,.35)',
                              color: '#c084fc',
                              border: '1px solid rgba(168,85,247,.2)',
                            }}
                          >
                            {ldr}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Files */}
                  <div className="mt-3 space-y-2">
                    <div className="text-[11px] font-semibold text-purple-300/70 flex items-center gap-1">
                      <Layers className="w-3.5 h-3.5" />
                      Uploaded Files ({ver.files?.length || 0}):
                    </div>

                    <div className="grid grid-cols-1 gap-2">
                      {ver.files?.map((file, fIdx) => {
                        const isInstalled = installedFiles.some(
                          (name) => name.toLowerCase() === file.filename.toLowerCase()
                        );
                        const isDownloading = installingFileUrl === file.url;

                        return (
                          <div
                            key={fIdx}
                            className="p-2.5 rounded-lg flex items-center justify-between gap-3 aw-modal-btn"
                            style={{
                              background: isInstalled
                                ? 'linear-gradient(135deg, rgba(16,185,129,.12), rgba(16,185,129,.03))'
                                : 'rgba(0,0,0,.35)',
                              border: isInstalled
                                ? '1px solid rgba(16,185,129,.35)'
                                : '1px solid rgba(168,85,247,.15)',
                            }}
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <FileCode className="w-4 h-4 shrink-0" style={{ color: isInstalled ? '#34d399' : '#c084fc' }} />
                              <div className="min-w-0">
                                <div className="flex items-center gap-2">
                                  <span className="font-mono text-xs text-zinc-200 truncate font-medium">
                                    {file.filename}
                                  </span>
                                  {file.primary && (
                                    <span 
                                      className="px-1.5 py-0.2 rounded text-[9px] font-bold uppercase tracking-wider"
                                      style={{
                                        background: 'rgba(168,85,247,.15)',
                                        color: '#c084fc',
                                        border: '1px solid rgba(168,85,247,.35)',
                                      }}
                                    >
                                      Primary
                                    </span>
                                  )}
                                </div>
                                <span className="text-[10px] text-zinc-500">
                                  {formatFileSize(file.size)}
                                </span>
                              </div>
                            </div>

                            <div className="flex items-center gap-2 shrink-0">
                              {isInstalled && (
                                <span 
                                  className="text-[11px] font-medium flex items-center gap-1 px-2 py-1 rounded"
                                  style={{
                                    background: 'rgba(16,185,129,.1)',
                                    border: '1px solid rgba(16,185,129,.3)',
                                    color: '#34d399',
                                  }}
                                >
                                  <CheckCircle2 className="w-3.5 h-3.5" />
                                  Installed
                                </span>
                              )}

                              <button
                                onClick={() => handleInstallFile(ver, file)}
                                disabled={installingFileUrl !== null}
                                className="px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 aw-modal-btn disabled:opacity-50"
                                style={
                                  isInstalled
                                    ? {
                                        background: 'rgba(0,0,0,.4)',
                                        border: '1px solid rgba(168,85,247,.25)',
                                        color: '#e9d5ff',
                                      }
                                    : {
                                        background: 'linear-gradient(135deg, #a855f7, #7e22ce)',
                                        color: '#fff',
                                        boxShadow: '0 4px 12px -4px rgba(168,85,247,.6)',
                                      }
                                }
                              >
                                {isDownloading ? (
                                  <>
                                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                                    <span>Installing...</span>
                                  </>
                                ) : (
                                  <>
                                    <Download className="w-3.5 h-3.5" />
                                    <span>{isInstalled ? "Reinstall" : "Install File"}</span>
                                  </>
                                )}
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div 
          className="p-4 flex items-center justify-between text-xs text-zinc-500"
          style={{
            borderTop: '1px solid rgba(168,85,247,.15)',
            background: 'rgba(0,0,0,.3)',
          }}
        >
          <span>
            Showing <strong className="text-purple-300">{filteredVersions.length}</strong> of <strong className="text-purple-300">{versions.length}</strong> versions
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg font-medium aw-modal-btn"
            style={{
              background: 'rgba(168,85,247,.12)',
              border: '1px solid rgba(168,85,247,.35)',
              color: '#c084fc',
            }}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}