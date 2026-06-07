import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";

export function PageShell({ title, subtitle, children, actions }: { title: string; subtitle?: string; children: ReactNode; actions?: ReactNode }) {
  return (
    <div className="min-h-screen bg-[#F5F5F5]">
      <header className="bg-white border-b border-border shadow-sm">
        <div className="mx-auto max-w-7xl px-5 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="size-10 rounded-full bg-primary text-gold grid place-items-center font-display font-extrabold border-2 border-gold">C</div>
            <div className="leading-tight">
              <div className="font-display font-extrabold text-primary text-base tracking-tight">CAZUBA</div>
              <div className="text-[9px] uppercase tracking-[0.15em] text-muted-foreground font-semibold">Centro de Treinamento</div>
            </div>
          </Link>
          <nav className="flex items-center gap-2 text-sm font-semibold">
            <Link to="/" className="px-3 py-2 text-primary hover:underline">Início</Link>
            <Link to="/inscricao" className="px-3 py-2 rounded-full border-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground transition">Inscrever-se</Link>
            <Link to="/aluno" className="px-3 py-2 rounded-full bg-gold text-gold-foreground font-bold hover:brightness-105">Área do Aluno</Link>
          </nav>
        </div>
      </header>
      <section className="bg-gradient-to-br from-primary to-[#1565C0] text-white">
        <div className="mx-auto max-w-7xl px-5 py-10 flex flex-wrap items-end gap-4 justify-between">
          <div>
            <h1 className="font-display text-3xl md:text-4xl font-extrabold">{title}</h1>
            {subtitle && <p className="mt-2 text-white/85 max-w-2xl">{subtitle}</p>}
          </div>
          {actions}
        </div>
      </section>
      <main className="mx-auto max-w-7xl px-5 py-10">{children}</main>
      <footer className="border-t border-border bg-white py-6 mt-10 text-center text-xs text-muted-foreground">
        © 2026 Cazuba Centro de Treinamento — Capacitando talentos, construindo futuros.
      </footer>
    </div>
  );
}
