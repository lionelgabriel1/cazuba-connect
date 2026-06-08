import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Check, X, FileText, ExternalLink } from "lucide-react";
import { listAllEnrollments, setDocumentStatus, formatDate, type Enrollment } from "@/lib/cazuba-store";

export const Route = createFileRoute("/admin/documentos")({ component: AdminDocs });

function AdminDocs() {
  const [items, setItems] = useState<Enrollment[]>([]);
  const refresh = () => setItems(listAllEnrollments().filter(e => e.documentDataUrl));
  useEffect(refresh, []);

  function decide(id: string, status: "aprovado" | "rejeitado") {
    const note = status === "rejeitado" ? (window.prompt("Motivo da rejeição (opcional):") ?? "") : "Documento válido";
    setDocumentStatus(id, status, note);
    refresh();
  }

  if (items.length === 0) return <div className="bg-white rounded-xl border border-border p-10 text-center text-muted-foreground">Sem documentos enviados.</div>;

  return (
    <div className="grid md:grid-cols-2 gap-4">
      {items.map(e => {
        const st = e.documentStatus ?? "pendente";
        const color = st === "aprovado" ? "border-green-500/40" : st === "rejeitado" ? "border-red-500/40" : "border-amber-500/40";
        return (
          <div key={e.id} className={`bg-white rounded-2xl border-2 ${color} shadow-sm p-5`}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="font-bold text-primary">{e.fullName}</div>
                <div className="text-xs text-muted-foreground">{e.studentEmail} · {e.course}</div>
                <div className="text-xs text-muted-foreground mt-1">Inscrição: {e.id} · {formatDate(e.createdAt)}</div>
              </div>
              <StatusPill s={st} />
            </div>
            <div className="mt-3 flex items-center gap-3 bg-muted/50 rounded-lg p-3">
              <FileText className="text-primary" />
              <div className="text-sm font-semibold flex-1 truncate">{e.documentName}</div>
              <a href={e.documentDataUrl} target="_blank" rel="noopener" className="inline-flex items-center gap-1 text-primary text-xs font-bold hover:underline"><ExternalLink size={12}/> Abrir</a>
            </div>
            {e.documentNote && <p className="mt-2 text-xs text-muted-foreground italic">Nota: {e.documentNote}</p>}
            {st !== "aprovado" && (
              <div className="mt-4 flex gap-2">
                <button onClick={() => decide(e.id, "aprovado")} className="flex-1 inline-flex items-center justify-center gap-1 h-9 rounded-full bg-green-600 text-white text-sm font-bold hover:bg-green-700"><Check size={14}/> Aprovar</button>
                <button onClick={() => decide(e.id, "rejeitado")} className="flex-1 inline-flex items-center justify-center gap-1 h-9 rounded-full bg-red-600 text-white text-sm font-bold hover:bg-red-700"><X size={14}/> Rejeitar</button>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function StatusPill({ s }: { s: "pendente" | "aprovado" | "rejeitado" }) {
  const map = { pendente: "bg-amber-100 text-amber-800", aprovado: "bg-green-100 text-green-800", rejeitado: "bg-red-100 text-red-800" };
  return <span className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase ${map[s]}`}>{s}</span>;
}
