import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Cpu, MemoryStick as MemoryIcon, HardDrive,
  Play, Square, RotateCw, Wifi, Clock, ArrowDown, ArrowUp, ChevronRight, Power,
  Hexagon, Copy, Check
} from "lucide-react";
import { io, Socket } from "socket.io-client";
import { useAuth } from "../context/AuthContext";
import axios from "axios";
import { AreaChart, Area, ResponsiveContainer, YAxis } from "recharts";

/* ═══════════════════════════════════════════════════════
   AstroWax Panel V1.80 — Server Console
   Glass Theme + Address Auto-Copy
═══════════════════════════════════════════════════════ */

interface ServerStats {
  cpu: number;
  ram: number;
  disk: number;
  limitRam: number;
  limitCpu: number;
  limitDisk: number;
  netIn?: number;
  netOut?: number;
  startedAt?: string | null;
  status?: string;
}

interface ServerLike {
  id?: string;
  name?: string;
  port?: number | string;
  ipAlias?: string;
  ram?: number;
  cpu?: number;
  disk?: number;
  status?: string;
  startedAt?: string | null;
  [key: string]: unknown;
}

interface ServerConsoleProps {
  serverId: string;
  server?: ServerLike;
}

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
  dim?: React.ReactNode;
  onClick?: () => void;
  copied?: boolean;
}

interface ChartCardProps {
  title: string;
  data: any[];
  dataKey: string;
  dataKey2?: string;
  max?: number;
  icons?: React.ReactNode;
}

type ServerAction = "start" | "stop" | "restart" | "kill";

const STATS_POLL_MS = 3000;
const SPARK_CAP = 30;

function stripAnsi(str: string) {
  return str.replace(/\x1B(?:[@-Z\\-_]|\[[0-?]*[ -/]*[@-~])/g, "");
}

function formatSize(mb: number) {
  if (mb < 1024) return `${mb.toFixed(2)} MB`;
  return `${(mb / 1024).toFixed(2)} GB`;
}

function formatRate(bytes: number) {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB/s`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB/s`;
}

/* ═══════════════════════════════════════════════════════
   GLASS STAT CARD — with optional copy support
═══════════════════════════════════════════════════════ */
const StatCard = ({ icon, label, value, dim, onClick, copied }: StatCardProps) => (
  <div
    onClick={onClick}
    className={`relative rounded-[12px] py-[15px] pr-[18px] pl-[96px] min-h-[88px] overflow-hidden flex flex-col justify-center transition-all duration-300 group ${
      onClick ? "cursor-pointer" : ""
    }`}
    style={{
      background: copied
        ? "linear-gradient(135deg, rgba(16,185,129,.15) 0%, rgba(13,8,25,.7) 100%)"
        : "linear-gradient(135deg, rgba(20,12,35,.55) 0%, rgba(13,8,25,.7) 100%)",
      backdropFilter: "blur(16px) saturate(1.4)",
      WebkitBackdropFilter: "blur(16px) saturate(1.4)",
      border: copied
        ? "1px solid rgba(16,185,129,.6)"
        : "1px solid rgba(168,85,247,.18)",
      boxShadow: copied
        ? "0 0 28px -4px rgba(16,185,129,.5)"
        : "none",
      transition: "all .3s cubic-bezier(.16,1,.3,1)",
    }}
  >
    {/* Top highlight */}
    <div
      className="absolute top-0 left-0 right-0 h-px pointer-events-none"
      style={{
        background: copied
          ? "linear-gradient(90deg, transparent, rgba(16,185,129,.6), transparent)"
          : "linear-gradient(90deg, transparent, rgba(255,255,255,.12), rgba(168,85,247,.3), rgba(255,255,255,.12), transparent)",
        transition: "background .3s",
      }}
    />

    {/* Icon (rotated, subtle) */}
    <div
      className="absolute left-[16px] top-1/2 -translate-y-1/2 -rotate-[20deg] transition-all duration-300 pointer-events-none"
      style={{
        color: copied ? "rgba(16,185,129,.3)" : "rgba(168,85,247,.15)",
      }}
    >
      <div className="group-hover:scale-110 group-hover:brightness-150 transition-all duration-300">
        {icon}
      </div>
    </div>

    <div
      className="text-[13px] mb-[6px] relative z-10 flex items-center gap-2"
      style={{ color: copied ? "rgba(52,211,153,.95)" : "rgba(168,85,247,.75)" }}
    >
      <span>{label}</span>
      {copied && (
        <span className="text-[10px] font-mono uppercase tracking-widest text-emerald-400 flex items-center gap-1">
          <Check size={10} strokeWidth={3} /> Copied
        </span>
      )}
    </div>
    <div className="text-[17px] font-[700] text-white whitespace-nowrap overflow-hidden text-ellipsis relative z-10">
      {value} {dim && <span className="text-zinc-500 font-[400] text-[13px]">{dim}</span>}
    </div>

    {/* Copy hint (only when clickable + not copied) */}
    {onClick && !copied && (
      <div className="absolute top-2.5 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center gap-1 text-[9px] font-mono uppercase tracking-widest text-purple-400/70">
        <Copy size={9} /> Copy
      </div>
    )}

    {/* Hover glow */}
    <div
      className="absolute inset-0 rounded-[12px] opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
      style={{
        boxShadow: copied
          ? "0 0 0 1px rgba(16,185,129,.5), 0 12px 36px -12px rgba(16,185,129,.4)"
          : "0 0 0 1px rgba(168,85,247,.4), 0 12px 36px -12px rgba(168,85,247,.4)",
      }}
    />
  </div>
);

/* ═══════════════════════════════════════════════════════
   GLASS CHART CARD
═══════════════════════════════════════════════════════ */
const ChartCard = ({ title, data, dataKey, dataKey2, max, icons }: ChartCardProps) => {
  const chartData = useMemo(() => {
    const d = [...data];
    while (d.length < 30) {
      d.unshift({ [dataKey]: 0, ...(dataKey2 ? { [dataKey2]: 0 } : {}) });
    }
    return d;
  }, [data, dataKey, dataKey2]);

  return (
    <div
      className="rounded-[12px] p-[18px_20px] relative overflow-hidden"
      style={{
        background: "linear-gradient(135deg, rgba(20,12,35,.55) 0%, rgba(13,8,25,.7) 100%)",
        backdropFilter: "blur(16px) saturate(1.4)",
        WebkitBackdropFilter: "blur(16px) saturate(1.4)",
        border: "1px solid rgba(168,85,247,.18)",
      }}
    >
      <div
        className="absolute top-0 left-0 right-0 h-px pointer-events-none"
        style={{
          background: "linear-gradient(90deg, transparent, rgba(255,255,255,.1), rgba(168,85,247,.3), rgba(255,255,255,.1), transparent)",
        }}
      />

      <div className="flex justify-between items-center mb-[12px] relative z-10">
        <div className="text-[15px] font-[700] text-white">{title}</div>
        {icons && <div className="flex gap-[9px] items-center">{icons}</div>}
      </div>
      <div className="relative h-[190px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 0, left: 0, right: 0, bottom: 0 }}>
            <defs>
              <linearGradient id={`fill${dataKey}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="rgba(168,85,247,0.45)" />
                <stop offset="100%" stopColor="rgba(168,85,247,0.02)" />
              </linearGradient>
              {dataKey2 && (
                <linearGradient id={`fill${dataKey2}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="rgba(192,132,252,0.45)" />
                  <stop offset="100%" stopColor="rgba(192,132,252,0.02)" />
                </linearGradient>
              )}
            </defs>
            <YAxis domain={[0, max || "auto"]} hide />
            <Area
              type="monotone"
              dataKey={dataKey}
              stroke="#a855f7"
              strokeWidth={2}
              fillOpacity={1}
              fill={`url(#fill${dataKey})`}
              isAnimationActive={false}
            />
            {dataKey2 && (
              <Area
                type="monotone"
                dataKey={dataKey2}
                stroke="#c084fc"
                strokeWidth={2}
                fillOpacity={1}
                fill={`url(#fill${dataKey2})`}
                isAnimationActive={false}
              />
            )}
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

const ChartPlaceholder = ({ title }: { title: string }) => (
  <div
    className="rounded-[12px] p-[18px_20px] relative overflow-hidden"
    style={{
      background: "linear-gradient(135deg, rgba(20,12,35,.4) 0%, rgba(13,8,25,.6) 100%)",
      backdropFilter: "blur(16px) saturate(1.4)",
      WebkitBackdropFilter: "blur(16px) saturate(1.4)",
      border: "1px solid rgba(168,85,247,.12)",
    }}
  >
    <div className="text-[15px] font-[700] text-white mb-[12px]">{title}</div>
    <div className="h-[190px] flex items-center justify-center text-zinc-600 text-[13px] font-mono">
      No data — server offline
    </div>
  </div>
);

/* ═══════════════════════════════════════════════════════
   MAIN COMPONENT
═══════════════════════════════════════════════════════ */
export default function ServerConsole({ serverId, server }: ServerConsoleProps) {
  const { token } = useAuth();
  const [logs, setLogs] = useState<string[]>([]);
  const [command, setCommand] = useState("");

  const [stats, setStats] = useState<ServerStats>({
    cpu: 0,
    ram: 0,
    disk: 0,
    limitRam: server?.ram || 1024,
    limitCpu: server?.cpu || 100,
    limitDisk: server?.disk || 10,
    status: server?.status || "offline",
  });
  const [netRates, setNetRates] = useState({ in: 0, out: 0 });

  const [cpuHist, setCpuHist] = useState<any[]>([]);
  const [ramHist, setRamHist] = useState<any[]>([]);
  const [netHist, setNetHist] = useState<any[]>([]);

  const [atBottom, setAtBottom] = useState(true);
  const [uptime, setUptime] = useState(0);
  const [copied, setCopied] = useState(false);

  const sockRef = useRef<Socket | null>(null);
  const bodyRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const prevNetRef = useRef({ netIn: 0, netOut: 0, timestamp: 0 });
  const isVisible = useRef(true);
  const isTouchingRef = useRef(false);
  const scrollTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastRawLogsRef = useRef<string>("");
  const prevStartedAtRef = useRef<string | null | undefined>(server?.startedAt);
  const copyTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (server?.status) {
      setStats((p) => (p.status === server.status ? p : { ...p, status: server.status }));
    }
  }, [server?.status]);

  useEffect(() => {
    if (stats.startedAt && prevStartedAtRef.current && stats.startedAt !== prevStartedAtRef.current) {
      setLogs([]);
      lastRawLogsRef.current = "";
    }
    prevStartedAtRef.current = stats.startedAt;
  }, [stats.startedAt]);

  useEffect(() => {
    const handleVisibilityChange = () => {
      isVisible.current = !document.hidden;
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, []);

  useEffect(() => {
    let alive = true;

    const syncLogs = async () => {
      if (!alive || !isVisible.current) return;
      try {
        const { data } = await axios.get(`/api/servers/${serverId}/logs`);
        const raw: string = data?.logs || "";
        if (!raw.trim()) return;

        if (raw === lastRawLogsRef.current) return;
        lastRawLogsRef.current = raw;

        const fetchedLines = raw.split(/\r?\n/).filter((l: string) => l.trim());
        if (fetchedLines.length === 0) return;

        setLogs((prev) => {
          if (prev.length === 0) return fetchedLines.slice(-500);

          const prevServerLines = prev.filter(
            (l) => !l.startsWith("> ") && !l.startsWith("[System")
          );
          if (prevServerLines.length === 0) return fetchedLines.slice(-500);

          let matchIdx = -1;
          const maxWindow = Math.min(prevServerLines.length, 8);

          for (let w = maxWindow; w >= 1; w--) {
            const needle = prevServerLines.slice(-w);
            const lastNeedle = needle[needle.length - 1];
            let candidateIdx = fetchedLines.lastIndexOf(lastNeedle);

            while (candidateIdx !== -1) {
              let matches = true;
              for (let i = 0; i < needle.length; i++) {
                const fIdx = candidateIdx - (needle.length - 1) + i;
                if (fIdx < 0 || fetchedLines[fIdx] !== needle[i]) {
                  matches = false;
                  break;
                }
              }
              if (matches) {
                matchIdx = candidateIdx;
                break;
              }
              candidateIdx = fetchedLines.lastIndexOf(lastNeedle, candidateIdx - 1);
            }
            if (matchIdx !== -1) break;
          }

          if (matchIdx !== -1) {
            const newLines = fetchedLines.slice(matchIdx + 1);
            if (newLines.length === 0) return prev;
            const next = [...prev, ...newLines];
            return next.length > 500 ? next.slice(-500) : next;
          } else {
            return fetchedLines.slice(-500);
          }
        });
      } catch {}
    };

    syncLogs();
    const iv = setInterval(syncLogs, 2500);
    return () => {
      alive = false;
      clearInterval(iv);
    };
  }, [serverId]);

  useEffect(() => {
    if (!token || !serverId) return;
    const socket: Socket = io({
      auth: { token },
      transports: ["websocket", "polling"],
      reconnectionAttempts: 5,
      reconnectionDelay: 2000,
    });
    sockRef.current = socket;
    socket.on("connect", () => {
      socket.emit("joinServer", serverId);
    });

    socket.on("clear_logs", () => {
      setLogs([]);
      lastRawLogsRef.current = "";
    });

    socket.on("log", (data: string) => {
      if (typeof data !== "string") return;
      const lines = data.split(/\r?\n/).filter((l) => l.trim());
      if (lines.length === 0) return;
      setLogs((prev) => {
        const next = [...prev, ...lines];
        return next.length > 500 ? next.slice(next.length - 500) : next;
      });
    });
    return () => {
      socket.emit("leaveServer", serverId);
      socket.removeAllListeners();
      socket.disconnect();
      sockRef.current = null;
    };
  }, [serverId, token]);

  useEffect(() => {
    let alive = true;
    let failCount = 0;

    const pull = async () => {
      if (!alive) return;
      if (!isVisible.current) return;

      try {
        const { data } = await axios.get<ServerStats>(`/api/servers/${serverId}/stats`);
        if (alive && data) {
          failCount = 0;
          setStats((p) => ({
            ...p,
            cpu: data.cpu ?? p.cpu,
            ram: data.ram ?? p.ram,
            disk: data.disk ?? p.disk,
            limitRam: data.limitRam ?? p.limitRam,
            limitCpu: data.limitCpu ?? p.limitCpu,
            limitDisk: data.limitDisk ?? p.limitDisk,
            startedAt: data.startedAt ?? p.startedAt,
            status: data.status ?? p.status,
          }));

          setCpuHist((h) => [...h, { cpu: data.cpu ?? 0 }].slice(-SPARK_CAP));
          setRamHist((h) => [...h, { ram: data.ram ?? 0 }].slice(-SPARK_CAP));

          const now = Date.now();
          if (
            prevNetRef.current.timestamp > 0 &&
            data.netIn !== undefined &&
            data.netOut !== undefined
          ) {
            const elapsedSeconds = (now - prevNetRef.current.timestamp) / 1000;
            if (
              data.netIn >= prevNetRef.current.netIn &&
              data.netOut >= prevNetRef.current.netOut
            ) {
              const inRate = Math.max(0, data.netIn - prevNetRef.current.netIn) / elapsedSeconds;
              const outRate = Math.max(0, data.netOut - prevNetRef.current.netOut) / elapsedSeconds;
              setNetRates({ in: inRate, out: outRate });
              setNetHist((h) =>
                [...h, { netIn: inRate / 1024, netOut: outRate / 1024 }].slice(-SPARK_CAP)
              );
            } else {
              setNetRates({ in: 0, out: 0 });
              setNetHist((h) => [...h, { netIn: 0, netOut: 0 }].slice(-SPARK_CAP));
            }
          }
          prevNetRef.current = {
            netIn: data.netIn || 0,
            netOut: data.netOut || 0,
            timestamp: now,
          };
        }
      } catch {
        failCount++;
        if (failCount > 3) {
          setStats((p) => ({ ...p, status: "offline", cpu: 0, ram: 0, disk: 0 }));
          setNetRates({ in: 0, out: 0 });
          setCpuHist((h) => [...h, { cpu: 0 }].slice(-SPARK_CAP));
          setRamHist((h) => [...h, { ram: 0 }].slice(-SPARK_CAP));
          setNetHist((h) => [...h, { netIn: 0, netOut: 0 }].slice(-SPARK_CAP));
        }
      }
    };

    pull();
    const iv = setInterval(pull, STATS_POLL_MS);
    return () => {
      alive = false;
      clearInterval(iv);
    };
  }, [serverId]);

  useEffect(() => {
    const iv = setInterval(() => {
      if (stats.status === "online" || stats.status === "running") {
        if (stats.startedAt) {
          const start = new Date(stats.startedAt).getTime();
          if (start > 0) {
            setUptime(Math.max(0, Math.floor((Date.now() - start) / 1000)));
            return;
          }
        }
      }
      setUptime(0);
    }, 1000);
    return () => clearInterval(iv);
  }, [stats.startedAt, stats.status]);

  let uptimeStr = "—";
  if (stats.status === "online" || stats.status === "running") {
    const d = Math.floor(uptime / 86400);
    const h = Math.floor((uptime % 86400) / 3600);
    const m = Math.floor((uptime % 3600) / 60);
    const s = uptime % 60;
    if (d > 0) uptimeStr = `${d}d ${h}h ${m}m`;
    else if (h > 0) uptimeStr = `${h}h ${m}m ${s}s`;
    else uptimeStr = `${m}m ${s}s`;
  }

  useEffect(() => {
    if (atBottom && !isTouchingRef.current && bodyRef.current) {
      bodyRef.current.scrollTop = bodyRef.current.scrollHeight;
    }
  }, [logs, atBottom]);

  const onScroll = useCallback(() => {
    const el = bodyRef.current;
    if (!el) return;
    const dist = el.scrollHeight - el.scrollTop - el.clientHeight;
    const near = dist < 35;
    setAtBottom((prev) => (prev === near ? prev : near));
  }, []);

  const scrollToBottom = useCallback(() => {
    setAtBottom(true);
    if (bodyRef.current) {
      bodyRef.current.scrollTo({
        top: bodyRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, []);

  const send = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      const cmd = command.trim();
      if (!cmd) return;
      setCommand("");
      setLogs((p) => [...p, `> ${cmd}`]);
      try {
        await axios.post(`/api/servers/${serverId}/command`, { command: cmd });
      } catch (err: any) {
        setLogs((p) => [...p, `[System] Failed to send: ${err?.message}`]);
      }
    },
    [command, serverId]
  );

  const executeAction = async (action: ServerAction) => {
    if (!server) return;
    if (action === "start" || action === "restart") {
      setLogs([]);
      lastRawLogsRef.current = "";
    }
    try {
      setLogs((p) => [...p, `[System] Sending ${action} signal...`]);
      await axios.post(`/api/servers/${server.id}/${action}`);
      const actionName =
        action === "start"
          ? "started"
          : action === "stop"
          ? "stopped"
          : action === "kill"
          ? "forcefully killed"
          : "restarted";
      setLogs((p) => [...p, `[System] Server ${actionName} successfully`]);
    } catch (error: any) {
      setLogs((p) => [
        ...p,
        `[System Error] Failed to ${action} server. Reason: ${
          error.response?.data?.error || error.message
        }`,
      ]);
    }
  };

  const renderLog = (line: string, i: number) => {
    const upperLine = line.toUpperCase();
    const isError =
      upperLine.includes("ERROR") ||
      upperLine.includes("FATAL") ||
      upperLine.includes("EXCEPTION") ||
      upperLine.includes("SEVERE");
    const isWarn =
      upperLine.includes("WARN") ||
      upperLine.includes("RESTARTING") ||
      upperLine.includes("STOPPING") ||
      upperLine.includes("PLUGIN") ||
      upperLine.includes("LOADING");

    let textColor = "text-zinc-100";
    if (isError) textColor = "text-red-400";
    else if (isWarn) textColor = "text-amber-400";

    return (
      <div
        key={i}
        className={`mb-px break-all sm:break-words [overflow-wrap:anywhere] min-w-0 ${textColor}`}
        style={{ animation: "aw-log-in .25s ease both" }}
      >
        {stripAnsi(line)}
      </div>
    );
  };

  const isOnline = stats.status === "online" || stats.status === "running";

  /* ═══ Address computation + copy handler ═══ */
  const addressValue = useMemo(() => {
    if (!server) return "—";
    const alias = server.ipAlias?.trim();
    if (alias) {
      return alias.includes(":") ? alias : `${alias}:${server.port || "25565"}`;
    }
    return `localhost:${server.port || 25565}`;
  }, [server]);

  const handleCopyAddress = useCallback(() => {
    if (!server || addressValue === "—") return;
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(addressValue).catch(() => {});
    } else {
      const el = document.createElement("textarea");
      el.value = addressValue;
      el.style.position = "fixed";
      el.style.opacity = "0";
      document.body.appendChild(el);
      el.select();
      try {
        document.execCommand("copy");
      } catch {}
      document.body.removeChild(el);
    }
    setCopied(true);
    if (copyTimeoutRef.current) clearTimeout(copyTimeoutRef.current);
    copyTimeoutRef.current = setTimeout(() => setCopied(false), 1800);
  }, [server, addressValue]);

  useEffect(() => {
    return () => {
      if (copyTimeoutRef.current) clearTimeout(copyTimeoutRef.current);
    };
  }, []);

  return (
    <div
      className="flex-1 h-full overflow-y-auto overflow-x-hidden custom-scrollbar overscroll-y-contain relative"
      style={{ WebkitOverflowScrolling: "touch", touchAction: "pan-y" }}
    >
      {/* Background aura */}
      <div
        className="fixed pointer-events-none"
        style={{
          top: "-10%",
          left: "-5%",
          width: 500,
          height: 500,
          background: "radial-gradient(circle, rgba(147,51,234,.15), transparent 70%)",
          filter: "blur(120px)",
          zIndex: 0,
        }}
      />
      <div
        className="fixed pointer-events-none"
        style={{
          bottom: "-15%",
          right: "-10%",
          width: 600,
          height: 600,
          background: "radial-gradient(circle, rgba(168,85,247,.12), transparent 70%)",
          filter: "blur(120px)",
          zIndex: 0,
        }}
      />

      <div className="w-full max-w-[1720px] mx-auto px-[14px] sm:px-[24px] py-[18px] sm:py-[30px] pb-[40px] sm:pb-[50px] relative z-10">
        <style
          dangerouslySetInnerHTML={{
            __html: `
              @keyframes aw-rise { from { opacity: 0; transform: translateY(24px); } to { opacity: 1; transform: none; } }
              @keyframes aw-log-in { from { opacity: 0; transform: translateX(-4px); } to { opacity: 1; transform: none; } }
              @keyframes aw-pulse-orb { 0%, 100% { opacity: 1; } 50% { opacity: .55; } }
              @keyframes aw-scan {
                0% { top: -100px; }
                100% { top: 100%; }
              }
              @keyframes aw-copy-pop {
                0% { transform: scale(1); }
                50% { transform: scale(1.15); }
                100% { transform: scale(1); }
              }
              .aw-scanline {
                position: fixed;
                left: 0; right: 0;
                height: 100px;
                top: -100px;
                background: linear-gradient(to bottom, transparent, rgba(168,85,247,.05), transparent);
                animation: aw-scan 10s linear infinite;
                pointer-events: none;
                z-index: 1;
              }
              .aw-log-scroll::-webkit-scrollbar { width: 8px; }
              .aw-log-scroll::-webkit-scrollbar-track { background: rgba(0,0,0,.3); }
              .aw-log-scroll::-webkit-scrollbar-thumb {
                background: linear-gradient(180deg, #a855f7, #7e22ce);
                border-radius: 4px;
                box-shadow: 0 0 8px rgba(168,85,247,.5);
              }
              .aw-log-scroll::-webkit-scrollbar-thumb:hover {
                background: linear-gradient(180deg, #c084fc, #a855f7);
              }
              .aw-copy-pop { animation: aw-copy-pop .4s cubic-bezier(.34,1.56,.64,1); }
            `,
          }}
        />

        <div className="aw-scanline" />

        {/* TOP BAR */}
        <div
          className="flex flex-wrap sm:flex-nowrap justify-between items-center mb-[20px] sm:mb-[24px] gap-[12px] sm:gap-[14px]"
          style={{ animation: "aw-rise .5s ease both" }}
        >
          <div className="flex items-center gap-[12px] min-w-0">
            <div
              className={`w-[11px] h-[11px] rounded-full shrink-0 ${
                isOnline
                  ? "bg-[#42e33d] shadow-[0_0_10px_rgba(66,227,61,.55)]"
                  : stats.status === "offline"
                  ? "bg-[#524b4b]"
                  : "bg-[#e8bd15]"
              }`}
              style={{
                animation: isOnline
                  ? "aw-pulse-orb 2s ease-in-out infinite"
                  : stats.status !== "offline"
                  ? "aw-pulse-orb 1s ease-in-out infinite"
                  : "none",
              }}
            />
            <h1 className="text-[20px] sm:text-[24px] font-[800] text-white truncate">
              {server?.name || "Server"}
            </h1>
            <span
              className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[10px] font-mono uppercase tracking-widest"
              style={{
                background: "rgba(168,85,247,.1)",
                border: "1px solid rgba(168,85,247,.3)",
                color: "#c084fc",
              }}
            >
              <Hexagon size={10} />
              ASTROWAX v1.80
            </span>
          </div>
          <div className="flex items-center gap-2 sm:gap-[10px] w-full sm:w-auto justify-end">
            <button
              onClick={() => executeAction("start")}
              className="flex-1 sm:flex-initial min-w-[60px] sm:min-w-[90px] h-[40px] sm:h-[46px] border-none rounded-full flex items-center justify-center text-[16px] sm:text-[19px] text-white cursor-pointer transition-all hover:brightness-[1.15] hover:-translate-y-px active:translate-y-0 touch-manipulation"
              style={{
                background: "linear-gradient(135deg, #10b981, #059669)",
                boxShadow: "0 8px 24px -8px rgba(16,185,129,.6)",
              }}
              title="Start"
            >
              <Play className="w-5 h-5 fill-current" />
            </button>
            <button
              onClick={() => executeAction("restart")}
              className="flex-1 sm:flex-initial min-w-[60px] sm:min-w-[90px] h-[40px] sm:h-[46px] border-none rounded-full flex items-center justify-center text-[16px] sm:text-[19px] text-white cursor-pointer transition-all hover:brightness-[1.15] hover:-translate-y-px active:translate-y-0 touch-manipulation"
              style={{
                background: "linear-gradient(135deg, #a855f7, #7e22ce)",
                boxShadow: "0 8px 24px -8px rgba(168,85,247,.6)",
              }}
              title="Restart"
            >
              <RotateCw className="w-5 h-5" />
            </button>
            <button
              onClick={() => executeAction("stop")}
              className="flex-1 sm:flex-initial min-w-[60px] sm:min-w-[90px] h-[40px] sm:h-[46px] border-none rounded-full flex items-center justify-center text-[16px] sm:text-[19px] text-white cursor-pointer transition-all hover:brightness-[1.15] hover:-translate-y-px active:translate-y-0 touch-manipulation"
              style={{
                background: "linear-gradient(135deg, #f43f5e, #e11d48)",
                boxShadow: "0 8px 24px -8px rgba(244,63,94,.6)",
              }}
              title="Graceful Stop"
            >
              <Square className="w-5 h-5 fill-current" />
            </button>
            <button
              onClick={() => executeAction("kill")}
              className="flex-1 sm:flex-initial min-w-[60px] sm:min-w-[90px] h-[40px] sm:h-[46px] border-none rounded-full flex items-center justify-center text-[16px] sm:text-[19px] text-white cursor-pointer transition-all hover:brightness-[1.15] hover:-translate-y-px active:translate-y-0 touch-manipulation"
              style={{
                background: "linear-gradient(135deg, #dc2626, #991b1b)",
                boxShadow: "0 8px 24px -8px rgba(220,38,38,.6)",
              }}
              title="Force Kill (SIGKILL)"
            >
              <Power className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* CONSOLE + STATS */}
        <div className="grid grid-cols-1 xl:grid-cols-[1fr_320px] gap-[22px] mb-[22px]">
          {/* Console */}
          <div
            className="relative rounded-[12px] overflow-hidden flex flex-col h-[380px] sm:h-[500px] xl:h-[700px]"
            style={{
              background:
                "linear-gradient(180deg, rgba(13,8,25,.7) 0%, rgba(5,3,10,.85) 100%)",
              backdropFilter: "blur(16px) saturate(1.4)",
              WebkitBackdropFilter: "blur(16px) saturate(1.4)",
              border: "1px solid rgba(168,85,247,.2)",
              boxShadow:
                "0 20px 60px -20px rgba(0,0,0,.5), inset 0 1px 0 rgba(255,255,255,.05)",
              animation: "aw-rise .5s ease .08s both",
            }}
          >
            <div
              className="absolute top-0 left-0 right-0 h-px pointer-events-none z-10"
              style={{
                background:
                  "linear-gradient(90deg, transparent, rgba(255,255,255,.15), rgba(168,85,247,.5), rgba(255,255,255,.15), transparent)",
              }}
            />

            <div
              ref={bodyRef}
              onScroll={onScroll}
              onTouchStart={() => {
                isTouchingRef.current = true;
              }}
              onTouchEnd={() => {
                isTouchingRef.current = false;
                if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
                scrollTimeoutRef.current = setTimeout(onScroll, 120);
              }}
              className="flex-1 overflow-y-auto overflow-x-hidden p-[12px_14px] sm:p-[14px_18px] aw-log-scroll font-mono text-[12px] sm:text-[12.5px] leading-[1.62] text-[#c9c9c9] overscroll-contain select-text"
              style={{
                WebkitOverflowScrolling: "touch",
                touchAction: "pan-y",
                background: "linear-gradient(180deg, rgba(0,0,0,.35), rgba(10,5,20,.5))",
              }}
            >
              {logs.map((log, i) => renderLog(log, i))}
            </div>

            {!atBottom && (
              <button
                type="button"
                onClick={scrollToBottom}
                className="absolute bottom-[60px] right-3 sm:right-4 z-20 px-3 py-1.5 rounded-full text-[11px] sm:text-xs font-medium shadow-xl flex items-center gap-1.5 backdrop-blur-md transition-all active:scale-95 touch-manipulation cursor-pointer select-none"
                style={{
                  background: "rgba(20,12,35,.9)",
                  border: "1px solid rgba(168,85,247,.4)",
                  color: "#e9d5ff",
                }}
                title="Scroll to bottom"
              >
                <ArrowDown
                  className="w-3.5 h-3.5 text-purple-400"
                  style={{ animation: "aw-pulse-orb 1s infinite" }}
                />
                <span>Scroll to bottom</span>
              </button>
            )}

            <form
              onSubmit={send}
              className="flex items-center gap-[9px] sm:gap-[11px] p-[10px_14px] sm:p-[13px_18px] shrink-0"
              style={{
                background:
                  "linear-gradient(135deg, rgba(20,12,35,.7) 0%, rgba(13,8,25,.85) 100%)",
                borderTop: "1px solid rgba(168,85,247,.15)",
                backdropFilter: "blur(16px)",
                WebkitBackdropFilter: "blur(16px)",
              }}
            >
              <ChevronRight className="w-4 h-4 shrink-0" style={{ color: "#a855f7" }} />
              <input
                ref={inputRef}
                value={command}
                onChange={(e) => setCommand(e.target.value)}
                type="text"
                placeholder="Type a command..."
                className="flex-1 bg-transparent border-0 outline-none text-white font-mono text-base sm:text-[13px] min-w-0 placeholder:text-zinc-600"
                autoComplete="off"
              />
              {isOnline && command && (
                <button
                  type="submit"
                  className="shrink-0 px-3 py-1.5 rounded-md text-[10px] font-bold tracking-wider transition-all"
                  style={{
                    background: "linear-gradient(135deg, #a855f7, #7e22ce)",
                    color: "#fff",
                    boxShadow: "0 4px 12px -4px rgba(168,85,247,.6)",
                  }}
                >
                  SEND
                </button>
              )}
            </form>
          </div>

          {/* STATS */}
          <div
            className="grid grid-cols-1 sm:grid-cols-2 xl:flex xl:flex-col gap-[14px]"
            style={{ animation: "aw-rise .5s ease .16s both" }}
          >
            <div className={copied ? "aw-copy-pop" : ""}>
              <StatCard
                icon={<Wifi style={{ width: 62, height: 62 }} />}
                label="Address"
                value={addressValue}
                onClick={handleCopyAddress}
                copied={copied}
              />
            </div>
            <StatCard
              icon={<Clock style={{ width: 62, height: 62 }} />}
              label="Uptime"
              value={uptimeStr}
            />
            <StatCard
              icon={<Cpu style={{ width: 62, height: 62 }} />}
              label="CPU Load"
              value={isOnline ? `${stats.cpu.toFixed(2)}%` : "—"}
              dim={isOnline ? `/ ${stats.limitCpu}%` : ""}
            />
            <StatCard
              icon={<MemoryIcon style={{ width: 62, height: 62 }} />}
              label="Memory"
              value={isOnline ? formatSize(stats.ram) : "—"}
              dim={isOnline ? `/ ${formatSize(stats.limitRam)}` : ""}
            />
            <StatCard
              icon={<HardDrive style={{ width: 62, height: 62 }} />}
              label="Disk"
              value={isOnline ? formatSize(stats.disk) : "0 MB"}
              dim={`/ ${formatSize(stats.limitDisk)}`}
            />
            <StatCard
              icon={<ArrowDown style={{ width: 62, height: 62 }} />}
              label="Network (Inbound)"
              value={isOnline ? `↓ ${formatRate(netRates.in)}` : "—"}
            />
            <StatCard
              icon={<ArrowUp style={{ width: 62, height: 62 }} />}
              label="Network (Outbound)"
              value={isOnline ? `↑ ${formatRate(netRates.out)}` : "—"}
            />
          </div>
        </div>

        {/* CHARTS */}
        <div
          className="grid grid-cols-1 lg:grid-cols-3 gap-[22px]"
          style={{ animation: "aw-rise .5s ease .24s both" }}
        >
          {isOnline ? (
            <>
              <ChartCard title="CPU Load (%)" data={cpuHist} dataKey="cpu" max={stats.limitCpu} />
              <ChartCard title="Memory (MB)" data={ramHist} dataKey="ram" max={stats.limitRam} />
              <ChartCard
                title="Network (KB/s)"
                data={netHist}
                dataKey="netIn"
                dataKey2="netOut"
                max={100}
                icons={
                  <>
                    <ArrowDown className="w-3 h-3" style={{ color: "#a855f7" }} />
                    <ArrowUp className="w-3 h-3" style={{ color: "#c084fc" }} />
                  </>
                }
              />
            </>
          ) : (
            <>
              <ChartPlaceholder title="CPU Load (%)" />
              <ChartPlaceholder title="Memory (MB)" />
              <ChartPlaceholder title="Network (KB/s)" />
            </>
          )}
        </div>
      </div>
    </div>
  );
}