Capacitor Mobile App Setup (Android)

This project can be wrapped as a native Android app using Capacitor.

1) Install Capacitor dependencies:

```bash
npm install --save-dev @capacitor/cli @capacitor/core
```

2) Build the web app and initialize Capacitor (run once):

```bash
npm run build
npx cap init
# when prompted, use the app name and app id (e.g. com.example.smarthealthcare)
```

3) Add Android platform:

```bash
npx cap add android
```

4) Sync web build to native project after changes:

```bash
npm run build
npx cap sync
```

5) Open Android Studio to run on device/emulator:

```bash
npx cap open android
```

Notes:
- For local device testing, run the dev server accessible on your LAN:

```bash
npm run mobile:dev
```

and set `server.url` in `android/app/src/main/assets/capacitor.config.json` (or use the Capacitor docs) to point to your dev server URL.

- You still need to configure Firebase for mobile (use SHA-1/256 keys and update `google-services.json`).
 - You still need to configure Firebase for mobile (use SHA-1/256 keys and update `google-services.json`).

Firebase mobile configuration (Android)

1) Register an Android app in the Firebase console

	- Go to your Firebase project → Project settings → Apps → Add app → Android.
	- Enter your Android package name (e.g. `com.example.smarthealthcare`).
	- Optionally set the app nickname.

2) Add SHA keys (required for Google/Firebase auth and some APIs)

	- For debug builds you can use the debug keystore SHA-1 and SHA-256. Run (requires Java keytool):

		```powershell
		# Windows (default debug keystore)
		keytool -list -v -keystore "%USERPROFILE%\.android\debug.keystore" -alias androiddebugkey -storepass android -keypass android
		```

	- Copy the SHA-1 and SHA-256 values and paste them into the Android app registration in the Firebase console (App settings → Add fingerprint).

3) Download `google-services.json`

	- After registering the Android app, download the generated `google-services.json` file.
	- Place it at: `android/app/google-services.json` (Capacitor/Android project root).

		- You can copy the downloaded file to the project as `android/app/google-services.json`.
		- A placeholder example is included at `android/app/google-services.json.example` — replace it with the real `google-services.json` you download from Firebase.

4) Web OAuth and Authorized domains

	- In Firebase Console → Authentication → Sign-in method → Authorized domains, add these domains for local/dev and Capacitor:
		- `localhost`
		- `localhost:5173` (or the port your dev server runs on)
		- `capacitor://localhost`

	- Ensure `VITE_FIREBASE_AUTH_DOMAIN` in your `.env` matches your Firebase project's web auth domain (e.g. `your-project.firebaseapp.com`).

5) Build & run

	- Sync web assets then open Android Studio:

		```bash
		npm run build
		npx cap sync android
		npx cap open android
		```

	- In Android Studio run the app on an emulator or device. For debug/dev server loading, set `server.url` in `android/app/src/main/assets/capacitor.config.json` to your dev server URL (e.g. `http://192.168.1.5:5175`).

Troubleshooting

	- If Firebase phone auth returns `OPERATION_NOT_ALLOWED` or similar, verify Phone sign-in is enabled in Authentication → Sign-in method and that authorized domains include the app-origin used by Capacitor/Dev.
	- If auth fails on device, confirm your `google-services.json` matches the registered package name and that SHA keys are present in the Firebase app settings.

Note: Do not commit `google-services.json` or any secret keys to source control. Keep them out of the repository or add to CI/secret store when building.

For a complete native Firebase Phone Auth integration (recommended for real SMS delivery and better UX), see `docs/android-firebase-auth.md` for step-by-step instructions including native Android Gradle changes and example Kotlin code.

Example JS usage (in your React app)

```js
// start verification
if (window.Capacitor && window.Capacitor.Plugins && window.Capacitor.Plugins.PhoneAuth) {
	const plugin = window.Capacitor.Plugins.PhoneAuth;
	// Listen for events
	plugin.addListener('codeSent', (data) => { console.log('codeSent', data); });
	plugin.addListener('signInSuccess', (data) => { console.log('signed in', data); });
	// Start
	await plugin.startPhoneNumberVerification({ phone: '+919123456789' });
}
```

- For iOS, follow Capacitor docs on a macOS environment.
