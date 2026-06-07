import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { FileText, CreditCard, Award, Receipt } from "lucide-react";
import { getSession, listCertificates, listEnrollments, listPayments, listReceipts } from "@/lib/cazuba-store";

export const Route = createFileRoute("/aluno/")({ component: Resumo });

function Resumo() {
  const [stats, setStats] = useState({ enrolls: 0, pays: 0, paid: 0, certs: 0, receipts: 0 });
  useEffect(() => {
    const s = getSession(); if (!s) return;
    const ps = listPayments(s.email);
    setStats({
      enrolls: listEnrollments(s.email).length,
      pays: ps.length,
      paid: ps.filter(p => p.status === "confirmado").length,
      certs: listCertificates(s.email).length,
      receipts: listReceipts(s.email).length,
    });
  }, []);

  const cards = [
    { to: "/aluno/inscricoes", label: "Inscrições", value: stats.enrolls, icon: FileText, color: "from-blue-500 to-blue-700" },
    { to: "/aluno/pagamentos", label: "Pagamentos", value: `${stats.paid}/${stats.pays}`, icon: CreditCard, color: "from-amber-500 to-amber-600" },
    { to: "/aluno/comprovativos", label: "Comprovativos", value: stats.receipts, icon: Receipt, color: "from-indigo-500 to-indigo-700" },
    { to: "/aluno/certificados", label: "Certificados", value: stats.certs, icon: Award, color: "from-emerald-500 to-emerald-700" },
  ] as const;

  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map(c => (
        <Link key={c.to} to={c.to} className="group bg-white rounded-2xl border border-border shadow-sm p-5 hover:shadow-md transition">
          <div className={`size-12 rounded-xl bg-gradient-to-br ${c.color} text-white grid place-items-center mb-3 group-hover:scale-105 transition`}><c.icon /></div>
          <div className="text-3xl font-extrabold text-primary">{c.value}</div>
          <div className="text-sm text-muted-foreground font-semibold">{c.label}</div>
        </Link>
      ))}
    </div>
  );
}
