-- Add unique constraint for upsert support on retail_prices_cache
ALTER TABLE public.retail_prices_cache 
ADD CONSTRAINT retail_prices_cache_sku_meter_region_unique 
UNIQUE (sku_name, meter_name, region);