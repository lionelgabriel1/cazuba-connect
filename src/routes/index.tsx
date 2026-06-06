import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import {
  Monitor, Languages, Users, Briefcase, Headphones, Calculator,
  Megaphone, Palette, Sparkles, TrendingUp, CreditCard, Plus,
  Award, ShieldCheck, Clock, GraduationCap, Target, Heart,
  Phone, Mail, MapPin, Star, CheckCircle2, ChevronDown, Menu, X,
} from "lucide-react";
import hero from "@/assets/hero.jpg";
import g1 from "@/assets/g1.jpg";
import g2 from "@/assets/g2.jpg";
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
  { icon: Monitor, name: "Informática", duration: "3 Meses", desc: "Windows, Word, Excel, PowerPoint, Internet e ferramentas digitais." },
  { icon: Languages, name: "Inglês", duration: "3 Meses", desc: "Conversação, gramática, leitura e escrita profissional." },
  { icon: Users, name: "Recursos Humanos", duration: "2 Meses", desc: "Recrutamento, gestão de pessoas e legislação laboral." },
  { icon: Briefcase, name: "Secretariado Executivo", duration: "2 Meses", desc: "Gestão de documentos, agendas e comunicação empresarial." },
  { icon: Headphones, name: "Atendimento ao Público", duration: "1 Mês", desc: "Comunicação, relacionamento com clientes e resolução de conflitos." },
  { icon: Calculator, name: "Contabilidade Geral", duration: "3 Meses", desc: "Lançamentos, balanços e gestão financeira empresarial." },
  { icon: Megaphone, name: "Marketing Digital", duration: "2 Meses", desc: "Redes sociais, anúncios online, branding e vendas." },
  { icon: Palette, name: "Designer Gráfico", duration: "3 Meses", desc: "Photoshop, Illustrator, identidade visual e materiais publicitários." },
  { icon: Sparkles, name: "Manicure e Pedicure", duration: "1 Mês", desc: "Cuidados estéticos, técnicas profissionais e atendimento." },
  { icon: TrendingUp, name: "Gestão Empresarial", duration: "3 Meses", desc: "Planejamento, liderança e empreendedorismo." },
  { icon: CreditCard, name: "Operador de Caixa", duration: "1 Mês", desc: "Operação de caixa, controle financeiro e atendimento." },
  { icon: Plus, name: "Novos Cursos", duration: "Em breve", desc: "Novos programas conforme a procura do mercado." },
];

const benefits = [
  { icon: Award, title: "Certificação Reconhecida", desc: "Receba um certificado válido com QR Code de autenticidade." },
  { icon: GraduationCap, title: "Formadores Qualificados", desc: "Profissionais com experiência real no mercado angolano." },
  { icon: Clock, title: "Horários Flexíveis", desc: "Turmas adaptadas à sua rotina, manhã, tarde e noite." },
  { icon: ShieldCheck, title: "Inscrição 100% Online", desc: "Inscreva-se, pague e acompanhe tudo pelo aplicativo." },
  { icon: Target, title: "Foco em Empregabilidade", desc: "Conteúdos práticos orientados ao que as empresas pedem." },
  { icon: Heart, title: "Acompanhamento Próximo", desc: "Suporte por chat em tempo real durante toda a formação." },
];

const reviews = [
  { name: "Maria Domingos", role: "Aluna de Marketing Digital", text: "Os formadores são excelentes. Em 2 meses comecei a gerir as redes sociais de uma empresa local.", stars: 5 },
  { name: "João Silvério", role: "Aluno de Informática", text: "Aprendi do zero. Hoje uso Excel e Word com confiança no meu novo emprego.", stars: 5 },
  { name: "Esperança Lopes", role: "Aluna de Contabilidade", text: "Conteúdo claro, prático e muito bem organizado. Recomendo a todos.", stars: 5 },
];

const faqs = [
  { q: "Como faço a minha inscrição?", a: "A inscrição pode ser feita online através do nosso aplicativo ou presencialmente nas instalações do centro, no Município do Hoje-ya-Henda." },
  { q: "Os certificados são reconhecidos?", a: "Sim. Todos os certificados emitidos pelo Cazuba possuem QR Code de validação e podem ser verificados online a qualquer momento." },
  { q: "Quais formas de pagamento aceitam?", a: "Aceitamos transferência bancária e referência de pagamento. O comprovativo digital é gerado automaticamente após a confirmação." },
  { q: "Existe apoio durante o curso?", a: "Sim. Disponibilizamos um chat online direto com a equipa de atendimento, com envio de mensagens, áudios, imagens e documentos." },
  { q: "Posso fazer mais de um curso ao mesmo tempo?", a: "Pode. Basta escolher os cursos pretendidos no momento da inscrição e organizamos os horários consigo." },
];

function Index() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Nav />
      <Hero />
      <Benefits />
      <Awards />
      <Courses />
      <WhyUs />
      <Gallery />
      <Reviews />
      <Faq />
      <FinalCta />
      <Footer />
    </div>
  );
}

function Nav() {
  const [open, setOpen] = useState(false);
  const links = [
    { href: "#inicio", label: "Início" },
    { href: "#sobre", label: "Sobre" },
    { href: "#cursos", label: "Cursos" },
    { href: "#galeria", label: "Galeria" },
    { href: "#faq", label: "FAQ" },
    { href: "#contacto", label: "Contacto" },
  ];
  return (
    <header className="sticky top-0 z-50 bg-background/85 backdrop-blur-md border-b border-border">
      <div className="mx-auto max-w-7xl px-5 h-16 flex items-center justify-between">
        <a href="#inicio" className="flex items-center gap-2">
          <div className="size-9 rounded-lg bg-primary text-primary-foreground grid place-items-center font-bold">C</div>
          <div className="leading-tight">
            <div className="font-display font-bold text-primary text-sm">CAZUBA</div>
            <div className="text-[10px] uppercase tracking-widest text-muted-foreground">Centro de Treinamento</div>
          </div>
        </a>
        <nav className="hidden md:flex items-center gap-7 text-sm font-medium">
          {links.map(l => <a key={l.href} href={l.href} className="text-foreground/80 hover:text-primary transition">{l.label}</a>)}
        </nav>
        <a href="#contacto" className="hidden md:inline-flex items-center gap-2 rounded-full bg-gold text-gold-foreground px-5 py-2.5 text-sm font-semibold hover:brightness-105 transition shadow-[var(--shadow-gold)]">
          Inscreva-se
        </a>
        <button className="md:hidden p-2" onClick={() => setOpen(!open)} aria-label="Menu">
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>
      {open && (
        <div className="md:hidden border-t border-border bg-background">
          <div className="px-5 py-4 flex flex-col gap-3">
            {links.map(l => <a key={l.href} href={l.href} onClick={() => setOpen(false)} className="py-1.5 text-foreground/85">{l.label}</a>)}
            <a href="#contacto" onClick={() => setOpen(false)} className="mt-2 inline-flex justify-center rounded-full bg-gold text-gold-foreground px-5 py-2.5 text-sm font-semibold">Inscreva-se</a>
          </div>
        </div>
      )}
    </header>
  );
}

function Hero() {
  return (
    <section id="inicio" className="relative overflow-hidden">
      <div className="absolute inset-0 -z-10" style={{ background: "var(--gradient-hero)" }} />
      <div className="absolute -top-32 -right-32 size-[480px] rounded-full bg-gold/20 blur-3xl -z-10" />
      <div className="mx-auto max-w-7xl px-5 py-16 md:py-24 grid lg:grid-cols-2 gap-12 items-center">
        <div className="text-primary-foreground">
          <span className="inline-flex items-center gap-2 rounded-full bg-white/10 border border-white/20 px-3 py-1 text-xs font-medium backdrop-blur">
            <span className="size-1.5 rounded-full bg-gold" /> Município do Hoje-ya-Henda, Angola
          </span>
          <h1 className="mt-5 text-4xl md:text-6xl font-bold leading-[1.05]">
            Capacitando talentos, <span className="text-gold">construindo futuros.</span>
          </h1>
          <p className="mt-5 text-lg text-white/85 max-w-xl">
            Cursos profissionais modernos, formadores experientes e certificação reconhecida.
            Dê o próximo passo na sua carreira no Cazuba Centro de Treinamento.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <a href="#contacto" className="inline-flex items-center justify-center rounded-full bg-gold text-gold-foreground px-7 py-3.5 font-semibold shadow-[var(--shadow-gold)] hover:brightness-105 transition">
              Inscreva-se agora
            </a>
            <a href="#cursos" className="inline-flex items-center justify-center rounded-full border border-white/30 px-7 py-3.5 font-semibold text-white hover:bg-white/10 transition">
              Ver cursos
            </a>
          </div>
          <div className="mt-10 grid grid-cols-3 gap-6 max-w-md">
            {[
              { k: "11+", v: "Cursos" },
              { k: "100%", v: "Online" },
              { k: "QR", v: "Certificado" },
            ].map(s => (
              <div key={s.v}>
                <div className="text-3xl font-bold text-gold">{s.k}</div>
                <div className="text-xs uppercase tracking-wider text-white/70">{s.v}</div>
              </div>
            ))}
          </div>
        </div>

        <ContactCard />
      </div>
    </section>
  );
}

function ContactCard() {
  const [sent, setSent] = useState(false);
  return (
    <div className="relative">
      <img src={hero} alt="Estudantes em formação no Cazuba" width={1536} height={1024} className="rounded-3xl shadow-2xl object-cover w-full h-80 lg:h-[420px]" />
      <form
        onSubmit={(e) => { e.preventDefault(); setSent(true); }}
        className="mt-[-60px] mx-3 md:mx-8 relative bg-card border border-border rounded-2xl p-6 shadow-[var(--shadow-elegant)]"
      >
        <h3 className="font-display font-bold text-xl text-primary">Peça informações sobre um curso</h3>
        <p className="text-sm text-muted-foreground mt-1">Resposta em menos de 24 horas.</p>
        {sent ? (
          <div className="mt-5 flex items-start gap-3 rounded-xl bg-secondary p-4">
            <CheckCircle2 className="text-primary shrink-0 mt-0.5" />
            <div>
              <div className="font-semibold">Pedido recebido!</div>
              <div className="text-sm text-muted-foreground">Entraremos em contacto consigo brevemente.</div>
            </div>
          </div>
        ) : (
          <div className="mt-4 grid gap-3">
            <input required placeholder="Nome completo" className="rounded-lg border border-input bg-background px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
            <div className="grid grid-cols-2 gap-3">
              <input required type="tel" placeholder="Telefone" className="rounded-lg border border-input bg-background px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
              <select required defaultValue="" className="rounded-lg border border-input bg-background px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring">
                <option value="" disabled>Curso de interesse</option>
                {courses.slice(0, 11).map(c => <option key={c.name}>{c.name}</option>)}
              </select>
            </div>
            <button type="submit" className="mt-1 rounded-lg bg-primary text-primary-foreground py-3 font-semibold hover:brightness-110 transition">
              Quero saber mais
            </button>
          </div>
        )}
      </form>
    </div>
  );
}

function Benefits() {
  return (
    <section id="sobre" className="mx-auto max-w-7xl px-5 py-20 md:py-28">
      <div className="max-w-2xl">
        <span className="text-xs font-bold tracking-[0.2em] text-primary uppercase">Sobre nós</span>
        <h2 className="mt-3 text-3xl md:text-4xl font-bold">Uma formação pensada para o mercado angolano.</h2>
        <p className="mt-4 text-muted-foreground">
          Fundado em 16 de Abril de 2026 por Anselmo Antonio Cazuba Manuel e Eliana Venâncio de Carvalho,
          o Cazuba prepara jovens e adultos com competências reais para o mundo do trabalho.
        </p>
      </div>
      <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {benefits.map(b => (
          <div key={b.title} className="group rounded-2xl border border-border bg-card p-6 hover:border-gold hover:-translate-y-1 transition">
            <div className="size-12 rounded-xl bg-secondary grid place-items-center text-primary group-hover:bg-gold group-hover:text-gold-foreground transition">
              <b.icon size={22} />
            </div>
            <h3 className="mt-5 font-display font-semibold text-lg">{b.title}</h3>
            <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{b.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function Awards() {
  const items = ["Certificação QR", "Excelência 2026", "Inovação Educativa", "Compromisso Social", "Formação Aprovada", "Empregabilidade+"];
  return (
    <section className="bg-secondary py-14 border-y border-border">
      <div className="mx-auto max-w-7xl px-5">
        <p className="text-center text-xs font-bold tracking-[0.25em] text-muted-foreground uppercase">
          Reconhecimentos e selos institucionais
        </p>
        <div className="mt-8 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
          {items.map(i => (
            <div key={i} className="flex flex-col items-center gap-2 text-center">
              <div className="size-16 rounded-full border-2 border-gold/60 bg-card grid place-items-center text-gold shadow-[var(--shadow-gold)]">
                <Award size={26} />
              </div>
              <div className="text-xs font-semibold text-foreground/80">{i}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Courses() {
  return (
    <section id="cursos" className="mx-auto max-w-7xl px-5 py-20 md:py-28">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="max-w-xl">
          <span className="text-xs font-bold tracking-[0.2em] text-primary uppercase">Cursos profissionais</span>
          <h2 className="mt-3 text-3xl md:text-4xl font-bold">Escolha o curso que vai mudar a sua carreira.</h2>
        </div>
        <a href="#contacto" className="text-sm font-semibold text-primary hover:underline">Falar com a equipa →</a>
      </div>
      <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {courses.map(c => (
          <article key={c.name} className="group relative rounded-2xl border border-border bg-card p-6 hover:shadow-[var(--shadow-elegant)] hover:border-primary/40 transition">
            <div className="flex items-center justify-between">
              <div className="size-12 rounded-xl bg-primary text-primary-foreground grid place-items-center">
                <c.icon size={22} />
              </div>
              <span className="text-xs font-semibold text-gold-foreground bg-gold rounded-full px-3 py-1">{c.duration}</span>
            </div>
            <h3 className="mt-5 font-display font-bold text-lg">{c.name}</h3>
            <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{c.desc}</p>
            <a href="#contacto" className="mt-5 inline-flex items-center gap-1 text-sm font-semibold text-primary group-hover:gap-2 transition-all">
              Inscrever-se →
            </a>
          </article>
        ))}
      </div>
    </section>
  );
}

function WhyUs() {
  const points = [
    "Visão: Ser referência nacional na formação profissional.",
    "Missão: Formar profissionais qualificados e prontos para o mercado.",
    "Valores: Excelência, Ética, Inovação e Responsabilidade Social.",
    "Objetivo: Aumentar empregabilidade e incentivar empreendedorismo.",
  ];
  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 -z-10" style={{ background: "var(--gradient-hero)" }} />
      <div className="mx-auto max-w-7xl px-5 py-20 md:py-28 grid lg:grid-cols-2 gap-12 items-center text-primary-foreground">
        <div>
          <span className="text-xs font-bold tracking-[0.2em] text-gold uppercase">Por que o Cazuba</span>
          <h2 className="mt-3 text-3xl md:text-4xl font-bold">Mais do que aulas. Uma ponte para o emprego.</h2>
          <p className="mt-4 text-white/80 max-w-lg">
            Construímos cada programa com base em três pilares: conhecimento prático, formadores experientes
            e acompanhamento próximo até à colocação profissional.
          </p>
          <ul className="mt-8 space-y-3">
            {points.map(p => (
              <li key={p} className="flex gap-3">
                <CheckCircle2 className="text-gold shrink-0 mt-0.5" size={20} />
                <span className="text-white/90">{p}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <img src={g1} alt="Estudantes em colaboração" loading="lazy" width={1024} height={1024} className="rounded-2xl object-cover h-48 md:h-64 w-full translate-y-6" />
          <img src={g2} alt="Formador em sala de aula" loading="lazy" width={1024} height={1024} className="rounded-2xl object-cover h-48 md:h-64 w-full" />
          <img src={g4} alt="Aula de informática" loading="lazy" width={1024} height={1024} className="rounded-2xl object-cover h-48 md:h-64 w-full" />
          <img src={g3} alt="Formandos a receber certificados" loading="lazy" width={1024} height={1024} className="rounded-2xl object-cover h-48 md:h-64 w-full translate-y-6" />
        </div>
      </div>
    </section>
  );
}

function Gallery() {
  const imgs = [g1, g2, g3, g4, hero, g1];
  return (
    <section id="galeria" className="mx-auto max-w-7xl px-5 py-20 md:py-28">
      <div className="text-center max-w-xl mx-auto">
        <span className="text-xs font-bold tracking-[0.2em] text-primary uppercase">Galeria</span>
        <h2 className="mt-3 text-3xl md:text-4xl font-bold">O Cazuba por dentro.</h2>
        <p className="mt-4 text-muted-foreground">Momentos de formação, conquista e celebração.</p>
      </div>
      <div className="mt-12 grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
        {imgs.map((src, i) => (
          <img key={i} src={src} alt={`Galeria Cazuba ${i + 1}`} loading="lazy" width={1024} height={1024}
            className={`rounded-2xl object-cover w-full ${i % 5 === 0 ? "h-72 md:h-96" : "h-48 md:h-64"} hover:scale-[1.02] transition`} />
        ))}
      </div>
    </section>
  );
}

function Reviews() {
  return (
    <section className="bg-secondary py-20 md:py-28 border-y border-border">
      <div className="mx-auto max-w-7xl px-5">
        <div className="text-center max-w-xl mx-auto">
          <span className="text-xs font-bold tracking-[0.2em] text-primary uppercase">Depoimentos</span>
          <h2 className="mt-3 text-3xl md:text-4xl font-bold">Histórias reais de quem se formou connosco.</h2>
        </div>
        <div className="mt-12 grid md:grid-cols-3 gap-5">
          {reviews.map(r => (
            <figure key={r.name} className="rounded-2xl bg-card border border-border p-7 shadow-sm">
              <div className="flex gap-0.5 text-gold">
                {Array.from({ length: r.stars }).map((_, i) => <Star key={i} size={18} fill="currentColor" />)}
              </div>
              <blockquote className="mt-4 text-foreground/90 leading-relaxed">"{r.text}"</blockquote>
              <figcaption className="mt-5 flex items-center gap-3">
                <div className="size-10 rounded-full bg-primary text-primary-foreground grid place-items-center font-semibold">
                  {r.name.split(" ").map(n => n[0]).slice(0, 2).join("")}
                </div>
                <div>
                  <div className="font-semibold text-sm">{r.name}</div>
                  <div className="text-xs text-muted-foreground">{r.role}</div>
                </div>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}

function Faq() {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <section id="faq" className="mx-auto max-w-3xl px-5 py-20 md:py-28">
      <div className="text-center">
        <span className="text-xs font-bold tracking-[0.2em] text-primary uppercase">Perguntas frequentes</span>
        <h2 className="mt-3 text-3xl md:text-4xl font-bold">Tudo o que precisa de saber.</h2>
      </div>
      <div className="mt-10 divide-y divide-border border border-border rounded-2xl bg-card">
        {faqs.map((f, i) => (
          <div key={f.q} className="p-2">
            <button onClick={() => setOpen(open === i ? null : i)} className="w-full flex items-center justify-between text-left p-4 font-semibold">
              <span>{f.q}</span>
              <ChevronDown className={`transition ${open === i ? "rotate-180 text-gold" : "text-muted-foreground"}`} size={20} />
            </button>
            {open === i && <div className="px-4 pb-5 text-muted-foreground text-sm leading-relaxed">{f.a}</div>}
          </div>
        ))}
      </div>
    </section>
  );
}

function FinalCta() {
  return (
    <section id="contacto" className="mx-auto max-w-7xl px-5 py-16">
      <div className="relative overflow-hidden rounded-3xl p-10 md:p-16 text-center" style={{ background: "var(--gradient-hero)" }}>
        <div className="absolute -bottom-24 -left-24 size-80 rounded-full bg-gold/25 blur-3xl" />
        <div className="absolute -top-24 -right-24 size-80 rounded-full bg-white/10 blur-3xl" />
        <div className="relative">
          <h2 className="text-3xl md:text-5xl font-bold text-primary-foreground max-w-3xl mx-auto">
            Pronto para começar a sua jornada profissional?
          </h2>
          <p className="mt-4 text-white/85 max-w-xl mx-auto">
            Inscreva-se hoje e dê o primeiro passo rumo à carreira que sempre quis.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <a href="tel:+244938747141" className="inline-flex items-center gap-2 rounded-full bg-gold text-gold-foreground px-7 py-3.5 font-semibold shadow-[var(--shadow-gold)] hover:brightness-105 transition">
              <Phone size={18} /> 938 747 141
            </a>
            <a href="mailto:contato@cazubatreinamento.com" className="inline-flex items-center gap-2 rounded-full border border-white/30 px-7 py-3.5 font-semibold text-white hover:bg-white/10 transition">
              <Mail size={18} /> Enviar e-mail
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="bg-primary text-primary-foreground">
      <div className="mx-auto max-w-7xl px-5 py-14 grid md:grid-cols-4 gap-10">
        <div className="md:col-span-2">
          <div className="flex items-center gap-2">
            <div className="size-10 rounded-lg bg-gold text-gold-foreground grid place-items-center font-bold">C</div>
            <div>
              <div className="font-display font-bold">CAZUBA</div>
              <div className="text-[10px] uppercase tracking-widest text-white/70">Centro de Treinamento</div>
            </div>
          </div>
          <p className="mt-4 text-white/75 max-w-sm">Capacitando talentos, construindo futuros.</p>
        </div>
        <div>
          <h4 className="font-display font-semibold text-gold mb-3">Contactos</h4>
          <ul className="space-y-2 text-sm text-white/85">
            <li className="flex items-center gap-2"><MapPin size={16} className="text-gold" /> Município do Hoje-ya-Henda</li>
            <li className="flex items-center gap-2"><Phone size={16} className="text-gold" /> 938 747 141</li>
            <li className="flex items-center gap-2"><Phone size={16} className="text-gold" /> 927 639 802</li>
            <li className="flex items-center gap-2"><Mail size={16} className="text-gold" /> contato@cazubatreinamento.com</li>
          </ul>
        </div>
        <div>
          <h4 className="font-display font-semibold text-gold mb-3">Navegação</h4>
          <ul className="space-y-2 text-sm text-white/85">
            <li><a href="#sobre" className="hover:text-gold">Sobre nós</a></li>
            <li><a href="#cursos" className="hover:text-gold">Cursos</a></li>
            <li><a href="#galeria" className="hover:text-gold">Galeria</a></li>
            <li><a href="#faq" className="hover:text-gold">FAQ</a></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="mx-auto max-w-7xl px-5 py-5 text-xs text-white/70 flex flex-wrap justify-between gap-2">
          <span>© 2026 Cazuba Centro de Treinamento. Todos os direitos reservados.</span>
          <span>Hoje-ya-Henda, Angola</span>
        </div>
      </div>
    </footer>
  );
}
