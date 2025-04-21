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
        // Removed console statement

        // Verificăm dacă eroarea este legată de lipsa API key-ului și o gestionăm silențios
        if (error.message && error.message.includes('API key')) {
          // Removed console statement
          // Returnăm o eroare specială pentru a indica necesitatea folosirii fallback-ului
          return { data: null, error: new Error('FALLBACK_NEEDED') };
        }

        return { data: null, error: new Error(error.message) };
      }
      return { data, error: null };
    });

    // Folosim Promise.race pentru a implementa timeout
    try {
    return await Promise.race([requestPromise, timeoutPromise]);
    } catch (error) {
      // Handle error appropriately
    }
  } catch (err) {
    // Removed console statement
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
      // Verificăm dacă este o eroare specială sau orice altă eroare
      // Removed console statement
      try {
      const { data, error } = await supabase
      } catch (error) {
        // Handle error appropriately
      }
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
    // Removed console statement
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
      // Removed console statement

      // Mai întâi obținem materialul pentru a vedea cantitatea suplimentară
      try {
      const { data: material, error: fetchError } = await supabase
      } catch (error) {
        // Handle error appropriately
      }
        .from('materials')
        .select('suplimentar, quantity')
        .eq('id', materialId)
        .single();

      if (fetchError) {
        return { data: null, error: new Error(fetchError.message) };
      }

      // Actualizăm materialul
      try {
      const { data, error } = await supabase
      } catch (error) {
        // Handle error appropriately
      }
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
    // Removed console statement
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
      // Verificăm dacă este o eroare specială sau orice altă eroare
      // Removed console statement

      // Mai întâi obținem materialul pentru a calcula noua valoare
      try {
      const { data: material, error: fetchError } = await supabase
      } catch (error) {
        // Handle error appropriately
      }
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
      try {
      const { data, error } = await supabase
      } catch (error) {
        // Handle error appropriately
      }
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
    // Removed console statement
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
      // Verificăm dacă este o eroare specială sau orice altă eroare
      // Removed console statement
      try {
      const { data, error } = await supabase
      } catch (error) {
        // Handle error appropriately
      }
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
    // Removed console statement
    return { data: null, error: err instanceof Error ? err : new Error('Unknown error') };
  }
}
