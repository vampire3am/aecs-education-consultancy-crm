# Deployment Guide

The frontend is a Vite React application deployed to Netlify. Supabase provides PostgreSQL, authentication, row-level security, and private file storage.

Required Netlify variables:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

Apply SQL migrations in filename order before deploying matching frontend changes. Build with `npm run build` and publish `dist`.
