import { useState, useMemo, useEffect } from 'react';

type Cart = Record<string, number>;

const CART_STORAGE_KEY = 'mauriti:cart';

/** Carrega o carrinho do localStorage de forma segura. */
function loadCartFromStorage(): Cart {
    try {
        const raw = localStorage.getItem(CART_STORAGE_KEY);
        return raw ? (JSON.parse(raw) as Cart) : {};
    } catch {
        return {};
    }
}

interface UseCartResult {
    cart: Cart;
    totalItems: number;
    updateQty: (id: string, qty: number) => void;
    clearCart: () => void;
}

/**
 * Hook responsável por gerenciar o estado do carrinho de pedidos.
 * O carrinho é persistido no localStorage para sobreviver a reloads.
 */
export function useCart(): UseCartResult {
    const [cart, setCart] = useState<Cart>(loadCartFromStorage);

    // ─── Persistência ────────────────────────────────────────────────────────
    useEffect(() => {
        localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
    }, [cart]);

    // ─── Derivados ───────────────────────────────────────────────────────────
    const totalItems = useMemo(
        () => (Object.values(cart) as number[]).reduce((sum, qty) => sum + qty, 0),
        [cart],
    );

    // ─── Ações ───────────────────────────────────────────────────────────────
    const MAX_QTY_PER_ITEM = 999; // Teto por item: evita URL overflow no WhatsApp e payloads absurdos no BD
    const updateQty = (id: string, qty: number) => {
        const safeQty = Math.min(Math.max(0, qty), MAX_QTY_PER_ITEM);
        setCart((prev) => ({ ...prev, [id]: safeQty }));
    };

    const clearCart = () => setCart({});

    return { cart, totalItems, updateQty, clearCart };
}

