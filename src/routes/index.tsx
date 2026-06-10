import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import {
  Monitor, Languages, Users, Briefcase, Headphones, Calculator,
  Megaphone, Palette, Sparkles, TrendingUp, CreditCard,
  Award, Phone, Mail, MapPin, Star, ChevronDown, Menu, X,
  MessageCircle, Send, QrCode, Smartphone, Lock, ChevronLeft, ChevronRight,
} from "lucide-react";
import hero from "@/assets/hero.jpg";
import g1 from "@/assets/g1.jpg";
import g3 from "@/assets/g3.jpg";
import g4 from "@/assets/g4.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Cazuba Centro de Treinamento — Formação Profissional em Angola" },
      { name: "description", content: "Capacitando talentos, construindo futuros. Cursos profissionais reconhecidos no Município do Hoje-ya-Henda." },
      { property: "og:title", content: "Cazuba Centro de Treinamento" },
      { property: "og:description", content: "Capacitando talentos, construindo futuros." },
    ],
  }),
  component: Index,
});

const courses = [
  { icon: Monitor, name: "Informática", duration: "3 Meses", desc: "Windows, Word, Excel, PowerPoint e ferramentas digitais essenciais para o mercado.", tag: "MAIS PROCURADO" },
  { icon: Megaphone, name: "Marketing Digital", duration: "2 Meses", desc: "Redes sociais, anúncios online, branding e vendas para o mercado angolano.", tag: "INÍCIO: PRÓXIMA SEMANA" },
  { icon: Headphones, name: "Atendimento ao Público", duration: "2 Meses", desc: "Comunicação, relacionamento com clientes e excelência no atendimento.", tag: null },
  { icon: Calculator, name: "Contabilidade Geral", duration: "3 Meses", desc: "Lançamentos, balanços e gestão financeira aplicada à realidade empresarial.", tag: null },
  { icon: Languages, name: "Inglês", duration: "3 Meses", desc: "Conversação, gramática, leitura e escrita profissional do nível básico ao intermédio.", tag: null },
  { icon: Users, name: "Recursos Humanos", duration: "2 Meses", desc: "Recrutamento, gestão de pessoas e legislação laboral angolana.", tag: null },
  { icon: Briefcase, name: "Secretariado Executivo", duration: "2 Meses", desc: "Gestão de documentos, agendas e comunicação empresarial.", tag: null },
  { icon: Palette, name: "Designer Gráfico", duration: "3 Meses", desc: "Photoshop, Illustrator e produção de materiais publicitários.", tag: null },
  { icon: TrendingUp, name: "Gestão Empresarial", duration: "3 Meses", desc: "Planeamento, liderança e empreendedorismo aplicado.", tag: null },
  { icon: CreditCard, name: "Operador de Caixa", duration: "1 Mês", desc: "Operação de caixa, controle financeiro e atendimento ágil.", tag: null },
  { icon: Sparkles, name: "Manicure e Pedicure", duration: "1 Mês", desc: "Cuidados estéticos, técnicas profissionais e atendimento.", tag: null },
];

const reviews = [
  { name: "Eliana Cassule", role: "Aluna de Marketing Digital", text: "Conhecimento sólido e formadores extremamente dedicados. Em 2 meses comecei a gerir as redes de uma empresa local.", stars: 5 },
  { name: "Gerson Pinto", role: "Aluno de Informática", text: "Excelente metodologia. Aprendi do zero e hoje uso Excel e Word com confiança no meu novo emprego.", stars: 5 },
  { name: "Esperança Lopes", role: "Aluna de Contabilidade", text: "Conteúdo claro, prático e muito bem organizado. Recomendo a todos os jovens angolanos.", stars: 5 },
];

const faqs = [
  { q: "Como faço a minha inscrição?", a: "A inscrição pode ser feita online através do nosso aplicativo ou presencialmente nas instalações do centro, no Município do Hoje-ya-Henda." },
  { q: "Os certificados são reconhecidos?", a: "Sim. Todos os certificados possuem QR Code de validação e podem ser verificados online a qualquer momento." },
  { q: "Quais formas de pagamento aceitam?", a: "Aceitamos transferência bancária e referência de pagamento. O comprovativo digital é gerado automaticamente após a confirmação." },
  { q: "Existe apoio durante o curso?", a: "Sim. Disponibilizamos chat online direto com a equipa de atendimento, com mensagens, áudios, imagens e documentos." },
];

function Index() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Nav />
      <Hero />
      <UrgencyBanner />
      <About />
      <Courses />
      <SocialProof />
      <Reviews />
      <AppSection />
      <Faq />
      <Footer />
      <ChatWidget />
    </div>
  );
}

/* ---------------- NAV ---------------- */
function Nav() {
  const [open, setOpen] = useState(false);
  const links = [
    { href: "#inicio", label: "Início" },
    { href: "#sobre", label: "Sobre Nós" },
    { href: "#cursos", label: "Cursos" },
    { href: "#contacto", label: "Contactos" },
  ];
  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-border shadow-sm">
      <div className="mx-auto max-w-7xl px-5 h-16 flex items-center justify-between">
        <a href="#inicio" className="flex items-center gap-2.5">
          <div className="size-10 rounded-full bg-primary text-gold grid place-items-center font-display font-extrabold border-2 border-gold">C</div>
          <div className="leading-tight">
            <div className="font-display font-extrabold text-primary text-base tracking-tight">CAZUBA</div>
            <div className="text-[9px] uppercase tracking-[0.15em] text-muted-foreground font-semibold">Centro de Treinamento</div>
          </div>
        </a>
        <nav className="hidden md:flex items-center gap-8 text-sm font-semibold">
          {links.map(l => (
            <a key={l.href} href={l.href} className="text-foreground/85 hover:text-primary transition relative after:absolute after:left-0 after:-bottom-1 after:h-0.5 after:w-0 after:bg-gold hover:after:w-full after:transition-all">
              {l.label}
            </a>
          ))}
        </nav>
        <div className="hidden md:flex items-center gap-3">
          <Link to="/inscricao" className="inline-flex items-center gap-2 rounded-full border-2 border-primary text-primary px-5 py-2 text-sm font-bold hover:bg-primary hover:text-primary-foreground transition">
            Inscrição
          </Link>
          <Link to="/aluno" className="inline-flex items-center gap-2 rounded-full bg-gold text-gold-foreground px-5 py-2.5 text-sm font-bold hover:brightness-105 transition shadow-[var(--shadow-gold)]">
            Área do Aluno
          </Link>
        </div>
        <button className="md:hidden p-2 text-primary" onClick={() => setOpen(!open)} aria-label="Menu">
          {open ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>
      {open && (
        <div className="md:hidden border-t border-border bg-white">
          <div className="px-5 py-4 flex flex-col gap-3">
            {links.map(l => <a key={l.href} href={l.href} onClick={() => setOpen(false)} className="py-1.5 text-foreground/85 font-medium">{l.label}</a>)}
            <Link to="/inscricao" onClick={() => setOpen(false)} className="mt-2 inline-flex justify-center rounded-full border-2 border-primary text-primary px-5 py-2 text-sm font-bold">Inscrição</Link>
            <Link to="/aluno" onClick={() => setOpen(false)} className="inline-flex justify-center rounded-full bg-gold text-gold-foreground px-5 py-2.5 text-sm font-bold">Área do Aluno</Link>
          </div>
        </div>
      )}
    </header>
  );
}

/* ---------------- HERO ---------------- */
function Hero() {
  return (
    <section id="inicio" className="relative overflow-hidden">
      <div className="absolute inset-0">
        <img src={hero} alt="Estudantes em formação no Cazuba" width={1920} height={1080} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-br from-primary/80 via-primary/65 to-primary/85" />
      </div>
      <div className="relative mx-auto max-w-7xl px-5 py-24 md:py-36 text-center text-primary-foreground">
        <h1 className="font-display text-4xl md:text-6xl lg:text-7xl font-extrabold leading-[1.05] drop-shadow-lg">
          CAZUBA CENTRO DE<br />TREINAMENTO
        </h1>
        <p className="mt-6 text-lg md:text-2xl text-white/90 font-light">
          Capacitando talentos, construindo futuros.
        </p>
        <div className="mt-10 flex flex-col items-center gap-4">
          <a href="#cursos" className="inline-flex items-center justify-center rounded-full bg-primary/70 border-2 border-gold text-white px-8 py-3.5 text-sm md:text-base font-bold tracking-wide hover:bg-gold hover:text-gold-foreground transition shadow-[var(--shadow-gold)]">
            CONHEÇA NOSSOS CURSOS
          </a>
          <Link to="/inscricao" className="inline-flex items-center justify-center rounded-full bg-gold text-gold-foreground px-8 py-3 text-sm md:text-base font-extrabold tracking-wide hover:brightness-105 transition">
            INSCREVA-SE AGORA
          </Link>
        </div>
      </div>
    </section>
  );
}

/* ---------------- URGENCY BANNER ---------------- */
function UrgencyBanner() {
  return (
    <div className="bg-gold text-gold-foreground py-3 overflow-hidden border-y-2 border-primary/10">
      <div className="text-center font-bold text-sm md:text-base tracking-wide animate-pulse">
        ⚡ Vagas Limitadas para Julho! Garanta já a sua matrícula ⚡
      </div>
    </div>
  );
}

/* ---------------- ABOUT ---------------- */
function About() {
  const founders = [
    { name: "Anselmo A. C. Manuel", role: "Fundador", initial: "A", color: "bg-primary" },
    { name: "Eliana V. de Carvalho", role: "Fundadora", initial: "E", color: "bg-gold" },
  ];
  return (
    <section id="sobre" className="bg-secondary py-20 md:py-24">
      <div className="mx-auto max-w-6xl px-5">
        <div className="text-center">
          <h2 className="font-display text-3xl md:text-4xl font-extrabold text-primary">Sobre Nós</h2>
          <div className="mt-3 mx-auto h-1 w-16 rounded-full bg-gold" />
        </div>

        <div className="mt-12 grid md:grid-cols-12 gap-8 items-center">
          {/* Founders */}
          <div className="md:col-span-5 grid grid-cols-2 gap-5">
            {founders.map(f => (
              <figure key={f.name} className="text-center">
                <div className={`mx-auto size-32 md:size-40 rounded-2xl ${f.color} grid place-items-center text-white font-display font-extrabold text-5xl shadow-[var(--shadow-elegant)] border-4 border-white`}>
                  {f.initial}
                </div>
                <figcaption className="mt-4">
                  <div className="font-semibold text-foreground">{f.name}</div>
                  <div className="text-xs text-muted-foreground uppercase tracking-widest mt-0.5">{f.role}</div>
                </figcaption>
              </figure>
            ))}
          </div>

          {/* Text */}
          <div className="md:col-span-5 text-foreground/85 leading-relaxed">
            <p>
              O <strong className="text-primary">Cazuba Centro de Treinamento</strong> é uma instituição
              dedicada à formação profissional e ao desenvolvimento de competências para o mercado de trabalho.
            </p>
            <p className="mt-4">
              Trabalhamos para oferecer ensino de qualidade, formando profissionais preparados para enfrentar
              os desafios do mundo moderno em Angola e além.
            </p>
            <p className="mt-4 text-sm text-muted-foreground">
              Fundado em 16 de Abril de 2026 por Anselmo Antonio Cazuba Manuel e Eliana Venâncio de Carvalho.
            </p>
          </div>

          {/* Badge */}
          <div className="md:col-span-2 flex justify-center">
            <div className="relative size-32 md:size-36 rounded-full bg-white border-4 border-gold grid place-items-center text-center shadow-[var(--shadow-gold)]">
              <Award className="absolute -top-3 size-8 text-gold fill-gold" />
              <div>
                <div className="text-[9px] font-bold tracking-widest text-primary">FUNDADO EM</div>
                <div className="font-display font-extrabold text-primary text-xl leading-none mt-1">LUANDA</div>
                <div className="font-display font-extrabold text-gold text-2xl">2026</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------------- COURSES ---------------- */
function Courses() {
  return (
    <section id="cursos" className="mx-auto max-w-7xl px-5 py-20 md:py-24">
      <div className="text-center">
        <h2 className="font-display text-3xl md:text-4xl font-extrabold text-primary">Cursos Profissionais</h2>
        <div className="mt-3 mx-auto h-1 w-16 rounded-full bg-gold" />
      </div>
      <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {courses.map(c => (
          <article key={c.name} className="relative rounded-2xl border-2 border-border bg-card p-6 hover:border-gold hover:-translate-y-1 hover:shadow-[var(--shadow-elegant)] transition group">
            {c.tag && (
              <span className={`absolute -top-3 left-6 rounded-full px-3 py-1 text-[10px] font-extrabold tracking-wider ${c.tag === "MAIS PROCURADO" ? "bg-gold text-gold-foreground" : "bg-primary text-primary-foreground"}`}>
                {c.tag}
              </span>
            )}
            <div className="size-14 rounded-xl bg-primary text-gold grid place-items-center">
              <c.icon size={26} />
            </div>
            <h3 className="mt-4 font-display font-extrabold text-lg text-foreground">{c.name}</h3>
            <p className="text-xs font-bold text-primary mt-1">Duração: {c.duration}</p>
            <p className="mt-3 text-sm text-muted-foreground leading-relaxed">{c.desc}</p>
            <Link to="/inscricao" className="mt-5 inline-flex w-full items-center justify-center rounded-lg bg-gold text-gold-foreground px-4 py-2.5 text-xs font-extrabold tracking-wide hover:brightness-105 transition">
              Saiba Mais & Inscrição
            </Link>
          </article>
        ))}
      </div>
    </section>
  );
}

/* ---------------- SOCIAL PROOF / URGENCY ---------------- */
function SocialProof() {
  const stats = [
    { k: "90%", v: "Empregabilidade", img: g3 },
    { k: "500+", v: "Alunos Formados", img: g1 },
    { k: "100%", v: "Cursos Práticos", img: g4 },
  ];
  return (
    <section className="bg-secondary py-20 md:py-24">
      <div className="mx-auto max-w-6xl px-5">
        <div className="text-center">
          <h2 className="font-display text-3xl md:text-4xl font-extrabold text-primary">Urgência & Prova Social</h2>
          <div className="mt-3 mx-auto h-1 w-16 rounded-full bg-gold" />
        </div>

        <div className="mt-10 space-y-3">
          <div className="rounded-full bg-primary text-primary-foreground py-3 text-center font-bold text-sm tracking-wide">
            ÚLTIMAS VAGAS: TURMAS DE MANHÃ A ESGOTAR!
          </div>
          <div className="rounded-full bg-gold text-gold-foreground py-3 text-center font-bold text-sm tracking-wide">
            INSCRIÇÕES ABERTAS — CERTIFICADO RECONHECIDO
          </div>
        </div>

        <div className="mt-10 grid grid-cols-1 sm:grid-cols-3 gap-5">
          {stats.map(s => (
            <div key={s.v} className="relative overflow-hidden rounded-2xl border-2 border-gold/40 aspect-[4/5] shadow-[var(--shadow-elegant)]">
              <img src={s.img} alt={s.v} loading="lazy" width={800} height={1000} className="absolute inset-0 w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-b from-primary/30 via-primary/40 to-primary/85" />
              <div className="absolute inset-0 p-5 flex flex-col justify-end text-center">
                <div className="font-display text-5xl md:text-6xl font-extrabold text-gold drop-shadow-lg">{s.k}</div>
                <div className="mt-1 text-white font-bold text-sm uppercase tracking-widest">{s.v}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------------- REVIEWS ---------------- */
function Reviews() {
  const [idx, setIdx] = useState(0);
  const r = reviews[idx];
  return (
    <section className="mx-auto max-w-3xl px-5 py-20 md:py-24">
      <div className="text-center">
        <h2 className="font-display text-3xl md:text-4xl font-extrabold text-primary">Depoimentos</h2>
        <div className="mt-3 mx-auto h-1 w-16 rounded-full bg-gold" />
      </div>
      <figure className="mt-10 rounded-2xl bg-card border-2 border-border p-8 shadow-sm">
        <div className="flex gap-0.5 text-gold justify-center">
          {Array.from({ length: r.stars }).map((_, i) => <Star key={i} size={18} fill="currentColor" />)}
        </div>
        <blockquote className="mt-4 text-center text-foreground/90 italic leading-relaxed">"{r.text}"</blockquote>
        <figcaption className="mt-6 flex items-center justify-center gap-3">
          <div className="size-12 rounded-full bg-primary text-gold grid place-items-center font-bold">
            {r.name.split(" ").map(n => n[0]).slice(0, 2).join("")}
          </div>
          <div className="text-left">
            <div className="font-semibold text-sm">{r.name}</div>
            <div className="text-xs text-muted-foreground">{r.role}</div>
          </div>
        </figcaption>
      </figure>
      <div className="mt-6 flex items-center justify-center gap-4">
        <button onClick={() => setIdx((idx - 1 + reviews.length) % reviews.length)} className="size-10 rounded-full border border-border grid place-items-center hover:bg-secondary transition" aria-label="Anterior">
          <ChevronLeft size={18} />
        </button>
        <div className="flex gap-2">
          {reviews.map((_, i) => (
            <button key={i} onClick={() => setIdx(i)} className={`size-2 rounded-full transition ${i === idx ? "bg-gold w-6" : "bg-border"}`} aria-label={`Ir para depoimento ${i + 1}`} />
          ))}
        </div>
        <button onClick={() => setIdx((idx + 1) % reviews.length)} className="size-10 rounded-full border border-border grid place-items-center hover:bg-secondary transition" aria-label="Próximo">
          <ChevronRight size={18} />
        </button>
      </div>
    </section>
  );
}

/* ---------------- APP SECTION ---------------- */
function AppSection() {
  return (
    <section className="bg-secondary py-20 md:py-24">
      <div className="mx-auto max-w-5xl px-5">
        <div className="text-center">
          <h2 className="font-display text-3xl md:text-4xl font-extrabold text-primary">App do Aluno</h2>
          <div className="mt-3 mx-auto h-1 w-16 rounded-full bg-gold" />
          <p className="mt-4 text-muted-foreground max-w-xl mx-auto">
            Inscreva-se, pague, acompanhe as aulas e baixe o seu certificado — tudo na palma da mão.
          </p>
        </div>

        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-10 justify-items-center">
          <PhoneMock title="Mobile Login">
            <div className="flex flex-col items-center gap-3 px-5 pt-8">
              <div className="size-12 rounded-full bg-primary text-gold grid place-items-center font-display font-extrabold border-2 border-gold">C</div>
              <div className="font-display font-extrabold text-primary text-sm">CAZUBA</div>
              <div className="w-full space-y-2 mt-3">
                <div className="h-9 rounded-md bg-secondary border border-border px-3 flex items-center text-[10px] text-muted-foreground"><Mail size={11} className="mr-2" /> aluno@cazuba.ao</div>
                <div className="h-9 rounded-md bg-secondary border border-border px-3 flex items-center text-[10px] text-muted-foreground"><Lock size={11} className="mr-2" /> ••••••••</div>
                <button className="w-full h-9 rounded-md bg-gold text-gold-foreground text-[10px] font-extrabold">ENTRAR</button>
              </div>
              <div className="text-[9px] text-muted-foreground mt-2">Esqueci a minha senha</div>
            </div>
          </PhoneMock>

          <PhoneMock title="Mobile Certificate">
            <div className="flex flex-col items-center gap-2 px-4 pt-6">
              <div className="text-[9px] uppercase tracking-widest text-primary font-bold">Certificado</div>
              <div className="font-display font-extrabold text-primary text-xs text-center leading-tight">CAZUBA<br />CENTRO DE TREINAMENTO</div>
              <div className="mt-2 size-24 rounded-md bg-white border-2 border-primary p-2 grid place-items-center">
                <QrCode size={72} strokeWidth={1.2} className="text-primary" />
              </div>
              <div className="text-[8px] text-muted-foreground text-center mt-2">Validação online por QR Code</div>
              <button className="mt-2 w-full h-8 rounded-md bg-primary text-primary-foreground text-[10px] font-extrabold">Baixar PDF</button>
            </div>
          </PhoneMock>
        </div>
      </div>
    </section>
  );
}

function PhoneMock({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="text-center">
      <div className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-3">{title}</div>
      <div className="relative w-[200px] h-[400px] rounded-[2rem] bg-foreground p-2 shadow-[var(--shadow-elegant)]">
        <div className="absolute top-2 left-1/2 -translate-x-1/2 w-20 h-4 rounded-b-2xl bg-foreground z-10" />
        <div className="w-full h-full rounded-[1.5rem] bg-white overflow-hidden relative">
          <div className="h-6 bg-secondary flex items-center justify-center">
            <Smartphone size={10} className="text-muted-foreground" />
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}

/* ---------------- FAQ ---------------- */
function Faq() {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <section className="mx-auto max-w-3xl px-5 py-20 md:py-24">
      <div className="text-center">
        <h2 className="font-display text-3xl md:text-4xl font-extrabold text-primary">Perguntas Frequentes</h2>
        <div className="mt-3 mx-auto h-1 w-16 rounded-full bg-gold" />
      </div>
      <div className="mt-10 divide-y divide-border border-2 border-border rounded-2xl bg-card overflow-hidden">
        {faqs.map((f, i) => (
          <div key={f.q}>
            <button onClick={() => setOpen(open === i ? null : i)} className="w-full flex items-center justify-between text-left p-5 font-semibold hover:bg-secondary/60 transition">
              <span>{f.q}</span>
              <ChevronDown className={`transition ${open === i ? "rotate-180 text-gold" : "text-muted-foreground"}`} size={20} />
            </button>
            {open === i && <div className="px-5 pb-5 text-muted-foreground text-sm leading-relaxed">{f.a}</div>}
          </div>
        ))}
      </div>
    </section>
  );
}

/* ---------------- FOOTER ---------------- */
function Footer() {
  return (
    <footer id="contacto" className="bg-primary text-primary-foreground">
      <div className="mx-auto max-w-7xl px-5 py-14 grid md:grid-cols-3 gap-10">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="size-11 rounded-full bg-white text-primary grid place-items-center font-display font-extrabold border-2 border-gold">C</div>
            <div>
              <div className="font-display font-extrabold text-lg">CAZUBA</div>
              <div className="text-[10px] uppercase tracking-widest text-gold font-semibold">Centro de Treinamento</div>
            </div>
          </div>
          <p className="mt-4 text-white/80 max-w-sm italic">Capacitando talentos, construindo futuros.</p>
        </div>
        <div>
          <h4 className="font-display font-bold text-gold mb-4 uppercase tracking-wider text-sm">Contactos</h4>
          <ul className="space-y-3 text-sm text-white/90">
            <li className="flex items-center gap-2"><Phone size={16} className="text-gold" /> 938 747 141</li>
            <li className="flex items-center gap-2"><Phone size={16} className="text-gold" /> 927 639 802</li>
            <li className="flex items-center gap-2"><Mail size={16} className="text-gold" /> contato@cazubatreinamento.com</li>
            <li className="flex items-start gap-2"><MapPin size={16} className="text-gold mt-0.5 shrink-0" /> Município do Hoje-ya-Henda, Luanda — Angola</li>
          </ul>
        </div>
        <div>
          <h4 className="font-display font-bold text-gold mb-4 uppercase tracking-wider text-sm">Navegação</h4>
          <ul className="grid grid-cols-2 gap-y-2 text-sm text-white/90">
            <li><a href="#inicio" className="hover:text-gold">Início</a></li>
            <li><a href="#sobre" className="hover:text-gold">Sobre Nós</a></li>
            <li><a href="#cursos" className="hover:text-gold">Cursos</a></li>
            <li><a href="#contacto" className="hover:text-gold">Contactos</a></li>
            <li><a href="#login" className="hover:text-gold">Inscrição</a></li>
            <li><a href="#login" className="hover:text-gold">Pagamentos</a></li>
            <li><a href="#login" className="hover:text-gold">Certificados</a></li>
            <li><a href="#chat" className="hover:text-gold">Chat Online</a></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="mx-auto max-w-7xl px-5 py-5 text-xs text-white/70 text-center">
          © 2026 Cazuba Centro de Treinamento. Todos os direitos reservados.
        </div>
      </div>
    </footer>
  );
}

/* ---------------- CHAT WIDGET ---------------- */
function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [msg, setMsg] = useState("");
  const [messages, setMessages] = useState([
    { from: "bot", text: "Olá! Bem-vindo ao Cazuba. Como podemos ajudar?" },
  ]);
  const send = () => {
    if (!msg.trim()) return;
    setMessages([...messages, { from: "user", text: msg }, { from: "bot", text: "Obrigado! Um atendente entrará em contacto consigo brevemente." }]);
    setMsg("");
  };

  return (
    <div className="fixed bottom-5 right-5 z-50">
      {open && (
        <div className="mb-3 w-[300px] rounded-2xl bg-card border-2 border-border shadow-[var(--shadow-elegant)] overflow-hidden">
          <div className="bg-primary text-primary-foreground p-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="size-8 rounded-full bg-gold text-gold-foreground grid place-items-center"><MessageCircle size={16} /></div>
              <div>
                <div className="text-sm font-bold">Chat Online</div>
                <div className="text-[10px] text-white/70">Atendimento Cazuba</div>
              </div>
            </div>
            <button onClick={() => setOpen(false)} aria-label="Fechar"><X size={18} /></button>
          </div>
          <div className="p-3 max-h-64 overflow-y-auto space-y-2 bg-secondary/50">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.from === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[80%] rounded-2xl px-3 py-2 text-xs ${m.from === "user" ? "bg-primary text-primary-foreground" : "bg-white border border-border"}`}>
                  {m.text}
                </div>
              </div>
            ))}
          </div>
          <form onSubmit={e => { e.preventDefault(); send(); }} className="border-t border-border p-2 flex gap-2">
            <input value={msg} onChange={e => setMsg(e.target.value)} placeholder="Escreva uma mensagem..." className="flex-1 rounded-full bg-secondary px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-ring" />
            <button type="submit" className="size-9 rounded-full bg-gold text-gold-foreground grid place-items-center" aria-label="Enviar"><Send size={14} /></button>
          </form>
        </div>
      )}
      <button onClick={() => setOpen(!open)} className="size-14 rounded-full bg-gold text-gold-foreground grid place-items-center shadow-[var(--shadow-gold)] hover:scale-105 transition" aria-label="Abrir chat">
        {open ? <X size={22} /> : <MessageCircle size={24} />}
      </button>
    </div>
  );
}


