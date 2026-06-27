import { isCloudStorageAvailable, saveUserToCloud, getUserFromCloud, flushPendingCloudUpdates } from "./cloudStorage";

const USERS_KEY = "shg_users";

function normalizePhone(phone) {
  return phone?.toString().replace(/\D/g, "") || "";
}

export function saveUser(userData) {
  const normalizedPhone = normalizePhone(userData.phone);
  const payload = { ...userData, phone: normalizedPhone };
  const users = getAllUsers();
  const existing = users.findIndex((u) => u.phone === normalizedPhone);
  if (existing >= 0) {
    users[existing] = payload;
  } else {
    users.push(payload);
  }
  localStorage.setItem(USERS_KEY, JSON.stringify(users));

  if (isCloudStorageAvailable()) {
    saveUserToCloud(payload).catch((err) => {
      console.warn("Failed to sync user to cloud storage:", err);
    });
    flushPendingCloudUpdates().catch((err) => {
      console.warn("Pending cloud save flush failed:", err);
    });
  }
}

export function saveUserLocally(userData) {
  const normalizedPhone = normalizePhone(userData.phone);
  const payload = { ...userData, phone: normalizedPhone };
  const users = getAllUsers();
  const existing = users.findIndex((u) => u.phone === normalizedPhone);
  if (existing >= 0) {
    users[existing] = payload;
  } else {
    users.push(payload);
  }
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

export async function getUserByPhoneAsync(phone) {
  const normalized = normalizePhone(phone);
  if (!normalized) return null;

  const local = getUserByPhone(normalized);
  if (local) return local;

  if (!isCloudStorageAvailable()) return null;

  const cloudUser = await getUserFromCloud(normalized);
  if (cloudUser) {
    saveUserLocally(cloudUser);
  }
  return cloudUser;
}

export function getAllUsers() {
  try {
    return JSON.parse(localStorage.getItem(USERS_KEY)) || [];
  } catch {
    return [];
  }
}

export function getUserByPhone(phone) {
  const users = getAllUsers();
  return users.find((u) => u.phone === phone) || null;
}

export function getUserFromStorage() {
  try {
    return JSON.parse(localStorage.getItem("shg_user")) || null;
  } catch {
    return null;
  }
}