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

/**
 * Save or update user profile in Firestore (cloud)
 * Uses phone number as document ID for easy lookup across devices
 */
export async function saveUserToCloud(userData) {
  try {
    if (!userData || !userData.phone) {
      throw new Error("User data must include phone number");
    }

    const userDocRef = doc(db, USERS_COLLECTION, userData.phone);
    const dataToSave = {
      ...userData,
      updatedAt: serverTimestamp(),
    };

    // If document doesn't exist, add createdAt timestamp
    const existing = await getDoc(userDocRef);
    if (!existing.exists()) {
      dataToSave.createdAt = serverTimestamp();
    }

    await setDoc(userDocRef, dataToSave, { merge: true });
    console.log(`✓ User data saved to cloud for phone: ${userData.phone}`);
    return true;
  } catch (error) {
    console.error("Error saving user to cloud:", error);
    throw error;
  }
}

/**
 * Fetch user profile from Firestore using phone number
 * This ensures same data appears on any device with same phone number
 */
export async function getUserFromCloud(phone) {
  try {
    if (!phone) {
      throw new Error("Phone number is required");
    }

    const userDocRef = doc(db, USERS_COLLECTION, phone);
    const userSnap = await getDoc(userDocRef);

    if (userSnap.exists()) {
      console.log(`✓ User data loaded from cloud for phone: ${phone}`);
      return userSnap.data();
    } else {
      console.log(`No user data found in cloud for phone: ${phone}`);
      return null;
    }
  } catch (error) {
    console.error("Error fetching user from cloud:", error);
    return null;
  }
}

/**
 * Update specific fields in user profile (cloud only)
 */
export async function updateUserInCloud(phone, updates) {
  try {
    if (!phone) {
      throw new Error("Phone number is required");
    }

    const userDocRef = doc(db, USERS_COLLECTION, phone);
    const updatesWithTimestamp = {
      ...updates,
      updatedAt: serverTimestamp(),
    };

    await updateDoc(userDocRef, updatesWithTimestamp);
    console.log(`✓ User data updated in cloud for phone: ${phone}`);
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
    if (!phone) {
      throw new Error("Phone number is required");
    }

    const userDocRef = doc(db, USERS_COLLECTION, phone);

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
