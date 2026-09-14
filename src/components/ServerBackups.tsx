import React, { useEffect, useState } from "react";
import { LoadingOverlay } from "../components/LoadingOverlay";
import axios from "axios";
import {
  Archive,
  Download,
  Trash2,
  RefreshCw,
  Plus,
  Clock,
  FileArchive,
  RotateCcw,
  AlertCircle,
  CheckCircle2,
  Hexagon,
  Sparkles,
  Server
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

// ============================================
// AstroWax Panel V1.80 — Server Backups
// Glass + Purple Theme
// ============================================

interface Backup {
  filename: string;
  size: number;
  createdAt: string;
}

export default function ServerBackups({ serverId }: { serverId: string }) {
  const [backups, setBackups] = useState<Backup[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ text: string; type: "success" | "error" } | null>(null);
  const [deleteFilename, setDeleteFilename] = useState<string | null>(null);
  const { user } = useAuth();

  const fetchBackups = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`/api/servers/${serverId}/backups`);
      setBackups(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBackups();
  }, [serverId]);

  const handleCreateBackup = async () => {
    setStatusMsg(null);
    try {
      setIsCreating(true);
      await axios.post(`/api/servers/${serverId}/backups`);
      await fetchBackups();
      setStatusMsg({ text: "Backup created successfully.", type: "success" });
    } catch (e: any) {
      setStatusMsg({ text: e.response?.data?.error || "Failed to create backup.", type: "error" });
      console.error(e);
    } finally {
      setIsCreating(false);
    }
  };

  const handleDelete = async (filename: string) => {
    setDeleteFilename(null);
    setStatusMsg(null);
    try {
      await axios.delete(`/api/servers/${serverId}/backups/${filename}`);
      await fetchBackups();
      setStatusMsg({ text: "Backup deleted.", type: "success" });
    } catch (e: any) {
      setStatusMsg({ text: e.response?.data?.error || "Failed to delete backup.", type: "error" });
    }
  };

  const handleDownload = async (filename: string) => {
    try {
      const response = await axios.get(`/api/servers/${serverId}/backups/${filename}`, {
        responseType: 'blob'
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (e) {
      alert("Failed to download.");
    }
  };

  const formatSize = (bytes: number) => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  return (
    <div className="flex-1 overflow-y-auto aw-sb-scroll p-4 md:p-6 text-foreground">
      <style dangerouslySetInnerHTML={{__html: `
        .aw-sb-glass {
          background: linear-gradient(135deg, rgba(20,12,35,.55) 0%, rgba(13,8,25,.7) 100%);
          backdrop-filter: blur(16px) saturate(1.4);
          -webkit-backdrop-filter: blur(16px) saturate(1.4);
          border: 1px solid rgba(168,85,247,.2);
          border-radius: 16px;
          position: relative;
          overflow: hidden;
        }
        .aw-sb-glass::before {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(168,85,247,.5), rgba(255,255,255,.2), rgba(168,85,247,.5), transparent);
          pointer-events: none;
          z-index: 2;
        }
        .aw-sb-row {
          transition: all .25s cubic-bezier(.16,1,.3,1);
        }
        .aw-sb-row:hover {
          background: rgba(168,85,247,.06);
        }
        .aw-sb-btn {
          transition: all .25s cubic-bezier(.16,1,.3,1);
        }
        .aw-sb-btn:hover:not(:disabled) {
          transform: translateY(-1px);
        }
        .aw-sb-btn:active:not(:disabled) {
          transform: translateY(0) scale(.97);
        }
        .aw-sb-scroll::-webkit-scrollbar { width: 8px; }
        .aw-sb-scroll::-webkit-scrollbar-track { background: rgba(0,0,0,.3); }
        .aw-sb-scroll::-webkit-scrollbar-thumb {
          background: linear-gradient(180deg, #a855f7, #7e22ce);
          border-radius: 4px;
        }
        .aw-sb-scroll::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(180deg, #c084fc, #a855f7);
        }
        @keyframes awSbIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .aw-sb-in { animation: awSbIn .4s cubic-bezier(.16,1,.3,1) both; }
        @keyframes awSbRow {
          from { opacity: 0; transform: translateY(6px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .aw-sb-row-in { animation: awSbRow .35s cubic-bezier(.16,1,.3,1) both; }
      `}} />

      <div className="max-w-4xl mx-auto space-y-6 md:space-y-8">

        {/* Header */}
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between aw-sb-in">
          <div>
            <h2
              className="text-xl md:text-2xl font-black tracking-tight flex items-center gap-2.5"
              style={{
                color: '#fff',
              }}
            >
              <span
                className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                style={{
                  background: 'rgba(168,85,247,.12)',
                  border: '1px solid rgba(168,85,247,.3)',
                  boxShadow: '0 0 20px -6px rgba(168,85,247,.6)',
                }}
              >
                <Archive className="w-5 h-5" style={{ color: '#c084fc' }} />
              </span>
              Server Backups
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
              Create, download, and manage your server archives.
            </p>
          </div>
        </div>

        {/* Status Toast */}
        {statusMsg && (
          <div
            className="p-3.5 rounded-xl text-sm flex items-center justify-between aw-sb-in"
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

        {/* Create Backup Card */}
        <div className="aw-sb-glass aw-sb-in p-5 md:p-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4 w-full md:w-auto">
            <div
              className="p-3 rounded-lg shrink-0"
              style={{
                background: 'rgba(168,85,247,.12)',
                border: '1px solid rgba(168,85,247,.3)',
                boxShadow: '0 0 20px -6px rgba(168,85,247,.5)',
              }}
            >
              <FileArchive className="w-6 h-6" style={{ color: '#c084fc' }} />
            </div>
            <div>
              <h3 className="font-semibold text-base" style={{ color: '#e9d5ff' }}>
                Create Backup
              </h3>
              <p className="text-xs leading-relaxed mt-1" style={{ color: 'rgba(161,161,170,.85)' }}>
                All files on the server will be converted into a single zip file. This process may take some time depending on your server's size.
              </p>
            </div>
          </div>
          <button
            onClick={handleCreateBackup}
            disabled={isCreating}
            className="w-full md:w-auto px-5 py-2.5 rounded-xl font-semibold aw-sb-btn flex items-center justify-center shrink-0 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm"
            style={{
              background: 'linear-gradient(135deg, #a855f7, #7e22ce)',
              boxShadow: '0 4px 16px -4px rgba(168,85,247,.6)',
            }}
          >
            {isCreating ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                Zipping files...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                Create Backup
              </>
            )}
          </button>
        </div>

        {/* Backups List */}
        <div className="aw-sb-in" style={{ animationDelay: '.1s' }}>
          <h3
            className="text-xs font-bold uppercase tracking-widest mb-4 flex items-center gap-2"
            style={{ color: '#c084fc' }}
          >
            <Clock className="w-4 h-4" />
            Recent Backups
            {backups.length > 0 && (
              <span
                className="px-2 py-0.5 rounded-md font-mono text-[10px]"
                style={{
                  background: 'rgba(168,85,247,.15)',
                  border: '1px solid rgba(168,85,247,.3)',
                  color: '#c084fc',
                }}
              >
                {backups.length}
              </span>
            )}
          </h3>

          <div className="aw-sb-glass">
            {loading ? (
              <div className="p-12 flex flex-col items-center justify-center gap-3">
                <div
                  className="w-8 h-8 rounded-full border-2 animate-spin"
                  style={{
                    borderColor: 'rgba(168,85,247,.2)',
                    borderTopColor: '#a855f7',
                    borderRightColor: '#c084fc',
                    filter: 'drop-shadow(0 0 8px rgba(168,85,247,.6))',
                  }}
                />
                <span className="text-xs font-mono uppercase tracking-widest" style={{ color: '#c084fc' }}>
                  Loading backups...
                </span>
              </div>
            ) : backups.length === 0 ? (
              <div className="p-12 text-center flex flex-col items-center justify-center">
                <div
                  className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
                  style={{
                    background: 'rgba(168,85,247,.08)',
                    border: '1px solid rgba(168,85,247,.2)',
                  }}
                >
                  <Archive className="w-8 h-8" style={{ color: 'rgba(192,132,252,.5)' }} />
                </div>
                <h4 className="font-semibold mb-1" style={{ color: '#e9d5ff' }}>
                  No backups found
                </h4>
                <p className="text-xs" style={{ color: '#a1a1aa' }}>
                  Create a backup above to secure your files.
                </p>
              </div>
            ) : (
              <div>
                {backups.map((backup, idx) => (
                  <div
                    key={backup.filename}
                    className="aw-sb-row aw-sb-row-in p-4 flex flex-col md:flex-row md:items-center justify-between gap-4"
                    style={{
                      animationDelay: `${idx * 0.04}s`,
                      borderBottom: idx < backups.length - 1 ? '1px solid rgba(168,85,247,.1)' : 'none',
                    }}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className="p-2.5 rounded-lg shrink-0"
                        style={{
                          background: 'rgba(168,85,247,.1)',
                          border: '1px solid rgba(168,85,247,.25)',
                          color: '#c084fc',
                        }}
                      >
                        <Archive className="w-5 h-5" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-mono text-sm font-semibold truncate" style={{ color: '#e9d5ff' }}>
                          {backup.filename}
                        </p>
                        <div className="flex items-center text-[11px] mt-1 gap-3 flex-wrap" style={{ color: 'rgba(161,161,170,.75)' }}>
                          <span className="font-mono">{formatSize(backup.size)}</span>
                          <span style={{ color: 'rgba(168,85,247,.4)' }}>•</span>
                          <span>{new Date(backup.createdAt).toLocaleString()}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 w-full md:w-auto shrink-0">
                      {/* Download */}
                      <button
                        onClick={() => handleDownload(backup.filename)}
                        className="aw-sb-btn flex-1 md:flex-none flex justify-center items-center px-3 py-1.5 rounded-lg text-xs font-semibold"
                        style={{
                          background: 'rgba(168,85,247,.12)',
                          border: '1px solid rgba(168,85,247,.3)',
                          color: '#c084fc',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = 'rgba(168,85,247,.2)';
                          e.currentTarget.style.boxShadow = '0 0 16px -4px rgba(168,85,247,.5)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = 'rgba(168,85,247,.12)';
                          e.currentTarget.style.boxShadow = 'none';
                        }}
                      >
                        <Download className="w-3.5 h-3.5 mr-1.5" />
                        Download
                      </button>

                      {/* Delete */}
                      {(user?.role === "admin" || user) && (
                        deleteFilename === backup.filename ? (
                          <div
                            className="flex items-center gap-1 px-2 py-1 rounded-lg"
                            style={{
                              background: 'linear-gradient(135deg, rgba(244,63,94,.15), rgba(244,63,94,.05))',
                              border: '1px solid rgba(244,63,94,.4)',
                            }}
                          >
                            <span className="text-[11px] font-semibold" style={{ color: '#fda4af' }}>
                              Delete?
                            </span>
                            <button
                              onClick={() => handleDelete(backup.filename)}
                              className="aw-sb-btn font-bold px-2 py-0.5 rounded text-[11px] text-white"
                              style={{
                                background: 'linear-gradient(135deg, #f43f5e, #be123c)',
                                boxShadow: '0 2px 8px -2px rgba(244,63,94,.6)',
                              }}
                            >
                              Yes
                            </button>
                            <button
                              onClick={() => setDeleteFilename(null)}
                              className="aw-sb-btn px-2 py-0.5 rounded text-[11px] font-medium"
                              style={{
                                background: 'rgba(0,0,0,.4)',
                                border: '1px solid rgba(168,85,247,.2)',
                                color: '#a1a1aa',
                              }}
                            >
                              No
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setDeleteFilename(backup.filename)}
                            className="aw-sb-btn p-1.5 rounded-lg"
                            style={{
                              background: 'rgba(244,63,94,.1)',
                              border: '1px solid rgba(244,63,94,.3)',
                              color: '#fda4af',
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.background = 'rgba(244,63,94,.2)';
                              e.currentTarget.style.boxShadow = '0 0 16px -4px rgba(244,63,94,.5)';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.background = 'rgba(244,63,94,.1)';
                              e.currentTarget.style.boxShadow = 'none';
                            }}
                            title="Delete Backup"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Info footer */}
        {backups.length > 0 && (
          <div
            className="p-3 rounded-xl flex items-start gap-2.5 text-xs aw-sb-in"
            style={{
              background: 'rgba(251,191,36,.08)',
              border: '1px solid rgba(251,191,36,.25)',
              color: 'rgba(251,191,36,.9)',
            }}
          >
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>
              Backups are stored on the server. Consider downloading important backups to external storage for extra safety.
            </span>
          </div>
        )}
      </div>

      {isCreating && <LoadingOverlay message="Creating server backup..." />}
    </div>
  );
}