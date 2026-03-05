import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { ChevronRight } from 'lucide-react';

import { ASSETS } from './src/data/assets';
import { Toast } from './src/components/ui/Toast';

import { ProductCard } from './src/components/ui/ProductCard';
import { Layout } from './src/components/Layout';
import { OrderModal } from './src/features/checkout/components/OrderModal';
import { useProducts } from './src/hooks/useProducts';
import { useCart } from './src/hooks/useCart';
import { useOrderSubmit } from './src/features/checkout/hooks/useOrderSubmit';
import { CATEGORY_MAP } from './src/config/constants';

const App: React.FC = () => {
  const [scrolled, setScrolled] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [toastVisible, setToastVisible] = useState(false);
  const [toastError, setToastError] = useState(false);

  const { products, isLoading } = useProducts();
  const { cart, totalItems, updateQty, clearCart } = useCart();

  // ─── Handlers de navegação ─────────────────────────────────────────────────

  // Limpa o carrinho ao abrir qualquer categoria — evita "carrinho fantasma"
  // onde itens de sessões/abas anteriores aparecem no contador mas somem na revisão.
  const openCategory = (key: string) => { clearCart(); setActiveCategory(key); };
  const closeModal = useCallback(() => setActiveCategory(null), []);

  // ─── Callbacks estáveis para o hook de submit ──────────────────────────────

  const handleSuccess = useCallback(() => {
    setToastVisible(true);
    setTimeout(() => setToastVisible(false), 5000);
    setTimeout(() => {
      closeModal();
      clearCart();
    }, 1000);
  }, [closeModal, clearCart]);

  const handleError = useCallback(() => {
    setToastError(true);
    setTimeout(() => setToastError(false), 5000);
  }, []);

  const { submit, isSubmitting } = useOrderSubmit(products, cart, {
    onSuccess: handleSuccess,
    onError: handleError,
  });

  // ─── Scroll listener ───────────────────────────────────────────────────────

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // ─── Produtos filtrados ────────────────────────────────────────────────────

  const filteredProducts = useMemo(() => {
    if (!activeCategory) return [];
    return products.filter((p) => CATEGORY_MAP[activeCategory].filter(p.category));
  }, [activeCategory, products]);

  // ─── Render ────────────────────────────────────────────────────────────────

  return (
    <Layout scrolled={scrolled} onOpenQuote={() => openCategory('picoles')}>
      <Toast message="Pedido enviado com sucesso!" visible={toastVisible} />
      <Toast message="Erro ao enviar. Tente novamente." visible={toastError} variant="error" />

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
              Desde 2000, levando o frescor das frutas e o sabor inesquecível do Nordeste para a sua
              mesa.
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
              src={ASSETS.heroProduct}
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
            <h2 className="text-[#007ACC] font-brand text-5xl md:text-6xl font-bold">
              Nossas Linhas
            </h2>
            <div className="w-24 h-1.5 bg-amber-400 mt-4 rounded-full mx-auto md:mx-0" />
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {Object.entries(CATEGORY_MAP).map(([key, info]) => (
              <ProductCard
                key={key}
                variant="display"
                product={{ id: key, name: info.title, description: info.description, img: info.img, category: key }}
                onDetails={() => openCategory(key)}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Modal de cotação — componente isolado com SRP */}
      {activeCategory && (
        <OrderModal
          categoryKey={activeCategory}
          products={filteredProducts}
          isLoading={isLoading}
          cart={cart}
          totalItems={totalItems}
          isSubmitting={isSubmitting}
          onClose={closeModal}
          onUpdateQty={updateQty}
          onSubmit={submit}
        />
      )}
    </Layout>
  );
};

export default App;
