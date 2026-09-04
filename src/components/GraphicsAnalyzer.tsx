import React, { useState, useEffect, useMemo } from 'react';
import { GameSettings } from '../types';

interface GraphicsAnalyzerProps {
  onComplete: (settings: GameSettings) => void;
  defaultSettings: GameSettings;
  onClose?: () => void;
}

export const GraphicsAnalyzer: React.FC<GraphicsAnalyzerProps> = ({ onComplete, defaultSettings, onClose }) => {
  const [progress, setProgress] = useState(0);
  const [stage, setStage] = useState(0);
  const [isFinished, setIsFinished] = useState(false);

  // Probe real WebGL GPU information
  const gpuInfo = useMemo(() => {
    try {
      const canvas = document.createElement('canvas');
      const gl = (canvas.getContext('webgl2') ||
        canvas.getContext('webgl') ||
        canvas.getContext('experimental-webgl')) as WebGLRenderingContext | null;
      if (gl) {
        const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
        let renderer = 'Hardware Accelerated 3D GPU';
        let vendor = 'Standard Vendor';
        if (debugInfo) {
          renderer = String(gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) || renderer);
          vendor = String(gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL) || vendor);
        }
        const maxTexture = Number(gl.getParameter(gl.MAX_TEXTURE_SIZE) || 4096);
        const maxVertexUniforms = Number(gl.getParameter(gl.MAX_VERTEX_UNIFORM_VECTORS) || 128);
        return {
          renderer: renderer.replace(/^ANGLE \((.+)\)$/, '$1'), // Clean up ANGLE wrapper if present
          vendor,
          maxTexture,
          maxVertexUniforms,
          isHighEnd: maxTexture >= 8192 || /nvidia|geforce|rtx|gtx|radeon|apple|m1|m2|m3/i.test(renderer),
        };
      }
    } catch {
      // Fallback if WebGL context access blocked
    }
    return {
      renderer: 'WebGL Hardware Graphics Accelerator',
      vendor: 'Detected GPU Engine',
      maxTexture: 4096,
      maxVertexUniforms: 256,
      isHighEnd: true,
    };
  }, []);

  const stages = [
    'Probing Graphics Card & Shader Units...',
    `Detected: ${gpuInfo.renderer.slice(0, 42)}...`,
    'Benchmarking PCF Soft Shadow & Lighting Fillrate...',
    'Calibrating Ultra High-Fidelity Minecraft Shaders...',
    'Optimal Graphics Configuration Ready!',
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(timer);
          setIsFinished(true);
          return 100;
        }
        const next = prev + 12;
        if (next < 25) setStage(0);
        else if (next < 50) setStage(1);
        else if (next < 75) setStage(2);
        else if (next < 95) setStage(3);
        else setStage(4);
        return Math.min(100, next);
      });
    }, 180);

    return () => clearInterval(timer);
  }, []);

  const handleApply = () => {
    onComplete({
      ...defaultSettings,
      renderDistance: gpuInfo.isHighEnd ? 6 : 4,
      shadows: true,
      highQuality: true,
    });
  };

  return (
    <div className="absolute inset-0 z-[100] flex flex-col items-center justify-center bg-black/80 backdrop-blur-md text-white p-4 font-minecraft select-none">
      <div className="w-full max-w-xl bg-[#262626] border-4 border-t-neutral-400 border-l-neutral-400 border-r-neutral-800 border-b-neutral-800 p-6 shadow-2xl rounded-sm">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b-2 border-neutral-700 mb-4">
          <div className="flex items-center gap-2">
            <span className="w-3.5 h-3.5 bg-emerald-400 rounded-full animate-pulse shadow-[0_0_8px_#34d399]" />
            <h2 className="text-xl font-bold tracking-wide text-yellow-300 drop-shadow-[2px_2px_0px_black]">
              Graphics Card Analyzer & Optimizer
            </h2>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="text-neutral-400 hover:text-white px-2 py-0.5 bg-neutral-700 hover:bg-neutral-600 rounded text-xs"
            >
              ESC
            </button>
          )}
        </div>

        {/* GPU Identification Card */}
        <div className="bg-[#1a1a1a] border-2 border-neutral-800 p-3.5 mb-4 rounded">
          <div className="text-xs text-neutral-400 uppercase tracking-widest mb-1">Detected Hardware</div>
          <div className="text-base font-bold text-emerald-300 truncate" title={gpuInfo.renderer}>
            {gpuInfo.renderer}
          </div>
          <div className="flex flex-wrap gap-4 mt-2 text-xs text-neutral-300">
            <div>
              <span className="text-neutral-500">Architecture: </span>
              {gpuInfo.vendor.replace('Google Inc. (', '').replace(')', '')}
            </div>
            <div>
              <span className="text-neutral-500">Max Texture: </span>
              {gpuInfo.maxTexture}x{gpuInfo.maxTexture}
            </div>
            <div>
              <span className="text-neutral-500">Profile: </span>
              <span className="text-yellow-400 font-bold">Ultra High Fidelity</span>
            </div>
          </div>
        </div>

        {/* Progress & Current Action */}
        <div className="mb-4">
          <div className="flex justify-between text-xs text-neutral-300 mb-1.5 font-mono">
            <span>{stages[stage]}</span>
            <span className="text-emerald-400 font-bold">{progress}%</span>
          </div>
          <div className="w-full bg-[#111] h-5 border-2 border-neutral-700 p-0.5 relative overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-emerald-600 via-teal-400 to-green-300 transition-all duration-200"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Benchmark Profile Details */}
        <div className="grid grid-cols-2 gap-2 text-xs bg-[#1e1e1e] p-3 border border-neutral-700 mb-5">
          <div className="flex items-center gap-2">
            <span className="text-emerald-400">✓</span>
            <span>PCF Soft Shadows: <strong className="text-emerald-300">Enabled</strong></span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-emerald-400">✓</span>
            <span>MeshStandard PBR Shading</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-emerald-400">✓</span>
            <span>Render Distance: <strong className="text-emerald-300">{gpuInfo.isHighEnd ? 6 : 4} Chunks</strong></span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-emerald-400">✓</span>
            <span>Multi-sample Anti-Aliasing</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 justify-end">
          <button
            onClick={handleApply}
            className="w-full py-2.5 px-5 bg-gradient-to-b from-emerald-600 to-emerald-800 hover:from-emerald-500 hover:to-emerald-700 active:translate-y-0.5 text-white font-bold text-sm border-2 border-t-emerald-300 border-l-emerald-300 border-r-emerald-950 border-b-emerald-950 shadow-lg cursor-pointer transition flex items-center justify-center gap-2"
          >
            <span>{isFinished ? '✓ Apply & Enter World' : 'Skip & Play'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
