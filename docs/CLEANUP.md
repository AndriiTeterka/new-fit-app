Cleanup Summary

- Deleted:
  - .metro-virtual (Metro cache)
  - caches (dev artifacts)
  - fontawesome.css (unused)

- Stabilized Workouts screen:
  - Fixed hook order and bundling syntax
  - Focus-scoped realtime + refresh
  - Robust FlatList keys to avoid duplicate child errors

- Supabase wiring:
  - Client at src/lib/supabase.ts
  - Queries at src/queries/templates.ts (with one-time local->remote migration)
  - Builder pushes changes to Supabase and invalidates list

Suggestions
- Add ESLint/Prettier and CI lint step
- Consider moving detail routes to /app/workouts/[id].tsx later (breaking change)
- Add unit tests for storage and query helpers
