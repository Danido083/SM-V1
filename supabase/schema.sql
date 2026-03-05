-- ══════════════════════════════════════════════════════════════════════════════
-- Sorvetes Mauriti — Schema B2B
-- Execute este script no "SQL Editor" do Supabase Dashboard.
-- ══════════════════════════════════════════════════════════════════════════════

-- ─── Extensão para UUID ────────────────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ─── Tabela: revendedores ──────────────────────────────────────────────────────
-- Cadastro dos clientes B2B (revendedores).
CREATE TABLE IF NOT EXISTS public.revendedores (
    id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    nome        TEXT        NOT NULL,
    whatsapp    TEXT        NOT NULL UNIQUE,
    cidade      TEXT        NOT NULL,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE public.revendedores IS 'Cadastro de revendedores B2B da Sorvetes Mauriti.';

-- ─── Tabela: pedidos_b2b ──────────────────────────────────────────────────────
-- Registra cada intenção de compra / cotação enviada pelo site.
CREATE TABLE IF NOT EXISTS public.pedidos_b2b (
    id             UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    revendedor_id  UUID        NOT NULL REFERENCES public.revendedores(id) ON DELETE CASCADE,
    itens_json     JSONB       NOT NULL,
    -- Estrutura esperada de itens_json:
    -- [{ "id": "1001", "nome": "Picolé Morango", "quantidade": 10, "categoria": "picole" }, ...]
    total_itens    INTEGER     NOT NULL CHECK (total_itens > 0),
    status         TEXT        NOT NULL DEFAULT 'pendente',
    created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE  public.pedidos_b2b IS 'Pedidos / cotações B2B enviados pelo site.';
COMMENT ON COLUMN public.pedidos_b2b.itens_json IS '[{id, nome, quantidade, categoria}] — permite análises por sabor.';
COMMENT ON COLUMN public.pedidos_b2b.status IS 'Workflow: pendente → em_analise → confirmado → entregue';

-- ─── Índices para análise mensal ──────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_pedidos_created_at     ON public.pedidos_b2b (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_pedidos_revendedor_id  ON public.pedidos_b2b (revendedor_id);
CREATE INDEX IF NOT EXISTS idx_pedidos_status         ON public.pedidos_b2b (status);
-- Índice GIN para consultas dentro do JSONB (ex: sabor mais pedido)
CREATE INDEX IF NOT EXISTS idx_pedidos_itens_gin      ON public.pedidos_b2b USING gin (itens_json);

-- ══════════════════════════════════════════════════════════════════════════════
-- SEGURANÇA — Row Level Security (RLS)
-- O front-end usa a anon key (pública). Sem RLS, qualquer um pode ler tudo.
-- ══════════════════════════════════════════════════════════════════════════════

ALTER TABLE public.revendedores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pedidos_b2b  ENABLE ROW LEVEL SECURITY;

-- ─── Políticas: revendedores ──────────────────────────────────────────────────

DROP POLICY IF EXISTS "anon_insert_revendedores"  ON public.revendedores;
DROP POLICY IF EXISTS "block_select_revendedores" ON public.revendedores;

-- Permite que o site (anon) salve novos revendedores
CREATE POLICY "anon_insert_revendedores"
    ON public.revendedores
    FOR INSERT
    TO anon
    WITH CHECK (true);

-- Bloqueia SELECT do front-end (apenas service_role/dashboard vê os dados)
CREATE POLICY "block_select_revendedores"
    ON public.revendedores
    FOR SELECT
    TO anon
    USING (false);

-- ─── Políticas: pedidos_b2b ───────────────────────────────────────────────────

DROP POLICY IF EXISTS "anon_insert_pedidos"  ON public.pedidos_b2b;
DROP POLICY IF EXISTS "block_select_pedidos" ON public.pedidos_b2b;

-- Permite que o site (anon) registre pedidos
CREATE POLICY "anon_insert_pedidos"
    ON public.pedidos_b2b
    FOR INSERT
    TO anon
    WITH CHECK (true);

-- Bloqueia SELECT do front-end
CREATE POLICY "block_select_pedidos"
    ON public.pedidos_b2b
    FOR SELECT
    TO anon
    USING (false);

-- ══════════════════════════════════════════════════════════════════════════════
-- Query de exemplo para análise mensal (executar via Dashboard ou cron)
-- ══════════════════════════════════════════════════════════════════════════════
/*
  -- Top 10 sabores mais pedidos (último mês)
  SELECT
    item->>'nome'           AS sabor,
    SUM((item->>'quantidade')::int) AS total_unidades
  FROM public.pedidos_b2b,
       jsonb_array_elements(itens_json) AS item
  WHERE created_at >= NOW() - INTERVAL '30 days'
  GROUP BY sabor
  ORDER BY total_unidades DESC
  LIMIT 10;
*/
