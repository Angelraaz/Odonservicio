import React, { useState } from 'react';
import { CarFront, X } from 'lucide-react';
import type { VehicleProfile } from '../types/vehicle';

interface VehicleProfileModalProps {
  isOpen: boolean;
  vehicle: VehicleProfile;
  onClose: () => void;
  onSave: (updated: VehicleProfile) => void;
}

export const VehicleProfileModal: React.FC<VehicleProfileModalProps> = ({
  isOpen,
  vehicle,
  onClose,
  onSave,
}) => {
  const [name, setName] = useState(vehicle.name);
  const [plate, setPlate] = useState(vehicle.plate);
  const [year, setYear] = useState(String(vehicle.year));
  const [tankCapacityLiters, setTankCapacityLiters] = useState(String(vehicle.tankCapacityLiters));
  const [kmPerLiter, setKmPerLiter] = useState(String(vehicle.kmPerLiter));

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...vehicle,
      name: name.trim() || 'Ford Festiva',
      plate: plate.trim().toUpperCase(),
      year: Math.min(2030, Math.max(1960, parseInt(year, 10) || 1993)),
      tankCapacityLiters: Math.min(120, Math.max(15, parseFloat(tankCapacityLiters) || 38)),
      kmPerLiter: Math.min(40, Math.max(4, parseFloat(kmPerLiter) || 13.5)),
    });
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-sm p-0 sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="vehicle-profile-title"
    >
      <div className="w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl bg-[#0A0B0E] border border-white/[0.12] p-6 space-y-5 shadow-2xl">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <CarFront className="w-5 h-5 text-blue-400" />
            <h2 id="vehicle-profile-title" className="font-display text-xl font-semibold text-[#F3F4F6]">
              Mi Vehículo
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar perfil"
            className="min-h-[44px] min-w-[44px] rounded-xl flex items-center justify-center text-[#9CA3AF] hover:text-white cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="v-name" className="block text-xs text-[#9CA3AF] mb-1">
              Modelo del carro
            </label>
            <input
              id="v-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full min-h-[44px] px-3 rounded-xl bg-[#000000] border border-white/10 text-sm text-[#F3F4F6]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="v-plate" className="block text-xs text-[#9CA3AF] mb-1">
                Placa (opcional)
              </label>
              <input
                id="v-plate"
                type="text"
                placeholder="Ej. ABC-123"
                value={plate}
                onChange={(e) => setPlate(e.target.value)}
                className="w-full min-h-[44px] px-3 rounded-xl bg-[#000000] border border-white/10 font-mono-tabular text-sm uppercase text-[#F3F4F6]"
              />
            </div>

            <div>
              <label htmlFor="v-year" className="block text-xs text-[#9CA3AF] mb-1">
                Año
              </label>
              <input
                id="v-year"
                type="number"
                min="1960"
                max="2030"
                value={year}
                onChange={(e) => setYear(e.target.value)}
                className="w-full min-h-[44px] px-3 rounded-xl bg-[#000000] border border-white/10 font-mono-tabular text-sm text-[#F3F4F6]"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="v-tank" className="block text-xs text-[#9CA3AF] mb-1">
                Tanque (Litros)
              </label>
              <input
                id="v-tank"
                type="number"
                min="15"
                max="120"
                step="1"
                value={tankCapacityLiters}
                onChange={(e) => setTankCapacityLiters(e.target.value)}
                className="w-full min-h-[44px] px-3 rounded-xl bg-[#000000] border border-white/10 font-mono-tabular text-sm text-[#F3F4F6]"
              />
            </div>
            <div>
              <label htmlFor="v-kml" className="block text-xs text-[#9CA3AF] mb-1">
                Consumo (km/L)
              </label>
              <input
                id="v-kml"
                type="number"
                min="4"
                max="40"
                step="0.5"
                value={kmPerLiter}
                onChange={(e) => setKmPerLiter(e.target.value)}
                className="w-full min-h-[44px] px-3 rounded-xl bg-[#000000] border border-white/10 font-mono-tabular text-sm text-[#F3F4F6]"
              />
            </div>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 min-h-[44px] rounded-xl bg-[#111318] text-xs font-medium text-[#F3F4F6] cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 min-h-[44px] rounded-xl bg-blue-600 hover:bg-blue-500 text-xs font-semibold text-white cursor-pointer"
            >
              Guardar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
