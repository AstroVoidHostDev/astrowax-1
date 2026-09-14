import React, { useState, useRef, useEffect, useMemo } from "react";
import {
  ChevronDown,
  ChevronRight,
  Search,
  Check,
  GitBranch,
  Sparkles,
  Folder,
  FolderOpen,
  Hexagon
} from "lucide-react";

// ============================================
// AstroWax Panel V1.80 — Categorized Version Dropdown
// Glass + Purple Theme
// ============================================

export interface CategorizedVersionDropdownProps {
  value: string;
  onChange: (value: string) => void;
  versions: string[];
  software?: string;
  disabled?: boolean;
  className?: string;
  placeholder?: string;
}

interface VersionCategory {
  id: string;
  label: string;
  badge?: string;
  isLatest?: boolean;
  versions: string[];
}

export default function CategorizedVersionDropdown({
  value,
  onChange,
  versions = [],
  software = "paper",
  disabled = false,
  className = "",
  placeholder = "Select Version..."
}: CategorizedVersionDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const isMinecraft = useMemo(() => {
    const s = (software || "").toLowerCase();
    return !["nodejs", "node", "python", "python3"].includes(s);
  }, [software]);

  const categories: VersionCategory[] = useMemo(() => {
    if (!isMinecraft || versions.length === 0) {
      return [];
    }

    const cat26: string[] = [];
    const cat21: string[] = [];
    const cat20: string[] = [];
    const cat19: string[] = [];
    const cat18: string[] = [];
    const cat17: string[] = [];
    const cat16: string[] = [];
    const cat15: string[] = [];
    const cat14: string[] = [];
    const cat13: string[] = [];
    const cat12: string[] = [];
    const legacy: string[] = [];

    const cleanVersions = versions.filter(v => v !== "latest");

    cleanVersions.forEach(v => {
      if (v.startsWith("26.")) cat26.push(v);
      else if (v.startsWith("1.21")) cat21.push(v);
      else if (v.startsWith("1.20")) cat20.push(v);
      else if (v.startsWith("1.19")) cat19.push(v);
      else if (v.startsWith("1.18")) cat18.push(v);
      else if (v.startsWith("1.17")) cat17.push(v);
      else if (v.startsWith("1.16")) cat16.push(v);
      else if (v.startsWith("1.15")) cat15.push(v);
      else if (v.startsWith("1.14")) cat14.push(v);
      else if (v.startsWith("1.13")) cat13.push(v);
      else if (v.startsWith("1.12")) cat12.push(v);
      else if (
        v.startsWith("1.11") || v.startsWith("1.10") || v.startsWith("1.9") ||
        v.startsWith("1.8") || v.startsWith("1.7")
      ) legacy.push(v);
      else {
        if (v.startsWith("26")) cat26.push(v);
        else legacy.push(v);
      }
    });

    const result: VersionCategory[] = [];

    if (cat26.length > 0) result.push({ id: "26", label: "26.x (Latest Paper Version)", badge: "Latest • Java 25+", isLatest: true, versions: cat26 });
    if (cat21.length > 0) result.push({ id: "1.21", label: "1.21.x Category", badge: "Java 21", versions: cat21 });
    if (cat20.length > 0) result.push({ id: "1.20", label: "1.20.x Category", badge: "Java 17/21", versions: cat20 });
    if (cat19.length > 0) result.push({ id: "1.19", label: "1.19.x Category", badge: "Java 17", versions: cat19 });
    if (cat18.length > 0) result.push({ id: "1.18", label: "1.18.x Category", badge: "Java 17", versions: cat18 });
    if (cat17.length > 0) result.push({ id: "1.17", label: "1.17.x Category", badge: "Java 16", versions: cat17 });
    if (cat16.length > 0) result.push({ id: "1.16", label: "1.16.x Category", badge: "Java 8/11", versions: cat16 });
    if (cat15.length > 0) result.push({ id: "1.15", label: "1.15.x Category", badge: "Java 8", versions: cat15 });
    if (cat14.length > 0) result.push({ id: "1.14", label: "1.14.x Category", badge: "Java 8", versions: cat14 });
    if (cat13.length > 0) result.push({ id: "1.13", label: "1.13.x Category", badge: "Java 8", versions: cat13 });
    if (cat12.length > 0) result.push({ id: "1.12", label: "1.12.x Category", badge: "Java 8", versions: cat12 });
    if (legacy.length > 0) result.push({ id: "legacy", label: "1.7 – 1.11 (Legacy)", badge: "Java 8", versions: legacy });

    return result;
  }, [versions, isMinecraft]);

  useEffect(() => {
    if (isOpen) {
      if (value) {
        const found = categories.find(c => c.versions.includes(value));
        if (found) {
          setExpandedCategory(found.id);
          return;
        }
      }
      if (categories.length > 0) {
        setExpandedCategory(categories[0].id);
      }
    }
  }, [isOpen, value, categories]);

  const toggleCategory = (catId: string) => {
    setExpandedCategory(prev => (prev === catId ? null : catId));
  };

  const renderCurrentDisplay = () => {
    if (!value) {
      return <span className="font-mono text-sm" style={{ color: '#a1a1aa' }}>{placeholder}</span>;
    }

    if (value.startsWith("26.")) {
      return (
        <span className="flex items-center gap-2 min-w-0">
          <GitBranch className="w-4 h-4 shrink-0" style={{ color: '#c084fc' }} />
          <span className="font-mono text-sm font-bold truncate" style={{ color: '#e9d5ff' }}>{value}</span>
          <span
            className="text-[10px] font-semibold px-2 py-0.5 rounded-full shrink-0 flex items-center gap-1"
            style={{
              background: 'rgba(168,85,247,.2)',
              color: '#c084fc',
              border: '1px solid rgba(168,85,247,.4)',
            }}
          >
            <Hexagon size={8} />
            Latest Paper
          </span>
        </span>
      );
    }

    if (value.startsWith("1.21")) {
      return (
        <span className="flex items-center gap-2 min-w-0">
          <GitBranch className="w-4 h-4 shrink-0" style={{ color: '#c084fc' }} />
          <span className="font-mono text-sm font-bold truncate" style={{ color: '#e9d5ff' }}>{value}</span>
          <span
            className="text-[10px] font-medium px-1.5 py-0.5 rounded shrink-0"
            style={{
              background: 'rgba(168,85,247,.12)',
              color: '#c084fc',
              border: '1px solid rgba(168,85,247,.25)',
            }}
          >
            1.21.x
          </span>
        </span>
      );
    }

    return (
      <span className="flex items-center gap-2 min-w-0">
        <GitBranch className="w-4 h-4 shrink-0" style={{ color: '#a1a1aa' }} />
        <span className="font-mono text-sm truncate" style={{ color: '#e9d5ff' }}>{value}</span>
      </span>
    );
  };

  const isSearching = searchQuery.trim().length > 0;
  const searchLower = searchQuery.toLowerCase().trim();

  return (
    <div className={`relative ${disabled ? "opacity-50 pointer-events-none" : ""} ${isOpen ? "z-50" : "z-10"}`} ref={dropdownRef}>
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes awDdIn {
          from { opacity: 0; transform: translateY(-6px) scale(.98); filter: blur(4px); }
          to { opacity: 1; transform: translateY(0) scale(1); filter: blur(0); }
        }
        .aw-dd-menu { animation: awDdIn .22s cubic-bezier(.16,1,.3,1) both; }

        .aw-dd-scroll::-webkit-scrollbar { width: 6px; }
        .aw-dd-scroll::-webkit-scrollbar-track { background: rgba(0,0,0,.3); }
        .aw-dd-scroll::-webkit-scrollbar-thumb {
          background: linear-gradient(180deg, #a855f7, #7e22ce);
          border-radius: 3px;
        }
        .aw-dd-scroll::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(180deg, #c084fc, #a855f7);
        }

        .aw-dd-item { transition: all .2s cubic-bezier(.16,1,.3,1); }
        .aw-dd-item:hover { transform: translateX(2px); }

        .aw-dd-btn { transition: all .25s cubic-bezier(.16,1,.3,1); }
      `}} />

      {/* Trigger */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        disabled={disabled}
        className={`aw-dd-btn w-full flex items-center justify-between gap-3 rounded-xl px-4 py-3 text-left outline-none ${className}`}
        style={{
          background: 'rgba(0,0,0,.5)',
          border: isOpen
            ? '1px solid rgba(168,85,247,.6)'
            : '1px solid rgba(168,85,247,.2)',
          boxShadow: isOpen
            ? '0 0 0 3px rgba(168,85,247,.1), 0 0 20px -4px rgba(168,85,247,.4)'
            : 'none',
          color: '#e9d5ff',
        }}
        onMouseEnter={(e) => {
          if (!isOpen) e.currentTarget.style.borderColor = 'rgba(168,85,247,.4)';
        }}
        onMouseLeave={(e) => {
          if (!isOpen) e.currentTarget.style.borderColor = 'rgba(168,85,247,.2)';
        }}
      >
        <div className="flex items-center gap-2 min-w-0 overflow-hidden">
          {renderCurrentDisplay()}
        </div>
        <ChevronDown
          className="w-4 h-4 shrink-0 transition-transform duration-200"
          style={{
            color: '#c084fc',
            transform: isOpen ? 'rotate(180deg)' : 'rotate(0)',
          }}
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          className="aw-dd-menu absolute z-[100] mt-2 w-full rounded-xl overflow-hidden flex flex-col max-h-[380px]"
          style={{
            background: 'linear-gradient(135deg, rgba(20,12,35,.98) 0%, rgba(13,8,25,.99) 100%)',
            border: '1px solid rgba(168,85,247,.35)',
            backdropFilter: 'blur(20px) saturate(1.4)',
            WebkitBackdropFilter: 'blur(20px) saturate(1.4)',
            boxShadow:
              '0 20px 60px -12px rgba(0,0,0,.9), 0 0 0 1px rgba(168,85,247,.15), 0 0 32px -8px rgba(168,85,247,.4)',
          }}
        >
          {/* Top highlight */}
          <div
            className="absolute top-0 left-0 right-0 h-px pointer-events-none"
            style={{
              background:
                'linear-gradient(90deg, transparent, rgba(168,85,247,.6), rgba(255,255,255,.25), rgba(168,85,247,.6), transparent)',
            }}
          />

          {/* Search Header */}
          <div
            className="p-2.5 flex items-center shrink-0 relative z-10"
            style={{
              background: 'rgba(0,0,0,.4)',
              borderBottom: '1px solid rgba(168,85,247,.18)',
            }}
          >
            <Search className="w-4 h-4 mr-2 shrink-0" style={{ color: '#c084fc' }} />
            <input
              type="text"
              placeholder="Search version (e.g. 26.3, 1.20, 1.16)..."
              className="bg-transparent border-none outline-none text-sm w-full font-mono"
              style={{ color: '#e9d5ff', caretColor: '#c084fc' }}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onClick={(e) => e.stopPropagation()}
              autoFocus
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="text-[11px] font-semibold px-2 py-0.5 rounded-md aw-dd-btn"
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

          {/* List Area */}
          <div className="aw-dd-scroll flex-1 overflow-y-auto p-1.5 space-y-1 relative z-10">

            {/* Non-Minecraft simple list */}
            {!isMinecraft ? (
              versions
                .filter(v => v.toLowerCase().includes(searchLower))
                .map(v => {
                  const isSel = value === v;
                  return (
                    <button
                      key={v}
                      type="button"
                      onClick={() => {
                        onChange(v);
                        setIsOpen(false);
                        setSearchQuery("");
                      }}
                      className="aw-dd-item w-full flex items-center justify-between px-3 py-2.5 font-mono text-sm rounded-lg"
                      style={
                        isSel
                          ? {
                              background: 'linear-gradient(135deg, rgba(168,85,247,.2), rgba(168,85,247,.08))',
                              color: '#c084fc',
                              fontWeight: 700,
                              border: '1px solid rgba(168,85,247,.4)',
                            }
                          : {
                              color: '#e9d5ff',
                              border: '1px solid transparent',
                            }
                      }
                      onMouseEnter={(e) => {
                        if (!isSel) e.currentTarget.style.background = 'rgba(168,85,247,.08)';
                      }}
                      onMouseLeave={(e) => {
                        if (!isSel) e.currentTarget.style.background = 'transparent';
                      }}
                    >
                      <span>{v}</span>
                      {isSel && <Check className="w-4 h-4" style={{ color: '#c084fc' }} />}
                    </button>
                  );
                })
            ) : isSearching ? (
              // Search active
              (() => {
                const matched = versions.filter(v => v !== "latest" && v.toLowerCase().includes(searchLower));
                if (matched.length === 0) {
                  return (
                    <div className="p-4 text-center">
                      <div
                        className="w-12 h-12 mx-auto mb-2 rounded-xl flex items-center justify-center"
                        style={{
                          background: 'rgba(168,85,247,.08)',
                          border: '1px solid rgba(168,85,247,.2)',
                        }}
                      >
                        <Search className="w-5 h-5" style={{ color: 'rgba(192,132,252,.5)' }} />
                      </div>
                      <p className="text-xs font-mono" style={{ color: '#a1a1aa' }}>
                        No matching versions found
                      </p>
                    </div>
                  );
                }
                return matched.map(v => {
                  const is26 = v.startsWith("26.");
                  const isSel = value === v;
                  return (
                    <button
                      key={v}
                      type="button"
                      onClick={() => {
                        onChange(v);
                        setIsOpen(false);
                        setSearchQuery("");
                      }}
                      className="aw-dd-item w-full flex items-center justify-between px-3 py-2.5 font-mono text-sm rounded-lg"
                      style={
                        isSel
                          ? {
                              background: 'linear-gradient(135deg, rgba(168,85,247,.2), rgba(168,85,247,.08))',
                              color: '#c084fc',
                              fontWeight: 700,
                              border: '1px solid rgba(168,85,247,.4)',
                            }
                          : {
                              color: '#e9d5ff',
                              border: '1px solid transparent',
                            }
                      }
                      onMouseEnter={(e) => {
                        if (!isSel) e.currentTarget.style.background = 'rgba(168,85,247,.08)';
                      }}
                      onMouseLeave={(e) => {
                        if (!isSel) e.currentTarget.style.background = 'transparent';
                      }}
                    >
                      <div className="flex items-center gap-2">
                        <span>{v}</span>
                        {is26 && (
                          <span
                            className="text-[10px] font-sans font-bold px-1.5 py-0.5 rounded flex items-center gap-1"
                            style={{
                              background: 'rgba(168,85,247,.2)',
                              color: '#c084fc',
                              border: '1px solid rgba(168,85,247,.4)',
                            }}
                          >
                            <Hexagon size={8} />
                            Latest Paper
                          </span>
                        )}
                      </div>
                      {isSel && <Check className="w-4 h-4" style={{ color: '#c084fc' }} />}
                    </button>
                  );
                });
              })()
            ) : (
              // Categorized
              categories.map(cat => {
                const isExpanded = expandedCategory === cat.id;
                const containsSelected = cat.versions.includes(value);

                return (
                  <div
                    key={cat.id}
                    className="rounded-lg overflow-hidden"
                    style={{
                      background: 'rgba(255,255,255,.02)',
                      border: '1px solid rgba(168,85,247,.15)',
                    }}
                  >
                    {/* Category Header */}
                    <button
                      type="button"
                      onClick={() => toggleCategory(cat.id)}
                      className="aw-dd-btn w-full flex items-center justify-between px-3 py-2.5 text-left"
                      style={{
                        background: cat.isLatest
                          ? 'linear-gradient(135deg, rgba(168,85,247,.15), rgba(168,85,247,.05))'
                          : containsSelected
                          ? 'rgba(168,85,247,.08)'
                          : 'transparent',
                      }}
                      onMouseEnter={(e) => {
                        if (!cat.isLatest && !containsSelected) {
                          e.currentTarget.style.background = 'rgba(168,85,247,.06)';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!cat.isLatest && !containsSelected) {
                          e.currentTarget.style.background = 'transparent';
                        }
                      }}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        {isExpanded ? (
                          <ChevronDown className="w-4 h-4 shrink-0" style={{ color: '#c084fc' }} />
                        ) : (
                          <ChevronRight className="w-4 h-4 shrink-0" style={{ color: '#c084fc' }} />
                        )}
                        <span
                          className="font-mono text-xs font-bold truncate"
                          style={{ color: cat.isLatest ? '#e9d5ff' : '#d4d4d8' }}
                        >
                          {cat.label}
                        </span>
                        {cat.badge && (
                          <span
                            className="text-[10px] font-sans font-semibold px-1.5 py-0.5 rounded shrink-0"
                            style={
                              cat.isLatest
                                ? {
                                    background: 'rgba(168,85,247,.25)',
                                    color: '#c084fc',
                                    border: '1px solid rgba(168,85,247,.45)',
                                  }
                                : {
                                    background: 'rgba(0,0,0,.4)',
                                    color: '#a1a1aa',
                                    border: '1px solid rgba(168,85,247,.15)',
                                  }
                            }
                          >
                            {cat.badge}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        {containsSelected && (
                          <span
                            className="text-[10px] font-medium px-1.5 py-0.5 rounded flex items-center gap-1"
                            style={{
                              background: 'rgba(16,185,129,.12)',
                              color: '#34d399',
                              border: '1px solid rgba(16,185,129,.3)',
                            }}
                          >
                            <Check size={9} />
                            Active
                          </span>
                        )}
                        <span className="text-[11px] font-mono" style={{ color: 'rgba(161,161,170,.7)' }}>
                          {cat.versions.length}
                        </span>
                      </div>
                    </button>

                    {/* Sub-versions */}
                    {isExpanded && (
                      <div
                        className="py-1 px-1 space-y-0.5"
                        style={{
                          background: 'rgba(0,0,0,.3)',
                          borderTop: '1px solid rgba(168,85,247,.1)',
                        }}
                      >
                        {cat.versions.map(v => {
                          const isSel = value === v;
                          const isTop26 = v === "26.3";
                          return (
                            <button
                              key={v}
                              type="button"
                              onClick={() => {
                                onChange(v);
                                setIsOpen(false);
                                setSearchQuery("");
                              }}
                              className="aw-dd-item w-full flex items-center justify-between px-3 py-2 rounded-md font-mono text-xs pl-6"
                              style={
                                isSel
                                  ? {
                                      background: 'linear-gradient(135deg, rgba(168,85,247,.2), rgba(168,85,247,.08))',
                                      color: '#c084fc',
                                      fontWeight: 700,
                                      border: '1px solid rgba(168,85,247,.4)',
                                    }
                                  : {
                                      color: '#d4d4d8',
                                      border: '1px solid transparent',
                                    }
                              }
                              onMouseEnter={(e) => {
                                if (!isSel) {
                                  e.currentTarget.style.background = 'rgba(168,85,247,.08)';
                                  e.currentTarget.style.color = '#e9d5ff';
                                }
                              }}
                              onMouseLeave={(e) => {
                                if (!isSel) {
                                  e.currentTarget.style.background = 'transparent';
                                  e.currentTarget.style.color = '#d4d4d8';
                                }
                              }}
                            >
                              <div className="flex items-center gap-2">
                                <span>{v}</span>
                                {isTop26 && (
                                  <span
                                    className="text-[9px] font-sans font-bold px-1.5 py-0.5 rounded flex items-center gap-1"
                                    style={{
                                      background: 'rgba(168,85,247,.2)',
                                      color: '#c084fc',
                                      border: '1px solid rgba(168,85,247,.4)',
                                    }}
                                  >
                                    <Hexagon size={7} />
                                    Latest
                                  </span>
                                )}
                              </div>
                              {isSel && <Check className="w-3.5 h-3.5" style={{ color: '#c084fc' }} />}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}