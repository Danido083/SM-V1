/**
 * @file src/features/checkout/components/OrderModal.tsx
 * @description Modal de cotação B2B — responsabilidade única: UI do fluxo de pedido.
 * Gerencia dois passos internos: seleção de produtos e coleta de dados do lead.
 */

import { type FC, useState, type FormEvent } from 'react';
import { Send, Loader2, ShoppingBasket, X, Plus, Minus, Trash2 } from 'lucide-react';

import { ProductCard } from '../../../components/ui/ProductCard';
import { CATEGORY_MAP } from '../../../config/constants';
import { Product, LeadData } from '../../catalog/types';

// ─── Helper: Correção de encoding ─────────────────────────────────────────────
const fixEncoding = (text: string) => {
    try {
        // Tenta converter de ISO-8859-1/UTF-8 corrompido para UTF-8 limpo
        return decodeURIComponent(escape(text));
    } catch {
        return text;
    }
};

// ─── Mapa de configuração dos campos do formulário ────────────────────────────
// Substitui os ternários aninhados anteriores (melhoria de legibilidade)
const LEAD_FIELD_CONFIG: Record<
    keyof LeadData,
    { label: string; placeholder: string; type: string }
> = {
    name: { label: 'Nome Completo', placeholder: 'Ex: João Silva', type: 'text' },
    whatsapp: { label: 'WhatsApp', placeholder: '(00) 00000-0000', type: 'tel' },
    city: { label: 'Sua Cidade', placeholder: 'Ex: Mauriti - CE', type: 'text' },
};

// ─── Props ────────────────────────────────────────────────────────────────────

interface OrderModalProps {
    categoryKey: string;
    products: Product[];
    allProducts: Product[];
    isLoading: boolean;
    cart: Record<string, number>;
    totalItems: number;
    isSubmitting: boolean;
    onClose: () => void;
    onUpdateQty: (id: string, qty: number) => void;
    onSubmit: (lead: LeadData) => Promise<boolean>;
}

// ─── Componente ───────────────────────────────────────────────────────────────

const INITIAL_LEAD: LeadData = { name: '', whatsapp: '', city: '' };

export const OrderModal: FC<OrderModalProps> = ({
    categoryKey,
    products,
    allProducts,
    isLoading,
    cart,
    totalItems,
    isSubmitting,
    onClose,
    onUpdateQty,
    onSubmit,
}) => {
    const [step, setStep] = useState<'products' | 'review' | 'lead'>('products');
    const [leadForm, setLeadForm] = useState<LeadData>(INITIAL_LEAD);
    const [whatsappError, setWhatsappError] = useState<string>('');

    // Valida que o número de WhatsApp tem ao menos 10 dígitos (DDD + número)
    const validateWhatsApp = (value: string): string => {
        const digits = value.replace(/\D/g, '');
        if (digits.length < 10) return 'Informe um número de WhatsApp válido com DDD (ex: 88 99999-9999)';
        if (digits.length > 13) return 'Número muito longo. Verifique e tente novamente.';
        return '';
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        const errorMsg = validateWhatsApp(leadForm.whatsapp);
        if (errorMsg) {
            setWhatsappError(errorMsg);
            return;
        }
        setWhatsappError('');
        await onSubmit(leadForm);
    };

    const categoryInfo = CATEGORY_MAP[categoryKey];

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 bg-blue-900/40 backdrop-blur-md animate-fadeIn">
            <div
                className={`bg-white w-[95%] max-w-[95vw] mx-auto box-border ${step === 'products' ? 'max-w-5xl h-[85vh]' : 'max-w-[440px] max-h-[90vh]'
                    } rounded-[2rem] shadow-[0_20px_60px_rgba(0,0,0,0.2)] flex flex-col overflow-hidden animate-entrance`}
            >
                {/* ── Header ────────────────────────────────────────────────────── */}
                <div className="p-6 border-b flex justify-between items-center bg-gray-50/50">
                    <div>
                        <h3 className="text-2xl font-brand font-bold text-gray-800">
                            {step === 'products' ? fixEncoding(categoryInfo.title) : step === 'review' ? 'Revisar Pedido' : 'Finalizar Cotação'}
                        </h3>
                        {step !== 'lead' && (
                            <p className="text-xs text-gray-400 uppercase tracking-widest font-black">
                                {step === 'products' ? 'Adicione os itens que deseja revender' : 'Confirme as quantidades e itens selecionados'}
                            </p>
                        )}
                    </div>
                    <button
                        onClick={onClose}
                        aria-label="Fechar modal"
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* ── Body ──────────────────────────────────────────────────────── */}
                <div className="flex-grow overflow-y-auto p-6 no-scrollbar">
                    {step === 'products' ? (
                        isLoading ? (
                            <div className="h-full flex flex-col items-center justify-center gap-4">
                                <Loader2 className="animate-spin text-[#007ACC]" size={40} />
                                <p className="font-brand font-bold text-gray-400">Carregando catálogo...</p>
                            </div>
                        ) : products.length > 0 ? (
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                                {products.map((p) => (
                                    <ProductCard
                                        key={p.id}
                                        variant="action"
                                        product={p}
                                        quantity={cart[p.id] ?? 0}
                                        onAdd={() => onUpdateQty(p.id, (cart[p.id] ?? 0) + 1)}
                                        onRemove={() => onUpdateQty(p.id, (cart[p.id] ?? 0) - 1)}
                                    />
                                ))}
                            </div>
                        ) : (
                            <div className="h-full flex items-center justify-center text-gray-400 font-bold">
                                Nenhum produto nesta categoria disponível no momento.
                            </div>
                        )
                    ) : step === 'review' ? (
                        <div className="space-y-4 px-2">
                            {allProducts.filter(p => (cart[p.id] ?? 0) > 0).length > 0 ? (
                                allProducts.filter(p => (cart[p.id] ?? 0) > 0).map(p => (
                                    <div key={p.id} className="flex items-center gap-4 bg-gray-50/50 p-4 rounded-[2rem] border border-gray-100/50 hover:bg-white transition-all shadow-sm">
                                        <div className="w-16 h-16 rounded-2xl overflow-hidden bg-white shadow-inner flex-shrink-0 border border-gray-100">
                                            {p.img ? (
                                                <img src={p.img} alt={p.name} className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-3xl bg-gray-50">🍦</div>
                                            )}
                                        </div>
                                        <div className="flex-grow min-w-0">
                                            <h4 className="font-brand font-bold text-gray-800 text-sm md:text-base leading-tight truncate">
                                                {fixEncoding(p.name)}
                                            </h4>
                                            <p className="text-[9px] text-[#007ACC]/60 uppercase font-black tracking-widest mt-0.5">
                                                {fixEncoding(CATEGORY_MAP[p.category]?.title || '')}
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-1 bg-gray-100 rounded-full p-1 border border-gray-200 shadow-inner">
                                            <button
                                                onClick={() => onUpdateQty(p.id, (cart[p.id] ?? 0) - 1)}
                                                className="w-8 h-8 flex items-center justify-center text-gray-500 hover:text-red-500 hover:bg-white rounded-full transition-all"
                                            >
                                                {cart[p.id] === 1 ? <Trash2 size={16} /> : <Minus size={16} />}
                                            </button>
                                            <span className="font-brand font-bold text-gray-800 text-sm w-6 text-center">{cart[p.id]}</span>
                                            <button
                                                onClick={() => onUpdateQty(p.id, (cart[p.id] ?? 0) + 1)}
                                                className="w-8 h-8 flex items-center justify-center text-gray-500 hover:text-[#007ACC] hover:bg-white rounded-full transition-all"
                                            >
                                                <Plus size={16} />
                                            </button>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="py-20 text-center">
                                    <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6 text-3xl opacity-50">🛒</div>
                                    <p className="text-gray-400 font-bold mb-4 text-lg">Seu carrinho está vazio.</p>
                                    <button
                                        onClick={() => setStep('products')}
                                        className="text-[#007ACC] font-brand font-black uppercase text-xs tracking-[0.2em] border-b-2 border-[#007ACC]/20 hover:border-[#007ACC] transition-all"
                                    >
                                        Explorar Sabores
                                    </button>
                                </div>
                            )}
                        </div>
                    ) : (
                        <form id="leadForm" onSubmit={handleSubmit} className="space-y-4">
                            <p className="text-center text-gray-500 text-sm mb-6">
                                Informe seus dados para receber nossa tabela de preços e condições de revenda.
                            </p>
                            {(Object.keys(LEAD_FIELD_CONFIG) as (keyof LeadData)[]).map((field) => {
                                const config = LEAD_FIELD_CONFIG[field];
                                return (
                                    <div key={field}>
                                        <label className="text-[10px] font-black uppercase text-[#007ACC] block mb-1 ml-2">
                                            {config.label}
                                        </label>
                                        <input
                                            required
                                            type={config.type}
                                            placeholder={config.placeholder}
                                            {...(field === 'whatsapp' ? { minLength: 10, maxLength: 20 } : {})}
                                            className={`w-full px-5 py-4 bg-gray-100 rounded-2xl outline-none border-2 transition-all font-bold ${field === 'whatsapp' && whatsappError
                                                ? 'border-red-400 focus:border-red-500'
                                                : 'border-transparent focus:border-[#007ACC]'
                                                }`}
                                            value={leadForm[field]}
                                            onChange={(e) => {
                                                setLeadForm((prev) => ({ ...prev, [field]: e.target.value }));
                                                if (field === 'whatsapp') setWhatsappError('');
                                            }}
                                        />
                                        {field === 'whatsapp' && whatsappError && (
                                            <p className="text-red-500 text-[10px] font-bold mt-1 ml-2">{whatsappError}</p>
                                        )}
                                    </div>
                                );
                            })}
                        </form>
                    )}
                </div>

                {/* ── Footer ────────────────────────────────────────────────────── */}
                <div className="p-4 border-t bg-gray-50/50 box-border w-full">
                    {step !== 'lead' ? (
                        <div className="flex flex-wrap gap-3 items-center w-full box-border">
                            {/* Bloco do carrinho — cresce mas não expulsa os botões */}
                            <div className="flex items-center gap-3 flex-1 min-w-0">
                                <div className="bg-[#007ACC] text-white p-2 rounded-2xl shadow-lg flex-shrink-0">
                                    <ShoppingBasket size={18} />
                                </div>
                                <div className="min-w-0">
                                    <p className="text-[9px] font-black uppercase tracking-tighter text-gray-400 leading-none mb-0.5">
                                        Itens Selecionados
                                    </p>
                                    <p className="text-base font-brand font-bold text-[#007ACC] leading-none">
                                        {totalItems} {totalItems === 1 ? 'item' : 'itens'}
                                    </p>
                                </div>
                            </div>

                            {/* Botão secundário — só aparece no step review */}
                            {step === 'review' && (
                                <button
                                    onClick={() => setStep('products')}
                                    className="flex-shrink-0 border-2 border-gray-200 text-gray-500 px-4 py-3 rounded-2xl font-brand font-bold text-sm hover:bg-gray-100 transition-all active:scale-95"
                                >
                                    + Itens
                                </button>
                            )}

                            {/* Botão primário — sempre 100% na linha abaixo em mobile */}
                            <button
                                disabled={totalItems === 0}
                                onClick={() => setStep(step === 'products' ? 'review' : 'lead')}
                                className="w-full bg-[#007ACC] text-white px-6 py-4 rounded-2xl font-brand font-bold text-base shadow-[0_10px_20px_rgba(0,122,204,0.3)] hover:bg-[#005c99] transition-all active:scale-95 disabled:opacity-50"
                            >
                                {step === 'products' ? 'Revisar Pedido' : 'Próximo Passo'}
                            </button>
                        </div>
                    ) : (
                        <button
                            form="leadForm"
                            disabled={isSubmitting}
                            className="w-full bg-[#007ACC] text-white py-5 rounded-2xl font-brand font-bold text-xl shadow-xl flex items-center justify-center gap-3 hover:bg-[#005c99] transition-all disabled:opacity-50"
                        >
                            {isSubmitting ? <Loader2 className="animate-spin" /> : <><Send size={20} /> Solicitar Orçamento</>}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};
