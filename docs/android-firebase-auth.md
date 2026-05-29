# Android (native) Firebase Phone Authentication

This guide walks through integrating native Firebase Phone Authentication into the Android part of a Capacitor app. Native integration is recommended for production SMS delivery and avoids reCAPTCHA issues present with the web SDK inside WebViews.

## Overview

Steps:

1. Register Android app in Firebase and add SHA-1 / SHA-256 fingerprints.
2. Download `google-services.json` and place it in `android/app/`.
3. Add Firebase Android SDK dependencies in Gradle.
4. Use the Firebase Android SDK to trigger phone verification and handle `onVerificationCompleted`/`onCodeSent` callbacks.
5. Bridge native results to the web layer (Capacitor) using `JS` calls or a small Capacitor plugin.

---

## 1) Firebase console

- In the Firebase console → Project settings → Your apps → Add app → Android.
- Enter your package name (e.g. `com.example.smarthealthcare`).
- Add SHA-1 and SHA-256 fingerprints.
- Download `google-services.json` and place in `android/app/`.

## 2) Gradle changes

In `android/build.gradle` ensure Google services plugin is available:

```gradle
buildscript {
    dependencies {
        classpath 'com.google.gms:google-services:4.3.15'
    }
}
```

In `android/app/build.gradle` add Firebase Auth and apply plugin:

```gradle
plugins {
    id 'com.android.application'
    id 'com.google.gms.google-services'
}

dependencies {
    implementation 'com.google.firebase:firebase-auth:22.1.0'
}
```

(Use latest versions from the Firebase Android release notes.)

## 3) Kotlin example: phone auth flow

Add the following code to an Activity or a small helper class.

```kotlin
// kotlin example
import com.google.firebase.auth.FirebaseAuth
import com.google.firebase.FirebaseException
import com.google.firebase.auth.PhoneAuthProvider
import com.google.firebase.auth.PhoneAuthOptions
import com.google.firebase.auth.PhoneAuthCredential

class PhoneAuthHelper(private val activity: Activity) {
  private val auth = FirebaseAuth.getInstance()
  private var callbacks: PhoneAuthProvider.OnVerificationStateChangedCallbacks

  init {
    callbacks = object : PhoneAuthProvider.OnVerificationStateChangedCallbacks() {
      override fun onVerificationCompleted(credential: PhoneAuthCredential) {
        // Auto-retrieval or instant validation succeeded
        // Sign in with credential
        auth.signInWithCredential(credential).addOnCompleteListener { task ->
          if (task.isSuccessful) {
            // notify web layer
          } else {
            // handle error
          }
        }
      }

      override fun onVerificationFailed(e: FirebaseException) {
        // notify web layer of failure
      }

      override fun onCodeSent(verificationId: String, token: PhoneAuthProvider.ForceResendingToken) {
        // send verificationId to web layer so it can prompt user for code
      }
    }
  }

  fun startPhoneNumberVerification(phoneNumber: String) {
    val options = PhoneAuthOptions.newBuilder(auth)
      .setPhoneNumber(phoneNumber)
      .setTimeout(60L, TimeUnit.SECONDS)
      .setActivity(activity)
      .setCallbacks(callbacks)
      .build()
    PhoneAuthProvider.verifyPhoneNumber(options)
  }

  fun verifyCode(verificationId: String, code: String) {
    val credential = PhoneAuthProvider.getCredential(verificationId, code)
    auth.signInWithCredential(credential)
      .addOnCompleteListener { task ->
        // success or failure
      }
  }
}
```

## 4) Expose events to Web (Capacitor bridge)

Simplest approach: inside your Activity, use `Bridge` to evaluate JavaScript in the WebView when events occur.

```kotlin
// In MainActivity (Kotlin)
import com.getcapacitor.Bridge

class MainActivity: BridgeActivity() {
  private fun onCodeSent(verificationId: String) {
    bridge?.webView?.post {
      bridge?.evaluateJavascript("window.__onNativeCodeSent && window.__onNativeCodeSent(${JSONObject.quote(verificationId)})")
    }
  }
}
```

Alternatively create a small Capacitor plugin that wraps the native phone auth API and exposes a JS API.

## 5) JS-side handling

In your React app, detect Capacitor + native availability and listen for native events:

```js
// src/native-listeners.js
window.__onNativeCodeSent = function(verificationId) {
  // store verificationId and show OTP entry UI
  window.nativeVerificationId = verificationId;
};

window.__onNativeSignIn = function(userJson) {
  // user signed in successfully on native side
  // proceed to app's authenticated flow
};
```

Then call native methods (if you implemented a plugin) or let native trigger events.

## 6) Security notes

- Only use the web Firebase SDK inside a trusted browser context. For production mobile apps prefer native SDK for phone auth.
- Make sure your Android package name and SHA fingerprints registered in Firebase match the build you're running.

## 7) References

- Firebase Android phone auth docs: https://firebase.google.com/docs/auth/android/phone-auth
- Capacitor plugin development: https://capacitorjs.com/docs/plugins

---

If you want, I can:
- Add starter Kotlin code into your Android app under `android/app/src/main/java/...` and wire the JS bridge.
- Scaffold a minimal Capacitor plugin that exposes `startPhoneNumberVerification` and `verifyCode` to JS.

Which of those should I add next? If yes, tell me whether you prefer a plugin (clean API) or a direct MainActivity bridge (faster to implement).
