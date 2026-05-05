import React from 'react';

const BitwardenLockIcon: React.FC = () => {
  return (
    <svg width="120" height="120" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Shackle */}
      <path 
        d="M32 40V30C32 20.0589 40.0589 12 50 12C59.9411 12 68 20.0589 68 30V40" 
        stroke="#172b4d" 
        strokeWidth="3" 
        strokeLinecap="round"
      />
      
      {/* Padlock Body */}
      <rect x="25" y="35" width="50" height="45" rx="8" fill="#e2e8f0" stroke="#172b4d" strokeWidth="3"/>
      
      {/* Yellow Banner */}
      <rect x="10" y="48" width="80" height="18" rx="9" fill="#f6b800" stroke="#172b4d" strokeWidth="3"/>
      
      {/* Asterisks Text */}
      <text x="50" y="61.5" fontFamily="monospace" fontSize="14" fontWeight="900" fill="#172b4d" textAnchor="middle" letterSpacing="3">
        ***__
      </text>
    </svg>
  );
};

export default BitwardenLockIcon;
