import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Eye, EyeOff, Copy, CheckCircle2, Download } from "lucide-react";
import { PageShell } from "@/components/cazuba/Shell";
import { tenant } from "@/config/tenant";
import { COURSES, createEnrollment, downloadReceiptPdf, formatAOA, type Receipt } from "@/lib/supabase";

export const Route = createFileRoute("/inscricao")({
  head: () => ({ meta: [{ title: `Inscrição — ${tenant.name}` }] }),
  component: Inscricao,
});

function Inscricao() {
  const nav = useNavigate();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    fullName: "", phone: "", birthDate: "", address: "",
    course: COURSES[0].name,
    paymentMethod: "presencial" as "transferencia" | "referencia" | "presencial",
    password: "", password2: "",
  });
  const [file, setFile] = useState<File | undefined>();
  const [showPwd, setShowPwd] = useState(false);
  const [showPwd2, setShowPwd2] = useState(false);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState<{ studentCode: string; receipt: Receipt } | null>(null);

  function up<K extends keyof typeof form>(k: K, v: (typeof form)[K]) {
    setForm(f => ({ ...f, [k]: v }));
  }

  async function submit() {
    if (form.password.length < 6) return toast.error("Password deve ter pelo menos 6 caracteres");
    if (form.password !== form.password2) return toast.error("As passwords não coincidem");
    setLoading(true);
    try {
      const { receipt, studentCode } = await createEnrollment({
        fullName: form.fullName, phone: form.phone, birthDate: form.birthDate,
        address: form.address, course: form.course, paymentMethod: form.paymentMethod,
        password: form.password, documentFile: file,
      });
      setDone({ studentCode, receipt });
      toast.success("Inscrição registada com sucesso!");
    } catch (e: any) {
      toast.error(e.message ?? "Erro ao registar inscrição");
    } finally { setLoading(false); }
  }

  if (done) {
    return (
      <PageShell title="Inscrição Confirmada" subtitle="Guarde o seu código de aluno — vai precisar dele para entrar na Área do Aluno.">
        <div className="max-w-xl mx-auto bg-white rounded-2xl border border-border shadow-md p-8 text-center">
          <CheckCircle2 className="size-16 mx-auto text-emerald-500" />
          <h2 className="font-display text-2xl font-bold text-primary mt-4">Bem-vindo, {form.fullName.split(" ")[0]}!</h2>
          <p className="text-sm text-muted-foreground mt-2">O seu código de aluno foi gerado:</p>
          <div className="mt-4 p-5 rounded-xl bg-primary/5 border-2 border-primary/20">
            <div className="font-mono text-3xl font-extrabold text-primary tracking-wider">{done.studentCode}</div>
            <button onClick={() => { navigator.clipboard.writeText(done.studentCode); toast.success("Copiado!"); }} className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline">
              <Copy size={14} /> Copiar código
            </button>
          </div>
          <p className="text-xs text-muted-foreground mt-4">Use este código + a sua password para entrar na Área do Aluno.</p>
          <div className="mt-6 flex flex-col gap-3">
            <button onClick={() => downloadReceiptPdf(done.receipt, done.studentCode)} className="h-11 rounded-full bg-primary text-primary-foreground font-bold inline-flex items-center justify-center gap-2 hover:bg-[#1565C0]">
              <Download size={16} /> Baixar Comprovativo (PDF)
            </button>
            <button onClick={() => nav({ to: "/aluno" })} className="h-11 rounded-full border-2 border-primary text-primary font-bold hover:bg-primary/5">
              Entrar na Área do Aluno
            </button>
          </div>
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell title="Inscrição Online" subtitle={`Passo ${step} de 3`}>
      <div className="max-w-2xl mx-auto bg-white rounded-2xl border border-border shadow-md p-8">
        {/* Stepper */}
        <div className="flex items-center gap-2 mb-8">
          {[1, 2, 3].map(n => (
            <div key={n} className="flex-1 flex items-center gap-2">
              <div className={`size-8 rounded-full grid place-items-center text-sm font-bold ${step >= n ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>{n}</div>
              {n < 3 && <div className={`flex-1 h-1 rounded ${step > n ? "bg-primary" : "bg-muted"}`} />}
            </div>
          ))}
        </div>

        {step === 1 && (
          <div className="space-y-4">
            <h3 className="font-bold text-primary text-lg">Dados Pessoais</h3>
            <Field label="Nome Completo"><input required value={form.fullName} onChange={e => up("fullName", e.target.value)} className={inputCls} /></Field>
            <Field label="Telefone"><input required value={form.phone} onChange={e => up("phone", e.target.value)} className={inputCls} /></Field>
            <Field label="Data de Nascimento"><input required type="date" value={form.birthDate} onChange={e => up("birthDate", e.target.value)} className={inputCls} /></Field>
            <Field label="Endereço"><input required value={form.address} onChange={e => up("address", e.target.value)} className={inputCls} /></Field>
            <button disabled={!form.fullName || !form.phone} onClick={() => setStep(2)} className="w-full h-11 rounded-full bg-primary text-primary-foreground font-bold disabled:opacity-50">Próximo</button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <h3 className="font-bold text-primary text-lg">Acesso à Área do Aluno</h3>
            <p className="text-sm text-muted-foreground">Defina uma password para aceder mais tarde à sua área pessoal.</p>
            <Field label="Password (mín. 6 caracteres)">
              <div className="relative">
                <input required type={showPwd ? "text" : "password"} value={form.password} onChange={e => up("password", e.target.value)} className={inputCls + " pr-10"} />
                <button type="button" onClick={() => setShowPwd(s => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">{showPwd ? <EyeOff size={18} /> : <Eye size={18} />}</button>
              </div>
            </Field>
            <Field label="Confirmar Password">
              <div className="relative">
                <input required type={showPwd2 ? "text" : "password"} value={form.password2} onChange={e => up("password2", e.target.value)} className={inputCls + " pr-10"} />
                <button type="button" onClick={() => setShowPwd2(s => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">{showPwd2 ? <EyeOff size={18} /> : <Eye size={18} />}</button>
              </div>
            </Field>
            <div className="flex gap-2">
              <button onClick={() => setStep(1)} className="flex-1 h-11 rounded-full border-2 border-primary text-primary font-bold">Voltar</button>
              <button disabled={form.password.length < 6 || form.password !== form.password2} onClick={() => setStep(3)} className="flex-1 h-11 rounded-full bg-primary text-primary-foreground font-bold disabled:opacity-50">Próximo</button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <h3 className="font-bold text-primary text-lg">Curso e Pagamento</h3>
            <Field label="Curso Pretendido">
              <select value={form.course} onChange={e => up("course", e.target.value)} className={inputCls}>
                {COURSES.map(c => <option key={c.name} value={c.name}>{c.name} — {formatAOA(c.price)}</option>)}
              </select>
            </Field>
            <Field label="Método de Pagamento">
              <select value={form.paymentMethod} onChange={e => up("paymentMethod", e.target.value as any)} className={inputCls}>
                <option value="presencial">Pagamento Presencial</option>
                <option value="transferencia">Transferência Bancária</option>
                <option value="referencia">Referência Multicaixa</option>
              </select>
            </Field>
            <Field label="Documento de Identificação (opcional)">
              <input type="file" accept="image/*,.pdf" onChange={e => setFile(e.target.files?.[0])} className={inputCls} />
            </Field>
            <div className="flex gap-2">
              <button onClick={() => setStep(2)} className="flex-1 h-11 rounded-full border-2 border-primary text-primary font-bold">Voltar</button>
              <button disabled={loading} onClick={submit} className="flex-1 h-11 rounded-full bg-primary text-primary-foreground font-bold disabled:opacity-50">{loading ? "A registar..." : "Finalizar Inscrição"}</button>
            </div>
          </div>
        )}

        <p className="text-center text-xs text-muted-foreground mt-6">Já tem conta? <Link to="/aluno" className="text-primary font-semibold hover:underline">Entrar na Área do Aluno</Link></p>
      </div>
    </PageShell>
  );
}

const inputCls = "w-full h-11 px-4 rounded-lg border border-border outline-none focus:border-primary";
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="block"><span className="text-xs font-bold uppercase text-muted-foreground">{label}</span><div className="mt-1">{children}</div></label>;
}
