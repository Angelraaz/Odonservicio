import { initializeApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithPopup,
  type User,
} from 'firebase/auth';
import firebaseConfig from '../../firebase-applet-config.json';
import type { CarBackupPayload } from '../types/vehicle';

export const DRIVE_BACKUP_FILENAME = 'festiva93_odosync_respaldo.json';

const SCOPES = ['https://www.googleapis.com/auth/drive.file'];

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

const provider = new GoogleAuthProvider();
SCOPES.forEach((scope) => provider.addScope(scope));

// In-memory access token cache (never stored in localStorage or sessionStorage)
let isSigningIn = false;
let cachedAccessToken: string | null = null;

export const initDriveAuth = (
  onAuthSuccess?: (user: User, token: string) => void,
  onAuthFailure?: (user: User | null) => void
) => {
  return onAuthStateChanged(auth, (user: User | null) => {
    if (user) {
      if (cachedAccessToken) {
        onAuthSuccess?.(user, cachedAccessToken);
      } else if (!isSigningIn) {
        cachedAccessToken = null;
        onAuthFailure?.(user);
      }
    } else {
      cachedAccessToken = null;
      onAuthFailure?.(null);
    }
  });
};

export const signInWithGoogleDrive = async (
  loginHintEmail?: string
): Promise<{ user: User; accessToken: string }> => {
  try {
    isSigningIn = true;
    if (loginHintEmail && loginHintEmail.trim()) {
      provider.setCustomParameters({ login_hint: loginHintEmail.trim() });
    }
    const result = await signInWithPopup(auth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    if (!credential?.accessToken) {
      throw new Error('No se recibió el permiso de acceso a Google Drive.');
    }
    cachedAccessToken = credential.accessToken;
    return { user: result.user, accessToken: cachedAccessToken };
  } finally {
    isSigningIn = false;
  }
};

export const getDriveAccessToken = (): string | null => cachedAccessToken;

export const signOutDrive = async () => {
  await auth.signOut();
  cachedAccessToken = null;
};

export interface DriveFileMeta {
  id: string;
  name: string;
  modifiedTime?: string;
}

export async function findBackupFile(accessToken: string): Promise<DriveFileMeta | null> {
  const query = encodeURIComponent(`name='${DRIVE_BACKUP_FILENAME}' and trashed=false`);
  const res = await fetch(
    `https://www.googleapis.com/drive/v3/files?q=${query}&fields=files(id,name,modifiedTime)&spaces=drive`,
    {
      headers: { Authorization: `Bearer ${accessToken}` },
    }
  );
  if (!res.ok) {
    throw new Error('No se pudo consultar Google Drive. Vuelve a iniciar sesión.');
  }
  const data = (await res.json()) as { files?: DriveFileMeta[] };
  return data.files && data.files.length > 0 ? data.files[0] : null;
}

export async function uploadBackupToDrive(
  accessToken: string,
  payload: CarBackupPayload,
  existingFileId?: string
): Promise<DriveFileMeta> {
  const metadata = {
    name: DRIVE_BACKUP_FILENAME,
    mimeType: 'application/json',
  };

  const boundary = '-------odosync_drive_boundary_93';
  const body =
    `--${boundary}\r\n` +
    `Content-Type: application/json; charset=UTF-8\r\n\r\n` +
    `${JSON.stringify(metadata)}\r\n` +
    `--${boundary}\r\n` +
    `Content-Type: application/json; charset=UTF-8\r\n\r\n` +
    `${JSON.stringify(payload, null, 2)}\r\n` +
    `--${boundary}--`;

  const url = existingFileId
    ? `https://www.googleapis.com/upload/drive/v3/files/${existingFileId}?uploadType=multipart&fields=id,name,modifiedTime`
    : `https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,modifiedTime`;

  const res = await fetch(url, {
    method: existingFileId ? 'PATCH' : 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': `multipart/related; boundary=${boundary}`,
    },
    body,
  });

  if (!res.ok) {
    throw new Error('Error al guardar el archivo en Google Drive.');
  }
  return (await res.json()) as DriveFileMeta;
}

export async function downloadBackupFromDrive(
  accessToken: string,
  fileId: string
): Promise<CarBackupPayload> {
  const res = await fetch(
    `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`,
    {
      headers: { Authorization: `Bearer ${accessToken}` },
    }
  );
  if (!res.ok) {
    throw new Error('No se pudo descargar el respaldo desde Google Drive.');
  }
  return (await res.json()) as CarBackupPayload;
}
