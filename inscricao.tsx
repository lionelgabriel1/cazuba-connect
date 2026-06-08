// src/routes/inscricao.tsx
// Substitui o ficheiro original inteiramente.

import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { CheckCircle2, Upload, FileText, Loader2, Eye, EyeOff } from "lucide-react";
import { PageShell } from "@/components/cazuba/Shell";
import {
  COURSES,
  createEnrollment,
  downloadReceiptPdf,
  formatAOA,
} from "@/lib/supabase";

export const Route = createFileRoute("/inscricao")({
  head: () => ({
    meta: [
      { title: "Inscrição Online — Cazuba Centro de Treinamento" },
      { name: "description", content: "Faça a sua inscrição online no Cazuba Centro de Treinamento e receba o comprovativo automaticamente." },
    ],
  }),
  component: InscricaoPage,
});

type FormState = {
  fullName: string;
  phone: string;
  birthDate: string;
  address: string;
  course: string;
  paymentMethod: "transferencia" | "referencia" | "presencial";
  password: string;
  confirmPassword: string;
};

function InscricaoPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [docFile, setDocFile] = useState<File | null>(null);
  const [showPass, setShowPass] = useState(false);
  const [result, setResult] = useState<{ studentCode: string; enrollmentId: string } | null>(null);

  const [form, setForm] = useState<FormState>({
    fullName: "", phone: "", birthDate: "", address: "",
    course: COURSES[0].name, paymentMethod: "transferencia",
    password: "", confirmPassword: "",
  });

  const update = <K extends keyof FormState>(k: K, v: FormState[K]) =>
    setForm(f => ({ ...f, [k]: v }));

  function handleFile(f: File | null) {
    if (!f) return setDocFile(null);
    if (f.size > 4 * 1024 * 1024) { setError("Documento até 4MB."); return; }
    setDocFile(f); setError("");
  }

  function validateStep1() {
    if (!form.fullName.trim()) return "Preencha o nome completo.";
    if (!form.phone) return "Preencha o telefone.";
    if (!form.birthDate) return "Preencha a data de nascimento.";
    if (!form.address.trim()) return "Preencha a morada.";
    return null;
  }

  function validateStep2() {
    if (!form.password || form.password.length < 6)
      return "A password deve ter pelo menos 6 caracteres.";
    if (form.password !== form.confirmPassword)
      return "As passwords não coincidem.";
    return null;
  }

  function goToStep2() {
    const err = validateStep1();
    if (err) { setError(err); return; }
    setError(""); setStep(2);
  }

  async function submit() {
    const err = validateStep2();
    if (err) { setError(err); return; }
    setError(""); setSubmitting(true);

    try {
      const { enrollment, receipt, studentCode } = await createEnrollment({
        fullName: form.fullName,
        phone: form.phone,
        birthDate: form.birthDate,
        address: form.address,
        course: form.course,
        paymentMethod: form.paymentMethod,
        password: form.password,
        documentFile: docFile ?? undefined,
      });

      // Download automático do PDF com o código de acesso
      await downloadReceiptPdf(receipt, studentCode);

      setResult({ studentCode, enrollmentId: enrollment.id });
      setStep(3);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Erro desconhecido.";
      setError(msg.includes("already registered")
        ? "Já existe uma conta com este e-mail. Tente fazer login."
        : "Não foi possível registar a inscrição. Tente novamente.");
    } finally {
      setSubmitting(false);
    }
  }

  const selectedCourse = COURSES.find(c => c.name === form.course)!;

  return (
    <PageShell
      title="Inscrição Online"
      subtitle="Preencha os dados, crie a sua password e receba imediatamente o comprovativo em PDF com o seu código de acesso e QR Code de validação."
    >
      <Stepper step={step} />

      {step === 3 && result ? (
        <SuccessCard
          studentCode={result.studentCode}
          enrollmentId={result.enrollmentId}
          onArea={() => navigate({ to: "/aluno" })}
        />
      ) : (
        <div className="grid lg:grid-cols-[1fr_360px] gap-6 mt-8">
          <div className="bg-white rounded-2xl border border-border shadow-sm p-6 md:p-8">

            {/* ── STEP 1: Dados pessoais ── */}
            {step === 1 && (
              <div className="space-y-4">
                <h2 className="font-display text-xl font-bold text-primary">1. Dados Pessoais</h2>

                <Field label="Nome Completo *">
                  <input className="input" value={form.fullName} onChange={e => update("fullName", e.target.value)} />
                </Field>

                <div className="grid md:grid-cols-2 gap-4">
                  <Field label="Telefone *">
                    <input className="input" value={form.phone} onChange={e => update("phone", e.target.value)} placeholder="9XX XXX XXX" />
                  </Field>
                  <Field label="Data de Nascimento *">
                    <input type="date" className="input" value={form.birthDate} onChange={e => update("birthDate", e.target.value)} />
                  </Field>
                </div>

                <Field label="Curso Pretendido *">
                  <select className="input" value={form.course} onChange={e => update("course", e.target.value)}>
                    {COURSES.map(c => (
                      <option key={c.name} value={c.name}>{c.name} — {formatAOA(c.price)}</option>
                    ))}
                  </select>
                </Field>

                <Field label="Morada *">
                  <input className="input" value={form.address} onChange={e => update("address", e.target.value)} />
                </Field>

                {error && <p className="text-sm text-destructive">{error}</p>}

                <div className="flex justify-end pt-2">
                  <button onClick={goToStep2} className="btn-primary">Continuar</button>
                </div>
              </div>
            )}

            {/* ── STEP 2: Documentos, pagamento e password ── */}
            {step === 2 && (
              <div className="space-y-5">
                <h2 className="font-display text-xl font-bold text-primary">2. Documentos, Pagamento e Acesso</h2>

                {/* Documento */}
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">
                    Documento de Identificação (BI / Cédula) — opcional até 4MB
                  </p>
                  <label className="block border-2 border-dashed border-primary/30 rounded-xl p-5 text-center cursor-pointer hover:bg-primary/5 transition">
                    <input type="file" accept=".pdf,image/*" className="hidden" onChange={e => handleFile(e.target.files?.[0] ?? null)} />
                    {docFile ? (
                      <div className="flex items-center justify-center gap-3 text-primary font-semibold">
                        <FileText size={18} /> {docFile.name}
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-1.5 text-muted-foreground">
                        <Upload size={22} />
                        <span className="text-sm">Clique para anexar documento</span>
                      </div>
                    )}
                  </label>
                </div>

                {/* Forma de pagamento */}
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">Forma de Pagamento</p>
                  <div className="grid md:grid-cols-3 gap-3">
                    {([
                      { v: "transferencia", l: "Transferência Bancária" },
                      { v: "referencia",    l: "Referência Multicaixa" },
                      { v: "presencial",    l: "Pagamento Presencial" },
                    ] as const).map(o => (
                      <button key={o.v} type="button" onClick={() => update("paymentMethod", o.v)}
                        className={`p-3 rounded-xl border-2 text-sm font-semibold transition ${form.paymentMethod === o.v ? "border-primary bg-primary/5 text-primary" : "border-border text-foreground/70 hover:border-primary/40"}`}>
                        {o.l}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Password — NOVO */}
                <div className="rounded-xl border-2 border-gold/40 bg-yellow-50/50 p-5 space-y-4">
                  <div>
                    <p className="font-bold text-primary text-sm">Crie a sua Password de Acesso</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Será usada em conjunto com o seu <strong>Código de Aluno</strong> (presente no comprovativo) para entrar na Área do Aluno.
                    </p>
                  </div>

                  <Field label="Password *">
                    <div className="relative">
                      <input
                        type={showPass ? "text" : "password"}
                        className="input pr-10"
                        placeholder="Mínimo 6 caracteres"
                        value={form.password}
                        onChange={e => update("password", e.target.value)}
                      />
                      <button type="button" onClick={() => setShowPass(s => !s)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary">
                        {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </Field>

                  <Field label="Confirmar Password *">
                    <input
                      type={showPass ? "text" : "password"}
                      className="input"
                      placeholder="Repita a password"
                      value={form.confirmPassword}
                      onChange={e => update("confirmPassword", e.target.value)}
                    />
                  </Field>

                  <p className="text-[11px] text-amber-700 bg-amber-100 rounded-lg px-3 py-2">
                    ⚠️ Guarde bem a sua password. Não a partilhe com ninguém. O Cazuba nunca a pedirá por telefone ou WhatsApp.
                  </p>
                </div>

                {error && <p className="text-sm text-destructive">{error}</p>}

                <div className="flex justify-between pt-2">
                  <button onClick={() => { setStep(1); setError(""); }} className="btn-ghost">Voltar</button>
                  <button onClick={submit} disabled={submitting} className="btn-primary inline-flex items-center gap-2">
                    {submitting && <Loader2 className="animate-spin size-4" />}
                    Finalizar Inscrição
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Resumo lateral */}
          <aside className="bg-white rounded-2xl border border-border shadow-sm p-6 h-fit">
            <h3 className="font-display font-bold text-primary mb-3">Resumo</h3>
            <dl className="space-y-2 text-sm">
              <Row k="Curso" v={selectedCourse.name} />
              <Row k="Carga Horária" v={`${selectedCourse.hours}h`} />
              <Row k="Aluno" v={form.fullName || "—"} />
              <div className="border-t border-border my-3" />
              <Row k="Total" v={<strong className="text-primary text-base">{formatAOA(selectedCourse.price)}</strong>} />
            </dl>
            <div className="mt-4 text-xs text-muted-foreground space-y-1">
              <p>✓ Comprovativo PDF gerado automaticamente</p>
              <p>✓ Código de aluno incluído no PDF</p>
              <p>✓ QR Code de validação online</p>
            </div>
          </aside>
        </div>
      )}

      <style>{`
        .input { width: 100%; height: 42px; border: 1px solid hsl(var(--border)); border-radius: 10px; padding: 0 14px; background: white; font-size: 14px; outline: none; transition: border-color .2s; }
        .input:focus { border-color: #0D47A1; box-shadow: 0 0 0 3px rgba(13,71,161,.15); }
        .btn-primary { background: #0D47A1; color: white; padding: 12px 26px; border-radius: 999px; font-weight: 700; font-size: 14px; cursor: pointer; }
        .btn-primary:disabled { opacity: .6; cursor: not-allowed; }
        .btn-primary:hover:not(:disabled) { background: #1565C0; }
        .btn-ghost { padding: 12px 22px; border-radius: 999px; font-weight: 700; font-size: 14px; color: #0D47A1; border: 1px solid hsl(var(--border)); background: white; cursor: pointer; }
      `}</style>
    </PageShell>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">{label}</span>
      {children}
    </label>
  );
}

function Row({ k, v }: { k: string; v: React.ReactNode }) {
  return (
    <div className="flex justify-between gap-3">
      <dt className="text-muted-foreground">{k}</dt>
      <dd className="font-semibold text-right">{v}</dd>
    </div>
  );
}

function Stepper({ step }: { step: 1 | 2 | 3 }) {
  const items = ["Dados Pessoais", "Documentos & Acesso", "Confirmação"];
  return (
    <ol className="flex items-center gap-3 text-sm flex-wrap">
      {items.map((l, i) => {
        const n = i + 1; const active = n <= step;
        return (
          <li key={l} className="flex items-center gap-3">
            <span className={`size-8 grid place-items-center rounded-full font-bold text-sm ${active ? "bg-primary text-primary-foreground" : "bg-white border border-border text-muted-foreground"}`}>{n}</span>
            <span className={`font-semibold ${active ? "text-primary" : "text-muted-foreground"}`}>{l}</span>
            {i < items.length - 1 && <span className="w-8 h-px bg-border" />}
          </li>
        );
      })}
    </ol>
  );
}

function SuccessCard({ studentCode, enrollmentId, onArea }: {
  studentCode: string;
  enrollmentId: string;
  onArea: () => void;
}) {
  return (
    <div className="mt-8 bg-white rounded-2xl border-2 border-green-500/30 shadow-md p-8 text-center max-w-2xl mx-auto">
      <div className="mx-auto size-16 rounded-full bg-green-500/10 grid place-items-center text-green-600 mb-4">
        <CheckCircle2 size={36} />
      </div>
      <h2 className="font-display text-2xl font-extrabold text-primary">Inscrição registada com sucesso!</h2>
      <p className="text-muted-foreground mt-2">
        O comprovativo PDF foi descarregado automaticamente — <strong>guarde-o</strong>, contém o seu código de acesso.
      </p>

      {/* Destaque do código */}
      <div className="mt-6 inline-block bg-primary/5 border-2 border-primary/20 rounded-2xl px-8 py-4">
        <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-1">O seu Código de Aluno</p>
        <p className="font-display text-3xl font-extrabold text-primary tracking-widest">{studentCode}</p>
        <p className="text-xs text-muted-foreground mt-1">Use este código + a sua password para entrar</p>
      </div>

      <p className="mt-4 text-sm">Nº da Inscrição: <strong className="text-primary">{enrollmentId}</strong></p>

      <div className="mt-6 flex justify-center gap-3 flex-wrap">
        <button onClick={onArea} className="btn-primary">Ir para Área do Aluno</button>
      </div>
      <style>{`.btn-primary{background:#0D47A1;color:white;padding:12px 26px;border-radius:999px;font-weight:700;font-size:14px;cursor:pointer;}.btn-primary:hover{background:#1565C0;}`}</style>
    </div>
  );
    }
