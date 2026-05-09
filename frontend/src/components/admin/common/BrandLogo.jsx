import React from 'react';
import logoImg from '../../../assets/logo-pro-final-removebg-preview.png';

/**
 * ISTA Connect - Brand Logo Component (Image Based)
 * Uses the ultra-premium removebg branding.
 */
export default function BrandLogo({ size = 40, className = '' }) {
  return (
    <img 
      src={logoImg}
      alt="ISTA Connect Logo"
      width={size}
      height={size}
      className={`${className} object-contain`}
      style={{ 
        filter: 'drop-shadow(0 0 12px rgba(123, 179, 66, 0.3))',
        display: 'block'
      }}
    />
  );
}
