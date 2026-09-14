import React, { useEffect } from 'react';
import { useSettings } from '../context/SettingsContext';

// ============================================
// AstroWax Panel V1.80 — Global Background
// Glass + Purple Theme
// ============================================

export function GlobalBackground() {
  const { panelBackgroundImage, panelBackgroundBlur } = useSettings();

  useEffect(() => {
    if (panelBackgroundImage) {
      document.documentElement.classList.add('has-bg-image');
    } else {
      document.documentElement.classList.remove('has-bg-image');
    }
    return () => {
      document.documentElement.classList.remove('has-bg-image');
    };
  }, [panelBackgroundImage]);

  if (!panelBackgroundImage) return null;

  return (
    <div
      className="fixed inset-0 pointer-events-none bg-cover bg-center bg-no-repeat"
      style={{
        backgroundImage: `url("${panelBackgroundImage}")`,
        filter: `blur(${panelBackgroundBlur || 0}px)`,
        transform: 'scale(1.08)',
        zIndex: 0,
        transition: 'filter .5s ease, transform .5s ease, opacity .5s ease',
        animation: 'awBgIn .6s cubic-bezier(.16,1,.3,1) both',
      }}
    >
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes awBgIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes awAuraBreath {
          0%, 100% { opacity: .55; transform: scale(1); }
          50% { opacity: .85; transform: scale(1.05); }
        }
        .aw-bg-aura {
          animation: awAuraBreath 6s ease-in-out infinite;
        }
      `}} />

      {/* Base dark overlay — readability */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'linear-gradient(180deg, rgba(13,8,25,.55) 0%, rgba(13,8,25,.7) 40%, rgba(13,8,25,.85) 100%)',
        }}
      />

      {/* Purple radial aura — top-left */}
      <div
        className="absolute inset-0 aw-bg-aura"
        style={{
          background:
            'radial-gradient(circle at 15% 10%, rgba(168,85,247,.35) 0%, transparent 45%)',
          mixBlendMode: 'screen',
        }}
      />

      {/* Purple radial aura — bottom-right */}
      <div
        className="absolute inset-0 aw-bg-aura"
        style={{
          background:
            'radial-gradient(circle at 85% 90%, rgba(126,34,206,.3) 0%, transparent 50%)',
          mixBlendMode: 'screen',
          animationDelay: '1.5s',
        }}
      />

      {/* Vignette — depth */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse at center, transparent 30%, rgba(0,0,0,.5) 100%)',
        }}
      />

      {/* Top glass reflection line */}
      <div
        className="absolute top-0 left-0 right-0 h-px pointer-events-none"
        style={{
          background:
            'linear-gradient(90deg, transparent, rgba(168,85,247,.35), rgba(255,255,255,.15), rgba(168,85,247,.35), transparent)',
        }}
      />
    </div>
  );
}