/**
 * Scheme de validare pentru aplicație
 * Acest fișier conține scheme de validare pentru diferite entități din aplicație
 */

import { z } from 'zod';
import { ProjectStatus } from '@/models/project.model';

// Schema pentru autentificare
export const loginSchema = z.object({
  email: z.string().email('Adresa de email este invalidă'),
  password: z.string().min(6, 'Parola trebuie să aibă cel puțin 6 caractere'),
  rememberMe: z.boolean().optional(),
});

// Schema pentru înregistrare
export const registerSchema = z.object({
  email: z.string().email('Adresa de email este invalidă'),
  password: z
    .string()
    .min(8, 'Parola trebuie să aibă cel puțin 8 caractere')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
      'Parola trebuie să conțină cel puțin o literă mare, o literă mică, un număr și un caracter special'
    ),
  confirmPassword: z.string(),
  firstName: z.string().min(2, 'Prenumele trebuie să aibă cel puțin 2 caractere'),
  lastName: z.string().min(2, 'Numele trebuie să aibă cel puțin 2 caractere'),
  company: z.string().optional(),
  agreedToTerms: z.boolean().refine((val) => val === true, {
    message: 'Trebuie să fiți de acord cu Termenii și Condițiile',
  }),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Parolele nu coincid',
  path: ['confirmPassword'],
});

// Schema pentru resetarea parolei
export const resetPasswordSchema = z.object({
  password: z
    .string()
    .min(8, 'Parola trebuie să aibă cel puțin 8 caractere')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
      'Parola trebuie să conțină cel puțin o literă mare, o literă mică, un număr și un caracter special'
    ),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Parolele nu coincid',
  path: ['confirmPassword'],
});

// Schema pentru profilul utilizatorului
export const userProfileSchema = z.object({
  displayName: z.string().min(2, 'Numele de afișare trebuie să aibă cel puțin 2 caractere'),
  firstName: z.string().min(2, 'Prenumele trebuie să aibă cel puțin 2 caractere'),
  lastName: z.string().min(2, 'Numele trebuie să aibă cel puțin 2 caractere'),
  email: z.string().email('Adresa de email este invalidă'),
  phone: z.string().optional(),
  company: z.string().optional(),
  position: z.string().optional(),
  bio: z.string().optional(),
  avatarUrl: z.string().url().optional().or(z.literal('')),
});

// Schema pentru proiect
export const projectSchema = z.object({
  name: z.string().min(3, 'Numele proiectului trebuie să aibă cel puțin 3 caractere'),
  description: z.string().optional(),
  status: z.nativeEnum(ProjectStatus, {
    errorMap: () => ({ message: 'Statusul proiectului este invalid' }),
  }),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  budget: z.number().positive('Bugetul trebuie să fie un număr pozitiv').optional(),
  managerId: z.string().uuid('ID-ul managerului este invalid').optional(),
  clientId: z.string().uuid('ID-ul clientului este invalid').optional(),
  location: z.string().optional(),
  imageUrl: z.string().url().optional().or(z.literal('')),
  tags: z.array(z.string()).optional(),
}).refine(
  (data) => {
    if (data.startDate && data.endDate) {
      return new Date(data.startDate) <= new Date(data.endDate);
    }
    return true;
  },
  {
    message: 'Data de început trebuie să fie înainte de data de sfârșit',
    path: ['endDate'],
  }
);

// Schema pentru material
export const materialSchema = z.object({
  name: z.string().min(3, 'Numele materialului trebuie să aibă cel puțin 3 caractere'),
  description: z.string().optional(),
  category: z.string().optional(),
  unit: z.string().optional(),
  price: z.number().positive('Prețul trebuie să fie un număr pozitiv').optional(),
  quantity: z.number().nonnegative('Cantitatea trebuie să fie un număr pozitiv sau zero').optional(),
  projectId: z.string().uuid('ID-ul proiectului este invalid').optional(),
  supplierId: z.string().uuid('ID-ul furnizorului este invalid').optional(),
  location: z.string().optional(),
  imageUrl: z.string().url().optional().or(z.literal('')),
  barcode: z.string().optional(),
  tags: z.array(z.string()).optional(),
  status: z.enum(['in_stock', 'low_stock', 'out_of_stock', 'ordered']).optional(),
});

// Schema pentru furnizor
export const supplierSchema = z.object({
  name: z.string().min(3, 'Numele furnizorului trebuie să aibă cel puțin 3 caractere'),
  description: z.string().optional(),
  contactName: z.string().optional(),
  email: z.string().email('Adresa de email este invalidă').optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
  website: z.string().url().optional().or(z.literal('')),
  notes: z.string().optional(),
  imageUrl: z.string().url().optional().or(z.literal('')),
  tags: z.array(z.string()).optional(),
});

// Schema pentru echipă
export const teamSchema = z.object({
  name: z.string().min(3, 'Numele echipei trebuie să aibă cel puțin 3 caractere'),
  description: z.string().optional(),
  projectId: z.string().uuid('ID-ul proiectului este invalid').optional(),
  leaderId: z.string().uuid('ID-ul liderului este invalid').optional(),
  members: z.array(z.string().uuid('ID-ul membrului este invalid')).optional(),
  imageUrl: z.string().url().optional().or(z.literal('')),
  tags: z.array(z.string()).optional(),
});

// Schema pentru sarcină
export const taskSchema = z.object({
  title: z.string().min(3, 'Titlul sarcinii trebuie să aibă cel puțin 3 caractere'),
  description: z.string().optional(),
  status: z.enum(['todo', 'in_progress', 'done', 'blocked']),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).optional(),
  projectId: z.string().uuid('ID-ul proiectului este invalid').optional(),
  assigneeId: z.string().uuid('ID-ul persoanei asignate este invalid').optional(),
  dueDate: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  tags: z.array(z.string()).optional(),
}).refine(
  (data) => {
    if (data.startDate && data.endDate) {
      return new Date(data.startDate) <= new Date(data.endDate);
    }
    return true;
  },
  {
    message: 'Data de început trebuie să fie înainte de data de sfârșit',
    path: ['endDate'],
  }
);

// Schema pentru raport
export const reportSchema = z.object({
  title: z.string().min(3, 'Titlul raportului trebuie să aibă cel puțin 3 caractere'),
  description: z.string().optional(),
  type: z.enum(['project', 'inventory', 'financial', 'custom']),
  projectId: z.string().uuid('ID-ul proiectului este invalid').optional(),
  createdById: z.string().uuid('ID-ul creatorului este invalid'),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  data: z.record(z.any()).optional(),
  format: z.enum(['pdf', 'excel', 'csv', 'json']).optional(),
  tags: z.array(z.string()).optional(),
}).refine(
  (data) => {
    if (data.startDate && data.endDate) {
      return new Date(data.startDate) <= new Date(data.endDate);
    }
    return true;
  },
  {
    message: 'Data de început trebuie să fie înainte de data de sfârșit',
    path: ['endDate'],
  }
);

// Exportăm toate schemele
export default {
  loginSchema,
  registerSchema,
  resetPasswordSchema,
  userProfileSchema,
  projectSchema,
  materialSchema,
  supplierSchema,
  teamSchema,
  taskSchema,
  reportSchema,
};
