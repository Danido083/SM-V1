import { useState, useEffect } from 'react';
import { Product } from '../features/catalog/types';
import { API_URL } from '../config/constants';
import { FALLBACK_PRODUCTS } from '../data/fallback';

interface UseProductsResult {
    products: Product[];
    isLoading: boolean;
}

/**
 * Hook responsável por buscar os produtos da API.
 * Em caso de falha ou timeout, usa os dados de fallback locais.
 */
export function useProducts(): UseProductsResult {
    const [products, setProducts] = useState<Product[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const controller = new AbortController();

        const timeout = setTimeout(() => {
            controller.abort();
            console.warn('⏱️ API demorou demais — usando fallback');
            setProducts(FALLBACK_PRODUCTS);
            setIsLoading(false);
        }, 5000);

        fetch(API_URL, { signal: controller.signal })
            .then((res) => {
                if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
                return res.json();
            })
            .then((data) => {
                clearTimeout(timeout);
                const productList: Product[] = Array.isArray(data) ? data : (data.products ?? []);
                setProducts(productList.length > 0 ? productList : FALLBACK_PRODUCTS);
                setIsLoading(false);
            })
            .catch((error) => {
                clearTimeout(timeout);
                if (error.name !== 'AbortError') {
                    console.error('❌ Erro ao carregar produtos:', error);
                }
                setProducts(FALLBACK_PRODUCTS);
                setIsLoading(false);
            });

        return () => {
            clearTimeout(timeout);
            controller.abort();
        };
    }, []);

    return { products, isLoading };
}
