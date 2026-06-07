import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { FileText, Sparkles } from "lucide-react";
import { getSession, listEnrollments, issueDemoCertificate, formatDate, type Enrollment } from "@/lib/cazuba-store";

export const Route = createFileRoute("/aluno/inscricoes")({ component: Inscricoes });

function Inscricoes() {
  const [items, setItems] = useState<Enrollment[]>([]);
  const refresh = () => { const s = getSession(); if (s) setItems(listEnrollments(s.email)); };
  useEffect(refresh, []);

  if (items.length === 0) return <Empty />;
  return (
    <div className="space-y-3">
      {items.map(e => (
        <div key={e.id} className="bg-white rounded-xl border border-border shadow-sm p-5 flex flex-wrap gap-4 items-center justify-between">
          <div className="flex items-start gap-4">
            <div className="size-12 rounded-lg bg-primary/10 text-primary grid place-items-center"><FileText/></div>
            <div>
              <div className="font-bold text-primary">{e.course}</div>
              <div className="text-xs text-muted-foreground">Nº {e.id} · Inscrita em {formatDate(e.createdAt)}</div>
              {e.documentName && <div className="text-xs text-muted-foreground mt-1">📎 {e.documentName}</div>}
            </div>
          </div>
          <div className="flex items-center gap-3">
            <StatusBadge status={e.status}/>
            {e.status !== "concluida" && (
              <button onClick={() => { issueDemoCertificate(e.id); refresh(); }} className="text-xs font-bold text-primary inline-flex items-center gap-1 hover:underline">
                <Sparkles size={14}/> Emitir certificado (demo)
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

function StatusBadge({ status }: { status: Enrollment["status"] }) {
  const map = {
    pendente: "bg-amber-100 text-amber-800",
    confirmada: "bg-blue-100 text-blue-800",
    concluida: "bg-green-100 text-green-800",
  } as const;
  const label = { pendente: "Aguarda pagamento", confirmada: "Confirmada", concluida: "Concluída" }[status];
  return <span className={`px-3 py-1 rounded-full text-xs font-bold ${map[status]}`}>{label}</span>;
}

function Empty() {
  return (
    <div className="bg-white rounded-xl border border-border p-10 text-center">
      <p className="text-muted-foreground">Ainda não tem inscrições.</p>
      <Link to="/inscricao" className="inline-block mt-4 rounded-full bg-primary text-primary-foreground font-bold px-6 py-2.5 hover:bg-[#1565C0]">Inscrever-me agora</Link>
    </div>
  );
}
