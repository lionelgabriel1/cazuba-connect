// src/routes/aluno.tsx
// Login definitivo: student_code + password via Supabase Auth

import { createFileRoute, Outlet, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { LogOut, LayoutDashboard, FileText, CreditCard, Award, Receipt, User, Eye, EyeOff } from "lucide-react";
import { PageShell } from "@/components/cazuba/Shell";
import { supabase, loginStudent, logout, getProfile, type Profile } from "@/lib/supabase";

export const Route = createFileRoute("/aluno")({
  head: () => ({
    meta: [
      { title: "Área do Aluno — Cazuba" },
      { name: "description", content: "Acesso à sua área pessoal: inscrições, pagamentos, comprovativos e certificados." },
    ],
  }),
  component: AlunoLayout,
});

function AlunoLayout() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // Verifica sessão activa no Supabase
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session) {
        const p = await getProfile();
        setProfile(p);
      }
      setReady(true);
    });

    // Listener para mudanças de sessão
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session) {
        const p = await getProfile();
        setProfile(p);
      } else {
        setProfile(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  if (!ready) return null;

  if (!profile) {
    return <LoginPage onLogin={setProfile} />;
  }

  return <Dashboard profile={profile} onLogout={() => setProfile(null)} />;
}

/* ── Login ─────────────────────────────────────────────────── */

function LoginPage({ onLogin }: { onLogin: (p: Profile) => void }) {
  const navigate = useNavigate();
  const [studentCode, setStudentCode] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(""); setLoading(true);
    try {
      await loginStudent(studentCode.trim().toUpperCase(), password);
      const p = await getProfile();
      if (p) onLogin(p);
    } catch {
      setError("Código de aluno ou password incorretos.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <PageShell
      title="Área do Aluno"
      subtitle="Entre com o seu Código de Aluno (presente no comprovativo de inscrição) e a password que escolheu."
    >
      <div className="max-w-md mx-auto bg-white rounded-2xl border border-border shadow-md p-8">
        <div className="size-14 mx-auto rounded-full bg-primary/10 grid place-items-center text-primary mb-4">
          <User size={28} />
        </div>
        <h2 className="text-center font-display text-xl font-bold text-primary">Entrar na minha conta</h2>

        <form onSubmit={submit} className="mt-6 space-y-4">
          <label className="block">
            <span className="text-xs font-bold uppercase text-muted-foreground">Código de Aluno</span>
            <input
              type="text"
              required
              value={studentCode}
              onChange={e => setStudentCode(e.target.value.toUpperCase())}
              className="mt-1 w-full h-11 px-4 rounded-lg border border-border outline-none focus:border-primary font-mono tracking-widest text-primary font-bold"
              placeholder="CAZ-2026-0001"
            />
          </label>

          <label className="block">
            <span className="text-xs font-bold uppercase text-muted-foreground">Password</span>
            <div className="relative mt-1">
              <input
                type={showPass ? "text" : "password"}
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full h-11 px-4 pr-11 rounded-lg border border-border outline-none focus:border-primary"
                placeholder="A sua password"
              />
              <button type="button" onClick={() => setShowPass(s => !s)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary">
                {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </label>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full h-11 rounded-full bg-primary text-primary-foreground font-bold hover:bg-[#1565C0] disabled:opacity-60"
          >
            {loading ? "A entrar..." : "Entrar"}
          </button>

          <button
            type="button"
            onClick={() => navigate({ to: "/inscricao" })}
            className="w-full h-11 rounded-full border border-primary text-primary font-bold hover:bg-primary/5"
          >
            Ainda não me inscrevi
          </button>
        </form>

        <p className="text-xs text-muted-foreground text-center mt-4">
          O seu Código de Aluno está no comprovativo PDF recebido na inscrição.
        </p>
      </div>
    </PageShell>
  );
}

/* ── Dashboard ──────────────────────────────────────────────── */

function Dashboard({ profile, onLogout }: { profile: Profile; onLogout: () => void }) {
  const navigate = useNavigate();

  async function handleLogout() {
    await logout();
    onLogout();
  }

  const navItems = [
    { to: "/aluno", label: "Início", icon: LayoutDashboard },
    { to: "/aluno/inscricoes", label: "Inscrições", icon: FileText },
    { to: "/aluno/pagamentos", label: "Pagamentos", icon: CreditCard },
    { to: "/aluno/comprovativos", label: "Comprovativos", icon: Receipt },
    { to: "/aluno/certificados", label: "Certificados", icon: Award },
  ];

  return (
    <div className="min-h-screen bg-secondary">
      {/* Topbar */}
      <header className="bg-primary text-primary-foreground sticky top-0 z-40 shadow-md">
        <div className="mx-auto max-w-7xl px-5 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="size-8 rounded-full bg-gold text-gold-foreground grid place-items-center font-display font-extrabold text-sm border border-white/20">C</div>
            <div>
              <div className="font-display font-bold text-sm leading-none">CAZUBA</div>
              <div className="text-[9px] text-white/60 uppercase tracking-widest">Área do Aluno</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <div className="text-sm font-semibold">{profile.full_name.split(" ")[0]}</div>
              <div className="text-[10px] text-white/60 font-mono">{profile.student_code}</div>
            </div>
            <button onClick={handleLogout} className="flex items-center gap-1.5 text-xs text-white/80 hover:text-white border border-white/20 rounded-full px-3 py-1.5 transition hover:bg-white/10">
              <LogOut size={14} /> Sair
            </button>
          </div>
        </div>
      </header>

      {/* Nav lateral */}
      <div className="mx-auto max-w-7xl px-4 py-6 flex gap-6">
        <nav className="hidden md:flex flex-col gap-1 w-52 shrink-0">
          {navItems.map(({ to, label, icon: Icon }) => (
            <a key={to} href={to}
              className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold text-foreground/70 hover:bg-white hover:text-primary transition">
              <Icon size={17} /> {label}
            </a>
          ))}
        </nav>

        {/* Conteúdo */}
        <main className="flex-1 min-w-0">
          <Outlet />
        </main>
      </div>
    </div>
  );
      }
