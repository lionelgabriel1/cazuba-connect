import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Eye, EyeOff, LogOut, LayoutDashboard, Users, FileText, CreditCard, FolderOpen, Award, Menu, Check, X, Download, ExternalLink } from "lucide-react";
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, AreaChart, Area,
  XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend,
} from "recharts";
import { tenant } from "@/config/tenant";
import {
  supabase, loginAdmin, logout,
  adminListEnrollments, adminListPayments, adminListReceipts, adminListCertificates,
  adminSetDocumentStatus, adminConfirmPayment, adminIssueCertificate,
  downloadCertificatePdf, formatAOA, formatDate,
  type Enrollment, type Payment, type Receipt as RReceipt, type Certificate,
} from "@/lib/supabase";
import { toastError } from "@/lib/errors";

export const Route = createFileRoute("/admin")({
  head: () => ({ meta: [{ title: `Admin — ${tenant.name}` }, { name: "robots", content: "noindex, nofollow" }] }),
  component: AdminRoute,
});

function AdminRoute() {
  const [ready, setReady] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  async function check() {
    const { data } = await supabase.auth.getSession();
    if (!data.session) { setIsAdmin(false); setReady(true); return; }
    const { data: p } = await supabase.from("profiles").select("role").eq("id", data.session.user.id).single();
    setIsAdmin(p?.role === "admin");
    setReady(true);
  }
  useEffect(() => { void check(); const { data: sub } = supabase.auth.onAuthStateChange(() => check()); return () => sub.subscription.unsubscribe(); }, []);

  if (!ready) return <div className="min-h-screen bg-[#F5F5F5]" />;
  if (!isAdmin) return <AdminLogin onSuccess={check} />;
  return <AdminPanel onLogout={async () => { await logout(); setIsAdmin(false); }} />;
}

function AdminLogin({ onSuccess }: { onSuccess: () => void }) {
  const [email, setEmail] = useState("");
  const [pwd, setPwd] = useState("");
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (loading) return;
    setLoading(true);
    try { await loginAdmin(email, pwd); toast.success("Bem-vindo, Admin"); onSuccess(); }
    catch (err) { toastError(err, "Sem permissões de administrador"); }
    finally { setLoading(false); }
  }

  return (
    <div className="min-h-screen bg-[#F5F5F5] grid place-items-center px-4">
      <div className="w-full max-w-md bg-white rounded-2xl border border-border shadow-md p-8">
        <h1 className="font-display text-xl font-bold text-primary text-center">Painel Administrativo</h1>
        <p className="text-xs text-muted-foreground text-center mt-1">Acesso restrito</p>
        <form onSubmit={submit} className="mt-6 space-y-4">
          <label className="block">
            <span className="text-xs font-bold uppercase text-muted-foreground">Email</span>
            <input required type="email" value={email} onChange={e => setEmail(e.target.value)} className="mt-1 w-full h-11 px-4 rounded-lg border border-border outline-none focus:border-primary" />
          </label>
          <label className="block">
            <span className="text-xs font-bold uppercase text-muted-foreground">Password</span>
            <div className="relative mt-1">
              <input required type={show ? "text" : "password"} value={pwd} onChange={e => setPwd(e.target.value)} className="w-full h-11 px-4 pr-10 rounded-lg border border-border outline-none focus:border-primary" />
              <button type="button" onClick={() => setShow(s => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">{show ? <EyeOff size={18} /> : <Eye size={18} />}</button>
            </div>
          </label>
          <button disabled={loading} className="w-full h-11 rounded-full bg-primary text-primary-foreground font-bold disabled:opacity-50">{loading ? "A entrar..." : "Entrar"}</button>
        </form>
      </div>
    </div>
  );
}

/* ───────── PANEL ───────── */
type Tab = "inicio" | "alunos" | "inscricoes" | "pagamentos" | "documentos" | "certificados";

function AdminPanel({ onLogout }: { onLogout: () => void }) {
  const [tab, setTab] = useState<Tab>("inicio");
  const [drawer, setDrawer] = useState(false);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [receipts, setReceipts] = useState<RReceipt[]>([]);
  const [certs, setCerts] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    try {
      const [e, p, r, c] = await Promise.all([adminListEnrollments(), adminListPayments(), adminListReceipts(), adminListCertificates()]);
      setEnrollments(e); setPayments(p); setReceipts(r); setCerts(c);
    } catch (err) { toastError(err, "Erro a carregar"); }
    finally { setLoading(false); }
  }
  useEffect(() => { void load(); }, []);

  const nav = [
    { id: "inicio", label: "Visão Geral", icon: LayoutDashboard },
    { id: "alunos", label: "Alunos", icon: Users },
    { id: "inscricoes", label: "Inscrições", icon: FileText },
    { id: "pagamentos", label: "Pagamentos", icon: CreditCard },
    { id: "documentos", label: "Documentos", icon: FolderOpen },
    { id: "certificados", label: "Certificados", icon: Award },
  ] as const;

  const Sidebar = (
    <aside className="w-60 shrink-0 bg-white border-r border-border h-full flex flex-col">
      <div className="p-5 border-b border-border">
        <div className="flex items-center gap-2">
          <div className="size-9 rounded-full bg-primary text-gold grid place-items-center font-display font-extrabold border-2 border-gold">{tenant.shortName[0]}</div>
          <div className="leading-tight">
            <div className="font-display font-extrabold text-primary text-sm">{tenant.shortName}</div>
            <div className="text-[9px] uppercase tracking-wider text-muted-foreground">Admin</div>
          </div>
        </div>
      </div>
      <nav className="flex-1 p-2 space-y-1">
        {nav.map(n => {
          const Icon = n.icon; const active = tab === n.id;
          return (
            <button key={n.id} onClick={() => { setTab(n.id as Tab); setDrawer(false); }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold transition ${active ? "bg-primary text-primary-foreground" : "text-foreground/70 hover:bg-muted"}`}>
              <Icon size={18} /> {n.label}
            </button>
          );
        })}
      </nav>
    </aside>
  );

  return (
    <div className="min-h-screen bg-muted/40 flex">
      <div className="hidden md:flex">{Sidebar}</div>
      {drawer && (
        <div className="md:hidden fixed inset-0 z-40">
          <div className="absolute inset-0 bg-black/40" onClick={() => setDrawer(false)} />
          <div className="absolute left-0 top-0 bottom-0">{Sidebar}</div>
        </div>
      )}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 bg-white border-b border-border px-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => setDrawer(true)} className="md:hidden p-2 -ml-2"><Menu /></button>
            <div className="font-bold text-foreground">Painel Administrativo</div>
          </div>
          <button onClick={onLogout} className="inline-flex items-center gap-2 text-sm font-semibold text-foreground/70 hover:text-primary">
            <LogOut size={16} /> Sair
          </button>
        </header>
        <main className="flex-1 p-5 md:p-8 overflow-auto">
          {loading ? <div className="text-muted-foreground">A carregar...</div> : (
            <>
              {tab === "inicio" && <Overview enrollments={enrollments} payments={payments} certs={certs} />}
              {tab === "alunos" && <Alunos enrollments={enrollments} />}
              {tab === "inscricoes" && <Inscricoes enrollments={enrollments} />}
              {tab === "pagamentos" && <Pagamentos payments={payments} reload={load} />}
              {tab === "documentos" && <Documentos enrollments={enrollments} reload={load} />}
              {tab === "certificados" && <Certificados enrollments={enrollments} certs={certs} reload={load} />}
            </>
          )}
        </main>
      </div>
    </div>
  );
}

/* ───────── OVERVIEW ───────── */
function Overview({ enrollments, payments, certs }: { enrollments: Enrollment[]; payments: Payment[]; certs: Certificate[] }) {
  const totalStudents = new Set(enrollments.map(e => e.student_id)).size;
  const thisMonth = enrollments.filter(e => new Date(e.created_at).getMonth() === new Date().getMonth()).length;
  const revenue = payments.filter(p => p.status === "confirmado").reduce((s, p) => s + Number(p.amount), 0);
  const pendingDocs = enrollments.filter(e => e.document_status === "pendente" && e.document_url).length;
  const pendingPays = payments.filter(p => p.status === "aguardando").length;

  const enrollByMonth = useMemo(() => {
    const map = new Map<string, number>();
    const now = new Date();
    for (let i = 5; i >= 0; i--) { const d = new Date(now.getFullYear(), now.getMonth() - i, 1); map.set(`${d.getMonth() + 1}/${d.getFullYear().toString().slice(2)}`, 0); }
    enrollments.forEach(e => { const d = new Date(e.created_at); const k = `${d.getMonth() + 1}/${d.getFullYear().toString().slice(2)}`; if (map.has(k)) map.set(k, map.get(k)! + 1); });
    return Array.from(map.entries()).map(([month, value]) => ({ month, value }));
  }, [enrollments]);

  const revByCourse = useMemo(() => {
    const map = new Map<string, number>();
    payments.filter(p => p.status === "confirmado").forEach(p => map.set(p.course, (map.get(p.course) ?? 0) + Number(p.amount)));
    return Array.from(map.entries()).map(([course, value]) => ({ course: course.slice(0, 12), value }));
  }, [payments]);

  const distByCourse = useMemo(() => {
    const map = new Map<string, number>();
    enrollments.forEach(e => map.set(e.course, (map.get(e.course) ?? 0) + 1));
    return Array.from(map.entries()).map(([name, value]) => ({ name, value }));
  }, [enrollments]);

  const payOverTime = useMemo(() => {
    const map = new Map<string, { month: string; confirmado: number; aguardando: number }>();
    const now = new Date();
    for (let i = 5; i >= 0; i--) { const d = new Date(now.getFullYear(), now.getMonth() - i, 1); const k = `${d.getMonth() + 1}/${d.getFullYear().toString().slice(2)}`; map.set(k, { month: k, confirmado: 0, aguardando: 0 }); }
    payments.forEach(p => { const d = new Date(p.created_at); const k = `${d.getMonth() + 1}/${d.getFullYear().toString().slice(2)}`; const row = map.get(k); if (row) row[p.status as "confirmado" | "aguardando"] += Number(p.amount); });
    return Array.from(map.values());
  }, [payments]);

  const stats = [
    { label: "Total de Alunos", value: totalStudents },
    { label: "Inscrições este mês", value: thisMonth },
    { label: "Receita Total", value: formatAOA(revenue) },
    { label: "Docs Pendentes", value: pendingDocs },
    { label: "Pagamentos Pendentes", value: pendingPays },
  ];

  const COLORS = [tenant.primaryColor, tenant.accentColor, "#1565C0", "#42A5F5", "#FFD54F", "#90CAF9", "#FFB300", "#5C6BC0"];

  return (
    <div className="space-y-6">
      <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {stats.map(s => (
          <div key={s.label} className="bg-white rounded-xl border border-border p-5">
            <div className="text-xs uppercase font-semibold text-muted-foreground">{s.label}</div>
            <div className="text-2xl font-extrabold text-primary mt-1">{s.value}</div>
          </div>
        ))}
      </div>
      <div className="grid lg:grid-cols-2 gap-4">
        <Card title="Novas Inscrições (6 meses)">
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={enrollByMonth}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
              <XAxis dataKey="month" fontSize={12} /><YAxis fontSize={12} />
              <Tooltip />
              <Line type="monotone" dataKey="value" stroke={tenant.primaryColor} strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </Card>
        <Card title="Receita por Curso">
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={revByCourse}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
              <XAxis dataKey="course" fontSize={11} /><YAxis fontSize={12} />
              <Tooltip formatter={(v: number) => formatAOA(v)} />
              <Bar dataKey="value" fill={tenant.primaryColor} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
        <Card title="Distribuição por Curso">
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie data={distByCourse} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={50} outerRadius={90}>
                {distByCourse.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip /><Legend wrapperStyle={{ fontSize: 11 }} />
            </PieChart>
          </ResponsiveContainer>
        </Card>
        <Card title="Pagamentos: Confirmados vs Pendentes">
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={payOverTime}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
              <XAxis dataKey="month" fontSize={12} /><YAxis fontSize={12} />
              <Tooltip formatter={(v: number) => formatAOA(v)} /><Legend wrapperStyle={{ fontSize: 11 }} />
              <Area type="monotone" dataKey="confirmado" stackId="1" stroke={tenant.primaryColor} fill={tenant.primaryColor} fillOpacity={0.4} />
              <Area type="monotone" dataKey="aguardando" stackId="1" stroke={tenant.accentColor} fill={tenant.accentColor} fillOpacity={0.4} />
            </AreaChart>
          </ResponsiveContainer>
        </Card>
      </div>
    </div>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return <div className="bg-white rounded-xl border border-border p-5"><h3 className="font-bold text-primary mb-3">{title}</h3>{children}</div>;
}

/* ───────── ALUNOS ───────── */
function Alunos({ enrollments }: { enrollments: Enrollment[] }) {
  const [q, setQ] = useState("");
  const grouped = useMemo(() => {
    const map = new Map<string, { code: string; name: string; phone: string; count: number; last: string }>();
    enrollments.forEach(e => {
      const cur = map.get(e.student_id);
      if (!cur) map.set(e.student_id, { code: e.student_code, name: e.full_name, phone: e.phone ?? "", count: 1, last: e.created_at });
      else { cur.count++; if (e.created_at > cur.last) cur.last = e.created_at; }
    });
    return Array.from(map.values()).filter(s => !q || s.name.toLowerCase().includes(q.toLowerCase()) || s.code.toLowerCase().includes(q.toLowerCase()));
  }, [enrollments, q]);

  return (
    <div className="bg-white rounded-xl border border-border overflow-hidden">
      <div className="p-4 border-b border-border"><input placeholder="Pesquisar nome ou código..." value={q} onChange={e => setQ(e.target.value)} className="w-full h-10 px-4 rounded-lg border border-border outline-none focus:border-primary" /></div>
      <table className="w-full text-sm">
        <thead className="bg-muted/50 text-left text-xs uppercase text-muted-foreground">
          <tr><th className="p-3">Código</th><th className="p-3">Nome</th><th className="p-3">Telefone</th><th className="p-3">Inscrições</th><th className="p-3">Última</th></tr>
        </thead>
        <tbody>
          {grouped.map(s => (
            <tr key={s.code} className="border-t border-border">
              <td className="p-3 font-mono text-primary">{s.code}</td>
              <td className="p-3 font-semibold">{s.name}</td>
              <td className="p-3 text-muted-foreground">{s.phone}</td>
              <td className="p-3">{s.count}</td>
              <td className="p-3 text-muted-foreground">{formatDate(s.last)}</td>
            </tr>
          ))}
          {grouped.length === 0 && <tr><td colSpan={5} className="p-8 text-center text-muted-foreground">Sem alunos.</td></tr>}
        </tbody>
      </table>
    </div>
  );
}

/* ───────── INSCRIÇÕES ───────── */
function Inscricoes({ enrollments }: { enrollments: Enrollment[] }) {
  const [filter, setFilter] = useState<"todas" | "pendente" | "confirmada" | "concluida">("todas");
  const rows = filter === "todas" ? enrollments : enrollments.filter(e => e.status === filter);
  return (
    <div className="bg-white rounded-xl border border-border overflow-hidden">
      <div className="p-4 border-b border-border flex gap-2 flex-wrap">
        {["todas", "pendente", "confirmada", "concluida"].map(f => (
          <button key={f} onClick={() => setFilter(f as any)} className={`px-3 py-1.5 rounded-full text-xs font-semibold ${filter === f ? "bg-primary text-primary-foreground" : "bg-muted text-foreground/70"}`}>{f}</button>
        ))}
      </div>
      <table className="w-full text-sm">
        <thead className="bg-muted/50 text-left text-xs uppercase text-muted-foreground">
          <tr><th className="p-3">Código</th><th className="p-3">Aluno</th><th className="p-3">Curso</th><th className="p-3">Data</th><th className="p-3">Estado</th><th className="p-3">Doc.</th></tr>
        </thead>
        <tbody>
          {rows.map(e => (
            <tr key={e.id} className="border-t border-border">
              <td className="p-3 font-mono text-primary">{e.student_code}</td>
              <td className="p-3 font-semibold">{e.full_name}</td>
              <td className="p-3">{e.course}</td>
              <td className="p-3 text-muted-foreground">{formatDate(e.created_at)}</td>
              <td className="p-3"><Badge value={e.status} /></td>
              <td className="p-3"><Badge value={e.document_status} /></td>
            </tr>
          ))}
          {rows.length === 0 && <tr><td colSpan={6} className="p-8 text-center text-muted-foreground">Sem inscrições.</td></tr>}
        </tbody>
      </table>
    </div>
  );
}

function Badge({ value }: { value: string }) {
  const map: Record<string, string> = {
    pendente: "bg-amber-100 text-amber-800", confirmada: "bg-blue-100 text-blue-800", concluida: "bg-emerald-100 text-emerald-800",
    aguardando: "bg-amber-100 text-amber-800", confirmado: "bg-emerald-100 text-emerald-800",
    aprovado: "bg-emerald-100 text-emerald-800", rejeitado: "bg-red-100 text-red-800",
  };
  return <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${map[value] ?? "bg-muted text-foreground"}`}>{value}</span>;
}

/* ───────── PAGAMENTOS ───────── */
function Pagamentos({ payments, reload }: { payments: Payment[]; reload: () => void }) {
  const [busyId, setBusyId] = useState<string | null>(null);
  async function confirm(p: Payment) {
    setBusyId(p.id);
    try { await adminConfirmPayment(p.id); toast.success("Pagamento confirmado"); reload(); }
    catch (e) { toastError(e, "Erro a confirmar pagamento"); }
    finally { setBusyId(null); }
  }
  return (
    <div className="bg-white rounded-xl border border-border overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-muted/50 text-left text-xs uppercase text-muted-foreground">
          <tr><th className="p-3">Curso</th><th className="p-3">Valor</th><th className="p-3">Método</th><th className="p-3">Data</th><th className="p-3">Estado</th><th className="p-3"></th></tr>
        </thead>
        <tbody>
          {payments.map(p => (
            <tr key={p.id} className="border-t border-border">
              <td className="p-3 font-semibold">{p.course}</td>
              <td className="p-3 font-bold text-primary">{formatAOA(Number(p.amount))}</td>
              <td className="p-3">{p.method}</td>
              <td className="p-3 text-muted-foreground">{formatDate(p.created_at)}</td>
              <td className="p-3"><Badge value={p.status} /></td>
              <td className="p-3">{p.status === "aguardando" && <button onClick={() => confirm(p)} disabled={busyId === p.id} className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 disabled:opacity-50"><Check size={12} /> {busyId === p.id ? "A confirmar..." : "Confirmar"}</button>}</td>
            </tr>
          ))}
          {payments.length === 0 && <tr><td colSpan={6} className="p-8 text-center text-muted-foreground">Sem pagamentos.</td></tr>}
        </tbody>
      </table>
    </div>
  );
}

/* ───────── DOCUMENTOS ───────── */
function Documentos({ enrollments, reload }: { enrollments: Enrollment[]; reload: () => void }) {
  const rows = enrollments.filter(e => e.document_url);
  const [busyId, setBusyId] = useState<string | null>(null);
  async function decide(e: Enrollment, status: "aprovado" | "rejeitado") {
    const note = status === "rejeitado" ? (window.prompt("Motivo (opcional):") ?? undefined) : undefined;
    setBusyId(e.id);
    try { await adminSetDocumentStatus(e.id, status, note); toast.success("Documento atualizado"); reload(); }
    catch (err) { toastError(err, "Erro a atualizar documento"); }
    finally { setBusyId(null); }
  }
  async function viewDoc(path: string) {
    try {
      const { data, error } = await supabase.storage.from("cazuba-docs").createSignedUrl(path, 120);
      if (error) throw error;
      if (data?.signedUrl) window.open(data.signedUrl, "_blank");
    } catch (e) { toastError(e, "Não foi possível abrir o documento"); }
  }
  return (
    <div className="bg-white rounded-xl border border-border overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-muted/50 text-left text-xs uppercase text-muted-foreground">
          <tr><th className="p-3">Aluno</th><th className="p-3">Ficheiro</th><th className="p-3">Estado</th><th className="p-3"></th></tr>
        </thead>
        <tbody>
          {rows.map(e => (
            <tr key={e.id} className="border-t border-border">
              <td className="p-3 font-semibold">{e.full_name} <span className="font-mono text-xs text-muted-foreground block">{e.student_code}</span></td>
              <td className="p-3 text-muted-foreground">{e.document_name}</td>
              <td className="p-3"><Badge value={e.document_status} /></td>
              <td className="p-3 flex gap-2 flex-wrap">
                <button onClick={() => viewDoc(e.document_url!)} className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-bold"><ExternalLink size={12} /> Ver</button>
                <button onClick={() => decide(e, "aprovado")} disabled={busyId === e.id} className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-emerald-600 text-white text-xs font-bold disabled:opacity-50"><Check size={12} /> Aprovar</button>
                <button onClick={() => decide(e, "rejeitado")} disabled={busyId === e.id} className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-red-600 text-white text-xs font-bold disabled:opacity-50"><X size={12} /> Rejeitar</button>
              </td>
            </tr>
          ))}
          {rows.length === 0 && <tr><td colSpan={4} className="p-8 text-center text-muted-foreground">Sem documentos.</td></tr>}
        </tbody>
      </table>
    </div>
  );
}

/* ───────── CERTIFICADOS ───────── */
function Certificados({ enrollments, certs, reload }: { enrollments: Enrollment[]; certs: Certificate[]; reload: () => void }) {
  const [busyId, setBusyId] = useState<string | null>(null);
  async function issue(e: Enrollment) {
    setBusyId(e.id);
    try { const c = await adminIssueCertificate(e.id); toast.success("Certificado emitido"); await downloadCertificatePdf(c); reload(); }
    catch (err) { toastError(err, "Erro a emitir certificado"); }
    finally { setBusyId(null); }
  }
  const eligible = enrollments.filter(e => e.status !== "pendente" && !certs.find(c => c.enrollment_id === e.id));
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl border border-border overflow-hidden">
        <div className="p-4 border-b border-border font-bold text-primary">Inscrições elegíveis</div>
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-left text-xs uppercase text-muted-foreground"><tr><th className="p-3">Aluno</th><th className="p-3">Curso</th><th className="p-3"></th></tr></thead>
          <tbody>
            {eligible.map(e => (
              <tr key={e.id} className="border-t border-border">
                <td className="p-3 font-semibold">{e.full_name}</td>
                <td className="p-3">{e.course}</td>
                <td className="p-3"><button onClick={() => issue(e)} disabled={busyId === e.id} className="px-3 py-1.5 rounded-full bg-primary text-primary-foreground text-xs font-bold disabled:opacity-50">{busyId === e.id ? "A emitir..." : "Emitir Certificado"}</button></td>
              </tr>
            ))}
            {eligible.length === 0 && <tr><td colSpan={3} className="p-8 text-center text-muted-foreground">Nenhuma inscrição elegível.</td></tr>}
          </tbody>
        </table>
      </div>
      <div className="bg-white rounded-xl border border-border overflow-hidden">
        <div className="p-4 border-b border-border font-bold text-primary">Certificados emitidos</div>
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-left text-xs uppercase text-muted-foreground"><tr><th className="p-3">Aluno</th><th className="p-3">Curso</th><th className="p-3">Data</th><th className="p-3"></th></tr></thead>
          <tbody>
            {certs.map(c => (
              <tr key={c.id} className="border-t border-border">
                <td className="p-3 font-semibold">{c.full_name}</td>
                <td className="p-3">{c.course}</td>
                <td className="p-3 text-muted-foreground">{formatDate(c.issued_at)}</td>
                <td className="p-3"><button onClick={() => downloadCertificatePdf(c)} className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-bold"><Download size={12} /> PDF</button></td>
              </tr>
            ))}
            {certs.length === 0 && <tr><td colSpan={4} className="p-8 text-center text-muted-foreground">Sem certificados.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
