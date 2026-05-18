import React from 'react';

const LDPLogo: React.FC<{ className?: string }> = ({ className = "w-8 h-8" }) => {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Padlock Shackle (Dark Indigo) */}
      <path 
        d="M7.5 8V6.5C7.5 4 9.5 2 12 2C14.5 2 16.5 4 16.5 6.5V8" 
        stroke="#0f2b5c" 
        strokeWidth="2.5" 
        strokeLinecap="round"
      />
      {/* Shield Body (Vibrant Blue) */}
      <path 
        d="M12 22C7.5 21.05 4.5 16.2 4.5 11.2V6.5L12 3.5L19.5 6.5V11.2C19.5 16.2 16.5 21.05 12 22Z" 
        fill="#175ddc"
      />
      {/* White Keyhole */}
      <circle cx="12" cy="11.5" r="2" fill="white" />
      <path d="M10.8 13H13.2L12.7 17H11.3L10.8 13Z" fill="white" />
    </svg>
  );
};

export default LDPLogo;
