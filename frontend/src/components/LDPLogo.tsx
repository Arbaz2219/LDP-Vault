import React from 'react';
import ldpVaultLogoUrl from '../assets/ldp_vault_logo.png';

const LDPLogo: React.FC<{ className?: string }> = ({ className = "w-8 h-8" }) => {
  return (
    <img 
      src={ldpVaultLogoUrl} 
      alt="LDP Vault Logo" 
      className={`${className} object-contain`} 
    />
  );
};

export default LDPLogo;
