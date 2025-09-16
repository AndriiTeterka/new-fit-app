Project Structure (Post-cleanup)

- app.json: Expo config with Supabase keys in extra
- App.tsx / index.tsx: App bootstrap and global error handling
- src/
  - app/ (Expo Router routes)
    - (tabs)/home.jsx, workouts.jsx, schedule.jsx, progress.jsx, profile.jsx
    - workout-detail.jsx, workout-builder.jsx, exercise-detail.jsx
    - workout-session/index.jsx
  - components/ (shared view helpers)
  - lib/
    - supabase.ts (Supabase client)
  - queries/
    - templates.ts (React Query hooks + remote helpers)
  - storage/
    - templates.js (AsyncStorage local store + seed)
  - utils/
    - theme.js, auth/*, hooks
  - __create/
    - fetch.ts, polyfills.ts (fetch patch + polyfills)
- __create/ (error boundaries + reporting)
- polyfills/ (Metro alias targets for web/native)
- public/
  - canvaskit.wasm (Skia)

Notes
- Removed transient dev folders (.metro-virtual, caches) and unused fontawesome.css.
- Kept polyfills and __create folders (they are used by App.tsx and Metro aliases).
