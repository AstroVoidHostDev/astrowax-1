// @ts-nocheck
import PageHeader from "../components/PageHeader";
import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import {
  Server, Settings, Search, Trash2, Edit2, Play, Square,
  PauseCircle, MoreVertical, ChevronRight, Hexagon,
  Sparkles, AlertTriangle, CheckCircle2, Shield
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";

// ============================================
// AstroWax Panel V1.80 — Admin Servers
// Glass + Purple Theme
// ============================================

export default function AdminServers() {
  const { user } = useAuth();
  const [servers, setServers] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const [editingServer, setEditingServer] = useState<any>(null);
  const [ram, setRam] = useState("");
  const [cpu, setCpu] = useState("");
  const [disk, setDisk] = useState("");

  const [suspendingServer, setSuspendingServer] = useState<any>(null);
  const [suspendDuration, setSuspendDuration] = useState("null");

  const [deletingServer, setDeletingServer] = useState<any>(null);

  const fetchData = async () => {
    try {
      const [serversRes, usersRes] = await Promise.all([
        axios.get("/api/servers"),
        axios.get("/api/system/users")
      ]);
      setServers(serversRes.data);
      setUsers(usersRes.data);
    } catch (e) { }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const getUsername = (id: string) => {
    const u = users.find(u => u.id === id);
    return u ? u.username : "Unknown";
  };

  const handleUpdateResources = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.put(`/api/servers/${editingServer.id}/resources`, {
        ram: Number(ram),
        cpu: Number(cpu),
        disk: Number(disk)
      });
      setEditingServer(null);
      fetchData();
    } catch (e) {
      alert("Failed to update resources");
    }
  };

  const handleUpdateSuspend = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const duration = suspendDuration === "null" ? null : suspendDuration;
      await axios.put(`/api/servers/${suspendingServer.id}/suspend`, {
        suspendDuration: duration
      });
      setSuspendingServer(null);
      fetchData();
    } catch (e) {
      alert("Failed to update suspension");
    }
  };

  const handleDelete = async () => {
    try {
      await axios.delete(`/api/servers/${deletingServer.id}`);
      setDeletingServer(null);
      fetchData();
    } catch (e) {
      alert("Failed to delete server");
    }
  };

  const filteredServers = servers.filter(s =>
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
      <style dangerouslySetInnerHTML={{__html: `
        .aw-as-glass {
          background: linear-gradient(135deg, rgba(20,12,35,.7) 0%, rgba(13,8,25,.85) 100%);
          backdrop-filter: blur(16px) saturate(1.4);
          -webkit-backdrop-filter: blur(16px) saturate(1.4);
          border: 1px solid rgba(168,85,247,.2);
          border-radius: 16px;
          position: relative;
          overflow: hidden;
          transition: all .3s cubic-bezier(.16,1,.3,1);
        }
        .aw-as-glass::before {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(168,85,247,.5), rgba(255,255,255,.2), rgba(168,85,247,.5), transparent);
          pointer-events: none;
          z-index: 2;
        }
        .aw-as-glass:hover {
          border-color: rgba(168,85,247,.4);
        }
        .aw-as-row {
          transition: all .25s cubic-bezier(.16,1,.3,1);
        }
        .aw-as-row:hover {
          background: rgba(168,85,247,.06);
        }
        .aw-as-btn {
          transition: all .25s cubic-bezier(.16,1,.3,1);
        }
        .aw-as-btn:hover:not(:disabled) {
          transform: translateY(-1px);
        }
        .aw-as-btn:active:not(:disabled) {
          transform: translateY(0) scale(.97);
        }
        .aw-as-scroll::-webkit-scrollbar { width: 8px; }
        .aw-as-scroll::-webkit-scrollbar-track { background: rgba(0,0,0,.3); }
        .aw-as-scroll::-webkit-scrollbar-thumb {
          background: linear-gradient(180deg, #a855f7, #7e22ce);
          border-radius: 4px;
        }
        .aw-as-input {
          transition: all .25s cubic-bezier(.16,1,.3,1);
        }
        .aw-as-input:focus {
          outline: none;
          border-color: rgba(168,85,247,.6) !important;
          box-shadow: 0 0 0 3px rgba(168,85,247,.1), 0 0 20px -4px rgba(168,85,247,.4) !important;
        }
        .aw-as-input::placeholder { color: rgba(161,161,170,.5); }
        .aw-as-modal {
          background: linear-gradient(135deg, rgba(20,12,35,.96), rgba(13,8,25,.98));
          border: 1px solid rgba(168,85,247,.35);
          backdrop-filter: blur(24px) saturate(1.4);
          border-radius: 20px;
          position: relative;
          overflow: hidden;
          box-shadow: 0 30px 80px -20px rgba(0,0,0,.9), 0 0 0 1px rgba(168,85,247,.15), 0 0 40px -12px rgba(168,85,247,.4);
        }
        .aw-as-modal::before {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(168,85,247,.6), rgba(255,255,255,.25), rgba(168,85,247,.6), transparent);
        }
        .aw-as-select option {
          background: #0d0819;
          color: #e9d5ff;
        }
        .aw-as-ctx-menu {
          background: linear-gradient(135deg, rgba(20,12,35,.98), rgba(13,8,25,.98));
          border: 1px solid rgba(168,85,247,.35);
          backdrop-filter: blur(20px) saturate(1.4);
          border-radius: 14px;
          overflow: hidden;
          box-shadow: 0 20px 48px -12px rgba(0,0,0,.8), 0 0 0 1px rgba(168,85,247,.15), 0 0 24px -8px rgba(168,85,247,.4);
        }
        @keyframes awAsIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .aw-as-in { animation: awAsIn .4s cubic-bezier(.16,1,.3,1) both; }
        @keyframes awAsModal {
          from { opacity: 0; transform: translateY(16px) scale(.96); filter: blur(6px); }
          to { opacity: 1; transform: translateY(0) scale(1); filter: blur(0); }
        }
        .aw-as-modal-in { animation: awAsModal .35s cubic-bezier(.16,1,.3,1) both; }
        @keyframes awAsSpin {
          to { transform: rotate(360deg); }
        }
        .aw-as-spinner {
          border: 2px solid rgba(168,85,247,.2);
          border-top-color: #a855f7;
          border-right-color: #c084fc;
          border-radius: 50%;
          filter: drop-shadow(0 0 8px rgba(168,85,247,.6));
          animation: awAsSpin 1.2s linear infinite;
        }
      `}} />

      <div className="w-full relative z-10">
        <PageHeader
          title="Manage Servers"
          subtitle="FLEET ADMINISTRATION"
        />

        {/* Search Bar */}
        <div className="aw-as-glass p-4 mb-6 flex items-center aw-as-in">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mr-3"
            style={{
              background: 'rgba(168,85,247,.12)',
              border: '1px solid rgba(168,85,247,.3)',
              boxShadow: '0 0 16px -4px rgba(168,85,247,.5)',
            }}
          >
            <Search className="w-4 h-4" style={{ color: '#c084fc' }} />
          </div>
          <input
            type="text"
            placeholder="Search servers by name or ID..."
            className="aw-as-input bg-transparent outline-none flex-1 text-sm"
            style={{ color: '#e9d5ff', caretColor: '#c084fc' }}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm("")}
              className="text-[11px] font-semibold px-2 py-1 rounded-md aw-as-btn"
              style={{
                color: '#c084fc',
                background: 'rgba(168,85,247,.1)',
                border: '1px solid rgba(168,85,247,.25)',
              }}
            >
              Clear
            </button>
          )}
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <div className="w-10 h-10 rounded-full aw-as-spinner" />
            <span className="text-[10px] font-mono uppercase tracking-widest" style={{ color: '#c084fc' }}>
              Loading servers...
            </span>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3">
            {filteredServers.map((server, idx) => (
              <div
                key={server.id}
                className="aw-as-glass aw-as-row aw-as-in p-5 flex flex-col md:flex-row items-center justify-between gap-4"
                style={{ animationDelay: `${idx * 0.03}s` }}
              >
                <div className="flex items-center gap-4 flex-1 min-w-0">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center border shrink-0"
                    style={
                      server.suspended
                        ? {
                            background: 'rgba(245,158,11,.12)',
                            border: '1px solid rgba(245,158,11,.35)',
                            boxShadow: '0 0 20px -6px rgba(245,158,11,.5)',
                          }
                        : {
                            background: 'rgba(168,85,247,.12)',
                            border: '1px solid rgba(168,85,247,.3)',
                            boxShadow: '0 0 20px -6px rgba(168,85,247,.5)',
                          }
                    }
                  >
                    <Server className="w-5 h-5" style={{ color: server.suspended ? '#fbbf24' : '#c084fc' }} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-bold text-base truncate" style={{ color: '#e9d5ff' }}>
                        {server.name}
                      </h3>
                      {server.suspended && (
                        <span
                          className="text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-md flex items-center gap-1"
                          style={{
                            background: 'rgba(245,158,11,.15)',
                            border: '1px solid rgba(245,158,11,.4)',
                            color: '#fbbf24',
                          }}
                        >
                          <PauseCircle size={9} />
                          Suspended
                        </span>
                      )}
                    </div>
                    <div className="flex gap-3 text-xs mt-1 flex-wrap" style={{ color: '#a1a1aa' }}>
                      <span className="font-mono flex items-center gap-1.5">
                        <span
                          className="px-1.5 py-0.5 rounded"
                          style={{
                            background: 'rgba(168,85,247,.1)',
                            color: '#c084fc',
                            border: '1px solid rgba(168,85,247,.25)',
                          }}
                        >
                          {server.type}
                        </span>
                        {server.version}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Shield size={11} style={{ color: 'rgba(168,85,247,.6)' }} />
                        Owner: <span style={{ color: '#c084fc' }}>{getUsername(server.owner)}</span>
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <ActionMenu
                    server={server}
                    setEditingServer={setEditingServer}
                    setRam={setRam}
                    setCpu={setCpu}
                    setDisk={setDisk}
                    setSuspendingServer={setSuspendingServer}
                    setSuspendDuration={setSuspendDuration}
                    setDeletingServer={setDeletingServer}
                  />
                  <Link
                    to={`/servers/${server.id}`}
                    className="aw-as-btn flex items-center gap-2 px-4 py-2 rounded-xl text-white text-sm font-semibold shrink-0"
                    style={{
                      background: 'linear-gradient(135deg, #a855f7, #7e22ce)',
                      boxShadow: '0 4px 16px -4px rgba(168,85,247,.6)',
                    }}
                  >
                    <span className="hidden sm:inline">Console</span>
                    <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            ))}
            {filteredServers.length === 0 && (
              <div className="aw-as-glass p-12 text-center aw-as-in">
                <div
                  className="w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center"
                  style={{
                    background: 'rgba(168,85,247,.08)',
                    border: '1px solid rgba(168,85,247,.2)',
                  }}
                >
                  <Server size={28} style={{ color: 'rgba(192,132,252,.5)' }} />
                </div>
                <p className="font-semibold text-sm" style={{ color: '#e9d5ff' }}>
                  No servers found
                </p>
                <p className="text-xs mt-1" style={{ color: '#a1a1aa' }}>
                  Try adjusting your search query.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Edit Resources Modal */}
        <AnimatePresence>
          {editingServer && (
            <div
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
              style={{
                background: 'rgba(0,0,0,.75)',
                backdropFilter: 'blur(12px)',
              }}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.95, filter: 'blur(6px)' }}
                animate={{ opacity: 1, scale: 1, filter: 'blur(0)' }}
                exit={{ opacity: 0, scale: 0.95, filter: 'blur(6px)' }}
                className="aw-as-modal p-6 max-w-md w-full"
              >
                <h2 className="text-lg font-bold mb-4 flex items-center gap-2" style={{ color: '#e9d5ff' }}>
                  <span
                    className="w-8 h-8 rounded-lg flex items-center justify-center"
                    style={{
                      background: 'rgba(168,85,247,.12)',
                      border: '1px solid rgba(168,85,247,.3)',
                      color: '#c084fc',
                    }}
                  >
                    <Settings size={16} />
                  </span>
                  Edit Resources
                  <span className="text-xs font-mono" style={{ color: 'rgba(192,132,252,.7)' }}>
                    {editingServer.name}
                  </span>
                </h2>
                <form onSubmit={handleUpdateResources}>
                  <div className="space-y-4 mb-6">
                    {[
                      { label: "RAM (GB)", value: ram, set: setRam, min: "1" },
                      { label: "CPU (%)", value: cpu, set: setCpu, min: "50" },
                      { label: "Disk (GB)", value: disk, set: setDisk, min: "1" },
                    ].map((field) => (
                      <div key={field.label}>
                        <label className="block text-[10px] font-bold uppercase tracking-widest mb-1.5" style={{ color: '#c084fc' }}>
                          {field.label}
                        </label>
                        <input
                          type="number"
                          value={field.value}
                          onChange={e => field.set(e.target.value)}
                          required
                          min={field.min}
                          className="aw-as-input w-full rounded-xl px-4 py-2.5 text-sm"
                          style={{
                            background: 'rgba(0,0,0,.5)',
                            border: '1px solid rgba(168,85,247,.25)',
                            color: '#e9d5ff',
                            caretColor: '#c084fc',
                          }}
                        />
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setEditingServer(null)}
                      className="aw-as-btn px-4 py-2 rounded-xl text-xs font-semibold"
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
                      className="aw-as-btn px-4 py-2 rounded-xl text-xs font-bold text-white"
                      style={{
                        background: 'linear-gradient(135deg, #a855f7, #7e22ce)',
                        boxShadow: '0 4px 16px -4px rgba(168,85,247,.6)',
                      }}
                    >
                      Save Changes
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Suspend Modal */}
        <AnimatePresence>
          {suspendingServer && (
            <div
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
              style={{
                background: 'rgba(0,0,0,.75)',
                backdropFilter: 'blur(12px)',
              }}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.95, filter: 'blur(6px)' }}
                animate={{ opacity: 1, scale: 1, filter: 'blur(0)' }}
                exit={{ opacity: 0, scale: 0.95, filter: 'blur(6px)' }}
                className="aw-as-modal p-6 max-w-md w-full"
              >
                <h2 className="text-lg font-bold mb-4 flex items-center gap-2" style={{ color: '#fcd34d' }}>
                  <span
                    className="w-8 h-8 rounded-lg flex items-center justify-center"
                    style={{
                      background: 'rgba(245,158,11,.15)',
                      border: '1px solid rgba(245,158,11,.4)',
                      color: '#fbbf24',
                    }}
                  >
                    <PauseCircle size={16} />
                  </span>
                  Manage Suspension
                  <span className="text-xs font-mono" style={{ color: 'rgba(252,211,77,.7)' }}>
                    {suspendingServer.name}
                  </span>
                </h2>
                <form onSubmit={handleUpdateSuspend}>
                  <div className="mb-6">
                    <label className="block text-[10px] font-bold uppercase tracking-widest mb-2" style={{ color: '#c084fc' }}>
                      Suspension Duration
                    </label>
                    <select
                      value={suspendDuration}
                      onChange={e => setSuspendDuration(e.target.value)}
                      className="aw-as-input aw-as-select w-full rounded-xl px-4 py-3 text-sm"
                      style={{
                        background: 'rgba(0,0,0,.5)',
                        border: '1px solid rgba(168,85,247,.25)',
                        color: '#e9d5ff',
                        cursor: 'pointer',
                      }}
                    >
                      <option value="null">Not Suspended (Active)</option>
                      <option value="24_hours">24 Hours</option>
                      <option value="1_week">1 Week</option>
                      <option value="1_month">1 Month</option>
                      <option value="2_months">2 Months</option>
                      <option value="permanent">Permanent</option>
                    </select>
                  </div>
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setSuspendingServer(null)}
                      className="aw-as-btn px-4 py-2 rounded-xl text-xs font-semibold"
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
                      className="aw-as-btn px-4 py-2 rounded-xl text-xs font-bold text-white"
                      style={{
                        background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                        boxShadow: '0 4px 16px -4px rgba(245,158,11,.6)',
                      }}
                    >
                      Apply
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Delete Modal */}
        <AnimatePresence>
          {deletingServer && (
            <div
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
              style={{
                background: 'rgba(0,0,0,.75)',
                backdropFilter: 'blur(12px)',
              }}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.95, filter: 'blur(6px)' }}
                animate={{ opacity: 1, scale: 1, filter: 'blur(0)' }}
                exit={{ opacity: 0, scale: 0.95, filter: 'blur(6px)' }}
                className="aw-as-modal p-6 max-w-md w-full"
                style={{ borderColor: 'rgba(244,63,94,.4)' }}
              >
                <h2 className="text-lg font-bold mb-2 flex items-center gap-2" style={{ color: '#fda4af' }}>
                  <span
                    className="w-8 h-8 rounded-lg flex items-center justify-center"
                    style={{
                      background: 'rgba(244,63,94,.15)',
                      border: '1px solid rgba(244,63,94,.4)',
                      color: '#f43f5e',
                    }}
                  >
                    <AlertTriangle size={16} />
                  </span>
                  Delete Server?
                </h2>
                <p className="text-sm mb-6 leading-relaxed" style={{ color: 'rgba(253,164,175,.85)' }}>
                  Are you sure you want to permanently delete{" "}
                  <strong style={{ color: '#fda4af' }}>{deletingServer.name}</strong>? This action cannot be undone and will destroy all data.
                </p>
                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => setDeletingServer(null)}
                    className="aw-as-btn px-4 py-2 rounded-xl text-xs font-semibold"
                    style={{
                      background: 'rgba(0,0,0,.4)',
                      border: '1px solid rgba(168,85,247,.2)',
                      color: '#a1a1aa',
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDelete}
                    className="aw-as-btn px-4 py-2 rounded-xl text-xs font-bold text-white"
                    style={{
                      background: 'linear-gradient(135deg, #f43f5e, #be123c)',
                      boxShadow: '0 4px 16px -4px rgba(244,63,94,.6)',
                    }}
                  >
                    Yes, Delete
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}

// ═══════════════════════════════════════════════
// ACTION MENU COMPONENT
// ═══════════════════════════════════════════════
function ActionMenu({
  server,
  setEditingServer,
  setRam,
  setCpu,
  setDisk,
  setSuspendingServer,
  setSuspendDuration,
  setDeletingServer
}: any) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const handleClick = () => setOpen(false);
    if (open) document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, [open]);

  return (
    <div className="relative" onClick={e => e.stopPropagation()}>
      <button
        onClick={() => setOpen(!open)}
        className="aw-as-btn p-2 rounded-xl"
        style={{
          background: 'rgba(0,0,0,.4)',
          border: '1px solid rgba(168,85,247,.25)',
          color: '#c084fc',
        }}
        title="More Actions"
      >
        <MoreVertical className="w-5 h-5" />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="aw-as-ctx-menu absolute right-0 mt-2 w-52 z-40 flex flex-col py-1.5"
          >
            <button
              onClick={() => {
                setEditingServer(server);
                setRam(server.ram.toString());
                setCpu(server.cpu.toString());
                setDisk(server.disk.toString());
                setOpen(false);
              }}
              className="aw-as-btn flex items-center px-3.5 py-2.5 text-xs font-medium text-left"
              style={{ color: '#e9d5ff' }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(168,85,247,.15)';
                e.currentTarget.style.color = '#c084fc';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent';
                e.currentTarget.style.color = '#e9d5ff';
              }}
            >
              <Edit2 className="w-4 h-4 mr-3" style={{ color: '#c084fc' }} />
              Edit Resources
            </button>

            <button
              onClick={() => {
                setSuspendingServer(server);
                setSuspendDuration(server.suspendDuration || "null");
                setOpen(false);
              }}
              className="aw-as-btn flex items-center px-3.5 py-2.5 text-xs font-medium text-left"
              style={{ color: '#fbbf24' }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(245,158,11,.15)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent';
              }}
            >
              <PauseCircle className="w-4 h-4 mr-3" style={{ color: '#fbbf24' }} />
              {server.suspended ? "Manage Suspension" : "Suspend Server"}
            </button>

            <div
              className="my-1 mx-2"
              style={{ height: 1, background: 'rgba(168,85,247,.15)' }}
            />

            <button
              onClick={() => {
                setDeletingServer(server);
                setOpen(false);
              }}
              className="aw-as-btn flex items-center px-3.5 py-2.5 text-xs font-medium text-left"
              style={{ color: '#fda4af' }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(244,63,94,.15)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent';
              }}
            >
              <Trash2 className="w-4 h-4 mr-3" />
              Delete Server
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}