import React, { useEffect, useState } from 'react';
import type { User } from 'firebase/auth';
import { CheckCircle2, CloudDownload, CloudUpload, HardDrive, LogOut, Mail, X } from 'lucide-react';
import {
  DRIVE_BACKUP_FILENAME,
  downloadBackupFromDrive,
  findBackupFile,
  getDriveAccessToken,
  initDriveAuth,
  signInWithGoogleDrive,
  signOutDrive,
  uploadBackupToDrive,
  type DriveFileMeta,
} from '../lib/googleDrive';
import type { CarBackupPayload } from '../types/vehicle';

interface GoogleDriveBackupPanelProps {
  userEmail: string;
  onChangeEmail: (email: string) => void;
  buildBackupPayload: (email: string) => CarBackupPayload;
  onRestoreBackup: (payload: CarBackupPayload) => void;
}

type PendingAction =
  | { type: 'overwrite_drive'; existingFile: DriveFileMeta }
  | { type: 'restore_local'; existingFile: DriveFileMeta; payload: CarBackupPayload }
  | null;

export const GoogleDriveBackupPanel: React.FC<GoogleDriveBackupPanelProps> = ({
  userEmail,
  onChangeEmail,
  buildBackupPayload,
  onRestoreBackup,
}) => {
  const [googleUser, setGoogleUser] = useState<User | null>(null);
  const [needsAuth, setNeedsAuth] = useState<boolean>(true);
  const [isLoggingIn, setIsLoggingIn] = useState<boolean>(false);
  const [isBusy, setIsBusy] = useState<boolean>(false);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [lastSyncedAt, setLastSyncedAt] = useState<string | null>(null);
  const [pendingAction, setPendingAction] = useState<PendingAction>(null);

  useEffect(() => {
    const unsub = initDriveAuth(
      (user) => {
        setGoogleUser(user);
        setNeedsAuth(false);
        if (user.email) {
          onChangeEmail(user.email);
        }
      },
      (user) => {
        setGoogleUser(user);
        setNeedsAuth(true);
      }
    );
    return () => unsub();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleGoogleLogin = async () => {
    setErrorMsg(null);
    setStatusMsg(null);
    setIsLoggingIn(true);
    try {
      const result = await signInWithGoogleDrive(userEmail);
      setGoogleUser(result.user);
      setNeedsAuth(false);
      if (result.user.email) {
        onChangeEmail(result.user.email);
      }
      setStatusMsg('Cuenta de Google conectada para respaldar en Drive.');
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'No se pudo iniciar sesión con Google.';
      setErrorMsg(msg);
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = async () => {
    await signOutDrive();
    setGoogleUser(null);
    setNeedsAuth(true);
    setStatusMsg(null);
    setErrorMsg(null);
  };

  const handleRequestSaveToDrive = async () => {
    setErrorMsg(null);
    setStatusMsg(null);
    const token = getDriveAccessToken();
    if (!token) {
      setNeedsAuth(true);
      setErrorMsg('Primero inicia sesión con Google para guardar en tu Drive.');
      return;
    }

    setIsBusy(true);
    try {
      const existing = await findBackupFile(token);
      if (existing) {
        // Mandatory explicit confirmation before updating/overwriting existing file in Google Drive
        setPendingAction({ type: 'overwrite_drive', existingFile: existing });
        setIsBusy(false);
        return;
      }

      const payload = buildBackupPayload(googleUser?.email || userEmail);
      const saved = await uploadBackupToDrive(token, payload);
      setLastSyncedAt(saved.modifiedTime || new Date().toISOString());
      setStatusMsg(`Respaldo guardado en Google Drive (${DRIVE_BACKUP_FILENAME}).`);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Error al guardar en Google Drive.');
    } finally {
      setIsBusy(false);
    }
  };

  const handleRequestRestoreFromDrive = async () => {
    setErrorMsg(null);
    setStatusMsg(null);
    const token = getDriveAccessToken();
    if (!token) {
      setNeedsAuth(true);
      setErrorMsg('Primero inicia sesión con Google para buscar tu respaldo.');
      return;
    }

    setIsBusy(true);
    try {
      const existing = await findBackupFile(token);
      if (!existing) {
        setErrorMsg(`No se encontró "${DRIVE_BACKUP_FILENAME}" en tu Google Drive.`);
        setIsBusy(false);
        return;
      }
      const downloaded = await downloadBackupFromDrive(token, existing.id);
      setPendingAction({ type: 'restore_local', existingFile: existing, payload: downloaded });
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'No se pudo leer tu respaldo de Drive.');
    } finally {
      setIsBusy(false);
    }
  };

  const handleConfirmPendingAction = async () => {
    if (!pendingAction) return;
    setIsBusy(true);
    setErrorMsg(null);

    try {
      if (pendingAction.type === 'overwrite_drive') {
        const token = getDriveAccessToken();
        if (!token) throw new Error('Sesión expirada. Inicia sesión con Google nuevamente.');
        const payload = buildBackupPayload(googleUser?.email || userEmail);
        const updated = await uploadBackupToDrive(token, payload, pendingAction.existingFile.id);
        setLastSyncedAt(updated.modifiedTime || new Date().toISOString());
        setStatusMsg(`Respaldo actualizado en Google Drive (${DRIVE_BACKUP_FILENAME}).`);
      } else if (pendingAction.type === 'restore_local') {
        onRestoreBackup(pendingAction.payload);
        setStatusMsg('Datos de tu vehículo restaurados desde Google Drive.');
      }
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Operación fallida.');
    } finally {
      setPendingAction(null);
      setIsBusy(false);
    }
  };

  return (
    <section
      aria-label="Respaldo en Google Drive"
      className="rounded-2xl bg-[var(--bg-card)] border border-white/[0.08] p-5 sm:p-6 space-y-4 transition-colors duration-300"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="font-display text-xl font-semibold text-[#F3F4F6]">
            Respaldo en Google Drive
          </h2>
          <p className="text-xs text-[#9CA3AF] mt-0.5">
            Guarda tu kilometraje, combustible y cambios de aceite con tu correo
          </p>
        </div>
        <HardDrive className="w-5 h-5 text-amber-400 shrink-0" />
      </div>

      {/* Email Field */}
      <div>
        <label htmlFor="drive-email-input" className="block text-xs text-[#9CA3AF] mb-1.5">
          Tu correo electrónico
        </label>
        <div className="relative">
          <Mail className="w-4 h-4 text-[#9CA3AF] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            id="drive-email-input"
            type="email"
            placeholder="tucorreo@gmail.com"
            value={userEmail}
            onChange={(e) => onChangeEmail(e.target.value)}
            className="w-full min-h-[44px] pl-10 pr-3 rounded-xl bg-[#0B0D11] border border-white/[0.1] focus:border-amber-500 focus:outline-none text-sm text-[#F3F4F6]"
          />
        </div>
      </div>

      {/* Google Sign-In or Connected Drive Actions */}
      {needsAuth ? (
        <div className="space-y-2.5">
          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={isLoggingIn}
            className="gsi-material-button"
          >
            <div className="gsi-material-button-content-wrapper">
              <div className="gsi-material-button-icon">
                <svg
                  version="1.1"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 48 48"
                  style={{ display: 'block' }}
                >
                  <path
                    fill="#EA4335"
                    d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
                  />
                  <path
                    fill="#4285F4"
                    d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
                  />
                  <path
                    fill="#34A853"
                    d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
                  />
                </svg>
              </div>
              <span>{isLoggingIn ? 'Conectando...' : 'Sign in with Google'}</span>
            </div>
          </button>
          <p className="text-[11px] text-[#9CA3AF]">
            Conecta tu cuenta de Google para crear y guardar tu archivo de respaldo en Google Drive.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="rounded-2xl bg-[#0B0D11] border border-emerald-500/25 px-3.5 py-2.5 flex items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2 min-w-0 text-emerald-300">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span className="truncate">{googleUser?.email || userEmail}</span>
            </div>
            <button
              type="button"
              onClick={handleLogout}
              className="min-h-[36px] px-2 rounded-lg text-[#9CA3AF] hover:text-[#F3F4F6] flex items-center gap-1 cursor-pointer shrink-0"
            >
              <LogOut className="w-3.5 h-3.5" />
              Salir
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <button
              type="button"
              onClick={handleRequestSaveToDrive}
              disabled={isBusy}
              className="min-h-[46px] px-4 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-60 text-[#0B0D11] text-xs font-bold flex items-center justify-center gap-2 cursor-pointer"
            >
              <CloudUpload className="w-4 h-4" />
              Guardar en Drive
            </button>

            <button
              type="button"
              onClick={handleRequestRestoreFromDrive}
              disabled={isBusy}
              className="min-h-[46px] px-4 rounded-xl bg-[#181B22] hover:bg-[#232732] border border-white/[0.08] disabled:opacity-60 text-[#F3F4F6] text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer"
            >
              <CloudDownload className="w-4 h-4 text-amber-400" />
              Cargar de Drive
            </button>
          </div>
        </div>
      )}

      {lastSyncedAt && (
        <p className="text-[11px] font-mono-tabular text-[#9CA3AF]">
          Último respaldo: {new Date(lastSyncedAt).toLocaleString('es-ES')}
        </p>
      )}

      {statusMsg && (
        <div className="rounded-xl bg-emerald-500/10 border border-emerald-500/25 px-3.5 py-2.5 text-xs text-emerald-300">
          {statusMsg}
        </div>
      )}

      {errorMsg && (
        <div
          role="alert"
          className="rounded-xl bg-red-500/10 border border-red-500/25 px-3.5 py-2.5 text-xs text-red-300"
        >
          {errorMsg}
        </div>
      )}

      {/* Explicit Confirmation Dialog Before Mutating User Data */}
      {pendingAction && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/75 backdrop-blur-sm p-0 sm:p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="confirm-drive-title"
        >
          <div className="w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl bg-[#13161D] border border-white/[0.1] p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between gap-3">
              <h3 id="confirm-drive-title" className="font-display text-xl font-semibold text-[#F3F4F6]">
                {pendingAction.type === 'overwrite_drive'
                  ? '¿Actualizar archivo en Google Drive?'
                  : '¿Restaurar datos desde Google Drive?'}
              </h3>
              <button
                type="button"
                onClick={() => setPendingAction(null)}
                aria-label="Cerrar confirmación"
                className="min-h-[40px] min-w-[40px] rounded-xl flex items-center justify-center text-[#9CA3AF] hover:text-[#F3F4F6] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-[#D1D5DB] leading-relaxed">
              {pendingAction.type === 'overwrite_drive'
                ? `Ya existe el archivo "${pendingAction.existingFile.name}" en tu Google Drive. ¿Deseas sobrescribirlo con los datos actuales de tu vehículo?`
                : `Se cargará el respaldo "${pendingAction.existingFile.name}" guardado el ${new Date(
                    pendingAction.payload.savedAt
                  ).toLocaleString('es-ES')} (${pendingAction.payload.totalKm.toFixed(
                    1
                  )} km) y reemplazará los valores actuales en este dispositivo.`}
            </p>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setPendingAction(null)}
                className="flex-1 min-h-[44px] rounded-xl bg-[#181B22] hover:bg-[#232732] text-xs font-medium text-[#F3F4F6] cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmPendingAction}
                disabled={isBusy}
                className="flex-1 min-h-[44px] rounded-xl bg-amber-500 hover:bg-amber-400 text-xs font-bold text-[#0B0D11] cursor-pointer"
              >
                {isBusy ? 'Procesando...' : 'Confirmar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
