import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Award, Search, RotateCw } from "lucide-react";
import {
  listAllEnrollments, formatDate, formatAOA, COURSES,
  issueDemoCertificate, reissueEnrollmentReceipt, downloadReceiptPdf,
  type Enrollment,
} from "@/lib/cazuba-store";

export const Route = createFileRoute("/admin/inscricoes")({ component: AdminInscricoes });

function AdminInscricoes() {
  const [items, setItems] = useState<Enrollment[]>([]);
  const [q, setQ] = useState("");
  const [f, setF] = useState<"todos" | "pendente" | "confirmada" | "concluida">("todos");
  const refresh = () => setItems(listAllEnrollments());
  useEffect(refresh, []);

  const filtered = useMemo(() => items.filter(e =>
    (f === "todos" || e.status === f) &&
    (q === "" || [e.fullName, e.studentEmail, e.id, e.course].join(" ").toLowerCase().includes(q.toLowerCase()))
  ), [items, q, f]);

  async function emitirCert(e: Enrollment) {
    const c = issueDemoCertificate(e.id);
    if (c) { const { downloadCertificatePdf } = await import("@/lib/cazuba-store"); await downloadCertificatePdf(c); refresh(); }
  }
  async function reenviarComp(e: Enrollment) {
    const r = reissueEnrollmentReceipt(e.id); if (r) await downloadReceiptPdf(r);
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <input value={q} onChange={e => setQ(e.target.value)} placeholder="Procurar por nome, e-mail, curso ou nº..." className="w-full pl-9 h-10 rounded-lg border border-border bg-white outline-none focus:border-primary" />
        </div>
        <div className="flex gap-1 bg-white rounded-lg border border-border p-1">
          {(["todos","pendente","confirmada","concluida"] as const).map(s => (
            <button key={s} onClick={() => setF(s)} className={`px-3 py-1.5 rounded text-xs font-bold uppercase ${f===s?"bg-primary text-primary-foreground":"text-muted-foreground"}`}>{s}</button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-xl border border-border overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-xs uppercase text-muted-foreground">
            <tr><th className="text-left p-3">Nº</th><th className="text-left p-3">Aluno</th><th className="text-left p-3">Curso</th><th className="text-left p-3">Valor</th><th className="text-left p-3">Data</th><th className="text-left p-3">Estado</th><th className="text-right p-3">Acções</th></tr>
          </thead>
          <tbody>
            {filtered.map(e => {
              const course = COURSES.find(c => c.name === e.course);
              return (
                <tr key={e.id} className="border-t border-border">
                  <td className="p-3 font-mono text-xs">{e.id}</td>
                  <td className="p-3"><div className="font-semibold text-primary">{e.fullName}</div><div className="text-xs text-muted-foreground">{e.studentEmail} · {e.phone}</div></td>
                  <td className="p-3">{e.course}</td>
                  <td className="p-3 font-semibold">{formatAOA(course?.price ?? 0)}</td>
                  <td className="p-3 whitespace-nowrap">{formatDate(e.createdAt)}</td>
                  <td className="p-3"><StatusBadge s={e.status} /></td>
                  <td className="p-3">
                    <div className="flex gap-1.5 justify-end flex-wrap">
                      <button onClick={() => reenviarComp(e)} className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-primary/10 text-primary text-xs font-bold hover:bg-primary/20"><RotateCw size={12}/> Comprovativo</button>
                      <button onClick={() => emitirCert(e)} className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-gold/20 text-primary text-xs font-bold hover:bg-gold/30"><Award size={12}/> Certificado</button>
                    </div>
                  </td>
                </tr>
              );
            })}
            {filtered.length === 0 && <tr><td colSpan={7} className="p-10 text-center text-muted-foreground">Sem inscrições.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function StatusBadge({ s }: { s: Enrollment["status"] }) {
  const map = { pendente: "bg-amber-100 text-amber-800", confirmada: "bg-green-100 text-green-800", concluida: "bg-blue-100 text-blue-800" } as const;
  return <span className={`px-2 py-0.5 rounded-full text-xs font-bold uppercase ${map[s]}`}>{s}</span>;
}
