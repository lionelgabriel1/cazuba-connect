import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Search, Mail, Phone } from "lucide-react";
import { listStudents, listEnrollments, listPayments, listCertificates, formatDate, type Student } from "@/lib/cazuba-store";

export const Route = createFileRoute("/admin/alunos")({ component: AdminAlunos });

function AdminAlunos() {
  const [items, setItems] = useState<Student[]>([]);
  const [q, setQ] = useState("");
  const [open, setOpen] = useState<string | null>(null);
  useEffect(() => setItems(listStudents()), []);

  const filtered = useMemo(() => items.filter(s =>
    q === "" || [s.name, s.email, s.phone].join(" ").toLowerCase().includes(q.toLowerCase())
  ), [items, q]);

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
        <input value={q} onChange={e => setQ(e.target.value)} placeholder="Procurar aluno por nome, e-mail ou telefone..." className="w-full pl-9 h-10 rounded-lg border border-border bg-white outline-none focus:border-primary" />
      </div>

      {filtered.length === 0 ? (
        <div className="bg-white rounded-xl border border-border p-10 text-center text-muted-foreground">Sem alunos registados.</div>
      ) : (
        <div className="grid md:grid-cols-2 gap-3">
          {filtered.map(s => {
            const isOpen = open === s.email;
            const enr = isOpen ? listEnrollments(s.email) : [];
            const pay = isOpen ? listPayments(s.email) : [];
            const cer = isOpen ? listCertificates(s.email) : [];
            return (
              <div key={s.email} className="bg-white rounded-2xl border border-border shadow-sm">
                <button onClick={() => setOpen(isOpen ? null : s.email)} className="w-full p-5 text-left">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <div className="font-bold text-primary">{s.name}</div>
                      <div className="text-xs text-muted-foreground flex items-center gap-3 mt-1 flex-wrap">
                        <span className="inline-flex items-center gap-1"><Mail size={12}/> {s.email}</span>
                        <span className="inline-flex items-center gap-1"><Phone size={12}/> {s.phone}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-extrabold font-display text-primary">{s.enrollments}</div>
                      <div className="text-[10px] uppercase text-muted-foreground font-bold">inscrições</div>
                    </div>
                  </div>
                </button>
                {isOpen && (
                  <div className="border-t border-border p-5 text-sm space-y-3">
                    <Section title={`Inscrições (${enr.length})`}>
                      {enr.map(e => <Row key={e.id} l={`${e.course} · ${e.id}`} r={`${formatDate(e.createdAt)} · ${e.status}`} />)}
                    </Section>
                    <Section title={`Pagamentos (${pay.length})`}>
                      {pay.map(p => <Row key={p.id} l={`${p.course} · ${p.method}`} r={p.status} />)}
                    </Section>
                    <Section title={`Certificados (${cer.length})`}>
                      {cer.length === 0 ? <p className="text-xs text-muted-foreground">Nenhum.</p> :
                        cer.map(c => <Row key={c.id} l={c.course} r={formatDate(c.issuedAt)} />)}
                    </Section>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return <div><div className="text-xs font-bold uppercase text-muted-foreground mb-1">{title}</div><div className="space-y-1">{children}</div></div>;
}
function Row({ l, r }: { l: string; r: string }) {
  return <div className="flex justify-between gap-2 text-xs"><span className="text-foreground">{l}</span><span className="text-muted-foreground">{r}</span></div>;
}
