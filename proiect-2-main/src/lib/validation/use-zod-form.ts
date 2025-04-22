/**
 * Hook pentru validarea formularelor cu Zod
 * Acest fișier conține un hook pentru validarea formularelor folosind Zod și React Hook Form
 */

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, UseFormProps, UseFormReturn, FieldValues, DefaultValues } from 'react-hook-form';
import { z } from 'zod';

/**
 * Hook pentru validarea formularelor cu Zod
 * @param schema Schema Zod pentru validare
 * @param options Opțiuni pentru useForm
 * @returns Obiectul useForm cu validare Zod
 */
export function useZodForm<TSchema extends z.ZodType<any, any, any>>(
  schema: TSchema,
  options: Omit<UseFormProps<z.infer<TSchema>>, 'resolver'> = {}
): UseFormReturn<z.infer<TSchema>> {
  return useForm<z.infer<TSchema>>({
    ...options,
    resolver: zodResolver(schema),
  });
}

/**
 * Hook pentru validarea formularelor cu Zod și valori implicite
 * @param schema Schema Zod pentru validare
 * @param defaultValues Valorile implicite pentru formular
 * @param options Opțiuni pentru useForm
 * @returns Obiectul useForm cu validare Zod și valori implicite
 */
export function useZodFormWithDefaults<TSchema extends z.ZodType<any, any, any>>(
  schema: TSchema,
  defaultValues: DefaultValues<z.infer<TSchema>>,
  options: Omit<UseFormProps<z.infer<TSchema>>, 'resolver' | 'defaultValues'> = {}
): UseFormReturn<z.infer<TSchema>> {
  return useForm<z.infer<TSchema>>({
    ...options,
    defaultValues,
    resolver: zodResolver(schema),
  });
}

export default {
  useZodForm,
  useZodFormWithDefaults,
};
