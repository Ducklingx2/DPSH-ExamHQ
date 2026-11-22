
# ExamHQ

Examination department management system for DPS Hinjawadi.

## Stack

- Frontend: HTML, CSS, JavaScript
- Backend: Rust, Axum, Tokio
- Database: Supabase PostgreSQL
- Authentication: Supabase Auth
- Database access: SQLx
- Hosting: Render Docker

## Features

### Authentication
- Email/password registration
- Login and logout
- Email verification
- Password recovery
- Persistent sessions

### Roles
- Administrator
- Teacher
- Server-side role verification
- Restricted administrator routes

### Tasks
- Create examination tasks
- Assign tasks to teachers
- Set deadlines
- View task status
- Mark tasks completed
- Identify overdue tasks

### Dashboard
- Total tasks
- Completed tasks
- Pending tasks
- Overdue tasks

### Reports
- Teacher-wise statistics
- Task completion counts
- Completion rate

## Requirements

- Rust toolchain
- Supabase project
- Render account for deployment
- PostgreSQL connection string

## Supabase setup

1. Create a Supabase project.
2. Open SQL Editor.
3. Execute `supabase/migrations/001_initial_schema.sql`.
4. Enable email/password authentication.
5. Configure the Site URL and allowed redirect URLs.

For local development, add:

`http://localhost:8080`

For production, add your Render application URL.

## Frontend setup

Edit `Frontend/config.js`.

Add:

- Supabase project URL
- Supabase publishable key

Never add a database password or service-role key to frontend files.

## Local environment

Copy the example environment file:

`Copy-Item .env.example .env`

Fill in the Supabase credentials.

## Run locally

From the repository root:

`cargo check --manifest-path backend/rust/Cargo.toml`

`cargo run --manifest-path backend/rust/Cargo.toml`

Open:

`http://localhost:8080`

## Administrator setup

1. Register an account.
2. Verify your email if verification is enabled.
3. Execute this SQL in Supabase:

```sql
UPDATE public.profiles
SET role = 'admin'
WHERE email = 'YOUR_EMAIL_ADDRESS';
```

4. Sign out and sign back in.

All other self-registered accounts receive the teacher role.

## API

| Method | Endpoint | Permission |
|---|---|---|
| GET | /api/health | Public |
| GET | /api/me | Authenticated |
| GET | /api/dashboard | Authenticated |
| GET | /api/tasks | Authenticated |
| POST | /api/tasks | Admin |
| PATCH | /api/tasks/{id}/complete | Assigned teacher or admin |
| GET | /api/teachers | Admin |
| GET | /api/reports | Admin |

## Render deployment

1. Push the project to GitHub.
2. Create a Render Web Service.
3. Connect the GitHub repository.
4. Select Docker as the runtime.
5. Leave Root Directory blank.
6. Use the repository-root Dockerfile.
7. Add production environment variables in Render.
8. Deploy.

Render supplies PORT automatically.

## Environment variables

Required:

- DATABASE_URL
- SUPABASE_URL
- SUPABASE_PUBLISHABLE_KEY

Optional:

- HOST
- PORT
- FRONTEND_DIR
- RUST_LOG

## Security

- Database credentials stay server-side.
- Supabase Auth validates identity.
- Rust loads roles from PostgreSQL.
- Role checks happen on the backend.
- Database tables have Row Level Security enabled.
- No service-role key is exposed to the browser.

## MVP limitations

- Teachers register themselves.
- Administrators are promoted through the database for now.
- Task completion does not yet include document submissions.
- Reports are basic task summaries.
- No separate Python or C++ service is needed for this MVP.

