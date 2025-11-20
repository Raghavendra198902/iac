import { z } from 'zod';

// Login schema
export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export type LoginFormData = z.infer<typeof loginSchema>;

// Blueprint schema
export const blueprintSchema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters'),
  description: z.string().optional(),
  targetCloud: z.enum(['azure', 'aws', 'gcp'], {
    errorMap: () => ({ message: 'Please select a cloud provider' }),
  }),
  environment: z.enum(['development', 'staging', 'production'], {
    errorMap: () => ({ message: 'Please select an environment' }),
  }),
  region: z.string().optional(),
});

export type BlueprintFormData = z.infer<typeof blueprintSchema>;

// NLP Designer schema
export const nlpDesignerSchema = z.object({
  userInput: z.string().min(10, 'Description must be at least 10 characters'),
  targetCloud: z.enum(['azure', 'aws', 'gcp', '']).optional(),
  environment: z.enum(['development', 'staging', 'production', '']).optional(),
  budget: z.string().optional(),
  region: z.string().optional(),
});

export type NLPDesignerFormData = z.infer<typeof nlpDesignerSchema>;
