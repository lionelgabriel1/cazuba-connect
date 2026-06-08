import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { FileText, CreditCard, Award, Users, Clock, CheckCircle2 } from "lucide-react";
import { listAllEnrollments, listAllPayments, listAllCertificates, listStudents, formatAOA } from "@/lib/cazuba-store";

export const Route = createFileRoute("/admin/")({ component: AdminHome });

function AdminHome() {
  const [data, setData] = useState({ enr: 0, pen: 0, pag: 0, paid: 0, rev: 0, cert: 0, stu: 0 });
  useEffect(() => {
    const e = listAllEnrollments(), p = listAllPayments(), c = listAllCertificates(), s = listStudents();
    setData({
      enr: e.length,
      pen: e.filter(x => x.status === "pendente").length,
      pag: p.filter(x => x.status === "aguardando").length,
      paid: p.filter(x => x.status === "confirmado").length,
      rev: p.filter(x => x.status === "confirmado").reduce((a, x) => a + x.amount, 0),
      cert: c.length, stu: s.length,
    });
  }, []);

  const cards = [
    { icon: FileText, label: "Inscrições totais", value: data.enr, foot: `${data.pen} pendentes`, to: "/admin/inscricoes", color: "bg-blue-500/10 text-blue-700" },
    { icon: Clock, label: "Pagamentos aguardando", value: data.pag, foot: "Aprovar / confirmar", to: "/admin/pagamentos", color: "bg-amber-500/10 text-amber-700" },
    { icon: CheckCircle2, label: "Pagamentos confirmados", value: data.paid, foot: formatAOA(data.rev), to: "/admin/pagamentos", color: "bg-green-500/10 text-green-700" },
    { icon: Award, label: "Certificados emitidos", value: data.cert, foot: "Emitir / reenviar", to: "/admin/certificados", color: "bg-purple-500/10 text-purple-700" },
    { icon: Users, label: "Alunos registados", value: data.stu, foot: "Ver lista completa", to: "/admin/alunos", color: "bg-primary/10 text-primary" },
  ];

  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {cards.map(c => (
        <Link key={c.label} to={c.to} className="bg-white rounded-2xl border border-border shadow-sm p-5 hover:shadow-md hover:-translate-y-0.5 transition">
          <div className={`size-11 rounded-xl grid place-items-center ${c.color}`}><c.icon /></div>
          <div className="mt-3 text-3xl font-extrabold text-primary font-display">{c.value}</div>
          <div className="text-sm font-semibold text-foreground">{c.label}</div>
          <div className="text-xs text-muted-foreground mt-1">{c.foot}</div>
        </Link>
      ))}
    </div>
  );
}
