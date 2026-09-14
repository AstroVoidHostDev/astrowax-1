import React, { useState, useCallback } from 'react';
import Cropper from 'react-easy-crop';
import { getCroppedImg } from '../utils/cropImage';
import { X, Check, Crop, Hexagon, Sparkles } from 'lucide-react';

// ============================================
// AstroWax Panel V1.80 — Image Cropper
// Glass + Purple Theme
// ============================================

interface ImageCropperProps {
  imageSrc: string;
  onCropComplete: (croppedImageBase64: string) => void;
  onCancel: () => void;
  aspectRatio?: number;
  title?: string;
}

export function ImageCropper({
  imageSrc,
  onCropComplete,
  onCancel,
  aspectRatio = 1,
  title = "Crop Logo"
}: ImageCropperProps) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [currentAspect, setCurrentAspect] = useState<number>(aspectRatio);
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);

  const handleCropComplete = useCallback((_croppedArea: any, croppedAreaPixels: any) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const showCroppedImage = useCallback(async () => {
    try {
      const croppedImage = await getCroppedImg(imageSrc, croppedAreaPixels);
      if (croppedImage) {
        onCropComplete(croppedImage);
      }
    } catch (e) {
      console.error(e);
    }
  }, [imageSrc, croppedAreaPixels, onCropComplete]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{
        background: 'rgba(0,0,0,.75)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        animation: 'awCropBgIn .2s ease both',
      }}
    >
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes awCropBgIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes awCropIn {
          from { opacity: 0; transform: translateY(16px) scale(.96); filter: blur(6px); }
          to { opacity: 1; transform: translateY(0) scale(1); filter: blur(0); }
        }
        .aw-crop-modal { animation: awCropIn .4s cubic-bezier(.16,1,.3,1) both; }

        .aw-crop-glass {
          background: linear-gradient(135deg, rgba(20,12,35,.92) 0%, rgba(13,8,25,.96) 100%);
          backdrop-filter: blur(24px) saturate(1.4);
          -webkit-backdrop-filter: blur(24px) saturate(1.4);
          border: 1px solid rgba(168,85,247,.3);
          border-radius: 20px;
          position: relative;
          overflow: hidden;
          box-shadow:
            0 30px 80px -20px rgba(0,0,0,.8),
            0 0 0 1px rgba(168,85,247,.15),
            inset 0 1px 0 rgba(255,255,255,.06);
        }
        .aw-crop-glass::before {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(168,85,247,.7), rgba(255,255,255,.3), rgba(168,85,247,.7), transparent);
          pointer-events: none;
          z-index: 2;
        }

        .aw-crop-btn {
          transition: all .25s cubic-bezier(.16,1,.3,1);
        }
        .aw-crop-btn:hover:not(:disabled) {
          transform: translateY(-1px);
        }
        .aw-crop-btn:active:not(:disabled) {
          transform: translateY(0) scale(.97);
        }

        /* Zoom slider — purple theme */
        .aw-zoom-slider {
          -webkit-appearance: none;
          appearance: none;
          width: 100%;
          height: 6px;
          border-radius: 999px;
          background: linear-gradient(90deg, #a855f7 0%, #7e22ce 100%);
          outline: none;
          cursor: pointer;
        }
        .aw-zoom-slider::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 18px;
          height: 18px;
          border-radius: 50%;
          background: linear-gradient(135deg, #c084fc, #a855f7);
          border: 2px solid rgba(255,255,255,.25);
          cursor: pointer;
          box-shadow: 0 0 12px rgba(168,85,247,.7), inset 0 1px 0 rgba(255,255,255,.3);
          transition: all .2s ease;
        }
        .aw-zoom-slider::-webkit-slider-thumb:hover {
          transform: scale(1.15);
          box-shadow: 0 0 20px rgba(168,85,247,.9), inset 0 1px 0 rgba(255,255,255,.4);
        }
        .aw-zoom-slider::-moz-range-thumb {
          width: 18px;
          height: 18px;
          border-radius: 50%;
          background: linear-gradient(135deg, #c084fc, #a855f7);
          border: 2px solid rgba(255,255,255,.25);
          cursor: pointer;
          box-shadow: 0 0 12px rgba(168,85,247,.7);
        }
      `}} />

      <div className="aw-crop-glass aw-crop-modal w-full max-w-md">

        {/* Header */}
        <div
          className="p-4 flex items-center justify-between"
          style={{
            borderBottom: '1px solid rgba(168,85,247,.18)',
            background: 'rgba(0,0,0,.3)',
          }}
        >
          <div className="flex items-center gap-2.5">
            <div
              className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
              style={{
                background: 'rgba(168,85,247,.12)',
                border: '1px solid rgba(168,85,247,.3)',
                color: '#c084fc',
                boxShadow: '0 0 16px -4px rgba(168,85,247,.5)',
              }}
            >
              <Crop className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-zinc-100 flex items-center gap-2">
                {title}
                <span
                  className="hidden sm:inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[8px] font-mono uppercase tracking-widest"
                  style={{
                    background: 'rgba(168,85,247,.1)',
                    border: '1px solid rgba(168,85,247,.3)',
                    color: '#c084fc',
                  }}
                >
                  <Hexagon size={7} />
                  ASTROWAX
                </span>
              </h3>
            </div>
          </div>

          <button
            onClick={onCancel}
            className="p-2 rounded-lg aw-crop-btn text-zinc-500 hover:text-white transition-colors"
            style={{
              background: 'rgba(168,85,247,.08)',
              border: '1px solid rgba(168,85,247,.2)',
            }}
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        {/* Cropper Canvas */}
        <div
          className="relative w-full h-80"
          style={{
            background: 'radial-gradient(circle at center, rgba(168,85,247,.06), rgba(0,0,0,.5) 70%)',
          }}
        >
          <Cropper
            image={imageSrc}
            crop={crop}
            zoom={zoom}
            aspect={currentAspect}
            onCropChange={setCrop}
            onCropComplete={handleCropComplete}
            onZoomChange={setZoom}
          />
        </div>

        {/* Controls */}
        <div
          className="p-4"
          style={{
            background: 'rgba(0,0,0,.3)',
            borderTop: '1px solid rgba(168,85,247,.15)',
          }}
        >
          {title === "Crop Background" && (
            <div className="flex gap-2 mb-4">
              <button
                onClick={() => setCurrentAspect(16 / 9)}
                className="flex-1 py-2 rounded-lg text-xs font-semibold aw-crop-btn"
                style={
                  currentAspect === 16 / 9
                    ? {
                        background: 'linear-gradient(135deg, #a855f7, #7e22ce)',
                        color: '#fff',
                        boxShadow: '0 4px 16px -4px rgba(168,85,247,.6)',
                        border: '1px solid rgba(168,85,247,.5)',
                      }
                    : {
                        background: 'rgba(0,0,0,.4)',
                        border: '1px solid rgba(168,85,247,.2)',
                        color: '#a1a1aa',
                      }
                }
              >
                16:9 (PC)
              </button>
              <button
                onClick={() => setCurrentAspect(9 / 16)}
                className="flex-1 py-2 rounded-lg text-xs font-semibold aw-crop-btn"
                style={
                  currentAspect === 9 / 16
                    ? {
                        background: 'linear-gradient(135deg, #a855f7, #7e22ce)',
                        color: '#fff',
                        boxShadow: '0 4px 16px -4px rgba(168,85,247,.6)',
                        border: '1px solid rgba(168,85,247,.5)',
                      }
                    : {
                        background: 'rgba(0,0,0,.4)',
                        border: '1px solid rgba(168,85,247,.2)',
                        color: '#a1a1aa',
                      }
                }
              >
                9:16 (Mobile)
              </button>
            </div>
          )}

          <label
            className="block text-[11px] font-semibold uppercase tracking-widest mb-2.5 flex items-center gap-1.5"
            style={{ color: '#c084fc' }}
          >
            <Sparkles size={11} />
            Zoom
          </label>

          <input
            type="range"
            value={zoom}
            min={1}
            max={3}
            step={0.1}
            aria-labelledby="Zoom"
            onChange={(e) => setZoom(Number(e.target.value))}
            className="aw-zoom-slider"
          />

          <div className="mt-6 flex gap-3 justify-end">
            <button
              onClick={onCancel}
              className="px-4 py-2 rounded-xl text-xs font-semibold aw-crop-btn"
              style={{
                background: 'rgba(0,0,0,.4)',
                border: '1px solid rgba(168,85,247,.2)',
                color: '#a1a1aa',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = '#c084fc';
                e.currentTarget.style.borderColor = 'rgba(168,85,247,.5)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = '#a1a1aa';
                e.currentTarget.style.borderColor = 'rgba(168,85,247,.2)';
              }}
            >
              Cancel
            </button>

            <button
              onClick={showCroppedImage}
              className="px-5 py-2 rounded-xl text-xs font-semibold aw-crop-btn flex items-center gap-2 text-white"
              style={{
                background: 'linear-gradient(135deg, #a855f7, #7e22ce)',
                boxShadow: '0 4px 16px -4px rgba(168,85,247,.6)',
              }}
            >
              <Check size={16} />
              Apply Crop
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}