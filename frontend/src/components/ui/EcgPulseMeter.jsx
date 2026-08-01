import React from 'react';
import { Activity, Heart, Zap } from 'lucide-react';

export default function EcgPulseMeter({ bpm = 74, spo2 = 98, bp = "120/80", className = "" }) {
  return (
    <div className={`rounded-2xl p-5 text-white relative overflow-hidden shadow-xl border border-teal-800/40 bg-[#12302E] ${className}`}>
      {/* Background radial glow */}
      <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Header */}
      <div className="flex justify-between items-center mb-3">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-[#7FE3B4] animate-pulse" />
          <span className="font-mono text-xs uppercase tracking-widest text-[#9FC9C4] font-semibold">
            Live Telemetry Vitals
          </span>
        </div>
        <div className="flex items-center gap-1.5 bg-emerald-950/60 px-2.5 py-1 rounded-full border border-emerald-500/30">
          <span className="w-2 h-2 rounded-full bg-[#7FE3B4] animate-ping" />
          <span className="font-mono text-[11px] text-[#7FE3B4] font-bold tracking-wider">LIVE ECG</span>
        </div>
      </div>

      {/* SVG Animating ECG Waveform */}
      <div className="rounded-xl my-3 py-2 px-2 bg-black/30 border border-white/10 relative">
        <style>{`
          @keyframes ecg-draw-fast {
            0% { stroke-dashoffset: 900; }
            100% { stroke-dashoffset: -900; }
          }
          .ecg-path-animated {
            stroke-dasharray: 900;
            stroke-dashoffset: 900;
            animation: ecg-draw-fast 2.8s linear infinite;
          }
        `}</style>
        
        {/* Background grid lines */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] bg-[size:16px_16px] pointer-events-none" />

        <svg viewBox="0 0 400 90" preserveAspectRatio="none" className="w-full h-[75px] relative z-10">
          <polyline
            className="ecg-path-animated"
            fill="none"
            stroke="#C8862B"
            strokeWidth="2.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            points="0,45 40,45 50,45 58,15 66,75 74,25 82,45 120,45 132,45 140,10 148,80 156,20 164,45 220,45 232,45 240,18 248,72 256,28 264,45 320,45 332,45 340,12 348,78 356,22 364,45 400,45"
          />
        </svg>
      </div>

      {/* Telemetry Metrics Grid */}
      <div className="grid grid-cols-3 gap-2.5 mt-4">
        <div className="rounded-xl p-2.5 bg-white/5 border border-white/10 flex flex-col justify-between">
          <div className="flex items-center justify-between text-rose-400">
            <Heart className="w-3.5 h-3.5 animate-pulse" />
            <span className="text-[10px] text-teal-200/70 font-mono">BPM</span>
          </div>
          <div className="mt-1">
            <div className="font-mono text-xl font-bold text-white">{bpm}</div>
            <div className="text-[10px] text-[#9FC9C4]">Heart Rate</div>
          </div>
        </div>

        <div className="rounded-xl p-2.5 bg-white/5 border border-white/10 flex flex-col justify-between">
          <div className="flex items-center justify-between text-emerald-400">
            <Activity className="w-3.5 h-3.5" />
            <span className="text-[10px] text-teal-200/70 font-mono">%</span>
          </div>
          <div className="mt-1">
            <div className="font-mono text-xl font-bold text-white">{spo2}%</div>
            <div className="text-[10px] text-[#9FC9C4]">SpO2 Saturation</div>
          </div>
        </div>

        <div className="rounded-xl p-2.5 bg-white/5 border border-white/10 flex flex-col justify-between">
          <div className="flex items-center justify-between text-amber-400">
            <Zap className="w-3.5 h-3.5" />
            <span className="text-[10px] text-teal-200/70 font-mono">mmHg</span>
          </div>
          <div className="mt-1">
            <div className="font-mono text-lg font-bold text-white">{bp}</div>
            <div className="text-[10px] text-[#9FC9C4]">Blood Pressure</div>
          </div>
        </div>
      </div>
    </div>
  );
}
