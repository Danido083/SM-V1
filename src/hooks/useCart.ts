import { useState } from 'react';

type Cart = Record<string | number, number>;

interface UseCartResult {
    cart: Cart;
    totalItems: number;
    updateQty: (id: string | number, qty: number) => void;
    clearCart: () => void;
}

/**
 * Hook responsável por gerenciar o estado do carrinho de pedidos.
 */
export function useCart(): UseCartResult {
    const [cart, setCart] = useState<Cart>({});

    const totalItems = Object.values(cart).reduce((sum: number, qty: number) => sum + qty, 0);

    const updateQty = (id: string | number, qty: number) => {
        const safeQty: number = Math.max(0, qty);
        setCart((prev) => ({ ...prev, [id]: safeQty }));
    };

    const clearCart = () => setCart({});

    return { cart, totalItems, updateQty, clearCart };
}
