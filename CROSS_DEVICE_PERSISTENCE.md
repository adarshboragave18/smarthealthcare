# Cross-Device Data Persistence Guide

## Overview
Your SmartHealthcare app now supports **cross-device data persistence**. When a user logs in with their phone number on any device, they will see the same data that was saved previously.

## How It Works

### Architecture
```
Device 1 (Desktop)          Device 2 (Mobile)
   ↓                              ↓
LocalStorage + Firestore    LocalStorage + Firestore
   ↓                              ↓
   └──────────── Firestore Cloud Database ──────────┘
```

**Data Flow on Login:**
1. User enters phone number and OTP
2. OTP is verified
3. Local user data is fetched from localStorage
4. **Cloud data is synced down** from Firestore (primary source of truth)
5. User sees their complete profile with all saved data
6. Profile is merged: cloud data takes precedence, then local cache

**Data Flow on Updates:**
1. User updates profile (photo, checkup date, etc.)
2. Data is saved to **localStorage** (immediate local access)
3. Data is **automatically synced to Firestore** in the background
4. On other devices, real-time listener updates the profile (if implemented)

## Implementation Details

### New Files Created
- **`src/utils/cloudStorage.js`** - Firestore operations for user data persistence

### Modified Files
- **`src/firebase.js`** - Added Firestore database initialization
- **`src/utils/storage.js`** - Added cloud sync on local save
- **`src/components/Login.jsx`** - Added cloud data sync after OTP verification
- **`src/components/UserProfile.jsx`** - Added cloud sync for photo and checkup updates
- **`src/App.jsx`** - Added cloud sync on login

### Key Functions

#### `cloudStorage.js` API

```javascript
// Save user profile to cloud
await saveUserToCloud(userData);

// Get user profile from cloud
const userData = await getUserFromCloud(phoneNumber);

// Update specific fields in cloud
await updateUserInCloud(phoneNumber, updates);

// Real-time updates across devices
const unsubscribe = subscribeToUserChanges(phone, (data) => {
  console.log('Data updated on another device:', data);
});

// Sync from cloud on login
const mergedData = await syncUserDataFromCloud(phone, localData);

// Check if cloud storage is available
if (isCloudStorageAvailable()) { ... }
```

## Database Structure (Firestore)

**Collection:** `users`  
**Document ID:** `{phone_number}` (e.g., "9876543210")

**Document Structure:**
```json
{
  "phone": "9876543210",
  "name": "John Doe",
  "dob": "1990-01-15",
  "gender": "male",
  "weight": "70",
  "height": "175",
  "photo": "data:image/jpeg;base64,...",
  "lastCheckup": "2024-12-01",
  "registeredAt": "2024-01-01T10:00:00.000Z",
  "lastLogin": "2024-12-15T14:30:00.000Z",
  "updatedAt": "2024-12-15T14:35:00.000Z",
  "createdAt": "2024-01-01T10:00:00.000Z"
}
```

## Setup Instructions

### 1. Firebase Firestore Rules (Security)

In Firebase Console → Firestore Database → Rules, set:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Only authenticated users can read/write their own data
    match /users/{phoneNumber} {
      allow read, write: if request.auth != null && 
        request.auth.token.phone_number == phoneNumber;
      
      // Allow during development with email-based auth
      // Remove this rule in production!
      allow read, write: if request.auth != null;
    }
  }
}
```

### 2. Environment Variables

Your existing Firebase configuration already includes what's needed. Ensure your `.env` file has:

```
VITE_FIREBASE_API_KEY=xxxxx
VITE_FIREBASE_AUTH_DOMAIN=xxxxx
VITE_FIREBASE_PROJECT_ID=xxxxx
VITE_FIREBASE_STORAGE_BUCKET=xxxxx
VITE_FIREBASE_MESSAGING_SENDER_ID=xxxxx
VITE_FIREBASE_APP_ID=xxxxx
VITE_FIREBASE_MEASUREMENT_ID=xxxxx
```

### 3. Enable Firestore in Firebase Console

1. Go to Firebase Console
2. Select your project
3. Click on **Firestore Database** in the left sidebar
4. Click **Create Database**
5. Choose region (closest to your users)
6. Start in **Production mode** (rules will protect data)

### 4. Test the Setup

**Test Cross-Device Sync:**

1. **Device 1 (Desktop):**
   - Register with phone: 9876543210
   - Add profile photo and checkup date
   - Go to Profile and save changes

2. **Device 2 (Tablet/Mobile):**
   - Open the app in a new device/browser
   - Login with same phone: 9876543210
   - You should see the **same photo and checkup date**
   - Verify in Firestore Console that data exists

3. **Update on Device 2:**
   - Change the photo or checkup date
   - Check Device 1 - data updates immediately (if real-time listener is implemented)

## Data Persistence Flow

### Registration
```
User fills form → Verify OTP → Save to localStorage → Sync to Firestore ✓
```

### First Login
```
Enter phone → Verify OTP → Load from localStorage → Sync from Firestore ✓ → Show merged data
```

### Subsequent Logins
```
Enter phone → Verify OTP → Fetch from Firestore → Merge with local cache ✓
```

### Profile Updates
```
Update photo/checkup → Save to localStorage ✓ → Async sync to Firestore ✓
```

## Benefits

✅ **Single Source of Truth:** Cloud (Firestore) is the primary data store  
✅ **Offline Support:** App works offline with localStorage  
✅ **Fast Loading:** Local cache ensures instant access  
✅ **Cross-Device Sync:** Same data visible on all devices  
✅ **Automatic Backups:** Data never lost (stored in cloud)  
✅ **Scalable:** Firebase handles auto-scaling

## Limitations & Future Enhancements

### Current
- Real-time updates between devices require manual page refresh
- Photo data stored as base64 (consider Firebase Storage for large files)
- No conflict resolution for simultaneous edits

### Future Enhancements
1. **Real-time Sync:** Implement listeners for auto-updates
2. **Cloud Storage:** Store large photos in Firebase Storage instead of Firestore
3. **Offline Support:** Better offline queue for changes
4. **Encryption:** End-to-end encryption for sensitive health data
5. **Versioning:** Track data history and allow rollbacks
6. **Conflict Resolution:** Smart merge for concurrent edits

## Troubleshooting

### Data not syncing to cloud?
- Check browser console for errors
- Verify Firestore rules allow writes
- Ensure Firebase project is correctly configured
- Check network connection

### Getting wrong data?
- Clear localStorage and re-login
- Verify Firestore has correct data
- Check that phone number format matches (no +91)

### Performance slow?
- Consider moving photos to Firebase Storage
- Add indexes in Firestore for frequently queried fields
- Use pagination for large datasets

## API Reference

### saveUserToCloud(userData)
Saves or updates user profile in Firestore.
- **Params:** `userData` (object with phone, name, etc.)
- **Returns:** Promise<boolean>
- **Throws:** Error if phone is missing

### getUserFromCloud(phone)
Fetches user profile from Firestore.
- **Params:** `phone` (string, 10-digit phone number)
- **Returns:** Promise<object|null>

### updateUserInCloud(phone, updates)
Updates specific fields in cloud (without overwriting).
- **Params:** `phone`, `updates` (object with fields to update)
- **Returns:** Promise<boolean>

### syncUserDataFromCloud(phone, localData)
Merges cloud data with local cache (cloud takes priority).
- **Params:** `phone`, `localData`
- **Returns:** Promise<object> (merged data)

### subscribeToUserChanges(phone, onDataChange, onError)
Real-time listener for profile changes.
- **Params:** `phone`, callback functions
- **Returns:** unsubscribe function

### isCloudStorageAvailable()
Checks if Firestore is initialized and available.
- **Returns:** boolean

## Security Best Practices

1. **Firestore Rules:** Always validate in rules (not just client-side)
2. **Phone Verification:** Use Firebase Phone Auth for verification
3. **Encryption:** Consider encrypting sensitive health data
4. **Access Control:** Use Firestore rules to enforce per-user access
5. **Rate Limiting:** Implement rate limiting for API calls

## Cost Estimation (Firestore)

For a small app (~1000 users):
- **Reads:** ~1M reads/month = ~$0.06
- **Writes:** ~100K writes/month = ~$0.02
- **Total:** ~$1/month (free tier covers much more)

Firestore includes 1M free reads/month and 20K free writes/month.
