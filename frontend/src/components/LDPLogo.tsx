import React from 'react';

const LDPLogo: React.FC<{ className?: string; hideText?: boolean }> = ({ className = "h-10 w-auto", hideText = false }) => {
  return (
    <div className={`${className} flex flex-col items-center justify-center select-none shrink-0`}>
      <svg
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={`w-full ${hideText ? 'h-full' : 'h-2/3'} drop-shadow-sm`}
      >
        {/* Padlock shackle */}
        <path 
          d="M32 42V28C32 17.5 40.5 9.5 50 9.5C59.5 9.5 68 17.5 68 28V42" 
          stroke="#175ddc" 
          strokeWidth="4.5" 
          strokeLinecap="round"
        />
        {/* Padlock body */}
        <rect 
          x="20" 
          y="40" 
          width="60" 
          height="46" 
          rx="12" 
          fill="#ffffff" 
          stroke="#1d2736" 
          strokeWidth="4"
        />
        {/* Padlock inner plate illustrating the password dots/keyhole area */}
        <rect 
          x="28" 
          y="48" 
          width="44" 
          height="20" 
          rx="6" 
          fill="#fecb2f" 
          stroke="#1d2736" 
          strokeWidth="3.5"
        />
        <text 
          x="50" 
          y="62" 
          fontFamily="monospace" 
          fontSize="16" 
          fontWeight="900" 
          fill="#1d2736" 
          textAnchor="middle" 
          letterSpacing="2"
        >
          ***--
        </text>
        {/* Base shackle support points */}
        <rect x="29" y="38" width="6" height="5" rx="1" fill="#1d2736" />
        <rect x="65" y="38" width="6" height="5" rx="1" fill="#1d2736" />
      </svg>
      
      {/* Brand Text - Only shown if hideText is false */}
      {!hideText && (
        <div className="flex flex-col items-center w-full">
          <h1 className="text-[#175ddc] font-[900] text-[1.6em] tracking-tighter leading-none">LDP VAULT</h1>
          <div className="flex items-center gap-1 w-full mt-1">
             <div className="h-[2px] flex-1 bg-[#175ddc] opacity-30"></div>
             <span className="text-[#175ddc] text-[0.45em] font-bold tracking-[0.2em] uppercase">LOCK</span>
             <div className="h-[2px] flex-1 bg-[#175ddc] opacity-30"></div>
          </div>
          <p className="text-[#175ddc] text-[0.4em] font-bold tracking-[0.3em] mt-1 opacity-90">SECURE • STORE • PROTECT</p>
        </div>
      )}
    </div>
  );
};

export default LDPLogo;
