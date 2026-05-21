import React from 'react';
import ldpVaultProfLogoUrl from '../assets/ldp_vault_professional_logo.png';

const LDPLogo: React.FC<{ className?: string }> = ({ className = "h-20 w-auto" }) => {
  return (
    <img 
      src={ldpVaultProfLogoUrl} 
      alt="LDP VAULT - LOCK" 
      className={`${className} object-contain`} 
    />
  );
};

export default LDPLogo;
