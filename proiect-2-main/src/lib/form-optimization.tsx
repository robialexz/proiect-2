import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useDebounce } from '@/hooks';

/**
 * Opțiuni pentru validarea formularelor
 */
interface ValidationOptions {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
  pattern?: RegExp;
  validate?: (value: any) => boolean | string;
  message?: string;
}

/**
 * Rezultatul validării
 */
interface ValidationResult {
  isValid: boolean;
  message?: string;
}

/**
 * Validează o valoare
 * @param value Valoarea de validat
 * @param options Opțiuni pentru validare
 * @returns Rezultatul validării
 */
export function validateField(value: any, options: ValidationOptions): ValidationResult {
  // Verificăm dacă valoarea este required
  if (options.required && (value === undefined || value === null || value === '')) {
    return {
      isValid: false,
      message: options.message || 'Acest câmp este obligatoriu'
    };
  }
  
  // Verificăm lungimea minimă
  if (options.minLength !== undefined && typeof value === 'string' && value.length < options.minLength) {
    return {
      isValid: false,
      message: options.message || `Acest câmp trebuie să aibă cel puțin ${options.minLength} caractere`
    };
  }
  
  // Verificăm lungimea maximă
  if (options.maxLength !== undefined && typeof value === 'string' && value.length > options.maxLength) {
    return {
      isValid: false,
      message: options.message || `Acest câmp trebuie să aibă cel mult ${options.maxLength} caractere`
    };
  }
  
  // Verificăm valoarea minimă
  if (options.min !== undefined && typeof value === 'number' && value < options.min) {
    return {
      isValid: false,
      message: options.message || `Acest câmp trebuie să fie cel puțin ${options.min}`
    };
  }
  
  // Verificăm valoarea maximă
  if (options.max !== undefined && typeof value === 'number' && value > options.max) {
    return {
      isValid: false,
      message: options.message || `Acest câmp trebuie să fie cel mult ${options.max}`
    };
  }
  
  // Verificăm pattern-ul
  if (options.pattern && typeof value === 'string' && !options.pattern.test(value)) {
    return {
      isValid: false,
      message: options.message || 'Acest câmp nu respectă formatul cerut'
    };
  }
  
  // Verificăm funcția de validare personalizată
  if (options.validate) {
    const result = options.validate(value);
    
    if (result === false) {
      return {
        isValid: false,
        message: options.message || 'Acest câmp nu este valid'
      };
    }
    
    if (typeof result === 'string') {
      return {
        isValid: false,
        message: result
      };
    }
  }
  
  return { isValid: true };
}

/**
 * Hook pentru gestionarea formularelor
 * @param initialValues Valorile inițiale
 * @param validationSchema Schema de validare
 * @param onSubmit Funcția de submit
 * @returns Starea formularului și funcții pentru gestionare
 */
export function useForm<T extends Record<string, any>>(
  initialValues: T,
  validationSchema?: Record<keyof T, ValidationOptions>,
  onSubmit?: (values: T) => void | Promise<void>
) {
  // Starea pentru valorile formularului
  const [values, setValues] = useState<T>(initialValues);
  
  // Starea pentru erorile formularului
  const [errors, setErrors] = useState<Record<keyof T, string>>({} as Record<keyof T, string>);
  
  // Starea pentru câmpurile atinse
  const [touched, setTouched] = useState<Record<keyof T, boolean>>({} as Record<keyof T, boolean>);
  
  // Starea pentru validitatea formularului
  const [isValid, setIsValid] = useState<boolean>(false);
  
  // Starea pentru submisie
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  
  // Starea pentru submisie reușită
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  
  // Referință pentru valorile formularului
  const valuesRef = useRef<T>(initialValues);
  
  // Actualizăm referința când se schimbă valorile
  useEffect(() => {
    valuesRef.current = values;
  }, [values]);
  
  // Validăm formularul
  const validateForm = useCallback(() => {
    if (!validationSchema) {
      return true;
    }
    
    const newErrors: Record<keyof T, string> = {} as Record<keyof T, string>;
    let formIsValid = true;
    
    // Validăm fiecare câmp
    Object.entries(validationSchema).forEach(([field, options]) => {
      const key = field as keyof T;
      const value = values[key];
      
      const result = validateField(value, options);
      
      if (!result.isValid) {
        formIsValid = false;
        newErrors[key] = result.message || 'Acest câmp nu este valid';
      }
    });
    
    setErrors(newErrors);
    setIsValid(formIsValid);
    
    return formIsValid;
  }, [values, validationSchema]);
  
  // Validăm formularul când se schimbă valorile
  useEffect(() => {
    validateForm();
  }, [values, validateForm]);
  
  // Gestionăm schimbarea valorilor
  const handleChange = useCallback((event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = event.target;
    
    // Gestionăm diferite tipuri de input-uri
    if (type === 'checkbox') {
      const checked = (event.target as HTMLInputElement).checked;
      setValues(prev => ({ ...prev, [name]: checked }));
    } else if (type === 'number') {
      setValues(prev => ({ ...prev, [name]: value === '' ? '' : Number(value) }));
    } else {
      setValues(prev => ({ ...prev, [name]: value }));
    }
    
    // Marcăm câmpul ca atins
    setTouched(prev => ({ ...prev, [name]: true }));
  }, []);
  
  // Gestionăm schimbarea valorilor pentru câmpuri controlate
  const setValue = useCallback((name: keyof T, value: any) => {
    setValues(prev => ({ ...prev, [name]: value }));
    setTouched(prev => ({ ...prev, [name]: true }));
  }, []);
  
  // Gestionăm blur-ul
  const handleBlur = useCallback((event: React.FocusEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name } = event.target;
    setTouched(prev => ({ ...prev, [name]: true }));
  }, []);
  
  // Gestionăm submit-ul
  const handleSubmit = useCallback(async (event?: React.FormEvent) => {
    if (event) {
      event.preventDefault();
    }
    
    // Marcăm toate câmpurile ca atinse
    const allTouched = Object.keys(values).reduce((acc, key) => {
      acc[key as keyof T] = true;
      return acc;
    }, {} as Record<keyof T, boolean>);
    
    setTouched(allTouched);
    
    // Validăm formularul
    const formIsValid = validateForm();
    
    if (formIsValid && onSubmit) {
      setIsSubmitting(true);
      
      try {
        await onSubmit(valuesRef.current);
        setIsSubmitted(true);
      } catch (error) {
        // Removed console statement
      } finally {
        setIsSubmitting(false);
      }
    }
  }, [validateForm, onSubmit]);
  
  // Resetăm formularul
  const resetForm = useCallback(() => {
    setValues(initialValues);
    setErrors({} as Record<keyof T, string>);
    setTouched({} as Record<keyof T, boolean>);
    setIsSubmitted(false);
  }, [initialValues]);
  
  return {
    values,
    errors,
    touched,
    isValid,
    isSubmitting,
    isSubmitted,
    handleChange,
    handleBlur,
    handleSubmit,
    setValue,
    resetForm
  };
}

/**
 * Hook pentru gestionarea formularelor cu debounce
 * @param initialValues Valorile inițiale
 * @param validationSchema Schema de validare
 * @param onSubmit Funcția de submit
 * @param debounceTime Timpul de debounce
 * @returns Starea formularului și funcții pentru gestionare
 */
export function useDebouncedForm<T extends Record<string, any>>(
  initialValues: T,
  validationSchema?: Record<keyof T, ValidationOptions>,
  onSubmit?: (values: T) => void | Promise<void>,
  debounceTime: number = 300
) {
  // Folosim hook-ul de bază pentru formulare
  const form = useForm<T>(initialValues, validationSchema, onSubmit);
  
  // Starea pentru valorile cu debounce
  const [debouncedValues, setDebouncedValues] = useState<T>(initialValues);
  
  // Folosim debounce pentru valorile formularului
  const debouncedSetValues = useDebounce((values: T) => {
    setDebouncedValues(values);
  }, debounceTime);
  
  // Actualizăm valorile cu debounce când se schimbă valorile formularului
  useEffect(() => {
    debouncedSetValues(form.values);
  }, [form.values, debouncedSetValues]);
  
  return {
    ...form,
    debouncedValues
  };
}

/**
 * Componenta pentru gestionarea formularelor
 */
export function Form({
  children,
  onSubmit,
  className = '',
  ...props
}: React.FormHTMLAttributes<HTMLFormElement> & {
  onSubmit?: (event: React.FormEvent) => void;
}) {
  return (
    <form
      className={`space-y-4 ${className}`}
      onSubmit={onSubmit}
      {...props}
    >
      {children}
    </form>
  );
}

/**
 * Componenta pentru gestionarea câmpurilor de formular
 */
export function FormField({
  children,
  label,
  error,
  className = '',
  required = false,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & {
  label?: string;
  error?: string;
  required?: boolean;
}) {
  return (
    <div className={`space-y-2 ${className}`} {...props}>
      {label && (
        <label className="block text-sm font-medium">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      {children}
      {error && (
        <p className="text-sm text-red-500">{error}</p>
      )}
    </div>
  );
}

export default {
  validateField,
  useForm,
  useDebouncedForm,
  Form,
  FormField
};
