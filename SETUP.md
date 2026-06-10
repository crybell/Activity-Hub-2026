# Shared Leaderboard Setup

This site now uses Firebase Cloud Firestore for the shared leaderboard.

## 1. Register the web app

In Firebase console:

- open the `triviachallenge-382be` project
- add or open the web app registration
- copy the web app config if you need to verify [config.js](./config.js)

## 2. Create the Firestore database

In Firebase console:

- go to `Firestore Database`
- click `Create database`
- choose a location

For quick setup, you can start in test mode while validating the site.

## 3. Add Firestore security rules

After Firestore is created, open the `Rules` tab and use rules like:

```txt
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /trivia_leaderboard/{playerId} {
      allow read: if true;
      allow create: if true;
      allow update, delete: if false;
    }
  }
}
```

These rules allow the public site to read scores and create new entries, while preventing edits or deletes from the browser.

## 4. Publish the site

Push the updated files to GitHub Pages as usual.

## Notes

- The leaderboard collection is `trivia_leaderboard`.
- Each player name is normalized and stored as one Firestore document, so the same name cannot be added twice.
- If Firestore is not set up yet, the site will show that the shared leaderboard is unavailable.
