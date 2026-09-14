import React, { useEffect, useState } from "react";
import { io } from "socket.io-client";
import { RefreshCw, Sparkles, Hexagon, Zap, Server, Download } from "lucide-react";
import { motion } from "framer-motion";

// ============================================
// AstroWax Panel V1.80 — System Update Listener
// Glass + Purple Theme
// ============================================

export function SystemUpdateListener() {
  const [showPrompt, setShowPrompt] = useState(false);
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    const socket = io({
      auth: {
        token: token
      }
    });

    socket.on("system_update_started", () => {
      setShowPrompt(true);

      // Auto-reload fallback after 10 seconds
      setTimeout(() => {
        window.location.reload();
      }, 10000);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  // Countdown timer
  useEffect(() => {
    if (!showPrompt) return;
    const interval = setInterval(() => {
      setElapsed(prev => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [showPrompt]);

  if (!showPrompt) return null;

  const remaining = Math.max(0, 10 - elapsed);

  return (
    <>
      <style dangerouslySetInnerHTML={{__html: `
        .aw-sul-glass {
          background: linear-gradient(135deg, rgba(20,12,35,.96) 0%, rgba(13,8,25,.98) 100%);
          backdrop-filter: blur(24px) saturate(1.4);
          -webkit-backdrop-filter: blur(24px) saturate(1.4);
          border: 1px solid rgba(168,85,247,.35);
          border-radius: 24px;
          position: relative;
          overflow: hidden;
          box-shadow:
            0 30px 80px -20px rgba(0,0,0,.9),
            0 0 0 1px rgba(168,85,247,.15),
            0 0 60px -12px rgba(168,85,247,.5),
            inset 0 1px 0 rgba(255,255,255,.06);
        }
        .aw-sul-glass::before {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(168,85,247,.7), rgba(255,255,255,.3), rgba(168,85,247,.7), transparent);
          pointer-events: none;
          z-index: 2;
        }

        @keyframes awSulSpin {
          to { transform: rotate(360deg); }
        }
        @keyframes awSulSpinReverse {
          to { transform: rotate(-360deg); }
        }
        @keyframes awSulPulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: .5; transform: scale(.88); }
        }
        @keyframes awSulAura {
          0%, 100% { opacity: .5; transform: scale(1); }
          50% { opacity: .9; transform: scale(1.08); }
        }
        @keyframes awSulBar {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(200%); }
        }
        @keyframes awSulDotBounce {
          0%, 80%, 100% { transform: translateY(0); opacity: .4; }
          40% { transform: translateY(-6px); opacity: 1; }
        }

        .aw-sul-ring-1 { animation: awSulSpin 1.4s linear infinite; }
        .aw-sul-ring-2 { animation: awSulSpinReverse 2s linear infinite; }
        .aw-sul-core { animation: awSulPulse 1.6s ease-in-out infinite; }
        .aw-sul-aura { animation: awSulAura 2s ease-in-out infinite; }
        .aw-sul-bar { animation: awSulBar 1.6s ease-in-out infinite; }
        .aw-sul-dot { animation: awSulDotBounce 1.4s ease-in-out infinite; }

        .aw-sul-btn {
          transition: all .25s cubic-bezier(.16,1,.3,1);
        }
        .aw-sul-btn:hover:not(:disabled) {
          transform: translateY(-1px);
        }
        .aw-sul-btn:active:not(:disabled) {
          transform: translateY(0) scale(.97);
        }

        @keyframes awSulBgIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes awSulModalIn {
          from { opacity: 0; transform: translateY(20px) scale(.94); filter: blur(8px); }
          to { opacity: 1; transform: translateY(0) scale(1); filter: blur(0); }
        }
        .aw-sul-bg { animation: awSulBgIn .25s ease both; }
        .aw-sul-modal { animation: awSulModalIn .45s cubic-bezier(.16,1,.3,1) both; }
      `}} />

      <div
        className="fixed inset-0 z-[9999] flex items-center justify-center p-4 aw-sul-bg"
        style={{
          background: 'rgba(0,0,0,.82)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
        }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="aw-sul-glass aw-sul-modal max-w-md w-full text-center p-8 md:p-10"
        >
          {/* Top purple aura background */}
          <div
            className="absolute inset-0 pointer-events-none aw-sul-aura"
            style={{
              background: 'radial-gradient(circle at 50% 0%, rgba(168,85,247,.2), transparent 60%)',
            }}
          />

          {/* Content */}
          <div className="relative z-10 flex flex-col items-center">

            {/* Loader — dual spinning rings + hexagon */}
            <div className="relative w-20 h-20 mb-6">
              {/* Static outer ring */}
              <div
                className="absolute inset-0 rounded-full"
                style={{ border: '2px solid rgba(168,85,247,.15)' }}
              />

              {/* Middle spinning ring */}
              <div
                className="absolute inset-0 rounded-full aw-sul-ring-1"
                style={{
                  border: '2px solid transparent',
                  borderTopColor: '#a855f7',
                  borderRightColor: '#c084fc',
                  filter: 'drop-shadow(0 0 8px rgba(168,85,247,.7))',
                }}
              />

              {/* Inner counter-rotating ring */}
              <div
                className="absolute inset-2 rounded-full aw-sul-ring-2"
                style={{
                  border: '2px solid transparent',
                  borderBottomColor: '#7e22ce',
                  borderLeftColor: '#a855f7',
                  opacity: 0.7,
                }}
              />

              {/* Center hexagon */}
              <div className="absolute inset-0 flex items-center justify-center">
                <Hexagon
                  className="w-6 h-6 aw-sul-core"
                  style={{
                    color: '#c084fc',
                    filter: 'drop-shadow(0 0 10px rgba(168,85,247,.9))',
                  }}
                />
              </div>

              {/* Glow aura */}
              <div
                className="absolute inset-0 rounded-full pointer-events-none aw-sul-aura"
                style={{
                  background: 'radial-gradient(circle, rgba(168,85,247,.35), transparent 70%)',
                  filter: 'blur(14px)',
                }}
              />
            </div>

            {/* Title */}
            <h2
              className="text-2xl font-black tracking-tight mb-2 flex items-center gap-2"
              style={{ color: '#fff' }}
            >
              System Update
              <span
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[9px] font-mono uppercase tracking-widest"
                style={{
                  background: 'rgba(168,85,247,.15)',
                  border: '1px solid rgba(168,85,247,.4)',
                  color: '#c084fc',
                }}
              >
                <Hexagon size={9} />
                ASTROWAX
              </span>
            </h2>

            <p className="text-sm leading-relaxed mb-6 max-w-sm" style={{ color: 'rgba(233,213,255,.85)' }}>
              The panel is updating and restarting. Please refresh the page to continue using the panel.
            </p>

            {/* Indeterminate progress bar */}
            <div
              className="w-full h-1 rounded-full overflow-hidden mb-4"
              style={{ background: 'rgba(168,85,247,.15)' }}
            >
              <div
                className="h-full aw-sul-bar"
                style={{
                  width: '50%',
                  background: 'linear-gradient(90deg, transparent, #a855f7, #c084fc, #a855f7, transparent)',
                }}
              />
            </div>

            {/* Countdown text */}
            <div
              className="flex items-center gap-2 text-[11px] font-mono uppercase tracking-widest mb-5"
              style={{ color: 'rgba(192,132,252,.75)' }}
            >
              <Sparkles size={11} />
              <span>Auto-refresh in</span>
              <span
                className="font-bold px-2 py-0.5 rounded-md"
                style={{
                  background: 'rgba(168,85,247,.15)',
                  border: '1px solid rgba(168,85,247,.3)',
                  color: '#c084fc',
                }}
              >
                {remaining}s
              </span>
              <span className="flex items-center gap-1">
                <span className="w-1 h-1 rounded-full aw-sul-dot" style={{ background: '#a855f7', animationDelay: '0s' }} />
                <span className="w-1 h-1 rounded-full aw-sul-dot" style={{ background: '#a855f7', animationDelay: '.15s' }} />
                <span className="w-1 h-1 rounded-full aw-sul-dot" style={{ background: '#a855f7', animationDelay: '.3s' }} />
              </span>
            </div>

            {/* Refresh button */}
            <button
              onClick={() => window.location.reload()}
              className="aw-sul-btn w-full px-6 py-3 rounded-xl font-bold text-white flex items-center justify-center gap-2"
              style={{
                background: 'linear-gradient(135deg, #a855f7, #7e22ce)',
                boxShadow: '0 8px 24px -6px rgba(168,85,247,.7)',
              }}
            >
              <RefreshCw size={16} />
              Refresh Now
            </button>

            {/* Footer hint */}
            <div
              className="mt-4 flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-widest"
              style={{ color: 'rgba(168,85,247,.4)' }}
            >
              <Zap size={9} />
              Zero-downtime update in progress
            </div>
          </div>
        </motion.div>
      </div>
    </>
  );
}