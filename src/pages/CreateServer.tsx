import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useSettings } from "../context/SettingsContext";
import axios from "axios";
import CategorizedVersionDropdown from "../components/CategorizedVersionDropdown";
import { getJavaVersionForMinecraft } from "../utils/minecraftJava";
import {
  ArrowLeft, Server, AlertTriangle, AlignLeft, MemoryStick as MemoryStickIcon,
  Cpu, Zap, Sparkles, HardDrive, Globe, User, Radio, GitBranch, Check,
  ChevronDown, Search, Rocket, SlidersHorizontal, FastForward, Network,
  Wrench, Feather, Info, Code2, TerminalSquare, Lock, Hexagon, Activity,
} from "lucide-react";

/* ═══════════════════════════════════════════════════════════════
   SAFE JAVA VERSION RESOLVER — never throws
   ═══════════════════════════════════════════════════════════════ */
function safeJavaVersion(version: string, software: string): string {
  try {
    if (!version || typeof version !== "string") return "17";
    const result = getJavaVersionForMinecraft(version, software);
    if (result === undefined || result === null || result === "") return "17";
    return String(result);
  } catch {
    return "17";
  }
}

/* ═══════════════════════════════════════════════════════════════
   FALLBACK VERSION LISTS — so dropdown is NEVER empty
   ═══════════════════════════════════════════════════════════════ */
const FALLBACK_VERSIONS: Record<string, string[]> = {
  paper: [
    "26.3","26.2","26.1",
    "1.21.4","1.21.3","1.21.1","1.21",
    "1.20.6","1.20.4","1.20.2","1.20.1","1.20",
    "1.19.4","1.19.3","1.19.2","1.19.1","1.19",
    "1.18.2","1.18.1","1.18",
    "1.17.1","1.17",
    "1.16.5","1.16.4","1.16.3","1.16.2","1.16.1","1.16",
    "1.15.2","1.15.1","1.15",
    "1.14.4","1.14.3","1.14.2","1.14.1","1.14",
    "1.13.2","1.13.1","1.13",
    "1.12.2","1.12.1","1.12",
    "1.11.2","1.11.1","1.11",
    "1.10.2","1.10.1","1.10",
    "1.9.4","1.9.2","1.9",
    "1.8.9","1.8.8","1.8.7",
    "1.7.10","1.7.2",
  ],
  spigot: [
    "1.21.4","1.21.3","1.21.1","1.21",
    "1.20.6","1.20.4","1.20.2","1.20.1","1.20",
    "1.19.4","1.19.3","1.19.2","1.19",
    "1.18.2","1.18.1","1.18",
    "1.17.1","1.17",
    "1.16.5","1.16.4","1.16.3","1.16.1","1.16",
    "1.15.2","1.15.1","1.15",
    "1.14.4","1.14.3","1.14.2","1.14",
    "1.13.2","1.13.1","1.13",
    "1.12.2","1.12.1","1.12",
    "1.11.2","1.10.2","1.9.4","1.8.9","1.7.10",
  ],
  fabric: [
    "1.21.4","1.21.3","1.21.1","1.21",
    "1.20.6","1.20.4","1.20.2","1.20.1","1.20",
    "1.19.4","1.19.3","1.19.2","1.19",
    "1.18.2","1.18.1","1.18",
    "1.17.1","1.17",
    "1.16.5","1.16.4","1.16.3","1.16.1","1.16",
    "1.15.2","1.15.1","1.15",
    "1.14.4","1.14.3","1.14.2",
  ],
  forge: [
    "1.21.4","1.21.3","1.21.1","1.21",
    "1.20.6","1.20.4","1.20.1","1.20",
    "1.19.4","1.19.2","1.19",
    "1.18.2","1.18.1","1.18",
    "1.17.1","1.17",
    "1.16.5","1.16.4","1.16.3","1.16.1",
    "1.15.2","1.15.1","1.15",
    "1.14.4","1.14.3","1.14.2",
    "1.13.2","1.12.2","1.12.1","1.11.2","1.10.2","1.9.4","1.8.9","1.7.10",
  ],
  bungeecord: [
    "1.21","1.20","1.19","1.18","1.17","1.16","1.15",
    "1.14","1.13","1.12","1.11","1.10","1.9","1.8",
  ],
  velocity: ["3.3.0","3.2.0","3.1.0","3.0.0"],
  nodejs: ["22.x","21.x","20.x (LTS)","18.x (LTS)","16.x"],
  python: ["3.13","3.12","3.11","3.10","3.9","3.8"],
};

/* ═══════════════════════════════════════════════════════════════
   ERROR BOUNDARY
   ═══════════════════════════════════════════════════════════════ */
class DeployErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error?: Error }
> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }
  componentDidCatch(error: Error, info: any) {
    console.error("[DeployErrorBoundary]", error, info);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: "100vh", background: "#05030a", color: "#fff",
          display: "flex", alignItems: "center", justifyContent: "center",
          padding: 24, fontFamily: "IBM Plex Mono, monospace",
        }}>
          <div style={{
            maxWidth: 560, border: "1px solid rgba(168,85,247,.4)",
            background: "rgba(20,12,35,.7)", padding: 32, borderRadius: 14,
          }}>
            <div style={{ color: "#a855f7", fontSize: 12, letterSpacing: ".3em", marginBottom: 12 }}>
              DEPLOY ERROR
            </div>
            <h1 style={{ fontSize: 22, margin: "0 0 12px", color: "#fff" }}>
              Something went wrong
            </h1>
            <p style={{ color: "#a1a1aa", fontSize: 13, lineHeight: 1.6 }}>
              {this.state.error?.message || "Unknown render error."}
            </p>
            <pre style={{
              marginTop: 16, padding: 12, background: "#000",
              border: "1px solid #232323", borderRadius: 8,
              fontSize: 11, color: "#a1a1aa", overflow: "auto", maxHeight: 200,
            }}>
              {this.state.error?.stack || "no stack"}
            </pre>
            <button
              onClick={() => window.location.reload()}
              style={{
                marginTop: 20, padding: "10px 20px",
                background: "linear-gradient(135deg,#a855f7,#7e22ce)",
                color: "#fff", border: "none", borderRadius: 10,
                cursor: "pointer", fontFamily: "inherit",
                fontWeight: 700, letterSpacing: ".15em",
              }}
            >
              RELOAD
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

/* ═══════════════════════════════════════════════════════════════
   PAGE STYLES
   ═══════════════════════════════════════════════════════════════ */
const pageStyles = `
  .deploy-theme { background: #05030a; color: #fff; font-family: 'IBM Plex Sans', sans-serif; min-height: 100vh; position: relative; overflow-x: hidden; }
  .deploy-theme .font-display { font-family: 'Chakra Petch', sans-serif; }
  .deploy-theme .font-mono { font-family: 'IBM Plex Mono', monospace; }
  .deploy-theme .bg-grid { position: fixed; inset: 0; z-index: 0; pointer-events: none; background-image: linear-gradient(rgba(168,85,247,.06) 1px, transparent 1px), linear-gradient(90deg, rgba(168,85,247,.06) 1px, transparent 1px); background-size: 56px 56px; mask-image: radial-gradient(ellipse 95% 70% at 50% 0%, #000 25%, transparent 78%); -webkit-mask-image: radial-gradient(ellipse 95% 70% at 50% 0%, #000 25%, transparent 78%); }
  .deploy-theme .aura { position: fixed; pointer-events: none; z-index: 0; border-radius: 50%; filter: blur(120px); }
  .deploy-theme .aura-1 { top: -10%; left: -5%; width: 500px; height: 500px; background: radial-gradient(circle, rgba(147,51,234,.4), transparent 70%); animation: aura-float 18s ease-in-out infinite; }
  .deploy-theme .aura-2 { bottom: -15%; right: -10%; width: 600px; height: 600px; background: radial-gradient(circle, rgba(168,85,247,.3), transparent 70%); animation: aura-float 24s ease-in-out infinite reverse; }
  @keyframes aura-float { 0%,100% { transform: translate(0,0) scale(1); } 50% { transform: translate(60px,40px) scale(1.1); } }
  .deploy-theme .scanline { position: fixed; left: 0; right: 0; height: 140px; top: -140px; z-index: 1; pointer-events: none; background: linear-gradient(to bottom, transparent, rgba(168,85,247,.06), transparent); animation: scan 10s linear infinite; }
  @keyframes scan { to { top: 100vh; } }
  .deploy-theme .noise { position: fixed; inset: 0; z-index: 60; pointer-events: none; opacity: .03; background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.7' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E"); }
  .deploy-theme .glass-panel { background: linear-gradient(135deg, rgba(20,12,35,.55) 0%, rgba(13,8,25,.7) 100%); backdrop-filter: blur(20px) saturate(1.4); -webkit-backdrop-filter: blur(20px) saturate(1.4); border: 1px solid rgba(168,85,247,.2); box-shadow: 0 20px 60px -20px rgba(0,0,0,.5), inset 0 1px 0 rgba(255,255,255,.06); position: relative; overflow: visible; }
  .deploy-theme .glass-panel::before { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 1px; background: linear-gradient(90deg, transparent, rgba(168,85,247,.5), rgba(255,255,255,.3), rgba(168,85,247,.5), transparent); pointer-events: none; }
  .deploy-theme .inp { width: 100%; background: rgba(14,8,25,.7); backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px); border: 1px solid rgba(168,85,247,.2); padding: .85rem 1rem; color: #fff; outline: none; transition: all .25s cubic-bezier(.16,1,.3,1); font-size: .95rem; border-radius: 8px; }
  .deploy-theme .inp::placeholder { color: #4c4c4c; }
  .deploy-theme .inp:hover { border-color: rgba(168,85,247,.4); }
  .deploy-theme .inp:focus { border-color: #a855f7; box-shadow: 0 0 0 3px rgba(168,85,247,.15), 0 0 24px -4px rgba(168,85,247,.4), inset 0 0 12px -6px rgba(168,85,247,.2); background: rgba(20,12,35,.8); }
  .deploy-theme .sel-card { position: relative; background: linear-gradient(135deg, rgba(20,12,35,.6) 0%, rgba(13,8,25,.7) 100%); backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px); border: 1px solid rgba(168,85,247,.15); cursor: pointer; transition: all .3s cubic-bezier(.16,1,.3,1); overflow: hidden; border-radius: 10px; }
  .deploy-theme .sel-card::after { content: ''; position: absolute; top: 0; left: -100%; width: 100%; height: 100%; background: linear-gradient(90deg, transparent, rgba(255,255,255,.08), rgba(168,85,247,.1), transparent); transition: left .7s ease; pointer-events: none; }
  .deploy-theme .sel-card:hover::after { left: 100%; }
  .deploy-theme .sel-card:hover { transform: translateY(-4px); border-color: rgba(168,85,247,.6); background: linear-gradient(135deg, rgba(30,18,55,.7) 0%, rgba(20,12,35,.8) 100%); box-shadow: 0 12px 40px -12px rgba(168,85,247,.4), 0 0 0 1px rgba(168,85,247,.2); }
  .deploy-theme .sel-card.selected { border-color: #a855f7; background: linear-gradient(135deg, rgba(40,22,70,.8) 0%, rgba(25,14,45,.9) 100%); box-shadow: 0 0 0 2px rgba(168,85,247,.5), 0 16px 50px -16px rgba(168,85,247,.6), inset 0 0 30px -20px rgba(168,85,247,.4); }
  .deploy-theme .sel-card .tick { position: absolute; top: 8px; right: 8px; width: 20px; height: 20px; background: linear-gradient(135deg, #a855f7, #7e22ce); color: #fff; display: flex; align-items: center; justify-content: center; opacity: 0; transform: scale(.3) rotate(-90deg); transition: all .35s cubic-bezier(.34,1.56,.64,1); border-radius: 5px; box-shadow: 0 0 15px rgba(168,85,247,.7); z-index: 2; }
  .deploy-theme .sel-card.selected .tick { opacity: 1; transform: scale(1) rotate(0deg); }
  .deploy-theme .soft-card .ic { color: #4c4c4c; transition: all .3s cubic-bezier(.16,1,.3,1); }
  .deploy-theme .soft-card:hover .ic { color: #c084fc; transform: scale(1.05); }
  .deploy-theme .soft-card.selected .ic { color: #a855f7; filter: drop-shadow(0 0 10px rgba(168,85,247,.8)); transform: scale(1.08); }
  .deploy-theme .btn-primary { position: relative; overflow: hidden; background: linear-gradient(135deg, #a855f7, #7e22ce); color: #fff; border-radius: 10px; transition: all .3s cubic-bezier(.16,1,.3,1); box-shadow: 0 0 20px -4px rgba(168,85,247,.5), inset 0 1px 0 rgba(255,255,255,.15); }
  .deploy-theme .btn-primary::before { content: ''; position: absolute; inset: 0; background: linear-gradient(135deg, #7e22ce, #6b21a8); transform: translateY(101%); transition: transform .35s cubic-bezier(.16,1,.3,1); }
  .deploy-theme .btn-primary:hover:not(:disabled)::before { transform: translateY(0); }
  .deploy-theme .btn-primary > * { position: relative; z-index: 1; }
  .deploy-theme .btn-primary:disabled { opacity: .35; cursor: not-allowed; }
  .deploy-theme .btn-ghost { background: rgba(20,12,35,.4); backdrop-filter: blur(8px); -webkit-backdrop-filter: blur(8px); border: 1px solid rgba(168,85,247,.2); color: #a1a1aa; transition: all .25s cubic-bezier(.16,1,.3,1); border-radius: 10px; }
  .deploy-theme .btn-ghost:hover:not(:disabled) { border-color: rgba(168,85,247,.6); color: #fff; background: rgba(30,18,55,.5); }
  .deploy-theme .btn-ghost:disabled { opacity: .3; cursor: not-allowed; }
  .deploy-theme .dot { width: 44px; height: 44px; display: flex; align-items: center; justify-content: center; border: 1px solid rgba(168,85,247,.25); background: rgba(20,12,35,.6); backdrop-filter: blur(12px); font-size: 13px; color: #4c4c4c; transition: all .4s cubic-bezier(.16,1,.3,1); border-radius: 12px; position: relative; }
  .deploy-theme .dot.active { border-color: rgba(168,85,247,.8); color: #a855f7; background: linear-gradient(135deg, rgba(40,22,70,.7), rgba(25,14,45,.8)); box-shadow: 0 0 0 2px rgba(168,85,247,.4), 0 0 30px -4px rgba(168,85,247,.7); }
  .deploy-theme .dot.done { background: linear-gradient(135deg, #a855f7, #7e22ce); color: #fff; border-color: #a855f7; }
  .deploy-theme .conn-fill { height: 100%; background: linear-gradient(90deg, #a855f7, #7e22ce, #c084fc); width: 0; transition: width .6s cubic-bezier(.16,1,.3,1); }
  .deploy-theme .anim-forward { animation: sR .55s cubic-bezier(.16,1,.3,1); }
  .deploy-theme .anim-back { animation: sL .55s cubic-bezier(.16,1,.3,1); }
  @keyframes sR { from { opacity: 0; transform: translateX(50px); } to { opacity: 1; transform: translateX(0); } }
  @keyframes sL { from { opacity: 0; transform: translateX(-50px); } to { opacity: 1; transform: translateX(0); } }
  .deploy-theme .pulse-dot { animation: pd 2.4s infinite; }
  @keyframes pd { 0%, 100% { box-shadow: 0 0 0 0 rgba(168,85,247,.6); } 50% { box-shadow: 0 0 0 8px rgba(168,85,247,0); } }
  .deploy-theme .panel-corner { position: absolute; width: 20px; height: 20px; z-index: 2; }
  .deploy-theme .pc-tl { top: -1px; left: -1px; border-top: 2px solid #a855f7; border-left: 2px solid #a855f7; }
  .deploy-theme .pc-tr { top: -1px; right: -1px; border-top: 2px solid #a855f7; border-right: 2px solid #a855f7; }
  .deploy-theme .pc-bl { bottom: -1px; left: -1px; border-bottom: 2px solid #a855f7; border-left: 2px solid #a855f7; }
  .deploy-theme .pc-br { bottom: -1px; right: -1px; border-bottom: 2px solid #a855f7; border-right: 2px solid #a855f7; }
`;

const RAM = [
  { v: 1, label: "Small Testing Server" }, { v: 2, label: "Small Testing Server" },
  { v: 4, label: "Starter Survival" }, { v: 8, label: "Medium Survival Server" },
  { v: 16, label: "Large Community Server" }, { v: 24, label: "Heavy Modpack Server" },
  { v: 32, label: "High-Traffic Network" }, { v: 48, label: "Enterprise Workload" },
  { v: 64, label: "Extreme Performance" },
];
const CPU_MAP: Record<number, number> = { 1:100,2:100,4:150,8:200,16:300,24:400,32:500,48:700,64:800 };

const MINECRAFT_SOFTWARE = [
  { id:"paper", name:"Paper", desc:"High Performance", icon: Zap },
  { id:"spigot", name:"Spigot", desc:"Classic Plugins", icon: Wrench },
  { id:"fabric", name:"Fabric", desc:"Lightweight Mods", icon: Feather },
  { id:"forge", name:"Forge", desc:"Classic Modpack", icon: Wrench },
  { id:"bungeecord", name:"BungeeCord", desc:"Classic Proxy", icon: Network },
  { id:"velocity", name:"Velocity", desc:"Next-gen Proxy", icon: FastForward },
];
const APPLICATION_SOFTWARE = [
  { id:"nodejs", name:"Node.js", desc:"JS / TS Runtime & Discord Bots", icon: Code2 },
  { id:"python", name:"Python", desc:"Python 3.x Runtime & Scripts", icon: TerminalSquare },
];
const SOFTWARE = [...MINECRAFT_SOFTWARE, ...APPLICATION_SOFTWARE];
const STEPS = ["IDENTITY","RESOURCES","ACCESS","SOFTWARE","REVIEW"];

/* ─── Custom Dropdown ─── */
function CustomDropdown({ value, options, onChange, renderValue, renderOption, placeholder }: any) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const safeOptions = Array.isArray(options) ? options : [];
  const filtered = safeOptions.filter((o: any) =>
    (o.label || o.name || o.value || o.v || "").toString().toLowerCase().includes(search.toLowerCase())
  );
  const selected = safeOptions.find((o: any) => (o.value || o.v) === value);

  return (
    <div className="relative" ref={wrapperRef}>
      <button type="button" onClick={() => setOpen(!open)} className="w-full flex items-center justify-between gap-3 inp text-left !py-3">
        <span className="flex items-center gap-3 min-w-0">
          {selected ? renderValue(selected) : <span className="text-[#4c4c4c]">{placeholder}</span>}
        </span>
        <ChevronDown className={`w-4 h-4 text-purple-400 transition-transform duration-300 shrink-0 ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div className="absolute z-[100] mt-2 w-full glass-panel shadow-2xl shadow-purple-900/40" style={{ background: "linear-gradient(135deg, rgba(20,12,35,.98) 0%, rgba(13,8,25,.99) 100%)", backdropFilter: "blur(24px)", borderRadius: "10px" }}>
          <div className="p-2 border-b border-purple-500/20">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-purple-400/60" />
              <input autoFocus className="w-full bg-black/40 border border-purple-500/25 pl-8 pr-2 py-2 text-sm outline-none focus:border-purple-500 transition-colors text-white rounded" placeholder="Search..." value={search} onChange={e => setSearch(e.target.value)} />
            </div>
          </div>
          <div className="max-h-52 overflow-y-auto p-1">
            {filtered.length > 0 ? filtered.map((o: any, i: number) => {
              const val = o.value || o.v;
              const isSel = val === value;
              return <div key={i} onClick={() => { onChange(val); setOpen(false); setSearch(""); }}>{renderOption(o, isSel)}</div>;
            }) : <p className="px-3 py-3 text-[11px] text-[#4c4c4c] font-mono">NO RESULTS</p>}
          </div>
        </div>
      )}
    </div>
  );
}

const getInitials = (name: string) => (name ? name.slice(0, 2).toUpperCase() : "??");

/* ═══════════════════════════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════════════════════════ */
function CreateServerInner() {
  const { defaultRuntime, isDevPanel, panelName } = useSettings();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [nodes, setNodes] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [versions, setVersions] = useState<string[]>([]);

  const [currentStep, setCurrentStep] = useState(0);
  const [maxVisited, setMaxVisited] = useState(0);
  const [deployed, setDeployed] = useState(false);
  const [deployProgress, setDeployProgress] = useState(0);
  const [nameError, setNameError] = useState(false);
  const [dir, setDir] = useState<"forward" | "back">("forward");

  const [portStatus, setPortStatus] = useState<"idle"|"checking"|"used"|"available"|"invalid"|"error">("idle");
  const portCheckIdRef = useRef(0);

  const [state, setState] = useState({
    name: "",
    desc: "",
    ram: 4,
    cpu: 150,
    disk: 10,
    ip: "",
    port: 25565,
    runtimeType: defaultRuntime || "docker",
    owner: user?.id || "",
    node: "",
    software: "paper",
    version: "26.3",       // ⚠️ never empty — always a valid default
    auto: true,
  });

  /* ─── Sync defaultRuntime from settings ─── */
  useEffect(() => {
    if (defaultRuntime) setState(s => ({ ...s, runtimeType: defaultRuntime }));
  }, [defaultRuntime]);

  useEffect(() => {
    if (!isDevPanel && defaultRuntime) setState(s => ({ ...s, runtimeType: defaultRuntime }));
  }, [isDevPanel, defaultRuntime]);

  /* ─── Port availability check ─── */
  useEffect(() => {
    if (currentStep < 2) return;
    if (!state.port || state.port <= 0 || state.port > 65535) {
      setPortStatus("invalid");
      return;
    }
    const checkId = ++portCheckIdRef.current;
    setPortStatus("checking");
    const timer = setTimeout(() => {
      axios.get(`/api/servers/check-port?port=${state.port}`)
        .then(res => {
          if (checkId === portCheckIdRef.current) {
            setPortStatus(res.data?.inUse ? "used" : "available");
          }
        })
        .catch(() => {
          if (checkId === portCheckIdRef.current) setPortStatus("error");
        });
    }, 400);
    return () => clearTimeout(timer);
  }, [state.port, currentStep]);

  /* ─── Font + initial data load ─── */
  useEffect(() => {
    const link = document.createElement("link");
    link.href = "https://fonts.googleapis.com/css2?family=Chakra+Petch:wght@500;600;700&family=IBM+Plex+Mono:wght@400;500;600&family=IBM+Plex+Sans:wght@300;400;500&display=swap";
    link.rel = "stylesheet";
    document.head.appendChild(link);

    axios.get("/api/nodes").then(res => {
      const list = Array.isArray(res.data) ? res.data : [];
      setNodes(list);
      if (list.length > 0) setState(s => (s.node ? s : { ...s, node: list[0].id }));
    }).catch(() => {});

    if (user?.role === "admin" || user?.role === "owner") {
      axios.get("/api/auth/users")
        .then(res => setUsers(Array.isArray(res.data) ? res.data : []))
        .catch(() => {});
    }

    return () => {
      if (document.head.contains(link)) document.head.removeChild(link);
    };
  }, []);

  /* ═══════════════════════════════════════════════════════════════
     VERSION LOADER — with fallback so dropdown is NEVER empty
     ═══════════════════════════════════════════════════════════════ */
  useEffect(() => {
    const sw = state.software;
    const fallback = FALLBACK_VERSIONS[sw] || ["latest"];

    // 1. Immediately show fallback versions — dropdown never blank
    setVersions(fallback);
    setState(s => ({ ...s, version: fallback[0] || "latest" }));

    // 2. Then try to refresh from the backend API
    axios.get(`/api/system/versions?type=${sw}`)
      .then(res => {
        let v: string[] = [];
        if (Array.isArray(res.data)) v = res.data;
        else if (Array.isArray(res.data?.versions)) v = res.data.versions;
        else if (Array.isArray(res.data?.data)) v = res.data.data;

        v = v.filter((x): x is string => typeof x === "string" && x.length > 0);

        if (v.length > 0) {
          setVersions(v);
          setState(s => ({ ...s, version: v[0] }));
        }
      })
      .catch(() => {
        console.warn(`[versions] API failed for "${sw}", using fallback list.`);
      });
  }, [state.software]);

  const updateState = (key: string, val: any) => {
    setState(prev => ({ ...prev, [key]: val }));
  };

  const handleRamClick = (ramVal: number) => {
    let newCpu = state.cpu;
    if (state.auto) newCpu = CPU_MAP[ramVal] || 100;
    setState(prev => ({ ...prev, ram: ramVal, cpu: newCpu }));
  };

  const handleAutoToggle = () => {
    const nextAuto = !state.auto;
    setState(prev => ({
      ...prev,
      auto: nextAuto,
      cpu: nextAuto ? (CPU_MAP[prev.ram] || 100) : prev.cpu
    }));
  };

  const validateStep = async () => {
    if (currentStep === 0 && !state.name.trim()) {
      setNameError(true);
      return false;
    }
    if (currentStep === 2) {
      if (!state.port || state.port <= 0 || state.port > 65535) {
        alert("Please enter a valid Server Port (1-65535).");
        return false;
      }
      if (portStatus === "used") {
        alert("Port is already in use by another server.");
        return false;
      }
      if (portStatus === "checking") return false;
      if (portStatus === "error") {
        alert("Could not verify this port. Try again.");
        return false;
      }
    }
    return true;
  };

  const showStep = (n: number) => {
    setDir(n > currentStep ? "forward" : "back");
    setCurrentStep(n);
    setMaxVisited(Math.max(maxVisited, n));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleNext = async () => {
    const isValid = await validateStep();
    if (!isValid) return;
    if (currentStep < STEPS.length - 1) {
      showStep(currentStep + 1);
    } else {
      launch();
    }
  };

  const launch = async () => {
    if (deployed) return;
    setDeployProgress(1);
    const iv = setInterval(() => {
      setDeployProgress(p => Math.min(90, p + Math.random() * 8 + 2));
    }, 280);

    try {
      const payload = {
        name: state.name,
        description: state.desc,
        ram: state.ram,
        cpuLimit: state.cpu,
        diskLimit: state.disk,
        port: state.port,
        ipAlias: state.ip,
        type: state.software,
        version: state.version,
        ownerId: state.owner || user?.id,
        runtimeType: state.runtimeType,
        nodeId: state.node,
      };
      await axios.post("/api/servers", payload);

      clearInterval(iv);
      setDeployProgress(100);
      setTimeout(() => setDeployed(true), 500);
      setTimeout(() => navigate("/servers"), 2500);
    } catch (e: any) {
      clearInterval(iv);
      setDeployProgress(0);
      alert(e.response?.data?.error || "Failed to deploy container");
    }
  };

  const renderReviewRow = (k: string, v: string) => (
    <div className="flex items-center justify-between gap-4 px-4 py-3 hover:bg-purple-500/[0.04] transition-colors">
      <span className="text-purple-400/60 tracking-widest text-[11px] font-mono uppercase">{k}</span>
      <span className="text-white text-right truncate font-mono">{v}</span>
    </div>
  );

  /* ─── Whether current software is a Minecraft engine ─── */
  const isMinecraftSoftware = !["nodejs", "python"].includes(state.software);

  return (
    <div className="deploy-theme">
      <style dangerouslySetInnerHTML={{ __html: pageStyles }} />
      <div className="noise"></div>
      <div className="bg-grid"></div>
      <div className="aura aura-1"></div>
      <div className="aura aura-2"></div>
      <div className="scanline"></div>

      {/* Progress Line */}
      <div
        style={{
          position: "fixed", top: 0, left: 0, height: "3px", width: "100%", zIndex: 100,
          background: "linear-gradient(90deg, #7e22ce, #a855f7, #c084fc, #a855f7)",
          backgroundSize: "200% 100%",
          transformOrigin: "left",
          transform: `scaleX(${(currentStep + 1) / STEPS.length})`,
          boxShadow: "0 0 20px rgba(168,85,247,.9), 0 0 40px rgba(168,85,247,.5)",
          transition: "transform .6s cubic-bezier(.16,1,.3,1)",
        }}
      />

      <div className="relative z-10">
        <nav className="sticky top-0 z-50 border-b border-purple-500/15 bg-black/50 backdrop-blur-2xl">
          <div className="max-w-3xl mx-auto px-5 h-16 flex items-center justify-between">
            <button
              onClick={() => navigate("/servers")}
              className="flex items-center gap-2 font-mono text-[11px] tracking-widest text-zinc-400 hover:text-purple-300 transition-all border border-purple-500/20 hover:border-purple-500/50 px-3 py-1.5 rounded-lg backdrop-blur-sm"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> INSTANCES
            </button>
            <a
              href="#"
              onClick={(e) => { e.preventDefault(); navigate("/servers"); }}
              className="flex items-center gap-3 group"
            >
              <span className="font-display font-bold text-lg tracking-wide text-white">
                {panelName || "AstroWax"}<span className="text-purple-400 font-medium"> Panel</span>
              </span>
              <div className="relative">
                <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-purple-700 flex items-center justify-center group-hover:rotate-45 transition-transform duration-500 rounded-lg shadow-lg shadow-purple-600/50 border border-purple-400/30">
                  <Hexagon className="w-4 h-4 text-white" />
                </div>
                <div className="absolute inset-0 bg-purple-500/40 blur-md -z-10 rounded-lg"></div>
              </div>
            </a>
          </div>
        </nav>

        <main className="max-w-3xl mx-auto px-5 pt-12 pb-16">
          <header className="mb-10">
            <p className="font-mono text-[11px] tracking-[0.3em] text-purple-400/80 mb-3 flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-purple-500 rounded-full pulse-dot"></span> NEW CONTAINER
            </p>
            <h1 className="font-display font-bold tracking-tight text-4xl md:text-5xl text-white">
              DEPLOY <span className="bg-gradient-to-r from-purple-400 via-purple-300 to-purple-500 bg-clip-text text-transparent">INSTANCE</span>
            </h1>
          </header>

          {/* Stepper */}
          <div className="mb-4">
            <div className="flex items-start">
              {STEPS.map((s, i) => (
                <React.Fragment key={i}>
                  <div className="flex flex-col items-center flex-shrink-0" style={{ width: "56px" }}>
                    <button
                      type="button"
                      onClick={() => { if (i <= maxVisited && i !== currentStep && !deployed) showStep(i); }}
                      className={`dot font-mono ${i < currentStep ? "done" : i === currentStep ? "active" : ""}`}
                    >
                      {i < currentStep ? <Check className="w-4 h-4 stroke-[3]" /> : String(i + 1).padStart(2, "0")}
                    </button>
                    <span className={`hidden sm:block mt-2 font-mono text-[9px] tracking-widest text-center transition-colors ${
                      i === currentStep ? "text-purple-300" : i < currentStep ? "text-purple-400/60" : "text-[#4c4c4c]"
                    }`}>
                      {s}
                    </span>
                  </div>
                  {i < STEPS.length - 1 && (
                    <div className="flex-1 h-px bg-purple-500/20 mt-[22px] mx-1 relative">
                      <div className="conn-fill absolute inset-0" style={{ width: i < currentStep ? "100%" : "0%" }}></div>
                    </div>
                  )}
                </React.Fragment>
              ))}
            </div>
            <p className="sm:hidden mt-4 font-mono text-[11px] tracking-widest text-purple-400/80 text-center">
              STEP {currentStep + 1} OF {STEPS.length} — {STEPS[currentStep]}
            </p>
          </div>

          <div className="glass-panel p-6 md:p-9 mt-6" style={{ borderRadius: "14px" }}>
            <span className="panel-corner pc-tl"></span>
            <span className="panel-corner pc-tr"></span>
            <span className="panel-corner pc-bl"></span>
            <span className="panel-corner pc-br"></span>

            <div className={`${dir === "forward" ? "anim-forward" : "anim-back"}`}>

              {/* STEP 1: IDENTITY */}
              {currentStep === 0 && (
                <div className="step-content">
                  <div className="flex items-center gap-3 mb-6">
                    <span className="font-mono text-xs text-purple-500 bg-purple-500/10 border border-purple-500/30 px-2 py-0.5 rounded">01</span>
                    <h2 className="font-display font-bold tracking-wide text-sm text-white">IDENTITY</h2>
                    <span className="flex-1 h-px bg-gradient-to-r from-purple-500/30 to-transparent"></span>
                  </div>

                  <label className="flex items-center gap-2 text-sm text-zinc-400 mb-2.5">
                    <Server className="w-4 h-4 text-purple-400" /> Instance Name <span className="text-purple-400">*</span>
                  </label>
                  <input
                    type="text"
                    className={`inp ${nameError ? "!border-red-500/60" : ""}`}
                    placeholder="e.g. Production Survival"
                    value={state.name}
                    onChange={(e) => { updateState("name", e.target.value); setNameError(false); }}
                    onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleNext(); } }}
                  />
                  {nameError && (
                    <p className="mt-2 text-xs text-red-400 font-mono flex items-center gap-1.5">
                      <AlertTriangle className="w-3.5 h-3.5" /> Instance name is required.
                    </p>
                  )}

                  <label className="flex items-center gap-2 text-sm text-zinc-400 mb-2.5 mt-7">
                    <AlignLeft className="w-4 h-4 text-purple-400" /> Description
                  </label>
                  <textarea
                    className="inp"
                    style={{ resize: "vertical", minHeight: "96px", fontFamily: '"IBM Plex Sans", sans-serif' }}
                    placeholder="Short description of this server (optional)"
                    value={state.desc}
                    onChange={(e) => updateState("desc", e.target.value)}
                  />
                  <p className="text-[11px] text-zinc-500 mt-2 mb-7 font-mono">Helps your team identify this instance later.</p>

                  <label className="flex items-center justify-between text-sm text-zinc-400 mb-2.5">
                    <span className="flex items-center gap-2">
                      <Cpu className="w-4 h-4 text-purple-400" /> Execution Runtime
                    </span>
                    {!isDevPanel ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-[10px] font-mono font-medium uppercase tracking-wider bg-amber-500/10 text-amber-400 border border-amber-500/25">
                        <Lock className="w-3 h-3" /> Main Panel (Locked)
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-[10px] font-mono font-medium uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/25">
                        <SlidersHorizontal className="w-3 h-3" /> Dev Panel (Unlocked)
                      </span>
                    )}
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <button
                      type="button"
                      disabled={!isDevPanel}
                      onClick={() => { if (isDevPanel) updateState("runtimeType", "docker"); }}
                      className={`sel-card p-4 text-left flex flex-col justify-between transition-all ${
                        state.runtimeType === "docker" ? "selected" : ""
                      } ${
                        !isDevPanel
                          ? state.runtimeType === "docker"
                            ? "cursor-not-allowed opacity-95 !border-purple-500/40"
                            : "cursor-not-allowed opacity-35 filter grayscale pointer-events-none border-dashed !border-purple-500/15"
                          : "cursor-pointer"
                      }`}
                    >
                      <span className="tick"><Check className="w-3 h-3 stroke-[3]" /></span>
                      <div>
                        <div className="font-display font-bold text-sm text-white flex items-center gap-2">
                          Docker Container
                          {state.runtimeType === "docker" && (
                            <span className={`text-[9px] px-1.5 py-0.5 rounded font-mono uppercase flex items-center gap-1 ${
                              !isDevPanel
                                ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                                : "bg-purple-500 text-white shadow-md shadow-purple-600/40"
                            }`}>
                              {!isDevPanel && <Lock className="w-2.5 h-2.5" />}
                              {isDevPanel ? "Active" : "Installed"}
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-zinc-500 mt-1">
                          Isolated sandbox environment with full resource limits and terminal support.
                        </div>
                      </div>
                    </button>

                    <button
                      type="button"
                      disabled={!isDevPanel}
                      onClick={() => { if (isDevPanel) updateState("runtimeType", "local"); }}
                      className={`sel-card p-4 text-left flex flex-col justify-between transition-all ${
                        state.runtimeType === "local" ? "selected" : ""
                      } ${
                        !isDevPanel
                          ? state.runtimeType === "local"
                            ? "cursor-not-allowed opacity-95 !border-amber-500/40"
                            : "cursor-not-allowed opacity-35 filter grayscale pointer-events-none border-dashed !border-purple-500/15"
                          : "cursor-pointer"
                      }`}
                    >
                      <span className="tick"><Check className="w-3 h-3 stroke-[3]" /></span>
                      <div>
                        <div className="font-display font-bold text-sm text-white flex items-center gap-2">
                          Local Process (Node.js)
                          {state.runtimeType === "local" && (
                            <span className={`text-[9px] px-1.5 py-0.5 rounded font-mono uppercase flex items-center gap-1 ${
                              !isDevPanel
                                ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                                : "bg-amber-500 text-black"
                            }`}>
                              {!isDevPanel && <Lock className="w-2.5 h-2.5" />}
                              {isDevPanel ? "Active" : "Installed"}
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-zinc-500 mt-1">
                          Direct system process execution. Ideal for environments without Docker daemon.
                        </div>
                      </div>
                    </button>
                  </div>
                  {!isDevPanel ? (
                    <div className="mt-2.5 p-3 rounded-xl bg-black/40 border border-amber-500/25 text-[11px] text-zinc-400 flex items-start gap-2.5 font-mono backdrop-blur-sm">
                      <Lock className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                      <div>
                        <span className="text-zinc-200 font-semibold">Fixed Installation Runtime:</span>
                        <p className="mt-0.5 text-zinc-400 leading-relaxed">
                          Runtime selection is disabled on Main Panel (locked to <strong className="text-amber-300 uppercase">{state.runtimeType === "local" ? "Local Process" : "Docker Container"}</strong>). Change via reinstall or Developer Panel.
                        </p>
                      </div>
                    </div>
                  ) : (
                    <p className="text-[11px] text-zinc-500 mt-2 font-mono">Select how this unit will be executed on the host.</p>
                  )}
                </div>
              )}

              {/* STEP 2: RESOURCES */}
              {currentStep === 1 && (
                <div className="step-content">
                  <div className="flex items-center gap-3 mb-6">
                    <span className="font-mono text-xs text-purple-500 bg-purple-500/10 border border-purple-500/30 px-2 py-0.5 rounded">02</span>
                    <h2 className="font-display font-bold tracking-wide text-sm text-white">RESOURCES</h2>
                    <span className="flex-1 h-px bg-gradient-to-r from-purple-500/30 to-transparent"></span>
                  </div>

                  <label className="flex items-center gap-2 text-sm text-zinc-400 mb-4">
                    <MemoryStickIcon className="w-4 h-4 text-purple-400" /> RAM Allocation (GB)
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {RAM.map(r => (
                      <button
                        key={r.v}
                        type="button"
                        onClick={() => handleRamClick(r.v)}
                        className={`sel-card p-4 text-left ${r.v === state.ram ? "selected" : ""}`}
                      >
                        <span className="tick"><Check className="w-3 h-3 stroke-[3]" /></span>
                        <div className="font-display font-bold text-2xl text-white">
                          {r.v}<span className="text-sm text-zinc-500 ml-1">GB</span>
                        </div>
                        <div className="text-[11px] text-zinc-500 mt-1.5 leading-snug">{r.label}</div>
                      </button>
                    ))}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-8">
                    <div>
                      <label className="flex items-center gap-2 text-sm text-zinc-400 mb-2.5">
                        <Cpu className="w-4 h-4 text-purple-400" /> CPU Limit (%)
                      </label>
                      <div className="flex gap-2.5">
                        <div className="relative flex-1">
                          <input
                            type="number" min="10"
                            className="inp font-mono pr-10"
                            value={state.cpu}
                            onChange={(e) => { updateState("cpu", Number(e.target.value)); updateState("auto", false); }}
                          />
                          <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-purple-400/60 font-mono text-sm">%</span>
                        </div>
                        <button
                          type="button"
                          onClick={handleAutoToggle}
                          className={`px-4 py-3 font-display font-bold text-sm tracking-widest transition-all flex items-center gap-2 whitespace-nowrap border rounded-lg ${
                            state.auto
                              ? "bg-gradient-to-br from-purple-500 to-purple-700 text-white border-purple-400/60 shadow-lg shadow-purple-600/50"
                              : "bg-transparent text-zinc-400 border-purple-500/25 hover:border-purple-500/50"
                          }`}
                        >
                          {state.auto ? <><Zap className="w-4 h-4" /> AUTO</> : <><SlidersHorizontal className="w-4 h-4" /> MANUAL</>}
                        </button>
                      </div>
                      <p className={`text-[11px] mt-2.5 font-mono flex items-center gap-1.5 ${state.auto ? "text-purple-400" : "text-zinc-500"}`}>
                        {state.auto
                          ? <><Sparkles className="w-3.5 h-3.5" /> Auto-optimized for {state.ram}GB</>
                          : <><SlidersHorizontal className="w-3.5 h-3.5" /> Manual override active</>
                        }
                      </p>
                    </div>

                    <div>
                      <label className="flex items-center gap-2 text-sm text-zinc-400 mb-2.5">
                        <HardDrive className="w-4 h-4 text-purple-400" /> Disk Limit (GB)
                      </label>
                      <input
                        type="number" min="1"
                        className="inp font-mono"
                        value={state.disk}
                        onChange={(e) => updateState("disk", Number(e.target.value))}
                      />
                      <p className="text-[11px] text-zinc-500 mt-2.5 font-mono flex items-center gap-1.5">
                        <Info className="w-3.5 h-3.5" /> Storage space allocated to this server.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 3: NETWORK & ACCESS */}
              {currentStep === 2 && (
                <div className="step-content">
                  <div className="flex items-center gap-3 mb-6">
                    <span className="font-mono text-xs text-purple-500 bg-purple-500/10 border border-purple-500/30 px-2 py-0.5 rounded">03</span>
                    <h2 className="font-display font-bold tracking-wide text-sm text-white">NETWORK & ACCESS</h2>
                    <span className="flex-1 h-px bg-gradient-to-r from-purple-500/30 to-transparent"></span>
                  </div>

                  <label className="flex items-center gap-2 text-sm text-zinc-400 mb-2.5">
                    <Network className="w-4 h-4 text-purple-400" /> Server Port
                  </label>
                  <div className="relative mb-4">
                    <input
                      type="number"
                      className={`inp font-mono ${
                        portStatus === "used" || portStatus === "invalid" || portStatus === "error"
                          ? "!border-red-500/60"
                          : portStatus === "available"
                          ? "!border-emerald-500/60"
                          : ""
                      }`}
                      placeholder="25565"
                      value={state.port || ""}
                      onChange={e => updateState("port", e.target.value ? Number(e.target.value) : "")}
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 font-mono text-[10px] tracking-widest flex items-center">
                      {portStatus === "checking" && <span className="text-purple-400 animate-pulse">CHECKING...</span>}
                      {portStatus === "available" && <span className="text-emerald-400 flex items-center gap-1"><Check className="w-3 h-3" /> AVAILABLE</span>}
                      {portStatus === "used" && <span className="text-red-400">IN USE</span>}
                      {portStatus === "invalid" && <span className="text-red-400">INVALID</span>}
                      {portStatus === "error" && <span className="text-red-400">ERROR</span>}
                    </div>
                  </div>
                  <p className="text-[11px] text-zinc-500 -mt-2 mb-8 font-mono">
                    {portStatus === "used"
                      ? "This port is already in use."
                      : portStatus === "invalid"
                      ? "Port must be between 1 and 65535."
                      : portStatus === "error"
                      ? "Could not verify this port. Try again."
                      : "The main port the server will bind to. Must not be in use."}
                  </p>

                  <label className="flex items-center gap-2 text-sm text-zinc-400 mb-2.5">
                    <Globe className="w-4 h-4 text-purple-400" /> IP Alias
                  </label>
                  <input
                    type="text" className="inp font-mono" placeholder="play.example.com"
                    value={state.ip} onChange={e => updateState("ip", e.target.value)}
                  />
                  <p className="text-[11px] text-zinc-500 mt-2 mb-8 font-mono">Optional custom domain or subdomain used to access your server.</p>

                  {(user?.role === "admin" || user?.role === "owner") && (
                    <>
                      <label className="flex items-center gap-2 text-sm text-zinc-400 mb-2.5">
                        <User className="w-4 h-4 text-purple-400" /> Assign Server Owner
                      </label>
                      <CustomDropdown
                        value={state.owner}
                        options={users.map(u => ({ v: u.id, name: u.username, tag: u.role, role: u.role }))}
                        onChange={(v: string) => updateState("owner", v)}
                        placeholder="Select an owner..."
                        renderValue={(o: any) => (
                          <>
                            <span className="w-8 h-8 rounded-lg border border-purple-500/30 bg-gradient-to-br from-purple-600/30 to-purple-700/20 flex items-center justify-center font-display font-bold text-[11px] text-purple-200 shrink-0">
                              {getInitials(o.name)}
                            </span>
                            <span className="truncate text-white font-mono text-sm">{o.name} <span className="text-zinc-500">({o.tag})</span></span>
                          </>
                        )}
                        renderOption={(o: any, sel: boolean) => (
                          <button type="button" className={`w-full flex items-center gap-3 px-3 py-2.5 transition-colors rounded ${sel ? "bg-purple-500/15" : "hover:bg-purple-500/8"}`}>
                            <span className="w-8 h-8 rounded-lg border border-purple-500/30 bg-gradient-to-br from-purple-600/30 to-purple-700/20 flex items-center justify-center font-display font-bold text-[11px] text-purple-200 shrink-0">
                              {getInitials(o.name)}
                            </span>
                            <span className="flex-1 text-left font-mono">
                              <span className="block text-sm text-white">{o.name} <span className="text-zinc-500">({o.tag})</span></span>
                              <span className="block text-[11px] text-zinc-500">{o.role}</span>
                            </span>
                            {sel && <Check className="w-4 h-4 text-purple-400" />}
                          </button>
                        )}
                      />
                      <p className="text-[11px] text-zinc-500 mt-2 mb-8 font-mono">Select which user owns and has access to this server.</p>

                      <label className="flex items-center gap-2 text-sm text-zinc-400 mb-2.5">
                        <Radio className="w-4 h-4 text-purple-400" /> Deployment Node
                      </label>
                      <CustomDropdown
                        value={state.node}
                        options={nodes.map(n => ({ v: n.id, label: n.name + " (" + n.ip + ")" }))}
                        onChange={(v: string) => updateState("node", v)}
                        placeholder="Select a node..."
                        renderValue={(o: any) => (
                          <>
                            <Radio className="w-4 h-4 text-purple-400 shrink-0" />
                            <span className="text-white truncate font-mono text-sm">{o.label}</span>
                          </>
                        )}
                        renderOption={(o: any, sel: boolean) => (
                          <button type="button" className={`w-full flex items-center justify-between px-3 py-2.5 font-mono text-sm transition-colors rounded ${sel ? "text-white bg-purple-500/15" : "text-zinc-400 hover:bg-purple-500/8"}`}>
                            <span>{o.label}</span>
                            {sel && <Check className="w-4 h-4 text-purple-400" />}
                          </button>
                        )}
                      />
                      <p className="text-[11px] text-zinc-500 mt-2 font-mono">Physical node this container will be deployed to.</p>
                    </>
                  )}
                </div>
              )}

              {/* STEP 4: SOFTWARE */}
              {currentStep === 3 && (
                <div className="step-content space-y-6">
                  <div>
                    <div className="flex items-center gap-3 mb-4">
                      <span className="font-mono text-xs text-purple-500 bg-purple-500/10 border border-purple-500/30 px-2 py-0.5 rounded">04A</span>
                      <h2 className="font-display font-bold tracking-wide text-sm text-white">MINECRAFT ENGINES</h2>
                      <span className="flex-1 h-px bg-gradient-to-r from-purple-500/30 to-transparent"></span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                      {MINECRAFT_SOFTWARE.map(s => {
                        const Icon = s.icon;
                        return (
                          <button
                            key={s.id}
                            type="button"
                            onClick={() => updateState("software", s.id)}
                            className={`sel-card soft-card p-4 flex flex-col items-center text-center ${state.software === s.id ? "selected" : ""}`}
                          >
                            <span className="tick"><Check className="w-3 h-3 stroke-[3]" /></span>
                            <Icon className="ic w-6 h-6 mb-2.5" />
                            <span className="font-display font-semibold text-sm text-white">{s.name}</span>
                            <span className="text-[10px] text-zinc-500 mt-1 leading-tight">{s.desc}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center gap-3 mb-4">
                      <span className="font-mono text-xs text-purple-500 bg-purple-500/10 border border-purple-500/30 px-2 py-0.5 rounded">04B</span>
                      <h2 className="font-display font-bold tracking-wide text-sm text-white">APPLICATION RUNTIMES</h2>
                      <span className="text-[10px] font-mono uppercase bg-purple-500/15 border border-purple-500/30 px-2 py-0.5 rounded text-purple-300 tracking-widest">Non-MC</span>
                      <span className="flex-1 h-px bg-gradient-to-r from-purple-500/30 to-transparent"></span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {APPLICATION_SOFTWARE.map(s => {
                        const Icon = s.icon;
                        return (
                          <button
                            key={s.id}
                            type="button"
                            onClick={() => updateState("software", s.id)}
                            className={`sel-card soft-card p-4 flex items-center gap-4 text-left ${state.software === s.id ? "selected" : ""}`}
                          >
                            <span className="tick"><Check className="w-3 h-3 stroke-[3]" /></span>
                            <div className="w-10 h-10 rounded-lg bg-purple-500/10 border border-purple-500/25 flex items-center justify-center shrink-0">
                              <Icon className="ic w-5 h-5 text-purple-300" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="font-display font-semibold text-sm text-white">{s.name}</span>
                                <span className="text-[9px] font-mono bg-purple-500/20 text-purple-300 border border-purple-500/30 px-1.5 py-0.5 rounded">Standalone</span>
                              </div>
                              <span className="text-[11px] text-zinc-500 block mt-0.5 leading-snug">{s.desc}</span>
                            </div>
                          </button>
                        );
                      })}
                    </div>

                    {!isMinecraftSoftware && (
                      <div className="mt-3 p-3 bg-purple-500/[0.06] border border-purple-500/20 rounded-lg flex items-start gap-2.5 backdrop-blur-sm">
                        <Info className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                        <p className="text-xs text-zinc-400 font-mono leading-relaxed">
                          Standalone runtime selected: Minecraft features disabled. Upload code files (<span className="text-purple-300">index.js</span> or <span className="text-purple-300">main.py</span>) via File Manager and start them in Console.
                        </p>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="flex items-center gap-2 text-sm text-zinc-400 mb-2.5">
                      <GitBranch className="w-4 h-4 text-purple-400" /> {isMinecraftSoftware ? "Software Version" : "Runtime Version"}
                    </label>

                    <CategorizedVersionDropdown
                      value={state.version}
                      onChange={(v: string) => updateState("version", v)}
                      versions={versions}
                      software={state.software}
                      placeholder="Select a version..."
                    />
                    {isMinecraftSoftware && (
                      <div className="mt-2.5 flex items-center gap-1.5 text-xs text-emerald-400 font-mono bg-emerald-500/8 px-2.5 py-1.5 rounded-lg border border-emerald-500/15">
                        <Sparkles className="w-3.5 h-3.5 shrink-0 text-emerald-400" />
                        <span>Java Auto-detect: <strong>Java {safeJavaVersion(state.version, state.software)}</strong> will be auto-provisioned</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* STEP 5: REVIEW */}
              {currentStep === 4 && (
                <div className="step-content">
                  <div className="flex items-center gap-3 mb-6">
                    <span className="font-mono text-xs text-purple-500 bg-purple-500/10 border border-purple-500/30 px-2 py-0.5 rounded">05</span>
                    <h2 className="font-display font-bold tracking-wide text-sm text-white">FINAL SPECIFICATION</h2>
                    <span className="flex-1 h-px bg-gradient-to-r from-purple-500/30 to-transparent"></span>
                  </div>

                  {!deployed && deployProgress === 0 && (
                    <div className="font-mono text-[13px] divide-y divide-purple-500/15 border border-purple-500/25 bg-black/40 rounded-lg backdrop-blur-sm overflow-hidden">
                      {renderReviewRow("INSTANCE", state.name || "—")}
                      {renderReviewRow("RUNTIME", state.runtimeType === "local" ? "Local Process (Beta)" : "Docker")}
                      {renderReviewRow("DESCRIPTION", state.desc || "—")}
                      {renderReviewRow("PORT", String(state.port))}
                      {renderReviewRow("RAM", state.ram + " GB")}
                      {renderReviewRow("CPU " + (state.auto ? "(AUTO)" : "(MANUAL)"), state.cpu + " %")}
                      {renderReviewRow("DISK", state.disk + " GB")}
                      {renderReviewRow("IP ALIAS", state.ip || "—")}
                      {(user?.role === "admin" || user?.role === "owner") && renderReviewRow("OWNER ID", state.owner || "—")}
                      {(user?.role === "admin" || user?.role === "owner") && renderReviewRow("NODE ID", state.node || "—")}
                      {renderReviewRow("SOFTWARE", SOFTWARE.find(s => s.id === state.software)?.name || "Unknown")}
                      {renderReviewRow("VERSION", state.version || "latest")}
                      {isMinecraftSoftware && renderReviewRow("JAVA RUNTIME", `Java ${safeJavaVersion(state.version, state.software)} (Auto)`)}
                    </div>
                  )}

                  {deployProgress > 0 && !deployed && (
                    <div className="mt-6 border border-purple-500/30 bg-black/40 backdrop-blur-sm p-4 rounded-lg">
                      <div className="flex justify-between items-center mb-2.5">
                        <span className="text-sm font-mono text-zinc-400 flex items-center gap-2">
                          <Activity className="w-3.5 h-3.5 text-purple-400 animate-pulse" />
                          Provisioning container...
                        </span>
                        <span className="text-sm font-mono text-purple-300 font-bold">{Math.round(deployProgress)}%</span>
                      </div>
                      <div className="w-full bg-black/60 h-2 overflow-hidden rounded-full border border-purple-500/25">
                        <div
                          className="h-full bg-gradient-to-r from-purple-600 via-purple-500 to-purple-400 transition-all duration-300 rounded-full shadow-[0_0_15px_rgba(168,85,247,.9)]"
                          style={{ width: `${deployProgress}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {deployed && (
                    <div className="mt-6 border-2 border-purple-500/60 bg-gradient-to-br from-purple-600/20 to-purple-800/10 backdrop-blur-sm p-6 text-center rounded-xl shadow-[0_0_50px_rgba(168,85,247,.5)]">
                      <div className="w-14 h-14 mx-auto mb-3 bg-gradient-to-br from-purple-500 to-purple-700 text-white flex items-center justify-center rounded-xl shadow-lg shadow-purple-600/60 border border-purple-400/40">
                        <Check className="w-7 h-7 stroke-[3]" />
                      </div>
                      <p className="font-display font-bold text-lg text-white">Instance Deployed</p>
                      <p className="text-purple-300 text-sm mt-1 font-mono">
                        {state.name} → {state.ram}GB
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* NAV */}
            <div className="flex items-center justify-between gap-3 mt-9 pt-7 border-t border-purple-500/20">
              <button
                type="button"
                onClick={() => { if (currentStep > 0) showStep(currentStep - 1); }}
                disabled={currentStep === 0 || deployed || deployProgress > 0}
                className="btn-ghost px-5 py-3 text-sm font-medium flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" /> BACK
              </button>

              <span className="font-mono text-[11px] tracking-widest text-purple-400/60 hidden sm:block">
                STEP {currentStep + 1} / {STEPS.length}
              </span>

              <button
                type="button"
                onClick={handleNext}
                disabled={deployed || deployProgress > 0}
                className="btn-primary px-7 py-3 text-sm font-display font-bold tracking-widest flex items-center gap-2"
              >
                <span>
                  {currentStep === STEPS.length - 1
                    ? (deployed ? "DEPLOYED" : "LAUNCH")
                    : "NEXT"}
                </span>
                {currentStep === STEPS.length - 1
                  ? <Rocket className="w-4 h-4" />
                  : <ArrowLeft className="w-4 h-4 rotate-180" />
                }
              </button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   EXPORT — wrapped in ErrorBoundary so it never blanks
   ═══════════════════════════════════════════════════════════════ */
export default function CreateServer() {
  return (
    <DeployErrorBoundary>
      <CreateServerInner />
    </DeployErrorBoundary>
  );
}