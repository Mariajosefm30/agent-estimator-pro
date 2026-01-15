import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Assumptions, AgentP3Tier } from '@/types/estimator';

const DEFAULT_ASSUMPTIONS: Omit<Assumptions, 'id' | 'created_at' | 'updated_at'> = {
  copilot_credit_usd: 0.01,
  ptu_usd_per_hour: 1.00,
  tenant_graph_grounding_credits: 10,
  generative_answer_credits: 2,
  non_tenant_grounding_credits: 2,
  prompt_basic_per_10: 1,
  prompt_standard_per_10: 15,
  prompt_premium_per_10: 100,
  avg_actions_per_query: 5,
  credits_per_action: 1,
  credits_per_flow_run: 25,
  credits_per_trigger_run: 25,
  agent_p3_tiers: [
    { tier: 1, acus: 20000, estimated_cost: 19000, discount_pct: 5 },
    { tier: 2, acus: 100000, estimated_cost: 90000, discount_pct: 10 },
    { tier: 3, acus: 500000, estimated_cost: 425000, discount_pct: 20 },
  ],
  use_api_pricing: false,
};

export function useAssumptions() {
  return useQuery({
    queryKey: ['assumptions'],
    queryFn: async (): Promise<Assumptions> => {
      const { data, error } = await supabase
        .from('assumptions')
        .select('*')
        .limit(1)
        .single();

      if (error) {
        // If no row exists, create one with defaults
        if (error.code === 'PGRST116') {
          const { data: newData, error: insertError } = await supabase
            .from('assumptions')
            .insert({})
            .select()
            .single();
          
          if (insertError) throw insertError;
          return {
            ...newData,
            agent_p3_tiers: newData.agent_p3_tiers as unknown as AgentP3Tier[],
          } as Assumptions;
        }
        throw error;
      }

      return {
        ...data,
        agent_p3_tiers: data.agent_p3_tiers as unknown as AgentP3Tier[],
      } as Assumptions;
    },
  });
}

export function useUpdateAssumptions() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (updates: Partial<Omit<Assumptions, 'id' | 'created_at' | 'updated_at'>>) => {
      const { data: existing } = await supabase
        .from('assumptions')
        .select('id')
        .limit(1)
        .single();

      if (!existing) {
        throw new Error('No assumptions record found');
      }

      const { data, error } = await supabase
        .from('assumptions')
        .update(updates as any)
        .eq('id', existing.id)
        .select()
        .single();

      if (error) throw error;
      return {
        ...data,
        agent_p3_tiers: data.agent_p3_tiers as unknown as AgentP3Tier[],
      } as Assumptions;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assumptions'] });
    },
  });
}
