
-- ============================================================
-- EXAMHQ MVP
-- Supabase PostgreSQL schema
-- ============================================================

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ============================================================
-- PROFILES
-- ============================================================

CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY
        REFERENCES auth.users(id) ON DELETE CASCADE,

    email TEXT NOT NULL,

    full_name TEXT NOT NULL DEFAULT 'New User',

    role TEXT NOT NULL DEFAULT 'teacher'
        CHECK (role IN ('admin', 'teacher')),

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- TASKS
-- ============================================================

CREATE TABLE IF NOT EXISTS public.tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    title TEXT NOT NULL
        CHECK (char_length(title) BETWEEN 1 AND 160),

    description TEXT,

    deadline DATE NOT NULL,

    status TEXT NOT NULL DEFAULT 'pending'
        CHECK (status IN ('pending', 'completed')),

    teacher_id UUID NOT NULL
        REFERENCES public.profiles(id) ON DELETE CASCADE,

    created_by UUID NOT NULL
        REFERENCES public.profiles(id),

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    completed_at TIMESTAMPTZ
);

-- ============================================================
-- INDEXES
-- ============================================================

CREATE INDEX IF NOT EXISTS profiles_role_idx
    ON public.profiles(role);

CREATE INDEX IF NOT EXISTS tasks_teacher_id_idx
    ON public.tasks(teacher_id);

CREATE INDEX IF NOT EXISTS tasks_deadline_idx
    ON public.tasks(deadline);

CREATE INDEX IF NOT EXISTS tasks_status_idx
    ON public.tasks(status);

CREATE INDEX IF NOT EXISTS tasks_created_at_idx
    ON public.tasks(created_at DESC);

-- ============================================================
-- AUTOMATIC PROFILE CREATION
-- ============================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN

    INSERT INTO public.profiles (
        id,
        email,
        full_name,
        role
    )
    VALUES (
        NEW.id,
        COALESCE(NEW.email, ''),
        COALESCE(
            NEW.raw_user_meta_data ->> 'full_name',
            split_part(COALESCE(NEW.email, ''), '@', 1)
        ),
        'teacher'
    )
    ON CONFLICT (id) DO NOTHING;

    RETURN NEW;

END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created
    ON auth.users;

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

-- The browser does not access these tables directly.
-- The Rust backend uses the server-side PostgreSQL connection.
-- No public table policies are created.

-- ============================================================
-- RESTRICT PROFILE MODIFICATION
-- ============================================================

REVOKE ALL ON public.profiles FROM anon, authenticated;
REVOKE ALL ON public.tasks FROM anon, authenticated;

-- ============================================================
-- DONE
-- ============================================================
