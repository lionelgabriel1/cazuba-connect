import { Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, type ReactNode } from "react";
import { LogOut } from "lucide-react";
import { toast } from "sonner";
import { tenant } from "@/config/tenant";
import { supabase, logout } from "@/lib/supabase";
import { toastError } from "@/lib/errors";

export function PageShell({ title, subtitle, children, actions }: { title: string; subtitle?: string; children: ReactNode; actions?: ReactNode }) {
  const nav = useNavigate();
  const [hasSession, setHasSession] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setHasSession(!!data.session));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => setHasSession(!!s));
    return () => sub.subscription.unsubscribe();
  }, []);

  async function handleLogout() {
    setSigningOut(true);
    try {
      await logout();
      toast.success("Sessão terminada");
      nav({ to: "/" });
    } catch (e) {
      toastError(e, "Erro a terminar sessão");
    } finally { setSigningOut(false); }
  }

  return (
    <div className="min-h-screen bg-[#F5F5F5]">
      <header className="bg-white border-b border-border shadow-sm">
        <div className="mx-auto max-w-7xl px-5 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="size-10 rounded-full bg-primary text-gold grid place-items-center font-display font-extrabold border-2 border-gold">{tenant.shortName[0]}</div>
            <div className="leading-tight">
              <div className="font-display font-extrabold text-primary text-base tracking-tight">{tenant.shortName}</div>
              <div className="text-[9px] uppercase tracking-[0.15em] text-muted-foreground font-semibold">Centro de Treinamento</div>
            </div>
          </Link>
          <nav className="flex items-center gap-2 text-sm font-semibold">
            <Link to="/" className="px-3 py-2 text-primary hover:underline">Início</Link>
            {!hasSession && (
              <Link to="/inscricao" className="px-3 py-2 rounded-full border-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground transition">Inscrever-se</Link>
            )}
            <Link to="/aluno" className="px-3 py-2 rounded-full bg-gold text-gold-foreground font-bold hover:brightness-105">Área do Aluno</Link>
            {hasSession && (
              <button onClick={handleLogout} disabled={signingOut} className="inline-flex items-center gap-1.5 px-3 py-2 rounded-full border border-border text-foreground/70 hover:bg-muted disabled:opacity-50">
                <LogOut size={14} /> {signingOut ? "A sair..." : "Sair"}
              </button>
            )}
          </nav>
        </div>
      </header>
      <section className="bg-gradient-to-br from-primary to-[#1565C0] text-white">
        <div className="mx-auto max-w-7xl px-5 py-10 flex flex-wrap items-end gap-4 justify-between">
          <div>
            <h1 className="font-display text-3xl md:text-4xl font-extrabold">{title}</h1>
            {subtitle && <p className="mt-2 text-white/85 max-w-2xl">{subtitle}</p>}
          </div>
          {actions}
        </div>
      </section>
      <main className="mx-auto max-w-7xl px-5 py-10">{children}</main>
      <footer className="border-t border-border bg-white py-6 mt-10 text-center text-xs text-muted-foreground">
        © 2026 {tenant.name} — {tenant.tagline}
      </footer>
    </div>
  );
}
