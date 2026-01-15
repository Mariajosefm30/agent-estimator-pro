-- Create scenarios table for saving estimator scenarios
CREATE TABLE public.scenarios (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL DEFAULT 'Untitled Scenario',
    inputs JSONB NOT NULL DEFAULT '{}',
    outputs JSONB NOT NULL DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create assumptions table (single-row configuration)
CREATE TABLE public.assumptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    copilot_credit_usd NUMERIC NOT NULL DEFAULT 0.01,
    ptu_usd_per_hour NUMERIC NOT NULL DEFAULT 1.00,
    tenant_graph_grounding_credits INTEGER NOT NULL DEFAULT 10,
    generative_answer_credits INTEGER NOT NULL DEFAULT 2,
    non_tenant_grounding_credits INTEGER NOT NULL DEFAULT 2,
    prompt_basic_per_10 INTEGER NOT NULL DEFAULT 1,
    prompt_standard_per_10 INTEGER NOT NULL DEFAULT 15,
    prompt_premium_per_10 INTEGER NOT NULL DEFAULT 100,
    avg_actions_per_query INTEGER NOT NULL DEFAULT 5,
    credits_per_action NUMERIC NOT NULL DEFAULT 1,
    credits_per_flow_run NUMERIC NOT NULL DEFAULT 25,
    credits_per_trigger_run NUMERIC NOT NULL DEFAULT 25,
    agent_p3_tiers JSONB NOT NULL DEFAULT '[
        {"tier": 1, "acus": 20000, "estimated_cost": 19000, "discount_pct": 5},
        {"tier": 2, "acus": 100000, "estimated_cost": 90000, "discount_pct": 10},
        {"tier": 3, "acus": 500000, "estimated_cost": 425000, "discount_pct": 20}
    ]',
    use_api_pricing BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create retail prices cache table for Azure API data
CREATE TABLE public.retail_prices_cache (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sku_name TEXT NOT NULL,
    meter_name TEXT NOT NULL,
    region TEXT NOT NULL,
    unit_price NUMERIC NOT NULL,
    unit_of_measure TEXT NOT NULL,
    service_name TEXT NOT NULL,
    product_name TEXT NOT NULL,
    last_updated TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    raw_data JSONB,
    UNIQUE(sku_name, region)
);

-- Enable RLS on all tables
ALTER TABLE public.scenarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assumptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.retail_prices_cache ENABLE ROW LEVEL SECURITY;

-- Public read/write policies for scenarios (no auth required)
CREATE POLICY "Anyone can read scenarios"
    ON public.scenarios FOR SELECT
    USING (true);

CREATE POLICY "Anyone can create scenarios"
    ON public.scenarios FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Anyone can update scenarios"
    ON public.scenarios FOR UPDATE
    USING (true);

CREATE POLICY "Anyone can delete scenarios"
    ON public.scenarios FOR DELETE
    USING (true);

-- Public read/write policies for assumptions
CREATE POLICY "Anyone can read assumptions"
    ON public.assumptions FOR SELECT
    USING (true);

CREATE POLICY "Anyone can update assumptions"
    ON public.assumptions FOR UPDATE
    USING (true);

CREATE POLICY "Anyone can insert assumptions"
    ON public.assumptions FOR INSERT
    WITH CHECK (true);

-- Public read/write policies for retail prices cache
CREATE POLICY "Anyone can read retail prices"
    ON public.retail_prices_cache FOR SELECT
    USING (true);

CREATE POLICY "Anyone can insert retail prices"
    ON public.retail_prices_cache FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Anyone can update retail prices"
    ON public.retail_prices_cache FOR UPDATE
    USING (true);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_scenarios_updated_at
    BEFORE UPDATE ON public.scenarios
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_assumptions_updated_at
    BEFORE UPDATE ON public.assumptions
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default assumptions row
INSERT INTO public.assumptions (id) VALUES (gen_random_uuid());