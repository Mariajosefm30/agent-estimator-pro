import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Azure Retail Prices API - public, no auth needed
// Mirrors the tools from microsoft/mcp Azure.Mcp.Server
const AZURE_PRICES_API = "https://prices.azure.com/api/retail/prices";

interface AzurePriceItem {
  currencyCode: string;
  retailPrice: number;
  unitPrice: number;
  armRegionName: string;
  serviceName: string;
  productName: string;
  skuName: string;
  meterName: string;
  unitOfMeasure: string;
  type: string;
  isPrimaryMeterRegion: boolean;
  armSkuName: string;
}

interface AzurePricesResponse {
  Items: AzurePriceItem[];
  NextPageLink: string | null;
  Count: number;
}

// Queries matching the Azure MCP Server's get_prices tool
const PRICING_QUERIES = [
  {
    // PTU pricing - broad search for any provisioned throughput
    name: "PTU - Azure OpenAI Provisioned",
    filter: `serviceName eq 'Azure OpenAI Service' and contains(meterName, 'PTU') and currencyCode eq 'USD'`,
    target_field: "ptu_usd_per_hour",
  },
  {
    // Fallback: any provisioned managed SKU
    name: "PTU - Provisioned Managed",
    filter: `serviceName eq 'Azure OpenAI Service' and contains(skuName, 'Provisioned') and currencyCode eq 'USD' and armRegionName eq 'eastus'`,
    target_field: "ptu_usd_per_hour",
  },
  {
    // Copilot Studio message pricing
    name: "Copilot Studio Messages",
    filter: `serviceName eq 'Microsoft Copilot Studio' and currencyCode eq 'USD'`,
    target_field: "copilot_credit_usd",
  },
  {
    // Power Automate / Flow runs (for credits_per_flow_run context)
    name: "Power Automate",
    filter: `serviceName eq 'Power Automate' and currencyCode eq 'USD' and armRegionName eq 'eastus'`,
    target_field: null, // cache only
  },
];

async function fetchAzurePrices(filterQuery: string): Promise<AzurePriceItem[]> {
  const allItems: AzurePriceItem[] = [];
  let url: string | null = `${AZURE_PRICES_API}?$filter=${encodeURIComponent(filterQuery)}&api-version=2023-01-01-preview`;

  // Follow pagination (max 3 pages to avoid runaway)
  let pages = 0;
  while (url && pages < 3) {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Azure API returned ${response.status}: ${await response.text()}`);
    }
    const data: AzurePricesResponse = await response.json();
    allItems.push(...data.Items);
    url = data.NextPageLink;
    pages++;
  }

  return allItems;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const results: Record<string, any> = {};
    let ptuPrice: number | null = null;
    let copilotCreditPrice: number | null = null;

    for (const query of PRICING_QUERIES) {
      console.log(`Fetching: ${query.name}`);
      try {
        const items = await fetchAzurePrices(query.filter);
        console.log(`  Found ${items.length} items for "${query.name}"`);

        // Cache all results
        for (const item of items) {
          await supabase.from("retail_prices_cache").upsert(
            {
              sku_name: item.skuName,
              meter_name: item.meterName,
              product_name: item.productName,
              service_name: item.serviceName,
              region: item.armRegionName || "global",
              unit_price: item.unitPrice,
              unit_of_measure: item.unitOfMeasure,
              raw_data: item as any,
              last_updated: new Date().toISOString(),
            },
            { onConflict: "sku_name,meter_name,region" }
          );
        }

        // Extract key prices
        if (query.target_field === "ptu_usd_per_hour" && items.length > 0 && !ptuPrice) {
          // Find the most relevant PTU price (prefer primary meter region)
          const primary = items.find((i) => i.isPrimaryMeterRegion) || items[0];
          ptuPrice = primary.unitPrice;
          console.log(`  → PTU price: $${ptuPrice}/hour`);
        }

        if (query.target_field === "copilot_credit_usd" && items.length > 0 && !copilotCreditPrice) {
          // Find message-based pricing
          const messageItem = items.find((i) =>
            i.meterName.toLowerCase().includes("message")
          ) || items[0];
          copilotCreditPrice = messageItem.unitPrice;
          console.log(`  → Copilot credit price: $${copilotCreditPrice}`);
        }

        results[query.name] = {
          count: items.length,
          sample: items.slice(0, 3).map((i) => ({
            sku: i.skuName,
            meter: i.meterName,
            price: i.unitPrice,
            unit: i.unitOfMeasure,
          })),
        };
      } catch (err) {
        console.error(`  Error fetching "${query.name}":`, err);
        results[query.name] = { error: String(err) };
      }
    }

    // If we found prices, update assumptions table directly
    if (ptuPrice || copilotCreditPrice) {
      const updates: Record<string, number> = {};
      if (ptuPrice) updates.ptu_usd_per_hour = ptuPrice;
      if (copilotCreditPrice) updates.copilot_credit_usd = copilotCreditPrice;

      const { data: existing } = await supabase
        .from("assumptions")
        .select("id")
        .limit(1)
        .single();

      if (existing) {
        await supabase
          .from("assumptions")
          .update({ ...updates, updated_at: new Date().toISOString() })
          .eq("id", existing.id);
        console.log("Updated assumptions with live prices:", updates);
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        ptuPrice,
        copilotCreditPrice,
        queries: results,
        timestamp: new Date().toISOString(),
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
