import { db } from "../firebase";
import {
  doc,
  setDoc,
  getDoc,
  updateDoc,
  serverTimestamp,
  onSnapshot,
} from "firebase/firestore";

const USERS_COLLECTION = "users";

function timeoutPromise(ms, message) {
  return new Promise((_, reject) => {
    const timer = setTimeout(() => {
      clearTimeout(timer);
      reject(new Error(message));
    }, ms);
  });
}

function normalizePhone(phone) {
  return phone?.toString().replace(/\D/g, "") || "";
}

const PENDING_CLOUD_UPDATES_KEY = "shg_pending_cloud_updates";

function getCloudDocIds(phone) {
  const normalized = normalizePhone(phone);
  if (!normalized) return [];
  const ids = [normalized];
  if (normalized.length === 10) {
    ids.push(`+91${normalized}`);
  } else if (normalized.length === 12 && normalized.startsWith("91")) {
    ids.push(`+${normalized}`);
  }
  return [...new Set(ids)];
}

function getPendingCloudUpdates() {
  try {
    return JSON.parse(localStorage.getItem(PENDING_CLOUD_UPDATES_KEY)) || [];
  } catch {
    return [];
  }
}

function setPendingCloudUpdates(updates) {
  localStorage.setItem(PENDING_CLOUD_UPDATES_KEY, JSON.stringify(updates));
}

function queueCloudSave(userData) {
  const normalizedPhone = normalizePhone(userData.phone);
  if (!normalizedPhone) return;
  const updates = getPendingCloudUpdates();
  const payload = { ...userData, phone: normalizedPhone };
  const existingIndex = updates.findIndex((item) => normalizePhone(item.phone) === normalizedPhone);
  if (existingIndex >= 0) {
    updates[existingIndex] = payload;
  } else {
    updates.push(payload);
  }
  setPendingCloudUpdates(updates);
  console.log(`↻ Queued cloud save for phone ${normalizedPhone}`);
}

function removePendingCloudUpdate(phone) {
  const normalizedPhone = normalizePhone(phone);
  if (!normalizedPhone) return;
  const updates = getPendingCloudUpdates().filter((item) => normalizePhone(item.phone) !== normalizedPhone);
  setPendingCloudUpdates(updates);
}

function parseFirestoreValue(value) {
  if (value == null) return null;
  if (value.stringValue !== undefined) return value.stringValue;
  if (value.integerValue !== undefined) return Number(value.integerValue);
  if (value.doubleValue !== undefined) return Number(value.doubleValue);
  if (value.booleanValue !== undefined) return value.booleanValue;
  if (value.timestampValue !== undefined) return value.timestampValue;
  if (value.mapValue) return parseFirestoreDocument({ fields: value.mapValue.fields });
  if (value.arrayValue) return (value.arrayValue.values || []).map(parseFirestoreValue);
  return null;
}

function parseFirestoreDocument(firestoreDoc) {
  const parsed = {};
  const fields = firestoreDoc.fields || {};
  Object.keys(fields).forEach((key) => {
    parsed[key] = parseFirestoreValue(fields[key]);
  });
  return parsed;
}

async function getUserFromCloudRest(docId) {
  const apiKey = import.meta.env.VITE_FIREBASE_API_KEY;
  const projectId = import.meta.env.VITE_FIREBASE_PROJECT_ID;
  if (!apiKey || !projectId) {
    throw new Error("Missing Firebase REST config");
  }

  const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/${USERS_COLLECTION}/${encodeURIComponent(docId)}?key=${apiKey}`;
  const response = await fetch(url, {
    method: "GET",
    headers: {
      "Accept": "application/json",
    },
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Firestore REST read failed (${response.status}): ${body}`);
  }

  const document = await response.json();
  return parseFirestoreDocument(document);
}

function isRecoverableCloudError(error) {
  const message = String(error?.message || "").toLowerCase();
  return (
    message.includes("client is offline") ||
    message.includes("offline") ||
    message.includes("network") ||
    message.includes("failed to fetch") ||
    message.includes("timed out") ||
    message.includes("timeout")
  );
}

/**
 * Save or update user profile in Firestore (cloud)
 * Uses phone number as document ID for easy lookup across devices
 */
async function saveUserToCloudInternal(userData, { queueOnFailure = true } = {}) {
  if (!userData || !userData.phone) {
    throw new Error("User data must include phone number");
  }

  const normalizedPhone = normalizePhone(userData.phone);
  if (!normalizedPhone) {
    throw new Error("Invalid phone number for cloud save");
  }

  const userDocRef = doc(db, USERS_COLLECTION, normalizedPhone);
  const dataToSave = {
    ...userData,
    phone: normalizedPhone,
    updatedAt: serverTimestamp(),
  };

  try {
    const existing = await getDoc(userDocRef);
    if (!existing.exists()) {
      dataToSave.createdAt = serverTimestamp();
    }

    await setDoc(userDocRef, dataToSave, { merge: true });
    removePendingCloudUpdate(normalizedPhone);
    console.log(`✓ User data saved to cloud for phone: ${normalizedPhone}`);
    return true;
  } catch (error) {
    console.error("Error saving user to cloud:", error);
    if (queueOnFailure && isRecoverableCloudError(error)) {
      queueCloudSave(userData);
    }
    throw error;
  }
}

export async function saveUserToCloud(userData) {
  return saveUserToCloudInternal(userData, { queueOnFailure: true });
}

export async function flushPendingCloudUpdates() {
  const pending = getPendingCloudUpdates();
  if (!pending.length) return [];

  const results = [];
  for (const userData of pending) {
    try {
      await saveUserToCloudInternal(userData, { queueOnFailure: false });
      results.push({ phone: normalizePhone(userData.phone), success: true });
    } catch (error) {
      console.warn(`Pending cloud save retry failed for ${normalizePhone(userData.phone)}:`, error);
      results.push({ phone: normalizePhone(userData.phone), success: false, error });
    }
  }
  return results;
}

/**
 * Fetch user profile from Firestore using phone number
 * This ensures same data appears on any device with same phone number
 */
export async function getUserFromCloud(phone) {
  try {
    const docIds = getCloudDocIds(phone);
    if (!docIds.length) {
      throw new Error("Phone number is required");
    }

    for (const docId of docIds) {
      try {
        const userDocRef = doc(db, USERS_COLLECTION, docId);
        const userSnap = await Promise.race([
          getDoc(userDocRef),
          timeoutPromise(8000, "Cloud lookup timed out. Please try again.")
        ]);
        if (userSnap.exists()) {
          const data = userSnap.data();
          console.log(`✓ User data loaded from cloud for phone key: ${docId}`);
          return { ...data, phone: normalizePhone(data.phone || phone) };
        }
      } catch (innerError) {
        console.warn(`Firestore SDK lookup failed for ${docId}:`, innerError);
        if (isRecoverableCloudError(innerError)) {
          try {
            const restData = await getUserFromCloudRest(docId);
            if (restData) {
              console.log(`✓ User data loaded from Firestore REST for phone key: ${docId}`);
              return { ...restData, phone: normalizePhone(restData.phone || phone) };
            }
          } catch (restError) {
            console.error(`REST fallback also failed for ${docId}:`, restError);
          }
        }
      }
    }

    console.log(`No user data found in cloud for phone: ${phone}`);
    return null;
  } catch (error) {
    console.error("Error fetching user from cloud:", error);
    throw error;
  }
}

/**
 * Update specific fields in user profile (cloud only)
 */
export async function updateUserInCloud(phone, updates) {
  try {
    const normalizedPhone = normalizePhone(phone);
    if (!normalizedPhone) {
      throw new Error("Phone number is required");
    }

    const userDocRef = doc(db, USERS_COLLECTION, normalizedPhone);
    const updatesWithTimestamp = {
      ...updates,
      updatedAt: serverTimestamp(),
    };

    await updateDoc(userDocRef, updatesWithTimestamp);
    console.log(`✓ User data updated in cloud for phone: ${normalizedPhone}`);
    return true;
  } catch (error) {
    console.error("Error updating user in cloud:", error);
    throw error;
  }
}

/**
 * Real-time listener for user profile changes
 * Updates across all devices when data changes
 */
export function subscribeToUserChanges(phone, onDataChange, onError) {
  try {
    const normalizedPhone = normalizePhone(phone);
    if (!normalizedPhone) {
      throw new Error("Phone number is required");
    }

    const userDocRef = doc(db, USERS_COLLECTION, normalizedPhone);

    const unsubscribe = onSnapshot(
      userDocRef,
      (docSnap) => {
        if (docSnap.exists()) {
          console.log(`✓ Real-time update for user: ${phone}`);
          onDataChange(docSnap.data());
        }
      },
      (error) => {
        console.error("Error in real-time listener:", error);
        if (onError) onError(error);
      }
    );

    return unsubscribe;
  } catch (error) {
    console.error("Error setting up real-time listener:", error);
    if (onError) onError(error);
    return () => {};
  }
}

/**
 * Sync function to load user data from cloud on login
 * Merges cloud data with local cache
 */
export async function syncUserDataFromCloud(phone, localData) {
  try {
    const cloudData = await getUserFromCloud(phone);

    if (cloudData) {
      // Merge: cloud data is primary source of truth, but keep local-only fields
      const merged = {
        ...localData,
        ...cloudData,
      };
      console.log("✓ User data synced from cloud");
      return merged;
    }

    return localData;
  } catch (error) {
    console.error("Error syncing user data from cloud:", error);
    return localData;
  }
}

/**
 * Check if Firebase/Firestore is available and configured
 */
export function isCloudStorageAvailable() {
  try {
    return !!db;
  } catch {
    return false;
  }
}
