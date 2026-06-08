// Demo storage layer (localStorage) — pronto para futura migração para Supabase.
// Cada função aqui pode ser substituída por chamadas createServerFn + supabase
// sem alterar os componentes que usam estes tipos.

import jsPDF from "jspdf";
import QRCode from "qrcode";

export type Enrollment = {
  id: string;
  studentEmail: string;
  fullName: string;
  phone: string;
  birthDate: string;
  address: string;
  course: string;
  paymentMethod: "transferencia" | "referencia" | "presencial";
  documentName?: string;
  documentDataUrl?: string;
  documentStatus?: "pendente" | "aprovado" | "rejeitado";
  documentNote?: string;
  status: "pendente" | "confirmada" | "concluida";
  createdAt: string;
};


export type Payment = {
  id: string;
  enrollmentId: string;
  studentEmail: string;
  course: string;
  amount: number;
  method: string;
  proofName?: string;
  proofDataUrl?: string;
  status: "aguardando" | "confirmado";
  createdAt: string;
};

export type Receipt = {
  id: string;
  enrollmentId: string;
  paymentId?: string;
  studentEmail: string;
  fullName: string;
  course: string;
  amount: number;
  issuedAt: string;
  kind: "inscricao" | "pagamento";
};

export type Certificate = {
  id: string;
  enrollmentId: string;
  studentEmail: string;
  fullName: string;
  course: string;
  issuedAt: string;
  hours: number;
};

const KEYS = {
  enrollments: "cazuba:enrollments",
  payments: "cazuba:payments",
  receipts: "cazuba:receipts",
  certificates: "cazuba:certificates",
  session: "cazuba:session",
} as const;

function read<T>(key: string): T[] {
  if (typeof window === "undefined") return [];
  try { return JSON.parse(localStorage.getItem(key) ?? "[]"); } catch { return []; }
}
function write<T>(key: string, value: T[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(key, JSON.stringify(value));
}

export const COURSES = [
  { name: "Informática", price: 25000, hours: 96 },
  { name: "Marketing Digital", price: 30000, hours: 64 },
  { name: "Atendimento ao Público", price: 20000, hours: 64 },
  { name: "Contabilidade Geral", price: 35000, hours: 96 },
  { name: "Inglês", price: 28000, hours: 96 },
  { name: "Recursos Humanos", price: 30000, hours: 64 },
  { name: "Secretariado Executivo", price: 25000, hours: 64 },
  { name: "Designer Gráfico", price: 35000, hours: 96 },
  { name: "Gestão Empresarial", price: 35000, hours: 96 },
  { name: "Operador de Caixa", price: 15000, hours: 32 },
  { name: "Manicure e Pedicure", price: 15000, hours: 32 },
];

export function getSession(): { email: string; name: string } | null {
  if (typeof window === "undefined") return null;
  try { return JSON.parse(localStorage.getItem(KEYS.session) ?? "null"); } catch { return null; }
}
export function setSession(s: { email: string; name: string } | null) {
  if (typeof window === "undefined") return;
  if (s) localStorage.setItem(KEYS.session, JSON.stringify(s));
  else localStorage.removeItem(KEYS.session);
}

const uid = (p: string) => `${p}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`.toUpperCase();

export function listEnrollments(email?: string): Enrollment[] {
  const all = read<Enrollment>(KEYS.enrollments);
  return email ? all.filter(e => e.studentEmail === email) : all;
}
export function getEnrollment(id: string): Enrollment | undefined {
  return read<Enrollment>(KEYS.enrollments).find(e => e.id === id);
}
export function listPayments(email?: string): Payment[] {
  const all = read<Payment>(KEYS.payments);
  return email ? all.filter(p => p.studentEmail === email) : all;
}
export function listReceipts(email?: string): Receipt[] {
  const all = read<Receipt>(KEYS.receipts);
  return email ? all.filter(r => r.studentEmail === email) : all;
}
export function getReceipt(id: string): Receipt | undefined {
  return read<Receipt>(KEYS.receipts).find(r => r.id === id);
}
export function listCertificates(email?: string): Certificate[] {
  const all = read<Certificate>(KEYS.certificates);
  return email ? all.filter(c => c.studentEmail === email) : all;
}
export function getCertificate(id: string): Certificate | undefined {
  return read<Certificate>(KEYS.certificates).find(c => c.id === id);
}

export function createEnrollment(input: Omit<Enrollment, "id" | "status" | "createdAt">): Enrollment {
  const all = read<Enrollment>(KEYS.enrollments);
  const e: Enrollment = { ...input, id: uid("INS"), status: "pendente", createdAt: new Date().toISOString() };
  all.unshift(e); write(KEYS.enrollments, all);
  setSession({ email: e.studentEmail, name: e.fullName });

  const course = COURSES.find(c => c.name === e.course);
  const receipts = read<Receipt>(KEYS.receipts);
  const receipt: Receipt = {
    id: uid("CMP"), enrollmentId: e.id, studentEmail: e.studentEmail, fullName: e.fullName,
    course: e.course, amount: course?.price ?? 0, issuedAt: new Date().toISOString(), kind: "inscricao",
  };
  receipts.unshift(receipt); write(KEYS.receipts, receipts);

  const payments = read<Payment>(KEYS.payments);
  payments.unshift({
    id: uid("PAG"), enrollmentId: e.id, studentEmail: e.studentEmail, course: e.course,
    amount: course?.price ?? 0, method: e.paymentMethod, status: "aguardando", createdAt: new Date().toISOString(),
  });
  write(KEYS.payments, payments);

  return e;
}

export function submitPaymentProof(paymentId: string, file: { name: string; dataUrl: string }) {
  const payments = read<Payment>(KEYS.payments);
  const idx = payments.findIndex(p => p.id === paymentId);
  if (idx === -1) return;
  payments[idx] = { ...payments[idx], proofName: file.name, proofDataUrl: file.dataUrl, status: "confirmado" };
  write(KEYS.payments, payments);

  // gera comprovativo de pagamento
  const p = payments[idx];
  const receipts = read<Receipt>(KEYS.receipts);
  const enrollment = getEnrollment(p.enrollmentId);
  receipts.unshift({
    id: uid("CMP"), enrollmentId: p.enrollmentId, paymentId: p.id,
    studentEmail: p.studentEmail, fullName: enrollment?.fullName ?? "", course: p.course,
    amount: p.amount, issuedAt: new Date().toISOString(), kind: "pagamento",
  });
  write(KEYS.receipts, receipts);

  // confirma inscrição
  const enrolls = read<Enrollment>(KEYS.enrollments);
  const ei = enrolls.findIndex(x => x.id === p.enrollmentId);
  if (ei !== -1) { enrolls[ei].status = "confirmada"; write(KEYS.enrollments, enrolls); }
}

export function issueDemoCertificate(enrollmentId: string): Certificate | null {
  const e = getEnrollment(enrollmentId); if (!e) return null;
  const course = COURSES.find(c => c.name === e.course);
  const certs = read<Certificate>(KEYS.certificates);
  if (certs.some(c => c.enrollmentId === enrollmentId)) return certs.find(c => c.enrollmentId === enrollmentId)!;
  const c: Certificate = {
    id: uid("CERT"), enrollmentId, studentEmail: e.studentEmail, fullName: e.fullName,
    course: e.course, issuedAt: new Date().toISOString(), hours: course?.hours ?? 64,
  };
  certs.unshift(c); write(KEYS.certificates, certs);
  const enrolls = read<Enrollment>(KEYS.enrollments);
  const ei = enrolls.findIndex(x => x.id === enrollmentId);
  if (ei !== -1) { enrolls[ei].status = "concluida"; write(KEYS.enrollments, enrolls); }
  return c;
}

export function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(String(r.result));
    r.onerror = reject;
    r.readAsDataURL(file);
  });
}

export function formatAOA(n: number) {
  return new Intl.NumberFormat("pt-AO", { style: "currency", currency: "AOA", maximumFractionDigits: 0 }).format(n);
}
export function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("pt-PT", { day: "2-digit", month: "2-digit", year: "numeric" });
}

function validationUrl(kind: "comprovativo" | "certificado", id: string) {
  const base = typeof window !== "undefined" ? window.location.origin : "";
  return `${base}/validar/${kind}-${id}`;
}

async function makeQr(text: string) {
  return QRCode.toDataURL(text, { width: 220, margin: 1, color: { dark: "#0D47A1", light: "#FFFFFF" } });
}

function header(doc: jsPDF) {
  doc.setFillColor(13, 71, 161); doc.rect(0, 0, 210, 32, "F");
  doc.setTextColor(255, 193, 7); doc.setFont("helvetica", "bold"); doc.setFontSize(22);
  doc.text("CAZUBA", 15, 18);
  doc.setTextColor(255, 255, 255); doc.setFontSize(10); doc.setFont("helvetica", "normal");
  doc.text("Centro de Treinamento", 15, 25);
  doc.setFontSize(9); doc.text("Município do Hoje-ya-Henda · 938 747 141", 195, 18, { align: "right" });
  doc.text("contato@cazubatreinamento.com", 195, 25, { align: "right" });
}

function footer(doc: jsPDF) {
  doc.setDrawColor(13, 71, 161); doc.setLineWidth(0.5); doc.line(15, 280, 195, 280);
  doc.setTextColor(120); doc.setFontSize(8); doc.setFont("helvetica", "italic");
  doc.text("Capacitando talentos, construindo futuros — © 2026 Cazuba Centro de Treinamento.", 105, 287, { align: "center" });
}

export async function downloadReceiptPdf(r: Receipt) {
  const doc = new jsPDF();
  header(doc);
  doc.setTextColor(13, 71, 161); doc.setFont("helvetica", "bold"); doc.setFontSize(18);
  doc.text(r.kind === "inscricao" ? "COMPROVATIVO DE INSCRIÇÃO" : "COMPROVATIVO DE PAGAMENTO", 105, 50, { align: "center" });

  doc.setDrawColor(255, 193, 7); doc.setLineWidth(0.8); doc.line(15, 56, 195, 56);

  doc.setTextColor(40); doc.setFont("helvetica", "normal"); doc.setFontSize(11);
  const rows: [string, string][] = [
    ["Nº do Comprovativo:", r.id],
    ["Inscrição:", r.enrollmentId],
    ["Nome do Aluno:", r.fullName],
    ["E-mail:", r.studentEmail],
    ["Curso:", r.course],
    ["Valor:", formatAOA(r.amount)],
    ["Data de Emissão:", new Date(r.issuedAt).toLocaleString("pt-PT")],
    ["Estado:", r.kind === "pagamento" ? "PAGAMENTO CONFIRMADO" : "INSCRIÇÃO REGISTADA"],
  ];
  let y = 72;
  rows.forEach(([k, v]) => {
    doc.setFont("helvetica", "bold"); doc.text(k, 20, y);
    doc.setFont("helvetica", "normal"); doc.text(String(v), 70, y);
    y += 9;
  });

  const qrUrl = validationUrl("comprovativo", r.id);
  const qr = await makeQr(qrUrl);
  doc.addImage(qr, "PNG", 140, 150, 50, 50);
  doc.setFontSize(8); doc.setTextColor(80);
  doc.text("Validar online:", 165, 205, { align: "center" });
  doc.text(qrUrl, 165, 210, { align: "center", maxWidth: 60 });

  doc.setFontSize(9); doc.setTextColor(13, 71, 161);
  doc.text("Este documento é gerado eletronicamente e pode ser validado", 20, 160);
  doc.text("escaneando o QR Code ao lado em qualquer dispositivo.", 20, 166);

  footer(doc);
  doc.save(`${r.kind === "inscricao" ? "comprovativo-inscricao" : "comprovativo-pagamento"}-${r.id}.pdf`);
}

export async function downloadCertificatePdf(c: Certificate) {
  const doc = new jsPDF({ orientation: "landscape" });
  // moldura
  doc.setDrawColor(13, 71, 161); doc.setLineWidth(2); doc.rect(8, 8, 281, 194);
  doc.setDrawColor(255, 193, 7); doc.setLineWidth(0.6); doc.rect(13, 13, 271, 184);

  doc.setTextColor(13, 71, 161); doc.setFont("helvetica", "bold"); doc.setFontSize(28);
  doc.text("CAZUBA CENTRO DE TREINAMENTO", 148, 35, { align: "center" });
  doc.setFontSize(10); doc.setFont("helvetica", "italic"); doc.setTextColor(120);
  doc.text("Capacitando talentos, construindo futuros.", 148, 43, { align: "center" });

  doc.setFontSize(34); doc.setFont("helvetica", "bold"); doc.setTextColor(255, 193, 7);
  doc.text("CERTIFICADO", 148, 70, { align: "center" });

  doc.setFontSize(12); doc.setFont("helvetica", "normal"); doc.setTextColor(60);
  doc.text("Certifica-se que", 148, 88, { align: "center" });

  doc.setFontSize(26); doc.setFont("helvetica", "bold"); doc.setTextColor(13, 71, 161);
  doc.text(c.fullName.toUpperCase(), 148, 105, { align: "center" });

  doc.setFontSize(12); doc.setFont("helvetica", "normal"); doc.setTextColor(60);
  doc.text(`concluiu com aproveitamento o curso de`, 148, 120, { align: "center" });
  doc.setFontSize(18); doc.setFont("helvetica", "bold"); doc.setTextColor(13, 71, 161);
  doc.text(c.course, 148, 132, { align: "center" });
  doc.setFontSize(11); doc.setFont("helvetica", "normal"); doc.setTextColor(60);
  doc.text(`com a carga horária total de ${c.hours} horas.`, 148, 142, { align: "center" });

  const qrUrl = validationUrl("certificado", c.id);
  const qr = await makeQr(qrUrl);
  doc.addImage(qr, "PNG", 20, 145, 38, 38);
  doc.setFontSize(8); doc.setTextColor(80);
  doc.text("Validação online", 39, 188, { align: "center" });

  doc.setDrawColor(60); doc.setLineWidth(0.3); doc.line(180, 170, 270, 170);
  doc.setFontSize(10); doc.setTextColor(60);
  doc.text("Anselmo Antonio Cazuba", 225, 176, { align: "center" });
  doc.text("Director Geral", 225, 182, { align: "center" });

  doc.setFontSize(9); doc.setTextColor(120);
  doc.text(`Hoje-ya-Henda, ${new Date(c.issuedAt).toLocaleDateString("pt-PT")} · Nº ${c.id}`, 148, 192, { align: "center" });

  doc.save(`certificado-${c.id}.pdf`);
}
