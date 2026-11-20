import React from 'react';
import type { MaintenanceKind } from '../types/vehicle';

export const TelltaleIcon: React.FC<{
  kind: MaintenanceKind;
  className?: string;
}> = ({ kind, className = 'w-6 h-6' }) => {
  switch (kind) {
    // Classic oil can with dripping drop (Lámpara de aceite)
    case 'aceite':
      return (
        <svg viewBox="0 0 36 28" className={className} fill="none" aria-hidden="true">
          <path
            d="M4 13 L8 13 L10 18 L22 18 L27 11 L30 12 M12 13 L18 13 M15 10 L15 13 M4 13 L4 17 L8 18"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M32 16 C32 16 34 19 34 20.5 C34 21.8 33.1 22.8 32 22.8 C30.9 22.8 30 21.8 30 20.5 C30 19 32 16 32 16 Z"
            fill="currentColor"
          />
        </svg>
      );

    // Classic spin-on oil filter canister
    case 'filtro_aceite':
      return (
        <svg viewBox="0 0 32 32" className={className} fill="none" aria-hidden="true">
          <rect x="9" y="8" width="14" height="18" rx="2.5" stroke="currentColor" strokeWidth="2.2" />
          <line x1="11" y1="5" x2="21" y2="5" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
          <line x1="13" y1="14" x2="19" y2="14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          <line x1="13" y1="19" x2="19" y2="19" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      );

    // Classic spark plug (Bujía)
    case 'bujias':
      return (
        <svg viewBox="0 0 32 32" className={className} fill="none" aria-hidden="true">
          <line x1="16" y1="2" x2="16" y2="6" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
          <rect x="12" y="6" width="8" height="8" rx="1" stroke="currentColor" strokeWidth="2" />
          <line x1="12" y1="9" x2="20" y2="9" stroke="currentColor" strokeWidth="1.5" />
          <rect x="10" y="14" width="12" height="5" rx="1" fill="currentColor" />
          <rect x="13" y="19" width="6" height="5" stroke="currentColor" strokeWidth="1.8" />
          <path d="M16 24 L16 27 M19 25 L19 29 L14 29" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );

    // Classic alternator belt around two pulleys (Correa de alternador)
    case 'correa_alternador':
      return (
        <svg viewBox="0 0 36 28" className={className} fill="none" aria-hidden="true">
          <circle cx="10" cy="14" r="6" stroke="currentColor" strokeWidth="2.2" />
          <circle cx="10" cy="14" r="2" fill="currentColor" />
          <circle cx="26" cy="14" r="4.5" stroke="currentColor" strokeWidth="2.2" />
          <circle cx="26" cy="14" r="1.5" fill="currentColor" />
          <line x1="10" y1="8" x2="26" y2="9.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          <line x1="10" y1="20" x2="26" y2="18.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      );

    // Classic tire tread / wheel (Cauchos)
    case 'cauchos':
      return (
        <svg viewBox="0 0 32 32" className={className} fill="none" aria-hidden="true">
          <circle cx="16" cy="16" r="11" stroke="currentColor" strokeWidth="2.8" />
          <circle cx="16" cy="16" r="4.5" stroke="currentColor" strokeWidth="2" />
          <line x1="16" y1="5" x2="16" y2="11.5" stroke="currentColor" strokeWidth="1.8" />
          <line x1="6.5" y1="21.5" x2="12" y2="18.2" stroke="currentColor" strokeWidth="1.8" />
          <line x1="25.5" y1="21.5" x2="20" y2="18.2" stroke="currentColor" strokeWidth="1.8" />
        </svg>
      );

    // Classic fuel filter / fuel line
    case 'filtro_gasolina':
      return (
        <svg viewBox="0 0 32 32" className={className} fill="none" aria-hidden="true">
          <line x1="3" y1="16" x2="9" y2="16" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
          <rect x="9" y="10" width="14" height="12" rx="3" stroke="currentColor" strokeWidth="2.2" />
          <line x1="23" y1="16" x2="29" y2="16" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
          <path d="M16 13 C16 13 18 16 18 17.5 C18 18.6 17.1 19.5 16 19.5 C14.9 19.5 14 18.6 14 17.5 C14 16 16 13 16 13 Z" fill="currentColor" />
        </svg>
      );

    default:
      return (
        <svg viewBox="0 0 32 32" className={className} fill="none" aria-hidden="true">
          <circle cx="16" cy="16" r="10" stroke="currentColor" strokeWidth="2.2" />
          <line x1="16" y1="11" x2="16" y2="17" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
          <circle cx="16" cy="21" r="1.5" fill="currentColor" />
        </svg>
      );
  }
};
