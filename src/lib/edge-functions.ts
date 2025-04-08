import { supabase } from './supabase';

/**
 * Helper function to call Supabase Edge Functions
 * @param functionName The name of the edge function to call
 * @param payload The payload to send to the function
 * @returns The response from the function
 */
export async function callEdgeFunction<T = any, P = any>(
  functionName: string,
  payload?: P
): Promise<{ data: T | null; error: Error | null }> {
  try {
    // Adăugăm un timeout pentru a evita blocarea UI
    const timeoutPromise = new Promise<{ data: null, error: Error }>((_, reject) => {
      setTimeout(() => {
        reject({ data: null, error: new Error(`Timeout calling ${functionName}`) });
      }, 10000); // 10 secunde timeout
    });

    // Facem cererea către edge function
    const requestPromise = supabase.functions.invoke<T>(functionName, {
      body: payload,
      method: 'POST',
    }).then(({ data, error }) => {
      if (error) {
        console.error(`Error calling ${functionName}:`, error);
        return { data: null, error: new Error(error.message) };
      }
      return { data, error: null };
    });

    // Folosim Promise.race pentru a implementa timeout
    return await Promise.race([requestPromise, timeoutPromise]);
  } catch (err) {
    console.error(`Exception calling ${functionName}:`, err);
    const error = err instanceof Error ? err : new Error('Unknown error occurred');
    return { data: null, error };
  }
}

/**
 * Request supplementary materials
 */
export async function requestSuplimentar(materialId: string, quantity: number) {
  try {
    // Încercăm să folosim edge function
    const result = await callEdgeFunction('request-suplimentar', { materialId, quantity });

    // Dacă avem eroare, încercam direct cu Supabase
    if (result.error) {
      console.warn('Falling back to direct Supabase call for requestSuplimentar');
      const { data, error } = await supabase
        .from('materials')
        .update({ suplimentar: quantity })
        .eq('id', materialId)
        .select();

      if (error) {
        return { data: null, error: new Error(error.message) };
      }
      return { data, error: null };
    }

    return result;
  } catch (err) {
    console.error('Error in requestSuplimentar:', err);
    return { data: null, error: err instanceof Error ? err : new Error('Unknown error') };
  }
}

/**
 * Confirm supplementary materials
 */
export async function confirmSuplimentar(materialId: string) {
  try {
    // Încercăm să folosim edge function
    const result = await callEdgeFunction('confirm-suplimentar', { materialId });

    // Dacă avem eroare, încercam direct cu Supabase
    if (result.error) {
      console.warn('Falling back to direct Supabase call for confirmSuplimentar');

      // Mai întâi obținem materialul pentru a vedea cantitatea suplimentară
      const { data: material, error: fetchError } = await supabase
        .from('materials')
        .select('suplimentar, quantity')
        .eq('id', materialId)
        .single();

      if (fetchError) {
        return { data: null, error: new Error(fetchError.message) };
      }

      // Actualizăm materialul
      const { data, error } = await supabase
        .from('materials')
        .update({
          quantity: (material.quantity || 0) + (material.suplimentar || 0),
          suplimentar: 0
        })
        .eq('id', materialId)
        .select();

      if (error) {
        return { data: null, error: new Error(error.message) };
      }
      return { data, error: null };
    }

    return result;
  } catch (err) {
    console.error('Error in confirmSuplimentar:', err);
    return { data: null, error: err instanceof Error ? err : new Error('Unknown error') };
  }
}

/**
 * Adjust supplementary materials
 */
export async function adjustSuplimentar(materialId: string, adjustment: number) {
  try {
    // Încercăm să folosim edge function
    const result = await callEdgeFunction('adjust-suplimentar', { materialId, adjustment });

    // Dacă avem eroare, încercam direct cu Supabase
    if (result.error) {
      console.warn('Falling back to direct Supabase call for adjustSuplimentar');

      // Mai întâi obținem materialul pentru a calcula noua valoare
      const { data: material, error: fetchError } = await supabase
        .from('materials')
        .select('suplimentar')
        .eq('id', materialId)
        .single();

      if (fetchError) {
        return { data: null, error: new Error(fetchError.message) };
      }

      const currentValue = material.suplimentar || 0;
      const newValue = Math.max(0, currentValue + adjustment);

      // Actualizăm materialul
      const { data, error } = await supabase
        .from('materials')
        .update({ suplimentar: newValue })
        .eq('id', materialId)
        .select();

      if (error) {
        return { data: null, error: new Error(error.message) };
      }
      return { data, error: null };
    }

    return result;
  } catch (err) {
    console.error('Error in adjustSuplimentar:', err);
    return { data: null, error: err instanceof Error ? err : new Error('Unknown error') };
  }
}

/**
 * Delete material
 */
export async function deleteMaterial(materialId: string) {
  try {
    // Încercăm să folosim edge function
    const result = await callEdgeFunction('delete-material', { materialId });

    // Dacă avem eroare, încercam direct cu Supabase
    if (result.error) {
      console.warn('Falling back to direct Supabase call for deleteMaterial');
      const { data, error } = await supabase
        .from('materials')
        .delete()
        .eq('id', materialId);

      if (error) {
        return { data: null, error: new Error(error.message) };
      }
      return { data, error: null };
    }

    return result;
  } catch (err) {
    console.error('Error in deleteMaterial:', err);
    return { data: null, error: err instanceof Error ? err : new Error('Unknown error') };
  }
}
