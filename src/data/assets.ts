/**
 * @file src/data/assets.ts
 * @description Centralização de todas as URLs de imagem e assets externos usados na aplicação.
 * Ao centralizar aqui, troca de URL/CDN fica em um único lugar — sem caça aos arquivos.
 */

export const ASSETS = {
    /** Imagem hero da seção principal */
    heroProduct: 'https://i.imgur.com/Xz2kNrl.jpeg',

    /** Logo da marca */
    logo: 'https://i.imgur.com/x9X0ICd.png',

    /** Imagens das categorias do catálogo */
    categories: {
        picoles: 'https://i.imgur.com/mJfOgah.jpeg',
        potes2l: 'https://i.imgur.com/4YnqlcT.jpeg',
        acai: 'https://i.imgur.com/VWPnpF8.jpeg',
        gourmet: 'https://i.imgur.com/o9FoKWl.jpeg',
        gelo: 'https://res.cloudinary.com/domma0qk3/image/upload/v1770150028/gelo_sabor_energetico-Photoroom_eiwshm.png',
    },
} as const;
