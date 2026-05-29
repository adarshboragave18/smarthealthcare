# Smart Healthcare Guide

A responsive healthcare dashboard built with React, Vite, Tailwind CSS, and mobile OTP-based login.

Note: The native Android project has been removed — this repository is web-first now.

## Features

- Mobile number login with OTP verification
- User registration with name, DOB, age, gender, weight, height
- Dark/light mode toggle
- BMI calculator
- AI-style symptom checker UI
- Emergency contacts by selected city
- Nearby hospitals map using Google Maps Embed
- Animated hero section
- Health tips blog cards
- Floating chatbot assistant
- Responsive navigation and glassmorphism UI
- Profile page with last login and last checkup tracking

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Copy the sample environment file:
   ```bash
   copy .env.example .env
   ```

3. Open `.env` and update these values:
   ```env
   VITE_DEMO_SMS=true
   VITE_FIREBASE_API_KEY=your_firebase_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
   VITE_FIREBASE_APP_ID=your_app_id
   ```

4. Start the frontend:
   ```bash
   npm run dev
   ```

5. Open the local URL shown in the terminal to view the app.

## Google Maps Setup

1. Go to https://console.cloud.google.com
2. Create or select a project.
3. Enable the `Maps Embed API`.
4. Create an API key.
5. Add the key to `.env` as `VITE_GOOGLE_MAPS_API_KEY`.

## Publish to GitHub

### 1. Initialize the repository

If the project is not already a Git repo:

```bash
cd smarthealthcare
git init
git add .
   git commit -m "Initial Smart Healthcare Guide app"
```

### 2. Connect to GitHub

Create a repository on GitHub, then add the remote:

```bash
git remote add origin https://github.com/<your-user>/<your-repo>.git
```

### 3. Push the code

```bash
git branch -M main
git push -u origin main
```

### 4. Deploy to GitHub Pages

This project includes a deploy script using `gh-pages`.

```bash
npm run deploy
```

### GitHub Actions

A CI workflow is included in `.github/workflows/ci.yml` to install dependencies, lint the code, and build the app on every push and pull request.

If you want, keep GitHub Actions enabled for automated validation before merging changes.

If you want GitHub Pages to serve from a custom path, add a `homepage` field to `package.json`:

```json
"homepage": "https://<your-user>.github.io/<your-repo>/"
```

### 5. Important GitHub notes

- `.gitignore` already excludes `node_modules/`, `dist/`, `.env`, and backup files.
- Do not commit `.env` or any secret keys.
- If you change the repository name or username, update the `origin` remote and `homepage` value.

## Notes

- Real SMS OTP is supported through Firebase Phone Authentication.
- Set `VITE_DEMO_SMS=false` and provide your Firebase config values in `.env` to use real OTP delivery.
- `HospitalMap.jsx` uses `import.meta.env.VITE_GOOGLE_MAPS_API_KEY`.

## Deploying Live

### Vercel (Frontend)

1. Push the repository to GitHub.
2. In Vercel, connect your GitHub account and choose this repo.
3. Set the frontend environment variables in Vercel:
   - `VITE_DEMO_SMS` -> `false`
   - `VITE_FIREBASE_API_KEY`
   - `VITE_FIREBASE_AUTH_DOMAIN`
   - `VITE_FIREBASE_PROJECT_ID`
   - `VITE_FIREBASE_STORAGE_BUCKET`
   - `VITE_FIREBASE_MESSAGING_SENDER_ID`
   - `VITE_FIREBASE_APP_ID`
   - `VITE_GOOGLE_MAPS_API_KEY` (if you use maps)
4. Deploy the site. Vercel will build the React app automatically.

### Connecting GitHub

- Create a GitHub repo and push your project:
  ```bash
  git init
  git add .
   git commit -m "Add MSG91 OTP authentication"
  git branch -M main
  git remote add origin https://github.com/<your-user>/<your-repo>.git
  git push -u origin main
  ```
- Use the same repo in Vercel and Render/Railway so deployment is automatically updated on push.

### Testing Real Phone OTP

- Set `VITE_DEMO_SMS=false` locally or in production.
- Make sure `MSG91_AUTH_KEY` and `MSG91_SENDER_ID` are valid.
- Use a real Indian mobile number starting with 6/7/8/9.
- Request OTP in the app and verify the code from the SMS.
- In demo mode (`DEMO_SMS=true`), the backend logs the OTP to the console and returns a debug value for local testing.
