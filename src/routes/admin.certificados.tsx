import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Award, Download, Plus } from "lucide-react";
import {
  listAllCertificates, listAllEnrollments, issueDemoCertificate, downloadCertificatePdf,
  formatDate, type Certificate, type Enrollment,
} from "@/lib/cazuba-store";

export const Route = createFileRoute("/admin/certificados")({ component: AdminCerts });

function AdminCerts() {
  const [certs, setCerts] = useState<Certificate[]>([]);
  const [pendentes, setPendentes] = useState<Enrollment[]>([]);
  const refresh = () => {
    const c = listAllCertificates(); setCerts(c);
    const issued = new Set(c.map(x => x.enrollmentId));
    setPendentes(listAllEnrollments().filter(e => e.status !== "pendente" && !issued.has(e.id)));
  };
  useEffect(refresh, []);

  async function emitir(e: Enrollment) {
    const c = issueDemoCertificate(e.id); if (c) { await downloadCertificatePdf(c); refresh(); }
  }

  return (
    <div className="space-y-6">
      <section>
        <h3 className="font-display font-bold text-primary mb-3">Elegíveis para emissão ({pendentes.length})</h3>
        {pendentes.length === 0 ? (
          <div className="bg-white rounded-xl border border-border p-6 text-center text-muted-foreground text-sm">Sem inscrições elegíveis para certificado.</div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {pendentes.map(e => (
              <div key={e.id} className="bg-white rounded-xl border border-border p-4">
                <div className="font-bold text-primary">{e.fullName}</div>
                <div className="text-xs text-muted-foreground">{e.course}</div>
                <button onClick={() => emitir(e)} className="mt-3 w-full inline-flex items-center justify-center gap-1 h-9 rounded-full bg-gold text-gold-foreground font-bold text-sm hover:brightness-105"><Plus size={14}/> Emitir Certificado</button>
              </div>
            ))}
          </div>
        )}
      </section>

      <section>
        <h3 className="font-display font-bold text-primary mb-3">Certificados emitidos ({certs.length})</h3>
        {certs.length === 0 ? (
          <div className="bg-white rounded-xl border border-border p-6 text-center text-muted-foreground text-sm">Nenhum certificado emitido ainda.</div>
        ) : (
          <div className="bg-white rounded-xl border border-border overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 text-xs uppercase text-muted-foreground">
                <tr><th className="text-left p-3">Nº</th><th className="text-left p-3">Aluno</th><th className="text-left p-3">Curso</th><th className="text-left p-3">Carga</th><th className="text-left p-3">Emitido</th><th className="text-right p-3">Acção</th></tr>
              </thead>
              <tbody>
                {certs.map(c => (
                  <tr key={c.id} className="border-t border-border">
                    <td className="p-3 font-mono text-xs">{c.id}</td>
                    <td className="p-3"><div className="font-semibold">{c.fullName}</div><div className="text-xs text-muted-foreground">{c.studentEmail}</div></td>
                    <td className="p-3"><Award size={14} className="inline text-gold mr-1"/>{c.course}</td>
                    <td className="p-3">{c.hours}h</td>
                    <td className="p-3 whitespace-nowrap">{formatDate(c.issuedAt)}</td>
                    <td className="p-3 text-right">
                      <button onClick={() => downloadCertificatePdf(c)} className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-primary text-primary-foreground text-xs font-bold hover:bg-[#1565C0]"><Download size={12}/> Reenviar</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
