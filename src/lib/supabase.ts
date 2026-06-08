// src/lib/supabase.ts
// ============================================================
//  CAZUBA CONNECT — Supabase client + store definitiva
//  Substitui cazuba-store.ts inteiramente.
//
//  Instala: npm install @supabase/supabase-js
//
//  Cria o ficheiro .env na raiz do projeto:
//    VITE_SUPABASE_URL=https://xxxx.supabase.co
//    VITE_SUPABASE_ANON_KEY=eyJ...
// ============================================================

import { createClient } from "@supabase/supabase-js";
import jsPDF from "jspdf";
import QRCode from "qrcode";

// ── Cliente ──────────────────────────────────────────────────
export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);


// ── Tipos ────────────────────────────────────────────────────
export type Profile = {
  id: string;
  student_code: string;   // CAZ-2026-XXXX — usado no login
  full_name: string;
  phone?: string;
  birth_date?: string;
  address?: string;
  role: "student" | "admin";
  created_at: string;
};

export type Enrollment = {
  id: string;
  student_id: string;
  student_code: string;
  full_name: string;
  phone: string;
  birth_date: string;
  address: string;
  course: string;
  payment_method: "transferencia" | "referencia" | "presencial";
  document_url?: string;
  document_name?: string;
  document_status: "pendente" | "aprovado" | "rejeitado";
  document_note?: string;
  status: "pendente" | "confirmada" | "concluida";
  created_at: string;
};

export type Payment = {
  id: string;
  enrollment_id: string;
  student_id: string;
  course: string;
  amount: number;
  method: string;
  proof_url?: string;
  proof_name?: string;
  status: "aguardando" | "confirmado";
  confirmed_at?: string;
  created_at: string;
};

export type Receipt = {
  id: string;
  enrollment_id: string;
  payment_id?: string;
  student_id: string;
  full_name: string;
  course: string;
  amount: number;
  kind: "inscricao" | "pagamento";
  issued_at: string;
};

export type Certificate = {
  id: string;
  enrollment_id: string;
  student_id: string;
  full_name: string;
  course: string;
  hours: number;
  issued_at: string;
};


// ── Cursos ───────────────────────────────────────────────────
export const COURSES = [
  { name: "Informática",             price: 25000, hours: 96 },
  { name: "Marketing Digital",       price: 30000, hours: 64 },
  { name: "Atendimento ao Público",  price: 20000, hours: 64 },
  { name: "Contabilidade Geral",     price: 35000, hours: 96 },
  { name: "Inglês",                  price: 28000, hours: 96 },
  { name: "Recursos Humanos",        price: 30000, hours: 64 },
  { name: "Secretariado Executivo",  price: 25000, hours: 64 },
  { name: "Designer Gráfico",        price: 35000, hours: 96 },
  { name: "Gestão Empresarial",      price: 35000, hours: 96 },
  { name: "Operador de Caixa",       price: 15000, hours: 32 },
  { name: "Manicure e Pedicure",     price: 15000, hours: 32 },
];


// ── Auth ─────────────────────────────────────────────────────

/**
 * Registo de novo aluno.
 * Chamado no final da inscrição.
 * O email real do aluno nunca é exposto — usamos um email interno
 * gerado a partir do student_code. O aluno faz login com
 * student_code + password escolhida por si.
 */
export async function registerStudent(opts: {
  studentCode: string;   // CAZ-2026-XXXX  (gerado pelo backend/DB)
  password: string;
  fullName: string;
  phone: string;
  birthDate: string;
  address: string;
}) {
  // Email interno invisível para o aluno
  const internalEmail = `${opts.studentCode.toLowerCase()}@cazuba.internal`;

  const { data, error } = await supabase.auth.signUp({
    email: internalEmail,
    password: opts.password,
    options: {
      data: {
        student_code: opts.studentCode,
        full_name: opts.fullName,
      },
    },
  });

  if (error) throw error;
  if (!data.user) throw new Error("Utilizador não criado.");

  // Preenche o profile com os dados completos
  const { error: profileError } = await supabase
    .from("profiles")
    .upsert({
      id: data.user.id,
      student_code: opts.studentCode,
      full_name: opts.fullName,
      phone: opts.phone,
      birth_date: opts.birthDate,
      address: opts.address,
      role: "student",
    });

  if (profileError) throw profileError;
  return data.user;
}

/**
 * Login do aluno com student_code + password.
 * Reconstrói o email interno e chama signInWithPassword.
 */
export async function loginStudent(studentCode: string, password: string) {
  const internalEmail = `${studentCode.trim().toLowerCase()}@cazuba.internal`;
  const { data, error } = await supabase.auth.signInWithPassword({
    email: internalEmail,
    password,
  });
  if (error) throw error;
  return data;
}

/** Login do admin com email real + password. */
export async function loginAdmin(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;

  // Verifica role
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", data.user.id)
    .single();

  if (profile?.role !== "admin") {
    await supabase.auth.signOut();
    throw new Error("Sem permissões de administrador.");
  }
  return data;
}

export async function logout() {
  await supabase.auth.signOut();
}

export async function getProfile(): Promise<Profile | null> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data } = await supabase.from("profiles").select("*").eq("id", user.id).single();
  return data;
}


// ── Inscrição ─────────────────────────────────────────────────

/**
 * Gera o student_code chamando a função SQL next_student_code().
 * Chama isto ANTES de registerStudent.
 */
export async function generateStudentCode(): Promise<string> {
  const { data, error } = await supabase.rpc("next_student_code");
  if (error) throw error;
  return data as string;
}

/**
 * Fluxo completo de inscrição:
 * 1. Gera student_code
 * 2. Cria conta Supabase Auth
 * 3. Insere enrollment
 * 4. Insere payment pendente
 * 5. Insere receipt de inscrição
 * Devolve { enrollment, receipt, studentCode }
 */
export async function createEnrollment(input: {
  fullName: string;
  phone: string;
  birthDate: string;
  address: string;
  course: string;
  paymentMethod: "transferencia" | "referencia" | "presencial";
  password: string;
  documentFile?: File;
}): Promise<{ enrollment: Enrollment; receipt: Receipt; studentCode: string }> {

  // 1. Gera código
  const studentCode = await generateStudentCode();

  // 2. Cria utilizador Auth
  const user = await registerStudent({
    studentCode,
    password: input.password,
    fullName: input.fullName,
    phone: input.phone,
    birthDate: input.birthDate,
    address: input.address,
  });

  // 3. Upload de documento (se existir)
  let documentUrl: string | undefined;
  let documentName: string | undefined;
  if (input.documentFile) {
    const ext = input.documentFile.name.split(".").pop();
    const path = `documents/${studentCode}/id.${ext}`;
    const { error: uploadErr } = await supabase.storage
      .from("cazuba-docs")
      .upload(path, input.documentFile, { upsert: true });
    if (!uploadErr) {
      documentUrl = path;
      documentName = input.documentFile.name;
    }
  }

  // 4. Insere enrollment
  const course = COURSES.find(c => c.name === input.course)!;
  const { data: enrollment, error: enrollErr } = await supabase
    .from("enrollments")
    .insert({
      student_id: user.id,
      student_code: studentCode,
      full_name: input.fullName,
      phone: input.phone,
      birth_date: input.birthDate,
      address: input.address,
      course: input.course,
      payment_method: input.paymentMethod,
      document_url: documentUrl,
      document_name: documentName,
      status: "pendente",
    })
    .select()
    .single();

  if (enrollErr) throw enrollErr;

  // 5. Insere payment pendente
  const { error: payErr } = await supabase
    .from("payments")
    .insert({
      enrollment_id: enrollment.id,
      student_id: user.id,
      course: input.course,
      amount: course.price,
      method: input.paymentMethod,
      status: "aguardando",
    });

  if (payErr) throw payErr;

  // 6. Insere receipt de inscrição
  const { data: receipt, error: recErr } = await supabase
    .from("receipts")
    .insert({
      enrollment_id: enrollment.id,
      student_id: user.id,
      full_name: input.fullName,
      course: input.course,
      amount: course.price,
      kind: "inscricao",
    })
    .select()
    .single();

  if (recErr) throw recErr;

  return { enrollment, receipt, studentCode };
}


// ── Aluno — queries ───────────────────────────────────────────

export async function listMyEnrollments(): Promise<Enrollment[]> {
  const { data, error } = await supabase
    .from("enrollments")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function listMyPayments(): Promise<Payment[]> {
  const { data, error } = await supabase
    .from("payments")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function listMyReceipts(): Promise<Receipt[]> {
  const { data, error } = await supabase
    .from("receipts")
    .select("*")
    .order("issued_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function listMyCertificates(): Promise<Certificate[]> {
  const { data, error } = await supabase
    .from("certificates")
    .select("*")
    .order("issued_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

/** Envio de comprovativo de pagamento */
export async function submitPaymentProof(paymentId: string, file: File): Promise<void> {
  const ext = file.name.split(".").pop();
  const path = `proofs/${paymentId}.${ext}`;

  const { error: uploadErr } = await supabase.storage
    .from("cazuba-docs")
    .upload(path, file, { upsert: true });
  if (uploadErr) throw uploadErr;

  const { error } = await supabase
    .from("payments")
    .update({ proof_url: path, proof_name: file.name, status: "confirmado", confirmed_at: new Date().toISOString() })
    .eq("id", paymentId);
  if (error) throw error;
}


// ── Admin — queries ───────────────────────────────────────────

export async function adminListEnrollments(): Promise<Enrollment[]> {
  const { data, error } = await supabase
    .from("enrollments").select("*").order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function adminListPayments(): Promise<Payment[]> {
  const { data, error } = await supabase
    .from("payments").select("*").order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function adminListReceipts(): Promise<Receipt[]> {
  const { data, error } = await supabase
    .from("receipts").select("*").order("issued_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function adminListCertificates(): Promise<Certificate[]> {
  const { data, error } = await supabase
    .from("certificates").select("*").order("issued_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function adminSetDocumentStatus(
  enrollmentId: string,
  status: "aprovado" | "rejeitado",
  note?: string
): Promise<void> {
  const { error } = await supabase
    .from("enrollments")
    .update({ document_status: status, document_note: note })
    .eq("id", enrollmentId);
  if (error) throw error;
}

export async function adminConfirmPayment(paymentId: string): Promise<void> {
  const { error } = await supabase
    .from("payments")
    .update({ status: "confirmado", confirmed_at: new Date().toISOString() })
    .eq("id", paymentId);
  if (error) throw error;
}

export async function adminIssueCertificate(enrollmentId: string): Promise<Certificate> {
  // Busca enrollment
  const { data: e, error: eErr } = await supabase
    .from("enrollments").select("*").eq("id", enrollmentId).single();
  if (eErr) throw eErr;

  const course = COURSES.find(c => c.name === e.course);

  const { data: cert, error: cErr } = await supabase
    .from("certificates")
    .insert({
      enrollment_id: enrollmentId,
      student_id: e.student_id,
      full_name: e.full_name,
      course: e.course,
      hours: course?.hours ?? 64,
    })
    .select()
    .single();
  if (cErr) throw cErr;

  // Marca inscrição como concluída
  await supabase.from("enrollments").update({ status: "concluida" }).eq("id", enrollmentId);

  return cert;
}


// ── Validação pública (sem login) ─────────────────────────────

export async function validateReceipt(id: string): Promise<Receipt | null> {
  const { data } = await supabase.from("receipts").select("*").eq("id", id).single();
  return data;
}

export async function validateCertificate(id: string): Promise<Certificate | null> {
  const { data } = await supabase.from("certificates").select("*").eq("id", id).single();
  return data;
}


// ── PDF helpers (mantidos da store original) ──────────────────

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

function pdfHeader(doc: jsPDF) {
  doc.setFillColor(13, 71, 161); doc.rect(0, 0, 210, 32, "F");
  doc.setTextColor(255, 193, 7); doc.setFont("helvetica", "bold"); doc.setFontSize(22);
  doc.text("CAZUBA", 15, 18);
  doc.setTextColor(255, 255, 255); doc.setFontSize(10); doc.setFont("helvetica", "normal");
  doc.text("Centro de Treinamento", 15, 25);
  doc.setFontSize(9); doc.text("Município do Hoje-ya-Henda · 938 747 141", 195, 18, { align: "right" });
  doc.text("contato@cazubatreinamento.com", 195, 25, { align: "right" });
}

function pdfFooter(doc: jsPDF) {
  doc.setDrawColor(13, 71, 161); doc.setLineWidth(0.5); doc.line(15, 280, 195, 280);
  doc.setTextColor(120); doc.setFontSize(8); doc.setFont("helvetica", "italic");
  doc.text("Capacitando talentos, construindo futuros — © 2026 Cazuba Centro de Treinamento.", 105, 287, { align: "center" });
}

/**
 * Gera e faz download do comprovativo de inscrição.
 * Inclui o student_code para o aluno poder fazer login.
 */
export async function downloadReceiptPdf(r: Receipt, studentCode: string) {
  const doc = new jsPDF();
  pdfHeader(doc);

  doc.setTextColor(13, 71, 161); doc.setFont("helvetica", "bold"); doc.setFontSize(18);
  doc.text(r.kind === "inscricao" ? "COMPROVATIVO DE INSCRIÇÃO" : "COMPROVATIVO DE PAGAMENTO", 105, 50, { align: "center" });

  doc.setDrawColor(255, 193, 7); doc.setLineWidth(0.8); doc.line(15, 56, 195, 56);

  doc.setTextColor(40); doc.setFont("helvetica", "normal"); doc.setFontSize(11);
  const rows: [string, string][] = [
    ["Nº do Comprovativo:", r.id],
    ["Inscrição:", r.enrollment_id],
    ["Nome do Aluno:", r.full_name],
    ["Curso:", r.course],
    ["Valor:", formatAOA(r.amount)],
    ["Data de Emissão:", new Date(r.issued_at).toLocaleString("pt-PT")],
    ["Estado:", r.kind === "pagamento" ? "PAGAMENTO CONFIRMADO" : "INSCRIÇÃO REGISTADA"],
  ];

  let y = 72;
  rows.forEach(([k, v]) => {
    doc.setFont("helvetica", "bold"); doc.text(k, 20, y);
    doc.setFont("helvetica", "normal"); doc.text(String(v), 70, y);
    y += 9;
  });

  // ── Caixa de acesso ──────────────────────────────────────
  // Esta secção é o diferencial: mostra o código de acesso ao aluno
  y += 6;
  doc.setFillColor(245, 245, 245);
  doc.setDrawColor(13, 71, 161);
  doc.setLineWidth(0.5);
  doc.roundedRect(15, y, 100, 38, 4, 4, "FD");

  doc.setFontSize(9); doc.setFont("helvetica", "bold"); doc.setTextColor(13, 71, 161);
  doc.text("ACESSO À ÁREA DO ALUNO", 65, y + 8, { align: "center" });

  doc.setFontSize(9); doc.setFont("helvetica", "normal"); doc.setTextColor(60);
  doc.text("Código de Aluno:", 22, y + 17);
  doc.setFont("helvetica", "bold"); doc.setTextColor(13, 71, 161); doc.setFontSize(13);
  doc.text(studentCode, 22, y + 26);

  doc.setFont("helvetica", "normal"); doc.setFontSize(8); doc.setTextColor(80);
  doc.text("Use este código + a sua password para entrar.", 22, y + 34);
  // ────────────────────────────────────────────────────────

  const qrUrl = validationUrl("comprovativo", r.id);
  const qr = await makeQr(qrUrl);
  doc.addImage(qr, "PNG", 140, 150, 50, 50);
  doc.setFontSize(8); doc.setTextColor(80);
  doc.text("Validar online:", 165, 205, { align: "center" });
  doc.text(qrUrl, 165, 210, { align: "center", maxWidth: 60 });

  pdfFooter(doc);
  doc.save(`comprovativo-inscricao-${studentCode}.pdf`);
}

export async function downloadCertificatePdf(c: Certificate) {
  const doc = new jsPDF({ orientation: "landscape" });
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
  doc.text(c.full_name.toUpperCase(), 148, 105, { align: "center" });

  doc.setFontSize(12); doc.setFont("helvetica", "normal"); doc.setTextColor(60);
  doc.text("concluiu com aproveitamento o curso de", 148, 120, { align: "center" });
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
  doc.text(`Hoje-ya-Henda, ${new Date(c.issued_at).toLocaleDateString("pt-PT")} · Nº ${c.id}`, 148, 192, { align: "center" });

  doc.save(`certificado-${c.id}.pdf`);
}
