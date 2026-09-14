import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  AlertTriangle,
  Upload,
  CheckCircle2,
  XCircle,
  Info,
  Archive,
  Loader2,
  FileCheck,
  RefreshCw,
  FolderTree,
  Trash2,
  Square,
  Sparkles,
  ArrowRight,
  Hexagon,
  Globe,
  Save,
  Zap,
  Server,
  HardDrive,
  ShieldCheck
} from "lucide-react";

// ============================================
// AstroWax Panel V1.80 — World Manager
// Glass + Purple Theme
// ============================================

export default function WorldManager({
  serverId,
  server,
  onNavigateToFileManager,
}: {
  serverId: string;
  server: any;
  onNavigateToFileManager?: () => void;
}) {
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  const showToast = (
    message: string,
    type: "success" | "error" = "success"
  ) => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 5000);
  };

  const [worldInfo, setWorldInfo] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processStep, setProcessStep] = useState<string>("");
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [targetFolderName, setTargetFolderName] = useState<string>("world");
  const [autoUpdateProperties, setAutoUpdateProperties] = useState(true);
  const [lastImportedFolder, setLastImportedFolder] = useState<string | null>(null);

  const fetchWorldInfo = async () => {
    try {
      const res = await axios.get(`/api/servers/${serverId}/world/info`);
      setWorldInfo(res.data);
      if (res.data?.levelName && !targetFolderName) {
        setTargetFolderName(res.data.levelName);
      }
    } catch (err: any) {
      showToast(err.response?.data?.error || err.message, "error");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchWorldInfo();
  }, [serverId]);

  const isServerRunning =
    server?.status === "online" ||
    server?.status === "running" ||
    server?.status === "starting";

  const handleAutoImport = async () => {
    if (!uploadFile) return;

    setIsProcessing(true);
    setUploadProgress(0);

    try {
      if (isServerRunning) {
        setProcessStep("Stopping server to safely replace world files...");
        try {
          await axios.post(`/api/servers/${serverId}/stop`);
          await new Promise((r) => setTimeout(r, 1500));
        } catch (stopErr) {
          console.warn("Stop server warning:", stopErr);
        }
      }

      setProcessStep("Uploading world archive...");
      const formData = new FormData();
      formData.append("file", uploadFile);
      formData.append("path", "/");

      await axios.post(`/api/servers/${serverId}/files/upload`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const percent = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            setUploadProgress(percent);
          }
        },
      });

      setUploadProgress(null);

      setProcessStep("Scanning archive for Minecraft world structure (advancements, data, datapacks, region)...");
      const chosenName = targetFolderName.trim() || "world";

      const importRes = await axios.post(`/api/servers/${serverId}/world/import`, {
        zipPath: uploadFile.name,
        targetFolderName: chosenName,
        autoUpdateProperties,
      });

      setLastImportedFolder(importRes.data?.worldFolder || chosenName);
      showToast(
        importRes.data?.message || `World placed directly into '/${chosenName}' and zip file deleted!`,
        "success"
      );

      setUploadFile(null);
      await fetchWorldInfo();
    } catch (err: any) {
      showToast(
        err.response?.data?.error || err.message || "Failed to process and import world.",
        "error"
      );
    } finally {
      setIsProcessing(false);
      setProcessStep("");
      setUploadProgress(null);
    }
  };

  const handleStopServer = async () => {
    try {
      await axios.post(`/api/servers/${serverId}/stop`);
      showToast("Stopping server...", "success");
    } catch (err: any) {
      showToast(err.response?.data?.error || err.message, "error");
    }
  };

  // ---- Loading state ----
  if (isLoading) {
    return (
      <>
        <style dangerouslySetInnerHTML={{__html: `
          @keyframes awWmSpin { to { transform: rotate(360deg); } }
          .aw-wm-spin { animation: awWmSpin 1.4s linear infinite; }
        `}} />
        <div className="flex-1 w-full p-6 sm:p-8 flex items-center justify-center gap-3 min-h-[250px]">
          <div className="flex flex-col items-center gap-3">
            <div
              className="w-10 h-10 rounded-full aw-wm-spin"
              style={{
                border: '2px solid rgba(168,85,247,.2)',
                borderTopColor: '#a855f7',
                borderRightColor: '#c084fc',
                filter: 'drop-shadow(0 0 8px rgba(168,85,247,.6))',
              }}
            />
            <span className="text-[10px] font-mono uppercase tracking-widest" style={{ color: '#c084fc' }}>
              Loading world data...
            </span>
          </div>
        </div>
      </>
    );
  }

  const serverVersion = server?.version || "Unknown";
  const worldVersion = worldInfo?.worldVersion || "Unknown";
  const worldExists = worldInfo?.exists;

  let compatibilityStatus = "Unknown";
  let statusColor = "#fbbf24";
  let statusBg = "rgba(245,158,11,.1)";
  let statusBorder = "rgba(245,158,11,.3)";
  let StatusIcon = Info;

  if (!worldExists) {
    compatibilityStatus = "No active world folder found. A new one will generate upon starting.";
    statusColor = "#38bdf8";
    statusBg = "rgba(56,189,248,.08)";
    statusBorder = "rgba(56,189,248,.3)";
    StatusIcon = Info;
  } else if (worldVersion !== "Unknown" && serverVersion !== "Unknown") {
    const wvMatch = worldVersion.match(/(\d+)\.(\d+)(?:\.(\d+))?/);
    const svMatch = serverVersion.match(/(\d+)\.(\d+)(?:\.(\d+))?/);

    if (wvMatch && svMatch) {
      const wvMinor = parseInt(wvMatch[2]);
      const svMinor = parseInt(svMatch[2]);
      if (wvMinor === svMinor) {
        compatibilityStatus = "Compatible with current server version";
        statusColor = "#34d399";
        statusBg = "rgba(16,185,129,.1)";
        statusBorder = "rgba(16,185,129,.35)";
        StatusIcon = CheckCircle2;
      } else if (wvMinor < svMinor) {
        compatibilityStatus = "World is from an older version. Minecraft will automatically convert chunks upon startup.";
        statusColor = "#fbbf24";
        statusBg = "rgba(245,158,11,.1)";
        statusBorder = "rgba(245,158,11,.35)";
        StatusIcon = AlertTriangle;
      } else {
        compatibilityStatus = "World is newer than current server software! Please upgrade your server version to prevent corruption.";
        statusColor = "#fda4af";
        statusBg = "rgba(244,63,94,.1)";
        statusBorder = "rgba(244,63,94,.35)";
        StatusIcon = XCircle;
      }
    }
  }

  return (
    <>
      <style dangerouslySetInnerHTML={{__html: `
        .aw-wm-glass {
          background: linear-gradient(135deg, rgba(20,12,35,.55) 0%, rgba(13,8,25,.7) 100%);
          backdrop-filter: blur(16px) saturate(1.4);
          -webkit-backdrop-filter: blur(16px) saturate(1.4);
          border: 1px solid rgba(168,85,247,.2);
          border-radius: 20px;
          position: relative;
          overflow: hidden;
          transition: all .3s cubic-bezier(.16,1,.3,1);
        }
        .aw-wm-glass::before {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(168,85,247,.5), rgba(255,255,255,.2), rgba(168,85,247,.5), transparent);
          pointer-events: none;
          z-index: 2;
        }
        .aw-wm-glass:hover {
          border-color: rgba(168,85,247,.35);
        }

        .aw-wm-btn {
          transition: all .25s cubic-bezier(.16,1,.3,1);
        }
        .aw-wm-btn:hover:not(:disabled) {
          transform: translateY(-1px);
        }
        .aw-wm-btn:active:not(:disabled) {
          transform: translateY(0) scale(.97);
        }

        .aw-wm-input {
          transition: all .25s cubic-bezier(.16,1,.3,1);
        }
        .aw-wm-input:focus {
          outline: none;
          border-color: rgba(168,85,247,.6) !important;
          box-shadow: 0 0 0 3px rgba(168,85,247,.1), 0 0 20px -4px rgba(168,85,247,.4) !important;
        }

        .aw-wm-scroll::-webkit-scrollbar { width: 8px; }
        .aw-wm-scroll::-webkit-scrollbar-track { background: rgba(0,0,0,.3); }
        .aw-wm-scroll::-webkit-scrollbar-thumb {
          background: linear-gradient(180deg, #a855f7, #7e22ce);
          border-radius: 4px;
        }

        .aw-wm-file-input::file-selector-button {
          margin-right: 12px;
          padding: 6px 14px;
          border-radius: 10px;
          border: none;
          font-size: 12px;
          font-weight: 700;
          font-family: ui-monospace, monospace;
          background: linear-gradient(135deg, #a855f7, #7e22ce);
          color: #fff;
          cursor: pointer;
          box-shadow: 0 4px 12px -4px rgba(168,85,247,.5);
          transition: all .25s cubic-bezier(.16,1,.3,1);
        }
        .aw-wm-file-input::file-selector-button:hover {
          background: linear-gradient(135deg, #c084fc, #a855f7);
          transform: translateY(-1px);
        }

        @keyframes awWmIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .aw-wm-in { animation: awWmIn .4s cubic-bezier(.16,1,.3,1) both; }

        @keyframes awWmProgressShine {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        .aw-wm-progress {
          background: linear-gradient(90deg, #a855f7 0%, #c084fc 50%, #a855f7 100%);
          background-size: 200% 100%;
          animation: awWmProgressShine 2s linear infinite;
          box-shadow: 0 0 12px rgba(168,85,247,.7);
        }
      `}} />

      <div className="flex-1 overflow-y-auto aw-wm-scroll w-full p-3.5 sm:p-6 pb-24 sm:pb-12 space-y-4 sm:space-y-6 max-w-5xl mx-auto">

        {/* Toast */}
        {toast && (
          <div
            className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:bottom-6 sm:max-w-md px-4 py-3 rounded-2xl shadow-2xl text-xs sm:text-sm font-semibold z-50 flex items-center gap-2.5"
            style={
              toast.type === "error"
                ? {
                    background: 'linear-gradient(135deg, rgba(244,63,94,.95), rgba(244,63,94,.85))',
                    border: '1px solid rgba(244,63,94,.6)',
                    color: '#fff1f2',
                    boxShadow: '0 12px 32px -8px rgba(244,63,94,.6)',
                    backdropFilter: 'blur(16px)',
                  }
                : {
                    background: 'linear-gradient(135deg, rgba(16,185,129,.95), rgba(16,185,129,.85))',
                    border: '1px solid rgba(16,185,129,.6)',
                    color: '#ecfdf5',
                    boxShadow: '0 12px 32px -8px rgba(16,185,129,.6)',
                    backdropFilter: 'blur(16px)',
                  }
            }
          >
            {toast.type === "error" ? <AlertTriangle size={16} /> : <CheckCircle2 size={16} />}
            <span>{toast.message}</span>
          </div>
        )}

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 aw-wm-in">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h2
                className="text-lg sm:text-2xl font-black tracking-tight flex items-center gap-2.5"
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
                  <Globe className="w-5 h-5" style={{ color: '#c084fc' }} />
                </span>
                World Manager
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
              <span
                className="text-[10px] sm:text-xs px-2 py-0.5 rounded-full font-mono font-medium"
                style={{
                  background: 'rgba(168,85,247,.12)',
                  color: '#c084fc',
                  border: '1px solid rgba(168,85,247,.3)',
                }}
              >
                Direct Root Extraction
              </span>
            </div>
            <p className="text-xs mt-1.5 leading-relaxed" style={{ color: '#a1a1aa' }}>
              Auto-detects world folders inside uploaded archives, places the world directly into the root File Manager, and removes the zip file.
            </p>
          </div>
          <button
            onClick={fetchWorldInfo}
            className="aw-wm-btn self-end sm:self-auto p-2 min-h-[38px] min-w-[38px] rounded-xl flex items-center justify-center shrink-0"
            style={{
              background: 'rgba(0,0,0,.4)',
              border: '1px solid rgba(168,85,247,.25)',
              color: '#c084fc',
            }}
            title="Refresh World Status"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

        {/* Server Running Warning */}
        {isServerRunning && (
          <div
            className="p-3 sm:p-3.5 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs sm:text-sm aw-wm-in"
            style={{
              background: 'linear-gradient(135deg, rgba(245,158,11,.15), rgba(245,158,11,.05))',
              border: '1px solid rgba(245,158,11,.4)',
              color: '#fcd34d',
            }}
          >
            <div className="flex items-start sm:items-center gap-2.5 min-w-0">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 sm:mt-0" style={{ color: '#fbbf24' }} />
              <span className="leading-snug">
                <strong>Server is Online:</strong> Server will stop automatically during import to prevent file lock conflicts.
              </span>
            </div>
            <button
              onClick={handleStopServer}
              className="aw-wm-btn self-end sm:self-auto px-3 py-1.5 rounded-lg font-mono text-xs font-bold flex items-center gap-1.5 min-h-[36px] shrink-0"
              style={{
                background: 'rgba(245,158,11,.2)',
                border: '1px solid rgba(245,158,11,.5)',
                color: '#fbbf24',
              }}
            >
              <Square className="w-3.5 h-3.5" />
              <span>Stop Server</span>
            </button>
          </div>
        )}

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">

          {/* LEFT: Active World */}
          <div className="aw-wm-glass aw-wm-in p-4 sm:p-5 space-y-4 flex flex-col justify-between">
            <div className="space-y-3.5">
              <h3 className="font-semibold flex items-center gap-2 text-sm sm:text-base" style={{ color: '#e9d5ff' }}>
                <span
                  className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                  style={{
                    background: 'rgba(168,85,247,.12)',
                    border: '1px solid rgba(168,85,247,.3)',
                    color: '#c084fc',
                  }}
                >
                  <Info className="w-4 h-4" />
                </span>
                Active World in File Manager
              </h3>

              <div className="space-y-2.5 text-xs sm:text-sm">
                <div
                  className="flex items-center justify-between gap-2 pb-2"
                  style={{ borderBottom: '1px solid rgba(168,85,247,.1)' }}
                >
                  <span className="font-mono" style={{ color: '#a1a1aa' }}>Folder Name in Root</span>
                  <span
                    className="font-bold font-mono px-2 py-0.5 rounded text-xs truncate max-w-[180px]"
                    style={{
                      background: 'rgba(168,85,247,.1)',
                      border: '1px solid rgba(168,85,247,.25)',
                      color: '#e9d5ff',
                    }}
                  >
                    /{worldInfo?.levelName || "world"}
                  </span>
                </div>
                <div
                  className="flex items-center justify-between gap-2 pb-2"
                  style={{ borderBottom: '1px solid rgba(168,85,247,.1)' }}
                >
                  <span className="font-mono" style={{ color: '#a1a1aa' }}>World Version</span>
                  <span className="font-medium font-mono text-xs truncate" style={{ color: '#e9d5ff' }}>
                    {worldVersion}
                  </span>
                </div>
                <div
                  className="flex items-center justify-between gap-2 pb-2"
                  style={{ borderBottom: '1px solid rgba(168,85,247,.1)' }}
                >
                  <span className="font-mono" style={{ color: '#a1a1aa' }}>Server Version</span>
                  <span className="font-medium font-mono text-xs truncate" style={{ color: '#e9d5ff' }}>
                    {serverVersion}
                  </span>
                </div>
                <div className="pt-1">
                  <span
                    className="text-[10px] font-mono block mb-1.5 uppercase tracking-widest"
                    style={{ color: '#c084fc' }}
                  >
                    Compatibility Status
                  </span>
                  <div
                    className="flex items-start gap-2.5 p-2.5 sm:p-3 rounded-xl"
                    style={{
                      background: statusBg,
                      border: `1px solid ${statusBorder}`,
                      color: statusColor,
                    }}
                  >
                    <StatusIcon className="w-4 h-4 sm:w-5 sm:h-5 shrink-0 mt-0.5" />
                    <span className="text-xs sm:text-sm font-medium leading-relaxed break-words">
                      {compatibilityStatus}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {lastImportedFolder && (
              <div
                className="p-3 rounded-xl text-xs flex flex-wrap items-center justify-between gap-2 mt-4"
                style={{
                  background: 'linear-gradient(135deg, rgba(16,185,129,.15), rgba(16,185,129,.05))',
                  border: '1px solid rgba(16,185,129,.35)',
                  color: '#6ee7b7',
                }}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <CheckCircle2 className="w-4 h-4 shrink-0" style={{ color: '#34d399' }} />
                  <span className="truncate">
                    Placed into <strong>/{lastImportedFolder}</strong>
                  </span>
                </div>
                {onNavigateToFileManager && (
                  <button
                    onClick={onNavigateToFileManager}
                    className="aw-wm-btn font-mono underline flex items-center gap-1 min-h-[32px] px-2 py-1 rounded-lg shrink-0"
                    style={{
                      background: 'rgba(16,185,129,.15)',
                      color: '#a7f3d0',
                      border: '1px solid rgba(16,185,129,.3)',
                    }}
                  >
                    <span>Open in Files</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            )}
          </div>

          {/* RIGHT: Upload */}
          <div className="aw-wm-glass aw-wm-in p-4 sm:p-5 space-y-4" style={{ animationDelay: '.08s' }}>
            <h3 className="font-semibold flex items-center gap-2 text-sm sm:text-base" style={{ color: '#e9d5ff' }}>
              <span
                className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                style={{
                  background: 'rgba(168,85,247,.12)',
                  border: '1px solid rgba(168,85,247,.3)',
                  color: '#c084fc',
                }}
              >
                <Archive className="w-4 h-4" />
              </span>
              Upload & Place World in Root
            </h3>

            <p className="text-xs leading-relaxed" style={{ color: '#a1a1aa' }}>
              Upload your archive (<code style={{ color: '#c084fc' }}>world.zip</code> containing e.g. <code style={{ color: '#c084fc' }}>jdj</code> with <code style={{ color: '#c084fc' }}>region, data, datapacks, advancements</code>). The system automatically places the world directly into <code style={{ color: '#c084fc' }}>/{targetFolderName || "world"}</code> and deletes the zip.
            </p>

            <div className="space-y-3.5">
              <div>
                <label
                  className="block text-[10px] font-mono uppercase tracking-widest font-bold mb-1.5"
                  style={{ color: '#c084fc' }}
                >
                  Select World Archive (.zip, .tar, .gz)
                </label>
                <input
                  type="file"
                  accept=".zip,.tar,.gz,.tgz"
                  onChange={(e) => {
                    setUploadFile(e.target.files ? e.target.files[0] : null);
                    setUploadProgress(null);
                  }}
                  disabled={isProcessing}
                  className="aw-wm-file-input w-full rounded-xl px-2.5 py-2 text-xs sm:text-sm cursor-pointer disabled:opacity-50 min-h-[44px]"
                  style={{
                    background: 'rgba(0,0,0,.5)',
                    border: '1px solid rgba(168,85,247,.25)',
                    color: '#e9d5ff',
                  }}
                />
              </div>

              {/* Folder Name */}
              <div
                className="p-3 rounded-xl space-y-2"
                style={{
                  background: 'rgba(0,0,0,.4)',
                  border: '1px solid rgba(168,85,247,.2)',
                }}
              >
                <label className="block text-[10px] font-mono font-bold uppercase tracking-widest" style={{ color: '#c084fc' }}>
                  Destination Folder in Root
                </label>
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <span className="font-mono text-sm shrink-0" style={{ color: 'rgba(192,132,252,.6)' }}>/</span>
                  <input
                    type="text"
                    value={targetFolderName}
                    onChange={(e) => setTargetFolderName(e.target.value)}
                    disabled={isProcessing}
                    placeholder="world"
                    className="aw-wm-input flex-1 min-w-0 rounded-lg px-2.5 py-1.5 font-mono text-xs disabled:opacity-50 min-h-[38px]"
                    style={{
                      background: 'rgba(0,0,0,.6)',
                      border: '1px solid rgba(168,85,247,.3)',
                      color: '#e9d5ff',
                      caretColor: '#c084fc',
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setTargetFolderName("world")}
                    className="aw-wm-btn px-2.5 py-1.5 text-[11px] font-mono rounded-lg shrink-0 min-h-[38px]"
                    style={{
                      background: 'rgba(168,85,247,.12)',
                      border: '1px solid rgba(168,85,247,.3)',
                      color: '#c084fc',
                    }}
                    title="Reset to 'world'"
                  >
                    world
                  </button>
                </div>
                <p className="text-[10px] leading-tight" style={{ color: 'rgba(161,161,170,.75)' }}>
                  All world files (<code style={{ color: '#c084fc' }}>advancements, data, datapacks, region</code>) will be moved into this folder in root.
                </p>
              </div>

              {/* Progress */}
              {uploadProgress !== null && (
                <div className="space-y-1.5 aw-wm-in">
                  <div className="flex justify-between text-[11px] font-mono" style={{ color: '#a1a1aa' }}>
                    <span>Uploading World Archive...</span>
                    <span className="font-bold" style={{ color: '#c084fc' }}>{uploadProgress}%</span>
                  </div>
                  <div
                    className="w-full rounded-full h-2 overflow-hidden"
                    style={{ background: 'rgba(168,85,247,.15)' }}
                  >
                    <div
                      className="aw-wm-progress h-full rounded-full transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Process Step */}
              {isProcessing && processStep && (
                <div
                  className="p-3 rounded-xl text-xs font-mono flex items-start gap-2 leading-tight aw-wm-in"
                  style={{
                    background: 'linear-gradient(135deg, rgba(168,85,247,.15), rgba(168,85,247,.05))',
                    border: '1px solid rgba(168,85,247,.35)',
                    color: '#c084fc',
                  }}
                >
                  <Loader2 className="w-4 h-4 animate-spin shrink-0 mt-0.5" style={{ color: '#c084fc' }} />
                  <span className="break-words">{processStep}</span>
                </div>
              )}

              {/* Submit */}
              <button
                onClick={handleAutoImport}
                disabled={!uploadFile || isProcessing}
                className="aw-wm-btn w-full min-h-[44px] flex items-center justify-center px-4 py-2.5 font-mono font-bold rounded-xl disabled:opacity-40 disabled:pointer-events-none text-xs sm:text-sm text-white"
                style={{
                  background: 'linear-gradient(135deg, #a855f7, #7e22ce)',
                  boxShadow: '0 6px 24px -6px rgba(168,85,247,.7)',
                }}
              >
                {isProcessing ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin shrink-0" />
                    <span>Processing World...</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 shrink-0" />
                    <span>Place World in Root & Remove Zip</span>
                  </div>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* 3-Step Flow */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-3 aw-wm-in" style={{ animationDelay: '.16s' }}>
          <div
            className="p-3 sm:p-3.5 rounded-xl flex items-start gap-2.5"
            style={{
              background: 'rgba(0,0,0,.35)',
              border: '1px solid rgba(168,85,247,.15)',
            }}
          >
            <FolderTree className="w-4 h-4 shrink-0 mt-0.5" style={{ color: '#c084fc' }} />
            <div className="text-xs leading-snug" style={{ color: '#d4d4d8' }}>
              <span className="font-bold font-mono block mb-0.5" style={{ color: '#e9d5ff' }}>1. Deep Auto-Detection</span>
              Recursively scans all archive levels to pinpoint the world folder with <code style={{ color: '#c084fc' }}>region, data, datapacks, advancements</code>.
            </div>
          </div>
          <div
            className="p-3 sm:p-3.5 rounded-xl flex items-start gap-2.5"
            style={{
              background: 'rgba(0,0,0,.35)',
              border: '1px solid rgba(168,85,247,.15)',
            }}
          >
            <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" style={{ color: '#34d399' }} />
            <div className="text-xs leading-snug" style={{ color: '#d4d4d8' }}>
              <span className="font-bold font-mono block mb-0.5" style={{ color: '#e9d5ff' }}>2. Direct Root Placement</span>
              Places all contents directly inside <code style={{ color: '#34d399' }}>/{targetFolderName || "world"}</code> in File Manager & sets <code style={{ color: '#34d399' }}>level-name</code>.
            </div>
          </div>
          <div
            className="p-3 sm:p-3.5 rounded-xl flex items-start gap-2.5"
            style={{
              background: 'rgba(0,0,0,.35)',
              border: '1px solid rgba(168,85,247,.15)',
            }}
          >
            <Trash2 className="w-4 h-4 shrink-0 mt-0.5" style={{ color: '#fda4af' }} />
            <div className="text-xs leading-snug" style={{ color: '#d4d4d8' }}>
              <span className="font-bold font-mono block mb-0.5" style={{ color: '#e9d5ff' }}>3. Cleans Up Zip Archive</span>
              Deletes the uploaded <code style={{ color: '#fda4af' }}>.zip</code> archive and temporary extraction folders immediately to keep disk clean.
            </div>
          </div>
        </div>

        {/* Safety Notice */}
        <div
          className="rounded-2xl p-3.5 sm:p-4 flex items-start gap-2.5 sm:gap-3 text-xs leading-relaxed aw-wm-in"
          style={{
            background: 'linear-gradient(135deg, rgba(245,158,11,.08), rgba(245,158,11,.02))',
            border: '1px solid rgba(245,158,11,.25)',
            color: 'rgba(252,211,77,.85)',
            animationDelay: '.24s',
          }}
        >
          <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5 shrink-0 mt-0.5" style={{ color: '#fbbf24' }} />
          <div>
            <strong style={{ color: '#fcd34d' }}>Automatic Backup Protection:</strong> Before replacing world files, an automatic safety backup of your server is created in <code className="font-mono" style={{ color: '#fcd34d' }}>.data/backups/</code>.
          </div>
        </div>
      </div>
    </>
  );
}