import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Scenario, EstimatorInputs, EstimatorOutputs } from '@/types/estimator';

export function useScenarios() {
  return useQuery({
    queryKey: ['scenarios'],
    queryFn: async (): Promise<Scenario[]> => {
      const { data, error } = await supabase
        .from('scenarios')
        .select('*')
        .order('updated_at', { ascending: false });

      if (error) throw error;
      return data.map(row => ({
        ...row,
        inputs: row.inputs as unknown as EstimatorInputs,
        outputs: row.outputs as unknown as EstimatorOutputs,
      })) as Scenario[];
    },
  });
}

export function useScenario(id: string | null) {
  return useQuery({
    queryKey: ['scenario', id],
    queryFn: async (): Promise<Scenario | null> => {
      if (!id) return null;
      
      const { data, error } = await supabase
        .from('scenarios')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return {
        ...data,
        inputs: data.inputs as unknown as EstimatorInputs,
        outputs: data.outputs as unknown as EstimatorOutputs,
      } as Scenario;
    },
    enabled: !!id,
  });
}

export function useSaveScenario() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      name, 
      inputs, 
      outputs 
    }: { 
      name: string; 
      inputs: EstimatorInputs; 
      outputs: EstimatorOutputs;
    }) => {
      const { data, error } = await supabase
        .from('scenarios')
        .insert({
          name,
          inputs: inputs as any,
          outputs: outputs as any,
        })
        .select()
        .single();

      if (error) throw error;
      return {
        ...data,
        inputs: data.inputs as unknown as EstimatorInputs,
        outputs: data.outputs as unknown as EstimatorOutputs,
      } as Scenario;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['scenarios'] });
    },
  });
}

export function useUpdateScenario() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      id,
      name, 
      inputs, 
      outputs 
    }: { 
      id: string;
      name?: string; 
      inputs?: EstimatorInputs; 
      outputs?: EstimatorOutputs;
    }) => {
      const updates: any = {};
      if (name !== undefined) updates.name = name;
      if (inputs !== undefined) updates.inputs = inputs;
      if (outputs !== undefined) updates.outputs = outputs;

      const { data, error } = await supabase
        .from('scenarios')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return {
        ...data,
        inputs: data.inputs as unknown as EstimatorInputs,
        outputs: data.outputs as unknown as EstimatorOutputs,
      } as Scenario;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['scenarios'] });
      queryClient.invalidateQueries({ queryKey: ['scenario', data.id] });
    },
  });
}

export function useDeleteScenario() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('scenarios')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['scenarios'] });
    },
  });
}

export function useDuplicateScenario() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { data: original, error: fetchError } = await supabase
        .from('scenarios')
        .select('*')
        .eq('id', id)
        .single();

      if (fetchError) throw fetchError;

      const { data, error } = await supabase
        .from('scenarios')
        .insert({
          name: `${original.name} (Copy)`,
          inputs: original.inputs,
          outputs: original.outputs,
        })
        .select()
        .single();

      if (error) throw error;
      return {
        ...data,
        inputs: data.inputs as unknown as EstimatorInputs,
        outputs: data.outputs as unknown as EstimatorOutputs,
      } as Scenario;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['scenarios'] });
    },
  });
}
