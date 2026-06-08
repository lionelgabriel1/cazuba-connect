import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Download, Receipt } from "lucide-react";
import { listAllReceipts, downloadReceiptPdf, formatDate, formatAOA, type Receipt as R } from "@/lib/cazuba-store";

export const Route = createFileRoute("/admin/comprovativos")({ component: AdminComp });

function AdminComp() {
  const [items, setItems] = useState<R[]>([]);
  useEffect(() => setItems(listAllReceipts()), []);
  if (items.length === 0) return <div className="bg-white rounded-xl border border-border p-10 text-center text-muted-foreground">Sem comprovativos.</div>;
  return (
    <div className="bg-white rounded-xl border border-border overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="bg-muted/50 text-xs uppercase text-muted-foreground">
          <tr><th className="text-left p-3">Nº</th><th className="text-left p-3">Tipo</th><th className="text-left p-3">Aluno</th><th className="text-left p-3">Curso</th><th className="text-left p-3">Valor</th><th className="text-left p-3">Data</th><th className="text-right p-3">Acção</th></tr>
        </thead>
        <tbody>
          {items.map(r => (
            <tr key={r.id} className="border-t border-border">
              <td className="p-3 font-mono text-xs">{r.id}</td>
              <td className="p-3"><span className={`px-2 py-0.5 rounded text-xs font-bold uppercase ${r.kind==="pagamento"?"bg-green-100 text-green-800":"bg-blue-100 text-blue-800"}`}>{r.kind}</span></td>
              <td className="p-3"><div className="font-semibold">{r.fullName}</div><div className="text-xs text-muted-foreground">{r.studentEmail}</div></td>
              <td className="p-3">{r.course}</td>
              <td className="p-3 font-bold">{formatAOA(r.amount)}</td>
              <td className="p-3 whitespace-nowrap">{formatDate(r.issuedAt)}</td>
              <td className="p-3 text-right">
                <button onClick={() => downloadReceiptPdf(r)} className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-primary text-primary-foreground text-xs font-bold hover:bg-[#1565C0]"><Download size={12}/> Reenviar PDF</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
