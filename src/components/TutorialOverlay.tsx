import React, { useState, useEffect, useRef } from 'react';
import './TutorialOverlay.css';
import gsap from 'gsap';
import { useNavigate } from 'react-router-dom';
import { X, SkipForward, Hexagon, Sparkles, ChevronRight } from 'lucide-react';

// ============================================
// AstroWax Panel V1.80 — Tutorial Overlay
// Glass + Purple Theme
// ============================================

export const TutorialOverlay: React.FC<{ onComplete: () => void, panelName: string }> = ({ onComplete, panelName }) => {
  const [step, setStep] = useState(0);
  const [displayedText, setDisplayedText] = useState("");
  const highlighterRef = useRef<HTMLDivElement>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const navigate = useNavigate();

  const steps = React.useMemo(() => [
    { title: `Welcome to ${panelName}!`, text: "Let's take a quick tour of your new game panel.", path: "/" },
    { title: "Dashboard", text: "Get an overview of your servers and total resource usage here.", targetClass: "a[href='/']", path: "/" },
    { title: "Servers", text: "Here you can manage your game servers, start, stop, and configure them.", targetClass: "a[href='/servers']", path: "/servers" },
    { title: "Account", text: "Customize your panel name, logo, and more from the settings page.", targetClass: "a[href='/account']", path: "/account" },
    { title: "API Keys", text: "Manage your API keys for programmatic access to the panel.", targetClass: "a[href='/api-keys']", path: "/api-keys" },
    { title: "Ready?", text: "You're all set to use your new panel!", path: "/" }
  ], [panelName]);

  // Typing effect and sound
  useEffect(() => {
    const currentStep = steps[step];
    
    if (currentStep.path) {
      navigate(currentStep.path);
    }
    
    setDisplayedText("");
    let i = 0;
    const text = currentStep.text;
    
    if (!audioCtxRef.current) {
      audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    
    const playClickSound = () => {
      if (!audioCtxRef.current) return;
      if (audioCtxRef.current.state === 'suspended') audioCtxRef.current.resume();
      
      const t = audioCtxRef.current.currentTime;
      
      const osc = audioCtxRef.current.createOscillator();
      const gainNode = audioCtxRef.current.createGain();
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(800 + Math.random() * 300, t);
      osc.frequency.exponentialRampToValueAtTime(100, t + 0.02);
      
      gainNode.gain.setValueAtTime(0, t);
      gainNode.gain.linearRampToValueAtTime(0.15, t + 0.005);
      gainNode.gain.exponentialRampToValueAtTime(0.001, t + 0.03);
      
      osc.connect(gainNode);
      gainNode.connect(audioCtxRef.current.destination);
      
      osc.start(t);
      osc.stop(t + 0.04);
    };

    const interval = setInterval(() => {
      setDisplayedText(text.substring(0, i + 1));
      if (text.charAt(i) !== ' ' || Math.random() > 0.5) {
         playClickSound();
      }
      i++;
      if (i >= text.length) {
        clearInterval(interval);
      }
    }, 35);

    return () => clearInterval(interval);
  }, [step, steps, navigate]);

  useEffect(() => {
    gsap.fromTo('.tutorial-modal', 
      { scale: 0.8, opacity: 0, filter: 'blur(8px)' },
      { scale: 1, opacity: 1, filter: 'blur(0px)', duration: 0.5, ease: 'back.out(1.7)' }
    );
    gsap.fromTo('.birds-container', 
      { y: 100, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.6, delay: 0.2, ease: 'power2.out' }
    );
  }, [step]);

  useEffect(() => {
    const currentStep = steps[step];

    let highlightInterval: NodeJS.Timeout;
    if (currentStep.targetClass && highlighterRef.current) {
      let attempts = 0;
      highlightInterval = setInterval(() => {
        attempts++;
        const targetEl = document.querySelector(currentStep.targetClass);
        if (targetEl && highlighterRef.current) {
          const rect = targetEl.getBoundingClientRect();
          gsap.to(highlighterRef.current, {
            x: rect.left - 10,
            y: rect.top - 10,
            width: rect.width + 20,
            height: rect.height + 20,
            opacity: 1,
            duration: 0.4,
            ease: 'power2.out'
          });
          clearInterval(highlightInterval);
        } else if (attempts > 20) {
          clearInterval(highlightInterval);
          if (highlighterRef.current) {
            gsap.to(highlighterRef.current, { opacity: 0, duration: 0.2 });
          }
        }
      }, 100);
    } else if (highlighterRef.current) {
      gsap.to(highlighterRef.current, { opacity: 0, duration: 0.2 });
    }
    
    return () => {
      if (highlightInterval) clearInterval(highlightInterval);
    };
  }, [step, steps]);

  const handleSkip = () => {
    if (audioCtxRef.current && audioCtxRef.current.state !== 'closed') {
      audioCtxRef.current.close().catch(console.error);
    }
    gsap.to('.tutorial-overlay-wrapper', {
      opacity: 0,
      duration: 0.3,
      onComplete: () => {
        navigate('/');
        onComplete();
      }
    });
  };

  const handleNext = () => {
    if (step < steps.length - 1) {
      setStep(step + 1);
    } else {
      gsap.to('.birds-container', {
        x: '100vw',
        duration: 2,
        ease: 'power2.inOut'
      });
      
      gsap.to('.tutorial-overlay-wrapper', {
        opacity: 0,
        duration: 0.5,
        delay: 1.5,
        onComplete: () => {
          if (audioCtxRef.current && audioCtxRef.current.state !== 'closed') {
            audioCtxRef.current.close().catch(console.error);
          }
          onComplete();
        }
      });
    }
  };

  return (
    <>
      <style dangerouslySetInnerHTML={{__html: `
        .aw-tut-wrapper {
          position: fixed;
          inset: 0;
          z-index: 9999;
          pointer-events: none;
        }

        .aw-tut-top-skip {
          position: fixed;
          top: 1.5rem;
          right: 1.5rem;
          z-index: 10001;
          pointer-events: auto;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.6rem 1rem;
          border-radius: 12px;
          background: linear-gradient(135deg, rgba(20,12,35,.85), rgba(13,8,25,.95));
          backdrop-filter: blur(16px);
          border: 1px solid rgba(168,85,247,.35);
          color: #c084fc;
          font-size: 0.8rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
          box-shadow: 0 8px 24px -6px rgba(168,85,247,.5);
        }

        .aw-tut-top-skip:hover {
          transform: translateY(-1px);
          background: linear-gradient(135deg, rgba(168,85,247,.2), rgba(126,34,206,.1));
          border-color: rgba(168,85,247,.6);
          box-shadow: 0 12px 32px -6px rgba(168,85,247,.7);
        }

        .aw-tut-highlighter {
          position: fixed;
          z-index: 10000;
          pointer-events: none;
          border-radius: 16px;
          border: 2px solid rgba(168,85,247,.7);
          background: rgba(168,85,247,.08);
          box-shadow: 
            0 0 0 9999px rgba(0,0,0,.65),
            0 0 32px -4px rgba(168,85,247,.8),
            inset 0 0 20px -8px rgba(168,85,247,.5);
          backdrop-filter: blur(2px);
        }

        .aw-tut-modal {
          position: fixed;
          bottom: 4rem;
          left: 50%;
          transform: translateX(-50%);
          z-index: 10001;
          pointer-events: auto;
          width: calc(100% - 2rem);
          max-width: 520px;
          padding: 2rem 2.25rem 1.75rem;
          border-radius: 24px;
          text-align: center;
          color: #fff;
          background: linear-gradient(135deg, rgba(20,12,35,.94), rgba(13,8,25,.98));
          backdrop-filter: blur(28px) saturate(1.4);
          -webkit-backdrop-filter: blur(28px) saturate(1.4);
          border: 1px solid rgba(168,85,247,.4);
          box-shadow: 
            0 30px 80px -20px rgba(0,0,0,.9),
            0 0 60px -12px rgba(168,85,247,.6),
            inset 0 1px 0 rgba(255,255,255,.08);
        }

        .aw-tut-modal::before {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 1px;
          border-radius: 24px 24px 0 0;
          background: linear-gradient(90deg, transparent, rgba(168,85,247,.8), rgba(255,255,255,.3), rgba(168,85,247,.8), transparent);
          pointer-events: none;
        }

        .aw-tut-modal-close {
          position: absolute;
          top: 1rem;
          right: 1rem;
          padding: 0.5rem;
          border-radius: 10px;
          background: rgba(168,85,247,.08);
          border: 1px solid rgba(168,85,247,.2);
          color: #a1a1aa;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .aw-tut-modal-close:hover {
          color: #c084fc;
          background: rgba(168,85,247,.15);
          border-color: rgba(168,85,247,.4);
        }

        .aw-tut-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.35rem;
          padding: 0.2rem 0.55rem;
          border-radius: 6px;
          font-size: 9px;
          font-family: ui-monospace, monospace;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.15em;
          background: rgba(168,85,247,.15);
          border: 1px solid rgba(168,85,247,.35);
          color: #c084fc;
          margin-bottom: 1rem;
        }

        .aw-tut-title {
          font-size: 1.85rem;
          font-weight: 900;
          margin: 0 0 0.75rem;
          letter-spacing: -0.02em;
          color: #fff;
          text-shadow: 0 2px 24px rgba(168,85,247,.5);
        }

        .aw-tut-text {
          font-size: 1.05rem;
          font-weight: 400;
          line-height: 1.5;
          min-height: 3.25rem;
          margin: 0 0 1.75rem;
          color: rgba(233,213,255,.85);
        }

        .aw-tut-dots {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.4rem;
          margin-bottom: 1.25rem;
        }

        .aw-tut-dot {
          height: 6px;
          width: 6px;
          border-radius: 99px;
          background: rgba(168,85,247,.25);
          transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .aw-tut-dot.active {
          width: 24px;
          background: linear-gradient(90deg, #a855f7, #c084fc);
          box-shadow: 0 0 12px rgba(168,85,247,.8);
        }

        .aw-tut-buttons {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.75rem;
        }

        .aw-tut-btn-skip {
          padding: 0.75rem 1.25rem;
          border-radius: 12px;
          background: rgba(0,0,0,.4);
          border: 1px solid rgba(168,85,247,.25);
          color: #a1a1aa;
          font-size: 0.9rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .aw-tut-btn-skip:hover {
          color: #c084fc;
          border-color: rgba(168,85,247,.5);
          transform: translateY(-1px);
        }

        .aw-tut-btn-next {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem 1.5rem;
          border-radius: 12px;
          background: linear-gradient(135deg, #a855f7, #7e22ce);
          border: none;
          color: #fff;
          font-size: 0.9rem;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
          box-shadow: 0 6px 24px -6px rgba(168,85,247,.7);
        }

        .aw-tut-btn-next:hover {
          transform: translateY(-1px);
          box-shadow: 0 10px 32px -6px rgba(168,85,247,.9);
        }

        .aw-tut-btn-next:active {
          transform: translateY(0) scale(0.98);
        }

        .aw-tut-angry-title {
          position: fixed;
          top: 3rem;
          left: 50%;
          transform: translateX(-50%);
          z-index: 10000;
          pointer-events: none;
          font-size: clamp(3rem, 10vw, 8rem);
          font-weight: 900;
          letter-spacing: -0.05em;
          color: transparent;
          background: linear-gradient(135deg, rgba(168,85,247,.15), rgba(192,132,252,.08));
          -webkit-background-clip: text;
          background-clip: text;
          text-shadow: 
            0 0 60px rgba(168,85,247,.6),
            0 0 120px rgba(168,85,247,.3);
          filter: drop-shadow(0 0 40px rgba(168,85,247,.5));
        }

        @media (max-width: 640px) {
          .aw-tut-modal {
            padding: 1.75rem 1.5rem 1.5rem;
            bottom: 2rem;
          }
          .aw-tut-title { font-size: 1.5rem; }
          .aw-tut-text { font-size: 0.95rem; }
        }
      `}} />

      <div className="tutorial-overlay-wrapper aw-tut-wrapper" style={{pointerEvents: 'auto'}}>
        {/* Floating Top-Right Skip */}
        <button
          onClick={handleSkip}
          className="aw-tut-top-skip"
          title="Skip tutorial"
        >
          <SkipForward className="w-4 h-4" />
          <span>Skip Tutorial</span>
        </button>

        {/* Highlighter */}
        <div 
          ref={highlighterRef} 
          className="aw-tut-highlighter" 
          style={{ opacity: 0 }}
        />

        {/* Angry Title */}
        <h1 className="aw-tut-angry-title" data-text={panelName}>
          {panelName}
        </h1>

        {/* Modal */}
        <div className="tutorial-modal aw-tut-modal">
          <button
            onClick={handleSkip}
            className="aw-tut-modal-close"
            title="Skip"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="aw-tut-badge">
            <Sparkles size={10} />
            ASTROWAX TOUR
          </div>

          <div className="aw-tut-dots">
            {steps.map((_, i) => (
              <span
                key={i}
                className={`aw-tut-dot ${i === step ? 'active' : ''}`}
              />
            ))}
          </div>

          <h2 className="aw-tut-title">{steps[step].title}</h2>
          <p className="aw-tut-text">{displayedText}</p>
          
          <div className="aw-tut-buttons">
            <button 
              type="button"
              onClick={handleSkip}
              className="aw-tut-btn-skip"
            >
              Skip
            </button>

            <button 
              type="button"
              onClick={handleNext}
              className="aw-tut-btn-next"
            >
              {step < steps.length - 1 ? (
                <>
                  Next
                  <ChevronRight className="w-4 h-4" />
                </>
              ) : (
                <>
                  Got it!
                  <Hexagon className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </div>

        {/* Birds container (keep as-is, CSS handles) */}
        <div className="tutorial-cartoon-container" style={{pointerEvents: 'none'}}>
          <div className="birds-container">
            <div className="red">
              <div className="tail"></div>
              <div className="head"></div>
              <div className="eye left">
                <div className="pupil"></div>
                <div className="eyebrow"></div>
              </div>
              <div className="mouth"></div>
              <div className="eye right">
                <div className="pupil"></div>
                <div className="eyebrow"></div>
              </div>
              <div className="hair"></div>
            </div>
            
            <div className="minion">
              <div className="ear left"></div>
              <div className="ear right"></div>
              <div className="eye left"></div>
              <div className="eye right"></div>
              <div className="nose"></div>
            </div>
            
            <div className="black">
              <div className="hair"></div>
              <div className="head"></div>
              <div className="eye left">
                <div className="pupil"></div>
                <div className="eyebrow"></div>
              </div>
              <div className="eye right">
                <div className="pupil"></div>
                <div className="eyebrow"></div>
              </div>
              <div className="mouth"></div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};