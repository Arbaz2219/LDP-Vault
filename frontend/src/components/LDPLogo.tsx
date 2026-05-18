import React from 'react';

const LDPLogo: React.FC<{ className?: string }> = ({ className = "w-8 h-8" }) => {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path 
        d="M17.5 2H9.5L5 12H11.5L7.5 22L19 10.5H12L17.5 2Z" 
        fill="url(#lightning-gradient)"
        stroke="url(#lightning-gradient)"
        strokeWidth="0.5"
        strokeLinejoin="round"
      />
      <defs>
        <linearGradient id="lightning-gradient" x1="5" y1="2" x2="19" y2="22" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#a855f7" />
          <stop offset="100%" stopColor="#3b82f6" />
        </linearGradient>
      </defs>
    </svg>
  );
};

export default LDPLogo;
