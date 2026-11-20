import React, { useEffect, useState } from 'react';
import { Bike, CarFront, Fuel, X } from 'lucide-react';
import {
  CAR_ENGINE_ESTIMATES,
  getBrandDefinition,
  isValidBrandId,
  MOTO_ENGINE_ESTIMATES,
  VEHICLE_BRANDS,
  type VehicleModelPreset,
} from '../data/vehicleCatalog';
import type { VehicleBrandId, VehicleProfile, VehicleType } from '../types/vehicle';
import { BrandEmblem } from './BrandEmblems';

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
  const initialBrand = isValidBrandId(vehicle.brand) ? vehicle.brand : 'ford';
  const initialType = vehicle.vehicleType || getBrandDefinition(initialBrand).type;

  const [vehicleType, setVehicleType] = useState<VehicleType>(initialType);
  const [brand, setBrand] = useState<VehicleBrandId>(initialBrand);
  const [name, setName] = useState(vehicle.name);
  const [plate, setPlate] = useState(vehicle.plate);
  const [year, setYear] = useState(String(vehicle.year));
  const [tankCapacityLiters, setTankCapacityLiters] = useState(String(vehicle.tankCapacityLiters));
  const [kmPerLiter, setKmPerLiter] = useState(String(vehicle.kmPerLiter));

  useEffect(() => {
    if (!isOpen) return;
    const safeBrand = isValidBrandId(vehicle.brand) ? vehicle.brand : 'ford';
    const safeType = vehicle.vehicleType || getBrandDefinition(safeBrand).type;
    setVehicleType(safeType);
    setBrand(safeBrand);
    setName(vehicle.name);
    setPlate(vehicle.plate);
    setYear(String(vehicle.year));
    setTankCapacityLiters(String(vehicle.tankCapacityLiters));
    setKmPerLiter(String(vehicle.kmPerLiter));
  }, [isOpen, vehicle]);

  if (!isOpen) return null;

  const brandsForType = VEHICLE_BRANDS.filter((b) => b.type === vehicleType);
  const activeBrandDef = brandsForType.find((b) => b.id === brand) || brandsForType[0];
  const engineEstimates = vehicleType === 'moto' ? MOTO_ENGINE_ESTIMATES : CAR_ENGINE_ESTIMATES;

  const applyModelPreset = (preset: VehicleModelPreset) => {
    setName(preset.modelName);
    setYear(String(preset.year));
    setTankCapacityLiters(String(preset.tankCapacityLiters));
    setKmPerLiter(String(preset.kmPerLiter));
  };

  const handleSwitchType = (nextType: VehicleType) => {
    setVehicleType(nextType);
    const firstBrand = VEHICLE_BRANDS.find((b) => b.type === nextType);
    if (firstBrand) {
      setBrand(firstBrand.id);
      if (firstBrand.models[0]) {
        applyModelPreset(firstBrand.models[0]);
      }
    }
  };

  const handleSelectBrand = (nextBrand: VehicleBrandId) => {
    setBrand(nextBrand);
    const def = getBrandDefinition(nextBrand);
    if (def.models[0]) {
      applyModelPreset(def.models[0]);
    }
  };

  const parsedTank = Math.min(120, Math.max(3, parseFloat(tankCapacityLiters) || 38));
  const parsedKmL = Math.min(70, Math.max(4, parseFloat(kmPerLiter) || 13.5));
  const litersPer100Km = (100 / parsedKmL).toFixed(1);
  const litersPerKm = (1 / parsedKmL).toFixed(3);
  const estimatedRangeKm = Math.round(parsedTank * parsedKmL);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const maxYear = vehicleType === 'car' ? 2000 : 2028;
    const rawYear = parseInt(year, 10) || (vehicleType === 'car' ? 1993 : 2015);
    const cleanYear = Math.min(maxYear, Math.max(1960, rawYear));

    onSave({
      ...vehicle,
      vehicleType,
      brand: activeBrandDef.id,
      name: name.trim() || activeBrandDef.label,
      plate: plate.trim().toUpperCase(),
      year: cleanYear,
      tankCapacityLiters: parsedTank,
      kmPerLiter: parsedKmL,
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
      <div className="w-full sm:max-w-lg max-h-[92vh] overflow-y-auto rounded-t-3xl sm:rounded-3xl bg-[#0A0B0E] border border-white/[0.12] p-6 space-y-5 shadow-2xl">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            {vehicleType === 'moto' ? (
              <Bike className="w-5 h-5 text-blue-400" />
            ) : (
              <CarFront className="w-5 h-5 text-blue-400" />
            )}
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
          {/* Segmented Toggle: Carros clásicos (≤2000) vs Motos */}
          <div className="grid grid-cols-2 gap-1.5 p-1 rounded-xl bg-[#000000] border border-white/10">
            <button
              type="button"
              onClick={() => handleSwitchType('car')}
              className={`min-h-[42px] rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer transition-colors ${
                vehicleType === 'car'
                  ? 'bg-blue-600 text-white'
                  : 'text-[#9CA3AF] hover:text-white'
              }`}
            >
              <CarFront className="w-4 h-4" />
              <span>Carro (2000 o antes)</span>
            </button>
            <button
              type="button"
              onClick={() => handleSwitchType('moto')}
              className={`min-h-[42px] rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer transition-colors ${
                vehicleType === 'moto'
                  ? 'bg-blue-600 text-white'
                  : 'text-[#9CA3AF] hover:text-white'
              }`}
            >
              <Bike className="w-4 h-4" />
              <span>Moto</span>
            </button>
          </div>

          {/* Reduced Brands Grid for selected type */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs text-[#9CA3AF]">
                {vehicleType === 'moto' ? 'Marca de moto' : 'Marca de carro clásico'}
              </label>
              <BrandEmblem brand={activeBrandDef.id} className="w-12 h-7" />
            </div>
            <div className="grid grid-cols-3 gap-2">
              {brandsForType.map((b) => {
                const selected = activeBrandDef.id === b.id;
                return (
                  <button
                    key={b.id}
                    type="button"
                    onClick={() => handleSelectBrand(b.id)}
                    className={`min-h-[56px] p-2 rounded-xl border flex flex-col items-center justify-center gap-1 cursor-pointer transition-colors ${
                      selected
                        ? 'bg-blue-600/20 border-blue-500 text-white'
                        : 'bg-[#000000] border-white/10 text-[#9CA3AF] hover:border-white/25'
                    }`}
                  >
                    <BrandEmblem brand={b.id} className="w-9 h-5" />
                    <span className="text-[11px] font-medium truncate max-w-full">{b.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Model Presets with Automatic Tank + Consumption */}
          <div>
            <label className="block text-xs text-[#9CA3AF] mb-1.5">
              Modelos de {activeBrandDef.label} (ajusta tanque y gasto aprox.)
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {activeBrandDef.models.map((preset) => {
                const isSelected = name.trim().toLowerCase() === preset.modelName.toLowerCase();
                return (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => applyModelPreset(preset)}
                    className={`min-h-[54px] px-2.5 py-2 rounded-xl border text-left cursor-pointer transition-colors ${
                      isSelected
                        ? 'bg-blue-600/15 border-blue-500/70 text-white'
                        : 'bg-[#000000] border-white/10 text-[#D1D5DB] hover:border-white/25'
                    }`}
                  >
                    <div className="text-xs font-semibold truncate">{preset.modelName}</div>
                    <div className="text-[10px] font-mono-tabular text-[#9CA3AF] mt-0.5">
                      {preset.engineLabel} · {preset.kmPerLiter} km/L
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Engine-size fallback estimator */}
          <div>
            <label className="block text-[11px] text-[#9CA3AF] mb-1.5">
              ¿Otro modelo? Calcula por tamaño de motor:
            </label>
            <div className="grid grid-cols-3 gap-2">
              {engineEstimates.map((est) => (
                <button
                  key={est.id}
                  type="button"
                  onClick={() => {
                    setTankCapacityLiters(String(est.tankCapacityLiters));
                    setKmPerLiter(String(est.kmPerLiter));
                  }}
                  className="min-h-[42px] px-2 py-1.5 rounded-xl bg-[#111318] hover:bg-[#1B1F27] border border-white/10 text-[10px] text-[#D1D5DB] cursor-pointer text-center"
                >
                  <div className="font-semibold">{est.label}</div>
                  <div className="font-mono-tabular text-[#9CA3AF]">~{est.kmPerLiter} km/L</div>
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2">
              <label htmlFor="v-name" className="block text-xs text-[#9CA3AF] mb-1">
                Modelo
              </label>
              <input
                id="v-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full min-h-[44px] px-3 rounded-xl bg-[#000000] border border-white/10 text-sm text-[#F3F4F6]"
              />
            </div>

            <div>
              <label htmlFor="v-year" className="block text-xs text-[#9CA3AF] mb-1">
                Año {vehicleType === 'car' ? '(≤2000)' : ''}
              </label>
              <input
                id="v-year"
                type="number"
                min="1960"
                max={vehicleType === 'car' ? 2000 : 2028}
                value={year}
                onChange={(e) => setYear(e.target.value)}
                className="w-full min-h-[44px] px-3 rounded-xl bg-[#000000] border border-white/10 font-mono-tabular text-sm text-[#F3F4F6]"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label htmlFor="v-plate" className="block text-xs text-[#9CA3AF] mb-1">
                Placa
              </label>
              <input
                id="v-plate"
                type="text"
                placeholder="Opcional"
                value={plate}
                onChange={(e) => setPlate(e.target.value)}
                className="w-full min-h-[44px] px-3 rounded-xl bg-[#000000] border border-white/10 font-mono-tabular text-sm uppercase text-[#F3F4F6]"
              />
            </div>
            <div>
              <label htmlFor="v-tank" className="block text-xs text-[#9CA3AF] mb-1">
                Tanque (L)
              </label>
              <input
                id="v-tank"
                type="number"
                min="3"
                max="120"
                step="0.5"
                value={tankCapacityLiters}
                onChange={(e) => setTankCapacityLiters(e.target.value)}
                className="w-full min-h-[44px] px-3 rounded-xl bg-[#000000] border border-white/10 font-mono-tabular text-sm text-[#F3F4F6]"
              />
            </div>
            <div>
              <label htmlFor="v-kml" className="block text-xs text-[#9CA3AF] mb-1">
                Rend. (km/L)
              </label>
              <input
                id="v-kml"
                type="number"
                min="4"
                max="70"
                step="0.5"
                value={kmPerLiter}
                onChange={(e) => setKmPerLiter(e.target.value)}
                className="w-full min-h-[44px] px-3 rounded-xl bg-[#000000] border border-white/10 font-mono-tabular text-sm text-[#F3F4F6]"
              />
            </div>
          </div>

          {/* Live Fuel Calculation Summary */}
          <div className="rounded-xl bg-[#000000] border border-white/10 px-3.5 py-2.5 flex items-start gap-2.5 text-xs">
            <Fuel className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div className="space-y-0.5 text-[#D1D5DB]">
              <div className="font-mono-tabular">
                Gasto calculado: <strong>{litersPer100Km} L / 100 km</strong> ({litersPerKm} L por km)
              </div>
              <div className="text-[11px] text-[#9CA3AF] font-mono-tabular">
                Tanque lleno ({parsedTank} L): rinde aprox. <strong>~{estimatedRangeKm} km</strong>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 pt-1">
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
