import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Award, Download, QrCode } from "lucide-react";
import { downloadCertificatePdf, formatDate, getSession, listCertificates, type Certificate } from "@/lib/cazuba-store";

export const Route = createFileRoute("/aluno/certificados")({ component: Certificados });

function Certificados() {
  const [items, setItems] = useState<Certificate[]>([]);
  useEffect(() => { const s = getSession(); if (s) setItems(listCertificates(s.email)); }, []);

  if (items.length === 0) return (
    <div className="bg-white rounded-xl border border-border p-10 text-center">
      <Award className="mx-auto text-muted-foreground" />
      <p className="text-muted-foreground mt-3">Ainda não tem certificados emitidos.</p>
      <p className="text-xs text-muted-foreground mt-1">Os certificados são emitidos após a conclusão do curso.</p>
    </div>
  );

  return (
    <div className="grid md:grid-cols-2 gap-4">
      {items.map(c => (
        <div key={c.id} className="bg-gradient-to-br from-primary to-[#1565C0] text-white rounded-2xl shadow-lg p-6 relative overflow-hidden">
          <div className="absolute -top-12 -right-12 size-40 rounded-full bg-gold/20" />
          <Award className="text-gold" size={36}/>
          <div className="mt-3 text-xs uppercase tracking-widest text-white/70 font-bold">Certificado de Conclusão</div>
          <div className="font-display text-xl font-extrabold mt-1">{c.course}</div>
          <div className="text-sm text-white/90 mt-1">{c.fullName}</div>
          <div className="text-xs text-white/70 mt-3">{c.hours}h · Emitido em {formatDate(c.issuedAt)} · Nº {c.id}</div>
          <div className="flex gap-2 mt-5 relative">
            <button onClick={() => downloadCertificatePdf(c)} className="flex-1 inline-flex items-center justify-center gap-2 rounded-full bg-gold text-gold-foreground py-2 font-bold text-sm hover:brightness-105">
              <Download size={14}/> Descarregar PDF
            </button>
            <Link to="/validar/$id" params={{ id: `certificado-${c.id}` }} className="inline-flex items-center gap-2 rounded-full bg-white/15 hover:bg-white/25 px-3 py-2 font-bold text-sm">
              <QrCode size={14}/> Validar
            </Link>
          </div>
        </div>
      ))}
    </div>
  );
}
