Backend (server) Supabase setup

Env required in servidor/.env:
- SUPABASE_URL=https://YOUR_PROJECT_ID.supabase.co
- SUPABASE_ANON_KEY=anon-public-key
- SUPABASE_SERVICE_ROLE_KEY=service-role-key (server only, keep secret)
- JWT_SECRET=your-strong-secret
- NODE_ENV=development
- PORT=5000

Seed users (admin and usuario):
- npm run seed:supabase
  - Defaults:
    - admin@example.com / JP3Admin2025! (username: admin, role: admin)
    - usuario@example.com / JP3User2025! (username: usuario, role: user)
  - Override with SEED_* env vars if needed.

Notes:
- MySQL/XAMPP not required anymore.
- Client talks to backend for auth endpoints, data tables can be served via Supabase directly or proxied.
