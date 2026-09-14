import React, { useEffect, useState } from "react";
import { LoadingOverlay } from "../components/LoadingOverlay";
import axios from "axios";
import {
  Save,
  AlertTriangle,
  RefreshCw,
  Settings,
  Hexagon,
  Sparkles,
  Sliders,
  ChevronRight,
  Server,
  Hash
} from "lucide-react";

// ============================================
// AstroWax Panel V1.80 — Server Properties
// Glass + Purple Theme
// ============================================

interface Properties {
  [key: string]: string;
}

const COMMON_PROPERTIES = [
  { key: 'online-mode', type: 'boolean', label: 'Online Mode (Premium)' },
  { key: 'pvp', type: 'boolean', label: 'Player vs Player (PvP)' },
  { key: 'hardcore', type: 'boolean', label: 'Hardcore' },
  { key: 'allow-flight', type: 'boolean', label: 'Allow Flight' },
  { key: 'enable-command-block', type: 'boolean', label: 'Enable Command Blocks' },
  { key: 'gamemode', type: 'select', options: ['survival', 'creative', 'adventure', 'spectator'], label: 'Game Mode' },
  { key: 'difficulty', type: 'select', options: ['peaceful', 'easy', 'normal', 'hard'], label: 'Difficulty' },
  { key: 'max-players', type: 'number', label: 'Max Players' },
  { key: 'motd', type: 'text', label: 'MOTD (Message of the Day)' },
  { key: 'view-distance', type: 'number', label: 'View Distance' }
];

export default function ServerProperties({ serverId }: { serverId: string }) {
  const [properties, setProperties] = useState<Properties>({});
  const [originalContent, setOriginalContent] = useState<string>("");
  const [exists, setExists] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadProperties = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`/api/servers/${serverId}/files?path=server.properties`);
      if (res.data.isFile) {
        setOriginalContent(res.data.content);
        const parsed = parseProperties(res.data.content);
        setProperties(parsed);
        setExists(true);
      } else {
        setExists(false);
      }
    } catch (e) {
      setExists(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProperties();
  }, [serverId]);

  const parseProperties = (content: string): Properties => {
    const lines = content.split('\n');
    const parsed: Properties = {};
    for (const line of lines) {
      if (line.startsWith('#') || !line.trim()) continue;
      const index = line.indexOf('=');
      if (index === -1) continue;
      const key = line.substring(0, index).trim();
      const value = line.substring(index + 1).trim();
      parsed[key] = value;
    }
    return parsed;
  };

  const serializeProperties = (currentProps: Properties, originalText: string): string => {
    const lines = originalText.split('\n');
    const updatedKeys = new Set<string>();

    const updatedLines = lines.map(line => {
      if (line.startsWith('#') || !line.trim()) return line;
      const index = line.indexOf('=');
      if (index === -1) return line;
      const key = line.substring(0, index).trim();

      if (currentProps[key] !== undefined) {
        updatedKeys.add(key);
        return `${key}=${currentProps[key]}`;
      }
      return line;
    });

    for (const [key, value] of Object.entries(currentProps)) {
      if (!updatedKeys.has(key)) {
        updatedLines.push(`${key}=${value}`);
      }
    }

    return updatedLines.join('\n');
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      const newContent = serializeProperties(properties, originalContent);
      await axios.post(`/api/servers/${serverId}/files/save`, {
        filePath: 'server.properties',
        content: newContent
      });
      setOriginalContent(newContent);
      alert('Properties saved successfully! You may need to restart the server for changes to take effect.');
    } catch (e) {
      alert('Failed to save properties.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleChange = (key: string, value: string) => {
    setProperties(prev => ({ ...prev, [key]: value }));
  };

  const advancedKeys = Object.keys(properties).filter(
    k => !COMMON_PROPERTIES.find(cp => cp.key === k)
  );

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <style dangerouslySetInnerHTML={{__html: `
          @keyframes awSpin { to { transform: rotate(360deg); } }
          .aw-spin-ring { animation: awSpin 1.4s linear infinite; }
          .aw-spin-ring-rev { animation: awSpin 1s linear infinite reverse; }
        `}} />
        <div className="flex flex-col items-center gap-4">
          <div className="relative w-14 h-14">
            <div
              className="absolute inset-0 rounded-full"
              style={{ border: '2px solid rgba(168,85,247,.15)' }}
            />
            <div
              className="absolute inset-0 rounded-full aw-spin-ring"
              style={{
                border: '2px solid transparent',
                borderTopColor: '#a855f7',
                borderRightColor: '#c084fc',
                filter: 'drop-shadow(0 0 6px rgba(168,85,247,.6))',
              }}
            />
            <div
              className="absolute inset-2 rounded-full aw-spin-ring-rev"
              style={{
                border: '2px solid transparent',
                borderBottomColor: '#7e22ce',
                opacity: 0.7,
              }}
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <Hexagon className="w-5 h-5" style={{ color: '#c084fc' }} />
            </div>
          </div>
          <span
            className="text-[10px] font-mono uppercase tracking-widest"
            style={{ color: '#c084fc' }}
          >
            Loading properties...
          </span>
        </div>
      </div>
    );
  }

  if (!exists) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
        <div
          className="w-20 h-20 rounded-2xl flex items-center justify-center mb-5"
          style={{
            background: 'linear-gradient(135deg, rgba(245,158,11,.15), rgba(245,158,11,.05))',
            border: '1px solid rgba(245,158,11,.4)',
            boxShadow: '0 0 40px -8px rgba(245,158,11,.4)',
          }}
        >
          <AlertTriangle className="w-10 h-10" style={{ color: '#fbbf24' }} />
        </div>
        <h3 className="text-lg font-bold mb-2" style={{ color: '#fcd34d' }}>
          server.properties Not Found
        </h3>
        <p className="text-sm max-w-md leading-relaxed" style={{ color: 'rgba(252,211,77,.75)' }}>
          The property file does not exist yet. Please start the server at least once to generate the server.properties file.
        </p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto aw-sp-scroll p-4 md:p-6">
      <style dangerouslySetInnerHTML={{__html: `
        .aw-sp-glass {
          background: linear-gradient(135deg, rgba(20,12,35,.55) 0%, rgba(13,8,25,.7) 100%);
          backdrop-filter: blur(16px) saturate(1.4);
          -webkit-backdrop-filter: blur(16px) saturate(1.4);
          border: 1px solid rgba(168,85,247,.2);
          border-radius: 16px;
          position: relative;
          overflow: hidden;
        }
        .aw-sp-glass::before {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(168,85,247,.5), rgba(255,255,255,.2), rgba(168,85,247,.5), transparent);
          pointer-events: none;
          z-index: 2;
        }

        .aw-sp-card {
          transition: all .3s cubic-bezier(.16,1,.3,1);
        }
        .aw-sp-card:hover {
          border-color: rgba(168,85,247,.4);
          box-shadow: 0 0 32px -8px rgba(168,85,247,.3);
          transform: translateY(-2px);
        }

        .aw-sp-btn {
          transition: all .25s cubic-bezier(.16,1,.3,1);
        }
        .aw-sp-btn:hover:not(:disabled) {
          transform: translateY(-1px);
        }
        .aw-sp-btn:active:not(:disabled) {
          transform: translateY(0) scale(.97);
        }

        .aw-sp-scroll::-webkit-scrollbar { width: 8px; }
        .aw-sp-scroll::-webkit-scrollbar-track { background: rgba(0,0,0,.3); }
        .aw-sp-scroll::-webkit-scrollbar-thumb {
          background: linear-gradient(180deg, #a855f7, #7e22ce);
          border-radius: 4px;
        }
        .aw-sp-scroll::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(180deg, #c084fc, #a855f7);
        }

        .aw-sp-input {
          transition: all .25s cubic-bezier(.16,1,.3,1);
        }
        .aw-sp-input:focus {
          outline: none;
          border-color: rgba(168,85,247,.6) !important;
          box-shadow: 0 0 0 3px rgba(168,85,247,.1), 0 0 20px -4px rgba(168,85,247,.4);
        }
        .aw-sp-input::placeholder { color: rgba(161,161,170,.5); }

        /* Select option styling */
        .aw-sp-select option {
          background: #0d0819;
          color: #e9d5ff;
        }

        @keyframes awSpIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .aw-sp-in { animation: awSpIn .4s cubic-bezier(.16,1,.3,1) both; }
      `}} />

      <div className="max-w-4xl mx-auto">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 aw-sp-in">
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
                <Settings className="w-5 h-5" style={{ color: '#c084fc' }} />
              </span>
              Properties
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
            <p
              className="text-[11px] mt-1.5 font-mono uppercase tracking-widest flex items-center gap-1.5"
              style={{ color: '#c084fc' }}
            >
              <Sparkles size={11} />
              Configure core server rules and settings
            </p>
          </div>

          <button
            onClick={handleSave}
            disabled={isSaving}
            className="aw-sp-btn px-5 py-2.5 rounded-xl font-bold flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm shrink-0"
            style={{
              background: 'linear-gradient(135deg, #a855f7, #7e22ce)',
              boxShadow: '0 4px 20px -4px rgba(168,85,247,.6)',
            }}
          >
            {isSaving ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Save Changes
              </>
            )}
          </button>
        </div>

        {/* Common Properties Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {COMMON_PROPERTIES.map((prop, idx) => (
            <div
              key={prop.key}
              className="aw-sp-card aw-sp-glass aw-sp-in p-5"
              style={{ animationDelay: `${idx * 0.03}s` }}
            >
              <div className="flex items-center justify-between mb-3 gap-3">
                <label
                  className="text-[11px] font-bold uppercase tracking-widest flex-1 min-w-0"
                  style={{ color: '#c084fc' }}
                >
                  {prop.label}
                </label>
                {prop.type === 'boolean' && (
                  <button
                    onClick={() => handleChange(prop.key, properties[prop.key] === 'true' ? 'false' : 'true')}
                    className="aw-sp-btn relative inline-flex h-6 w-11 items-center rounded-full shrink-0"
                    style={{
                      background: properties[prop.key] === 'true'
                        ? 'linear-gradient(135deg, #a855f7, #7e22ce)'
                        : 'rgba(0,0,0,.5)',
                      border: properties[prop.key] === 'true'
                        ? '1px solid rgba(168,85,247,.6)'
                        : '1px solid rgba(168,85,247,.2)',
                      boxShadow: properties[prop.key] === 'true'
                        ? '0 0 16px -2px rgba(168,85,247,.7), inset 0 1px 0 rgba(255,255,255,.2)'
                        : 'none',
                    }}
                  >
                    <span
                      className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform"
                      style={{
                        transform: properties[prop.key] === 'true' ? 'translateX(24px)' : 'translateX(4px)',
                        boxShadow: '0 2px 4px rgba(0,0,0,.4)',
                      }}
                    />
                  </button>
                )}
              </div>

              {prop.type === 'select' && (
                <select
                  value={properties[prop.key] || ''}
                  onChange={(e) => handleChange(prop.key, e.target.value)}
                  className="aw-sp-input aw-sp-select w-full rounded-xl px-4 py-2.5 text-sm font-medium"
                  style={{
                    background: 'rgba(0,0,0,.5)',
                    border: '1px solid rgba(168,85,247,.25)',
                    color: '#e9d5ff',
                    cursor: 'pointer',
                  }}
                >
                  {prop.options?.map(opt => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              )}

              {prop.type === 'number' && (
                <input
                  type="number"
                  value={properties[prop.key] || ''}
                  onChange={(e) => handleChange(prop.key, e.target.value)}
                  className="aw-sp-input w-full rounded-xl px-4 py-2.5 text-sm font-medium"
                  style={{
                    background: 'rgba(0,0,0,.5)',
                    border: '1px solid rgba(168,85,247,.25)',
                    color: '#e9d5ff',
                    caretColor: '#c084fc',
                  }}
                />
              )}

              {prop.type === 'text' && (
                <input
                  type="text"
                  value={properties[prop.key] || ''}
                  onChange={(e) => handleChange(prop.key, e.target.value)}
                  className="aw-sp-input w-full rounded-xl px-4 py-2.5 text-sm font-medium"
                  style={{
                    background: 'rgba(0,0,0,.5)',
                    border: '1px solid rgba(168,85,247,.25)',
                    color: '#e9d5ff',
                    caretColor: '#c084fc',
                  }}
                />
              )}

              <p
                className="text-[10px] mt-3 font-mono flex items-center gap-1"
                style={{ color: 'rgba(168,85,247,.55)' }}
              >
                <Hash size={9} />
                {prop.key}
              </p>
            </div>
          ))}
        </div>

        {/* Advanced Properties */}
        {advancedKeys.length > 0 && (
          <div className="mt-8 aw-sp-in" style={{ animationDelay: '.35s' }}>
            <h3
              className="text-base font-bold tracking-tight mb-4 flex items-center gap-2"
              style={{ color: '#e9d5ff' }}
            >
              <Sliders className="w-4 h-4" style={{ color: '#c084fc' }} />
              Advanced Properties
              <span
                className="px-2 py-0.5 rounded-md font-mono text-[10px]"
                style={{
                  background: 'rgba(168,85,247,.15)',
                  border: '1px solid rgba(168,85,247,.3)',
                  color: '#c084fc',
                }}
              >
                {advancedKeys.length}
              </span>
            </h3>

            <div className="aw-sp-glass p-4 md:p-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {advancedKeys.map((key, idx) => (
                  <div
                    key={key}
                    className="flex flex-col aw-sp-in"
                    style={{ animationDelay: `${0.35 + idx * 0.02}s` }}
                  >
                    <label
                      className="text-[10px] mb-1.5 font-mono uppercase tracking-wider flex items-center gap-1"
                      style={{ color: 'rgba(192,132,252,.7)' }}
                    >
                      <Hash size={8} />
                      {key}
                    </label>
                    <input
                      type="text"
                      value={properties[key]}
                      onChange={(e) => handleChange(key, e.target.value)}
                      className="aw-sp-input w-full rounded-lg px-3 py-2 text-sm font-mono"
                      style={{
                        background: 'rgba(0,0,0,.5)',
                        border: '1px solid rgba(168,85,247,.2)',
                        color: '#e9d5ff',
                        caretColor: '#c084fc',
                      }}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Footer info */}
        <div
          className="mt-6 p-3.5 rounded-xl flex items-start gap-2.5 text-xs aw-sp-in"
          style={{
            background: 'rgba(251,191,36,.08)',
            border: '1px solid rgba(251,191,36,.25)',
            color: 'rgba(251,191,36,.9)',
            animationDelay: '.5s',
          }}
        >
          <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>
            Changes to <code className="font-mono px-1 py-0.5 rounded" style={{ background: 'rgba(251,191,36,.15)' }}>server.properties</code> require a server restart to take effect. Save changes before restarting.
          </span>
        </div>
      </div>

      {isSaving && <LoadingOverlay message="Saving server properties..." />}
    </div>
  );
}