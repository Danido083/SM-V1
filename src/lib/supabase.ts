/**
 * @file src/lib/supabase.ts
 * @description Cliente Supabase singleton.
 *
 * Variáveis de ambiente necessárias (.env.local):
 *   VITE_SUPABASE_URL      = https://xxxxxxxxxxxx.supabase.co
 *   VITE_SUPABASE_ANON_KEY = eyJhbGci...
 *
 * A anon key é segura para o front-end — o RLS garante que only INSERT é permitido.
 */

import { createClient } from '@supabase/supabase-js';

console.log('Passo 1: Iniciado - Verificando variáveis do Supabase (src/lib/supabase.ts)');

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

if (!supabaseUrl || !supabaseAnonKey) {
    console.error(
        '[Mauriti] ERRO CRÍTICO: Supabase não configurado. Adicione VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY no .env.local',
    );
}

// Fallback prevents fatal crash on module load for WSOD. 
// Any operation will fail gracefully where handled (e.g. useOrderSubmit).
export const supabase = createClient(
    supabaseUrl || 'https://placeholder.supabase.co',
    supabaseAnonKey || 'placeholder'
);
