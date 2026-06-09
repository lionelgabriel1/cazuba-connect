import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { CheckCircle2, XCircle, ShieldCheck } from "lucide-react";
import { PageShell } from "@/components/cazuba/Shell";
import { validateCertificate, validateReceipt, formatAOA, formatDate, type Certificate, type Receipt } from "@/lib/supabase";
import { tenant } from "@/config/tenant";

export const Route = createFileRoute("/validar/$id")({
  head: ({ params }) => ({
    meta: [
      { title: `Validação ${params.id} — ${tenant.name}` },
      { name: "description", content: `Validação online de documentos emitidos por ${tenant.name}.` },
    ],
  }),
  component: Validar,
});

function Validar() {
  const { id } = Route.useParams();
  const [kind, ...rest] = id.split("-");
  const realId = rest.join("-");
  const [cert, setCert] = useState<Certificate | null>(null);
  const [receipt, setReceipt] = useState<Receipt | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      if (kind === "certificado") setCert(await validateCertificate(realId));
      if (kind === "comprovativo") setReceipt(await validateReceipt(realId));
      setLoading(false);
    })();
  }, [kind, realId]);

  const valid = Boolean(cert || receipt);

  return (
    <PageShell title="Validação Oficial" subtitle={`Sistema oficial de validação de documentos emitidos por ${tenant.name}.`}>
      <div className="max-w-2xl mx-auto bg-white rounded-2xl border border-border shadow-md overflow-hidden">
        {loading ? <div className="p-12 text-center text-muted-foreground">A verificar...</div> : (
          <>
            <div className={`p-8 text-center ${valid ? "bg-green-50" : "bg-red-50"}`}>
              {valid ? <CheckCircle2 className="mx-auto text-green-600" size={64} /> : <XCircle className="mx-auto text-red-600" size={64} />}
              <h2 className={`mt-4 font-display text-2xl font-extrabold ${valid ? "text-green-700" : "text-red-700"}`}>
                {valid ? "DOCUMENTO VÁLIDO" : "DOCUMENTO NÃO ENCONTRADO"}
              </h2>
              <p className="text-sm text-muted-foreground mt-1">Código: <strong>{id}</strong></p>
            </div>
            <div className="p-8">
              {cert && (
                <>
                  <h3 className="font-bold text-primary flex items-center gap-2"><ShieldCheck size={18}/> Certificado de Conclusão</h3>
                  <dl className="mt-4 space-y-2 text-sm">
                    <Row k="Aluno" v={cert.full_name} />
                    <Row k="Curso" v={cert.course} />
                    <Row k="Carga Horária" v={`${cert.hours} horas`} />
                    <Row k="Data de Emissão" v={formatDate(cert.issued_at)} />
                    <Row k="Nº do Certificado" v={cert.id} />
                  </dl>
                </>
              )}
              {receipt && (
                <>
                  <h3 className="font-bold text-primary flex items-center gap-2"><ShieldCheck size={18}/> Comprovativo de {receipt.kind === "pagamento" ? "Pagamento" : "Inscrição"}</h3>
                  <dl className="mt-4 space-y-2 text-sm">
                    <Row k="Aluno" v={receipt.full_name} />
                    <Row k="Curso" v={receipt.course} />
                    <Row k="Valor" v={formatAOA(Number(receipt.amount))} />
                    <Row k="Data de Emissão" v={formatDate(receipt.issued_at)} />
                    <Row k="Inscrição" v={receipt.enrollment_id} />
                  </dl>
                </>
              )}
              {!valid && <p className="text-sm text-muted-foreground text-center">Este documento não foi localizado. Verifique o código ou contacte a secretaria.</p>}
            </div>
          </>
        )}
      </div>
    </PageShell>
  );
}

function Row({ k, v }: { k: string; v: React.ReactNode }) {
  return <div className="flex justify-between border-b border-border/50 py-2"><dt className="text-muted-foreground">{k}</dt><dd className="font-semibold text-right">{v}</dd></div>;
}
