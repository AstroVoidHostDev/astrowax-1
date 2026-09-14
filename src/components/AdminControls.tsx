import React from 'react';
import {
  UserPlus,
  Shield,
  Trash2,
  Key,
  Users,
  Crown,
  UserCog,
  User as UserIcon,
  Hexagon,
  Sparkles,
  Check,
  X,
  KeyRound
} from 'lucide-react';

// ============================================
// AstroWax Panel V1.80 — Admin Controls (User Management)
// Glass + Purple Theme
// ============================================

interface AdminControlsProps {
  user: any;
  users: any[];
  username: string;
  setUsername: (v: string) => void;
  password: string;
  setPassword: (v: string) => void;
  role: string;
  setRole: (v: string) => void;
  isCreatingUser: boolean;
  createUser: (e: React.FormEvent) => void;
  editingUserId: string | null;
  setEditingUserId: (id: string | null) => void;
  adminUserNewPassword: string;
  setAdminUserNewPassword: (v: string) => void;
  changeUserPassword: (id: string) => void;
  deleteUser: (id: string) => void;
  changeUserRole: (id: string, newRole: string) => void;
}

export default function AdminControls({
  user,
  users,
  username,
  setUsername,
  password,
  setPassword,
  role,
  setRole,
  isCreatingUser,
  createUser,
  editingUserId,
  setEditingUserId,
  adminUserNewPassword,
  setAdminUserNewPassword,
  changeUserPassword,
  deleteUser,
  changeUserRole
}: AdminControlsProps) {
  const [confirmDeleteId, setConfirmDeleteId] = React.useState<string | null>(null);

  const getRoleIcon = (roleName: string) => {
    if (roleName === 'owner') return <Crown size={13} style={{ color: '#fbbf24' }} />;
    if (roleName === 'admin') return <Shield size={13} style={{ color: '#c084fc' }} />;
    return <UserIcon size={13} style={{ color: '#a1a1aa' }} />;
  };

  const getRoleBadgeStyle = (roleName: string) => {
    if (roleName === 'owner') {
      return {
        background: 'rgba(245,158,11,.15)',
        color: '#fbbf24',
        border: '1px solid rgba(245,158,11,.4)',
      };
    }
    if (roleName === 'admin') {
      return {
        background: 'rgba(168,85,247,.15)',
        color: '#c084fc',
        border: '1px solid rgba(168,85,247,.4)',
      };
    }
    return {
      background: 'rgba(0,0,0,.4)',
      color: '#a1a1aa',
      border: '1px solid rgba(168,85,247,.2)',
    };
  };

  return (
    <>
      <style dangerouslySetInnerHTML={{__html: `
        .aw-ac-glass {
          background: linear-gradient(135deg, rgba(20,12,35,.7) 0%, rgba(13,8,25,.85) 100%);
          backdrop-filter: blur(16px) saturate(1.4);
          -webkit-backdrop-filter: blur(16px) saturate(1.4);
          border: 1px solid rgba(168,85,247,.2);
          border-radius: 20px;
          position: relative;
          overflow: hidden;
        }
        .aw-ac-glass::before {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(168,85,247,.5), rgba(255,255,255,.2), rgba(168,85,247,.5), transparent);
          pointer-events: none;
          z-index: 2;
        }

        .aw-ac-row {
          transition: all .25s cubic-bezier(.16,1,.3,1);
        }
        .aw-ac-row:hover {
          background: rgba(168,85,247,.06);
        }

        .aw-ac-btn {
          transition: all .25s cubic-bezier(.16,1,.3,1);
        }
        .aw-ac-btn:hover:not(:disabled) {
          transform: translateY(-1px);
        }
        .aw-ac-btn:active:not(:disabled) {
          transform: translateY(0) scale(.97);
        }

        .aw-ac-input {
          transition: all .25s cubic-bezier(.16,1,.3,1);
        }
        .aw-ac-input:focus {
          outline: none;
          border-color: rgba(168,85,247,.6) !important;
          box-shadow: 0 0 0 3px rgba(168,85,247,.1), 0 0 20px -4px rgba(168,85,247,.4) !important;
        }
        .aw-ac-input::placeholder { color: rgba(161,161,170,.5); }

        .aw-ac-select option {
          background: #0d0819;
          color: #e9d5ff;
        }

        @keyframes awAcIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .aw-ac-in { animation: awAcIn .4s cubic-bezier(.16,1,.3,1) both; }
      `}} />

      <div className="aw-ac-glass p-6 md:p-8 aw-ac-in relative">

        {/* Header */}
        <h2
          className="text-xl font-black tracking-tight mb-6 flex items-center gap-2.5 relative z-10"
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
            <UserPlus className="w-5 h-5" style={{ color: '#c084fc' }} />
          </span>
          User Management
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

        <div className="flex flex-col gap-8 relative z-10">

          {/* ============================================ */}
          {/* Create User Form */}
          {/* ============================================ */}
          <div>
            <h3
              className="text-xs font-bold uppercase tracking-widest mb-4 pb-2 flex items-center gap-2"
              style={{
                color: '#c084fc',
                borderBottom: '1px solid rgba(168,85,247,.15)',
              }}
            >
              <Sparkles size={12} />
              Create New User
            </h3>

            <form onSubmit={createUser} className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <input
                required
                value={username}
                onChange={(e: any) => setUsername(e.target.value)}
                type="text"
                placeholder="Username"
                className="aw-ac-input rounded-xl px-4 py-2.5 text-sm"
                style={{
                  background: 'rgba(0,0,0,.5)',
                  border: '1px solid rgba(168,85,247,.25)',
                  color: '#e9d5ff',
                  caretColor: '#c084fc',
                }}
              />
              <input
                required
                value={password}
                onChange={(e: any) => setPassword(e.target.value)}
                type="password"
                placeholder="Password"
                className="aw-ac-input rounded-xl px-4 py-2.5 text-sm"
                style={{
                  background: 'rgba(0,0,0,.5)',
                  border: '1px solid rgba(168,85,247,.25)',
                  color: '#e9d5ff',
                  caretColor: '#c084fc',
                }}
              />
              <select
                value={role}
                onChange={(e: any) => setRole(e.target.value)}
                className="aw-ac-input aw-ac-select rounded-xl px-4 py-2.5 text-sm"
                style={{
                  background: 'rgba(0,0,0,.5)',
                  border: '1px solid rgba(168,85,247,.25)',
                  color: '#e9d5ff',
                  cursor: 'pointer',
                }}
              >
                <option value="user">User</option>
                {user?.role === 'owner' && <option value="admin">Admin</option>}
              </select>
              <button
                disabled={isCreatingUser}
                type="submit"
                className="aw-ac-btn rounded-xl px-6 py-2.5 font-semibold text-white text-sm flex items-center justify-center gap-2 whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  background: 'linear-gradient(135deg, #a855f7, #7e22ce)',
                  boxShadow: '0 4px 16px -4px rgba(168,85,247,.6)',
                }}
              >
                {isCreatingUser ? (
                  <>
                    <div
                      className="w-4 h-4 rounded-full border-2 animate-spin"
                      style={{ borderColor: 'rgba(255,255,255,.5)', borderTopColor: '#fff' }}
                    />
                    Creating...
                  </>
                ) : (
                  <>
                    <UserPlus size={15} />
                    Create User
                  </>
                )}
              </button>
            </form>
          </div>

          {/* ============================================ */}
          {/* User List */}
          {/* ============================================ */}
          <div>
            <h3
              className="text-xs font-bold uppercase tracking-widest mb-4 pb-2 flex items-center gap-2"
              style={{
                color: '#c084fc',
                borderBottom: '1px solid rgba(168,85,247,.15)',
              }}
            >
              <Users size={12} />
              Existing Users
              {users.length > 0 && (
                <span
                  className="px-2 py-0.5 rounded-md font-mono text-[10px]"
                  style={{
                    background: 'rgba(168,85,247,.15)',
                    border: '1px solid rgba(168,85,247,.3)',
                    color: '#c084fc',
                  }}
                >
                  {users.length}
                </span>
              )}
            </h3>

            <div
              className="rounded-xl overflow-x-auto"
              style={{
                background: 'rgba(0,0,0,.3)',
                border: '1px solid rgba(168,85,247,.15)',
              }}
            >
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead
                  style={{
                    background: 'rgba(0,0,0,.4)',
                    borderBottom: '1px solid rgba(168,85,247,.15)',
                  }}
                >
                  <tr>
                    <th
                      className="px-4 py-3 font-bold text-[10px] uppercase tracking-widest"
                      style={{ color: '#c084fc' }}
                    >
                      Username
                    </th>
                    <th
                      className="px-4 py-3 font-bold text-[10px] uppercase tracking-widest"
                      style={{ color: '#c084fc' }}
                    >
                      Role
                    </th>
                    <th
                      className="px-4 py-3 font-bold text-[10px] uppercase tracking-widest text-right"
                      style={{ color: '#c084fc' }}
                    >
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u: any, idx) => (
                    <tr
                      key={u.id}
                      className="aw-ac-row"
                      style={{
                        borderBottom: idx < users.length - 1 ? '1px solid rgba(168,85,247,.1)' : 'none',
                      }}
                    >
                      <td className="px-4 py-3 font-semibold" style={{ color: '#e9d5ff' }}>
                        <div className="flex items-center gap-2">
                          <div
                            className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                            style={{
                              background: 'rgba(168,85,247,.1)',
                              border: '1px solid rgba(168,85,247,.25)',
                            }}
                          >
                            <UserIcon size={13} style={{ color: '#c084fc' }} />
                          </div>
                          <span className="truncate">{u.username}</span>
                          {getRoleIcon(u.role)}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-md inline-flex items-center gap-1"
                          style={getRoleBadgeStyle(u.role)}
                        >
                          {u.role === 'owner' && <Crown size={9} />}
                          {u.role === 'admin' && <Shield size={9} />}
                          {u.role === 'user' && <UserIcon size={9} />}
                          {u.role}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        {editingUserId === u.id ? (
                          /* Password Change Inline */
                          <div className="flex items-center justify-end gap-2">
                            <input
                              type="password"
                              placeholder="New Pass"
                              value={adminUserNewPassword}
                              onChange={(e: any) => setAdminUserNewPassword(e.target.value)}
                              className="aw-ac-input rounded-lg px-2 py-1 text-xs w-32"
                              style={{
                                background: 'rgba(0,0,0,.5)',
                                border: '1px solid rgba(168,85,247,.3)',
                                color: '#e9d5ff',
                                caretColor: '#c084fc',
                              }}
                            />
                            <button
                              onClick={() => changeUserPassword(u.id)}
                              className="aw-ac-btn text-xs px-2.5 py-1.5 rounded-lg font-semibold text-white flex items-center gap-1"
                              style={{
                                background: 'linear-gradient(135deg, #a855f7, #7e22ce)',
                                boxShadow: '0 2px 8px -2px rgba(168,85,247,.5)',
                              }}
                            >
                              <Check size={11} />
                              Save
                            </button>
                            <button
                              onClick={() => setEditingUserId(null)}
                              className="aw-ac-btn text-xs px-2.5 py-1.5 rounded-lg font-medium flex items-center gap-1"
                              style={{
                                background: 'rgba(0,0,0,.4)',
                                border: '1px solid rgba(168,85,247,.25)',
                                color: '#a1a1aa',
                              }}
                            >
                              <X size={11} />
                              Cancel
                            </button>
                          </div>
                        ) : confirmDeleteId === u.id ? (
                          /* Delete Confirm Inline */
                          <div className="flex items-center justify-end gap-2">
                            <span className="text-[11px] font-semibold mr-1" style={{ color: '#fda4af' }}>
                              Delete user?
                            </span>
                            <button
                              onClick={() => {
                                deleteUser(u.id);
                                setConfirmDeleteId(null);
                              }}
                              className="aw-ac-btn text-xs px-2.5 py-1 rounded-lg font-bold text-white flex items-center gap-1"
                              style={{
                                background: 'linear-gradient(135deg, #f43f5e, #be123c)',
                                boxShadow: '0 2px 8px -2px rgba(244,63,94,.6)',
                              }}
                            >
                              <Check size={11} />
                              Yes
                            </button>
                            <button
                              onClick={() => setConfirmDeleteId(null)}
                              className="aw-ac-btn text-xs px-2.5 py-1 rounded-lg font-medium flex items-center gap-1"
                              style={{
                                background: 'rgba(0,0,0,.4)',
                                border: '1px solid rgba(168,85,247,.25)',
                                color: '#a1a1aa',
                              }}
                            >
                              <X size={11} />
                              No
                            </button>
                          </div>
                        ) : (
                          /* Normal Actions */
                          <div className="flex items-center justify-end gap-2">
                            {user?.role === 'owner' && u.role !== 'owner' && u.id !== "temp-admin" && (
                              <select
                                value={u.role}
                                onChange={(e) => changeUserRole(u.id, e.target.value)}
                                className="aw-ac-input aw-ac-select rounded-lg px-2 py-1 text-xs mr-1"
                                style={{
                                  background: 'rgba(0,0,0,.5)',
                                  border: '1px solid rgba(168,85,247,.25)',
                                  color: '#e9d5ff',
                                  cursor: 'pointer',
                                }}
                              >
                                <option value="user">User</option>
                                <option value="admin">Admin</option>
                              </select>
                            )}

                            {u.role !== 'owner' && (user?.role === 'owner' || u.role !== 'admin') && (
                              <button
                                onClick={() => {
                                  setEditingUserId(u.id);
                                  setConfirmDeleteId(null);
                                }}
                                className="aw-ac-btn p-1.5 rounded-lg"
                                style={{
                                  background: 'rgba(168,85,247,.1)',
                                  border: '1px solid rgba(168,85,247,.3)',
                                  color: '#c084fc',
                                }}
                                onMouseEnter={(e) => {
                                  e.currentTarget.style.background = 'rgba(168,85,247,.2)';
                                  e.currentTarget.style.boxShadow = '0 0 16px -4px rgba(168,85,247,.5)';
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.style.background = 'rgba(168,85,247,.1)';
                                  e.currentTarget.style.boxShadow = 'none';
                                }}
                                title="Change Password"
                              >
                                <KeyRound size={15} />
                              </button>
                            )}

                            {u.role !== 'owner' && (user?.role === 'owner' || u.role !== 'admin') && u.id !== "temp-admin" && (
                              <button
                                onClick={() => {
                                  setConfirmDeleteId(u.id);
                                  setEditingUserId(null);
                                }}
                                className="aw-ac-btn p-1.5 rounded-lg"
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
                                title="Delete User"
                              >
                                <Trash2 size={15} />
                              </button>
                            )}
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                  {users.length === 0 && (
                    <tr>
                      <td colSpan={3} className="px-4 py-8 text-center">
                        <div className="flex flex-col items-center gap-2">
                          <div
                            className="w-12 h-12 rounded-xl flex items-center justify-center"
                            style={{
                              background: 'rgba(168,85,247,.08)',
                              border: '1px solid rgba(168,85,247,.2)',
                            }}
                          >
                            <Users className="w-6 h-6" style={{ color: 'rgba(192,132,252,.5)' }} />
                          </div>
                          <p className="text-sm font-semibold" style={{ color: '#e9d5ff' }}>
                            No users found
                          </p>
                          <p className="text-xs" style={{ color: '#a1a1aa' }}>
                            Create a user above to get started.
                          </p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}