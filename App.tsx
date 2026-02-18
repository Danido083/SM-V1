import React, { useState, useEffect, useMemo } from 'react';
import { Instagram, MessageCircle, ChevronRight, Send, Loader2, ShoppingBasket, X } from 'lucide-react';

import { Toast } from './src/components/ui/Toast';
import { ProductCard } from './src/components/ui/ProductCard';
import { useProducts } from './src/hooks/useProducts';
import { useCart } from './src/hooks/useCart';
import { CATEGORY_MAP, WHATSAPP_NUMBER, THEME, API_URL } from './src/config/constants';
import { LeadData } from './src/features/catalog/types';

const INITIAL_LEAD: LeadData = { name: '', whatsapp: '', city: '' };

const App: React.FC = () => {
  const [scrolled, setScrolled] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [modalStep, setModalStep] = useState<'products' | 'lead'>('products');
  const [leadForm, setLeadForm] = useState<LeadData>(INITIAL_LEAD);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toastVisible, setToastVisible] = useState(false);

  const { products, isLoading } = useProducts();
  const { cart, totalItems, updateQty, clearCart } = useCart();

  // Scroll listener para o header
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const filteredProducts = useMemo(() => {
    if (!activeCategory) return [];
    return products.filter((p) => CATEGORY_MAP[activeCategory].filter(p.category));
  }, [activeCategory, products]);

  const openCategory = (key: string, step: 'products' | 'lead' = 'products') => {
    setActiveCategory(key);
    setModalStep(step);
  };

  const closeModal = () => {
    setActiveCategory(null);
    setModalStep('products');
  };

  const handleSubmitLead = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const itemsOrdered = products
      .filter((p) => (cart[p.id] ?? 0) > 0)
      .map((p) => ({ nome: p.name, quantidade: cart[p.id], categoria: p.category }));

    const payload = { lead: leadForm, pedido: itemsOrdered, data: new Date().toISOString() };

    try {
      await fetch(API_URL, {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      setToastVisible(true);
      setTimeout(() => setToastVisible(false), 5000);

      const orderText = itemsOrdered.map((i) => `• ${i.quantidade}x ${i.nome}`).join('\n');
      const msg = encodeURIComponent(
        `🚀 *Novo Orçamento B2B*\n\n*Cliente:* ${leadForm.name}\n*Cidade:* ${leadForm.city}\n\n*Pedido:*\n${orderText}\n\nAguardo contato!`
      );

      setTimeout(() => {
        window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${msg}`, '_blank');
        closeModal();
        clearCart();
        setLeadForm(INITIAL_LEAD);
      }, 1000);
    } catch {
      alert('Erro ao enviar. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#007ACC] selection:bg-amber-100 selection:text-[#007ACC]">
      <Toast message="Pedido enviado com sucesso!" visible={toastVisible} />

      {/* Header */}
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${scrolled ? 'bg-white/95 backdrop-blur-md shadow-lg py-2' : 'bg-transparent py-4'
          }`}
      >
        <div className="container mx-auto px-4 flex justify-between items-center">
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="flex items-center gap-2.5 group"
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
          <nav className="hidden md:flex items-center gap-8">
            <a
              href="#sabores"
              className={`font-bold uppercase tracking-widest text-[11px] ${scrolled ? 'text-gray-800' : 'text-white'}`}
            >
              Sabores
            </a>
            <button
              onClick={() => openCategory('picoles', 'lead')}
              className="bg-amber-400 text-[#007ACC] px-7 py-2.5 rounded-full font-brand font-bold hover:bg-amber-500 shadow-md transition-all"
            >
              Revenda Agora
            </button>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="min-h-screen flex items-center pt-24 overflow-hidden relative bg-[#007ACC]">
        <div className="container mx-auto px-4 grid md:grid-cols-2 gap-12 items-center relative z-10">
          <div className="text-white space-y-7 animate-entrance">
            <span className="inline-block bg-white/10 backdrop-blur-md px-5 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] border border-white/20">
              💰 Alta Lucratividade para Revenda
            </span>
            <h1 className="text-6xl md:text-8xl font-brand font-bold leading-none">
              Cremosidade <br /> que vem do <br />
              <span className="text-amber-400">Coração.</span>
            </h1>
            <p className="text-lg opacity-90 max-w-md font-medium leading-relaxed">
              Desde 2000, levando o frescor das frutas e o sabor inesquecível do Nordeste para a sua mesa.
            </p>
            <a
              href="#sabores"
              className="inline-flex items-center gap-2 bg-amber-400 text-[#007ACC] px-10 py-5 rounded-full font-brand text-xl font-bold hover:bg-amber-500 shadow-2xl transition-all"
            >
              Ver Sabores <ChevronRight />
            </a>
          </div>
          <div className="relative group animate-entrance" style={{ animationDelay: '0.2s' }}>
            <img
              src="https://i.imgur.com/Xz2kNrl.jpeg"
              alt="Produtos Mauriti"
              className="relative z-10 rounded-[4rem] shadow-2xl border-4 border-white/20 rotate-3 group-hover:rotate-0 transition-all duration-1000 w-full max-w-md mx-auto"
            />
          </div>
        </div>
      </section>

      {/* Categorias */}
      <section id="sabores" className="py-32 bg-white rounded-t-[4rem] -mt-16 relative z-20">
        <div className="container mx-auto px-4">
          <div className="mb-16 text-center md:text-left">
            <h2 className="text-[#007ACC] font-brand text-5xl md:text-6xl font-bold">Nossas Linhas</h2>
            <div className="w-24 h-1.5 bg-amber-400 mt-4 rounded-full mx-auto md:mx-0" />
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {Object.entries(CATEGORY_MAP).map(([key, info]) => (
              <ProductCard
                key={key}
                variant="display"
                product={{ id: key, name: info.title, description: info.description, img: info.img, category: key }}
                onDetails={() => openCategory(key, 'products')}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Modal */}
      {activeCategory && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-blue-900/40 backdrop-blur-md animate-fadeIn">
          <div
            className={`bg-white w-full ${modalStep === 'products' ? 'max-w-5xl h-[85vh]' : 'max-w-md'
              } ${THEME.radius} shadow-3xl flex flex-col overflow-hidden animate-entrance`}
          >
            {/* Modal Header */}
            <div className="p-6 border-b flex justify-between items-center bg-gray-50/50">
              <div>
                <h3 className="text-2xl font-brand font-bold text-gray-800">
                  {modalStep === 'products' ? CATEGORY_MAP[activeCategory].title : 'Finalizar Cotação'}
                </h3>
                {modalStep === 'products' && (
                  <p className="text-xs text-gray-400 uppercase tracking-widest font-black">
                    Adicione os sabores que deseja revender
                  </p>
                )}
              </div>
              <button onClick={closeModal} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                <X size={24} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-grow overflow-y-auto p-6 no-scrollbar">
              {modalStep === 'products' ? (
                isLoading ? (
                  <div className="h-full flex flex-col items-center justify-center gap-4">
                    <Loader2 className="animate-spin text-[#007ACC]" size={40} />
                    <p className="font-brand font-bold text-gray-400">Carregando catálogo...</p>
                  </div>
                ) : filteredProducts.length > 0 ? (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {filteredProducts.map((p) => (
                      <ProductCard
                        key={p.id}
                        variant="action"
                        product={p}
                        quantity={cart[p.id] ?? 0}
                        onAdd={() => updateQty(p.id, (cart[p.id] ?? 0) + 1)}
                        onRemove={() => updateQty(p.id, (cart[p.id] ?? 0) - 1)}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="h-full flex items-center justify-center text-gray-400 font-bold">
                    Nenhum produto nesta categoria disponível no momento.
                  </div>
                )
              ) : (
                <form id="leadForm" onSubmit={handleSubmitLead} className="space-y-4">
                  <p className="text-center text-gray-500 text-sm mb-6">
                    Informe seus dados para receber nossa tabela de preços e condições de revenda.
                  </p>
                  {(['name', 'whatsapp', 'city'] as const).map((field) => (
                    <div key={field}>
                      <label className="text-[10px] font-black uppercase text-[#007ACC] block mb-1 ml-2">
                        {field === 'name' ? 'Nome Completo' : field === 'whatsapp' ? 'WhatsApp' : 'Sua Cidade'}
                      </label>
                      <input
                        required
                        type={field === 'whatsapp' ? 'tel' : 'text'}
                        className="w-full px-5 py-4 bg-gray-100 rounded-2xl outline-none border-2 border-transparent focus:border-[#007ACC] transition-all font-bold"
                        placeholder={
                          field === 'name' ? 'Ex: João Silva' : field === 'whatsapp' ? '(00) 00000-0000' : 'Ex: Mauriti - CE'
                        }
                        value={leadForm[field]}
                        onChange={(e) => setLeadForm((prev) => ({ ...prev, [field]: e.target.value }))}
                      />
                    </div>
                  ))}
                </form>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-6 border-t bg-gray-50/50">
              {modalStep === 'products' ? (
                <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="bg-[#007ACC] text-white p-3 rounded-2xl shadow-lg">
                      <ShoppingBasket size={24} />
                    </div>
                    <div>
                      <p className="text-xs font-black uppercase tracking-tighter text-gray-400">Itens Selecionados</p>
                      <p className="text-xl font-brand font-bold text-[#007ACC]">{totalItems} sabores</p>
                    </div>
                  </div>
                  <button
                    disabled={totalItems === 0}
                    onClick={() => setModalStep('lead')}
                    className="w-full md:w-auto bg-[#007ACC] text-white px-10 py-5 rounded-2xl font-brand font-bold text-lg shadow-xl hover:bg-[#005c99] transition-all disabled:opacity-50 disabled:grayscale"
                  >
                    Concluir Cotação
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
      )}

      {/* Footer */}
      <footer className="bg-[#002B45] text-white pt-24 pb-12 rounded-t-[4rem]">
        <div className="container mx-auto px-4 text-center">
          <div className="flex justify-center gap-6 mb-12">
            <a
              href="https://instagram.com/sorvetesmauriti"
              className="bg-white/10 p-4 rounded-full hover:bg-[#007ACC] transition-all"
              aria-label="Instagram"
            >
              <Instagram />
            </a>
            <a
              href={`https://wa.me/${WHATSAPP_NUMBER}`}
              className="bg-white/10 p-4 rounded-full hover:bg-[#007ACC] transition-all"
              aria-label="WhatsApp"
            >
              <MessageCircle />
            </a>
          </div>
          <p className="text-gray-500 font-bold text-[10px] tracking-[0.4em] uppercase">
            © {new Date().getFullYear()} Sorvetes Mauriti | O Legítimo Sabor do Ceará
          </p>
        </div>
      </footer>
    </div>
  );
};

export default App;
