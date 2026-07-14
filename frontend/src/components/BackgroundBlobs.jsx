import React from 'react';

export default function BackgroundBlobs() {
  // Generate random stats for 18 distinct rising bubbles
  const bubbles = Array.from({ length: 18 }).map((_, i) => {
    const size = 15 + Math.random() * 60; // 15px to 75px
    const left = Math.random() * 100; // 0% to 100%
    const delay = Math.random() * 12; // 0s to 12s
    const duration = 12 + Math.random() * 18; // 12s to 30s
    return { id: i, size, left, delay, duration };
  });

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
      {/* Glow Orb 1 */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-emerald-500/10 blur-[120px] animate-pulse-subtle" 
           style={{ animationDuration: '8s' }} />
      {/* Glow Orb 2 */}
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-teal-400/8 blur-[120px] animate-pulse-subtle"
           style={{ animationDuration: '12s' }} />
      
      {/* Rising Bubbles container */}
      <div className="absolute inset-0">
        {bubbles.map(bubble => (
          <div
            key={bubble.id}
            className="absolute bg-primary/5 rounded-full border border-primary/10 animate-rise"
            style={{
              width: `${bubble.size}px`,
              height: `${bubble.size}px`,
              left: `${bubble.left}%`,
              bottom: `-100px`,
              animationDelay: `${bubble.delay}s`,
              animationDuration: `${bubble.duration}s`,
              animationIterationCount: 'infinite',
              animationTimingFunction: 'linear'
            }}
          />
        ))}
      </div>

      {/* Moving grid overlay */}
      <div className="absolute inset-0 animated-grid opacity-30" />
    </div>
  );
}
