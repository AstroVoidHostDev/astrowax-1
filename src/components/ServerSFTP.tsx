import React, { useState, useEffect } from "react";
import axios from "axios";
import { AnimatePresence, motion } from "framer-motion";
import {
  Network,
  Copy,
  Check,
  Key,
  RefreshCw,
  Eye,
  EyeOff,
  AlertTriangle,
  ShieldCheck,
  Lock,
  Hexagon,
  Sparkles,
  Server,
  Info,
  Terminal,
  FileLock2
} from "lucide-react";
import { LoadingOverlay } from "./LoadingOverlay";

// ============================================
// AstroWax Panel V1.80 — Server SFTP
// Glass + Purple Theme
// ============================================

export default function ServerSFTP({ serverId, server }: { serverId: string, server: any }) {
  const [sftpInfo, setSftpInfo] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [isResetting, setIsResetting] = useState(false);

  useEffect(() => {
    fetchSftpInfo();
  }, [serverId]);

  const fetchSftpInfo = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`/api/servers/${serverId}/sftp`);
      setSftpInfo(res.data);
      setError(null);
    } catch (e: any) {
      if (e.response?.status === 404) {
        setSftpInfo(null);
      } else {
        setError("Failed to fetch SFTP details. The SFTP service might be unavailable.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const createSftpAccount = async () => {
    try {
      setLoading(true);
      const res = await axios.post(`/api/servers/${serverId}/sftp/create`);
      setSftpInfo(res.data);
    } catch (e: any) {
      setError(e.response?.data?.error || "Failed to create SFTP account");
    } finally {
      setLoading(false);
    }
  };

  const [showConfirmReset, setShowConfirmReset] = useState(false);

  const executeResetPassword = async () => {
    try {
      setIsResetting(true);
      setShowConfirmReset(false);
      const res = await axios.post(`/api/servers/${serverId}/sftp/reset-password`);
      setSftpInfo(res.data);
    } catch (e: any) {
      setError(e.response?.data?.error || "Failed to reset password");
    } finally {
      setIsResetting(false);
    }
  };

  const resetPassword = () => {
    setShowConfirmReset(true);
  };

  return (
    <>
      <style dangerouslySetInnerHTML={{__html: `
        .aw-sftp-glass {
          background: linear-gradient(135deg, rgba(20,12,35,.7) 0%, rgba(13,8,25,.85) 100%);
          backdrop-filter: blur(16px) saturate(1.4);
          -webkit-backdrop-filter: blur(16px) saturate(1.4);
          border: 1px solid rgba(168,85,247,.2);
          border-radius: 20px;
          position: relative;
          overflow: hidden;
          transition: all .3s cubic-bezier(.16,1,.3,1);
        }
        .aw-sftp-glass::before {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(168,85,247,.5), rgba(255,255,255,.2), rgba(168,85,247,.5), transparent);
          pointer-events: none;
          z-index: 2;
        }

        .aw-sftp-btn {
          transition: all .25s cubic-bezier(.16,1,.3,1);
        }
        .aw-sftp-btn:hover:not(:disabled) {
          transform: translateY(-1px);
        }
        .aw-sftp-btn:active:not(:disabled) {
          transform: translateY(0) scale(.97);
        }

        .aw-sftp-scroll::-webkit-scrollbar { width: 8px; }
        .aw-sftp-scroll::-webkit-scrollbar-track { background: rgba(0,0,0,.3); }
        .aw-sftp-scroll::-webkit-scrollbar-thumb {
          background: linear-gradient(180deg, #a855f7, #7e22ce);
          border-radius: 4px;
        }
        .aw-sftp-scroll::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(180deg, #c084fc, #a855f7);
        }

        @keyframes awSftpIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .aw-sftp-in { animation: awSftpIn .4s cubic-bezier(.16,1,.3,1) both; }

        @keyframes awSftpSpinner {
          to { transform: rotate(360deg); }
        }
        .aw-sftp-spinner {
          border: 2px solid rgba(168,85,247,.2);
          border-top-color: #a855f7;
          border-right-color: #c084fc;
          border-radius: 50%;
          filter: drop-shadow(0 0 8px rgba(168,85,247,.6));
          animation: awSftpSpinner 1.2s linear infinite;
        }
      `}} />

      {loading ? (
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="flex flex-col items-center gap-3">
            <div className="aw-sftp-spinner w-10 h-10" />
            <span className="text-[10px] font-mono uppercase tracking-widest" style={{ color: '#c084fc' }}>
              Loading SFTP info...
            </span>
          </div>
        </div>
      ) : (
        <div className="flex-1 p-6 overflow-y-auto aw-sftp-scroll">
          <div className="max-w-4xl mx-auto space-y-6">

            {/* Header */}
            <div className="aw-sftp-in">
              <h2
                className="text-2xl font-black tracking-tight flex items-center gap-2.5 mb-1.5"
                style={{ color: '#fff' }}
              >
                <span
                  className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                  style={{
                    background: 'rgba(168,85,247,.12)',
                    border: '1px solid rgba(168,85,247,.3)',
                    boxShadow: '0 0 20px -6px rgba(168,85,247,.6)',
                  }}
                >
                  <Network className="w-5 h-5" style={{ color: '#c084fc' }} />
                </span>
                SFTP Details
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
              <p className="text-xs" style={{ color: '#a1a1aa' }}>
                Manage your secure file transfer protocol (SFTP) access credentials.
              </p>
            </div>

            {/* Error */}
            {error && (
              <div
                className="p-4 rounded-xl flex items-start gap-3 aw-sftp-in"
                style={{
                  background: 'linear-gradient(135deg, rgba(244,63,94,.15), rgba(244,63,94,.04))',
                  border: '1px solid rgba(244,63,94,.4)',
                  color: '#fda4af',
                }}
              >
                <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
                <p className="text-sm font-medium">{error}</p>
              </div>
            )}

            {/* No SFTP Account */}
            {!sftpInfo ? (
              <div className="aw-sftp-glass aw-sftp-in p-8 flex flex-col items-center justify-center text-center">
                <div
                  className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
                  style={{
                    background: 'rgba(168,85,247,.12)',
                    border: '1px solid rgba(168,85,247,.3)',
                    boxShadow: '0 0 32px -8px rgba(168,85,247,.5)',
                  }}
                >
                  <ShieldCheck className="w-8 h-8" style={{ color: '#c084fc' }} />
                </div>
                <h3 className="text-xl font-bold mb-2" style={{ color: '#e9d5ff' }}>
                  No SFTP Account Found
                </h3>
                <p className="text-sm max-w-md mb-6 leading-relaxed" style={{ color: '#a1a1aa' }}>
                  An SFTP account has not been provisioned for this server yet. Create one now to securely manage your server files.
                </p>
                <button
                  onClick={createSftpAccount}
                  className="aw-sftp-btn px-6 py-3 rounded-xl font-bold flex items-center gap-2 text-white text-sm"
                  style={{
                    background: 'linear-gradient(135deg, #a855f7, #7e22ce)',
                    boxShadow: '0 6px 24px -6px rgba(168,85,247,.7)',
                  }}
                >
                  <Sparkles className="w-4 h-4" />
                  Generate SFTP Credentials
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                {/* Left Column */}
                <div className="space-y-6">

                  {/* Connection Info */}
                  <div className="aw-sftp-glass aw-sftp-in p-6">
                    <h3 className="text-base font-bold mb-6 flex items-center gap-2" style={{ color: '#e9d5ff' }}>
                      <span
                        className="w-8 h-8 rounded-lg flex items-center justify-center"
                        style={{
                          background: 'rgba(168,85,247,.12)',
                          border: '1px solid rgba(168,85,247,.3)',
                          color: '#c084fc',
                        }}
                      >
                        <Key className="w-4 h-4" />
                      </span>
                      Connection Info
                    </h3>

                    <div className="space-y-5">

                      {/* Host */}
                      <div>
                        <label
                          className="block text-[10px] font-bold uppercase tracking-widest mb-2"
                          style={{ color: '#c084fc' }}
                        >
                          Host
                        </label>
                        <div className="flex">
                          <div
                            className="flex-1 rounded-l-xl px-4 py-3 font-mono text-sm truncate"
                            style={{
                              background: 'rgba(0,0,0,.5)',
                              border: '1px solid rgba(168,85,247,.2)',
                              borderRight: 'none',
                              color: '#e9d5ff',
                            }}
                          >
                            {sftpInfo.host}
                          </div>
                          <button
                            onClick={() => handleCopy(sftpInfo.host, 'host')}
                            className="aw-sftp-btn px-4 rounded-r-xl flex items-center justify-center"
                            style={{
                              background: 'rgba(0,0,0,.5)',
                              border: '1px solid rgba(168,85,247,.2)',
                              color: copiedField === 'host' ? '#34d399' : '#c084fc',
                            }}
                          >
                            {copiedField === 'host' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>

                      {/* Port */}
                      <div>
                        <label
                          className="block text-[10px] font-bold uppercase tracking-widest mb-2"
                          style={{ color: '#c084fc' }}
                        >
                          Port
                        </label>
                        <div className="flex">
                          <div
                            className="flex-1 rounded-l-xl px-4 py-3 font-mono text-sm"
                            style={{
                              background: 'rgba(0,0,0,.5)',
                              border: '1px solid rgba(168,85,247,.2)',
                              borderRight: 'none',
                              color: '#e9d5ff',
                            }}
                          >
                            {sftpInfo.port}
                          </div>
                          <button
                            onClick={() => handleCopy(sftpInfo.port.toString(), 'port')}
                            className="aw-sftp-btn px-4 rounded-r-xl flex items-center justify-center"
                            style={{
                              background: 'rgba(0,0,0,.5)',
                              border: '1px solid rgba(168,85,247,.2)',
                              color: copiedField === 'port' ? '#34d399' : '#c084fc',
                            }}
                          >
                            {copiedField === 'port' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>

                      {/* Username */}
                      <div>
                        <label
                          className="block text-[10px] font-bold uppercase tracking-widest mb-2"
                          style={{ color: '#c084fc' }}
                        >
                          Username
                        </label>
                        <div className="flex">
                          <div
                            className="flex-1 rounded-l-xl px-4 py-3 font-mono text-sm truncate"
                            style={{
                              background: 'rgba(0,0,0,.5)',
                              border: '1px solid rgba(168,85,247,.2)',
                              borderRight: 'none',
                              color: '#e9d5ff',
                            }}
                          >
                            {sftpInfo.username}
                          </div>
                          <button
                            onClick={() => handleCopy(sftpInfo.username, 'username')}
                            className="aw-sftp-btn px-4 rounded-r-xl flex items-center justify-center"
                            style={{
                              background: 'rgba(0,0,0,.5)',
                              border: '1px solid rgba(168,85,247,.2)',
                              color: copiedField === 'username' ? '#34d399' : '#c084fc',
                            }}
                          >
                            {copiedField === 'username' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>

                      {/* Password */}
                      <div>
                        <label
                          className="block text-[10px] font-bold uppercase tracking-widest mb-2"
                          style={{ color: '#c084fc' }}
                        >
                          Password
                        </label>
                        {sftpInfo.password.startsWith("(Hidden") ? (
                          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                            <div
                              className="flex-1 rounded-xl px-4 py-3 font-mono text-sm italic flex items-center justify-between"
                              style={{
                                background: 'rgba(0,0,0,.5)',
                                border: '1px solid rgba(168,85,247,.25)',
                                color: 'rgba(161,161,170,.7)',
                              }}
                            >
                              <span>••••••••••••••••</span>
                              <Lock className="w-4 h-4" style={{ color: 'rgba(168,85,247,.5)' }} />
                            </div>
                            <button
                              onClick={resetPassword}
                              disabled={isResetting}
                              className="aw-sftp-btn px-5 py-3 rounded-xl font-bold flex items-center justify-center gap-2 shrink-0 disabled:opacity-50 text-white text-sm"
                              style={{
                                background: 'linear-gradient(135deg, #a855f7, #7e22ce)',
                                boxShadow: '0 4px 16px -4px rgba(168,85,247,.6)',
                              }}
                            >
                              <RefreshCw className={`w-4 h-4 ${isResetting ? "animate-spin" : ""}`} />
                              Generate Password
                            </button>
                          </div>
                        ) : (
                          <div className="flex">
                            <div
                              className="flex-1 rounded-l-xl px-4 py-3 font-mono text-sm truncate font-bold"
                              style={{
                                background: 'linear-gradient(135deg, rgba(168,85,247,.12), rgba(168,85,247,.05))',
                                border: '1px solid rgba(168,85,247,.3)',
                                borderRight: 'none',
                                color: '#c084fc',
                              }}
                            >
                              {showPassword ? sftpInfo.password : "••••••••••••••••"}
                            </div>
                            <button
                              onClick={() => setShowPassword(!showPassword)}
                              className="aw-sftp-btn px-4 flex items-center justify-center"
                              style={{
                                background: 'rgba(0,0,0,.5)',
                                border: '1px solid rgba(168,85,247,.3)',
                                borderRight: 'none',
                                color: '#c084fc',
                              }}
                            >
                              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                            <button
                              onClick={() => handleCopy(sftpInfo.password, 'password')}
                              className="aw-sftp-btn px-4 rounded-r-xl flex items-center justify-center"
                              style={{
                                background: 'rgba(168,85,247,.15)',
                                border: '1px solid rgba(168,85,247,.35)',
                                color: copiedField === 'password' ? '#34d399' : '#c084fc',
                              }}
                            >
                              {copiedField === 'password' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                            </button>
                          </div>
                        )}

                        {sftpInfo.password.startsWith("(Hidden") && (
                          <p
                            className="text-[11px] mt-2 flex items-center gap-1.5 px-2 py-1 rounded-md"
                            style={{
                              color: 'rgba(251,191,36,.9)',
                              background: 'rgba(245,158,11,.08)',
                              border: '1px solid rgba(245,158,11,.2)',
                              width: 'fit-content',
                            }}
                          >
                            <AlertTriangle className="w-3 h-3" />
                            For security, passwords are not stored. Generate a new one to connect.
                          </p>
                        )}
                        {!sftpInfo.password.startsWith("(Hidden") && (
                          <p
                            className="text-[11px] mt-2 flex items-center gap-1.5 px-2 py-1 rounded-md"
                            style={{
                              color: 'rgba(110,231,183,.9)',
                              background: 'rgba(16,185,129,.08)',
                              border: '1px solid rgba(16,185,129,.2)',
                              width: 'fit-content',
                            }}
                          >
                            <Check className="w-3 h-3" />
                            Password generated successfully. Copy it now, it won't be shown again.
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Security Card (amber warning) */}
                  <div
                    className="aw-sftp-glass aw-sftp-in p-6"
                    style={{
                      animationDelay: '.1s',
                      borderColor: 'rgba(245,158,11,.3)',
                      background: 'linear-gradient(135deg, rgba(245,158,11,.08), rgba(13,8,25,.85))',
                    }}
                  >
                    <h3 className="font-bold mb-2 flex items-center gap-2" style={{ color: '#fbbf24' }}>
                      <AlertTriangle className="w-5 h-5" />
                      Security
                    </h3>
                    <p className="text-sm mb-4 leading-relaxed" style={{ color: 'rgba(252,211,77,.8)' }}>
                      If you believe your SFTP credentials have been compromised, you can generate a new secure password. This will immediately disconnect any active sessions.
                    </p>
                    <button
                      onClick={resetPassword}
                      disabled={isResetting}
                      className="aw-sftp-btn px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2"
                      style={{
                        background: 'rgba(245,158,11,.15)',
                        border: '1px solid rgba(245,158,11,.4)',
                        color: '#fbbf24',
                      }}
                    >
                      <RefreshCw className={`w-4 h-4 ${isResetting ? "animate-spin" : ""}`} />
                      Reset Password
                    </button>
                  </div>
                </div>

                {/* Right Column — How to connect */}
                <div className="space-y-6">
                  <div className="aw-sftp-glass aw-sftp-in p-6" style={{ animationDelay: '.15s' }}>
                    <h3 className="text-base font-bold mb-4 flex items-center gap-2" style={{ color: '#e9d5ff' }}>
                      <span
                        className="w-8 h-8 rounded-lg flex items-center justify-center"
                        style={{
                          background: 'rgba(168,85,247,.12)',
                          border: '1px solid rgba(168,85,247,.3)',
                          color: '#c084fc',
                        }}
                      >
                        <Terminal className="w-4 h-4" />
                      </span>
                      How to connect
                    </h3>
                    <div className="space-y-4 text-sm leading-relaxed" style={{ color: 'rgba(212,212,216,.9)' }}>
                      <p>
                        You can connect to your server's files using an SFTP client such as{" "}
                        <a href="https://filezilla-project.org/" target="_blank" rel="noreferrer" className="font-semibold" style={{ color: '#c084fc' }}>FileZilla</a>,{" "}
                        <a href="https://winscp.net/" target="_blank" rel="noreferrer" className="font-semibold" style={{ color: '#c084fc' }}>WinSCP</a>, or{" "}
                        <a href="https://cyberduck.io/" target="_blank" rel="noreferrer" className="font-semibold" style={{ color: '#c084fc' }}>Cyberduck</a>.
                      </p>

                      <div
                        className="p-4 rounded-xl"
                        style={{
                          background: 'rgba(0,0,0,.4)',
                          border: '1px solid rgba(168,85,247,.2)',
                        }}
                      >
                        <p className="font-semibold mb-2 flex items-center gap-1.5" style={{ color: '#c084fc' }}>
                          <Sparkles size={12} />
                          Quick steps:
                        </p>
                        <ol className="list-decimal pl-4 space-y-2 text-xs" style={{ color: 'rgba(212,212,216,.85)' }}>
                          <li>Open your preferred SFTP client.</li>
                          <li>Copy and paste the <strong style={{ color: '#e9d5ff' }}>Host</strong> and <strong style={{ color: '#e9d5ff' }}>Port</strong>.</li>
                          <li>Enter your generated <strong style={{ color: '#e9d5ff' }}>Username</strong>.</li>
                          <li>Copy the <strong style={{ color: '#e9d5ff' }}>Password</strong> and paste it into the password field.</li>
                          <li>Click Connect. You may be asked to trust the host key on your first connection.</li>
                        </ol>
                      </div>

                      <div
                        className="p-4 rounded-xl text-xs"
                        style={{
                          background: 'linear-gradient(135deg, rgba(168,85,247,.1), rgba(168,85,247,.03))',
                          border: '1px solid rgba(168,85,247,.25)',
                          color: 'rgba(233,213,255,.8)',
                        }}
                      >
                        <strong style={{ color: '#c084fc' }}>Note:</strong> Your SFTP access is isolated. You can only view and modify files within this specific server's directory.
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {isResetting && <LoadingOverlay message="Resetting SFTP credentials..." />}

      {/* Confirm Reset Modal */}
      <AnimatePresence>
        {showConfirmReset && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{
              background: 'rgba(0,0,0,.75)',
              backdropFilter: 'blur(12px)',
              WebkitBackdropFilter: 'blur(12px)',
            }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10, filter: 'blur(6px)' }}
              animate={{ opacity: 1, scale: 1, y: 0, filter: 'blur(0)' }}
              exit={{ opacity: 0, scale: 0.95, y: 10, filter: 'blur(6px)' }}
              className="relative max-w-md w-full p-6 rounded-2xl"
              style={{
                background: 'linear-gradient(135deg, rgba(20,12,35,.96), rgba(13,8,25,.98))',
                border: '1px solid rgba(245,158,11,.4)',
                backdropFilter: 'blur(24px) saturate(1.4)',
                boxShadow: '0 30px 80px -20px rgba(0,0,0,.9), 0 0 0 1px rgba(245,158,11,.15), 0 0 40px -12px rgba(245,158,11,.4)',
              }}
            >
              {/* Top accent bar */}
              <div
                className="absolute top-0 left-0 right-0 h-1 rounded-t-2xl"
                style={{
                  background: 'linear-gradient(90deg, #f59e0b, #a855f7)',
                }}
              />

              <div className="flex items-start gap-4 mb-4">
                <div
                  className="p-3 rounded-xl shrink-0"
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
                    Reset SFTP Password
                  </h3>
                  <p className="text-sm leading-relaxed" style={{ color: 'rgba(252,211,77,.85)' }}>
                    Are you sure you want to reset your SFTP password? The old password will immediately become invalid and any active sessions will be disconnected.
                  </p>
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={() => setShowConfirmReset(false)}
                  className="aw-sftp-btn px-4 py-2 rounded-xl font-semibold text-sm"
                  style={{
                    background: 'rgba(0,0,0,.4)',
                    border: '1px solid rgba(168,85,247,.25)',
                    color: '#a1a1aa',
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={executeResetPassword}
                  className="aw-sftp-btn px-4 py-2 rounded-xl font-bold text-sm flex items-center gap-2"
                  style={{
                    background: 'linear-gradient(135deg, rgba(245,158,11,.9), rgba(217,119,6,.9))',
                    color: '#fff',
                    boxShadow: '0 4px 16px -4px rgba(245,158,11,.6)',
                  }}
                >
                  <RefreshCw className="w-4 h-4" />
                  Reset Password
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}