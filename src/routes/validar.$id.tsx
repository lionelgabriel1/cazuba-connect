import { createFileRoute } from "@tanstack/react-router";
import { CheckCircle2, XCircle, ShieldCheck } from "lucide-react";
import { PageShell } from "@/components/cazuba/Shell";
import { getCertificate, getReceipt, formatAOA, formatDate } from "@/lib/cazuba-store";

export const Route = createFileRoute("/validar/$id")({
  head: ({ params }) => ({
    meta: [
      { title: `Validação ${params.id} — Cazuba` },
      { name: "description", content: "Validação online de comprovativos e certificados emitidos pelo Cazuba Centro de Treinamento." },
    ],
  }),
  component: Validar,
});

function Validar() {
  const { id } = Route.useParams();
  const [kind, ...rest] = id.split("-");
  const realId = rest.join("-");

  const cert = kind === "certificado" ? getCertificate(realId) : null;
  const receipt = kind === "comprovativo" ? getReceipt(realId) : null;
  const valid = Boolean(cert || receipt);

  return (
    <PageShell title="Validação Oficial" subtitle="Sistema oficial de validação de documentos emitidos pelo Cazuba.">
      <div className="max-w-2xl mx-auto bg-white rounded-2xl border border-border shadow-md overflow-hidden">
        <div className={`p-8 text-center ${valid ? "bg-green-50" : "bg-red-50"}`}>
          {valid ? (
            <CheckCircle2 className="mx-auto text-green-600" size={64} />
          ) : (
            <XCircle className="mx-auto text-red-600" size={64} />
          )}
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
                <Row k="Aluno" v={cert.fullName} />
                <Row k="Curso" v={cert.course} />
                <Row k="Carga Horária" v={`${cert.hours} horas`} />
                <Row k="Data de Emissão" v={formatDate(cert.issuedAt)} />
                <Row k="Nº do Certificado" v={cert.id} />
              </dl>
            </>
          )}
          {receipt && (
            <>
              <h3 className="font-bold text-primary flex items-center gap-2"><ShieldCheck size={18}/> Comprovativo de {receipt.kind === "pagamento" ? "Pagamento" : "Inscrição"}</h3>
              <dl className="mt-4 space-y-2 text-sm">
                <Row k="Aluno" v={receipt.fullName} />
                <Row k="Curso" v={receipt.course} />
                <Row k="Valor" v={formatAOA(receipt.amount)} />
                <Row k="Data de Emissão" v={formatDate(receipt.issuedAt)} />
                <Row k="Inscrição" v={receipt.enrollmentId} />
              </dl>
            </>
          )}
          {!valid && (
            <p className="text-sm text-muted-foreground text-center">
              Este documento não foi localizado nos nossos registos. Verifique o código ou contacte a secretaria.
            </p>
          )}
        </div>
      </div>
    </PageShell>
  );
}

function Row({ k, v }: { k: string; v: React.ReactNode }) {
  return <div className="flex justify-between border-b border-border/50 py-2"><dt className="text-muted-foreground">{k}</dt><dd className="font-semibold text-right">{v}</dd></div>;
}
