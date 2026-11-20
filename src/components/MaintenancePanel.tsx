import React, { useState } from 'react';
import {
  AlertCircle,
  Bell,
  BellOff,
  Calendar,
  Check,
  CheckCircle2,
  ClipboardPenLine,
  Plus,
  Trash2,
  X,
} from 'lucide-react';
import type { MaintenanceItem, OilCondition, WorkshopNote } from '../types/vehicle';
import { TelltaleIcon } from './TelltaleIcons';

interface MaintenancePanelProps {
  currentKm: number;
  items: MaintenanceItem[];
  workshopNotes: WorkshopNote[];
  soundAlertsEnabled: boolean;
  onToggleSoundAlerts: () => void;
  onMarkDoneToday: (id: string) => void;
  onUpdateItemDetails: (id: string, patch: Partial<MaintenanceItem>) => void;
  onAddItem: (item: Omit<MaintenanceItem, 'id'>) => void;
  onDeleteItem: (id: string) => void;
  onAddNote: (text: string) => void;
  onDeleteNote: (id: string) => void;
}

const OIL_CONDITIONS: { value: OilCondition; label: string; colorClass: string }[] = [
  { value: 'sin_revisar', label: 'Sin revisar', colorClass: 'text-[#9CA3AF]' },
  { value: 'optimo', label: 'Óptimo (limpio)', colorClass: 'text-emerald-400' },
  { value: 'medio', label: 'Nivel medio', colorClass: 'text-blue-300' },
  { value: 'oscuro', label: 'Oscuro (por cambiar)', colorClass: 'text-amber-400' },
  { value: 'bajo', label: 'Bajo nivel', colorClass: 'text-red-400' },
];

export const MaintenancePanel: React.FC<MaintenancePanelProps> = ({
  currentKm,
  items,
  workshopNotes,
  soundAlertsEnabled,
  onToggleSoundAlerts,
  onMarkDoneToday,
  onUpdateItemDetails,
  onAddItem,
  onDeleteItem,
  onAddNote,
  onDeleteNote,
}) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editKm, setEditKm] = useState('');
  const [editDate, setEditDate] = useState('');
  const [editInterval, setEditInterval] = useState('');
  const [editSparkBrand, setEditSparkBrand] = useState('');
  const [editSparkCount, setEditSparkCount] = useState('');

  const [showAddForm, setShowAddForm] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newInterval, setNewInterval] = useState('5000');
  const [newNotes, setNewNotes] = useState('');

  const [noteInput, setNoteInput] = useState('');

  const openEditor = (item: MaintenanceItem) => {
    setEditingId(item.id);
    setEditKm(
      item.lastServiceKm !== null
        ? String(Math.round(item.lastServiceKm))
        : String(Math.round(currentKm))
    );
    setEditDate(item.lastServiceDate || new Date().toISOString().slice(0, 10));
    setEditInterval(String(item.intervalKm));
    setEditSparkBrand(item.sparkPlugBrand || '');
    setEditSparkCount(item.sparkPlugCount ? String(item.sparkPlugCount) : '');
  };

  const handleSaveEdit = (e: React.FormEvent, item: MaintenanceItem) => {
    e.preventDefault();
    const kmVal = Math.max(0, parseFloat(editKm) || 0);
    const intervalVal = Math.max(500, parseInt(editInterval, 10) || 5000);
    const dateVal = editDate || new Date().toISOString().slice(0, 10);

    const patch: Partial<MaintenanceItem> = {
      lastServiceKm: kmVal,
      lastServiceDate: dateVal,
      intervalKm: intervalVal,
    };

    if (item.kind === 'bujias') {
      patch.sparkPlugBrand = editSparkBrand.trim();
      const parsedCount = parseInt(editSparkCount, 10);
      patch.sparkPlugCount =
        !Number.isNaN(parsedCount) && parsedCount > 0 ? Math.min(16, parsedCount) : null;
    }

    onUpdateItemDetails(item.id, patch);
    setEditingId(null);
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    onAddItem({
      title: newTitle.trim(),
      kind: 'otro',
      intervalKm: Math.max(500, parseInt(newInterval, 10) || 5000),
      lastServiceKm: null,
      lastServiceDate: '',
      warnBeforeKm: 500,
      enabled: true,
      notes: newNotes.trim(),
    });
    setNewTitle('');
    setNewNotes('');
    setShowAddForm(false);
  };

  const handleAddNoteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteInput.trim()) return;
    onAddNote(noteInput.trim());
    setNoteInput('');
  };

  const dueCount = items.filter((item) => {
    if (!item.enabled || item.lastServiceKm === null) return false;
    return item.lastServiceKm + item.intervalKm - currentKm <= item.warnBeforeKm;
  }).length;

  return (
    <section
      aria-label="Pulso Mecánico"
      className="rounded-2xl bg-[var(--bg-card)] border border-white/[0.08] p-5 space-y-4 transition-colors duration-300"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-xl font-semibold text-[#F3F4F6]">
            Pulso Mecánico
          </h2>
          <p className="text-xs text-[#9CA3AF] mt-0.5">
            {dueCount === 0
              ? 'Control local de motor, bujías, correa, cauchos y filtros'
              : `${dueCount} testigo(s) activo(s) en el tablero`}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onToggleSoundAlerts}
            className="min-h-[40px] px-3 rounded-xl bg-[#111318] hover:bg-[#1B1F27] border border-white/[0.08] text-xs font-medium text-[#F3F4F6] flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
          >
            {soundAlertsEnabled ? (
              <Bell className="w-4 h-4 text-blue-400" />
            ) : (
              <BellOff className="w-4 h-4 text-[#9CA3AF]" />
            )}
            {soundAlertsEnabled ? 'Aviso Sonoro' : 'Silenciado'}
          </button>

          <button
            type="button"
            onClick={() => setShowAddForm((s) => !s)}
            className="min-h-[40px] px-3 rounded-xl bg-[#111318] hover:bg-[#1B1F27] border border-white/[0.08] text-xs font-medium text-[#F3F4F6] flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
          >
            {showAddForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
            {showAddForm ? 'Cerrar' : 'Agregar'}
          </button>
        </div>
      </div>

      {showAddForm && (
        <form
          onSubmit={handleCreate}
          className="rounded-xl bg-[#000000] border border-white/10 p-4 space-y-3"
        >
          <div className="text-xs font-semibold text-[#F3F4F6]">Nuevo control mecánico</div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input
              type="text"
              required
              placeholder="Ej. Pastillas de freno"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              className="min-h-[42px] px-3 rounded-xl bg-[#111318] border border-white/10 text-sm text-[#F3F4F6]"
            />
            <input
              type="number"
              min="500"
              step="500"
              placeholder="Cada cuántos km"
              value={newInterval}
              onChange={(e) => setNewInterval(e.target.value)}
              className="min-h-[42px] px-3 rounded-xl bg-[#111318] border border-white/10 font-mono-tabular text-sm text-[#F3F4F6]"
            />
          </div>
          <input
            type="text"
            placeholder="Nota opcional"
            value={newNotes}
            onChange={(e) => setNewNotes(e.target.value)}
            className="w-full min-h-[42px] px-3 rounded-xl bg-[#111318] border border-white/10 text-sm text-[#F3F4F6]"
          />
          <button
            type="submit"
            className="w-full min-h-[42px] rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold cursor-pointer"
          >
            Guardar
          </button>
        </form>
      )}

      <div className="space-y-3">
        {items.map((item) => {
          const isRegistered = item.lastServiceKm !== null;
          const nextDueKm = isRegistered ? item.lastServiceKm! + item.intervalKm : null;
          const remainingKm = nextDueKm !== null ? nextDueKm - currentKm : null;
          const elapsed = isRegistered ? Math.max(0, currentKm - item.lastServiceKm!) : 0;
          const progress = isRegistered ? Math.min(1, Math.max(0, elapsed / item.intervalKm)) : 0;

          const isOverdue = remainingKm !== null && remainingKm <= 0;
          const isWarning = remainingKm !== null && !isOverdue && remainingKm <= item.warnBeforeKm;
          const isEditing = editingId === item.id;

          const iconColor = !isRegistered
            ? 'text-[#9CA3AF]'
            : isOverdue
              ? 'text-red-500'
              : isWarning
                ? 'text-amber-400'
                : 'text-emerald-400';

          const oilMeta =
            item.kind === 'aceite'
              ? OIL_CONDITIONS.find((c) => c.value === (item.oilCondition || 'sin_revisar'))
              : null;

          return (
            <div
              key={item.id}
              className="rounded-xl bg-[#000000] border border-white/[0.08] p-4 space-y-3"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-2.5 min-w-0">
                  <div className={`shrink-0 mt-0.5 ${iconColor}`}>
                    <TelltaleIcon kind={item.kind} className="w-6 h-6" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-sm font-semibold text-[#F3F4F6] truncate">{item.title}</h3>
                    {isRegistered ? (
                      <div className="mt-1 text-xs text-[#9CA3AF] flex flex-wrap items-center gap-x-2 gap-y-0.5">
                        <span className="inline-flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {item.lastServiceDate}
                        </span>
                        <span aria-hidden="true">·</span>
                        <span className="font-mono-tabular">
                          a los {item.lastServiceKm!.toLocaleString('es-ES')} km
                        </span>
                        <span aria-hidden="true">·</span>
                        <span>Cada {item.intervalKm.toLocaleString('es-ES')} km</span>
                      </div>
                    ) : (
                      <div className="mt-1 text-xs text-[#9CA3AF]">
                        Sin fecha registrada aún · Cada {item.intervalKm.toLocaleString('es-ES')} km
                      </div>
                    )}

                    {/* Spark plug brand & count display */}
                    {item.kind === 'bujias' &&
                      (item.sparkPlugBrand || item.sparkPlugCount) && (
                        <div className="mt-1 text-xs text-blue-300 flex flex-wrap items-center gap-x-2">
                          {item.sparkPlugBrand && <span>Marca: {item.sparkPlugBrand}</span>}
                          {item.sparkPlugCount && (
                            <span className="font-mono-tabular">
                              · {item.sparkPlugCount} bujía(s)
                            </span>
                          )}
                        </div>
                      )}
                  </div>
                </div>

                <div className="text-right shrink-0">
                  {isRegistered && remainingKm !== null && nextDueKm !== null ? (
                    <>
                      <div
                        className={`font-mono-tabular text-xs font-bold flex items-center justify-end gap-1 ${
                          isOverdue
                            ? 'text-red-400'
                            : isWarning
                              ? 'text-amber-400'
                              : 'text-emerald-400'
                        }`}
                      >
                        {isOverdue ? (
                          <>
                            <AlertCircle className="w-3.5 h-3.5" />
                            ¡Toca cambiar ya!
                          </>
                        ) : isWarning ? (
                          <>
                            <AlertCircle className="w-3.5 h-3.5" />
                            Faltan {Math.round(remainingKm)} km
                          </>
                        ) : (
                          <>
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Faltan {Math.round(remainingKm).toLocaleString('es-ES')} km
                          </>
                        )}
                      </div>
                      <div className="text-[11px] font-mono-tabular text-[#9CA3AF] mt-0.5">
                        Próx: {nextDueKm.toLocaleString('es-ES')} km
                      </div>
                    </>
                  ) : (
                    <span className="text-xs text-[#9CA3AF]">Pendiente</span>
                  )}
                </div>
              </div>

              {/* Oil Dipstick Condition Selector directly on the oil card */}
              {item.kind === 'aceite' && (
                <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-[#0B0D12] border border-white/[0.06] px-3 py-2">
                  <span className="text-xs text-[#9CA3AF]">
                    ¿Cómo está el aceite?:{' '}
                    <strong className={oilMeta?.colorClass}>{oilMeta?.label}</strong>
                  </span>
                  <select
                    aria-label="Estado del aceite en varilla"
                    value={item.oilCondition || 'sin_revisar'}
                    onChange={(e) =>
                      onUpdateItemDetails(item.id, {
                        oilCondition: e.target.value as OilCondition,
                      })
                    }
                    className="min-h-[34px] px-2.5 rounded-lg bg-[#111318] border border-white/10 text-xs text-[#F3F4F6] cursor-pointer"
                  >
                    {OIL_CONDITIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {isRegistered && (
                <div className="h-1.5 w-full rounded-full bg-[#181B22] overflow-hidden">
                  <div
                    className={`h-full transition-transform duration-300 origin-left ${
                      isOverdue ? 'bg-red-500' : isWarning ? 'bg-amber-500' : 'bg-emerald-500'
                    }`}
                    style={{ transform: `scaleX(${Math.max(0.03, progress)})` }}
                  />
                </div>
              )}

              {isEditing ? (
                <form
                  onSubmit={(e) => handleSaveEdit(e, item)}
                  className="pt-2 border-t border-white/[0.06] grid grid-cols-1 sm:grid-cols-3 gap-2.5"
                >
                  <div>
                    <label className="block text-[11px] text-[#9CA3AF] mb-1">
                      Fecha del cambio
                    </label>
                    <input
                      type="date"
                      value={editDate}
                      onChange={(e) => setEditDate(e.target.value)}
                      className="w-full min-h-[40px] px-2.5 rounded-xl bg-[#111318] border border-white/10 text-xs text-[#F3F4F6]"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-[#9CA3AF] mb-1">
                      Km de ese cambio
                    </label>
                    <input
                      type="number"
                      value={editKm}
                      onChange={(e) => setEditKm(e.target.value)}
                      className="w-full min-h-[40px] px-2.5 rounded-xl bg-[#111318] border border-white/10 font-mono-tabular text-xs text-[#F3F4F6]"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-[#9CA3AF] mb-1">
                      Cada cuántos km
                    </label>
                    <input
                      type="number"
                      min="500"
                      step="500"
                      value={editInterval}
                      onChange={(e) => setEditInterval(e.target.value)}
                      className="w-full min-h-[40px] px-2.5 rounded-xl bg-[#111318] border border-white/10 font-mono-tabular text-xs text-[#F3F4F6]"
                    />
                  </div>

                  {item.kind === 'bujias' && (
                    <>
                      <div className="sm:col-span-2">
                        <label className="block text-[11px] text-[#9CA3AF] mb-1">
                          Marca de bujías colocada
                        </label>
                        <input
                          type="text"
                          placeholder="Ej. NGK, Motorcraft, Bosch"
                          value={editSparkBrand}
                          onChange={(e) => setEditSparkBrand(e.target.value)}
                          className="w-full min-h-[40px] px-2.5 rounded-xl bg-[#111318] border border-white/10 text-xs text-[#F3F4F6]"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] text-[#9CA3AF] mb-1">
                          Cuántas bujías puso
                        </label>
                        <input
                          type="number"
                          min="1"
                          max="16"
                          placeholder="Ej. 4"
                          value={editSparkCount}
                          onChange={(e) => setEditSparkCount(e.target.value)}
                          className="w-full min-h-[40px] px-2.5 rounded-xl bg-[#111318] border border-white/10 font-mono-tabular text-xs text-[#F3F4F6]"
                        />
                      </div>
                    </>
                  )}

                  <div className="sm:col-span-3 flex items-center justify-end gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setEditingId(null)}
                      className="min-h-[40px] px-3 rounded-xl bg-[#111318] text-xs text-[#D1D5DB] cursor-pointer"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="min-h-[40px] px-4 rounded-xl bg-blue-600 text-white text-xs font-semibold cursor-pointer"
                    >
                      Guardar
                    </button>
                  </div>
                </form>
              ) : (
                <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => openEditor(item)}
                      className="min-h-[38px] px-3 rounded-lg bg-[#111318] hover:bg-[#1B1F27] text-xs text-[#D1D5DB] cursor-pointer"
                    >
                      {isRegistered
                        ? item.kind === 'bujias'
                          ? 'Editar datos / bujías'
                          : 'Editar fecha / km'
                        : item.kind === 'bujias'
                          ? 'Registrar marca, cant. y fecha'
                          : 'Ingresar fecha y km'}
                    </button>
                    {item.kind === 'otro' && (
                      <button
                        type="button"
                        onClick={() => onDeleteItem(item.id)}
                        aria-label={`Eliminar ${item.title}`}
                        className="min-h-[38px] min-w-[38px] rounded-lg flex items-center justify-center text-[#9CA3AF] hover:text-red-400 cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => onMarkDoneToday(item.id)}
                    className="min-h-[38px] px-3.5 rounded-lg bg-white text-[#000000] hover:bg-gray-200 text-xs font-semibold flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
                  >
                    <Check className="w-3.5 h-3.5" />
                    Cambiado hoy
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Información Adicional del Vehículo (Libreta de Taller Local) */}
      <div className="rounded-xl bg-[#000000] border border-white/[0.08] p-4 space-y-3">
        <div className="flex items-center gap-2">
          <ClipboardPenLine className="w-4 h-4 text-blue-400" />
          <div>
            <h3 className="text-sm font-semibold text-[#F3F4F6]">
              Información Adicional
            </h3>
            <p className="text-[11px] text-[#9CA3AF]">
              Anota cualquier detalle mecánico, repuesto o medida (se guarda en tu teléfono)
            </p>
          </div>
        </div>

        <form onSubmit={handleAddNoteSubmit} className="flex flex-col sm:flex-row gap-2">
          <input
            type="text"
            placeholder="Ej. Correa 4PK850, medida de caucho 165/70R13, calibración..."
            value={noteInput}
            onChange={(e) => setNoteInput(e.target.value)}
            className="flex-1 min-h-[42px] px-3 rounded-xl bg-[#111318] border border-white/10 text-xs text-[#F3F4F6]"
          />
          <button
            type="submit"
            disabled={!noteInput.trim()}
            className="min-h-[42px] px-4 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white text-xs font-semibold cursor-pointer whitespace-nowrap"
          >
            Anotar
          </button>
        </form>

        {workshopNotes.length > 0 && (
          <ul className="space-y-2 pt-1">
            {workshopNotes.map((note) => (
              <li
                key={note.id}
                className="flex items-start justify-between gap-3 rounded-lg bg-[#0B0D12] border border-white/[0.06] px-3 py-2"
              >
                <div className="min-w-0">
                  <p className="text-xs text-[#E5E7EB] break-words">{note.text}</p>
                  <div className="text-[10px] font-mono-tabular text-[#9CA3AF] mt-0.5">
                    {note.date} · {Math.round(note.km).toLocaleString('es-ES')} km
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => onDeleteNote(note.id)}
                  aria-label="Eliminar nota"
                  className="min-h-[34px] min-w-[34px] rounded-lg flex items-center justify-center text-[#9CA3AF] hover:text-red-400 cursor-pointer shrink-0"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
};
