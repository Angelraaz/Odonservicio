import React, { useEffect, useState } from 'react';
import { CheckCircle2, History, Lock, ShieldCheck, X } from 'lucide-react';
import type { OdometerAuditEntry, VehicleProfile } from '../types/vehicle';

interface OdometerEditModalProps {
  isOpen: boolean;
  currentKm: number;
  speedKmh: number;
  vehicle: VehicleProfile;
  auditLog: OdometerAuditEntry[];
  onClose: () => void;
  onConfirmUpdate: (newKm: number, reason: string) => void;
  onTogglePinProtection: (enabled: boolean, newPin: string) => void;
}

const REASONS = [
  'Lectura real del tablero de mi carro',
  'Ajuste manual después de reparación',
  'Cambio de guaya / tablero análogo',
  'Corrección inicial',
];

export const OdometerEditModal: React.FC<OdometerEditModalProps> = ({
  isOpen,
  currentKm,
  speedKmh,
  vehicle,
  auditLog,
  onClose,
  onConfirmUpdate,
  onTogglePinProtection,
}) => {
  const [inputKm, setInputKm] = useState<string>(String(Math.round(currentKm)));
  const [reason, setReason] = useState<string>(REASONS[0]);
  const [pinInput, setPinInput] = useState<string>('');
  const [showAudit, setShowAudit] = useState<boolean>(false);
  const [showPinSetup, setShowPinSetup] = useState<boolean>(false);
  const [newPinValue, setNewPinValue] = useState<string>(vehicle.securityPin);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setInputKm(String(Math.round(currentKm)));
      setPinInput('');
      setError(null);
      setShowPinSetup(false);
    }
  }, [isOpen, currentKm]);

  if (!isOpen) return null;

  const isMoving = speedKmh > 5;
  const parsedKm = parseFloat(inputKm.replace(',', '.'));
  const isValidNumber = !Number.isNaN(parsedKm) && parsedKm >= 0 && parsedKm <= 1999999;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (isMoving) {
      setError('Detén el carro por completo antes de modificar el kilometraje total.');
      return;
    }

    if (!isValidNumber) {
      setError('Ingresa un kilometraje válido entre 0 y 1.999.999 km.');
      return;
    }

    if (vehicle.pinEnabled && pinInput !== vehicle.securityPin) {
      setError('El PIN de 4 dígitos no coincide.');
      return;
    }

    onConfirmUpdate(Number(parsedKm.toFixed(1)), reason);
    onClose();
  };

  const handleSavePinSetting = () => {
    if (newPinValue.length !== 4 || !/^\d{4}$/.test(newPinValue)) {
      setError('El PIN debe tener exactamente 4 números.');
      return;
    }
    onTogglePinProtection(!vehicle.pinEnabled, newPinValue);
    setShowPinSetup(false);
    setError(null);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/75 backdrop-blur-sm p-0 sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="edit-odo-title"
    >
      <div className="w-full sm:max-w-md max-h-[90vh] overflow-y-auto rounded-t-3xl sm:rounded-3xl bg-[#13161D] border border-white/[0.1] shadow-2xl">
        <div className="px-6 py-4 border-b border-white/[0.07] flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-amber-400 shrink-0" />
            <h2 id="edit-odo-title" className="font-display text-xl font-semibold text-[#F3F4F6]">
              Modificar Odómetro Total
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar ventana"
            className="min-h-[44px] min-w-[44px] rounded-xl flex items-center justify-center text-[#9CA3AF] hover:text-[#F3F4F6] cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div className="flex items-center gap-1 p-1 bg-[#0B0D11] rounded-xl border border-white/[0.06]">
            <button
              type="button"
              onClick={() => setShowAudit(false)}
              className={`flex-1 min-h-[40px] rounded-lg text-xs font-medium cursor-pointer ${
                !showAudit ? 'bg-[#181B22] text-[#F3F4F6]' : 'text-[#9CA3AF]'
              }`}
            >
              Cambiar total
            </button>
            <button
              type="button"
              onClick={() => setShowAudit(true)}
              className={`flex-1 min-h-[40px] rounded-lg text-xs font-medium flex items-center justify-center gap-1.5 cursor-pointer ${
                showAudit ? 'bg-[#181B22] text-[#F3F4F6]' : 'text-[#9CA3AF]'
              }`}
            >
              <History className="w-3.5 h-3.5" />
              Historial ({auditLog.length})
            </button>
          </div>

          {!showAudit ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <div className="flex items-center justify-between text-xs text-[#9CA3AF] mb-1.5">
                  <label htmlFor="odo-km-input">Kilometraje actual del carro (km)</label>
                  <span className="font-mono-tabular">Hoy: {Math.round(currentKm)} km</span>
                </div>
                <input
                  id="odo-km-input"
                  type="number"
                  step="0.1"
                  min="0"
                  max="1999999"
                  value={inputKm}
                  onChange={(e) => setInputKm(e.target.value)}
                  disabled={isMoving}
                  className="w-full min-h-[50px] px-4 rounded-xl bg-[#0B0D11] border border-white/[0.1] focus:border-amber-500 focus:outline-none font-mono-tabular text-2xl font-bold text-[#F3F4F6]"
                />
              </div>

              <div>
                <label htmlFor="odo-reason" className="block text-xs text-[#9CA3AF] mb-1.5">
                  Motivo
                </label>
                <select
                  id="odo-reason"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full min-h-[44px] px-3 rounded-xl bg-[#0B0D11] border border-white/[0.1] text-sm text-[#F3F4F6]"
                >
                  {REASONS.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
              </div>

              <div className="rounded-2xl bg-[#0B0D11] border border-white/[0.06] p-3.5 space-y-2.5">
                <div className="flex items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-2 text-[#D1D5DB]">
                    <Lock className="w-4 h-4 text-amber-400" />
                    <span>PIN opcional: {vehicle.pinEnabled ? 'Activo' : 'Desactivado'}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowPinSetup((s) => !s)}
                    className="text-xs font-medium text-amber-400 hover:underline cursor-pointer"
                  >
                    {showPinSetup ? 'Cancelar' : vehicle.pinEnabled ? 'Desactivar' : 'Poner PIN'}
                  </button>
                </div>

                {showPinSetup && (
                  <div className="flex items-center gap-2 pt-1">
                    <input
                      type="password"
                      inputMode="numeric"
                      maxLength={4}
                      placeholder="4 dígitos"
                      value={newPinValue}
                      onChange={(e) => setNewPinValue(e.target.value.replace(/\D/g, '').slice(0, 4))}
                      className="flex-1 min-h-[40px] px-3 rounded-xl bg-[#13161D] border border-white/[0.1] font-mono-tabular text-sm text-[#F3F4F6]"
                    />
                    <button
                      type="button"
                      onClick={handleSavePinSetting}
                      className="min-h-[40px] px-3.5 rounded-xl bg-amber-500 text-[#0B0D11] text-xs font-bold cursor-pointer"
                    >
                      {vehicle.pinEnabled ? 'Quitar PIN' : 'Activar'}
                    </button>
                  </div>
                )}

                {vehicle.pinEnabled && !showPinSetup && (
                  <input
                    type="password"
                    inputMode="numeric"
                    maxLength={4}
                    placeholder="Ingresa tu PIN de 4 dígitos"
                    value={pinInput}
                    onChange={(e) => setPinInput(e.target.value.replace(/\D/g, '').slice(0, 4))}
                    className="w-full min-h-[40px] px-3 rounded-xl bg-[#13161D] border border-white/[0.1] font-mono-tabular text-sm text-[#F3F4F6]"
                  />
                )}
              </div>

              {error && (
                <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/25 rounded-xl px-3 py-2">
                  {error}
                </p>
              )}

              <div className="flex items-center gap-3 pt-1">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 min-h-[44px] rounded-xl bg-[#181B22] text-xs font-medium text-[#F3F4F6] cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isMoving}
                  className="flex-1 min-h-[44px] rounded-xl bg-amber-500 hover:bg-amber-400 text-xs font-bold text-[#0B0D11] flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  Guardar
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-2.5 max-h-72 overflow-y-auto">
              {auditLog.length === 0 ? (
                <p className="text-xs text-[#9CA3AF] py-6 text-center">
                  No hay cambios registrados todavía.
                </p>
              ) : (
                auditLog.map((entry) => (
                  <div
                    key={entry.id}
                    className="rounded-xl bg-[#0B0D11] border border-white/[0.06] p-3 text-xs space-y-1"
                  >
                    <div className="flex justify-between gap-2">
                      <span className="font-medium text-[#F3F4F6]">{entry.reason}</span>
                      <span className="font-mono-tabular text-[#9CA3AF]">
                        {new Date(entry.timestamp).toLocaleDateString('es-ES')}
                      </span>
                    </div>
                    <div className="font-mono-tabular text-[#9CA3AF]">
                      {Math.round(entry.previousKm)} km →{' '}
                      <span className="text-amber-400 font-semibold">
                        {Math.round(entry.newKm)} km
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
