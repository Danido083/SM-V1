/**
 * @file src/components/ui/CartDrawer.tsx
 * @description Carrinho flutuante de acompanhamento.
 * Exibe todos os itens selecionados (de qualquer categoria) antes do checkout.
 */

import { type FC, useState } from 'react';
import { ShoppingCart, X, Plus, Minus, Trash2, ChevronRight } from 'lucide-react';
import { Product } from '../../features/catalog/types';
import { CATEGORY_MAP } from '../../config/constants';

interface CartDrawerProps {
    cart: Record<string, number>;
    allProducts: Product[];
    totalItems: number;
    onUpdateQty: (id: string, qty: number) => void;
    onCheckout: () => void;
}

export const CartDrawer: FC<CartDrawerProps> = ({
    cart,
    allProducts,
    totalItems,
    onUpdateQty,
    onCheckout,
}) => {
    const [isOpen, setIsOpen] = useState(false);

    // Apenas produtos que realmente têm quantidade no carrinho
    const cartItems = allProducts.filter((p) => (cart[p.id] ?? 0) > 0);

    if (totalItems === 0) return null;

    return (
        <>
            {/* ── Botão flutuante ─────────────────────────────────────── */}
            <button
                onClick={() => setIsOpen(true)}
                aria-label="Abrir carrinho"
                className="fixed bottom-6 right-6 z-[90] flex items-center gap-3 bg-[#007ACC] text-white pl-5 pr-4 py-4 rounded-full shadow-[0_8px_32px_rgba(0,122,204,0.45)] hover:bg-[#005c99] transition-all active:scale-95 animate-entrance"
            >
                <span className="font-brand font-bold text-base hidden sm:inline">Meu Pedido</span>
                <div className="relative">
                    <ShoppingCart size={22} />
                    <span className="absolute -top-2.5 -right-2.5 bg-amber-400 text-[#007ACC] text-[10px] font-black rounded-full w-5 h-5 flex items-center justify-center leading-none">
                        {totalItems > 99 ? '99+' : totalItems}
                    </span>
                </div>
            </button>

            {/* ── Backdrop ────────────────────────────────────────────── */}
            {isOpen && (
                <div
                    className="fixed inset-0 z-[95] bg-black/30 backdrop-blur-sm animate-fadeIn"
                    onClick={() => setIsOpen(false)}
                />
            )}

            {/* ── Drawer lateral ──────────────────────────────────────── */}
            <aside
                className={`fixed top-0 right-0 h-full w-full max-w-sm z-[96] bg-white shadow-2xl flex flex-col transition-transform duration-300 ease-out ${isOpen ? 'translate-x-0' : 'translate-x-full'
                    }`}
            >
                {/* Header */}
                <div className="flex items-center justify-between p-5 border-b bg-gray-50/50">
                    <div>
                        <h2 className="font-brand font-bold text-xl text-gray-800">Meu Pedido</h2>
                        <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">
                            {totalItems} {totalItems === 1 ? 'item selecionado' : 'itens selecionados'}
                        </p>
                    </div>
                    <button
                        onClick={() => setIsOpen(false)}
                        aria-label="Fechar carrinho"
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                    >
                        <X size={22} />
                    </button>
                </div>

                {/* Lista de itens */}
                <div className="flex-grow overflow-y-auto p-4 space-y-3 no-scrollbar">
                    {cartItems.length === 0 ? (
                        <div className="h-full flex items-center justify-center text-gray-300 font-bold text-sm">
                            Nenhum item adicionado
                        </div>
                    ) : (
                        cartItems.map((p) => {
                            const qty = cart[p.id] ?? 0;
                            const categoryLabel = CATEGORY_MAP[p.category]?.title || p.category;
                            return (
                                <div
                                    key={p.id}
                                    className="flex items-center gap-3 bg-gray-50 rounded-2xl p-3 border border-gray-100"
                                >
                                    {/* Imagem */}
                                    <div className="w-14 h-14 rounded-xl overflow-hidden bg-white shadow-sm flex-shrink-0 border border-gray-100">
                                        {p.img ? (
                                            <img src={p.img} alt={p.name} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-2xl">🍦</div>
                                        )}
                                    </div>

                                    {/* Info */}
                                    <div className="flex-grow min-w-0">
                                        <p className="font-brand font-bold text-gray-800 text-sm leading-tight truncate">{p.name}</p>
                                        <p className="text-[9px] text-[#007ACC]/60 font-black uppercase tracking-widest mt-0.5">{categoryLabel}</p>
                                    </div>

                                    {/* Controles */}
                                    <div className="flex items-center gap-1 bg-white rounded-full p-1 border border-gray-200 shadow-sm flex-shrink-0">
                                        <button
                                            onClick={() => onUpdateQty(p.id, qty - 1)}
                                            className="w-7 h-7 flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-all"
                                            aria-label="Remover item"
                                        >
                                            {qty === 1 ? <Trash2 size={13} /> : <Minus size={13} />}
                                        </button>
                                        <span className="font-brand font-bold text-sm w-6 text-center text-gray-800">{qty}</span>
                                        <button
                                            onClick={() => onUpdateQty(p.id, qty + 1)}
                                            className="w-7 h-7 flex items-center justify-center text-gray-400 hover:text-[#007ACC] hover:bg-blue-50 rounded-full transition-all"
                                            aria-label="Adicionar item"
                                        >
                                            <Plus size={13} />
                                        </button>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>

                {/* Footer — CTA */}
                <div className="p-4 border-t bg-gray-50/50">
                    <button
                        onClick={() => { setIsOpen(false); onCheckout(); }}
                        className="w-full flex items-center justify-center gap-3 bg-[#007ACC] text-white py-4 rounded-2xl font-brand font-bold text-lg shadow-lg hover:bg-[#005c99] transition-all active:scale-95"
                    >
                        Finalizar Pedido <ChevronRight size={20} />
                    </button>
                    <p className="text-center text-[10px] text-gray-400 font-bold mt-2 uppercase tracking-widest">
                        Você será redirecionado ao WhatsApp
                    </p>
                </div>
            </aside>
        </>
    );
};
