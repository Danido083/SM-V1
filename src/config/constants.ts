// Configurações globais da aplicação

export const API_URL =
    'https://script.google.com/macros/s/AKfycbzT6VNI9PO4rlhOEwoi-R5ou_GhBfsHPIm2Ki7-dBgr31RlauLUsR7YjLXzAugjlYIu/exec';

export const WHATSAPP_NUMBER = '558899310129';

export const THEME = {
    primary: '#007ACC',
    secondary: '#FBBF24',
    radius: 'rounded-[3rem]',
    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
};

// Normaliza string removendo acentos e convertendo para minúsculas
export const normalizeStr = (str: string) =>
    str
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .trim();

export const CATEGORY_MAP: Record<
    string,
    { title: string; color: string; description: string; img: string; filter: (c: string) => boolean }
> = {
    picoles: {
        title: 'Nossos Picolés',
        color: 'bg-amber-50',
        description: 'O frescor da fruta no palito, direto do Ceará.',
        img: 'https://i.imgur.com/mJfOgah.jpeg',
        filter: (c) => normalizeStr(c) === 'picole',
    },
    'potes-2l': {
        title: 'Potes de 2 Litros',
        color: 'bg-blue-50',
        description: 'Cremosidade em família para os melhores momentos.',
        img: 'https://i.imgur.com/4YnqlcT.jpeg',
        filter: (c) => normalizeStr(c) === 'pote' || normalizeStr(c) === 'potes',
    },
    acai: {
        title: 'Energia Açaí',
        color: 'bg-purple-50',
        description: 'O autêntico sabor da energia pura.',
        img: 'https://i.imgur.com/VWPnpF8.jpeg',
        filter: (c) => normalizeStr(c) === 'acai',
    },
    gourmet: {
        title: 'Linha Gourmet',
        color: 'bg-pink-50',
        description: 'Experiências exclusivas para paladares exigentes.',
        img: 'https://i.imgur.com/o9FoKWl.jpeg',
        filter: (c) => normalizeStr(c) === 'gourmet',
    },
    gelo: {
        title: 'Gelo Sabor',
        color: 'bg-cyan-50',
        description: 'Refrescância pura para os dias quentes.',
        img: 'https://res.cloudinary.com/domma0qk3/image/upload/v1770150028/gelo_sabor_energetico-Photoroom_eiwshm.png',
        filter: (c) => normalizeStr(c) === 'gelo',
    },
};
