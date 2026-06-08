import { createFileRoute, Link, Outlet, useLocation, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { LogOut, LayoutDashboard, FileText, CreditCard, Award, Receipt, Users, Lock, ShieldCheck } from "lucide-react";
import { PageShell } from "@/components/cazuba/Shell";
import { getAdminSession, adminLogin, adminLogout } from "@/lib/cazuba-store";

export const Route = createFileRoute("/admin")({
  head: () => ({ meta: [{ title: "Painel Admin — Cazuba" }, { name: "robots", content: "noindex" }] }),
  component: AdminLayout,
});

function AdminLayout() {
  const [session, setS] = useState<{ user: string } | null>(null);
  const [ready, setReady] = useState(false);
  useEffect(() => { setS(getAdminSession()); setReady(true); }, []);
  if (!ready) return null;
  if (!session) return <Login onOk={() => setS(getAdminSession())} />;
  return <Panel onLogout={() => { adminLogout(); setS(null); }} />;
}

function Login({ onOk }: { onOk: () => void }) {
  const nav = useNavigate();
  const [pwd, setPwd] = useState("");
  const [err, setErr] = useState("");
  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (adminLogin(pwd)) onOk();
    else setErr("Palavra-passe incorreta.");
  }
  return (
    <PageShell title="Painel Administrativo" subtitle="Acesso restrito à equipa do Cazuba Centro de Treinamento.">
      <div className="max-w-md mx-auto bg-white rounded-2xl border border-border shadow-md p-8">
        <div className="size-14 mx-auto rounded-full bg-primary/10 grid place-items-center text-primary mb-4"><Lock /></div>
        <h2 className="text-center font-display text-xl font-bold text-primary">Entrar como Administrador</h2>
        <p className="text-center text-xs text-muted-foreground mt-1">Demo: <code className="bg-muted px-1.5 py-0.5 rounded">cazuba2026</code></p>
        <form onSubmit={submit} className="mt-6 space-y-4">
          <label className="block">
            <span className="text-xs font-bold uppercase text-muted-foreground">Palavra-passe</span>
            <input type="password" required value={pwd} onChange={e => setPwd(e.target.value)}
              className="mt-1 w-full h-11 px-4 rounded-lg border border-border outline-none focus:border-primary" />
          </label>
          {err && <p className="text-sm text-destructive">{err}</p>}
          <button className="w-full h-11 rounded-full bg-primary text-primary-foreground font-bold hover:bg-[#1565C0]">Entrar</button>
          <button type="button" onClick={() => nav({ to: "/" })} className="w-full h-11 rounded-full border border-border text-foreground/70 hover:bg-muted">Voltar ao site</button>
        </form>
        <p className="text-xs text-muted-foreground text-center mt-4">Em produção: autenticação real e papéis via Lovable Cloud.</p>
      </div>
    </PageShell>
  );
}

function Panel({ onLogout }: { onLogout: () => void }) {
  const loc = useLocation();
  const tabs = [
    { to: "/admin", label: "Resumo", icon: LayoutDashboard, exact: true },
    { to: "/admin/inscricoes", label: "Inscrições", icon: FileText },
    { to: "/admin/documentos", label: "Documentos", icon: ShieldCheck },
    { to: "/admin/pagamentos", label: "Pagamentos", icon: CreditCard },
    { to: "/admin/comprovativos", label: "Comprovativos", icon: Receipt },
    { to: "/admin/certificados", label: "Certificados", icon: Award },
    { to: "/admin/alunos", label: "Alunos", icon: Users },
  ];
  return (
    <PageShell
      title="Painel Administrativo"
      subtitle="Gestão de inscrições, pagamentos, documentos, comprovativos e certificados."
      actions={<button onClick={onLogout} className="inline-flex items-center gap-2 rounded-full bg-white/15 hover:bg-white/25 transition px-4 py-2 text-sm font-bold"><LogOut size={16}/> Sair</button>}
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
