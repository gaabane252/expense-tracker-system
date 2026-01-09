# Firebase Setup Guide

This guide will walk you through setting up Firebase for your Expense Tracker application.

## Step 1: Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click **"Add project"** or **"Create a project"**
3. Enter a project name (e.g., "Expense Tracker")
4. Click **Continue**
5. (Optional) Enable Google Analytics if you want
6. Click **Create project**
7. Wait for the project to be created, then click **Continue**

## Step 2: Register Your Web App

1. In the Firebase Console, click the **Web icon** (`</>`) to add a web app
2. Enter an app nickname (e.g., "Expense Tracker Web")
3. **Do NOT** check "Also set up Firebase Hosting" (unless you want to deploy)
4. Click **Register app**
5. You'll see your Firebase configuration object - **KEEP THIS PAGE OPEN**

## Step 3: Enable Authentication

1. In the left sidebar, click **Build** → **Authentication**
2. Click **Get started**
3. Click on the **Sign-in method** tab
4. Click on **Email/Password**
5. Toggle **Enable** to ON
6. Click **Save**

## Step 4: Create Firestore Database

1. In the left sidebar, click **Build** → **Firestore Database**
2. Click **Create database**
3. Select **Start in test mode** (for development)
   - **IMPORTANT**: Test mode allows read/write access for 30 days. For production, you'll need to set up proper security rules.
4. Choose a Firestore location (select the closest to your users)
5. Click **Enable**

## Step 5: Configure Your Application

1. Open the file: `src/services/firebase.js`
2. Replace the placeholder configuration with your actual Firebase config:

```javascript
const firebaseConfig = {
  apiKey: "YOUR_API_KEY_HERE",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};
```

3. Copy each value from the Firebase Console (from Step 2) and paste it into the corresponding field
4. Save the file

## Step 6: Set Up Firestore Security Rules (Production)

For production, update your Firestore security rules:

1. In Firebase Console, go to **Firestore Database** → **Rules**
2. Replace the rules with:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users collection
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Transactions collection
    match /transactions/{transactionId} {
      allow read, write: if request.auth != null && 
                           request.auth.uid == resource.data.userId;
      allow create: if request.auth != null && 
                      request.auth.uid == request.resource.data.userId;
    }
  }
}
```

3. Click **Publish**

## Step 7: Run Your Application

1. Open a terminal in your project directory
2. Run: `npm run dev`
3. Open your browser to `http://localhost:5173`
4. Create an account and start using the app!

## Troubleshooting

### "Firebase: Error (auth/configuration-not-found)"
- Make sure you've replaced the placeholder values in `firebase.js` with your actual Firebase config

### "Missing or insufficient permissions"
- Check that your Firestore security rules are set correctly
- Make sure you're signed in

### "Firebase: Error (auth/email-already-in-use)"
- This email is already registered. Try logging in instead

### App doesn't load
- Check the browser console for errors
- Make sure all dependencies are installed: `npm install`
- Verify your Firebase configuration is correct

## Next Steps

- **Deploy your app**: Use Firebase Hosting or Vercel
- **Add more features**: Budget tracking, recurring transactions, export data
- **Improve security**: Update Firestore rules for production
- **Add analytics**: Track user behavior with Firebase Analytics

## Support

If you encounter any issues:
1. Check the browser console for error messages
2. Verify your Firebase configuration
3. Ensure all Firebase services are enabled
4. Check that your internet connection is stable

---

**Congratulations!** 🎉 Your Expense Tracker is now connected to Firebase!
