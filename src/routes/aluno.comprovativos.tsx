import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Receipt, Download, QrCode } from "lucide-react";
import { downloadReceiptPdf, formatAOA, formatDate, getSession, listReceipts, type Receipt as R } from "@/lib/cazuba-store";

export const Route = createFileRoute("/aluno/comprovativos")({ component: Comprovativos });

function Comprovativos() {
  const [items, setItems] = useState<R[]>([]);
  useEffect(() => { const s = getSession(); if (s) setItems(listReceipts(s.email)); }, []);

  if (items.length === 0) return <div className="bg-white rounded-xl border border-border p-10 text-center text-muted-foreground">Sem comprovativos emitidos.</div>;

  return (
    <div className="grid md:grid-cols-2 gap-4">
      {items.map(r => (
        <div key={r.id} className="bg-white rounded-xl border border-border shadow-sm p-5">
          <div className="flex items-start gap-3">
            <div className="size-11 rounded-lg bg-primary/10 text-primary grid place-items-center"><Receipt/></div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{r.kind === "inscricao" ? "Inscrição" : "Pagamento"}</span>
                <span className="text-xs text-muted-foreground">{formatDate(r.issuedAt)}</span>
              </div>
              <div className="font-bold text-primary mt-1">{r.course}</div>
              <div className="text-sm text-muted-foreground">{formatAOA(r.amount)} · Nº {r.id}</div>
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <button onClick={() => downloadReceiptPdf(r)} className="flex-1 inline-flex items-center justify-center gap-2 rounded-full bg-primary text-primary-foreground py-2 font-bold text-sm hover:bg-[#1565C0]">
              <Download size={14}/> Descarregar PDF
            </button>
            <Link to="/validar/$id" params={{ id: `comprovativo-${r.id}` }} className="inline-flex items-center gap-2 rounded-full border border-primary text-primary px-3 py-2 font-bold text-sm hover:bg-primary/5">
              <QrCode size={14}/> Validar
            </Link>
          </div>
        </div>
      ))}
    </div>
  );
}
