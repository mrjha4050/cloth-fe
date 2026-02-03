export interface ProfileData {
  fullName: string;
  phone: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  pincode: string;
}

const STORAGE_PREFIX = 'hfd_profile_';

function storageKey(email: string): string {
  return `${STORAGE_PREFIX}${email.trim().toLowerCase()}`;
}

export function getProfile(email: string): Partial<ProfileData> | null {
  if (!email?.trim()) return null;
  try {
    const raw = localStorage.getItem(storageKey(email));
    if (!raw) return null;
    return JSON.parse(raw) as Partial<ProfileData>;
  } catch {
    return null;
  }
}

export function setProfile(email: string, data: Partial<ProfileData>): void {
  if (!email?.trim()) return;
  try {
    localStorage.setItem(storageKey(email), JSON.stringify(data));
  } catch {
    // ignore
  }
}
