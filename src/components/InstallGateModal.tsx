import React from 'react';
import { Download, Share, Smartphone } from 'lucide-react';
import type { VehicleProfile } from '../types/vehicle';
import { BrandEmblem } from './BrandEmblems';

interface InstallGateModalProps {
  vehicle: VehicleProfile;
  isIOS: boolean;
  isInstallable: boolean;
  onInstall: () => Promise<boolean>;
}

export const InstallGateModal: React.FC<InstallGateModalProps> = ({
  vehicle,
  isIOS,
  isInstallable,
  onInstall,
}) => {
  return (
    <div className="min-h-screen bg-[#050505] text-[#F3F4F6] flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-sm rounded-3xl bg-[#0A0B0E] border border-white/[0.12] p-6 space-y-6 text-center shadow-2xl">
        <div className="flex justify-center">
          <BrandEmblem brand={vehicle.brand} className="w-32 h-20" />
        </div>

        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-400">
            <Smartphone className="w-4 h-4" />
            <span>Aplicación exclusiva instalada</span>
          </div>
          <h1 className="font-display text-2xl font-bold text-white">
            Descarga la App en tu Teléfono
          </h1>
          <p className="text-xs text-[#9CA3AF] leading-relaxed">
            Para evitar navegar dentro de Chrome y guardar tus kilómetros, aceite, bujías y notas de forma segura en tu celular, instala la aplicación gratis.
          </p>
        </div>

        {isInstallable ? (
          <button
            type="button"
            onClick={onInstall}
            className="w-full min-h-[50px] rounded-2xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold flex items-center justify-center gap-2 cursor-pointer transition-colors"
          >
            <Download className="w-5 h-5" />
            Instalar App Gratis Ahora
          </button>
        ) : isIOS ? (
          <div className="rounded-2xl bg-[#000000] border border-white/10 p-4 text-left space-y-2 text-xs text-[#D1D5DB]">
            <div className="font-semibold text-white">Pasos en iPhone / iPad (Safari):</div>
            <p className="flex items-center gap-1.5 flex-wrap">
              <span>1. Toca</span>
              <Share className="w-4 h-4 text-blue-400 inline" />
              <strong>Compartir</strong> abajo en Safari.
            </p>
            <p>2. Toca <strong>Añadir a pantalla de inicio</strong>.</p>
            <p>3. Abre la app desde el ícono instalado en tu pantalla.</p>
          </div>
        ) : (
          <div className="rounded-2xl bg-[#000000] border border-white/10 p-4 text-left space-y-2 text-xs text-[#D1D5DB]">
            <div className="font-semibold text-white">Pasos en Android (Chrome):</div>
            <p>1. Toca el menú <strong>⋮</strong> arriba a la derecha en Chrome.</p>
            <p>2. Selecciona <strong>Instalar aplicación</strong> o <strong>Añadir a pantalla de inicio</strong>.</p>
            <p>3. Abre la app directamente desde tu pantalla de inicio.</p>
          </div>
        )}

        <div className="text-[11px] text-[#6B7280]">
          by AjrcServicios · ajrcs.vercel.app
        </div>
      </div>
    </div>
  );
};
