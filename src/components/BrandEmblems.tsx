import React from 'react';
import { getBrandDefinition, VEHICLE_BRANDS } from '../data/vehicleCatalog';
import type { VehicleBrandId, VehicleProfile } from '../types/vehicle';

export const CAR_BRANDS = VEHICLE_BRANDS.map((b) => ({ id: b.id, label: b.label }));

export const BrandEmblem: React.FC<{
  brand: VehicleBrandId | string;
  className?: string;
}> = ({ brand, className = 'w-20 h-20' }) => {
  switch (brand) {
    case 'ford':
      return (
        <svg viewBox="0 0 140 72" className={className} aria-label="Insignia Ford">
          <ellipse cx="70" cy="36" rx="66" ry="30" fill="#003478" stroke="#D1D5DB" strokeWidth="3.5" />
          <ellipse cx="70" cy="36" rx="60" ry="25" fill="none" stroke="#93C5FD" strokeWidth="1.2" />
          <text
            x="70"
            y="45"
            textAnchor="middle"
            fill="#FFFFFF"
            fontSize="27"
            fontWeight="700"
            fontStyle="italic"
            fontFamily="Georgia, serif"
          >
            Ford
          </text>
        </svg>
      );

    case 'fiat':
      return (
        <svg viewBox="0 0 120 120" className={className} aria-label="Insignia Fiat">
          <circle cx="60" cy="60" r="50" fill="#8B0000" stroke="#E5E7EB" strokeWidth="5" />
          <circle cx="60" cy="60" r="42" fill="none" stroke="#FCA5A5" strokeWidth="1.4" />
          <text
            x="60"
            y="71"
            textAnchor="middle"
            fill="#FFFFFF"
            fontSize="30"
            fontWeight="800"
            letterSpacing="2"
            fontFamily="Plus Jakarta Sans, sans-serif"
          >
            FIAT
          </text>
        </svg>
      );

    case 'lada':
      return (
        <svg viewBox="0 0 140 84" className={className} aria-label="Insignia Lada">
          <ellipse cx="70" cy="42" rx="62" ry="33" fill="#0F2A56" stroke="#E5E7EB" strokeWidth="4" />
          <path
            d="M40 54 L98 54 L90 62 L48 62 Z"
            fill="#E5E7EB"
          />
          <path
            d="M52 51 L66 19 L84 51 Z"
            fill="none"
            stroke="#FFFFFF"
            strokeWidth="3.5"
            strokeLinejoin="round"
          />
          <line x1="66" y1="19" x2="66" y2="54" stroke="#FFFFFF" strokeWidth="2.8" />
        </svg>
      );

    case 'chrysler':
      return (
        <svg viewBox="0 0 160 72" className={className} aria-label="Insignia Chrysler">
          <path
            d="M10 30 L56 26 L80 18 L104 26 L150 30 L138 42 L102 44 L80 54 L58 44 L22 42 Z"
            fill="#1F2937"
            stroke="#E5E7EB"
            strokeWidth="3"
            strokeLinejoin="round"
          />
          <line x1="20" y1="36" x2="54" y2="36" stroke="#9CA3AF" strokeWidth="2" />
          <line x1="106" y1="36" x2="140" y2="36" stroke="#9CA3AF" strokeWidth="2" />
          <circle cx="80" cy="36" r="10" fill="#1D4ED8" stroke="#E5E7EB" strokeWidth="2" />
        </svg>
      );

    case 'volkswagen':
      return (
        <svg viewBox="0 0 110 110" className={className} aria-label="Insignia Volkswagen">
          <circle cx="55" cy="55" r="44" fill="#0F2A56" stroke="#E5E7EB" strokeWidth="4.5" />
          <path
            d="M34 25 L55 56 L76 25 M24 38 L43 82 L55 58 L67 82 L86 38"
            fill="none"
            stroke="#FFFFFF"
            strokeWidth="5.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      );

    case 'chevrolet':
      return (
        <svg viewBox="0 0 140 72" className={className} aria-label="Insignia Chevrolet">
          <polygon
            points="12,26 48,26 52,14 88,14 92,26 128,26 118,46 92,46 88,58 52,58 48,46 22,46"
            fill="#D4AF37"
            stroke="#F3F4F6"
            strokeWidth="3"
            strokeLinejoin="round"
          />
        </svg>
      );

    case 'honda':
      return (
        <svg viewBox="0 0 120 96" className={className} aria-label="Insignia Honda">
          <rect x="18" y="12" width="84" height="72" rx="14" fill="#7F1D1D" stroke="#E5E7EB" strokeWidth="4" />
          <path
            d="M38 24 L42 72 M82 24 L78 72 M41 48 Q60 44 79 48"
            fill="none"
            stroke="#FFFFFF"
            strokeWidth="7"
            strokeLinecap="round"
          />
        </svg>
      );

    case 'yamaha':
      return (
        <svg viewBox="0 0 110 110" className={className} aria-label="Insignia Yamaha">
          <circle cx="55" cy="55" r="44" fill="#1E1B4B" stroke="#E5E7EB" strokeWidth="4.5" />
          <path
            d="M55 20 L55 86 M30 70 L78 40 M80 70 L32 40"
            fill="none"
            stroke="#E5E7EB"
            strokeWidth="4.5"
            strokeLinecap="round"
          />
          <circle cx="55" cy="55" r="7" fill="#E5E7EB" />
        </svg>
      );

    case 'suzuki':
      return (
        <svg viewBox="0 0 110 110" className={className} aria-label="Insignia Suzuki">
          <path
            d="M72 22 L30 44 L76 62 L36 88"
            fill="none"
            stroke="#DC2626"
            strokeWidth="14"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M72 22 L30 44 L76 62 L36 88"
            fill="none"
            stroke="#F3F4F6"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      );

    case 'kawasaki':
      return (
        <svg viewBox="0 0 140 80" className={className} aria-label="Insignia Kawasaki">
          <rect x="12" y="14" width="116" height="52" rx="10" fill="#14532D" stroke="#4ADE80" strokeWidth="3.5" />
          <path
            d="M38 24 L38 56 M38 42 L62 24 M45 37 L64 56"
            fill="none"
            stroke="#FFFFFF"
            strokeWidth="5.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <text
            x="92"
            y="47"
            textAnchor="middle"
            fill="#FFFFFF"
            fontSize="20"
            fontWeight="800"
            fontFamily="Plus Jakarta Sans, sans-serif"
          >
            KAW
          </text>
        </svg>
      );

    case 'bera':
      return (
        <svg viewBox="0 0 140 72" className={className} aria-label="Insignia Bera">
          <rect x="10" y="14" width="120" height="44" rx="12" fill="#991B1B" stroke="#E5E7EB" strokeWidth="3.5" />
          <text
            x="70"
            y="45"
            textAnchor="middle"
            fill="#FFFFFF"
            fontSize="26"
            fontWeight="800"
            letterSpacing="4"
            fontFamily="Plus Jakarta Sans, sans-serif"
          >
            BERA
          </text>
        </svg>
      );

    case 'bajaj':
      return (
        <svg viewBox="0 0 110 110" className={className} aria-label="Insignia Bajaj">
          <polygon
            points="55,12 96,36 96,74 55,98 14,74 14,36"
            fill="#1D4ED8"
            stroke="#E5E7EB"
            strokeWidth="4"
            strokeLinejoin="round"
          />
          <path
            d="M38 30 L64 30 C72 30 74 42 64 48 C75 54 74 78 62 78 L38 78 Z M46 40 L46 47 L60 47 M46 56 L46 68 L60 68"
            fill="none"
            stroke="#FFFFFF"
            strokeWidth="4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      );

    default:
      return (
        <svg viewBox="0 0 140 72" className={className} aria-label="Insignia Ford">
          <ellipse cx="70" cy="36" rx="66" ry="30" fill="#003478" stroke="#D1D5DB" strokeWidth="3.5" />
          <text
            x="70"
            y="45"
            textAnchor="middle"
            fill="#FFFFFF"
            fontSize="27"
            fontWeight="700"
            fontStyle="italic"
            fontFamily="Georgia, serif"
          >
            Ford
          </text>
        </svg>
      );
  }
};

export const StartupSplash: React.FC<{
  vehicle: VehicleProfile;
  isNightMode: boolean;
  onDismiss: () => void;
}> = ({ vehicle, isNightMode, onDismiss }) => {
  const brandDef = getBrandDefinition(vehicle.brand);
  const brandLabel = brandDef.label;

  return (
    <div
      onClick={onDismiss}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') onDismiss();
      }}
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center p-6 cursor-pointer transition-opacity duration-300 ${
        isNightMode ? 'bg-[#050505]' : 'bg-[#000000]'
      }`}
    >
      <div className="flex flex-col items-center text-center space-y-5 animate-[fadeIn_350ms_ease-out]">
        <BrandEmblem brand={vehicle.brand} className="w-36 h-24 sm:w-44 sm:h-28 drop-shadow-2xl" />
        <div className="space-y-1">
          <div className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-white">
            {vehicle.name.toLowerCase().includes(brandLabel.toLowerCase())
              ? vehicle.name
              : `${brandLabel} ${vehicle.name}`}
          </div>
          <div className="text-sm text-[#9CA3AF] font-mono-tabular">
            {brandDef.type === 'moto' ? 'Moto' : 'Carro'} · {vehicle.year}
            {vehicle.plate ? ` · ${vehicle.plate}` : ''}
          </div>
        </div>
        <div className="text-xs text-[#6B7280] pt-4">
          by AjrcServicios · Toca para iniciar
        </div>
      </div>
    </div>
  );
};
