/**
 * Hook pentru formulare
 * Acest fișier conține un hook pentru lucrul cu formulare
 */

import { useState, useCallback, useEffect, FormEvent } from 'react';
import { z } from 'zod';
import {
  validateWithZod,
  ValidationError,
  ValidationResult,
  getFieldErrors,
  hasFieldErrors,
  getFirstFieldError,
  getDefaultValues,
} from './form-utils';

/**
 * Opțiunile pentru hook-ul de formular
 */
export interface UseFormOptions<T> {
  initialValues?: Partial<T>;
  schema: z.ZodType<T>;
  onSubmit?: (data: T) => void | Promise<void>;
  validateOnChange?: boolean;
  validateOnBlur?: boolean;
  validateOnSubmit?: boolean;
}

/**
 * Rezultatul hook-ului de formular
 */
export interface UseFormResult<T> {
  values: T;
  errors: ValidationError[];
  touched: Record<string, boolean>;
  isSubmitting: boolean;
  isValid: boolean;
  isDirty: boolean;
  handleChange: (name: keyof T, value: any) => void;
  handleBlur: (name: keyof T) => void;
  handleSubmit: (e?: FormEvent) => Promise<void>;
  setValues: (values: Partial<T>) => void;
  setValue: (name: keyof T, value: any) => void;
  resetForm: () => void;
  validateForm: () => ValidationResult<T>;
  getFieldProps: (name: keyof T) => {
    name: string;
    value: any;
    onChange: (e: any) => void;
    onBlur: () => void;
    error: string;
    hasError: boolean;
  };
}

/**
 * Hook pentru formulare
 * @param options Opțiunile pentru formular
 * @returns Rezultatul hook-ului
 */
export function useForm<T extends Record<string, any>>(
  options: UseFormOptions<T>
): UseFormResult<T> {
  // Obținem valorile implicite din schemă
  const defaultValues = getDefaultValues(options.schema);
  
  // Starea pentru valori
  const [values, setValues] = useState<T>({
    ...defaultValues,
    ...options.initialValues,
  } as T);
  
  // Starea pentru erori
  const [errors, setErrors] = useState<ValidationError[]>([]);
  
  // Starea pentru câmpurile atinse
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  
  // Starea pentru trimitere
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Starea pentru validitate
  const [isValid, setIsValid] = useState(false);
  
  // Starea pentru modificare
  const [isDirty, setIsDirty] = useState(false);
  
  // Opțiunile pentru validare
  const validateOnChange = options.validateOnChange ?? false;
  const validateOnBlur = options.validateOnBlur ?? true;
  const validateOnSubmit = options.validateOnSubmit ?? true;
  
  /**
   * Validează formularul
   * @returns Rezultatul validării
   */
  const validateForm = useCallback((): ValidationResult<T> => {
    const result = validateWithZod(options.schema, values);
    
    setErrors(result.errors || []);
    setIsValid(result.success);
    
    return result;
  }, [options.schema, values]);
  
  /**
   * Tratează schimbarea unui câmp
   * @param name Numele câmpului
   * @param value Valoarea câmpului
   */
  const handleChange = useCallback(
    (name: keyof T, value: any) => {
      setValues((prevValues) => ({
        ...prevValues,
        [name]: value,
      }));
      
      setIsDirty(true);
      
      if (validateOnChange) {
        validateForm();
      }
    },
    [validateOnChange, validateForm]
  );
  
  /**
   * Tratează pierderea focusului de pe un câmp
   * @param name Numele câmpului
   */
  const handleBlur = useCallback(
    (name: keyof T) => {
      setTouched((prevTouched) => ({
        ...prevTouched,
        [name]: true,
      }));
      
      if (validateOnBlur) {
        validateForm();
      }
    },
    [validateOnBlur, validateForm]
  );
  
  /**
   * Tratează trimiterea formularului
   * @param e Evenimentul de trimitere
   */
  const handleSubmit = useCallback(
    async (e?: FormEvent) => {
      if (e) {
        e.preventDefault();
      }
      
      setIsSubmitting(true);
      
      try {
        let isFormValid = isValid;
        
        if (validateOnSubmit) {
          const result = validateForm();
          isFormValid = result.success;
        }
        
        if (isFormValid && options.onSubmit) {
          try {
          await options.onSubmit(values);
          } catch (error) {
            // Handle error appropriately
          }
        }
      } finally {
        setIsSubmitting(false);
      }
    },
    [isValid, validateOnSubmit, validateForm, options, values]
  );
  
  /**
   * Setează valorile formularului
   * @param newValues Noile valori
   */
  const setFormValues = useCallback((newValues: Partial<T>) => {
    setValues((prevValues) => ({
      ...prevValues,
      ...newValues,
    }));
    
    setIsDirty(true);
    
    if (validateOnChange) {
      validateForm();
    }
  }, [validateOnChange, validateForm]);
  
  /**
   * Setează valoarea unui câmp
   * @param name Numele câmpului
   * @param value Valoarea câmpului
   */
  const setValue = useCallback(
    (name: keyof T, value: any) => {
      handleChange(name, value);
    },
    [handleChange]
  );
  
  /**
   * Resetează formularul
   */
  const resetForm = useCallback(() => {
    setValues({
      ...defaultValues,
      ...options.initialValues,
    } as T);
    
    setErrors([]);
    setTouched({});
    setIsSubmitting(false);
    setIsValid(false);
    setIsDirty(false);
  }, [defaultValues, options.initialValues]);
  
  /**
   * Obține proprietățile pentru un câmp
   * @param name Numele câmpului
   * @returns Proprietățile câmpului
   */
  const getFieldProps = useCallback(
    (name: keyof T) => {
      return {
        name: String(name),
        value: values[name],
        onChange: (e: any) => {
          const value = e?.target?.value !== undefined ? e.target.value : e;
          handleChange(name, value);
        },
        onBlur: () => handleBlur(name),
        error: getFirstFieldError(errors, String(name)),
        hasError: hasFieldErrors(errors, String(name)),
      };
    },
    [values, handleChange, handleBlur, errors]
  );
  
  // Validăm formularul la montare
  useEffect(() => {
    validateForm();
  }, [validateForm]);
  
  // Returnăm rezultatul
  return {
    values,
    errors,
    touched,
    isSubmitting,
    isValid,
    isDirty,
    handleChange,
    handleBlur,
    handleSubmit,
    setValues: setFormValues,
    setValue,
    resetForm,
    validateForm,
    getFieldProps,
  };
}

// Exportăm hook-ul
export default useForm;
