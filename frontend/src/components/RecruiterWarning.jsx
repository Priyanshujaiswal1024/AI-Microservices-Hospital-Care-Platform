import React, { useState } from 'react';
import { AlertTriangle, X } from 'lucide-react';

export default function RecruiterWarning() {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  // Use dynamic env variable or fallback
  const githubUrl = import.meta.env.VITE_GITHUB_URL || 'https://github.com/Priyanshujaiswal1024/AI-Microservices-Hospital-Care-Platform';

  return (
    <div
      className="fixed bottom-6 left-6 z-[9999] max-w-[420px] p-5 rounded-2xl border transition-all duration-300 shadow-2xl animate-fade-in"
      style={{
        backgroundColor: '#131313',
        borderColor: 'rgba(234, 179, 8, 0.25)',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5), 0 10px 10px -5px rgba(0, 0, 0, 0.4)',
        color: '#E2E8F0',
      }}
    >
      {/* Close button */}
      <button
        onClick={() => setIsVisible(false)}
        className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors"
        aria-label="Close warning"
      >
        <X className="w-4 h-4" />
      </button>

      {/* Main content layout */}
      <div className="flex gap-4">
        {/* Warning Icon */}
        <div className="flex-shrink-0 mt-1">
          <div className="w-8 h-8 rounded-full bg-yellow-500/10 flex items-center justify-center border border-yellow-500/20">
            <AlertTriangle className="w-4 h-4 text-yellow-500" />
          </div>
        </div>

        {/* Text and action */}
        <div className="space-y-4 flex-1 pr-6">
          <div>
            <h4 className="text-yellow-500 font-bold text-sm tracking-wide">
              Dear Recruiter,
            </h4>
            <p className="text-xs text-slate-350 leading-relaxed mt-2" style={{ color: '#A0AEC0' }}>
              To optimize AWS EC2 cloud costs for this heavy microservices project, the backend may be sleeping. If login fails, please review the architecture on GitHub!
            </p>
          </div>

          {/* GitHub action button */}
          <a
            href={githubUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs transition-all active:scale-[0.98] select-none"
            style={{
              backgroundColor: '#EAB308',
              color: '#131313',
              boxShadow: '0 4px 12px rgba(234, 179, 8, 0.2)',
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.backgroundColor = '#CA8A04';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.backgroundColor = '#EAB308';
            }}
          >
            <svg
              className="w-4 h-4 shrink-0"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
            </svg>
            <span>View Source Code</span>
          </a>
        </div>
      </div>
    </div>
  );
}
