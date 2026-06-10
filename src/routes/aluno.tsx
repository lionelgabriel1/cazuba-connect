import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Eye, EyeOff, LogOut, LayoutDashboard, FileText, CreditCard, Receipt, GraduationCap, Menu, Download, Upload } from "lucide-react";
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from "recharts";
import { tenant } from "@/config/tenant";
import {
  supabase, loginStudent, logout, getProfile,
  listMyEnrollments, listMyPayments, listMyReceipts, listMyCertificates, submitPaymentProof,
  downloadReceiptPdf, downloadCertificatePdf, formatAOA, formatDate, COURSES,
  type Profile, type Enrollment, type Payment, type Receipt as RReceipt, type Certificate,
} from "@/lib/supabase";
import { toastError } from "@/lib/errors";

export const Route = createFileRoute("/aluno")({
  head: () => ({ meta: [{ title: `Área do Aluno — ${tenant.name}` }, { name: "robots", content: "noindex, nofollow" }] }),
  component: AlunoRoute,
});

function AlunoRoute() {
  const [ready, setReady] = useState(false);
  const [hasSession, setHasSession] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => { setHasSession(!!data.session); setReady(true); });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => setHasSession(!!s));
    return () => sub.subscription.unsubscribe();
  }, []);

  if (!ready) return <div className="min-h-screen bg-[#F5F5F5]" />;
  if (!hasSession) return <LoginCard onSuccess={() => setHasSession(true)} />;
  return <Dashboard onLogout={() => { logout(); setHasSession(false); }} />;
}

/* ───────── LOGIN ───────── */
function LoginCard({ onSuccess }: { onSuccess: () => void }) {
  const nav = useNavigate();
  const [code, setCode] = useState("");
  const [pwd, setPwd] = useState("");
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (loading) return;
    setLoading(true);
    try {
      await loginStudent(code.toUpperCase(), pwd);
      toast.success("Bem-vindo!");
      onSuccess();
    } catch (err) {
      toastError(err, "Código de aluno ou password incorretos");
    } finally { setLoading(false); }
  }

  return (
    <div className="min-h-screen bg-[#F5F5F5] grid place-items-center px-4">
      <div className="w-full max-w-md bg-white rounded-2xl border border-border shadow-md p-8">
        <div className="text-center mb-6">
          <div className="size-14 mx-auto rounded-full bg-primary text-gold grid place-items-center font-display font-extrabold text-xl border-2 border-gold">{tenant.shortName[0]}</div>
          <h1 className="font-display text-xl font-bold text-primary mt-3">Área do Aluno</h1>
          <p className="text-xs text-muted-foreground mt-1">{tenant.name}</p>
        </div>
        <form onSubmit={submit} className="space-y-4">
          <label className="block">
            <span className="text-xs font-bold uppercase text-muted-foreground">Código de Aluno</span>
            <input required value={code} onChange={e => setCode(e.target.value.toUpperCase())} placeholder={`${tenant.studentCodePrefix}-2026-0001`} className="mt-1 w-full h-11 px-4 rounded-lg border border-border font-mono uppercase outline-none focus:border-primary" />
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
        <p className="text-xs text-muted-foreground text-center mt-4">O seu Código de Aluno está no comprovativo PDF recebido na inscrição.</p>
        <button onClick={() => nav({ to: "/inscricao" })} className="w-full mt-2 h-11 rounded-full border border-border text-foreground/70 hover:bg-muted text-sm font-semibold">Ainda não me inscrevi</button>
      </div>
    </div>
  );
}

/* ───────── DASHBOARD ───────── */
type Tab = "inicio" | "inscricoes" | "pagamentos" | "comprovativos" | "certificados";

function Dashboard({ onLogout }: { onLogout: () => void }) {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [receipts, setReceipts] = useState<RReceipt[]>([]);
  const [certs, setCerts] = useState<Certificate[]>([]);
  const [tab, setTab] = useState<Tab>("inicio");
  const [drawer, setDrawer] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => { void load(); }, []);
  async function load() {
    setLoading(true);
    try {
      const [p, e, py, r, c] = await Promise.all([
        getProfile(), listMyEnrollments(), listMyPayments(), listMyReceipts(), listMyCertificates(),
      ]);
      setProfile(p); setEnrollments(e); setPayments(py); setReceipts(r); setCerts(c);
    } catch (err) { toastError(err, "Erro a carregar dados"); }
    finally { setLoading(false); }
  }

  const totalPaid = useMemo(() => payments.filter(p => p.status === "confirmado").reduce((s, p) => s + Number(p.amount), 0), [payments]);
  const firstName = profile?.full_name?.split(" ")[0] ?? "Aluno";

  const nav = [
    { id: "inicio", label: "Início", icon: LayoutDashboard },
    { id: "inscricoes", label: "Inscrições", icon: FileText },
    { id: "pagamentos", label: "Pagamentos", icon: CreditCard },
    { id: "comprovativos", label: "Comprovativos", icon: Receipt },
    { id: "certificados", label: "Certificados", icon: GraduationCap },
  ] as const;

  const Sidebar = (
    <aside className="w-60 shrink-0 bg-white border-r border-border h-full flex flex-col">
      <div className="p-5 border-b border-border">
        <div className="flex items-center gap-2">
          <div className="size-9 rounded-full bg-primary text-gold grid place-items-center font-display font-extrabold border-2 border-gold">{tenant.shortName[0]}</div>
          <div className="leading-tight">
            <div className="font-display font-extrabold text-primary text-sm">{tenant.shortName}</div>
            <div className="text-[9px] uppercase tracking-wider text-muted-foreground">Aluno</div>
          </div>
        </div>
        <div className="mt-4">
          <div className="text-sm font-bold text-foreground truncate">{profile?.full_name}</div>
          <div className="text-xs font-mono text-primary mt-0.5">{profile?.student_code}</div>
        </div>
      </div>
      <nav className="flex-1 p-2 space-y-1">
        {nav.map(n => {
          const Icon = n.icon;
          const active = tab === n.id;
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
            <div>
              <div className="font-bold text-foreground">Olá, {firstName}</div>
              <div className="text-xs font-mono text-primary">{profile?.student_code}</div>
            </div>
          </div>
          <button onClick={onLogout} className="inline-flex items-center gap-2 text-sm font-semibold text-foreground/70 hover:text-primary">
            <LogOut size={16} /> Sair
          </button>
        </header>

        <main className="flex-1 p-5 md:p-8 overflow-auto">
          {loading ? <div className="text-muted-foreground">A carregar...</div> : (
            <>
              {tab === "inicio" && <Inicio enrollments={enrollments} payments={payments} certs={certs} totalPaid={totalPaid} onGoCerts={() => setTab("certificados")} />}
              {tab === "inscricoes" && <Inscricoes enrollments={enrollments} receipts={receipts} />}
              {tab === "pagamentos" && <Pagamentos payments={payments} reload={load} />}
              {tab === "comprovativos" && <Comprovativos receipts={receipts} studentCode={profile?.student_code ?? ""} />}
              {tab === "certificados" && <Certificados certs={certs} onGoCourses={() => { window.location.href = "/#cursos"; }} />}
            </>
          )}
        </main>
        <footer className="border-t border-border bg-white py-4 text-center text-xs text-muted-foreground">
          © 2026 {tenant.name}
        </footer>
      </div>
    </div>
  );
}

/* ───────── TAB: INÍCIO ───────── */
function Inicio({ enrollments, payments, certs, totalPaid, onGoCerts }: {
  enrollments: Enrollment[]; payments: Payment[]; certs: Certificate[]; totalPaid: number; onGoCerts: () => void;
}) {
  const status = enrollments[0]?.status ?? "—";
  const stats = [
    { label: "Total Pago", value: formatAOA(totalPaid) },
    { label: "Inscrições", value: enrollments.length },
    { label: "Certificados", value: certs.length },
    { label: "Estado", value: status },
  ];

  // chart data: payments grouped by month
  const paymentChart = useMemo(() => {
    const map = new Map<string, number>();
    payments.filter(p => p.status === "confirmado").forEach(p => {
      const d = new Date(p.confirmed_at ?? p.created_at);
      const k = `${d.getMonth() + 1}/${d.getFullYear().toString().slice(2)}`;
      map.set(k, (map.get(k) ?? 0) + Number(p.amount));
    });
    return Array.from(map.entries()).map(([month, value]) => ({ month, value }));
  }, [payments]);

  const courseChart = useMemo(() => enrollments.map(e => {
    const c = COURSES.find(x => x.name === e.course);
    const total = c?.hours ?? 64;
    const done = e.status === "concluida" ? total : e.status === "confirmada" ? Math.round(total * 0.5) : 0;
    return { course: e.course.slice(0, 14), done, total };
  }), [enrollments]);

  return (
    <div className="space-y-6">
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(s => (
          <div key={s.label} className="bg-white rounded-xl border border-border p-5">
            <div className="text-xs uppercase font-semibold text-muted-foreground">{s.label}</div>
            <div className="text-2xl font-extrabold text-primary mt-1">{s.value}</div>
          </div>
        ))}
      </div>
      <div className="grid lg:grid-cols-2 gap-4">
        <ChartCard title="Histórico de Pagamentos">
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={paymentChart}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
              <XAxis dataKey="month" fontSize={12} /><YAxis fontSize={12} />
              <Tooltip formatter={(v: number) => formatAOA(v)} />
              <Area type="monotone" dataKey="value" stroke={tenant.primaryColor} fill={tenant.primaryColor} fillOpacity={0.2} />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>
        <ChartCard title="Progresso dos Cursos (horas)">
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={courseChart}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
              <XAxis dataKey="course" fontSize={11} /><YAxis fontSize={12} />
              <Tooltip />
              <Bar dataKey="done" fill={tenant.primaryColor} name="Concluídas" />
              <Bar dataKey="total" fill={tenant.accentColor} name="Total" />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>
      {certs.length === 0 && (
        <div className="bg-white rounded-xl border border-border p-10 text-center">
          <GraduationCap className="size-16 mx-auto text-muted-foreground/60" />
          <h3 className="font-bold text-primary mt-3">Ainda sem certificados</h3>
          <p className="text-sm text-muted-foreground mt-1">Os seus certificados aparecerão aqui após concluir um curso.</p>
          <button onClick={onGoCerts} className="mt-4 px-5 h-10 rounded-full bg-primary text-primary-foreground font-bold text-sm">Ver os meus cursos</button>
        </div>
      )}
    </div>
  );
}

function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-xl border border-border p-5">
      <h3 className="font-bold text-primary mb-3">{title}</h3>
      {children}
    </div>
  );
}

/* ───────── TAB: INSCRIÇÕES ───────── */
function Inscricoes({ enrollments, receipts }: { enrollments: Enrollment[]; receipts: RReceipt[] }) {
  return (
    <div className="bg-white rounded-xl border border-border overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-muted/50 text-left text-xs uppercase text-muted-foreground">
          <tr><th className="p-3">Curso</th><th className="p-3">Data</th><th className="p-3">Estado</th><th className="p-3">Comprovativo</th></tr>
        </thead>
        <tbody>
          {enrollments.map(e => {
            const r = receipts.find(rr => rr.enrollment_id === e.id && rr.kind === "inscricao");
            return (
              <tr key={e.id} className="border-t border-border">
                <td className="p-3 font-semibold">{e.course}</td>
                <td className="p-3 text-muted-foreground">{formatDate(e.created_at)}</td>
                <td className="p-3"><StatusBadge value={e.status} /></td>
                <td className="p-3">{r && <button onClick={() => downloadReceiptPdf(r, e.student_code)} className="text-primary font-semibold inline-flex items-center gap-1 hover:underline"><Download size={14} /> PDF</button>}</td>
              </tr>
            );
          })}
          {enrollments.length === 0 && <tr><td colSpan={4} className="p-8 text-center text-muted-foreground">Sem inscrições.</td></tr>}
        </tbody>
      </table>
    </div>
  );
}

function StatusBadge({ value }: { value: string }) {
  const map: Record<string, string> = {
    pendente: "bg-amber-100 text-amber-800", confirmada: "bg-blue-100 text-blue-800",
    concluida: "bg-emerald-100 text-emerald-800", aguardando: "bg-amber-100 text-amber-800", confirmado: "bg-emerald-100 text-emerald-800",
  };
  return <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${map[value] ?? "bg-muted text-foreground"}`}>{value}</span>;
}

/* ───────── TAB: PAGAMENTOS ───────── */
function Pagamentos({ payments, reload }: { payments: Payment[]; reload: () => void }) {
  const [uploadingId, setUploadingId] = useState<string | null>(null);
  async function uploadProof(p: Payment, file: File) {
    setUploadingId(p.id);
    try { await submitPaymentProof(p.id, file); toast.success("Comprovativo enviado"); reload(); }
    catch (e) { toastError(e, "Erro ao enviar comprovativo"); }
    finally { setUploadingId(null); }
  }
  return (
    <div className="space-y-3">
      {payments.map(p => {
        const busy = uploadingId === p.id;
        return (
          <div key={p.id} className="bg-white rounded-xl border border-border p-4 flex flex-wrap items-center gap-4 justify-between">
            <div>
              <div className="font-bold text-foreground">{p.course}</div>
              <div className="text-xs text-muted-foreground">{p.method} · {formatDate(p.created_at)}</div>
            </div>
            <div className="text-right">
              <div className="font-extrabold text-primary">{formatAOA(Number(p.amount))}</div>
              <StatusBadge value={p.status} />
            </div>
            {p.status === "aguardando" && (
              <label className={`inline-flex items-center gap-2 px-4 h-10 rounded-full border-2 border-primary text-primary font-semibold cursor-pointer hover:bg-primary/5 ${busy ? "opacity-50 pointer-events-none" : ""}`}>
                <Upload size={14} /> {busy ? "A enviar..." : "Enviar comprovativo"}
                <input type="file" accept="image/*,.pdf" hidden disabled={busy} onChange={e => { const f = e.target.files?.[0]; if (f) void uploadProof(p, f); }} />
              </label>
            )}
          </div>
        );
      })}
      {payments.length === 0 && <div className="p-8 text-center text-muted-foreground bg-white rounded-xl border border-border">Sem pagamentos.</div>}
    </div>
  );
}

/* ───────── TAB: COMPROVATIVOS ───────── */
function Comprovativos({ receipts, studentCode }: { receipts: RReceipt[]; studentCode: string }) {
  return (
    <div className="grid md:grid-cols-2 gap-4">
      {receipts.map(r => (
        <div key={r.id} className="bg-white rounded-xl border border-border p-5">
          <div className="text-xs uppercase font-bold text-muted-foreground">{r.kind === "inscricao" ? "Inscrição" : "Pagamento"}</div>
          <div className="font-bold text-primary mt-1">{r.course}</div>
          <div className="text-sm text-muted-foreground">{formatAOA(Number(r.amount))} · {formatDate(r.issued_at)}</div>
          <button onClick={() => downloadReceiptPdf(r, studentCode)} className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline"><Download size={14} /> Baixar PDF</button>
        </div>
      ))}
      {receipts.length === 0 && <div className="md:col-span-2 p-8 text-center text-muted-foreground bg-white rounded-xl border border-border">Sem comprovativos.</div>}
    </div>
  );
}

/* ───────── TAB: CERTIFICADOS ───────── */
function Certificados({ certs, onGoCourses }: { certs: Certificate[]; onGoCourses: () => void }) {
  if (certs.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-border p-10 text-center">
        <GraduationCap className="size-16 mx-auto text-muted-foreground/60" />
        <h3 className="font-bold text-primary mt-3">Ainda sem certificados</h3>
        <p className="text-sm text-muted-foreground mt-1">Os seus certificados aparecerão aqui após concluir um curso.</p>
        <button onClick={onGoCourses} className="mt-4 px-5 h-10 rounded-full bg-primary text-primary-foreground font-bold text-sm">Ver os meus cursos</button>
      </div>
    );
  }
  return (
    <div className="grid md:grid-cols-2 gap-4">
      {certs.map(c => (
        <div key={c.id} className="bg-white rounded-xl border border-border p-5">
          <GraduationCap className="text-gold" />
          <div className="font-bold text-primary mt-2">{c.course}</div>
          <div className="text-xs text-muted-foreground">{c.hours}h · {formatDate(c.issued_at)}</div>
          <button onClick={() => downloadCertificatePdf(c)} className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline"><Download size={14} /> Baixar Certificado</button>
        </div>
      ))}
    </div>
  );
}
