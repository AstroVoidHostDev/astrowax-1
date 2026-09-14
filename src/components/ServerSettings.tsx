import React, { useState, useEffect } from "react";
import { LoadingOverlay } from "../components/LoadingOverlay";
import {
  Trash2,
  AlertTriangle,
  User,
  Save,
  Globe,
  RefreshCw,
  Sliders,
  Code2,
  TerminalSquare,
  Info,
  Lock,
  Check,
  Sparkles,
  SlidersHorizontal,
  Settings,
  Hexagon,
  Server,
  ShieldCheck,
  ShieldAlert,
  Cpu,
  Zap
} from "lucide-react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useSettings } from "../context/SettingsContext";
import SearchableDropdown from "./SearchableDropdown";
import CategorizedVersionDropdown from "./CategorizedVersionDropdown";
import { getJavaVersionForMinecraft } from "../utils/minecraftJava";

// ============================================
// AstroWax Panel V1.80 — Server Settings
// Glass + Purple Theme
// ============================================

export default function ServerSettings({ serverId, server }: { serverId: string, server: any }) {
  const { isDevPanel } = useSettings();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeletingAction, setIsDeletingAction] = useState(false);
  const [users, setUsers] = useState<any[]>([]);
  const [owner, setOwner] = useState(server?.owner || "");
  const [ipAlias, setIpAlias] = useState(server?.ipAlias || "");
  const [isSaving, setIsSaving] = useState(false);
  const [isSavingAlias, setIsSavingAlias] = useState(false);

  const [versions, setVersions] = useState<string[]>([]);
  const [selectedVersion, setSelectedVersion] = useState(server?.version || "");
  const [selectedType, setSelectedType] = useState((server?.type || "PAPER").toUpperCase());
  const [isChangingVersion, setIsChangingVersion] = useState(false);
  const [versionProgress, setVersionProgress] = useState(0);
  const [javaVersion, setJavaVersion] = useState(server?.javaVersion || "");
  const [dockerImage, setDockerImage] = useState(server?.dockerImage || "");
  const [serverJar, setServerJar] = useState(server?.serverJar || "");
  const [startupCommand, setStartupCommand] = useState(server?.startupCommand || "");
  const [showDowngradeRestartPopup, setShowDowngradeRestartPopup] = useState(false);
  const [isRestarting, setIsRestarting] = useState(false);
  const [isMigratingRuntime, setIsMigratingRuntime] = useState(false);
  const [showMigrateConfirm, setShowMigrateConfirm] = useState(false);
  const [migrationMessage, setMigrationMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    axios.get(`/api/system/versions?type=${selectedType}`).then((res) => {
      if (Array.isArray(res.data)) {
        setVersions(res.data);
        if (!res.data.includes(selectedVersion)) {
          setSelectedVersion(res.data[0]);
        }
      } else {
        setVersions([]);
      }
    }).catch(() => {});

    if ((user?.role === "admin" || user?.role === "owner")) {
      axios.get("/api/auth/users").then(res => {
        setUsers(res.data);
      }).catch(() => {});
    }
  }, [user, selectedType]);

  if (!server) return null;
  const canManage = (user?.role === "admin" || user?.role === "owner") || server.owner === user?.id;

  const handleDelete = async () => {
    try {
      setIsDeletingAction(true);
      await axios.delete(`/api/servers/${serverId}`);
      navigate("/servers");
    } catch(e) {
      alert("Failed to delete server");
      setIsDeletingAction(false);
      setShowDeleteConfirm(false);
    }
  };

  const handleChangeVersion = async () => {
    setIsChangingVersion(true);
    setVersionProgress(10);
    const interval = setInterval(() => {
        setVersionProgress(p => p < 90 ? p + 10 : p);
    }, 500);

    try {
      await axios.put(`/api/servers/${serverId}/version`, {
        version: selectedVersion,
        type: selectedType,
        javaVersion: javaVersion,
        dockerImage: dockerImage,
        serverJar: serverJar,
        startupCommand: startupCommand
      });
      setVersionProgress(100);
      setTimeout(() => {
         window.location.reload();
      }, 1000);
    } catch (e: any) {
      alert(e.response?.data?.error || "Failed to update version");
      setIsChangingVersion(false);
    } finally {
      clearInterval(interval);
    }
  };

  const handleDowngradeRestart = async () => {
    try {
      setIsRestarting(true);
      await axios.post(`/api/servers/${serverId}/restart`);
      setShowDowngradeRestartPopup(false);
    } catch (e: any) {
      alert("Failed to restart server: " + (e.response?.data?.error || e.message));
    } finally {
      setIsRestarting(false);
    }
  };

  const handleUpdateOwner = async () => {
    try {
      setIsSaving(true);
      await axios.put(`/api/servers/${serverId}/owner`, { owner });
      alert("Owner updated successfully");
    } catch(e) {
      alert("Failed to update owner");
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdateIpAlias = async () => {
    try {
      setIsSavingAlias(true);
      await axios.put(`/api/servers/${serverId}/ipalias`, { ipAlias });
      alert("IP Alias updated successfully");
    } catch(e) {
      alert("Failed to update IP Alias");
    } finally {
      setIsSavingAlias(false);
    }
  };

  return (
    <>
      <style dangerouslySetInnerHTML={{__html: `
        .aw-ss-glass {
          background: linear-gradient(135deg, rgba(20,12,35,.55) 0%, rgba(13,8,25,.7) 100%);
          backdrop-filter: blur(16px) saturate(1.4);
          -webkit-backdrop-filter: blur(16px) saturate(1.4);
          border: 1px solid rgba(168,85,247,.2);
          border-radius: 20px;
          position: relative;
          overflow: hidden;
          transition: all .3s cubic-bezier(.16,1,.3,1);
        }
        .aw-ss-glass::before {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(168,85,247,.5), rgba(255,255,255,.2), rgba(168,85,247,.5), transparent);
          pointer-events: none;
          z-index: 2;
        }
        .aw-ss-glass:hover {
          border-color: rgba(168,85,247,.35);
          box-shadow: 0 0 40px -12px rgba(168,85,247,.25);
        }

        .aw-ss-btn {
          transition: all .25s cubic-bezier(.16,1,.3,1);
        }
        .aw-ss-btn:hover:not(:disabled) {
          transform: translateY(-1px);
        }
        .aw-ss-btn:active:not(:disabled) {
          transform: translateY(0) scale(.97);
        }

        .aw-ss-scroll::-webkit-scrollbar { width: 8px; }
        .aw-ss-scroll::-webkit-scrollbar-track { background: rgba(0,0,0,.3); }
        .aw-ss-scroll::-webkit-scrollbar-thumb {
          background: linear-gradient(180deg, #a855f7, #7e22ce);
          border-radius: 4px;
        }
        .aw-ss-scroll::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(180deg, #c084fc, #a855f7);
        }

        .aw-ss-input {
          transition: all .25s cubic-bezier(.16,1,.3,1);
        }
        .aw-ss-input:focus {
          outline: none;
          border-color: rgba(168,85,247,.6) !important;
          box-shadow: 0 0 0 3px rgba(168,85,247,.1), 0 0 20px -4px rgba(168,85,247,.4) !important;
        }
        .aw-ss-input::placeholder { color: rgba(161,161,170,.5); }

        .aw-ss-select option {
          background: #0d0819;
          color: #e9d5ff;
        }

        @keyframes awSsIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .aw-ss-in { animation: awSsIn .4s cubic-bezier(.16,1,.3,1) both; }

        @keyframes awSsModalIn {
          from { opacity: 0; transform: translateY(16px) scale(.96); filter: blur(6px); }
          to { opacity: 1; transform: translateY(0) scale(1); filter: blur(0); }
        }
        .aw-ss-modal { animation: awSsModalIn .35s cubic-bezier(.16,1,.3,1) both; }

        @keyframes awSsBgIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .aw-ss-bg { animation: awSsBgIn .2s ease both; }
      `}} />

      {/* Restart Popup */}
      {showDowngradeRestartPopup && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 aw-ss-bg"
          style={{
            background: 'rgba(0,0,0,.75)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
          }}
        >
          <div
            className="aw-ss-modal relative max-w-md w-full p-6 md:p-8 rounded-3xl"
            style={{
              background: 'linear-gradient(135deg, rgba(20,12,35,.96), rgba(13,8,25,.98))',
              border: '1px solid rgba(168,85,247,.35)',
              backdropFilter: 'blur(24px) saturate(1.4)',
              boxShadow: '0 30px 80px -20px rgba(0,0,0,.9), 0 0 0 1px rgba(168,85,247,.15), 0 0 40px -12px rgba(168,85,247,.4)',
            }}
          >
            {/* Top accent bar */}
            <div
              className="absolute top-0 left-0 right-0 h-1 rounded-t-3xl"
              style={{
                background: 'linear-gradient(90deg, #f59e0b, #a855f7)',
              }}
            />

            <div className="flex items-start mb-4">
              <div
                className="p-3 rounded-xl mr-4 shrink-0"
                style={{
                  background: 'rgba(245,158,11,.15)',
                  border: '1px solid rgba(245,158,11,.4)',
                  boxShadow: '0 0 20px -6px rgba(245,158,11,.6)',
                }}
              >
                <AlertTriangle className="w-6 h-6" style={{ color: '#fbbf24' }} />
              </div>
              <div>
                <h3 className="text-lg font-bold mb-1" style={{ color: '#fcd34d' }}>
                  Restart Required
                </h3>
                <p className="text-sm leading-relaxed" style={{ color: 'rgba(252,211,77,.85)' }}>
                  Restart the server to ensure files are processed correctly.
                </p>
              </div>
            </div>

            <div className="flex justify-end mt-6">
              <button
                onClick={handleDowngradeRestart}
                disabled={isRestarting}
                className="aw-ss-btn px-6 py-2.5 rounded-xl font-semibold text-white disabled:opacity-50"
                style={{
                  background: 'linear-gradient(135deg, #a855f7, #7e22ce)',
                  boxShadow: '0 4px 16px -4px rgba(168,85,247,.6)',
                }}
              >
                {isRestarting ? (
                  <span className="flex items-center gap-2">
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Restarting...
                  </span>
                ) : "OK"}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex-1 overflow-y-auto aw-ss-scroll p-4 md:p-8">
        <div className="max-w-3xl space-y-8">

          {/* Header */}
          <div className="aw-ss-in">
            <h2
              className="text-2xl font-black tracking-tight flex items-center gap-2.5"
              style={{ color: '#fff' }}
            >
              <span
                className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                style={{
                  background: 'rgba(168,85,247,.12)',
                  border: '1px solid rgba(168,85,247,.3)',
                  boxShadow: '0 0 20px -6px rgba(168,85,247,.6)',
                }}
              >
                <Settings className="w-5 h-5" style={{ color: '#c084fc' }} />
              </span>
              Settings
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
            <p className="text-xs mt-1.5" style={{ color: '#a1a1aa' }}>
              Manage advanced configuration and dangerous actions for this unit.
            </p>
          </div>

          {canManage ? (
            <>

              {/* RUNTIME MIGRATION */}
              <div className="aw-ss-glass aw-ss-in p-6 md:p-8">
                <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
                  <h3 className="font-bold flex items-center gap-2" style={{ color: '#e9d5ff' }}>
                    <RefreshCw
                      className="w-5 h-5"
                      style={{
                        color: '#c084fc',
                        animation: isMigratingRuntime ? 'spin 1s linear infinite' : 'none',
                      }}
                    />
                    Runtime Migration & Conversion
                  </h3>
                  {!isDevPanel ? (
                    <span
                      className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[10px] font-mono font-medium uppercase"
                      style={{
                        background: 'rgba(245,158,11,.12)',
                        color: '#fbbf24',
                        border: '1px solid rgba(245,158,11,.35)',
                      }}
                    >
                      <Lock className="w-3 h-3" /> Main Panel (Locked)
                    </span>
                  ) : (
                    <span
                      className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[10px] font-mono font-medium uppercase"
                      style={{
                        background: 'rgba(16,185,129,.12)',
                        color: '#34d399',
                        border: '1px solid rgba(16,185,129,.35)',
                      }}
                    >
                      <Sparkles className="w-3 h-3" /> Developer Mode
                    </span>
                  )}
                </div>
                <p className="text-sm mb-4" style={{ color: 'rgba(161,161,170,.85)' }}>
                  Current execution runtime: <strong className="font-mono uppercase" style={{ color: '#c084fc' }}>
                    {server.runtimeType === 'local' ? 'Local Process' : 'Docker Container'}
                  </strong>.
                  <span className="block mt-1" style={{ color: 'rgba(161,161,170,.7)' }}>
                    {!isDevPanel
                      ? "Runtime migration is disabled on the Main Panel. Server units run on the host engine established during initial panel installation. Runtime switching can only be performed in the Developer Panel (Port 3000) or by reinstalling the panel."
                      : "You can seamlessly switch this unit between Docker Container isolation and Node.js Local Process execution. Make sure the server is stopped before migrating."
                    }
                  </span>
                </p>

                {migrationMessage && (
                  <div
                    className="mb-4 p-3 rounded-xl text-sm font-medium aw-ss-in"
                    style={
                      migrationMessage.type === "success"
                        ? {
                            background: 'linear-gradient(135deg, rgba(16,185,129,.15), rgba(16,185,129,.05))',
                            border: '1px solid rgba(16,185,129,.4)',
                            color: '#6ee7b7',
                          }
                        : {
                            background: 'linear-gradient(135deg, rgba(244,63,94,.15), rgba(244,63,94,.05))',
                            border: '1px solid rgba(244,63,94,.4)',
                            color: '#fda4af',
                          }
                    }
                  >
                    {migrationMessage.text}
                  </div>
                )}

                <div className="space-y-3">
                  {!isDevPanel ? (
                    <div
                      className="p-3.5 rounded-2xl text-xs font-mono flex items-center gap-3"
                      style={{
                        background: 'rgba(0,0,0,.4)',
                        border: '1px solid rgba(245,158,11,.25)',
                        color: '#a1a1aa',
                      }}
                    >
                      <Lock className="w-4 h-4 shrink-0" style={{ color: '#fbbf24' }} />
                      <span>Migration controls are locked on the Main Panel to protect production stability.</span>
                    </div>
                  ) : !showMigrateConfirm ? (
                    <button
                      disabled={isMigratingRuntime}
                      onClick={() => setShowMigrateConfirm(true)}
                      className="aw-ss-btn px-5 py-2.5 rounded-xl font-semibold disabled:opacity-50 text-sm flex items-center gap-2 text-white"
                      style={{
                        background: 'linear-gradient(135deg, #a855f7, #7e22ce)',
                        boxShadow: '0 4px 16px -4px rgba(168,85,247,.6)',
                      }}
                    >
                      <RefreshCw className="w-4 h-4" style={{ animation: isMigratingRuntime ? 'spin 1s linear infinite' : 'none' }} />
                      {isMigratingRuntime ? "Migrating Runtime..." : `Convert to ${server.runtimeType === 'local' ? 'Docker Container' : 'Local Process'}`}
                    </button>
                  ) : (
                    <div
                      className="p-4 rounded-2xl space-y-3"
                      style={{
                        background: 'rgba(0,0,0,.5)',
                        border: '1px solid rgba(168,85,247,.35)',
                      }}
                    >
                      <p className="text-sm" style={{ color: '#e9d5ff' }}>
                        Convert this server to <strong style={{ color: '#c084fc' }}>
                          {server.runtimeType === 'local' ? 'Docker Container' : 'Local Process'}
                        </strong>?
                      </p>
                      <div className="flex items-center gap-2 flex-wrap">
                        <button
                          disabled={isMigratingRuntime}
                          onClick={async () => {
                            const target = server.runtimeType === 'local' ? 'docker' : 'local';
                            setIsMigratingRuntime(true);
                            setMigrationMessage(null);
                            setShowMigrateConfirm(false);
                            try {
                              const token = localStorage.getItem("jtg_token") || localStorage.getItem("token");
                              const headers: any = {};
                              if (token) headers["Authorization"] = `Bearer ${token}`;
                              const res = await axios.put(`/api/servers/${serverId}/migrate-runtime`, { targetRuntime: target }, { headers });
                              setMigrationMessage({
                                text: `Successfully converted runtime to ${target === 'local' ? 'Local Process' : 'Docker Container'}!`,
                                type: "success"
                              });
                              if (server) {
                                server.runtimeType = target;
                              }
                              setTimeout(() => {
                                window.location.reload();
                              }, 1000);
                            } catch (err: any) {
                              setMigrationMessage({
                                text: err.response?.data?.error || err.message || "Failed to migrate server runtime.",
                                type: "error"
                              });
                              setIsMigratingRuntime(false);
                            }
                          }}
                          className="aw-ss-btn px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 text-white"
                          style={{
                            background: 'linear-gradient(135deg, #a855f7, #7e22ce)',
                            boxShadow: '0 4px 16px -4px rgba(168,85,247,.6)',
                          }}
                        >
                          {isMigratingRuntime && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                          Confirm Conversion
                        </button>
                        <button
                          disabled={isMigratingRuntime}
                          onClick={() => setShowMigrateConfirm(false)}
                          className="aw-ss-btn px-4 py-2 rounded-xl text-xs font-semibold"
                          style={{
                            background: 'rgba(0,0,0,.4)',
                            border: '1px solid rgba(168,85,247,.25)',
                            color: '#a1a1aa',
                          }}
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* RUNTIME CONFIGURATION */}
              {(() => {
                const upperType = (server?.type || "").toUpperCase();
                const isGeneric = ["NODEJS", "NODE", "PYTHON", "PYTHON3"].includes(upperType);
                const isNode = ["NODEJS", "NODE"].includes(upperType);
                const isPy = ["PYTHON", "PYTHON3"].includes(upperType);

                if (isGeneric) {
                  return (
                    <div className="aw-ss-glass aw-ss-in p-6 md:p-8">
                      <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
                        <h3 className="font-bold flex items-center gap-2" style={{ color: '#e9d5ff' }}>
                          {isNode ? (
                            <Code2 className="w-5 h-5" style={{ color: '#c084fc' }} />
                          ) : (
                            <TerminalSquare className="w-5 h-5" style={{ color: '#c084fc' }} />
                          )}
                          {isNode ? "Node.js Runtime Environment" : "Python Runtime Environment"}
                        </h3>
                        <span
                          className="flex items-center gap-1.5 text-[10px] font-mono px-2.5 py-1 rounded-md uppercase tracking-wider"
                          style={{
                            background: 'rgba(168,85,247,.12)',
                            color: '#c084fc',
                            border: '1px solid rgba(168,85,247,.3)',
                          }}
                        >
                          <Lock className="w-3 h-3" /> Fixed Runtime
                        </span>
                      </div>
                      <p className="text-sm mb-4" style={{ color: 'rgba(161,161,170,.85)' }}>
                        Dedicated standalone code runtime. Upload your project scripts, packages, and dependencies in the File Manager and start them in the Console.
                      </p>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                          <label className="block text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: '#c084fc' }}>
                            Runtime Platform
                          </label>
                          <div
                            className="w-full rounded-xl px-4 py-3 font-mono text-sm flex items-center justify-between opacity-80 cursor-not-allowed"
                            style={{
                              background: 'rgba(0,0,0,.4)',
                              border: '1px solid rgba(168,85,247,.2)',
                              color: '#e9d5ff',
                            }}
                          >
                            <span>{isNode ? "Node.js (JavaScript / TypeScript)" : "Python (Python 3.x)"}</span>
                            <span className="text-[10px] uppercase tracking-wider" style={{ color: 'rgba(161,161,170,.6)' }}>
                              Fixed
                            </span>
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: '#c084fc' }}>
                            Runtime Version
                          </label>
                          <SearchableDropdown
                            value={selectedVersion}
                            onChange={setSelectedVersion}
                            options={versions.map(v => ({ value: v, label: isNode ? `Node.js v${v}` : `Python ${v}` }))}
                            placeholder="Select Version"
                            searchPlaceholder="Search versions..."
                            disabled={isChangingVersion}
                            className="font-mono"
                          />
                        </div>

                        <div className="md:col-span-2">
                          <label className="block text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: '#c084fc' }}>
                            Startup Command
                          </label>
                          <input
                            type="text"
                            value={startupCommand}
                            onChange={e => setStartupCommand(e.target.value)}
                            placeholder={isNode ? "e.g. node index.js or npm start" : "e.g. python3 -u main.py"}
                            disabled={isChangingVersion}
                            className="aw-ss-input w-full rounded-xl px-4 py-3 font-mono text-sm"
                            style={{
                              background: 'rgba(0,0,0,.5)',
                              border: '1px solid rgba(168,85,247,.25)',
                              color: '#e9d5ff',
                              caretColor: '#c084fc',
                            }}
                          />
                          <p className="text-xs font-mono mt-1.5" style={{ color: 'rgba(161,161,170,.6)' }}>
                            {isNode ? "Leave empty to automatically execute index.js, app.js, or package.json start script." : "Leave empty to automatically execute main.py, app.py, or bot.py."}
                          </p>
                        </div>

                        <div className="md:col-span-2">
                          <label className="block text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: '#c084fc' }}>
                            Custom Docker Image (Optional)
                          </label>
                          <input
                            type="text"
                            value={dockerImage}
                            onChange={e => setDockerImage(e.target.value)}
                            placeholder={isNode ? "node:20-alpine" : "python:3.11-slim"}
                            disabled={isChangingVersion}
                            className="aw-ss-input w-full rounded-xl px-4 py-3 font-mono text-sm"
                            style={{
                              background: 'rgba(0,0,0,.5)',
                              border: '1px solid rgba(168,85,247,.25)',
                              color: '#e9d5ff',
                              caretColor: '#c084fc',
                            }}
                          />
                        </div>
                      </div>

                      <div className="flex justify-end mt-4">
                        <button
                          onClick={handleChangeVersion}
                          disabled={isChangingVersion}
                          className="aw-ss-btn px-6 py-3 rounded-xl font-semibold disabled:opacity-50 flex items-center min-w-[160px] justify-center"
                          style={{
                            background: 'linear-gradient(135deg, #a855f7, #7e22ce)',
                            color: '#fff',
                            boxShadow: '0 4px 16px -4px rgba(168,85,247,.6)',
                          }}
                        >
                          {isChangingVersion ? "Updating..." : "Update Runtime"}
                        </button>
                      </div>

                      {isChangingVersion && (
                        <div
                          className="mt-6 p-4 rounded-xl"
                          style={{
                            background: 'rgba(0,0,0,.4)',
                            border: '1px solid rgba(168,85,247,.25)',
                          }}
                        >
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-sm font-medium" style={{ color: '#c084fc' }}>
                              Updating runtime configuration...
                            </span>
                            <span className="text-sm font-mono" style={{ color: '#c084fc' }}>
                              {versionProgress}%
                            </span>
                          </div>
                          <div className="w-full rounded-full h-2.5 overflow-hidden" style={{ background: 'rgba(0,0,0,.5)' }}>
                            <div
                              className="h-2.5 rounded-full transition-all duration-300 ease-out"
                              style={{
                                width: `${versionProgress}%`,
                                background: 'linear-gradient(90deg, #a855f7, #c084fc)',
                                boxShadow: '0 0 12px rgba(168,85,247,.7)',
                              }}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  );
                }

                const autoDetectedJava = getJavaVersionForMinecraft(selectedVersion, selectedType);

                return (
                  <div className="aw-ss-glass aw-ss-in p-6 md:p-8">
                    <h3 className="font-bold mb-2 flex items-center gap-2" style={{ color: '#e9d5ff' }}>
                      <Sliders className="w-5 h-5" style={{ color: '#c084fc' }} />
                      Minecraft Runtime
                    </h3>
                    <p className="text-sm mb-4" style={{ color: 'rgba(161,161,170,.85)' }}>
                      Configure server software, Java version, and Docker image.
                      <span className="block mt-1" style={{ color: 'rgba(251,191,36,.85)' }}>
                        ⚠ WARNING: The server MUST be stopped before changing the runtime. A backup will be created automatically.
                      </span>
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: '#c084fc' }}>
                          Software Type
                        </label>
                        <select
                          value={selectedType}
                          onChange={e => setSelectedType(e.target.value)}
                          disabled={isChangingVersion}
                          className="aw-ss-input aw-ss-select w-full rounded-xl px-4 py-3"
                          style={{
                            background: 'rgba(0,0,0,.5)',
                            border: '1px solid rgba(168,85,247,.25)',
                            color: '#e9d5ff',
                          }}
                        >
                          <option value="PAPER">Paper</option>
                          <option value="SPIGOT">Spigot</option>
                          <option value="FABRIC">Fabric</option>
                          <option value="FORGE">Forge</option>
                          <option value="BUNGEECORD">BungeeCord</option>
                          <option value="VELOCITY">Velocity</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: '#c084fc' }}>
                          Software Version
                        </label>
                        <CategorizedVersionDropdown
                          value={selectedVersion}
                          onChange={setSelectedVersion}
                          versions={versions}
                          software={selectedType}
                          disabled={isChangingVersion}
                          placeholder="Select Version"
                          className="font-mono"
                        />
                      </div>
                      <div>
                        <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
                          <label className="block text-xs font-semibold uppercase tracking-wider" style={{ color: '#c084fc' }}>
                            Java Version
                          </label>
                          {javaVersion ? (
                            <button
                              type="button"
                              onClick={() => setJavaVersion("")}
                              className="text-xs underline cursor-pointer aw-ss-btn"
                              style={{ color: '#c084fc' }}
                            >
                              Reset to Auto-detect
                            </button>
                          ) : (
                            <span
                              className="text-[10px] font-mono flex items-center gap-1 px-2 py-0.5 rounded-md"
                              style={{
                                background: 'rgba(16,185,129,.12)',
                                color: '#34d399',
                                border: '1px solid rgba(16,185,129,.35)',
                              }}
                            >
                              <Sparkles className="w-3 h-3" /> Auto: Java {autoDetectedJava}
                            </span>
                          )}
                        </div>
                        <select
                          value={javaVersion}
                          onChange={e => setJavaVersion(e.target.value)}
                          disabled={isChangingVersion}
                          className="aw-ss-input aw-ss-select w-full rounded-xl px-4 py-3 font-mono text-sm"
                          style={{
                            background: 'rgba(0,0,0,.5)',
                            border: '1px solid rgba(168,85,247,.25)',
                            color: '#e9d5ff',
                          }}
                        >
                          <option value="">Auto-detect (Java {autoDetectedJava} Recommended)</option>
                          <option value="26">Java 26 (Latest JDK)</option>
                          <option value="25">Java 25 (Required for Paper 26.x)</option>
                          <option value="21">Java 21 (LTS • Recommended for 1.20.5 - 1.21.x)</option>
                          <option value="17">Java 17 (LTS • Recommended for 1.18 - 1.20.4)</option>
                          <option value="16">Java 16 (Recommended for 1.17)</option>
                          <option value="11">Java 11 (Recommended for 1.13 - 1.16)</option>
                          <option value="8">Java 8 (Legacy • Required for 1.12.2 & below)</option>
                        </select>
                        <div className="mt-2">
                          {!javaVersion ? (
                            <p
                              className="text-xs font-mono flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg"
                              style={{
                                background: 'rgba(16,185,129,.08)',
                                border: '1px solid rgba(16,185,129,.2)',
                                color: 'rgba(110,231,183,.9)',
                              }}
                            >
                              <Sparkles className="w-3.5 h-3.5 shrink-0" style={{ color: '#34d399' }} />
                              <span>
                                Auto-detection active: <strong>Java {autoDetectedJava}</strong> will be used for {selectedVersion || 'this version'}
                              </span>
                            </p>
                          ) : (
                            <p
                              className="text-xs font-mono flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg"
                              style={{
                                background: 'rgba(245,158,11,.08)',
                                border: '1px solid rgba(245,158,11,.2)',
                                color: 'rgba(251,191,36,.9)',
                              }}
                            >
                              <SlidersHorizontal className="w-3.5 h-3.5 shrink-0" style={{ color: '#fbbf24' }} />
                              <span>
                                Manual override: <strong>Java {javaVersion}</strong> selected {javaVersion !== autoDetectedJava && `(Auto recommends Java ${autoDetectedJava})`}
                              </span>
                            </p>
                          )}
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: '#c084fc' }}>
                          Docker Image
                        </label>
                        <input
                          type="text"
                          value={dockerImage}
                          onChange={e => setDockerImage(e.target.value)}
                          placeholder="e.g. ghcr.io/pterodactyl/yolks:java_17"
                          disabled={isChangingVersion}
                          className="aw-ss-input w-full rounded-xl px-4 py-3 font-mono text-sm"
                          style={{
                            background: 'rgba(0,0,0,.5)',
                            border: '1px solid rgba(168,85,247,.25)',
                            color: '#e9d5ff',
                            caretColor: '#c084fc',
                          }}
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: '#c084fc' }}>
                          Server JAR
                        </label>
                        <input
                          type="text"
                          value={serverJar}
                          onChange={e => setServerJar(e.target.value)}
                          placeholder="e.g. server.jar"
                          disabled={isChangingVersion}
                          className="aw-ss-input w-full rounded-xl px-4 py-3 font-mono text-sm"
                          style={{
                            background: 'rgba(0,0,0,.5)',
                            border: '1px solid rgba(168,85,247,.25)',
                            color: '#e9d5ff',
                            caretColor: '#c084fc',
                          }}
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: '#c084fc' }}>
                          Startup Command
                        </label>
                        <input
                          type="text"
                          value={startupCommand}
                          onChange={e => setStartupCommand(e.target.value)}
                          placeholder="e.g. java -Xms1G -Xmx4G -jar server.jar --nogui"
                          disabled={isChangingVersion}
                          className="aw-ss-input w-full rounded-xl px-4 py-3 font-mono text-sm"
                          style={{
                            background: 'rgba(0,0,0,.5)',
                            border: '1px solid rgba(168,85,247,.25)',
                            color: '#e9d5ff',
                            caretColor: '#c084fc',
                          }}
                        />
                      </div>
                    </div>

                    <div className="flex justify-end mt-4">
                      <button
                        onClick={handleChangeVersion}
                        disabled={isChangingVersion}
                        className="aw-ss-btn px-6 py-3 rounded-xl font-semibold disabled:opacity-50 flex items-center min-w-[160px] justify-center"
                        style={{
                          background: 'linear-gradient(135deg, #a855f7, #7e22ce)',
                          color: '#fff',
                          boxShadow: '0 4px 16px -4px rgba(168,85,247,.6)',
                        }}
                      >
                        {isChangingVersion ? "Updating..." : "Update Runtime"}
                      </button>
                    </div>

                    {isChangingVersion && (
                      <div
                        className="mt-6 p-4 rounded-xl"
                        style={{
                          background: 'rgba(0,0,0,.4)',
                          border: '1px solid rgba(168,85,247,.25)',
                        }}
                      >
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm font-medium" style={{ color: '#c084fc' }}>
                            Updating runtime configuration...
                          </span>
                          <span className="text-sm font-mono" style={{ color: '#c084fc' }}>
                            {versionProgress}%
                          </span>
                        </div>
                        <div className="w-full rounded-full h-2.5 overflow-hidden" style={{ background: 'rgba(0,0,0,.5)' }}>
                          <div
                            className="h-2.5 rounded-full transition-all duration-300 ease-out"
                            style={{
                              width: `${versionProgress}%`,
                              background: 'linear-gradient(90deg, #a855f7, #c084fc)',
                              boxShadow: '0 0 12px rgba(168,85,247,.7)',
                            }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                );
              })()}

              {/* IP ALIAS */}
              <div className="aw-ss-glass aw-ss-in p-6 md:p-8" style={{ animationDelay: '.1s' }}>
                <h3 className="font-bold mb-2 flex items-center gap-2" style={{ color: '#e9d5ff' }}>
                  <Globe className="w-5 h-5" style={{ color: '#c084fc' }} />
                  Server IP Alias
                </h3>
                <p className="text-sm mb-4" style={{ color: 'rgba(161,161,170,.85)' }}>
                  Set a custom domain or IP to display on the console page.
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1">
                    <input
                      type="text"
                      value={ipAlias}
                      onChange={e => setIpAlias(e.target.value)}
                      placeholder="e.g. play.example.com"
                      className="aw-ss-input w-full rounded-xl px-4 py-2.5 font-mono text-sm"
                      style={{
                        background: 'rgba(0,0,0,.5)',
                        border: '1px solid rgba(168,85,247,.25)',
                        color: '#e9d5ff',
                        caretColor: '#c084fc',
                      }}
                    />
                  </div>
                  <button
                    onClick={handleUpdateIpAlias}
                    disabled={isSavingAlias || ipAlias === (server.ipAlias || "")}
                    className="aw-ss-btn px-6 py-2.5 rounded-xl font-semibold disabled:opacity-50 flex items-center justify-center gap-2 text-white text-sm"
                    style={{
                      background: 'linear-gradient(135deg, #a855f7, #7e22ce)',
                      boxShadow: '0 4px 16px -4px rgba(168,85,247,.6)',
                    }}
                  >
                    <Save className="w-4 h-4" /> Save
                  </button>
                </div>
              </div>

              {/* OWNERSHIP (admin/owner only) */}
              {(user?.role === "admin" || user?.role === "owner") && (
                <div className="aw-ss-glass aw-ss-in p-6 md:p-8" style={{ animationDelay: '.2s' }}>
                  <h3 className="font-bold mb-2 flex items-center gap-2" style={{ color: '#e9d5ff' }}>
                    <User className="w-5 h-5" style={{ color: '#c084fc' }} />
                    Server Ownership
                  </h3>
                  <p className="text-sm mb-4" style={{ color: 'rgba(161,161,170,.85)' }}>
                    Transfer the ownership of this server to another user.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex-1">
                      <SearchableDropdown
                        value={owner}
                        onChange={setOwner}
                        options={users.map(u => ({ value: u.id, label: `${u.username} (${u.role})` }))}
                        placeholder="Select an owner..."
                        searchPlaceholder="Search users..."
                      />
                    </div>
                    <button
                      onClick={handleUpdateOwner}
                      disabled={isSaving || owner === server.owner}
                      className="aw-ss-btn px-6 py-2.5 rounded-xl font-semibold disabled:opacity-50 flex items-center justify-center gap-2 text-white text-sm"
                      style={{
                        background: 'linear-gradient(135deg, #a855f7, #7e22ce)',
                        boxShadow: '0 4px 16px -4px rgba(168,85,247,.6)',
                      }}
                    >
                      <Save className="w-4 h-4" /> Save
                    </button>
                  </div>
                </div>
              )}

              {/* DANGER ZONE */}
              <div
                className="aw-ss-glass aw-ss-in p-6 md:p-8"
                style={{
                  animationDelay: '.3s',
                  borderColor: 'rgba(244,63,94,.3)',
                  background: 'linear-gradient(135deg, rgba(244,63,94,.08), rgba(13,8,25,.7))',
                }}
              >
                <h3 className="font-bold mb-2 flex items-center gap-2" style={{ color: '#fda4af' }}>
                  <ShieldAlert className="w-5 h-5" style={{ color: '#f43f5e' }} />
                  Danger Zone
                </h3>
                <p className="text-sm mb-4" style={{ color: 'rgba(253,164,175,.75)' }}>
                  Once you delete a server, there is no going back. Please be certain.
                </p>
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  className="aw-ss-btn px-5 py-2.5 rounded-xl font-semibold flex items-center gap-2 text-white text-sm"
                  style={{
                    background: 'linear-gradient(135deg, #f43f5e, #be123c)',
                    boxShadow: '0 4px 16px -4px rgba(244,63,94,.6)',
                  }}
                >
                  <Trash2 className="w-4 h-4" />
                  Delete Server
                </button>
              </div>
            </>
          ) : (
            <div
              className="text-sm p-4 rounded-xl aw-ss-in"
              style={{
                background: 'rgba(0,0,0,.4)',
                border: '1px solid rgba(168,85,247,.2)',
                color: '#a1a1aa',
              }}
            >
              You do not have permission to manage this server's settings.
            </div>
          )}
        </div>
      </div>

      {(isDeletingAction || isSaving || isSavingAlias || isChangingVersion || isRestarting) && <LoadingOverlay />}
    </>
  );
}