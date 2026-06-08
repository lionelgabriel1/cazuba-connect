import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Check, ExternalLink, Search } from "lucide-react";
import { listAllPayments, confirmPaymentManually, formatDate, formatAOA, type Payment } from "@/lib/cazuba-store";

export const Route = createFileRoute("/admin/pagamentos")({ component: AdminPagamentos });

function AdminPagamentos() {
  const [items, setItems] = useState<Payment[]>([]);
  const [q, setQ] = useState("");
  const [f, setF] = useState<"todos"|"aguardando"|"confirmado">("aguardando");
  const refresh = () => setItems(listAllPayments());
  useEffect(refresh, []);

  const filtered = useMemo(() => items.filter(p =>
    (f === "todos" || p.status === f) &&
    (q === "" || [p.studentEmail, p.id, p.course].join(" ").toLowerCase().includes(q.toLowerCase()))
  ), [items, q, f]);

  function confirm(p: Payment) {
    const note = p.method === "presencial" ? "Pagamento presencial confirmado" : "Pagamento validado pela secretaria";
    confirmPaymentManually(p.id, note); refresh();
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <input value={q} onChange={e => setQ(e.target.value)} placeholder="Procurar pagamento..." className="w-full pl-9 h-10 rounded-lg border border-border bg-white outline-none focus:border-primary" />
        </div>
        <div className="flex gap-1 bg-white rounded-lg border border-border p-1">
          {(["aguardando","confirmado","todos"] as const).map(s => (
            <button key={s} onClick={() => setF(s)} className={`px-3 py-1.5 rounded text-xs font-bold uppercase ${f===s?"bg-primary text-primary-foreground":"text-muted-foreground"}`}>{s}</button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-xl border border-border overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-xs uppercase text-muted-foreground">
            <tr><th className="text-left p-3">Nº</th><th className="text-left p-3">Aluno</th><th className="text-left p-3">Curso</th><th className="text-left p-3">Método</th><th className="text-left p-3">Valor</th><th className="text-left p-3">Data</th><th className="text-left p-3">Comprovativo</th><th className="text-left p-3">Estado</th><th className="text-right p-3">Acção</th></tr>
          </thead>
          <tbody>
            {filtered.map(p => (
              <tr key={p.id} className="border-t border-border">
                <td className="p-3 font-mono text-xs">{p.id}</td>
                <td className="p-3 text-xs">{p.studentEmail}</td>
                <td className="p-3">{p.course}</td>
                <td className="p-3"><span className="px-2 py-0.5 rounded bg-muted text-xs font-semibold capitalize">{p.method}</span></td>
                <td className="p-3 font-bold">{formatAOA(p.amount)}</td>
                <td className="p-3 whitespace-nowrap">{formatDate(p.createdAt)}</td>
                <td className="p-3">
                  {p.proofDataUrl ? (
                    <a href={p.proofDataUrl} target="_blank" rel="noopener" className="inline-flex items-center gap-1 text-primary text-xs font-bold hover:underline"><ExternalLink size={12}/> Ver</a>
                  ) : p.method === "presencial" ? <span className="text-xs text-muted-foreground italic">Presencial</span> : <span className="text-xs text-muted-foreground">—</span>}
                </td>
                <td className="p-3">
                  {p.status === "confirmado"
                    ? <span className="px-2 py-0.5 rounded-full text-xs font-bold uppercase bg-green-100 text-green-800">Pago</span>
                    : <span className="px-2 py-0.5 rounded-full text-xs font-bold uppercase bg-amber-100 text-amber-800">Aguarda</span>}
                </td>
                <td className="p-3 text-right">
                  {p.status === "aguardando" && (
                    <button onClick={() => confirm(p)} className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-green-600 text-white text-xs font-bold hover:bg-green-700"><Check size={12}/> Confirmar</button>
                  )}
                </td>
              </tr>
            ))}
            {filtered.length === 0 && <tr><td colSpan={9} className="p-10 text-center text-muted-foreground">Sem pagamentos.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
