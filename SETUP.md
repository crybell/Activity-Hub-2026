# Shared Leaderboard Setup

This site can use a shared Supabase leaderboard without adding a build step.

## 1. Create a Supabase project

Create a project in Supabase, then copy:

- Project URL
- Publishable / anon key

## 2. Create the table and policies

Open the SQL editor in Supabase and run [supabase-setup.sql](./supabase-setup.sql).

This creates:

- a `trivia_leaderboard` table
- a case-insensitive unique name rule so each name can play once
- row level security policies for public read and public insert

## 3. Add your project config

Edit [config.js](./config.js) and fill in:

```js
window.TRIVIA_CONFIG = {
  backend: {
    provider: "supabase",
    supabaseUrl: "https://YOUR-PROJECT.supabase.co",
    supabasePublishableKey: "YOUR-PUBLISHABLE-KEY",
    leaderboardTable: "trivia_leaderboard",
  },
};
```

## 4. Publish the site

Upload the full folder to a static host such as GitHub Pages, Netlify, or Vercel.

## Notes

- If `config.js` is left blank, the site falls back to a device-only local leaderboard.
- With Supabase configured, leaderboard scores are shared across everyone using the same site.
- The unique-name rule is enforced in the database, not just in the browser.
