import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Key,
  Plus,
  Trash2,
  RefreshCw,
  Copy,
  Check,
  X,
  Hexagon,
  Sparkles,
  AlertTriangle,
  Shield,
  Lock,
  Calendar,
  Clock,
  Activity,
  KeyRound,
  CheckCircle2
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// ============================================
// AstroWax Panel V1.80 — API Keys Manager
// Glass + Purple Theme
// ============================================

export default function ApiKeysManager() {
  const [apiKeys, setApiKeys] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newKeyLabel, setNewKeyLabel] = useState("");
  const [newKeyString, setNewKeyString] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  useEffect(() => {
    fetchApiKeys();
  }, []);

  const fetchApiKeys = async () => {
    try {
      const res = await axios.get("/api/admin/api-keys");
      setApiKeys(res.data);
    } catch (e) {
      console.error("Failed to fetch API keys", e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateKey = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    try {
      const res = await axios.post("/api/admin/api-keys", {
        label: newKeyLabel || "Unnamed Key",
        scopes: ["*"]
      });
      setNewKeyString(res.data.key);
      fetchApiKeys();
      setNewKeyLabel("");
    } catch (e) {
      console.error("Failed to create API key", e);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDeleteKey = async (id: string) => {
    setDeleteConfirmId(null);
    try {
      await axios.delete(`/api/admin/api-keys/${id}`);
      fetchApiKeys();
    } catch (e) {
      console.error("Failed to delete API key", e);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2000);
  };

  if (isLoading) {
    return (
      <div
        className="rounded-2xl p-6 md:p-8 mt-8 flex items-center justify-center min-h-[200px]"
        style={{
          background: 'linear-gradient(135deg, rgba(20,12,35,.7), rgba(13,8,25,.85))',
          border: '1px solid rgba(168,85,247,.2)',
          backdropFilter: 'blur(16px)',
        }}
      >
        <div className="flex flex-col items-center gap-3">
          <div
            className="w-10 h-10 rounded-full animate-spin"
            style={{
              border: '2px solid rgba(168,85,247,.2)',
              borderTopColor: '#a855f7',
              borderRightColor: '#c084fc',
              filter: 'drop-shadow(0 0 8px rgba(168,85,247,.6))',
            }}
          />
          <span className="text-[10px] font-mono uppercase tracking-widest" style={{ color: '#c084fc' }}>
            Loading API keys...
          </span>
        </div>
      </div>
    );
  }

  return (
    <>
      <style dangerouslySetInnerHTML={{__html: `
        .aw-api-glass {
          background: linear-gradient(135deg, rgba(20,12,35,.7) 0%, rgba(13,8,25,.85) 100%);
          backdrop-filter: blur(16px) saturate(1.4);
          -webkit-backdrop-filter: blur(16px) saturate(1.4);
          border: 1px solid rgba(168,85,247,.2);
          border-radius: 20px;
          position: relative;
          overflow: hidden;
        }
        .aw-api-glass::before {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(168,85,247,.5), rgba(255,255,255,.2), rgba(168,85,247,.5), transparent);
          pointer-events: none;
          z-index: 2;
        }

        .aw-api-card {
          transition: all .25s cubic-bezier(.16,1,.3,1);
        }
        .aw-api-card:hover {
          border-color: rgba(168,85,247,.35);
          box-shadow: 0 0 32px -8px rgba(168,85,247,.3);
          transform: translateY(-2px);
        }

        .aw-api-btn {
          transition: all .25s cubic-bezier(.16,1,.3,1);
        }
        .aw-api-btn:hover:not(:disabled) {
          transform: translateY(-1px);
        }
        .aw-api-btn:active:not(:disabled) {
          transform: translateY(0) scale(.97);
        }

        .aw-api-input {
          transition: all .25s cubic-bezier(.16,1,.3,1);
        }
        .aw-api-input:focus {
          outline: none;
          border-color: rgba(168,85,247,.6) !important;
          box-shadow: 0 0 0 3px rgba(168,85,247,.1), 0 0 20px -4px rgba(168,85,247,.4) !important;
        }
        .aw-api-input::placeholder { color: rgba(161,161,170,.5); }

        @keyframes awApiIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .aw-api-in { animation: awApiIn .4s cubic-bezier(.16,1,.3,1) both; }

        @keyframes awApiModalIn {
          from { opacity: 0; transform: translateY(16px) scale(.96); filter: blur(6px); }
          to { opacity: 1; transform: translateY(0) scale(1); filter: blur(0); }
        }
        .aw-api-modal { animation: awApiModalIn .35s cubic-bezier(.16,1,.3,1) both; }

        @keyframes awKeyPulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(168,85,247,.5); }
          50% { box-shadow: 0 0 0 8px rgba(168,85,247,0); }
        }
        .aw-key-pulse { animation: awKeyPulse 2s ease-in-out infinite; }
      `}} />

      <div className="aw-api-glass p-6 md:p-8 mt-8 aw-api-in">

        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <h2
            className="text-xl font-black tracking-tight flex items-center gap-2.5"
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
              <Key className="w-5 h-5" style={{ color: '#c084fc' }} />
            </span>
            API Keys
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

          <button
            onClick={() => {
              setNewKeyString(null);
              setShowAddModal(true);
            }}
            className="aw-api-btn flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-white text-sm shrink-0"
            style={{
              background: 'linear-gradient(135deg, #a855f7, #7e22ce)',
              boxShadow: '0 4px 16px -4px rgba(168,85,247,.6)',
            }}
          >
            <Plus size={18} />
            <span>Generate Key</span>
          </button>
        </div>

        {/* New Key Banner */}
        {newKeyString && !showAddModal && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: .98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            className="mb-6 rounded-xl p-4 aw-api-in"
            style={{
              background: 'linear-gradient(135deg, rgba(168,85,247,.15), rgba(168,85,247,.05))',
              border: '1px solid rgba(168,85,247,.45)',
              boxShadow: '0 0 32px -8px rgba(168,85,247,.4)',
            }}
          >
            <div className="flex items-start gap-3 mb-3">
              <div
                className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0 aw-key-pulse"
                style={{
                  background: 'rgba(168,85,247,.2)',
                  border: '1px solid rgba(168,85,247,.5)',
                }}
              >
                <Sparkles className="w-4 h-4" style={{ color: '#c084fc' }} />
              </div>
              <div>
                <h3 className="font-bold text-sm flex items-center gap-2" style={{ color: '#c084fc' }}>
                  New API Key Generated!
                </h3>
                <p className="text-xs mt-0.5" style={{ color: 'rgba(233,213,255,.8)' }}>
                  Please copy this key now. You will <strong>not</strong> be able to see it again.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <code
                className="flex-1 px-3 py-2.5 rounded-lg font-mono text-xs sm:text-sm break-all"
                style={{
                  background: 'rgba(0,0,0,.5)',
                  border: '1px solid rgba(168,85,247,.3)',
                  color: '#e9d5ff',
                }}
              >
                {newKeyString}
              </code>
              <button
                onClick={() => copyToClipboard(newKeyString)}
                className="aw-api-btn p-2.5 rounded-lg shrink-0"
                style={{
                  background: copiedKey ? 'rgba(16,185,129,.2)' : 'rgba(168,85,247,.15)',
                  border: copiedKey ? '1px solid rgba(16,185,129,.4)' : '1px solid rgba(168,85,247,.35)',
                  color: copiedKey ? '#34d399' : '#c084fc',
                }}
                title="Copy to clipboard"
              >
                {copiedKey ? <Check size={18} /> : <Copy size={18} />}
              </button>
            </div>
          </motion.div>
        )}

        {/* Keys List */}
        {apiKeys.length === 0 ? (
          <div
            className="text-center p-10 rounded-xl flex flex-col items-center"
            style={{
              background: 'rgba(0,0,0,.25)',
              border: '1px dashed rgba(168,85,247,.25)',
            }}
          >
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center mb-3"
              style={{
                background: 'rgba(168,85,247,.08)',
                border: '1px solid rgba(168,85,247,.2)',
              }}
            >
              <KeyRound className="w-7 h-7" style={{ color: 'rgba(192,132,252,.5)' }} />
            </div>
            <p className="text-sm font-semibold" style={{ color: '#e9d5ff' }}>
              No API keys generated yet
            </p>
            <p className="text-xs mt-1" style={{ color: '#a1a1aa' }}>
              Click "Generate Key" to create your first API key.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {apiKeys.map((key, idx) => (
              <motion.div
                key={key.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.04 }}
                className="aw-api-card rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                style={{
                  background: key.revoked
                    ? 'rgba(0,0,0,.3)'
                    : 'linear-gradient(135deg, rgba(20,12,35,.6), rgba(13,8,25,.75))',
                  border: key.revoked
                    ? '1px solid rgba(168,85,247,.1)'
                    : '1px solid rgba(168,85,247,.2)',
                  opacity: key.revoked ? 0.55 : 1,
                }}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
                    style={{
                      background: key.revoked ? 'rgba(0,0,0,.4)' : 'rgba(168,85,247,.1)',
                      border: key.revoked ? '1px solid rgba(168,85,247,.15)' : '1px solid rgba(168,85,247,.3)',
                      boxShadow: key.revoked ? 'none' : '0 0 20px -8px rgba(168,85,247,.5)',
                    }}
                  >
                    <Key
                      className="w-5 h-5"
                      style={{ color: key.revoked ? '#71717a' : '#c084fc' }}
                    />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="font-bold text-sm truncate" style={{ color: '#e9d5ff' }}>
                        {key.label}
                      </h4>
                      {key.revoked && (
                        <span
                          className="text-[9px] uppercase font-bold tracking-widest px-2 py-0.5 rounded-md"
                          style={{
                            background: 'rgba(244,63,94,.15)',
                            color: '#fda4af',
                            border: '1px solid rgba(244,63,94,.35)',
                          }}
                        >
                          Revoked
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] mt-1 flex flex-col sm:flex-row sm:gap-4 gap-0.5" style={{ color: 'rgba(161,161,170,.75)' }}>
                      <span className="flex items-center gap-1.5">
                        <Calendar size={10} />
                        Created: {new Date(key.created_at).toLocaleDateString()}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Clock size={10} />
                        Last used: {key.last_used_at ? new Date(key.last_used_at).toLocaleDateString() : 'Never'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {deleteConfirmId === key.id ? (
                    <div
                      className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg"
                      style={{
                        background: 'linear-gradient(135deg, rgba(244,63,94,.15), rgba(244,63,94,.05))',
                        border: '1px solid rgba(244,63,94,.4)',
                      }}
                    >
                      <span className="text-[11px] font-semibold" style={{ color: '#fda4af' }}>
                        Delete?
                      </span>
                      <button
                        onClick={() => handleDeleteKey(key.id)}
                        className="aw-api-btn font-bold px-2 py-0.5 rounded text-[11px] text-white"
                        style={{
                          background: 'linear-gradient(135deg, #f43f5e, #be123c)',
                          boxShadow: '0 2px 8px -2px rgba(244,63,94,.6)',
                        }}
                      >
                        Yes
                      </button>
                      <button
                        onClick={() => setDeleteConfirmId(null)}
                        className="aw-api-btn px-2 py-0.5 rounded text-[11px] font-medium"
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
                      onClick={() => setDeleteConfirmId(key.id)}
                      className="aw-api-btn p-2 rounded-lg"
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
                      title="Delete Key"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Add Modal */}
      <AnimatePresence>
        {showAddModal && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{
              background: 'rgba(0,0,0,.75)',
              backdropFilter: 'blur(12px)',
              WebkitBackdropFilter: 'blur(12px)',
            }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, filter: 'blur(6px)' }}
              animate={{ opacity: 1, scale: 1, filter: 'blur(0)' }}
              exit={{ opacity: 0, scale: 0.95, filter: 'blur(6px)' }}
              className="relative w-full max-w-md rounded-2xl overflow-hidden aw-api-modal"
              style={{
                background: 'linear-gradient(135deg, rgba(20,12,35,.96), rgba(13,8,25,.98))',
                border: '1px solid rgba(168,85,247,.35)',
                backdropFilter: 'blur(24px) saturate(1.4)',
                boxShadow: '0 30px 80px -20px rgba(0,0,0,.9), 0 0 0 1px rgba(168,85,247,.15), 0 0 40px -12px rgba(168,85,247,.4)',
              }}
            >
              <div
                className="absolute top-0 left-0 right-0 h-px pointer-events-none z-20"
                style={{
                  background: 'linear-gradient(90deg, transparent, rgba(168,85,247,.7), rgba(255,255,255,.3), rgba(168,85,247,.7), transparent)',
                }}
              />

              <div
                className="flex items-center justify-between p-5"
                style={{
                  borderBottom: '1px solid rgba(168,85,247,.18)',
                  background: 'rgba(0,0,0,.3)',
                }}
              >
                <h3 className="text-base font-bold flex items-center gap-2" style={{ color: '#e9d5ff' }}>
                  <span
                    className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                    style={{
                      background: 'rgba(168,85,247,.12)',
                      border: '1px solid rgba(168,85,247,.3)',
                      color: '#c084fc',
                    }}
                  >
                    <KeyRound className="w-4 h-4" />
                  </span>
                  Generate API Key
                </h3>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="aw-api-btn p-1.5 rounded-lg"
                  style={{
                    background: 'rgba(168,85,247,.08)',
                    border: '1px solid rgba(168,85,247,.2)',
                    color: '#a1a1aa',
                  }}
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleCreateKey} className="p-5">
                <div className="mb-6">
                  <label
                    className="block text-[10px] font-bold uppercase tracking-widest mb-2"
                    style={{ color: '#c084fc' }}
                  >
                    Key Label (Optional)
                  </label>
                  <input
                    type="text"
                    value={newKeyLabel}
                    onChange={(e) => setNewKeyLabel(e.target.value)}
                    placeholder="e.g. CI/CD Pipeline"
                    className="aw-api-input w-full rounded-xl px-4 py-3 text-sm"
                    style={{
                      background: 'rgba(0,0,0,.5)',
                      border: '1px solid rgba(168,85,247,.25)',
                      color: '#e9d5ff',
                      caretColor: '#c084fc',
                    }}
                  />
                </div>

                <div className="flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="aw-api-btn px-4 py-2 rounded-xl text-xs font-semibold"
                    style={{
                      background: 'rgba(0,0,0,.4)',
                      border: '1px solid rgba(168,85,247,.2)',
                      color: '#a1a1aa',
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isProcessing}
                    className="aw-api-btn px-4 py-2 rounded-xl text-xs font-semibold text-white flex items-center gap-2 disabled:opacity-50"
                    style={{
                      background: 'linear-gradient(135deg, #a855f7, #7e22ce)',
                      boxShadow: '0 4px 16px -4px rgba(168,85,247,.6)',
                    }}
                  >
                    {isProcessing ? (
                      <>
                        <div className="w-3.5 h-3.5 rounded-full border-2 animate-spin" style={{ borderColor: 'rgba(255,255,255,.5)', borderTopColor: '#fff' }} />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Sparkles size={14} />
                        Generate
                      </>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}