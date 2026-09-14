import React, { useEffect, useState } from "react";
import { Users, Shield, Gavel, UserMinus, ShieldAlert, Check, RefreshCw, Plus, UserCheck, Hexagon, Activity } from "lucide-react";
import { io, Socket } from "socket.io-client";
import { useAuth } from "../context/AuthContext";
import axios from "axios";

// ============================================
// AstroWax Panel V1.80 — Player Manager
// Glass + Purple Theme
// ============================================

interface Player {
  name: string;
  joinedAt?: string;
  isOp?: boolean;
}

export default function PlayerManager({ serverId, players: propPlayers }: { serverId: string; players?: Player[] }) {
  const [players, setPlayers] = useState<Player[]>(propPlayers || []);
  const [loadingAction, setLoadingAction] = useState<{ player: string; action: string } | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [customPlayerInput, setCustomPlayerInput] = useState("");
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const { token } = useAuth();

  useEffect(() => {
    if (!token || !serverId) return;

    const socket: Socket = io({
      auth: { token },
      reconnectionAttempts: 5,
    });

    socket.on("connect", () => {
      socket.emit("joinServer", serverId);
      axios.post(`/api/servers/${serverId}/command`, { command: "list" }).catch(() => {});
    });

    socket.on("log", (data: string) => {
      if (typeof data !== "string") return;
      const clean = data.replace(/\x1B(?:[@-Z\\-_]|\[[0-?]*[ -/]*[@-~])/g, "");

      const joinMatch = clean.match(/:\s+([a-zA-Z0-9_]{3,16})\s+joined the game/i);
      if (joinMatch) {
        setPlayers((prev) => {
          if (!prev.some((p) => p.name === joinMatch[1])) {
            return [...prev, { name: joinMatch[1], joinedAt: new Date().toLocaleTimeString() }];
          }
          return prev;
        });
      }

      const leaveMatch = clean.match(/:\s+([a-zA-Z0-9_]{3,16})\s+left the game/i);
      if (leaveMatch) {
        setPlayers((prev) => prev.filter((p) => p.name !== leaveMatch[1]));
      }

      const listMatch = clean.match(/players online:\s*(.*)/i);
      if (listMatch) {
        const names = listMatch[1].trim();
        if (names) {
          const parsed = names
            .split(",")
            .map((n) => n.trim())
            .filter(Boolean)
            .map((name) => ({ name }));
          setPlayers(parsed);
        } else {
          setPlayers([]);
        }
      }
    });

    return () => {
      socket.emit("leaveServer", serverId);
      socket.disconnect();
    };
  }, [serverId, token]);

  const handleAction = async (player: string, action: string, command: string) => {
    try {
      setLoadingAction({ player, action });
      await axios.post(`/api/servers/${serverId}/command`, { command });
      setActionSuccess(`Executed ${action} on ${player}`);
      setTimeout(() => setActionSuccess(null), 2500);
    } catch (e) {
      console.error(e);
    } finally {
      setTimeout(() => setLoadingAction(null), 1000);
    }
  };

  const handleRefresh = async () => {
    try {
      setIsRefreshing(true);
      await axios.post(`/api/servers/${serverId}/command`, { command: "list" });
    } catch (e) {
      console.error(e);
    } finally {
      setTimeout(() => setIsRefreshing(false), 500);
    }
  };

  const handleCustomAction = async (actionType: string) => {
    const p = customPlayerInput.trim();
    if (!p) return;
    let cmd = "";
    if (actionType === "op") cmd = `op ${p}`;
    else if (actionType === "deop") cmd = `deop ${p}`;
    else if (actionType === "kick") cmd = `kick ${p} Kicked by admin.`;
    else if (actionType === "ban") cmd = `ban ${p} Banned by admin.`;
    else if (actionType === "whitelist") cmd = `whitelist add ${p}`;

    if (cmd) {
      await handleAction(p, actionType, cmd);
      setCustomPlayerInput("");
    }
  };

  return (
    <div className="p-4 md:p-6 w-full max-w-5xl mx-auto flex flex-col gap-6 font-sans relative">
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes awFadeIn {
          from { opacity: 0; transform: translateY(-6px); filter: blur(4px); }
          to { opacity: 1; transform: translateY(0); filter: blur(0); }
        }
        @keyframes awPlayerIn {
          from { opacity: 0; transform: translateY(10px) scale(.98); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        .aw-fade-in { animation: awFadeIn .3s cubic-bezier(.16,1,.3,1) both; }
        .aw-player-in { animation: awPlayerIn .4s cubic-bezier(.16,1,.3,1) both; }
        
        .aw-glass-card {
          background: linear-gradient(135deg, rgba(20,12,35,.55) 0%, rgba(13,8,25,.7) 100%);
          backdrop-filter: blur(16px) saturate(1.4);
          -webkit-backdrop-filter: blur(16px) saturate(1.4);
          border: 1px solid rgba(168,85,247,.2);
          border-radius: 16px;
          position: relative;
          overflow: hidden;
          box-shadow: 0 20px 60px -30px rgba(0,0,0,.5), inset 0 1px 0 rgba(255,255,255,.05);
        }
        .aw-glass-card::before {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(168,85,247,.5), rgba(255,255,255,.2), rgba(168,85,247,.5), transparent);
          pointer-events: none;
        }
        
        .aw-player-card {
          background: linear-gradient(135deg, rgba(20,12,35,.6) 0%, rgba(13,8,25,.75) 100%);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border: 1px solid rgba(168,85,247,.15);
          transition: all .3s cubic-bezier(.16,1,.3,1);
          position: relative;
          overflow: hidden;
        }
        .aw-player-card:hover {
          border-color: rgba(168,85,247,.45);
          transform: translateY(-2px);
          box-shadow: 0 12px 32px -12px rgba(168,85,247,.35);
        }
        .aw-player-card::after {
          content: '';
          position: absolute;
          top: 0; left: -100%;
          width: 100%; height: 100%;
          background: linear-gradient(90deg, transparent, rgba(168,85,247,.06), transparent);
          transition: left .7s ease;
          pointer-events: none;
        }
        .aw-player-card:hover::after { left: 100%; }
        
        .aw-action-btn {
          transition: all .2s cubic-bezier(.16,1,.3,1);
        }
        .aw-action-btn:hover:not(:disabled) {
          transform: translateY(-1px);
        }
        .aw-action-btn:active:not(:disabled) {
          transform: translateY(0) scale(.96);
        }
      `}} />

      {/* HEADER CARD */}
      <div className="aw-glass-card p-5 md:p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 aw-fade-in">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div 
              className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{
                background: 'linear-gradient(135deg, rgba(168,85,247,.2), rgba(126,34,206,.1))',
                border: '1px solid rgba(168,85,247,.4)',
                color: '#c084fc',
                boxShadow: '0 0 20px -4px rgba(168,85,247,.4)',
              }}
            >
              <Users className="w-5 h-5" />
            </div>
            <h2 className="text-lg md:text-xl font-bold text-white tracking-wide font-mono">
              Player Management
            </h2>
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
          </div>
          <p className="text-xs text-zinc-500">
            Monitor connected players and execute administrative actions like OP, Kick, Ban, and Whitelist.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span 
            className="px-3 py-1 rounded-full text-xs font-mono font-semibold flex items-center gap-1.5"
            style={{
              background: 'rgba(168,85,247,.12)',
              color: '#c084fc',
              border: '1px solid rgba(168,85,247,.35)',
              boxShadow: players.length > 0 ? '0 0 12px -2px rgba(168,85,247,.4)' : 'none',
            }}
          >
            <Activity size={11} />
            {players.length} Online
          </span>
          <button
            onClick={handleRefresh}
            className="px-3 py-1.5 rounded-xl text-zinc-300 text-xs font-mono flex items-center gap-1.5 aw-action-btn"
            style={{
              background: 'rgba(20,12,35,.5)',
              border: '1px solid rgba(168,85,247,.25)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(168,85,247,.15)';
              e.currentTarget.style.borderColor = 'rgba(168,85,247,.5)';
              e.currentTarget.style.color = '#c084fc';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(20,12,35,.5)';
              e.currentTarget.style.borderColor = 'rgba(168,85,247,.25)';
              e.currentTarget.style.color = '';
            }}
            title="Refresh Player List"
          >
            <RefreshCw size={13} className={isRefreshing ? "animate-spin" : ""} style={{ color: isRefreshing ? '#c084fc' : 'inherit' }} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {actionSuccess && (
        <div 
          className="px-4 py-2.5 rounded-xl text-xs font-mono flex items-center gap-2 aw-fade-in"
          style={{
            background: 'linear-gradient(135deg, rgba(16,185,129,.15), rgba(16,185,129,.05))',
            border: '1px solid rgba(16,185,129,.4)',
            color: '#6ee7b7',
            boxShadow: '0 0 20px -4px rgba(16,185,129,.4)',
          }}
        >
          <Check className="w-4 h-4" />
          <span>{actionSuccess}</span>
        </div>
      )}

      {/* QUICK PLAYER ACTION DOCK */}
      <div className="aw-glass-card p-4">
        <h3 className="text-xs font-mono font-semibold text-purple-300/80 uppercase tracking-wider mb-3 flex items-center gap-2">
          <span className="w-3 h-px bg-purple-500/50" />
          Direct Player Command
        </h3>
        <div className="flex flex-col sm:flex-row gap-2">
          <input
            type="text"
            value={customPlayerInput}
            onChange={(e) => setCustomPlayerInput(e.target.value)}
            placeholder="Enter player username..."
            className="flex-1 rounded-xl px-3.5 py-2 text-xs font-mono text-white placeholder:text-zinc-600 focus:outline-none transition-all"
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
          <div className="flex items-center gap-1.5 flex-wrap">
            <button
              onClick={() => handleCustomAction("op")}
              disabled={!customPlayerInput.trim()}
              className="px-3 py-2 rounded-xl text-xs font-mono font-semibold aw-action-btn flex items-center gap-1 disabled:opacity-40 disabled:cursor-not-allowed"
              style={{
                background: 'rgba(168,85,247,.15)',
                border: '1px solid rgba(168,85,247,.35)',
                color: '#c084fc',
              }}
            >
              <Shield size={12} /> OP
            </button>
            <button
              onClick={() => handleCustomAction("deop")}
              disabled={!customPlayerInput.trim()}
              className="px-3 py-2 rounded-xl text-xs font-mono font-semibold aw-action-btn flex items-center gap-1 disabled:opacity-40 disabled:cursor-not-allowed"
              style={{
                background: 'rgba(113,113,122,.15)',
                border: '1px solid rgba(113,113,122,.3)',
                color: '#d4d4d8',
              }}
            >
              De-OP
            </button>
            <button
              onClick={() => handleCustomAction("kick")}
              disabled={!customPlayerInput.trim()}
              className="px-3 py-2 rounded-xl text-xs font-mono font-semibold aw-action-btn flex items-center gap-1 disabled:opacity-40 disabled:cursor-not-allowed"
              style={{
                background: 'rgba(245,158,11,.15)',
                border: '1px solid rgba(245,158,11,.35)',
                color: '#fcd34d',
              }}
            >
              <UserMinus size={12} /> Kick
            </button>
            <button
              onClick={() => handleCustomAction("ban")}
              disabled={!customPlayerInput.trim()}
              className="px-3 py-2 rounded-xl text-xs font-mono font-semibold aw-action-btn flex items-center gap-1 disabled:opacity-40 disabled:cursor-not-allowed"
              style={{
                background: 'rgba(244,63,94,.15)',
                border: '1px solid rgba(244,63,94,.35)',
                color: '#fda4af',
              }}
            >
              <Gavel size={12} /> Ban
            </button>
            <button
              onClick={() => handleCustomAction("whitelist")}
              disabled={!customPlayerInput.trim()}
              className="px-3 py-2 rounded-xl text-xs font-mono font-semibold aw-action-btn flex items-center gap-1 disabled:opacity-40 disabled:cursor-not-allowed"
              style={{
                background: 'rgba(16,185,129,.15)',
                border: '1px solid rgba(16,185,129,.35)',
                color: '#6ee7b7',
              }}
            >
              <UserCheck size={12} /> Whitelist
            </button>
          </div>
        </div>
      </div>

      {/* CONNECTED PLAYERS LIST */}
      <div className="aw-glass-card p-5">
        <h3 className="text-xs font-mono font-semibold text-purple-300/80 uppercase tracking-wider mb-4 flex items-center gap-2">
          <span className="w-3 h-px bg-purple-500/50" />
          Online Players
        </h3>

        {players.length === 0 ? (
          <div 
            className="p-12 text-center flex flex-col items-center justify-center rounded-xl"
            style={{
              background: 'rgba(0,0,0,.25)',
              border: '1px dashed rgba(168,85,247,.25)',
            }}
          >
            <div 
              className="w-14 h-14 mb-3 rounded-2xl flex items-center justify-center"
              style={{
                background: 'linear-gradient(135deg, rgba(168,85,247,.15), rgba(126,34,206,.05))',
                border: '1px solid rgba(168,85,247,.3)',
              }}
            >
              <Users className="w-6 h-6 text-purple-400/60" />
            </div>
            <p className="font-mono text-sm font-semibold text-zinc-400">No players currently connected</p>
            <p className="text-xs text-zinc-600 mt-1 max-w-sm">
              Players currently in the game will appear here with instant moderation controls.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {players.map((player, idx) => (
              <div
                key={player.name}
                className="aw-player-card rounded-xl p-3.5 flex flex-col gap-3 aw-player-in"
                style={{ animationDelay: `${idx * 0.04}s` }}
              >
                <div className="flex items-center gap-3">
                  <div className="relative shrink-0">
                    <img
                      src={`https://minotar.net/avatar/${player.name}/40.png`}
                      alt={player.name}
                      className="w-10 h-10 rounded-lg border border-purple-500/30 shadow-sm"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src =
                          "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAAAAABW71eEAAAARElEQVR42mP8/58BDBjhGqgEho+B4aNg+BgYPgYqMECnEQ9s2IDiH2w4j6QY9EEDX8n20AdVDPqggS/4+tEHDXzB1w8AYU7y34W8vU0AAAAASUVORK5CYII=";
                      }}
                    />
                    <div 
                      className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2"
                      style={{
                        background: '#10b981',
                        borderColor: '#0a0612',
                        boxShadow: '0 0 8px rgba(16,185,129,.8)',
                      }}
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="font-mono text-sm font-bold text-white truncate">{player.name}</h4>
                    <span className="text-[10px] font-mono text-zinc-500 flex items-center gap-1">
                      <Activity size={9} className="text-emerald-400" />
                      {player.joinedAt ? `Connected at ${player.joinedAt}` : "Active Session"}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-4 gap-1.5 pt-2" style={{ borderTop: '1px solid rgba(168,85,247,.12)' }}>
                  <button
                    onClick={() => handleAction(player.name, "op", `op ${player.name}`)}
                    className="px-2 py-1.5 rounded-lg text-[10px] font-mono font-bold uppercase tracking-wider flex justify-center items-center gap-1 aw-action-btn disabled:opacity-40"
                    style={{
                      background: 'rgba(168,85,247,.12)',
                      border: '1px solid rgba(168,85,247,.3)',
                      color: '#c084fc',
                    }}
                    title="Make OP"
                  >
                    {loadingAction?.player === player.name && loadingAction?.action === "op" ? (
                      <Check size={12} />
                    ) : (
                      <Shield size={12} />
                    )}
                    OP
                  </button>

                  <button
                    onClick={() => handleAction(player.name, "kick", `kick ${player.name} Kicked by admin.`)}
                    className="px-2 py-1.5 rounded-lg text-[10px] font-mono font-bold uppercase tracking-wider flex justify-center items-center gap-1 aw-action-btn disabled:opacity-40"
                    style={{
                      background: 'rgba(245,158,11,.12)',
                      border: '1px solid rgba(245,158,11,.3)',
                      color: '#fcd34d',
                    }}
                    title="Kick Player"
                  >
                    {loadingAction?.player === player.name && loadingAction?.action === "kick" ? (
                      <Check size={12} />
                    ) : (
                      <UserMinus size={12} />
                    )}
                    Kick
                  </button>

                  <button
                    onClick={() => handleAction(player.name, "ban", `ban ${player.name} Banned by admin.`)}
                    className="px-2 py-1.5 rounded-lg text-[10px] font-mono font-bold uppercase tracking-wider flex justify-center items-center gap-1 aw-action-btn disabled:opacity-40"
                    style={{
                      background: 'rgba(244,63,94,.12)',
                      border: '1px solid rgba(244,63,94,.3)',
                      color: '#fda4af',
                    }}
                    title="Ban Player"
                  >
                    {loadingAction?.player === player.name && loadingAction?.action === "ban" ? (
                      <Check size={12} />
                    ) : (
                      <Gavel size={12} />
                    )}
                    Ban
                  </button>

                  <button
                    onClick={() => handleAction(player.name, "ban-ip", `ban-ip ${player.name}`)}
                    className="px-2 py-1.5 rounded-lg text-[10px] font-mono font-bold uppercase tracking-wider flex justify-center items-center gap-1 aw-action-btn disabled:opacity-40"
                    style={{
                      background: 'rgba(220,38,38,.12)',
                      border: '1px solid rgba(220,38,38,.3)',
                      color: '#fca5a5',
                    }}
                    title="Ban IP"
                  >
                    {loadingAction?.player === player.name && loadingAction?.action === "ban-ip" ? (
                      <Check size={12} />
                    ) : (
                      <ShieldAlert size={12} />
                    )}
                    IP
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}