import React from 'react';
import ldpVaultBlueLogoUrl from '../assets/ldp_vault_transparent_blue_logo.png';

const LDPLogo: React.FC<{ className?: string }> = ({ className = "h-20 w-auto" }) => {
  return (
    <img 
      src={ldpVaultBlueLogoUrl} 
      alt="LDP VAULT - LOCK" 
      className={`${className} object-contain`} 
    />
  );
};

export default LDPLogo;
