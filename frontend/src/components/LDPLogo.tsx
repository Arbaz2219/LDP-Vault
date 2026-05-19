import React from 'react';
import ldpLogoUrl from '../assets/ldp_logo.png';

const LDPLogo: React.FC<{ className?: string }> = ({ className = "w-8 h-8" }) => {
  return (
    <img 
      src={ldpLogoUrl} 
      alt="LDP Logo" 
      className={`${className} object-contain`} 
    />
  );
};

export default LDPLogo;
