import React from 'react';
import ldpVaultFinalLogoUrl from '../assets/ldp_vault_final_logo.png';

const LDPLogo: React.FC<{ className?: string }> = ({ className = "w-12 h-12" }) => {
  return (
    <img 
      src={ldpVaultFinalLogoUrl} 
      alt="LDP VAULT Logo" 
      className={`${className} object-contain`} 
    />
  );
};

export default LDPLogo;
