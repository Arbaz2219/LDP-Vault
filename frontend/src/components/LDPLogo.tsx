import React from 'react';

const LDPLogo: React.FC<{ className?: string; hideText?: boolean; variant?: 'default' | 'white' }> = ({ 
  className = "h-10 w-auto", 
  hideText = false,
  variant = 'default'
}) => {
  const isWhite = variant === 'white';
  const primaryColor = isWhite ? "#ffffff" : "#0d43af";
  const strokeColor = isWhite ? "#ffffff" : "#1d2736";


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
          stroke={primaryColor} 
          strokeWidth="6" 
          strokeLinecap="round"
        />
        {/* Padlock body */}
        <rect 
          x="20" 
          y="40" 
          width="60" 
          height="46" 
          rx="12" 
          fill={isWhite ? "#ffffff" : "#ffffff"} 
          stroke={isWhite ? "#ffffff" : strokeColor} 
          strokeWidth="4"
        />
        {/* Padlock inner plate - using Professional Gold accent for security feel */}
        <rect 
          x="28" 
          y="48" 
          width="44" 
          height="20" 
          rx="6" 
          fill="#fcc419" 
          stroke={isWhite ? "#fcc419" : strokeColor} 
          strokeWidth="2"
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
        <rect x="29" y="38" width="6" height="5" rx="1" fill={isWhite ? "#ffffff" : strokeColor} />
        <rect x="65" y="38" width="6" height="5" rx="1" fill={isWhite ? "#ffffff" : strokeColor} />
      </svg>

      
      {/* Brand Text - Only shown if hideText is false */}
      {!hideText && (
        <div className="flex flex-col items-center w-full">
          <h1 className={`${isWhite ? 'text-white' : 'text-[#0d43af]'} font-[900] text-[1.6em] tracking-tighter leading-none`}>LDP VAULT</h1>
          <div className="flex items-center gap-1 w-full mt-1">
             <div className={`h-[2px] flex-1 ${isWhite ? 'bg-white' : 'bg-[#0d43af]'} ${isWhite ? '' : 'opacity-30'}`}></div>
             <span className={`${isWhite ? 'text-white' : 'text-[#0d43af]'} text-[0.45em] font-bold tracking-[0.2em] uppercase`}>LOCK</span>
             <div className={`h-[2px] flex-1 ${isWhite ? 'bg-white' : 'bg-[#0d43af]'} ${isWhite ? '' : 'opacity-30'}`}></div>
          </div>
          <p className={`${isWhite ? 'text-white' : 'text-[#0d43af]'} text-[0.4em] font-bold tracking-[0.3em] mt-1 ${isWhite ? '' : 'opacity-90'}`}>SECURE • STORE • PROTECT</p>
        </div>
      )}

    </div>
  );
};

export default LDPLogo;
