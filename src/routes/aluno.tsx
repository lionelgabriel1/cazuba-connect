import { createFileRoute, Link, Outlet, useLocation, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { LogOut, LayoutDashboard, FileText, CreditCard, Award, Receipt, User } from "lucide-react";
import { PageShell } from "@/components/cazuba/Shell";
import { getSession, setSession, listEnrollments } from "@/lib/cazuba-store";

export const Route = createFileRoute("/aluno")({
  head: () => ({ meta: [{ title: "Área do Aluno — Cazuba" }, { name: "description", content: "Acesso à sua área pessoal: inscrições, pagamentos, comprovativos e certificados." }] }),
  component: AlunoLayout,
});

function AlunoLayout() {
  const [session, setS] = useState<{ email: string; name: string } | null>(null);
  const [ready, setReady] = useState(false);
  useEffect(() => { setS(getSession()); setReady(true); }, []);

  if (!ready) return null;
  if (!session) return <Login onLogin={(s) => { setSession(s); setS(s); }} />;
  return <Dashboard session={session} onLogout={() => { setSession(null); setS(null); }} />;
}

function Login({ onLogin }: { onLogin: (s: { email: string; name: string }) => void }) {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.includes("@")) { setError("Indique um e-mail válido."); return; }
    const enrolls = listEnrollments(email);
    if (enrolls.length === 0) { setError("Não encontrámos inscrições com esse e-mail. Faça primeiro a sua inscrição."); return; }
    onLogin({ email, name: enrolls[0].fullName });
  }

  return (
    <PageShell title="Área do Aluno" subtitle="Entre com o e-mail usado na inscrição para aceder ao histórico, pagamentos e certificados.">
      <div className="max-w-md mx-auto bg-white rounded-2xl border border-border shadow-md p-8">
        <div className="size-14 mx-auto rounded-full bg-primary/10 grid place-items-center text-primary mb-4"><User /></div>
        <h2 className="text-center font-display text-xl font-bold text-primary">Entrar na minha conta</h2>
        <p className="text-center text-sm text-muted-foreground mt-1">Modo demonstração — acesso por e-mail.</p>
        <form onSubmit={submit} className="mt-6 space-y-4">
          <label className="block">
            <span className="text-xs font-bold uppercase text-muted-foreground">E-mail</span>
            <input type="email" required value={email} onChange={e => setEmail(e.target.value)}
              className="mt-1 w-full h-11 px-4 rounded-lg border border-border outline-none focus:border-primary" placeholder="seu@email.com" />
          </label>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <button className="w-full h-11 rounded-full bg-primary text-primary-foreground font-bold hover:bg-[#1565C0]">Entrar</button>
          <button type="button" onClick={() => navigate({ to: "/inscricao" })} className="w-full h-11 rounded-full border border-primary text-primary font-bold hover:bg-primary/5">
            Ainda não me inscrevi
          </button>
        </form>
        <p className="text-xs text-muted-foreground text-center mt-4">
          Em breve: login real com palavra-passe via Lovable Cloud.
        </p>
      </div>
    </PageShell>
  );
}

function Dashboard({ session, onLogout }: { session: { email: string; name: string }; onLogout: () => void }) {
  const loc = useLocation();
  const tabs = [
    { to: "/aluno", label: "Resumo", icon: LayoutDashboard, exact: true },
    { to: "/aluno/inscricoes", label: "Inscrições", icon: FileText },
    { to: "/aluno/pagamentos", label: "Pagamentos", icon: CreditCard },
    { to: "/aluno/comprovativos", label: "Comprovativos", icon: Receipt },
    { to: "/aluno/certificados", label: "Certificados", icon: Award },
  ] as const;

  return (
    <PageShell
      title={`Olá, ${session.name.split(" ")[0]} 👋`}
      subtitle={session.email}
      actions={
        <button onClick={onLogout} className="inline-flex items-center gap-2 rounded-full bg-white/15 hover:bg-white/25 transition px-4 py-2 text-sm font-bold">
          <LogOut size={16}/> Sair
        </button>
      }
    >
      <div className="flex gap-2 overflow-x-auto pb-2 mb-6 border-b border-border">
        {tabs.map(t => {
          const active = t.exact ? loc.pathname === t.to : loc.pathname.startsWith(t.to);
          return (
            <Link key={t.to} to={t.to} className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-t-lg font-semibold text-sm whitespace-nowrap border-b-2 transition ${active ? "border-primary text-primary bg-primary/5" : "border-transparent text-muted-foreground hover:text-primary"}`}>
              <t.icon size={16}/> {t.label}
            </Link>
          );
        })}
      </div>
      <Outlet />
    </PageShell>
  );
}
