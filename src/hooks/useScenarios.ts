import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Scenario, EstimatorInputs, EstimatorOutputs } from '@/types/estimator';
import { useAuth } from './useAuth';

// Type helper to work around generated types not having user_id yet
type ScenarioRow = {
  id: string;
  name: string;
  inputs: unknown;
  outputs: unknown;
  created_at: string;
  updated_at: string;
  user_id?: string;
};

export function useScenarios() {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['scenarios', user?.id],
    queryFn: async (): Promise<Scenario[]> => {
      if (!user) return [];
      
      // Use raw SQL query to work with user_id column
      const { data, error } = await supabase
        .from('scenarios')
        .select('*')
        .order('updated_at', { ascending: false });

      if (error) throw error;
      
      // Filter on client side since we can't use .eq with non-typed column
      const userScenarios = (data as unknown as ScenarioRow[]).filter(
        row => row.user_id === user.id
      );
      
      return userScenarios.map(row => ({
        ...row,
        inputs: row.inputs as EstimatorInputs,
        outputs: row.outputs as EstimatorOutputs,
      })) as Scenario[];
    },
    enabled: !!user,
  });
}

export function useScenario(id: string | null) {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['scenario', id],
    queryFn: async (): Promise<Scenario | null> => {
      if (!id) return null;
      
      const { data, error } = await supabase
        .from('scenarios')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (error) throw error;
      if (!data) return null;
      
      const row = data as unknown as ScenarioRow;
      
      // Verify ownership
      if (row.user_id !== user?.id) return null;
      
      return {
        ...row,
        inputs: row.inputs as EstimatorInputs,
        outputs: row.outputs as EstimatorOutputs,
      } as Scenario;
    },
    enabled: !!id && !!user,
  });
}

export function useSaveScenario() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

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
      if (!user) throw new Error('Must be logged in to save scenarios');
      
      // Insert with user_id
      const insertData = {
        name,
        inputs,
        outputs,
        user_id: user.id,
      };
      
      const { data, error } = await supabase
        .from('scenarios')
        .insert(insertData as any)
        .select()
        .single();

      if (error) throw error;
      
      const row = data as unknown as ScenarioRow;
      return {
        ...row,
        inputs: row.inputs as EstimatorInputs,
        outputs: row.outputs as EstimatorOutputs,
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
      const updates: Record<string, unknown> = {};
      if (name !== undefined) updates.name = name;
      if (inputs !== undefined) updates.inputs = inputs;
      if (outputs !== undefined) updates.outputs = outputs;

      const { data, error } = await supabase
        .from('scenarios')
        .update(updates as any)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      
      const row = data as unknown as ScenarioRow;
      return {
        ...row,
        inputs: row.inputs as EstimatorInputs,
        outputs: row.outputs as EstimatorOutputs,
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
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (id: string) => {
      if (!user) throw new Error('Must be logged in to duplicate scenarios');
      
      const { data: originalData, error: fetchError } = await supabase
        .from('scenarios')
        .select('*')
        .eq('id', id)
        .single();

      if (fetchError) throw fetchError;
      
      const original = originalData as unknown as ScenarioRow;

      const insertData = {
        name: `${original.name} (Copy)`,
        inputs: original.inputs,
        outputs: original.outputs,
        user_id: user.id,
      };

      const { data, error } = await supabase
        .from('scenarios')
        .insert(insertData as any)
        .select()
        .single();

      if (error) throw error;
      
      const row = data as unknown as ScenarioRow;
      return {
        ...row,
        inputs: row.inputs as EstimatorInputs,
        outputs: row.outputs as EstimatorOutputs,
      } as Scenario;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['scenarios'] });
    },
  });
}
