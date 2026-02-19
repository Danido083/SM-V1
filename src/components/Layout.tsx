/**
 * @file src/components/Layout.tsx
 * @description Componente de layout principal: Header + Footer.
 * Responsabilidade única: estrutura visual/navegacional da página.
 * O App.tsx passa apenas os dados que o header precisa (ex: scrolled, handlers).
 */

import React, { ReactNode } from 'react';
import { Instagram, MessageCircle } from 'lucide-react';
import { WHATSAPP_NUMBER } from '../config/constants';

// ─── Sub-componente: Header ────────────────────────────────────────────────────

interface HeaderProps {
    /** Indica se o usuário rolou a página (controla o estilo do header). */
    scrolled: boolean;
    /** Abre o modal de cotação. */
    onOpenQuote: () => void;
}

export const Header: React.FC<HeaderProps> = ({ scrolled, onOpenQuote }) => (
    <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${scrolled ? 'bg-white/95 backdrop-blur-md shadow-lg py-2' : 'bg-transparent py-4'
            }`}
    >
        <div className="container mx-auto px-4 flex justify-between items-center">
            {/* Logo */}
            <button
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                className="flex items-center gap-2.5 group"
                aria-label="Voltar ao topo"
            >
                <img
                    src="https://i.imgur.com/x9X0ICd.png"
                    alt="Logo Mauriti"
                    className="w-10 h-10 object-contain transition-transform group-hover:scale-110"
                />
                <span className={`text-2xl font-brand font-bold ${scrolled ? 'text-[#007ACC]' : 'text-white'}`}>
                    Mauriti
                </span>
            </button>

            {/* Nav */}
            <nav className="hidden md:flex items-center gap-8">
                <a
                    href="#sabores"
                    className={`font-bold uppercase tracking-widest text-[11px] ${scrolled ? 'text-gray-800' : 'text-white'}`}
                >
                    Sabores
                </a>
                <button
                    onClick={onOpenQuote}
                    className="bg-amber-400 text-[#007ACC] px-7 py-2.5 rounded-full font-brand font-bold hover:bg-amber-500 shadow-md transition-all"
                >
                    Revenda Agora
                </button>
            </nav>
        </div>
    </header>
);

// ─── Sub-componente: Footer ────────────────────────────────────────────────────

export const Footer: React.FC = () => (
    <footer className="bg-[#002B45] text-white pt-24 pb-12 rounded-t-[4rem]">
        <div className="container mx-auto px-4 text-center">
            {/* Social links */}
            <div className="flex justify-center gap-6 mb-12">
                <a
                    href="https://instagram.com/sorvetesmauriti"
                    className="bg-white/10 p-4 rounded-full hover:bg-[#007ACC] transition-all"
                    aria-label="Instagram Sorvetes Mauriti"
                    target="_blank"
                    rel="noreferrer"
                >
                    <Instagram />
                </a>
                <a
                    href={`https://wa.me/${WHATSAPP_NUMBER}`}
                    className="bg-white/10 p-4 rounded-full hover:bg-[#007ACC] transition-all"
                    aria-label="WhatsApp Sorvetes Mauriti"
                    target="_blank"
                    rel="noreferrer"
                >
                    <MessageCircle />
                </a>
            </div>

            {/* Copyright */}
            <p className="text-gray-500 font-bold text-[10px] tracking-[0.4em] uppercase">
                © {new Date().getFullYear()} Sorvetes Mauriti | O Legítimo Sabor do Ceará
            </p>
        </div>
    </footer>
);

// ─── Componente principal: Layout ─────────────────────────────────────────────

interface LayoutProps {
    children: ReactNode;
    scrolled: boolean;
    onOpenQuote: () => void;
}

/**
 * Envolve toda a página com o Header e Footer.
 * Uso: <Layout scrolled={scrolled} onOpenQuote={...}>{children}</Layout>
 */
export const Layout: React.FC<LayoutProps> = ({ children, scrolled, onOpenQuote }) => (
    <div className="min-h-screen bg-[#007ACC] selection:bg-amber-100 selection:text-[#007ACC]">
        <Header scrolled={scrolled} onOpenQuote={onOpenQuote} />
        <main>{children}</main>
        <Footer />
    </div>
);
