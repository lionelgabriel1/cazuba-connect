import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { CheckCircle2, Upload, FileText, Loader2 } from "lucide-react";
import { PageShell } from "@/components/cazuba/Shell";
import { COURSES, createEnrollment, downloadReceiptPdf, fileToDataUrl, formatAOA, listReceipts } from "@/lib/cazuba-store";

export const Route = createFileRoute("/inscricao")({
  head: () => ({
    meta: [
      { title: "Inscrição Online — Cazuba Centro de Treinamento" },
      { name: "description", content: "Faça a sua inscrição online no Cazuba Centro de Treinamento e receba o comprovativo automaticamente." },
      { property: "og:title", content: "Inscrição Online — Cazuba" },
      { property: "og:description", content: "Inscreva-se em minutos e receba comprovativo com QR Code de validação." },
    ],
  }),
  component: InscricaoPage,
});

function InscricaoPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [docMeta, setDocMeta] = useState<{ name: string; dataUrl: string } | null>(null);
  const [createdId, setCreatedId] = useState<string | null>(null);

  const [form, setForm] = useState<{
    fullName: string; studentEmail: string; phone: string; birthDate: string; address: string;
    course: string; paymentMethod: "transferencia" | "referencia" | "presencial";
  }>({
    fullName: "", studentEmail: "", phone: "", birthDate: "", address: "",
    course: COURSES[0].name, paymentMethod: "transferencia",
  });
  const update = <K extends keyof typeof form>(k: K, v: (typeof form)[K]) => setForm(f => ({ ...f, [k]: v }));

  async function handleFile(f: File | null) {
    if (!f) return setDocMeta(null);
    if (f.size > 4 * 1024 * 1024) { setError("Documento até 4MB."); return; }
    const dataUrl = await fileToDataUrl(f);
    setDocMeta({ name: f.name, dataUrl }); setError("");
  }

  async function submit() {
    setError("");
    if (!form.fullName.trim() || !form.studentEmail.includes("@") || !form.phone || !form.birthDate || !form.address) {
      setError("Preencha todos os dados pessoais."); setStep(1); return;
    }
    setSubmitting(true);
    try {
      const e = createEnrollment({
        ...form,
        documentName: docMeta?.name,
        documentDataUrl: docMeta?.dataUrl,
      });
      setCreatedId(e.id);
      const receipt = listReceipts(e.studentEmail).find(r => r.enrollmentId === e.id && r.kind === "inscricao");
      if (receipt) await downloadReceiptPdf(receipt);
      setStep(3);
    } catch (err) {
      setError("Não foi possível registar a inscrição.");
    } finally {
      setSubmitting(false);
    }
  }

  const selectedCourse = COURSES.find(c => c.name === form.course)!;

  return (
    <PageShell title="Inscrição Online" subtitle="Preencha os dados, envie os seus documentos e receba imediatamente o comprovativo em PDF com QR Code de validação.">
      <Stepper step={step} />

      {step === 3 && createdId ? (
        <SuccessCard enrollmentId={createdId} onArea={() => navigate({ to: "/aluno" })} />
      ) : (
        <div className="grid lg:grid-cols-[1fr_360px] gap-6 mt-8">
          <div className="bg-white rounded-2xl border border-border shadow-sm p-6 md:p-8">
            {step === 1 && (
              <div className="space-y-4">
                <h2 className="font-display text-xl font-bold text-primary">1. Dados Pessoais</h2>
                <Field label="Nome Completo *"><input className="input" value={form.fullName} onChange={e => update("fullName", e.target.value)} /></Field>
                <div className="grid md:grid-cols-2 gap-4">
                  <Field label="E-mail *"><input type="email" className="input" value={form.studentEmail} onChange={e => update("studentEmail", e.target.value)} /></Field>
                  <Field label="Telefone *"><input className="input" value={form.phone} onChange={e => update("phone", e.target.value)} placeholder="9XX XXX XXX" /></Field>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <Field label="Data de Nascimento *"><input type="date" className="input" value={form.birthDate} onChange={e => update("birthDate", e.target.value)} /></Field>
                  <Field label="Curso Pretendido *">
                    <select className="input" value={form.course} onChange={e => update("course", e.target.value)}>
                      {COURSES.map(c => <option key={c.name} value={c.name}>{c.name} — {formatAOA(c.price)}</option>)}
                    </select>
                  </Field>
                </div>
                <Field label="Morada *"><input className="input" value={form.address} onChange={e => update("address", e.target.value)} /></Field>
                <div className="flex justify-end pt-2">
                  <button onClick={() => setStep(2)} className="btn-primary">Continuar</button>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-4">
                <h2 className="font-display text-xl font-bold text-primary">2. Documentos e Pagamento</h2>
                <p className="text-sm text-muted-foreground">Envie o seu BI ou cédula pessoal digitalizada (PDF, JPG ou PNG até 4MB).</p>
                <label className="block border-2 border-dashed border-primary/30 rounded-xl p-6 text-center cursor-pointer hover:bg-primary/5 transition">
                  <input type="file" accept=".pdf,image/*" className="hidden" onChange={e => handleFile(e.target.files?.[0] ?? null)} />
                  {docMeta ? (
                    <div className="flex items-center justify-center gap-3 text-primary font-semibold"><FileText /> {docMeta.name}</div>
                  ) : (
                    <div className="flex flex-col items-center gap-2 text-muted-foreground"><Upload /> <span>Clique para anexar documento</span></div>
                  )}
                </label>

                <h3 className="font-bold text-primary pt-2">Forma de Pagamento</h3>
                <div className="grid md:grid-cols-3 gap-3">
                  {([
                    { v: "transferencia", l: "Transferência Bancária" },
                    { v: "referencia", l: "Referência Multicaixa" },
                    { v: "presencial", l: "Pagamento Presencial" },
                  ] as const).map(o => (
                    <button key={o.v} type="button" onClick={() => update("paymentMethod", o.v)}
                      className={`p-3 rounded-xl border-2 text-sm font-semibold transition ${form.paymentMethod === o.v ? "border-primary bg-primary/5 text-primary" : "border-border text-foreground/70 hover:border-primary/40"}`}>
                      {o.l}
                    </button>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground bg-[#F5F5F5] rounded-lg p-3">
                  Após a inscrição, faça o pagamento e anexe o comprovativo na sua Área do Aluno → Pagamentos. A inscrição é confirmada automaticamente após o envio. <span className="text-primary font-semibold">(Integração com gateway de pagamento pode ser ligada futuramente.)</span>
                </p>

                {error && <div className="text-sm text-destructive">{error}</div>}

                <div className="flex justify-between pt-2">
                  <button onClick={() => setStep(1)} className="btn-ghost">Voltar</button>
                  <button onClick={submit} disabled={submitting} className="btn-primary inline-flex items-center gap-2">
                    {submitting && <Loader2 className="animate-spin size-4" />} Finalizar Inscrição
                  </button>
                </div>
              </div>
            )}
          </div>

          <aside className="bg-white rounded-2xl border border-border shadow-sm p-6 h-fit">
            <h3 className="font-display font-bold text-primary mb-3">Resumo</h3>
            <dl className="space-y-2 text-sm">
              <Row k="Curso" v={selectedCourse.name} />
              <Row k="Carga Horária" v={`${selectedCourse.hours}h`} />
              <Row k="Aluno" v={form.fullName || "—"} />
              <Row k="E-mail" v={form.studentEmail || "—"} />
              <div className="border-t border-border my-3" />
              <Row k="Total" v={<strong className="text-primary text-base">{formatAOA(selectedCourse.price)}</strong>} />
            </dl>
            <div className="mt-4 text-xs text-muted-foreground">
              Comprovativo PDF + QR Code de validação são gerados automaticamente.
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
  return <label className="block"><span className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">{label}</span>{children}</label>;
}
function Row({ k, v }: { k: string; v: React.ReactNode }) {
  return <div className="flex justify-between gap-3"><dt className="text-muted-foreground">{k}</dt><dd className="font-semibold text-right">{v}</dd></div>;
}

function Stepper({ step }: { step: 1 | 2 | 3 }) {
  const items = ["Dados Pessoais", "Documentos & Pagamento", "Confirmação"];
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

function SuccessCard({ enrollmentId, onArea }: { enrollmentId: string; onArea: () => void }) {
  return (
    <div className="mt-8 bg-white rounded-2xl border-2 border-green-500/30 shadow-md p-8 text-center max-w-2xl mx-auto">
      <div className="mx-auto size-16 rounded-full bg-green-500/10 grid place-items-center text-green-600 mb-4"><CheckCircle2 size={36} /></div>
      <h2 className="font-display text-2xl font-extrabold text-primary">Inscrição registada com sucesso!</h2>
      <p className="text-muted-foreground mt-2">O seu comprovativo em PDF foi descarregado automaticamente. Também está disponível na sua Área do Aluno.</p>
      <p className="mt-3 text-sm">Nº da Inscrição: <strong className="text-primary">{enrollmentId}</strong></p>
      <div className="mt-6 flex justify-center gap-3 flex-wrap">
        <button onClick={onArea} className="btn-primary">Ir para Área do Aluno</button>
      </div>
      <style>{`.btn-primary { background:#0D47A1;color:white;padding:12px 26px;border-radius:999px;font-weight:700;font-size:14px;cursor:pointer;} .btn-primary:hover{background:#1565C0;}`}</style>
    </div>
  );
}
