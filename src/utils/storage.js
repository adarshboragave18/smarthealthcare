import { isCloudStorageAvailable, saveUserToCloud, getUserFromCloud } from "./cloudStorage";

const USERS_KEY = "shg_users";

export function saveUser(userData) {
  const users = getAllUsers();
  const existing = users.findIndex((u) => u.phone === userData.phone);
  if (existing >= 0) {
    users[existing] = userData;
  } else {
    users.push(userData);
  }
  localStorage.setItem(USERS_KEY, JSON.stringify(users));

  if (isCloudStorageAvailable()) {
    saveUserToCloud(userData).catch((err) => {
      console.warn("Failed to sync user to cloud storage:", err);
    });
  }
}

export function saveUserLocally(userData) {
  const users = getAllUsers();
  const existing = users.findIndex((u) => u.phone === userData.phone);
  if (existing >= 0) {
    users[existing] = userData;
  } else {
    users.push(userData);
  }
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

export async function getUserByPhoneAsync(phone) {
  const normalized = phone?.toString().replace(/\D/g, "") || "";
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