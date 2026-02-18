
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Instagram, MessageCircle, MapPin, ChevronRight, Menu, X, ArrowLeft, Star, Plus, Minus, Send, Loader2, CheckCircle2, ShoppingBasket
} from 'lucide-react';

// --- Interfaces ---

interface Product {
  id: string | number;
  name: string;
  img: string;
  tag?: string;
  description?: string;
  category: string;
}

interface LeadData {
  name: string;
  whatsapp: string;
  city: string;
}

// --- Configurações & Helpers ---

const API_URL = 'https://script.google.com/macros/s/AKfycby2FREtalZGsBTR0PaNLiuPmqPsNsUKn6ZkIZQlFvMyT_72f4V-mWK5XxOXgXyz4Vic/exec';
const WHATSAPP_NUMBER = '558899310129';

const normalizeStr = (str: string) =>
  str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();

const THEME = {
  primary: '#007ACC',
  secondary: '#FBBF24',
  radius: 'rounded-[3rem]',
  transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)'
};

const CATEGORY_MAP: Record<string, { title: string; color: string; description: string; filter: (c: string) => boolean }> = {
  'picoles': {
    title: 'Nossos Picolés',
    color: 'bg-amber-50',
    description: 'O frescor da fruta no palito, direto do Ceará.',
    filter: (c) => normalizeStr(c) === 'picole'
  },
  'potes-2l': {
    title: 'Potes de 2 Litros',
    color: 'bg-blue-50',
    description: 'Cremosidade em família para os melhores momentos.',
    filter: (c) => normalizeStr(c) === 'pote' || normalizeStr(c) === 'potes'
  },
  'acai': {
    title: 'Energia Açaí',
    color: 'bg-purple-50',
    description: 'O autêntico sabor da energia pura.',
    filter: (c) => normalizeStr(c) === 'acai'
  },
  'gourmet': {
    title: 'Linha Gourmet',
    color: 'bg-pink-50',
    description: 'Experiências exclusivas para paladares exigentes.',
    filter: (c) => normalizeStr(c) === 'gourmet'
  },
  'gelo': {
    title: 'Gelo Sabor',
    color: 'bg-cyan-50',
    description: 'Refrescância pura para os dias quentes.',
    filter: (c) => normalizeStr(c) === 'gelo'
  }
};

// --- Componentes Atômicos ---

const Badge: React.FC<{ text: string }> = ({ text }) => (
  <div className="absolute top-4 right-4 bg-amber-400 text-[#007ACC] px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest flex items-center gap-1 z-10 shadow-sm animate-pulse">
    <Star size={10} fill="currentColor" /> {text}
  </div>
);

const Toast: React.FC<{ message: string; visible: boolean }> = ({ message, visible }) => (
  <div className={`fixed top-6 left-1/2 -translate-x-1/2 z-[150] transition-all duration-500 transform ${visible ? 'translate-y-0 opacity-100' : '-translate-y-12 opacity-0'}`}>
    <div className="bg-white border-b-4 border-green-500 px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-3">
      <CheckCircle2 className="text-green-500" size={20} />
      <span className="font-brand font-bold text-gray-800 text-sm whitespace-nowrap">{message}</span>
    </div>
  </div>
);

const ProductCard: React.FC<{
  product: Product;
  quantity: number;
  onUpdateQty: (qty: number) => void;
  isHomeView?: boolean;
  onNavigate?: () => void;
}> = ({ product, quantity, onUpdateQty, isHomeView, onNavigate }) => {
  return (
    <article className={`bg-white p-5 ${THEME.radius} shadow-xl hover:shadow-2xl transition-all group border border-transparent hover:border-[#007ACC]/10 relative flex flex-col h-full`}>
      {product.tag && <Badge text={product.tag} />}
      <div className="aspect-square rounded-[2rem] overflow-hidden mb-4 bg-gray-50 shadow-inner">
        <img src={product.img || 'https://via.placeholder.com/400?text=Sorvetes+Mauriti'} alt={product.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" loading="lazy" />
      </div>
      <div className="flex-grow">
        <h3 className="text-lg font-brand font-bold text-gray-800 mb-1 leading-tight">{product.name}</h3>
        {product.description && <p className="text-gray-500 text-xs mt-1 line-clamp-2">{product.description}</p>}
      </div>

      <div className="mt-4">
        {isHomeView ? (
          <button onClick={onNavigate} className="w-full flex items-center justify-center gap-2 text-[#007ACC] font-bold text-xs py-3 border-2 border-[#007ACC]/10 rounded-2xl group-hover:bg-[#007ACC] group-hover:text-white transition-all">
            Ver Sabores <ChevronRight size={14} />
          </button>
        ) : (
          <div className="flex items-center justify-between bg-gray-100 rounded-2xl p-1">
            <button onClick={() => onUpdateQty(Math.max(0, quantity - 1))} className="p-2 text-gray-500 hover:text-[#007ACC] transition-colors"><Minus size={18} /></button>
            <span className="font-brand font-bold text-base w-6 text-center">{quantity}</span>
            <button onClick={() => onUpdateQty(quantity + 1)} className="p-2 text-gray-500 hover:text-[#007ACC] transition-colors"><Plus size={18} /></button>
          </div>
        )}
      </div>
    </article>
  );
};

// --- View Principal ---

const App: React.FC = () => {
  const [scrolled, setScrolled] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modal State
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [modalStep, setModalStep] = useState<'products' | 'lead'>('products');
  const [cart, setCart] = useState<Record<string | number, number>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toastVisible, setToastVisible] = useState(false);
  const [leadForm, setLeadForm] = useState<LeadData>({ name: '', whatsapp: '', city: '' });

  useEffect(() => {
    console.log('🔄 Iniciando fetch de produtos...', API_URL);

    fetch(API_URL)
      .then(r => {
        console.log('✅ Resposta recebida:', r.status, r.statusText);
        if (!r.ok) throw new Error(`HTTP ${r.status}: ${r.statusText}`);
        return r.json();
      })
      .then(data => {
        console.log('📦 Dados recebidos:', data);
        const productList = Array.isArray(data) ? data : (data.products || []);
        console.log('🍦 Produtos processados:', productList.length, 'itens');
        setProducts(productList);
        setIsLoading(false);
      })
      .catch(error => {
        console.error('❌ Erro ao carregar produtos:', error);
        console.error('Detalhes do erro:', {
          message: error.message,
          name: error.name,
          stack: error.stack
        });
        setIsLoading(false);
        // Mostrar erro ao usuário apenas em desenvolvimento
        if (window.location.hostname === 'localhost') {
          alert(`Erro ao carregar produtos: ${error.message}`);
        }
      });

    const handleScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const totalItems = (Object.values(cart) as number[]).reduce((a, b) => a + b, 0);

  const filteredProducts = useMemo(() => {
    if (!activeCategory) return [];
    const config = CATEGORY_MAP[activeCategory];
    return products.filter(p => config.filter(p.category));
  }, [activeCategory, products]);

  const handleSubmitLead = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const itemsOrdered = products.filter(p => cart[p.id] > 0).map(p => ({
      nome: p.name,
      quantidade: cart[p.id],
      categoria: p.category
    }));

    const payload = { lead: leadForm, pedido: itemsOrdered, data: new Date().toISOString() };

    try {
      await fetch(API_URL, { method: 'POST', body: JSON.stringify(payload) });
      setToastVisible(true);
      setTimeout(() => setToastVisible(false), 5000);

      const orderText = itemsOrdered.map(item => `• ${item.quantidade}x ${item.nome}`).join('\n');
      const finalMessage = encodeURIComponent(`🚀 *Novo Orçamento B2B*\n\n*Cliente:* ${leadForm.name}\n*Cidade:* ${leadForm.city}\n\n*Pedido:*\n${orderText}\n\nAguardo contato!`);

      setTimeout(() => {
        window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${finalMessage}`, '_blank');
        setActiveCategory(null);
        setModalStep('products');
        setCart({});
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

      {/* Header Fixo */}
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${scrolled ? 'bg-white/95 backdrop-blur-md shadow-lg py-2' : 'bg-transparent py-4'}`}>
        <div className="container mx-auto px-4 flex justify-between items-center">
          <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="flex items-center gap-2.5 group">
            <img src="https://i.imgur.com/x9X0ICd.png" alt="Logo" className="w-10 h-10 object-contain transition-transform group-hover:scale-110" />
            <span className={`text-2xl font-brand font-bold ${scrolled ? 'text-[#007ACC]' : 'text-white'}`}>Mauriti</span>
          </button>
          <nav className="hidden md:flex items-center gap-8">
            <a href="#sabores" className={`font-bold uppercase tracking-widest text-[11px] ${scrolled ? 'text-gray-800' : 'text-white'}`}>Sabores</a>
            <button onClick={() => { setActiveCategory('picoles'); setModalStep('lead'); }} className="bg-amber-400 text-[#007ACC] px-7 py-2.5 rounded-full font-brand font-bold hover:bg-amber-500 shadow-md transition-all">Revenda Agora</button>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="min-h-screen flex items-center pt-24 overflow-hidden relative bg-[#007ACC]">
        <div className="container mx-auto px-4 grid md:grid-cols-2 gap-12 items-center relative z-10">
          <div className="text-white space-y-7 animate-entrance">
            <span className="inline-block bg-white/10 backdrop-blur-md px-5 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] border border-white/20">💰 Alta Lucratividade para Revenda</span>
            <h1 className="text-6xl md:text-8xl font-brand font-bold leading-none">Cremosidade <br /> que vem do <br /><span className="text-amber-400">Coração.</span></h1>
            <p className="text-lg opacity-90 max-w-md font-medium leading-relaxed">Desde 2000, levando o frescor das frutas e o sabor inesquecível do Nordeste para a sua mesa.</p>
            <div className="flex flex-wrap gap-4">
              <a href="#sabores" className="bg-amber-400 text-[#007ACC] px-10 py-5 rounded-full font-brand text-xl font-bold hover:bg-amber-500 shadow-2xl flex items-center gap-2 transition-all">Ver Sabores <ChevronRight /></a>
            </div>
          </div>
          <div className="relative group animate-entrance" style={{ animationDelay: '0.2s' }}>
            <img src="https://i.imgur.com/Xz2kNrl.jpeg" alt="Produtos" className="relative z-10 rounded-[4rem] shadow-2xl border-4 border-white/20 rotate-3 group-hover:rotate-0 transition-all duration-1000 w-full max-w-md mx-auto" />
          </div>
        </div>
      </section>

      {/* Grid de Categorias */}
      <section id="sabores" className="py-32 bg-white rounded-t-[4rem] -mt-16 relative z-20">
        <div className="container mx-auto px-4">
          <div className="mb-16 text-center md:text-left">
            <h2 className="text-[#007ACC] font-brand text-5xl md:text-6xl font-bold">Nossas Linhas</h2>
            <div className="w-24 h-1.5 bg-amber-400 mt-4 rounded-full mx-auto md:mx-0"></div>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {Object.entries(CATEGORY_MAP).map(([key, info]) => (
              <ProductCard
                key={key}
                isHomeView
                product={{
                  id: key,
                  name: info.title,
                  description: info.description,
                  img: key === 'picoles' ? 'https://i.imgur.com/mJfOgah.jpeg' : key === 'potes-2l' ? 'https://i.imgur.com/4YnqlcT.jpeg' : key === 'acai' ? 'https://i.imgur.com/VWPnpF8.jpeg' : key === 'gelo' ? 'https://res.cloudinary.com/domma0qk3/image/upload/v1770150028/gelo_sabor_energetico-Photoroom_eiwshm.png' : 'https://i.imgur.com/o9FoKWl.jpeg',
                  category: key
                }}
                quantity={0}
                onUpdateQty={() => { }}
                onNavigate={() => { setActiveCategory(key); setModalStep('products'); }}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Modal Dinâmico */}
      {activeCategory && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-blue-900/40 backdrop-blur-md animate-fadeIn">
          <div className={`bg-white w-full ${modalStep === 'products' ? 'max-w-5xl h-[85vh]' : 'max-w-md'} ${THEME.radius} shadow-3xl flex flex-col overflow-hidden animate-entrance`}>

            {/* Header Modal */}
            <div className="p-6 border-b flex justify-between items-center bg-gray-50/50">
              <div>
                <h3 className="text-2xl font-brand font-bold text-gray-800">{modalStep === 'products' ? CATEGORY_MAP[activeCategory].title : 'Finalizar Cotação'}</h3>
                {modalStep === 'products' && <p className="text-xs text-gray-400 uppercase tracking-widest font-black">Adicione os sabores que deseja revender</p>}
              </div>
              <button onClick={() => setActiveCategory(null)} className="p-2 hover:bg-gray-100 rounded-full transition-colors"><X size={24} /></button>
            </div>

            {/* Conteúdo Modal */}
            <div className="flex-grow overflow-y-auto p-6 no-scrollbar">
              {modalStep === 'products' ? (
                isLoading ? (
                  <div className="h-full flex flex-col items-center justify-center gap-4">
                    <Loader2 className="animate-spin text-[#007ACC]" size={40} />
                    <p className="font-brand font-bold text-gray-400">Carregando catálogo...</p>
                  </div>
                ) : filteredProducts.length > 0 ? (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {filteredProducts.map(p => (
                      <ProductCard key={p.id} product={p} quantity={cart[p.id] || 0} onUpdateQty={(q) => setCart({ ...cart, [p.id]: q })} />
                    ))}
                  </div>
                ) : (
                  <div className="h-full flex items-center justify-center text-gray-400 font-bold">Nenhum produto nesta categoria disponível no momento.</div>
                )
              ) : (
                <form id="leadForm" onSubmit={handleSubmitLead} className="space-y-4">
                  <div className="text-center mb-6">
                    <p className="text-gray-500 text-sm">Informe seus dados para receber nossa tabela de preços e condições de revenda.</p>
                  </div>
                  <div>
                    <label className="text-[10px] font-black uppercase text-[#007ACC] block mb-1 ml-2">Nome Completo</label>
                    <input required type="text" className="w-full px-5 py-4 bg-gray-100 rounded-2xl outline-none border-2 border-transparent focus:border-[#007ACC] transition-all font-bold" placeholder="Ex: João Silva" value={leadForm.name} onChange={e => setLeadForm({ ...leadForm, name: e.target.value })} />
                  </div>
                  <div>
                    <label className="text-[10px] font-black uppercase text-[#007ACC] block mb-1 ml-2">WhatsApp</label>
                    <input required type="tel" className="w-full px-5 py-4 bg-gray-100 rounded-2xl outline-none border-2 border-transparent focus:border-[#007ACC] transition-all font-bold" placeholder="(00) 00000-0000" value={leadForm.whatsapp} onChange={e => setLeadForm({ ...leadForm, whatsapp: e.target.value })} />
                  </div>
                  <div>
                    <label className="text-[10px] font-black uppercase text-[#007ACC] block mb-1 ml-2">Sua Cidade</label>
                    <input required type="text" className="w-full px-5 py-4 bg-gray-100 rounded-2xl outline-none border-2 border-transparent focus:border-[#007ACC] transition-all font-bold" placeholder="Ex: Mauriti - CE" value={leadForm.city} onChange={e => setLeadForm({ ...leadForm, city: e.target.value })} />
                  </div>
                </form>
              )}
            </div>

            {/* Footer Modal */}
            <div className="p-6 border-t bg-gray-50/50">
              {modalStep === 'products' ? (
                <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="bg-[#007ACC] text-white p-3 rounded-2xl shadow-lg"><ShoppingBasket size={24} /></div>
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

      {/* Footer Geral */}
      <footer className="bg-[#002B45] text-white pt-24 pb-12 rounded-t-[4rem]">
        <div className="container mx-auto px-4 text-center">
          <div className="flex justify-center gap-6 mb-12">
            <a href="https://instagram.com/sorvetesmauriti" className="bg-white/10 p-4 rounded-full hover:bg-[#007ACC] transition-all"><Instagram /></a>
            <a href={`https://wa.me/${WHATSAPP_NUMBER}`} className="bg-white/10 p-4 rounded-full hover:bg-[#007ACC] transition-all"><MessageCircle /></a>
          </div>
          <p className="text-gray-500 font-bold text-[10px] tracking-[0.4em] uppercase">© {new Date().getFullYear()} Sorvetes Mauriti | O Legítimo Sabor do Ceará</p>
        </div>
      </footer>
    </div>
  );
};

export default App;
