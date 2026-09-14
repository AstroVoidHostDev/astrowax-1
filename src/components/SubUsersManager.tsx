import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Users,
  UserPlus,
  Shield,
  X,
  Save,
  Trash2,
  CheckSquare,
  Square,
  Hexagon,
  Sparkles,
  ShieldCheck,
  Crown,
  Lock
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// ============================================
// AstroWax Panel V1.80 — Sub-Users Manager
// Glass + Purple Theme
// ============================================

interface SubUsersManagerProps {
  serverId: string;
}

const ALL_PERMISSIONS = [
  { id: "start", label: "Start Server", group: "Power" },
  { id: "stop", label: "Stop Server", group: "Power" },
  { id: "restart", label: "Restart Server", group: "Power" },
  { id: "files", label: "File Management", group: "Management" },
  { id: "plugins", label: "Plugins Management", group: "Management" },
  { id: "mods", label: "Mods Management", group: "Management" },
  { id: "settings", label: "Server Settings", group: "Configuration" },
  { id: "properties", label: "Server Properties", group: "Configuration" },
  { id: "backup", label: "Backup Management", group: "Management" }
];

export default function SubUsersManager({ serverId }: SubUsersManagerProps) {
  const [subUsers, setSubUsers] = useState<any[]>([]);
  const [availableUsers, setAvailableUsers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<string>("");
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
  const [editingUser, setEditingUser] = useState<any | null>(null);
  const [deleteUserId, setDeleteUserId] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, [serverId]);

  const fetchData = async () => {
    try {
      const res = await axios.get(`/api/servers/${serverId}/subusers`);
      setSubUsers(res.data.subUsers || []);
      setAvailableUsers(res.data.availableUsers || []);
    } catch (e) {
      console.error("Failed to fetch subusers", e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!selectedUser && !editingUser) return;

    const userId = editingUser ? editingUser.userId : selectedUser;

    try {
      await axios.post(`/api/servers/${serverId}/subusers`, {
        userId,
        permissions: selectedPermissions
      });
      setShowAddModal(false);
      setEditingUser(null);
      setSelectedUser("");
      setSelectedPermissions([]);
      fetchData();
    } catch (e) {
      console.error("Failed to save subuser", e);
    }
  };

  const handleDelete = async (userId: string) => {
    setDeleteUserId(null);
    try {
      await axios.delete(`/api/servers/${serverId}/subusers/${userId}`);
      fetchData();
    } catch (e) {
      console.error("Failed to delete subuser", e);
    }
  };

  const togglePermission = (permId: string) => {
    setSelectedPermissions(prev =>
      prev.includes(permId)
        ? prev.filter(p => p !== permId)
        : [...prev, permId]
    );
  };

  const getUsername = (userId: string) => {
    const u = availableUsers.find(u => u.id === userId);
    return u ? u.username : userId;
  };

  const unassignedUsers = availableUsers.filter(u => !subUsers.some(su => su.userId === u.id));

  return (
    <div className="flex-1 flex flex-col p-4 md:p-8 overflow-y-auto aw-su-scroll relative">
      <style dangerouslySetInnerHTML={{__html: `
        .aw-su-glass {
          background: linear-gradient(135deg, rgba(20,12,35,.7) 0%, rgba(13,8,25,.85) 100%);
          backdrop-filter: blur(16px) saturate(1.4);
          -webkit-backdrop-filter: blur(16px) saturate(1.4);
          border: 1px solid rgba(168,85,247,.2);
          border-radius: 20px;
          position: relative;
          overflow: hidden;
          transition: all .3s cubic-bezier(.16,1,.3,1);
        }
        .aw-su-glass::before {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(168,85,247,.5), rgba(255,255,255,.2), rgba(168,85,247,.5), transparent);
          pointer-events: none;
          z-index: 2;
        }
        .aw-su-glass:hover {
          border-color: rgba(168,85,247,.35);
          box-shadow: 0 0 40px -12px rgba(168,85,247,.25);
        }

        .aw-su-btn {
          transition: all .25s cubic-bezier(.16,1,.3,1);
        }
        .aw-su-btn:hover:not(:disabled) {
          transform: translateY(-1px);
        }
        .aw-su-btn:active:not(:disabled) {
          transform: translateY(0) scale(.97);
        }

        .aw-su-scroll::-webkit-scrollbar { width: 8px; }
        .aw-su-scroll::-webkit-scrollbar-track { background: rgba(0,0,0,.3); }
        .aw-su-scroll::-webkit-scrollbar-thumb {
          background: linear-gradient(180deg, #a855f7, #7e22ce);
          border-radius: 4px;
        }
        .aw-su-scroll::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(180deg, #c084fc, #a855f7);
        }

        .aw-su-select option {
          background: #0d0819;
          color: #e9d5ff;
        }

        @keyframes awSuIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .aw-su-in { animation: awSuIn .4s cubic-bezier(.16,1,.3,1) both; }

        @keyframes awSuModalIn {
          from { opacity: 0; transform: translateY(16px) scale(.96); filter: blur(6px); }
          to { opacity: 1; transform: translateY(0) scale(1); filter: blur(0); }
        }
        .aw-su-modal { animation: awSuModalIn .35s cubic-bezier(.16,1,.3,1) both; }
      `}} />

      {isLoading ? (
        <div className="flex-1 flex items-center justify-center p-8">
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
              Loading sub-users...
            </span>
          </div>
        </div>
      ) : (
        <div className="max-w-4xl w-full mx-auto pb-24">

          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4 aw-su-in">
            <div>
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
                  <Users className="w-5 h-5" style={{ color: '#c084fc' }} />
                </span>
                Sub-Users
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
                Manage users who have access to this server.
              </p>
            </div>

            <button
              onClick={() => {
                setEditingUser(null);
                setSelectedUser(unassignedUsers[0]?.id || "");
                setSelectedPermissions([]);
                setShowAddModal(true);
              }}
              className="aw-su-btn flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-white text-sm shrink-0"
              style={{
                background: 'linear-gradient(135deg, #a855f7, #7e22ce)',
                boxShadow: '0 4px 16px -4px rgba(168,85,247,.6)',
              }}
            >
              <UserPlus size={18} />
              <span>Add User</span>
            </button>
          </div>

          {/* Empty / List */}
          {subUsers.length === 0 ? (
            <div className="aw-su-glass aw-su-in p-8 flex flex-col items-center justify-center text-center">
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
                style={{
                  background: 'rgba(168,85,247,.08)',
                  border: '1px solid rgba(168,85,247,.2)',
                }}
              >
                <Users size={32} style={{ color: 'rgba(192,132,252,.5)' }} />
              </div>
              <h3 className="text-lg font-bold mb-2" style={{ color: '#e9d5ff' }}>
                No Sub-Users
              </h3>
              <p className="max-w-sm mb-6 text-sm" style={{ color: '#a1a1aa' }}>
                You haven't granted access to any other users for this server yet.
              </p>
            </div>
          ) : (
            <div className="grid gap-4">
              {subUsers.map((su, idx) => (
                <div
                  key={su.userId}
                  className="aw-su-glass aw-su-in p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  style={{ animationDelay: `${idx * 0.04}s` }}
                >
                  <div className="flex items-center gap-4 min-w-0">
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
                      style={{
                        background: 'rgba(168,85,247,.12)',
                        border: '1px solid rgba(168,85,247,.3)',
                        boxShadow: '0 0 20px -8px rgba(168,85,247,.5)',
                      }}
                    >
                      <Shield className="w-6 h-6" style={{ color: '#c084fc' }} />
                    </div>
                    <div className="min-w-0">
                      <h4 className="font-bold text-base truncate" style={{ color: '#e9d5ff' }}>
                        {getUsername(su.userId)}
                      </h4>
                      <p className="text-xs mt-0.5 flex items-center gap-1.5" style={{ color: 'rgba(161,161,170,.8)' }}>
                        <Sparkles size={11} style={{ color: '#c084fc' }} />
                        {su.permissions.length} permission{su.permissions.length !== 1 ? "s" : ""} granted
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
                    <button
                      onClick={() => {
                        setEditingUser(su);
                        setSelectedPermissions(su.permissions);
                        setShowAddModal(true);
                      }}
                      className="aw-su-btn flex-1 sm:flex-none px-4 py-2 rounded-xl text-sm font-semibold"
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
                      Edit Permissions
                    </button>

                    {deleteUserId === su.userId ? (
                      <div
                        className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl"
                        style={{
                          background: 'linear-gradient(135deg, rgba(244,63,94,.15), rgba(244,63,94,.05))',
                          border: '1px solid rgba(244,63,94,.4)',
                        }}
                      >
                        <span className="text-[11px] font-semibold" style={{ color: '#fda4af' }}>
                          Remove?
                        </span>
                        <button
                          onClick={() => handleDelete(su.userId)}
                          className="aw-su-btn font-bold px-2 py-0.5 rounded text-[11px] text-white"
                          style={{
                            background: 'linear-gradient(135deg, #f43f5e, #be123c)',
                            boxShadow: '0 2px 8px -2px rgba(244,63,94,.6)',
                          }}
                        >
                          Yes
                        </button>
                        <button
                          onClick={() => setDeleteUserId(null)}
                          className="aw-su-btn px-2 py-0.5 rounded text-[11px] font-medium"
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
                        onClick={() => setDeleteUserId(su.userId)}
                        className="aw-su-btn p-2 rounded-xl shrink-0"
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
                        title="Remove User"
                      >
                        <Trash2 size={18} />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Add/Edit Modal */}
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
              className="relative w-full max-w-lg flex flex-col max-h-[90vh] rounded-2xl overflow-hidden"
              style={{
                background: 'linear-gradient(135deg, rgba(20,12,35,.96), rgba(13,8,25,.98))',
                border: '1px solid rgba(168,85,247,.35)',
                backdropFilter: 'blur(24px) saturate(1.4)',
                boxShadow: '0 30px 80px -20px rgba(0,0,0,.9), 0 0 0 1px rgba(168,85,247,.15), 0 0 40px -12px rgba(168,85,247,.4)',
              }}
            >
              {/* Top highlight */}
              <div
                className="absolute top-0 left-0 right-0 h-px pointer-events-none"
                style={{
                  background: 'linear-gradient(90deg, transparent, rgba(168,85,247,.7), rgba(255,255,255,.3), rgba(168,85,247,.7), transparent)',
                  zIndex: 2,
                }}
              />

              {/* Header */}
              <div
                className="flex items-center justify-between p-5 shrink-0"
                style={{
                  borderBottom: '1px solid rgba(168,85,247,.18)',
                  background: 'rgba(0,0,0,.3)',
                }}
              >
                <h3 className="text-base font-bold flex items-center gap-2" style={{ color: '#e9d5ff' }}>
                  {editingUser ? (
                    <>
                      <ShieldCheck className="w-5 h-5" style={{ color: '#c084fc' }} />
                      Edit Permissions for <span style={{ color: '#c084fc' }}>{getUsername(editingUser.userId)}</span>
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-5 h-5" style={{ color: '#c084fc' }} />
                      Add Sub-User
                    </>
                  )}
                </h3>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="aw-su-btn p-1.5 rounded-lg"
                  style={{
                    background: 'rgba(168,85,247,.08)',
                    border: '1px solid rgba(168,85,247,.2)',
                    color: '#a1a1aa',
                  }}
                >
                  <X size={18} />
                </button>
              </div>

              {/* Body */}
              <div className="p-5 overflow-y-auto aw-su-scroll flex-1">

                {!editingUser && (
                  <div className="mb-6">
                    <label
                      className="block text-[11px] font-bold uppercase tracking-widest mb-2"
                      style={{ color: '#c084fc' }}
                    >
                      Select User
                    </label>
                    <select
                      value={selectedUser}
                      onChange={(e) => setSelectedUser(e.target.value)}
                      className="aw-su-select w-full rounded-xl px-4 py-3 text-sm"
                      style={{
                        background: 'rgba(0,0,0,.5)',
                        border: '1px solid rgba(168,85,247,.25)',
                        color: '#e9d5ff',
                        cursor: 'pointer',
                      }}
                    >
                      <option value="" disabled>Choose a user...</option>
                      {unassignedUsers.map(u => (
                        <option key={u.id} value={u.id}>{u.username}</option>
                      ))}
                    </select>
                    {unassignedUsers.length === 0 && (
                      <p className="text-xs mt-2 flex items-center gap-1.5" style={{ color: '#fda4af' }}>
                        <Lock size={11} />
                        No available users to add.
                      </p>
                    )}
                  </div>
                )}

                <div>
                  <div className="flex items-center justify-between mb-3">
                    <label
                      className="block text-[11px] font-bold uppercase tracking-widest"
                      style={{ color: '#c084fc' }}
                    >
                      Permissions
                    </label>
                    <button
                      onClick={() => setSelectedPermissions(ALL_PERMISSIONS.map(p => p.id))}
                      className="aw-su-btn text-xs font-semibold flex items-center gap-1 px-2.5 py-1 rounded-md"
                      style={{
                        background: 'rgba(168,85,247,.1)',
                        border: '1px solid rgba(168,85,247,.3)',
                        color: '#c084fc',
                      }}
                    >
                      <Sparkles size={11} />
                      Select All
                    </button>
                  </div>

                  <div className="space-y-2">
                    {ALL_PERMISSIONS.map(perm => {
                      const isSelected = selectedPermissions.includes(perm.id);
                      return (
                        <div
                          key={perm.id}
                          onClick={() => togglePermission(perm.id)}
                          className="aw-su-btn flex items-center justify-between p-3 rounded-xl cursor-pointer"
                          style={{
                            background: isSelected
                              ? 'linear-gradient(135deg, rgba(168,85,247,.15), rgba(168,85,247,.06))'
                              : 'rgba(0,0,0,.35)',
                            border: isSelected
                              ? '1px solid rgba(168,85,247,.5)'
                              : '1px solid rgba(168,85,247,.15)',
                            boxShadow: isSelected
                              ? '0 0 24px -8px rgba(168,85,247,.4)'
                              : 'none',
                          }}
                        >
                          <div>
                            <div
                              className="font-semibold text-sm"
                              style={{ color: isSelected ? '#c084fc' : '#d4d4d8' }}
                            >
                              {perm.label}
                            </div>
                            <div
                              className="text-[10px] uppercase tracking-widest mt-0.5 font-mono"
                              style={{ color: isSelected ? 'rgba(192,132,252,.7)' : 'rgba(161,161,170,.6)' }}
                            >
                              {perm.group}
                            </div>
                          </div>
                          {isSelected ? (
                            <CheckSquare size={20} style={{ color: '#c084fc' }} />
                          ) : (
                            <Square size={20} style={{ color: 'rgba(161,161,170,.5)' }} />
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div
                className="p-5 flex justify-end gap-3 shrink-0"
                style={{
                  borderTop: '1px solid rgba(168,85,247,.15)',
                  background: 'rgba(0,0,0,.35)',
                }}
              >
                <button
                  onClick={() => setShowAddModal(false)}
                  className="aw-su-btn px-4 py-2 rounded-xl font-semibold text-sm"
                  style={{
                    background: 'rgba(0,0,0,.4)',
                    border: '1px solid rgba(168,85,247,.25)',
                    color: '#a1a1aa',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = '#c084fc';
                    e.currentTarget.style.borderColor = 'rgba(168,85,247,.5)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = '#a1a1aa';
                    e.currentTarget.style.borderColor = 'rgba(168,85,247,.25)';
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={(!editingUser && !selectedUser) || selectedPermissions.length === 0}
                  className="aw-su-btn px-5 py-2 rounded-xl font-semibold flex items-center gap-2 text-white text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{
                    background: 'linear-gradient(135deg, #a855f7, #7e22ce)',
                    boxShadow: '0 4px 16px -4px rgba(168,85,247,.6)',
                  }}
                >
                  <Save size={16} />
                  <span>Save</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}