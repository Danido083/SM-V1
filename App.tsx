
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

const API_URL = 'https://script.google.com/macros/s/AKfycbzT6VNI9PO4rlhOEwoi-R5ou_GhBfsHPIm2Ki7-dBgr31RlauLUsR7YjLXzAugjlYIu/exec';
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
        {product.img ? (
          <img src={product.img} alt={product.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" loading="lazy" />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-amber-50">
            <span className="text-5xl">🍦</span>
            <span className="text-xs text-gray-400 mt-2 font-medium text-center px-2">{product.name.split(' - ')[0]}</span>
          </div>
        )}
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

// --- Dados de Fallback ---

const FALLBACK_PRODUCTS: Product[] = [
  { id: 1001, name: 'Sundae - Chocolate e Flocos', category: 'potes', img: 'https://res.cloudinary.com/domma0qk3/image/upload/v1770148633/WPS_Photoseee_1_-Photoroom_yjywz6.png', description: 'Chocolate e Flocos' },
  { id: 1002, name: 'Copão Sedução napolitano', category: 'potes', img: 'https://res.cloudinary.com/domma0qk3/image/upload/v1770148866/WPS_Paaahotos_1_-Photoroom_u3e0e1.png', description: 'Morango, Creme e chocolate' },
  { id: 1003, name: 'Cremosinho - Azul do céu', category: 'picole', img: 'https://res.cloudinary.com/domma0qk3/image/upload/v1770148960/WewgfPS_Photos_1_-Photoroom_y3tfjr.png', description: 'Sabor Principal' },
  { id: 1004, name: 'Cremosinho - Morango', category: 'picole', img: 'https://res.cloudinary.com/domma0qk3/image/upload/v1770149045/WPS_Photos_1av_-Photoroom_gkxdrm.png', description: 'Morango cremoso' },
  { id: 1005, name: 'Cremosinho - Leite Condensado', category: 'picole', img: 'https://res.cloudinary.com/domma0qk3/image/upload/v1770149103/WPS_Photos_fgm1_-Photoroom_zs9xl0.png', description: 'Leite condensado' },
  { id: 1006, name: 'Mauricone - Brigadeiro', category: 'potes', img: 'https://res.cloudinary.com/domma0qk3/image/upload/v1770149152/WPS_Photos_1_s-removebg-preview_ka9xe5.png', description: 'Brigadeiro' },
  { id: 1007, name: 'Mauricone - Morango', category: 'potes', img: 'https://res.cloudinary.com/domma0qk3/image/upload/v1770149181/WPS_Photos_1_ee-removebg-preview_wiulmd.png', description: 'Morango' },
  { id: 1008, name: 'Mauricone - Leitinho com trufas', category: 'potes', img: 'https://res.cloudinary.com/domma0qk3/image/upload/v1770149218/WPS_Photos_1_a-removebg-preview_bwvwlj.png', description: 'Leite cremoso com trufas' },
  { id: 1009, name: 'Mauriti - açaí 1L', category: 'acai', img: 'https://res.cloudinary.com/domma0qk3/image/upload/v1770149262/WPS_Photos_af1_-Photoroom_qer94k.png', description: 'Açaí Puro' },
  { id: 1010, name: 'Mauriti - açaí - potinho', category: 'acai', img: 'https://res.cloudinary.com/domma0qk3/image/upload/v1770149300/WPS_Photos_1_av-Photoroom_phixok.png', description: 'Açaí Puro' },
  { id: 1011, name: 'Napolicreme - 4 em 1 - Pote 2L', category: 'potes', img: 'https://res.cloudinary.com/domma0qk3/image/upload/v1770149335/WPS_Photos_1evqwa_-Photoroom_w9lz3c.png', description: 'Morango, Baunilha, Creme e chocolate' },
  { id: 1012, name: 'Plus + Sorvete e Calda', category: 'potes', img: 'https://res.cloudinary.com/domma0qk3/image/upload/v1770149405/WPS_Photos_sdbvc1_-Photoroom_pqgmxy.png', description: 'Frutas vermelhas' },
  { id: 1013, name: 'Pavê - pote 1L', category: 'potes', img: 'https://res.cloudinary.com/domma0qk3/image/upload/v1770149454/WPS_Phsvotos_1_-Photoroom_jczgfz.png', description: 'Pavê' },
  { id: 1014, name: 'Potinho sensação - Leitinho com trufas', category: 'potes', img: 'https://res.cloudinary.com/domma0qk3/image/upload/v1770149576/WPS_Photos_1a_vsd_-Photoroom_skokvc.png', description: 'Leite cremoso com trufas' },
  { id: 1015, name: 'Picolé cremoso - amendoim', category: 'picole', img: 'https://res.cloudinary.com/domma0qk3/image/upload/v1770149655/WPS_Photos_a1_-Photoroom-removebg-preview_b64rfy.png', description: 'Amendoim' },
  { id: 1016, name: 'Picolé cremoso - Chocolate', category: 'picole', img: 'https://res.cloudinary.com/domma0qk3/image/upload/v1770149655/WPS_Photos_avv1_-Photoroom_uvdofx.png', description: 'Chocolate' },
  { id: 1017, name: 'Picolé cremoso - Tapioca', category: 'picole', img: 'https://res.cloudinary.com/domma0qk3/image/upload/v1770149654/WPS_Photos_1_s-removebg-preview_qc6ewx.png', description: 'Tapioca' },
  { id: 1018, name: 'Picolé cremoso - Açaí com banana', category: 'picole', img: 'https://res.cloudinary.com/domma0qk3/image/upload/v1770149655/WPS_Photos_1a_-removebg-preview_q4zuqn.png', description: 'Açaí e banana' },
  { id: 1019, name: 'Picolé cremoso - Morango', category: 'picole', img: 'https://res.cloudinary.com/domma0qk3/image/upload/v1770149654/WPS_Photos_1sdvdszv_-removebg-preview_zylkxb.png', description: 'Morango' },
  { id: 1020, name: 'Picolé cremoso - Coco', category: 'picole', img: 'https://res.cloudinary.com/domma0qk3/image/upload/v1770149654/WPS_Phavotos_1_-Photoroom-removebg-preview_r7nfy9.png', description: 'Coco' },
  { id: 1021, name: 'Picolé crocante branco', category: 'picole', img: 'https://res.cloudinary.com/domma0qk3/image/upload/v1770149898/WPS_Photos_1_a-removebg-preview_owa1md.png', description: 'Chocolate branco' },
  { id: 1022, name: 'Picolé - Linha frutas: Limão', category: 'picole', img: 'https://res.cloudinary.com/domma0qk3/image/upload/v1770149927/WPS_Photosav_1_-Photoroom_wlhzmt.png', description: 'Limão' },
  { id: 1023, name: 'Picolé - Linha frutas: Tamarindo', category: 'picole', img: 'https://res.cloudinary.com/domma0qk3/image/upload/v1770149927/WPS_Photos_1_dfgh-Photoroom_nxl73b.png', description: 'Tamarindo' },
  { id: 1024, name: 'Picolé - linha frutas: Cajá', category: 'picole', img: 'https://res.cloudinary.com/domma0qk3/image/upload/v1770149927/WPS_Photos_a1_-Photoroom_y6znbr.png', description: 'Cajá' },
  { id: 1025, name: 'Gelo sabor energético', category: 'gelo', img: 'https://res.cloudinary.com/domma0qk3/image/upload/v1770150028/gelo_sabor_energetico-Photoroom_eiwshm.png', description: 'Energético' },
  { id: 1026, name: 'Gelo sabor coco', category: 'gelo', img: 'https://res.cloudinary.com/domma0qk3/image/upload/v1770150028/agua_de_coco-Photoroom_toyugw.png', description: 'Coco' },
  { id: 1027, name: 'Paletas recheadas - Banana com Leite condensado', category: 'picole', img: 'https://res.cloudinary.com/domma0qk3/image/upload/v1770150067/WPS_Photos_1_s-removebg-preview_fuboyd.png', description: 'Banana e leite condensado' },
  { id: 1028, name: 'Paletas recheadas - Morango com Leite condensado', category: 'picole', img: 'https://res.cloudinary.com/domma0qk3/image/upload/v1770150067/WPS_Photos_1_fd-Photoroom_fqgbcq.png', description: 'Morango e Leite condensado' },
  { id: 1029, name: 'Picolé - Chocookie', category: 'picole', img: 'https://res.cloudinary.com/domma0qk3/image/upload/v1770150228/WPS_Pfdhotos_1_-Photoroom_l7tmcv.png', description: 'Cookie de chocolate' },
  { id: 1030, name: 'Picolé - R$ 1,50 Morango', category: 'picole', img: 'https://res.cloudinary.com/domma0qk3/image/upload/v1770150267/WPS_Psdhotos_1_-Photoroom_o1gsj6.png', description: 'Morango' },
  { id: 1031, name: 'Picolé - R$ 1,50 Tutti-Frutti', category: 'picole', img: 'https://res.cloudinary.com/domma0qk3/image/upload/v1770150267/WPS_Pshotos_1_-Photoroom_eqjkpr.png', description: 'Tutti Frutti' },
  { id: 1032, name: 'Picolé - R$ 2,00 Chocolate Branco', category: 'picole', img: 'https://res.cloudinary.com/domma0qk3/image/upload/v1770150371/WPS_Photasos_1_-Photoroom_dijyck.png', description: 'Chocolate Branco' },
  { id: 1033, name: 'Picolé - R$ 2,00 Coco queimado', category: 'picole', img: 'https://res.cloudinary.com/domma0qk3/image/upload/v1770150371/WPS_Photoss_1_-Photoroom-removebg-preview_fkwnop.png', description: 'Coco queimado' },
  { id: 1034, name: 'Picolé - R$ 3,50 Açaí com Leite condensado', category: 'picole', img: 'https://res.cloudinary.com/domma0qk3/image/upload/v1770150446/WPS_Photovs_1_-Photoroom_g0ieay.png', description: 'Açaí com Leite condensado' },
  { id: 1035, name: 'Picolé - R$ 3,50 Grego', category: 'picole', img: 'https://res.cloudinary.com/domma0qk3/image/upload/v1770150446/WPS_Phsdotos_1_-Photoroom_lo3ft8.png', description: 'Grego' },
  { id: 1036, name: 'Picolé - R$ Nata Goiaba', category: 'picole', img: 'https://res.cloudinary.com/domma0qk3/image/upload/v1770150447/WPSz_Photos_1_-Photoroom_pfl0in.png', description: 'Nata e Goiaba' },
  { id: 1037, name: 'Picolé - R$ 3,50 Skimó', category: 'picole', img: 'https://res.cloudinary.com/domma0qk3/image/upload/v1770150570/WPS_Photos_1asdf_-Photoroom_tdgsz9.png', description: 'Skimó' },
  { id: 1038, name: 'Picolé - R$ 3,50 Brigadeiro', category: 'picole', img: 'https://res.cloudinary.com/domma0qk3/image/upload/v1770150570/WPS_Photos_1sadv_-Photoroom_egsmjj.png', description: 'Brigadeiro' },
  { id: 1039, name: 'Picolé caseiro - Receitas da vovó leite condensado', category: 'picole', img: 'https://res.cloudinary.com/domma0qk3/image/upload/v1770150674/WPS_Phsdotos_1_-Photoroom_yab97k.png', description: 'Leite condensado' },
  { id: 1040, name: 'Picolé caseiro - Receitas da vovó Morango', category: 'picole', img: 'https://res.cloudinary.com/domma0qk3/image/upload/v1770150674/WPS_Phdsotos_1_-Photoroom_qce8fb.png', description: 'Morango' },
  { id: 1041, name: 'Supremacia - Maurikito', category: 'picole', img: 'https://res.cloudinary.com/domma0qk3/image/upload/v1770150758/WPS_Photos_1_-Photoroom_ordf7h.png', description: 'Maurikito' },
  { id: 1042, name: 'Supremacia - Mauri Rocher', category: 'picole', img: 'https://res.cloudinary.com/domma0qk3/image/upload/v1770150759/WPS_Photos_1_sdgfgb-Photoroom_dywbg5.png', description: 'Mauri Rocher' },
  { id: 1043, name: 'Supremacia - Mauricreme', category: 'picole', img: 'https://res.cloudinary.com/domma0qk3/image/upload/v1770150759/WPS_Photos_1_sfdgh-Photoroom_w2e7x3.png', description: 'Mauricreme' },
  { id: 1044, name: 'Supremacia - Bombom', category: 'picole', img: 'https://res.cloudinary.com/domma0qk3/image/upload/v1770150761/WPS_Photosasdccs_1_-Photoroom_pffxld.png', description: 'Bombom' },
  { id: 1045, name: 'Supremacia - Mauritella', category: 'picole', img: 'https://res.cloudinary.com/domma0qk3/image/upload/v1770150762/WPS_Photosdvs_1_-Photoroom_w1gamf.png', description: 'Mauritella' },
  { id: 1046, name: 'Supremacia - Brigadeiro', category: 'picole', img: 'https://res.cloudinary.com/domma0qk3/image/upload/v1770150762/WPS_Phosvsvtos_1_-Photoroom_rthxo4.png', description: 'Brigadeiro' },
  { id: 1047, name: 'Supremacia - Sublime', category: 'picole', img: 'https://res.cloudinary.com/domma0qk3/image/upload/v1770150763/WPS_Photos_1_1-Photoroom_q4ezuo.png', description: 'Sublime' },
  { id: 1048, name: 'Pote 2L - Tropical picante', category: 'gourmet', img: 'https://res.cloudinary.com/domma0qk3/image/upload/v1770151538/tropical-picante_kcgnbk.jpg', description: 'Tropical picante' },
  { id: 1049, name: 'Pote 2L - Toffe', category: 'gourmet', img: 'https://res.cloudinary.com/domma0qk3/image/upload/v1770151535/toffe_bnj4qs.jpg', description: 'Toffe' },
  { id: 1050, name: 'Pote 2L - Pipoca', category: 'gourmet', img: 'https://res.cloudinary.com/domma0qk3/image/upload/v1770151535/pipoca_v8essn.jpg', description: 'Pipoca' },
  { id: 1051, name: 'Pote 2L - Pavê', category: 'potes', img: 'https://res.cloudinary.com/domma0qk3/image/upload/v1770151534/pave_v0ly0k.jpg', description: 'Pavê' },
  { id: 1052, name: 'Pote 2L - Napolitano', category: 'potes', img: 'https://res.cloudinary.com/domma0qk3/image/upload/v1770151531/Napolitano_ihur1x.jpg', description: 'Napolitano' },
  { id: 1053, name: 'Pote 2L - Morango', category: 'potes', img: 'https://res.cloudinary.com/domma0qk3/image/upload/v1770151530/morango_nyid0n.jpg', description: 'Morango' },
  { id: 1054, name: 'Pote 2L - Leitinho com trufas', category: 'potes', img: 'https://res.cloudinary.com/domma0qk3/image/upload/v1770151527/leitinho-com-trufas_qjpdiu.jpg', description: 'Leitinho com trufas' },
  { id: 1055, name: 'Pote 2L - Creme com passas', category: 'potes', img: 'https://res.cloudinary.com/domma0qk3/image/upload/v1770151525/creme-com-passas_izsuzs.jpg', description: 'Creme com passas' },
  { id: 1056, name: 'Pote 2L - Duo', category: 'potes', img: 'https://res.cloudinary.com/domma0qk3/image/upload/v1770151525/duo-ao-leite_owgddr.jpg', description: 'Duo ao leite' },
  { id: 1057, name: 'Pote 2L - Açaí com banana', category: 'acai', img: 'https://res.cloudinary.com/domma0qk3/image/upload/v1770151525/acai-com-banana_gv0tge.jpg', description: 'Açaí com banana' },
  { id: 1058, name: 'Picolé cremoso - Leite condensado', category: 'picole', img: 'https://res.cloudinary.com/domma0qk3/image/upload/v1770149655/WPS_Photosdvsdvs_1_-Photoroom_tsagul.png', description: 'Leite condensado' },
];

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

    const controller = new AbortController();
    const timeout = setTimeout(() => {
      controller.abort();
      console.warn('⏱️ API demorou demais — usando fallback');
      setProducts(FALLBACK_PRODUCTS);
      setIsLoading(false);
    }, 5000);

    fetch(API_URL, { signal: controller.signal })
      .then(r => {
        console.log('✅ Resposta recebida:', r.status, r.statusText);
        if (!r.ok) throw new Error(`HTTP ${r.status}: ${r.statusText}`);
        return r.json();
      })
      .then(data => {
        clearTimeout(timeout);
        console.log('📦 Dados recebidos:', data);
        const productList = Array.isArray(data) ? data : (data.products || []);
        console.log('🍦 Produtos processados:', productList.length, 'itens');
        if (productList.length > 0) {
          setProducts(productList);
        } else {
          console.warn('⚠️ API retornou vazio, usando fallback');
          setProducts(FALLBACK_PRODUCTS);
        }
        setIsLoading(false);
      })
      .catch(error => {
        clearTimeout(timeout);
        if (error.name !== 'AbortError') {
          console.error('❌ Erro ao carregar produtos:', error);
        }
        setProducts(FALLBACK_PRODUCTS);
        setIsLoading(false);
      });

    const handleScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      clearTimeout(timeout);
      controller.abort();
      window.removeEventListener('scroll', handleScroll);
    };
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
