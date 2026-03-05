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
        console.log('Passo 5: useProducts montado - Iniciando busca de produtos');
        const controller = new AbortController();
        let isMounted = true;

        const timeout = setTimeout(() => {
            controller.abort();
            console.warn('⏱️ Passo 5 Aviso: API demorou demais — forçando fallback de produtos');
            if (isMounted) {
                setProducts(FALLBACK_PRODUCTS);
                setIsLoading(false);
            }
        }, 5000);

        const fetchProducts = async () => {
            try {
                const res = await fetch(API_URL, { signal: controller.signal });
                if (!res.ok) {
                    throw new Error(`HTTP ${res.status}: ${res.statusText}`);
                }
                const data = await res.json();

                clearTimeout(timeout);
                if (!isMounted) return;

                const productList: Product[] = Array.isArray(data) ? data : (data?.products ?? []);
                setProducts(productList.length > 0 ? productList : FALLBACK_PRODUCTS);
                console.log('Passo 6: Produtos carregados com sucesso');
            } catch (error: any) {
                clearTimeout(timeout);
                if (!isMounted) return;

                if (error.name !== 'AbortError') {
                    console.error('❌ Passo 6 Erro FATAL (Capturado): Fallback ativado. Erro ao buscar:', error);
                }
                // Previne Uncaught Promise Rejection definindo o fallback de forma segura
                setProducts(FALLBACK_PRODUCTS);
            } finally {
                if (isMounted) {
                    setIsLoading(false);
                }
            }
        };

        fetchProducts();

        return () => {
            isMounted = false;
            clearTimeout(timeout);
            controller.abort();
        };
    }, []);

    return { products, isLoading };
}
