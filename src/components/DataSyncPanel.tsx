import React, { useRef, useState } from 'react';
import {
  AlertCircle,
  CheckCircle2,
  Download,
  FileJson,
  Upload,
} from 'lucide-react';
import type { OdoSyncBackupFile } from '../types/vehicle';

interface DataSyncPanelProps {
  totalKm: number;
  partialKm: number;
  fuelPct: number;
  maintenanceCount: number;
  notesCount: number;
  buildBackup: () => OdoSyncBackupFile;
  onImportBackup: (backup: OdoSyncBackupFile) => void;
}

export const DataSyncPanel: React.FC<DataSyncPanelProps> = ({
  totalKm,
  partialKm,
  fuelPct,
  maintenanceCount,
  notesCount,
  buildBackup,
  onImportBackup,
}) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleDownload = () => {
    setErrorMsg(null);
    const payload = buildBackup();
    const rawName = (payload.vehicle.name || 'vehiculo')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
    const dateStamp = new Date().toISOString().slice(0, 10);
    const filename = `odosync-${rawName || 'respaldo'}-${dateStamp}.json`;

    const blob = new Blob([JSON.stringify(payload, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);

    setStatusMsg(
      `Archivo descargado (${filename}): ${Math.round(payload.totalKm).toLocaleString('es-ES')} km y ${maintenanceCount} controles guardados.`
    );
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;

    setErrorMsg(null);
    setStatusMsg(null);

    try {
      const text = await file.text();
      const parsed = JSON.parse(text) as Partial<OdoSyncBackupFile>;

      const hasTotalKm = typeof parsed.totalKm === 'number' && !Number.isNaN(parsed.totalKm);
      const hasVehicle = parsed.vehicle && typeof parsed.vehicle === 'object';
      const hasMaintenance = Array.isArray(parsed.maintenance);

      if (!hasTotalKm && !hasVehicle && !hasMaintenance) {
        setErrorMsg(
          'El archivo seleccionado no corresponde a una copia válida de esta aplicación.'
        );
        return;
      }

      const normalized: OdoSyncBackupFile = {
        app: parsed.app || 'OdoSync',
        version: typeof parsed.version === 'number' ? parsed.version : 1,
        exportedAt: parsed.exportedAt || new Date().toISOString(),
        vehicle: hasVehicle ? parsed.vehicle! : {},
        totalKm: hasTotalKm ? Math.max(0, parsed.totalKm!) : totalKm,
        partialKm:
          typeof parsed.partialKm === 'number' && !Number.isNaN(parsed.partialKm)
            ? Math.max(0, parsed.partialKm)
            : partialKm,
        fuelPct:
          typeof parsed.fuelPct === 'number' && !Number.isNaN(parsed.fuelPct)
            ? Math.min(100, Math.max(0, parsed.fuelPct))
            : fuelPct,
        speedStats: parsed.speedStats,
        maintenance: hasMaintenance ? parsed.maintenance : undefined,
        workshopNotes: Array.isArray(parsed.workshopNotes) ? parsed.workshopNotes : undefined,
        auditLog: Array.isArray(parsed.auditLog) ? parsed.auditLog : undefined,
        soundAlertsEnabled:
          typeof parsed.soundAlertsEnabled === 'boolean'
            ? parsed.soundAlertsEnabled
            : undefined,
      };

      onImportBackup(normalized);

      const importedVehicleName = normalized.vehicle.name || 'tu vehículo';
      const importedMaintCount = normalized.maintenance?.length ?? maintenanceCount;
      const importedNotesCount = normalized.workshopNotes?.length ?? notesCount;

      setStatusMsg(
        `Información actualizada desde "${file.name}": ${importedVehicleName} · ${normalized.totalKm.toLocaleString('es-ES', { maximumFractionDigits: 1 })} km · ${importedMaintCount} controles (aceite, bujías, correa, filtros) · ${importedNotesCount} notas.`
      );
    } catch {
      setErrorMsg('No se pudo leer el archivo. Asegúrate de elegir un respaldo .json válido.');
    }
  };

  return (
    <section
      aria-label="Actualizar información"
      className="rounded-2xl bg-[var(--bg-card)] border border-white/[0.08] p-5 space-y-4 transition-colors duration-300"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="font-display text-xl font-semibold text-[#F3F4F6]">
            Actualizar información
          </h2>
          <p className="text-xs text-[#9CA3AF] mt-0.5">
            Lee un archivo exportado de otra copia de esta app para actualizar kilometraje, aceite, bujías y notas, o descarga tu respaldo.
          </p>
        </div>
        <FileJson className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
      </div>

      {/* Summary of current local data ready to export */}
      <div className="text-xs text-[#9CA3AF] flex flex-wrap items-center gap-x-2 gap-y-1">
        <span className="font-mono-tabular text-[#E5E7EB]">
          {totalKm.toLocaleString('es-ES', { maximumFractionDigits: 1 })} km totales
        </span>
        <span aria-hidden="true">·</span>
        <span className="font-mono-tabular">
          {Math.round(fuelPct)}% combustible
        </span>
        <span aria-hidden="true">·</span>
        <span>{maintenanceCount} controles en Pulso Mecánico</span>
        <span aria-hidden="true">·</span>
        <span>{notesCount} notas</span>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept=".json,application/json"
        onChange={handleFileChange}
        className="hidden"
        aria-label="Seleccionar archivo de respaldo para actualizar información"
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="min-h-[48px] px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer whitespace-nowrap"
        >
          <Upload className="w-4 h-4 shrink-0" />
          <span>Actualizar desde archivo</span>
        </button>

        <button
          type="button"
          onClick={handleDownload}
          className="min-h-[48px] px-4 rounded-xl bg-[#111318] hover:bg-[#1B1F27] border border-white/10 text-[#F3F4F6] text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer whitespace-nowrap"
        >
          <Download className="w-4 h-4 shrink-0 text-blue-400" />
          <span>Descargar información</span>
        </button>
      </div>

      {statusMsg && (
        <div
          role="status"
          className="rounded-xl bg-emerald-500/10 border border-emerald-500/25 px-3.5 py-2.5 text-xs text-emerald-200 flex items-start gap-2"
        >
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
          <span>{statusMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div
          role="alert"
          className="rounded-xl bg-red-500/10 border border-red-500/25 px-3.5 py-2.5 text-xs text-red-200 flex items-start gap-2"
        >
          <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
          <span>{errorMsg}</span>
        </div>
      )}
    </section>
  );
};
