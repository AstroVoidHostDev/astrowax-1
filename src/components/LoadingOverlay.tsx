import React from 'react';
import { Hexagon } from 'lucide-react';

// ============================================
// AstroWax Panel V1.80 — Loading Overlay
// Glass + Purple Theme
// ============================================

interface LoadingOverlayProps {
  message?: string;
}

export function LoadingOverlay({ message = "Processing..." }: LoadingOverlayProps) {
  return (
    <div 
      className="fixed inset-0 z-[100] flex items-center justify-center"
      style={{
        background: 'rgba(0,0,0,.6)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        animation: 'awOverlayIn .2s ease both',
      }}
    >
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes awOverlayIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes awOverlayPop {
          from { opacity: 0; transform: scale(.92) translateY(8px); filter: blur(4px); }
          to { opacity: 1; transform: scale(1) translateY(0); filter: blur(0); }
        }
        @keyframes awSpin {
          to { transform: rotate(360deg); }
        }
        @keyframes awSpinReverse {
          to { transform: rotate(-360deg); }
        }
        @keyframes awPulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: .5; transform: scale(.88); }
        }
        @keyframes awDotBounce {
          0%, 80%, 100% { transform: translateY(0); opacity: .4; }
          40% { transform: translateY(-6px); opacity: 1; }
        }
        .aw-overlay-card {
          animation: awOverlayPop .4s cubic-bezier(.16,1,.3,1) both;
        }
        .aw-spin-ring {
          animation: awSpin 1.4s linear infinite;
        }
        .aw-spin-ring-reverse {
          animation: awSpinReverse 2s linear infinite;
        }
        .aw-pulse-core {
          animation: awPulse 1.6s ease-in-out infinite;
        }
        .aw-dot {
          animation: awDotBounce 1.4s ease-in-out infinite;
        }
      `}} />

      <div 
        className="aw-overlay-card relative p-7 rounded-2xl flex flex-col items-center gap-5 min-w-[240px]"
        style={{
          background: 'linear-gradient(135deg, rgba(20,12,35,.85) 0%, rgba(13,8,25,.95) 100%)',
          backdropFilter: 'blur(24px) saturate(1.4)',
          WebkitBackdropFilter: 'blur(24px) saturate(1.4)',
          border: '1px solid rgba(168,85,247,.35)',
          boxShadow: 
            '0 30px 80px -20px rgba(0,0,0,.8), 0 0 0 1px rgba(168,85,247,.15), inset 0 1px 0 rgba(255,255,255,.06)',
        }}
      >
        {/* Top highlight */}
        <div
          className="absolute top-0 left-0 right-0 h-px pointer-events-none"
          style={{
            background: 'linear-gradient(90deg, transparent, rgba(168,85,247,.6), rgba(255,255,255,.25), rgba(168,85,247,.6), transparent)',
          }}
        />

        {/* Loader rings */}
        <div className="relative w-16 h-16">
          {/* Outer static ring */}
          <div 
            className="absolute inset-0 rounded-full"
            style={{
              border: '2px solid rgba(168,85,247,.15)',
            }}
          />

          {/* Middle spinning ring — clockwise */}
          <div 
            className="absolute inset-0 rounded-full aw-spin-ring"
            style={{
              border: '2px solid transparent',
              borderTopColor: '#a855f7',
              borderRightColor: '#c084fc',
              filter: 'drop-shadow(0 0 6px rgba(168,85,247,.6))',
            }}
          />

          {/* Inner spinning ring — counter-clockwise */}
          <div 
            className="absolute inset-2 rounded-full aw-spin-ring-reverse"
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
              className="w-5 h-5 aw-pulse-core" 
              style={{
                color: '#c084fc',
                filter: 'drop-shadow(0 0 8px rgba(168,85,247,.8))',
              }}
            />
          </div>

          {/* Glow aura */}
          <div 
            className="absolute inset-0 rounded-full pointer-events-none"
            style={{
              background: 'radial-gradient(circle, rgba(168,85,247,.3), transparent 70%)',
              filter: 'blur(12px)',
              animation: 'awPulse 2s ease-in-out infinite',
            }}
          />
        </div>

        {/* Message */}
        <div className="flex flex-col items-center gap-2">
          <p 
            className="font-mono text-xs tracking-widest uppercase text-center"
            style={{
              color: '#c084fc',
              textShadow: '0 0 12px rgba(168,85,247,.5)',
            }}
          >
            {message}
          </p>
          
          {/* Animated dots */}
          <div className="flex items-center gap-1">
            {[0, 1, 2].map((i) => (
              <span
                key={i}
                className="w-1 h-1 rounded-full aw-dot"
                style={{
                  background: '#a855f7',
                  boxShadow: '0 0 6px rgba(168,85,247,.8)',
                  animationDelay: `${i * 0.15}s`,
                }}
              />
            ))}
          </div>
        </div>

        {/* Bottom branding */}
        <div 
          className="absolute bottom-2 left-0 right-0 flex items-center justify-center gap-1 text-[8px] font-mono uppercase tracking-widest"
          style={{ color: 'rgba(168,85,247,.4)' }}
        >
          <Hexagon size={7} />
          ASTROWAX
        </div>
      </div>
    </div>
  );
}