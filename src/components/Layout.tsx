import React, { useState, useEffect } from "react";
import { Sidebar } from "./Sidebar";
import { Menu, ChevronRight, Hexagon, Sparkles } from "lucide-react";
import { useLocation, matchPath, Link } from "react-router-dom";
import { useSettings } from "../context/SettingsContext";
import GlobalSearchModal from "./GlobalSearchModal";
import NotificationsDropdown from "./NotificationsDropdown";

// ============================================
// AstroWax Panel V1.80 — Layout Shell
// Glass + Purple Theme
// ============================================

export default function Layout({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const location = useLocation();
  const { panelName, panelLogo } = useSettings();

  const pName = panelName || 'ASTROWAX PANEL';
  const nameParts = pName.split(' ');
  const firstWord = nameParts[0].toUpperCase();
  const restWords = nameParts.slice(1).join(' ').toUpperCase() || 'PANEL';

  useEffect(() => {
    const handleToggle = () => {
      if (window.innerWidth < 768) {
        setMobileOpen(prev => !prev);
      } else {
        setIsCollapsed(prev => !prev);
      }
    };
    window.addEventListener('toggle-sidebar', handleToggle);
    return () => window.removeEventListener('toggle-sidebar', handleToggle);
  }, []);

  const isServerView = matchPath("/servers/:id/*", location.pathname) && !matchPath("/servers/create", location.pathname);
  const isCreateServer = matchPath("/servers/create", location.pathname);
  const isAdminSettings = matchPath("/admin/settings", location.pathname);

  const getBreadcrumb = () => {
    const path = location.pathname;
    if (path === '/') return 'Overview';
    if (path === '/servers') return 'Servers';
    if (path === '/servers/create') return 'Deploy Server';
    if (path.startsWith('/servers/')) return 'Server Management';
    if (path === '/admin/servers') return 'Fleet';
    if (path === '/account') return 'Account';
    if (path === '/api-keys') return 'API Keys';
    return '';
  };

  // ---------- SHARED STYLES ----------
  const glassBase: React.CSSProperties = {
    background: 'linear-gradient(135deg, rgba(20,12,35,.85) 0%, rgba(13,8,25,.95) 100%)',
    backdropFilter: 'blur(16px) saturate(1.4)',
    WebkitBackdropFilter: 'blur(16px) saturate(1.4)',
    borderColor: 'rgba(168,85,247,.2)',
  };

  const awStyles = (
    <style dangerouslySetInnerHTML={{__html: `
      @keyframes awLayoutIn {
        from { opacity: 0; transform: translateY(4px); }
        to { opacity: 1; transform: translateY(0); }
      }
      .aw-layout-in { animation: awLayoutIn .35s cubic-bezier(.16,1,.3,1) both; }

      @keyframes awPulseDot {
        0%, 100% { opacity: 1; transform: scale(1); box-shadow: 0 0 0 0 rgba(168,85,247,.6); }
        50% { opacity: .6; transform: scale(.85); box-shadow: 0 0 0 4px rgba(168,85,247,0); }
      }
      .aw-pulse-dot {
        animation: awPulseDot 1.8s ease-in-out infinite;
        background: #a855f7;
        box-shadow: 0 0 8px rgba(168,85,247,.8);
      }

      .aw-nav-btn {
        transition: all .25s cubic-bezier(.16,1,.3,1);
      }
      .aw-nav-btn:hover {
        background: rgba(168,85,247,.1);
        color: #c084fc;
      }

      .aw-logo-mark {
        transition: all .5s cubic-bezier(.16,1,.3,1);
        background: linear-gradient(135deg, #a855f7, #7e22ce);
        box-shadow: 0 0 16px -2px rgba(168,85,247,.6), inset 0 1px 0 rgba(255,255,255,.2);
      }
      .aw-logo-mark:hover {
        transform: rotate(45deg);
        box-shadow: 0 0 24px -2px rgba(168,85,247,.9), inset 0 1px 0 rgba(255,255,255,.3);
      }

      .aw-header-glass {
        background: linear-gradient(135deg, rgba(20,12,35,.7) 0%, rgba(13,8,25,.85) 100%);
        backdrop-filter: blur(20px) saturate(1.4);
        -webkit-backdrop-filter: blur(20px) saturate(1.4);
        border-bottom: 1px solid rgba(168,85,247,.18);
        position: relative;
      }
      .aw-header-glass::after {
        content: '';
        position: absolute;
        bottom: -1px; left: 0; right: 0;
        height: 1px;
        background: linear-gradient(90deg, transparent, rgba(168,85,247,.4), rgba(255,255,255,.15), rgba(168,85,247,.4), transparent);
        pointer-events: none;
      }

      .aw-status-pill {
        background: rgba(0,0,0,.4);
        border: 1px solid rgba(168,85,247,.25);
        backdrop-filter: blur(8px);
        transition: all .25s cubic-bezier(.16,1,.3,1);
      }
      .aw-status-pill:hover {
        border-color: rgba(168,85,247,.5);
        box-shadow: 0 0 16px -4px rgba(168,85,247,.5);
      }

      .aw-overlay {
        background: rgba(0,0,0,.65);
        backdrop-filter: blur(12px);
        -webkit-backdrop-filter: blur(12px);
        animation: awLayoutIn .2s ease both;
      }
    `}} />
  );

  // ---------- SERVER VIEW / CREATE / ADMIN SETTINGS ----------
  if (isServerView || isCreateServer || isAdminSettings) {
    return (
      <>
        {awStyles}
        <div className="flex h-[100dvh] w-full bg-transparent text-foreground font-sans overflow-hidden selection:bg-purple-500/30">
          <main className="flex-1 w-full h-full relative z-10 overflow-auto">
            {children}
          </main>
        </div>
      </>
    );
  }

  // ---------- MAIN SHELL ----------
  return (
    <>
      {awStyles}
      <div className="flex h-[100dvh] w-full bg-transparent text-foreground font-sans overflow-hidden selection:bg-purple-500/30">

        {/* Mobile Sidebar Overlay */}
        {mobileOpen && (
          <div
            className="fixed inset-0 aw-overlay z-40 md:hidden"
            onClick={() => setMobileOpen(false)}
          />
        )}

        {/* Sidebar Container */}
        <div className={`fixed inset-y-0 left-0 z-50 transform flex-shrink-0 ${mobileOpen ? 'translate-x-0' : '-translate-x-full'} md:relative md:translate-x-0 transition-transform duration-300 ease-in-out`}>
          <Sidebar
            onClose={() => setMobileOpen(false)}
            isCollapsed={isCollapsed}
            toggleCollapse={() => setIsCollapsed(!isCollapsed)}
          />
        </div>

        <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden relative bg-transparent">

          {/* NAV */}
          <header className="sticky top-0 z-40 aw-header-glass flex-shrink-0">
            <div className="px-4 sm:px-6 h-16 flex items-center justify-between">

              <div className="flex items-center gap-3">
                <button
                  onClick={() => window.dispatchEvent(new CustomEvent('toggle-sidebar'))}
                  className="md:hidden p-2 -ml-2 text-zinc-400 hover:text-white rounded-lg aw-nav-btn cursor-pointer flex items-center justify-center"
                  title="Toggle Sidebar Menu"
                  aria-label="Toggle Sidebar Menu"
                >
                  <Menu className="w-5 h-5" />
                </button>

                {/* Logo */}
                <Link to="/" className="flex items-center gap-3 group">
                  {panelLogo ? (
                    <img
                      src={panelLogo}
                      alt="Logo"
                      className="w-7 h-7 object-contain"
                      style={{ filter: 'drop-shadow(0 0 8px rgba(168,85,247,.6))' }}
                    />
                  ) : (
                    <div className="w-7 h-7 aw-logo-mark flex items-center justify-center rounded-md">
                      <Hexagon className="w-4 h-4 text-white" strokeWidth={2.5} />
                    </div>
                  )}

                  <span className="font-display font-bold text-lg tracking-wide uppercase text-white flex items-center gap-2">
                    {firstWord}
                    <span
                      className="font-medium"
                      style={{
                        color: '#c084fc',
                        textShadow: '0 0 12px rgba(168,85,247,.4)',
                      }}
                    >
                      {restWords}
                    </span>
                  </span>
                </Link>
              </div>

              <div className="flex items-center gap-2 sm:gap-4 ml-auto">

                {/* ALL SYSTEMS GO */}
                <div className="hidden md:flex items-center gap-2 font-mono text-[10px] tracking-widest mr-4 px-3 py-1.5 rounded aw-status-pill">
                  <span className="w-1.5 h-1.5 rounded-full aw-pulse-dot" />
                  <span style={{ color: '#c084fc' }}>ALL SYSTEMS GO</span>
                </div>

                <GlobalSearchModal />
                <NotificationsDropdown />
              </div>
            </div>
          </header>

          {/* Main Content */}
          <main className="flex-1 w-full h-full relative z-0 overflow-x-hidden overflow-y-auto pb-safe custom-scrollbar">
            {location.pathname === "/" ? (
              <div className="aw-layout-in">{children}</div>
            ) : (
              <div className="p-4 sm:p-6 md:p-8 max-w-7xl mx-auto w-full aw-layout-in">
                {children}
              </div>
            )}
          </main>
        </div>
      </div>
    </>
  );
}