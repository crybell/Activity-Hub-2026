# GitHub Pages Deployment

Use this if you want the site tied to a GitHub repository.

## 1. Create a repository

Create a new GitHub repository and upload the contents of this folder.

## 2. Enable Pages

In the repository:

1. Open `Settings`
2. Open `Pages`
3. Under `Build and deployment`, choose:
   - `Source`: `Deploy from a branch`
   - `Branch`: `main`
   - `Folder`: `/ (root)`

## 3. Wait for the site URL

GitHub Pages will publish the site and show the live URL in the Pages settings.

## 4. Keep config in mind

Make sure [config.js](./config.js) already contains your Supabase project URL and publishable key before pushing.
