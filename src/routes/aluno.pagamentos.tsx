import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { CreditCard, Upload, CheckCircle2 } from "lucide-react";
import { fileToDataUrl, formatAOA, formatDate, getSession, listPayments, submitPaymentProof, type Payment } from "@/lib/cazuba-store";

export const Route = createFileRoute("/aluno/pagamentos")({ component: Pagamentos });

function Pagamentos() {
  const [items, setItems] = useState<Payment[]>([]);
  const [busy, setBusy] = useState<string | null>(null);
  const refresh = () => { const s = getSession(); if (s) setItems(listPayments(s.email)); };
  useEffect(refresh, []);

  async function upload(p: Payment, f: File | null) {
    if (!f) return;
    setBusy(p.id);
    const dataUrl = await fileToDataUrl(f);
    submitPaymentProof(p.id, { name: f.name, dataUrl });
    setBusy(null); refresh();
  }

  if (items.length === 0) return (
    <div className="bg-white rounded-xl border border-border p-10 text-center text-muted-foreground">Sem pagamentos registados.</div>
  );

  return (
    <div className="space-y-3">
      {items.map(p => (
        <div key={p.id} className="bg-white rounded-xl border border-border shadow-sm p-5">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="size-12 rounded-lg bg-gold/20 text-primary grid place-items-center"><CreditCard/></div>
              <div>
                <div className="font-bold text-primary">{p.course}</div>
                <div className="text-xs text-muted-foreground">Nº {p.id} · {formatDate(p.createdAt)} · Método: {p.method}</div>
                <div className="text-lg font-extrabold text-primary mt-1">{formatAOA(p.amount)}</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {p.status === "confirmado" ? (
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-green-100 text-green-800"><CheckCircle2 size={14}/> Confirmado</span>
              ) : (
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800">Aguarda comprovativo</span>
              )}
            </div>
          </div>
          {p.status === "aguardando" && (
            <div className="mt-4 border-t border-border pt-4">
              <p className="text-xs text-muted-foreground mb-2">Faça a transferência e anexe o comprovativo (PDF/Imagem até 4MB). A inscrição é confirmada automaticamente.</p>
              <label className="inline-flex items-center gap-2 cursor-pointer rounded-full bg-primary text-primary-foreground px-5 py-2 text-sm font-bold hover:bg-[#1565C0]">
                <Upload size={16}/> {busy === p.id ? "A enviar..." : "Anexar Comprovativo"}
                <input type="file" accept=".pdf,image/*" className="hidden" onChange={e => upload(p, e.target.files?.[0] ?? null)} />
              </label>
            </div>
          )}
          {p.proofName && (
            <div className="mt-3 text-xs text-muted-foreground">📎 Comprovativo enviado: <strong>{p.proofName}</strong></div>
          )}
        </div>
      ))}
    </div>
  );
}
