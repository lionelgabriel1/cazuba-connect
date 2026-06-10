import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ShieldCheck, Search } from "lucide-react";
import { PageShell } from "@/components/cazuba/Shell";
import { tenant } from "@/config/tenant";

export const Route = createFileRoute("/validar/")({
  head: () => ({
    meta: [
      { title: `Verificador de Certificados — ${tenant.name}` },
      { name: "description", content: `Verifique a autenticidade de certificados e comprovativos emitidos por ${tenant.name}.` },
    ],
  }),
  component: ValidarIndex,
});

function ValidarIndex() {
  const nav = useNavigate();
  const [code, setCode] = useState("");
  const [type, setType] = useState<"certificado" | "comprovativo">("certificado");

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const id = code.trim();
    if (!id) return;
    // Aceita "certificado-UUID" colado integralmente ou apenas UUID
    const composite = id.includes("-") && (id.startsWith("certificado-") || id.startsWith("comprovativo-"))
      ? id : `${type}-${id}`;
    nav({ to: "/validar/$id", params: { id: composite } });
  }

  return (
    <PageShell title="Verificador de Documentos" subtitle="Confirme a autenticidade de qualquer certificado ou comprovativo emitido pelo centro.">
      <div className="max-w-xl mx-auto bg-white rounded-2xl border border-border shadow-md p-8">
        <div className="size-14 mx-auto rounded-full bg-primary/10 text-primary grid place-items-center">
          <ShieldCheck size={28} />
        </div>
        <h2 className="text-center font-display text-xl font-bold text-primary mt-3">Validar Documento</h2>
        <p className="text-center text-sm text-muted-foreground mt-1">Introduza o código presente no documento ou faça scan do QR code.</p>

        <form onSubmit={submit} className="mt-6 space-y-4">
          <div className="flex gap-2">
            {(["certificado", "comprovativo"] as const).map(t => (
              <button key={t} type="button" onClick={() => setType(t)}
                className={`flex-1 h-10 rounded-full text-sm font-bold capitalize transition ${type === t ? "bg-primary text-primary-foreground" : "bg-muted text-foreground/70 hover:bg-muted/70"}`}>
                {t}
              </button>
            ))}
          </div>
          <label className="block">
            <span className="text-xs font-bold uppercase text-muted-foreground">Código do documento</span>
            <input required value={code} onChange={e => setCode(e.target.value)} placeholder="Ex.: 8f3a-..." className="mt-1 w-full h-11 px-4 rounded-lg border border-border font-mono outline-none focus:border-primary" />
          </label>
          <button className="w-full h-11 rounded-full bg-primary text-primary-foreground font-bold inline-flex items-center justify-center gap-2 hover:bg-[#1565C0]">
            <Search size={16} /> Verificar
          </button>
        </form>

        <p className="text-center text-xs text-muted-foreground mt-6">Cada documento emitido pelo {tenant.shortName} contém um QR code único de verificação.</p>
      </div>
    </PageShell>
  );
}
