import React, { useState } from 'react';
import { CheckCircle2, Download, Share, Smartphone, X } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface MobileAppStoreCardProps {
  compactTrigger?: boolean;
}

export const MobileAppStoreCard: React.FC<MobileAppStoreCardProps> = ({
  compactTrigger = false,
}) => {
  const { isInstallable, isInstalled, isIOS, isAndroid, install } = usePWAInstall();
  const [showGuideModal, setShowGuideModal] = useState(false);

  const handleInstallAction = async () => {
    if (isInstallable) {
      await install();
      return;
    }
    setShowGuideModal(true);
  };

  if (compactTrigger) {
    if (isInstalled) return null;
    return (
      <>
        <button
          type="button"
          onClick={handleInstallAction}
          className="min-h-[40px] px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-[#0A0C10] text-xs font-semibold flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
        >
          <Download className="w-3.5 h-3.5" />
          Descargar App
        </button>

        {showGuideModal && (
          <MobileInstallModal
            isIOS={isIOS}
            isAndroid={isAndroid}
            isInstallable={isInstallable}
            onInstall={install}
            onClose={() => setShowGuideModal(false)}
          />
        )}
      </>
    );
  }

  return (
    <section
      aria-label="Descarga gratuita exclusiva para iOS y Android"
      className="rounded-2xl bg-[var(--bg-card)] border border-white/[0.08] p-5 sm:p-6 space-y-4 transition-colors duration-300"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="font-display text-xl font-semibold text-[#F4F6F9]">
            Exclusiva iOS y Android
          </h2>
          <p className="text-xs text-[#8E98A8] mt-0.5">
            Descarga gratuita para móviles · Sin anuncios · Funciona sin conexión
          </p>
        </div>
        <Smartphone className="w-5 h-5 text-amber-400 shrink-0" />
      </div>

      {isInstalled ? (
        <div className="rounded-2xl bg-emerald-500/10 border border-emerald-500/25 p-3.5 flex items-center gap-2.5 text-xs text-emerald-300">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>Aplicación móvil instalada y ejecutándose en modo nativo independiente.</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          <button
            type="button"
            onClick={handleInstallAction}
            className="min-h-[48px] px-4 py-2.5 rounded-2xl bg-[#0E1218] hover:bg-[#181D27] border border-white/[0.1] text-left flex items-center gap-3 transition-colors cursor-pointer"
          >
            <Download className="w-4 h-4 text-amber-400 shrink-0" />
            <div className="min-w-0">
              <div className="text-[11px] text-[#8E98A8]">Gratis en iPhone / iPad</div>
              <div className="text-xs font-semibold text-[#F4F6F9] truncate">App Store · iOS</div>
            </div>
          </button>

          <button
            type="button"
            onClick={handleInstallAction}
            className="min-h-[48px] px-4 py-2.5 rounded-2xl bg-[#0E1218] hover:bg-[#181D27] border border-white/[0.1] text-left flex items-center gap-3 transition-colors cursor-pointer"
          >
            <Download className="w-4 h-4 text-emerald-400 shrink-0" />
            <div className="min-w-0">
              <div className="text-[11px] text-[#8E98A8]">Gratis en Android</div>
              <div className="text-xs font-semibold text-[#F4F6F9] truncate">Google Play · Android</div>
            </div>
          </button>
        </div>
      )}

      <p className="text-[11px] text-[#8E98A8] leading-relaxed">
        Diseñada exclusivamente para teléfonos móviles iOS y Android con acceso directo en tu pantalla de inicio e integración Bluetooth vehicular.
      </p>

      {showGuideModal && (
        <MobileInstallModal
          isIOS={isIOS}
          isAndroid={isAndroid}
          isInstallable={isInstallable}
          onInstall={install}
          onClose={() => setShowGuideModal(false)}
        />
      )}
    </section>
  );
};

interface MobileInstallModalProps {
  isIOS: boolean;
  isAndroid: boolean;
  isInstallable: boolean;
  onInstall: () => Promise<boolean>;
  onClose: () => void;
}

const MobileInstallModal: React.FC<MobileInstallModalProps> = ({
  isIOS,
  isAndroid,
  isInstallable,
  onInstall,
  onClose,
}) => {
  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/75 backdrop-blur-sm p-0 sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="install-app-title"
    >
      <div className="w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl bg-[#12161E] border border-white/[0.1] p-6 space-y-5 shadow-2xl">
        <div className="flex items-center justify-between gap-3">
          <h3 id="install-app-title" className="font-display text-xl font-semibold text-[#F4F6F9]">
            Instalar OdoSync Gratis
          </h3>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar guía de instalación"
            className="min-h-[44px] min-w-[44px] rounded-xl flex items-center justify-center text-[#8E98A8] hover:text-[#F4F6F9] hover:bg-[#181D27] cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-3 text-xs text-[#8E98A8] leading-relaxed">
          {isInstallable ? (
            <div className="space-y-3">
              <p className="text-[#F4F6F9]">
                Tu dispositivo es compatible con instalación directa gratuita como aplicación móvil independiente.
              </p>
              <button
                type="button"
                onClick={async () => {
                  const ok = await onInstall();
                  if (ok) onClose();
                }}
                className="w-full min-h-[48px] rounded-xl bg-amber-500 hover:bg-amber-400 text-[#0A0C10] text-sm font-semibold flex items-center justify-center gap-2 cursor-pointer"
              >
                <Download className="w-4 h-4" />
                Instalar Ahora en el Teléfono
              </button>
            </div>
          ) : isIOS ? (
            <div className="rounded-2xl bg-[#0E1218] border border-white/[0.06] p-4 space-y-2.5">
              <div className="text-sm font-semibold text-[#F4F6F9]">
                Instalación gratuita en iOS (App Store Web / Safari)
              </div>
              <ol className="space-y-2 text-[#F4F6F9]/90">
                <li className="flex items-center gap-1.5 flex-wrap">
                  <span>1. Toca el botón</span>
                  <Share className="w-3.5 h-3.5 text-amber-400 inline" />
                  <strong>Compartir</strong> en la barra inferior de Safari.
                </li>
                <li>2. Desliza y selecciona <strong>Añadir a pantalla de inicio</strong>.</li>
                <li>3. Toca <strong>Añadir</strong> arriba a la derecha para abrirla como app en tu teléfono.</li>
              </ol>
            </div>
          ) : (
            <div className="rounded-2xl bg-[#0E1218] border border-white/[0.06] p-4 space-y-2.5">
              <div className="text-sm font-semibold text-[#F4F6F9]">
                Instalación gratuita en {isAndroid ? 'Android (Google Play / Chrome)' : 'iOS y Android'}
              </div>
              <p>
                Abre esta aplicación desde <strong>Chrome en Android</strong> o <strong>Safari en iOS</strong> y selecciona <strong>Instalar aplicación / Añadir a pantalla de inicio</strong> para descargarla gratis en tu celular sin cables ni suscripciones.
              </p>
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={onClose}
          className="w-full min-h-[44px] rounded-xl bg-[#181D27] hover:bg-[#222938] text-xs font-medium text-[#F4F6F9] cursor-pointer"
        >
          Entendido
        </button>
      </div>
    </div>
  );
};
