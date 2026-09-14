import React, { useState, useRef, useEffect } from "react";
import { ChevronDown, Search, Check, Hexagon } from "lucide-react";

// ============================================
// AstroWax Panel V1.80 — Searchable Dropdown
// Glass + Purple Theme
// ============================================

interface SearchableDropdownProps {
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  placeholder: string;
  searchPlaceholder?: string;
  className?: string;
  disabled?: boolean;
}

export default function SearchableDropdown({
  value,
  onChange,
  options,
  placeholder,
  searchPlaceholder = "Search...",
  className = "",
  disabled = false,
}: SearchableDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
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

  const selectedOption = options.find((o) => o.value === value);

  const filtered = options.filter(
    (o) =>
      o.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.value.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div
      className={`relative ${disabled ? "opacity-50 pointer-events-none" : ""} ${isOpen ? "z-50" : "z-10"}`}
      ref={dropdownRef}
    >
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes awSdIn {
          from { opacity: 0; transform: translateY(-6px) scale(.98); filter: blur(4px); }
          to { opacity: 1; transform: translateY(0) scale(1); filter: blur(0); }
        }
        .aw-sd-menu { animation: awSdIn .22s cubic-bezier(.16,1,.3,1) both; }

        .aw-sd-scroll::-webkit-scrollbar { width: 6px; }
        .aw-sd-scroll::-webkit-scrollbar-track { background: rgba(0,0,0,.3); }
        .aw-sd-scroll::-webkit-scrollbar-thumb {
          background: linear-gradient(180deg, #a855f7, #7e22ce);
          border-radius: 3px;
        }
        .aw-sd-scroll::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(180deg, #c084fc, #a855f7);
        }

        .aw-sd-item { transition: all .2s cubic-bezier(.16,1,.3,1); }
        .aw-sd-item:hover { transform: translateX(2px); }

        .aw-sd-btn { transition: all .25s cubic-bezier(.16,1,.3,1); }
      `}} />

      {/* Trigger */}
      <div
        onClick={() => setIsOpen(!isOpen)}
        className={`aw-sd-btn w-full rounded-xl px-4 py-3 cursor-pointer flex justify-between items-center ${className}`}
        style={{
          background: 'rgba(0,0,0,.5)',
          border: isOpen
            ? '1px solid rgba(168,85,247,.6)'
            : '1px solid rgba(168,85,247,.2)',
          boxShadow: isOpen
            ? '0 0 0 3px rgba(168,85,247,.1), 0 0 20px -4px rgba(168,85,247,.4)'
            : 'none',
          color: selectedOption ? '#e9d5ff' : '#a1a1aa',
        }}
        onMouseEnter={(e) => {
          if (!isOpen) e.currentTarget.style.borderColor = 'rgba(168,85,247,.4)';
        }}
        onMouseLeave={(e) => {
          if (!isOpen) e.currentTarget.style.borderColor = 'rgba(168,85,247,.2)';
        }}
      >
        <span className="truncate pr-4 text-sm">
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDown
          className="w-4 h-4 shrink-0 transition-transform duration-200"
          style={{
            color: '#c084fc',
            transform: isOpen ? 'rotate(180deg)' : 'rotate(0)',
          }}
        />
      </div>

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          className="aw-sd-menu absolute z-[100] mt-2 w-full rounded-xl overflow-hidden flex flex-col max-h-[320px]"
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
            className="p-3 flex items-center shrink-0 relative z-10"
            style={{
              background: 'rgba(0,0,0,.4)',
              borderBottom: '1px solid rgba(168,85,247,.18)',
            }}
          >
            <Search className="w-4 h-4 mr-2.5 shrink-0" style={{ color: '#c084fc' }} />
            <input
              type="text"
              placeholder={searchPlaceholder}
              className="bg-transparent border-none outline-none text-sm w-full font-sans"
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
                className="text-[11px] font-semibold px-2 py-0.5 rounded-md aw-sd-btn"
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

          {/* Options List */}
          <div className="aw-sd-scroll flex-1 overflow-y-auto p-2 relative z-10">
            {filtered.length === 0 ? (
              <div className="p-4 text-center">
                <div
                  className="w-10 h-10 mx-auto mb-2 rounded-xl flex items-center justify-center"
                  style={{
                    background: 'rgba(168,85,247,.08)',
                    border: '1px solid rgba(168,85,247,.2)',
                  }}
                >
                  <Search className="w-4 h-4" style={{ color: 'rgba(192,132,252,.5)' }} />
                </div>
                <p className="text-xs" style={{ color: '#a1a1aa' }}>
                  No results found
                </p>
              </div>
            ) : (
              filtered.map((o) => {
                const isSel = value === o.value;
                return (
                  <div
                    key={o.value}
                    onClick={() => {
                      onChange(o.value);
                      setIsOpen(false);
                      setSearchQuery("");
                    }}
                    className="aw-sd-item px-3 py-2.5 rounded-lg cursor-pointer flex items-center justify-between text-sm mb-0.5 last:mb-0"
                    style={
                      isSel
                        ? {
                            background: 'linear-gradient(135deg, rgba(168,85,247,.2), rgba(168,85,247,.08))',
                            color: '#c084fc',
                            fontWeight: 600,
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
                    <span className="truncate">{o.label}</span>
                    {isSel && (
                      <Check className="w-4 h-4 shrink-0 ml-2" style={{ color: '#c084fc' }} />
                    )}
                  </div>
                );
              })
            )}
          </div>

          {/* Bottom branding */}
          {filtered.length > 0 && (
            <div
              className="px-3 py-1.5 flex items-center justify-between text-[9px] font-mono uppercase tracking-widest shrink-0 relative z-10"
              style={{
                background: 'rgba(0,0,0,.35)',
                borderTop: '1px solid rgba(168,85,247,.12)',
                color: 'rgba(168,85,247,.45)',
              }}
            >
              <span>{filtered.length} option{filtered.length !== 1 ? "s" : ""}</span>
              <span className="flex items-center gap-1">
                <Hexagon size={7} />
                ASTROWAX
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}