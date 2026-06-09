# CAZUBA CONNECT — Full Setup & Rebuild Guide

> This document is the single source of truth to rebuild **Cazuba Connect** from zero.
> It is also the white-label playbook — the same codebase ships to any training center
> by changing environment variables and a few image assets.

---

## 1. Project Overview

**Cazuba Connect** is a professional training center portal with:

- Public landing page (institutional info + courses)
- Online enrollment (3 steps, with password creation)
- Student area (dashboard, enrollments, payments, receipts, certificates)
- Admin panel (students, enrollments, payments, documents, certificates)
- Public validation of receipts/certificates via QR code

It is built as a **white-label product**: deploying for a new center only requires a new
Supabase project, new `.env`, and replacing a handful of images in `/public`.

### Full Tech Stack

- **React 18** + **Vite**
- **TanStack Router** (file-based routing in `src/routes/`)
- **Tailwind CSS v4** + **shadcn/ui** components
- **Supabase** (Auth + PostgreSQL + Storage)
- **Recharts** (charts & graphs)
- **jsPDF** (PDF generation — receipts & certificates)
- **qrcode** (QR codes for public validation)
- **lucide-react** (icon set)

---

## 2. White-Label Tenant Configuration

All branding, contacts and identity are read from environment variables via a single
config module. **Never hardcode** the center name, colors, phone, email or address.

### `src/config/tenant.ts`

```ts
export const tenant = {
  name: import.meta.env.VITE_TENANT_NAME,
  shortName: import.meta.env.VITE_TENANT_SHORT,
  tagline: import.meta.env.VITE_TENANT_TAGLINE,
  logoUrl: import.meta.env.VITE_TENANT_LOGO_URL,
  primaryColor: import.meta.env.VITE_TENANT_PRIMARY,
  accentColor: import.meta.env.VITE_TENANT_ACCENT,
  phone: import.meta.env.VITE_TENANT_PHONE,
  email: import.meta.env.VITE_TENANT_EMAIL,
  address: import.meta.env.VITE_TENANT_ADDRESS,
  studentCodePrefix: import.meta.env.VITE_TENANT_CODE_PREFIX,
  metaTitle: import.meta.env.VITE_TENANT_META_TITLE,
  metaDescription: import.meta.env.VITE_TENANT_META_DESC,
};
```

### Default `.env` (Cazuba)

```env
VITE_SUPABASE_URL=https://gmjbcscfwtubkwsndymt.supabase.co
VITE_SUPABASE_ANON_KEY=sb_publishable_7itKXQ-n4RPSXKSNizV9UQ_MhYPADwg

VITE_TENANT_NAME=Cazuba Centro de Treinamento
VITE_TENANT_SHORT=CAZUBA
VITE_TENANT_TAGLINE=Capacitando talentos, construindo futuros.
VITE_TENANT_PRIMARY=#0D47A1
VITE_TENANT_ACCENT=#FFC107
VITE_TENANT_PHONE=938 747 141
VITE_TENANT_EMAIL=contato@cazubatreinamento.com
VITE_TENANT_ADDRESS=Município do Hoje-ya-Henda, Angola
VITE_TENANT_CODE_PREFIX=CAZ
VITE_TENANT_META_TITLE=Cazuba Centro de Treinamento
VITE_TENANT_META_DESC=Inscreva-se nos nossos cursos profissionais e receba certificado reconhecido.
```

All UI references to the center name, colors, contacts and code prefix MUST be replaced
with values from `tenant`.

---

## 3. Environment Setup

```bash
npm install @supabase/supabase-js
npm install          # install everything
npm run dev          # local development
npm run build        # production build → dist/
```

**Deployment** (Vercel / Netlify):

1. Push repo to GitHub
2. Create project on Vercel / Netlify pointing to the repo
3. Add **all** `VITE_*` env variables in the dashboard
4. Deploy
5. In Supabase → **Auth → URL Configuration**, add the production URL to **Site URL**
   and **Redirect URLs**

---

## 4. Supabase Schema — Full SQL

Run the following in the **Supabase SQL Editor** for any new tenant project.

```sql
-- =========================================================
-- 1. PROFILES
-- =========================================================
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  student_code text unique,
  full_name text not null,
  phone text,
  birth_date date,
  address text,
  role text not null default 'student' check (role in ('student','admin')),
  created_at timestamptz not null default now()
);

grant select, insert, update on public.profiles to authenticated;
grant all on public.profiles to service_role;
alter table public.profiles enable row level security;

create policy "profiles self read"   on public.profiles for select to authenticated using (id = auth.uid());
create policy "profiles self update" on public.profiles for update to authenticated using (id = auth.uid());
create policy "profiles admin all"   on public.profiles for all    to authenticated using (public.is_admin());

-- =========================================================
-- 2. is_admin() helper (security definer, avoids RLS recursion)
-- =========================================================
create or replace function public.is_admin()
returns boolean
language sql stable security definer set search_path = public
as $$ select exists(select 1 from public.profiles where id = auth.uid() and role='admin') $$;

-- =========================================================
-- 3. STUDENT CODE GENERATOR  {PREFIX}-{YEAR}-{NNNN}
-- =========================================================
create sequence if not exists public.student_code_seq start 1;

create or replace function public.next_student_code()
returns text
language plpgsql
as $$
declare
  prefix text := current_setting('app.tenant_prefix', true);
  n int;
begin
  if prefix is null or prefix = '' then prefix := 'CAZ'; end if;
  n := nextval('public.student_code_seq');
  return prefix || '-' || extract(year from now())::text || '-' || lpad(n::text, 4, '0');
end $$;

grant execute on function public.next_student_code() to authenticated, anon;

-- =========================================================
-- 4. handle_new_user trigger (auto profile on auth.users insert)
-- =========================================================
create or replace function public.handle_new_user()
returns trigger
language plpgsql security definer set search_path = public
as $$
begin
  insert into public.profiles (id, student_code, full_name)
  values (
    new.id,
    new.raw_user_meta_data->>'student_code',
    coalesce(new.raw_user_meta_data->>'full_name', new.email)
  )
  on conflict (id) do nothing;
  return new;
end $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

-- =========================================================
-- 5. ENROLLMENTS
-- =========================================================
create table public.enrollments (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references auth.users(id) on delete cascade,
  student_code text not null,
  full_name text not null,
  phone text,
  birth_date date,
  address text,
  course text not null,
  payment_method text not null check (payment_method in ('transferencia','referencia','presencial')),
  document_url text,
  document_name text,
  document_status text not null default 'pendente' check (document_status in ('pendente','aprovado','rejeitado')),
  document_note text,
  status text not null default 'pendente' check (status in ('pendente','confirmada','concluida')),
  created_at timestamptz not null default now()
);

grant select, insert, update on public.enrollments to authenticated;
grant all on public.enrollments to service_role;
alter table public.enrollments enable row level security;

create policy "enroll self read"  on public.enrollments for select to authenticated using (student_id = auth.uid());
create policy "enroll self write" on public.enrollments for insert to authenticated with check (student_id = auth.uid());
create policy "enroll admin all"  on public.enrollments for all    to authenticated using (public.is_admin());

-- =========================================================
-- 6. PAYMENTS
-- =========================================================
create table public.payments (
  id uuid primary key default gen_random_uuid(),
  enrollment_id uuid not null references public.enrollments(id) on delete cascade,
  student_id uuid not null references auth.users(id) on delete cascade,
  course text not null,
  amount numeric not null,
  method text not null,
  proof_url text,
  proof_name text,
  status text not null default 'aguardando' check (status in ('aguardando','confirmado')),
  confirmed_at timestamptz,
  created_at timestamptz not null default now()
);

grant select, insert, update on public.payments to authenticated;
grant all on public.payments to service_role;
alter table public.payments enable row level security;

create policy "pay self read"   on public.payments for select to authenticated using (student_id = auth.uid());
create policy "pay self insert" on public.payments for insert to authenticated with check (student_id = auth.uid());
create policy "pay self update" on public.payments for update to authenticated using (student_id = auth.uid());
create policy "pay admin all"   on public.payments for all    to authenticated using (public.is_admin());

-- =========================================================
-- 7. RECEIPTS
-- =========================================================
create table public.receipts (
  id uuid primary key default gen_random_uuid(),
  enrollment_id uuid not null references public.enrollments(id) on delete cascade,
  payment_id uuid references public.payments(id) on delete set null,
  student_id uuid not null references auth.users(id) on delete cascade,
  full_name text not null,
  course text not null,
  amount numeric not null,
  kind text not null check (kind in ('inscricao','pagamento')),
  issued_at timestamptz not null default now()
);

grant select, insert on public.receipts to authenticated;
grant select on public.receipts to anon;     -- public validation by id
grant all on public.receipts to service_role;
alter table public.receipts enable row level security;

create policy "rec self read"   on public.receipts for select to authenticated using (student_id = auth.uid());
create policy "rec public read" on public.receipts for select to anon using (true);
create policy "rec self insert" on public.receipts for insert to authenticated with check (student_id = auth.uid());
create policy "rec admin all"   on public.receipts for all    to authenticated using (public.is_admin());

-- =========================================================
-- 8. CERTIFICATES
-- =========================================================
create table public.certificates (
  id uuid primary key default gen_random_uuid(),
  enrollment_id uuid not null references public.enrollments(id) on delete cascade,
  student_id uuid not null references auth.users(id) on delete cascade,
  full_name text not null,
  course text not null,
  hours int not null,
  issued_at timestamptz not null default now()
);

grant select on public.certificates to authenticated, anon;
grant all on public.certificates to service_role;
alter table public.certificates enable row level security;

create policy "cert self read"   on public.certificates for select to authenticated using (student_id = auth.uid());
create policy "cert public read" on public.certificates for select to anon using (true);
create policy "cert admin all"   on public.certificates for all    to authenticated using (public.is_admin());

-- =========================================================
-- 9. STORAGE BUCKET (private)
-- =========================================================
insert into storage.buckets (id, name, public) values ('cazuba-docs','cazuba-docs', false)
on conflict (id) do nothing;

create policy "docs self read"  on storage.objects for select to authenticated
  using (bucket_id = 'cazuba-docs' and (auth.uid()::text = (storage.foldername(name))[2] or public.is_admin()));
create policy "docs self write" on storage.objects for insert to authenticated
  with check (bucket_id = 'cazuba-docs');
```

### Promote first admin

```sql
update public.profiles
set role = 'admin'
where id = (select id from auth.users where email = 'admin@cazuba.ao');
```

---

## 5. File Structure

```
src/
  config/
    tenant.ts            — White-label config from env vars
  lib/
    supabase.ts          — Client, types, all DB functions, PDF generation
  routes/
    index.tsx            — Public landing page
    inscricao.tsx        — 3-step enrollment with password creation
    aluno.tsx            — Student login + full dashboard
    admin.tsx            — Admin login + full management panel
    validar.$id.tsx      — Public certificate / receipt validation
  components/
    cazuba/
      Shell.tsx          — PageShell wrapper
      Navbar.tsx         — Top navigation with auth state
```

---

## 6. How to Rebuild Authentication

1. `npm install @supabase/supabase-js`, create `.env`
2. Run the full SQL schema (section 4)
3. **Enrollment**:
   - `const code = await supabase.rpc("next_student_code")`
   - `supabase.auth.signUp({ email: code.toLowerCase() + "@cazuba.internal", password, options: { data: { student_code: code, full_name } } })`
   - Insert `enrollments`, `payments` (aguardando), `receipts` (inscricao)
4. **Student login**: `supabase.auth.signInWithPassword({ email: code.toLowerCase() + "@cazuba.internal", password })`
5. **Admin login**: `signInWithPassword` with real email → verify `profiles.role === 'admin'` → otherwise `signOut()`
6. **Navbar**: `supabase.auth.onAuthStateChange()` inside a `useEffect`; use a `ready` boolean to avoid flicker

---

## 7. Password Reset (Admin-side)

Students log in with internal fake emails (`{code}@cazuba.internal`), so Supabase reset
emails go nowhere. Instead:

1. In the admin panel, render a **"Redefinir password"** button per student
2. Call a Supabase **Edge Function** that uses the service role key:
   ```ts
   await supabaseAdmin.auth.admin.updateUserById(userId, { password: newPassword });
   ```
3. Admin shares the new temporary password with the student via phone/WhatsApp

---

## 8. Email Notifications

1. Create an Edge Function `send-email` using **Resend** or **SendGrid**
2. After enrollment / payment confirmation / certificate issue:
   ```ts
   supabase.functions.invoke("send-email", { body: { to, subject, html } })
   ```
3. Customize Supabase → **Auth → Email Templates** with tenant branding

---

## 9. Payment Gateway Integration

1. Edge Function `create-payment` → call **Multicaixa Express** / **Pagalu** API,
   return payment reference to the frontend
2. Edge Function `payment-webhook` → receives confirmation, updates
   `payments.status = 'confirmado'` and `confirmed_at = now()`
3. Register webhook URL in the provider's dashboard

---

## 10. Dynamic Courses (move out of code)

```sql
create table public.courses (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  price numeric not null,
  hours int not null,
  description text,
  active boolean not null default true,
  tenant_id uuid
);
alter table public.courses enable row level security;
create policy "courses public read" on public.courses for select using (active = true);
create policy "courses admin write" on public.courses for all to authenticated using (public.is_admin());
```

Replace the hardcoded `COURSES` array in `src/lib/supabase.ts` with `getCourses()`
calling Supabase. Add a CRUD section in the admin panel.

---

## 11. Document Viewer (Admin)

Files are uploaded to `documents/{studentCode}/id.{ext}` in bucket `cazuba-docs`.

```ts
const { data } = await supabase.storage
  .from("cazuba-docs")
  .createSignedUrl(path, 60);
// open data.signedUrl in a shadcn/ui <Dialog> with an <iframe>, or in a new tab
```

---

## 12. Data Export

```bash
npm install xlsx
```

```ts
import * as XLSX from "xlsx";
const ws = XLSX.utils.json_to_sheet(rows);
const wb = XLSX.utils.book_new();
XLSX.utils.book_append_sheet(wb, ws, "Alunos");
XLSX.writeFile(wb, "alunos.xlsx");
```

For PDF reports use `jsPDF` + `jspdf-autotable`.

---

## 13. In-App Notifications

```sql
create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  student_id uuid references auth.users(id) on delete cascade,
  message text not null,
  read boolean not null default false,
  created_at timestamptz not null default now()
);
```

- Admin inserts per student or broadcast (NULL student_id)
- Bell icon in dashboard header with unread count badge
- Live updates via `supabase.channel("notifications").on("postgres_changes", ...)`

---

## 14. Deploying for a New Client (White-Label)

1. Fork the repository
2. Create a new Supabase project for the client
3. Run the full SQL schema (section 4)
4. Fill `.env` with the client's data (name, colors, contacts, code prefix)
5. Replace images in `/public` (logo, hero, founders' photos)
6. Deploy on Vercel/Netlify with a custom domain
7. Promote the admin user via SQL (section 4)

---

## 15. Design System

- **Primary**: `#0D47A1` (default; overridden by `VITE_TENANT_PRIMARY`)
- **Accent**: `#FFC107` (default; overridden by `VITE_TENANT_ACCENT`)
- **shadcn/ui**: Card, Badge, Button, Dialog, Sheet, Skeleton, Toast, Table, Tabs, Input, Label
- **Recharts**: LineChart, BarChart, PieChart, AreaChart
- **Icons**: lucide-react
- All colors, names and contacts come from `tenant`, never hardcoded

---

## 16. Known Limitations & Future Improvements

- Password reset requires admin intervention (internal fake emails)
- Payment gateway not yet integrated — manual confirmation for now
- Courses are hardcoded — move to database table (see section 10)
- No push notifications — use Supabase Realtime (see section 13)
- No student photo upload — add via Supabase Storage
- **Multi-tenant, single-instance**: when scaling, add a `tenant_id` column to all
  tables with RLS filtering by tenant, eliminating the need for one Supabase project
  per client.

---

_© 2026 Cazuba Connect — White-label training-center platform._
